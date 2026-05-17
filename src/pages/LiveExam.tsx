import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { GlassCard } from '../components/ui/GlassCard'
import { PremiumButton } from '../components/ui/PremiumButton'
import { ShieldCheck, Clock, ChevronLeft, ChevronRight, AlertCircle, Loader2, CheckCircle2, Trophy, ArrowRight, Eye } from 'lucide-react'
import { useExamStore } from '../store/examStore'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'
import { API_BASE_URL } from '../lib/api'

export const LiveExam = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentExam, getExamById, isLoading } = useExamStore()

  // Navigation and hierarchical tracking states
  const [activeSubjectIndex, setActiveSubjectIndex] = useState(0)
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0) // question index within the active subject
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({})
  
  // Timers: Combined overall timer and section-specific timers
  const [timeLeft, setTimeLeft] = useState(0)
  const [subjectTimeLeft, setSubjectTimeLeft] = useState<Record<number, number>>({})
  const [examFinished, setExamFinished] = useState(false)

  // Anti-Cheat Secure States
  const [isFullscreenActive, setIsFullscreenActive] = useState(false)
  const [violationsCount, setViolationsCount] = useState(0)
  const [showViolationWarning, setShowViolationWarning] = useState(false)
  const [latestViolationType, setLatestViolationType] = useState('')
  const [isCheatedState, setIsCheatedState] = useState(false)
  const [createdResultId, setCreatedResultId] = useState('')

  // Fetch exam data
  useEffect(() => {
    if (id) {
      getExamById(id)
    }
  }, [id, getExamById])

  // Initialize timers when exam loads
  useEffect(() => {
    if (currentExam) {
      setTimeLeft(currentExam.duration * 60) // Convert total minutes to seconds

      // Initialize subject-specific timers
      if (currentExam.subjects && currentExam.subjects.length > 0) {
        const timers: Record<number, number> = {}
        currentExam.subjects.forEach((s: any, idx: number) => {
          timers[idx] = (s.duration || 15) * 60 // minutes to seconds
        })
        setSubjectTimeLeft(timers)
      }
    }
  }, [currentExam])

  // Countdown clock tick
  useEffect(() => {
    if (timeLeft <= 0 || examFinished || !isFullscreenActive) return

    const timer = setInterval(() => {
      // 1. Decrement overall exam timer
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleFinish()
          return 0
        }
        return prev - 1
      })

      // 2. Decrement currently active subject section timer
      if (currentExam?.subjects && currentExam.subjects.length > 0) {
        setSubjectTimeLeft((prevTimers) => {
          const currentSectionTime = prevTimers[activeSubjectIndex]
          const updatedTimers = { ...prevTimers }

          if (currentSectionTime <= 1) {
            updatedTimers[activeSubjectIndex] = 0
            // Auto lock active section and transition to next subject branch
            if (activeSubjectIndex < currentExam.subjects.length - 1) {
              setActiveSubjectIndex((prevIdx) => prevIdx + 1)
              setActiveQuestionIndex(0)
            } else {
              // Out of sections, trigger final submission
              clearInterval(timer)
              handleFinish()
            }
          } else {
            updatedTimers[activeSubjectIndex] = currentSectionTime - 1
          }

          return updatedTimers
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, examFinished, isFullscreenActive, activeSubjectIndex, currentExam])

  // Secure Mode Listeners (Anti-Cheat)
  useEffect(() => {
    if (!isFullscreenActive || examFinished || !currentExam) return

    const handleCopyPaste = (e: Event) => {
      e.preventDefault()
      triggerViolation('copy_paste')
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation('tab_switch')
      }
    }

    const handleBlur = () => {
      triggerViolation('window_blur')
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        triggerViolation('fullscreen_exit')
      }
    }

    // Dynamic bindings based on configuration settings
    if (currentExam.disableCopy || currentExam.disablePaste) {
      document.addEventListener('copy', handleCopyPaste)
      document.addEventListener('cut', handleCopyPaste)
      document.addEventListener('paste', handleCopyPaste)
    }
    if (currentExam.disableRightClick) {
      document.addEventListener('contextmenu', handleContextMenu)
    }
    if (currentExam.detectTabSwitching) {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }
    if (currentExam.detectMinimizeEvents) {
      window.addEventListener('blur', handleBlur)
    }
    if (currentExam.fullscreenMode) {
      document.addEventListener('fullscreenchange', handleFullscreenChange)
    }

    return () => {
      document.removeEventListener('copy', handleCopyPaste)
      document.removeEventListener('cut', handleCopyPaste)
      document.removeEventListener('paste', handleCopyPaste)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [isFullscreenActive, examFinished, currentExam])

  const triggerViolation = (type: string) => {
    if (!currentExam) return
    setLatestViolationType(type)
    setViolationsCount((prev) => {
      const next = prev + 1
      const limit = currentExam.violationLimit || 3
      if (next >= limit) {
        setIsCheatedState(true)
        handleForceSubmit(next)
      } else {
        setShowViolationWarning(true)
      }
      return next
    })
  }

  const enterSecureMode = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen()
      }
      setIsFullscreenActive(true)
    } catch (err) {
      console.error('Fullscreen request rejected:', err)
      setIsFullscreenActive(true) // Proceed anyway to avoid sandbox blockages
    }
  }

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }, [])

  // Maps nested indices into a consistent flat indices for REST payload
  const getFlatQuestionIndex = (subjIdx: number, qIdx: number) => {
    if (!currentExam || !currentExam.subjects) return qIdx
    let count = 0
    for (let i = 0; i < subjIdx; i++) {
      count += currentExam.subjects[i].questions.length
    }
    return count + qIdx
  }

  const selectAnswer = (flatQIdx: number, optionIndex: number) => {
    setAnswers({ ...answers, [flatQIdx]: optionIndex })
  }

  const toggleMarkForReview = (flatQIdx: number) => {
    setMarkedForReview({ ...markedForReview, [flatQIdx]: !markedForReview[flatQIdx] })
  }

  const handleForceSubmit = async (violations: number) => {
    if (!currentExam) return
    const timeTaken = currentExam.duration * 60 - timeLeft

    try {
      const token = useAuthStore.getState().user?.token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      const response = await axios.post(`${API_BASE_URL}/api/results`, {
        examId: currentExam._id,
        answers,
        timeTaken,
        cheated: true,
        violationsCount: violations,
      }, config)
      setCreatedResultId(response.data._id)
    } catch (error) {
      console.error('Failed to submit forced results:', error)
    }

    setExamFinished(true)
  }

  const handleFinish = async () => {
    if (!currentExam) return
    const timeTaken = currentExam.duration * 60 - timeLeft

    try {
      const token = useAuthStore.getState().user?.token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      const response = await axios.post(`${API_BASE_URL}/api/results`, {
        examId: currentExam._id,
        answers,
        timeTaken,
        cheated: isCheatedState,
        violationsCount,
      }, config)
      setCreatedResultId(response.data._id)
    } catch (error) {
      console.error('Failed to submit results:', error)
    }

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }

    setExamFinished(true)
  }

  if (isLoading || !currentExam) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    )
  }

  // Pre-Exam Gatekeeper Launch Screen
  if (!isFullscreenActive && !examFinished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[85vh]"
      >
        <GlassCard className="max-w-2xl w-full p-6 sm:p-10 border-indigo-500/20 relative overflow-hidden" hoverGlow={true}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10" />

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Secure CBT Gatekeeper</h1>
            <p className="text-gray-400 text-sm">Locking exam dashboard for: <span className="text-indigo-400 font-semibold">{currentExam.title}</span></p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
              <div className="text-xs text-indigo-300 uppercase tracking-widest font-bold">Total Duration</div>
              <div className="text-xl font-bold text-white mt-1">{currentExam.duration} Mins</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
              <div className="text-xs text-indigo-300 uppercase tracking-widest font-bold">Subjects / Branches</div>
              <div className="text-xl font-bold text-white mt-1">
                {currentExam.subjects && currentExam.subjects.length > 0 ? currentExam.subjects.length : 1}
              </div>
            </div>
          </div>

          {currentExam.subjects && currentExam.subjects.length > 0 && (
            <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/5 text-left">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Subject Timer Breakdowns</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                {currentExam.subjects.map((s: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center bg-white/5 px-3 py-1.5 rounded-lg">
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-indigo-400 font-bold">{s.duration} mins</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4 mb-8 text-left">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">Academic Integrity Protocols</h3>
            
            <div className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5 text-xs text-indigo-400 font-bold">1</div>
              <div>
                <p className="text-sm font-medium text-white/90">Mandatory Fullscreen Lock</p>
                <p className="text-xs text-gray-400">Exiting fullscreen mode counts as an immediate exam proctoring violation.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5 text-xs text-indigo-400 font-bold">2</div>
              <div>
                <p className="text-sm font-medium text-white/90">Zero Tab Switching Allowed</p>
                <p className="text-xs text-gray-400">Any window blurs, focus losses, or browser tab switches will be logged automatically.</p>
              </div>
            </div>

            {currentExam.negativeMarking && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-3 items-center">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <p className="text-xs text-rose-300">
                  <span className="font-bold">Negative Marking Active:</span> Wrong answers deduct <span className="font-extrabold">-{currentExam.negativeMarkValue || 0.25} marks</span>.
                </p>
              </div>
            )}
          </div>

          <PremiumButton onClick={enterSecureMode} className="w-full py-4 bg-indigo-600 text-white font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(99,102,241,0.3)] hover:bg-indigo-500 flex justify-center items-center gap-2">
            Launch Locked Session <ArrowRight className="w-4 h-4" />
          </PremiumButton>
        </GlassCard>
      </motion.div>
    )
  }

  // Determine current active question
  const activeSubject = currentExam.subjects && currentExam.subjects.length > 0 
    ? currentExam.subjects[activeSubjectIndex]
    : { name: currentExam.subject || 'General', questions: currentExam.questions, instructions: '' }

  const activeQuestion = activeSubject?.questions && activeSubject.questions.length > 0
    ? activeSubject.questions[activeQuestionIndex]
    : null

  const flatIndex = getFlatQuestionIndex(activeSubjectIndex, activeQuestionIndex)
  const isQuestionAnswered = answers[flatIndex] !== undefined
  const isQuestionMarked = !!markedForReview[flatIndex]

  // Calculated stats for progress bar
  const totalExamQuestionsCount = currentExam.subjects && currentExam.subjects.length > 0
    ? currentExam.subjects.reduce((acc: number, curr: any) => acc + curr.questions.length, 0)
    : currentExam.questions.length

  const currentOverallQuestionIndex = getFlatQuestionIndex(activeSubjectIndex, activeQuestionIndex)
  const progressPercent = ((currentOverallQuestionIndex + 1) / totalExamQuestionsCount) * 100

  // Post-Exam Finished Score Summary Gate
  if (examFinished) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]"
      >
        <div className="text-center max-w-lg w-full">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="w-22 h-22 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-8 border border-indigo-500/30"
          >
            <Trophy className="w-12 h-12 text-indigo-400" />
          </motion.div>
          
          <h2 className="text-4xl font-extrabold text-white mb-2">Exam Successfully Submitted!</h2>
          <p className="text-gray-400 mb-8">{currentExam.title}</p>

          <GlassCard className="p-8 mb-8" hoverGlow={false}>
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <p className="text-white font-bold text-lg">Your responses are locked securely.</p>
            <p className="text-xs text-gray-400 mt-2">
              The grading calculation engine has updated your results records on the secure server.
            </p>
          </GlassCard>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <PremiumButton variant="outline" onClick={() => navigate('/explore')}>
              Back to Explore
            </PremiumButton>
            <PremiumButton onClick={() => navigate(createdResultId ? `/result/${createdResultId}` : '/dashboard')}>
              View Detailed Scorecard <ArrowRight className="h-4 w-4 ml-1" />
            </PremiumButton>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-6 flex flex-col min-h-[85vh] justify-center"
    >
      <div className="max-w-6xl mx-auto w-full">
        <GlassCard className="p-0 border-white/20 overflow-hidden shadow-2xl flex flex-col" hoverGlow={false}>
          {/* Header Indicators Bar */}
          <div className="bg-white/5 border-b border-white/10 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 animate-pulse" />
                <span>SECURE PROCTOR GATE</span>
              </div>
              <div className="h-6 w-[1px] bg-white/10" />
              <div className="text-xs sm:text-sm text-gray-300">
                Active Subject: <span className="font-bold text-white uppercase">{activeSubject.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Active Subject Section Timer */}
              {currentExam.subjects && currentExam.subjects.length > 0 && (
                <div className="flex items-center gap-2 font-mono px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs sm:text-sm">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-sans">Section Clock:</span>
                  <span className="font-bold">{formatTime(subjectTimeLeft[activeSubjectIndex] || 0)}</span>
                </div>
              )}

              {/* Combined Overall Timer */}
              <div className={`flex items-center gap-2 font-mono px-3 py-1.5 rounded-lg border text-xs sm:text-sm ${
                timeLeft <= 60 ? 'text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse' : 'text-purple-300 bg-purple-500/10 border-purple-500/20'
              }`}>
                <Clock className="w-4 h-4 shrink-0" />
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-sans">Total Clock:</span>
                <span className="font-bold">{formatTime(timeLeft)}</span>
              </div>

              <button
                type="button"
                onClick={handleFinish}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all"
              >
                Finish Exam
              </button>
            </div>
          </div>

          {/* Subject Navigation Tabs Bar */}
          {currentExam.subjects && currentExam.subjects.length > 1 && (
            <div className="bg-white/[0.02] border-b border-white/5 px-6 py-3.5 flex items-center gap-3 overflow-x-auto">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold shrink-0">Assessments:</span>
              {currentExam.subjects.map((subj: any, sIdx: number) => {
                const isCurrent = activeSubjectIndex === sIdx
                const isCompleted = activeSubjectIndex > sIdx
                return (
                  <button
                    key={sIdx}
                    disabled={isCompleted}
                    onClick={() => {
                      setActiveSubjectIndex(sIdx)
                      setActiveQuestionIndex(0)
                    }}
                    className={`text-xs px-4 py-2 rounded-xl border transition-all shrink-0 flex items-center gap-2 ${
                      isCurrent
                        ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                        : isCompleted
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 line-through cursor-not-allowed opacity-50'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>{subj.name}</span>
                    <span className="text-[10px] bg-white/15 px-1.5 py-0.5 rounded text-gray-300 font-mono">
                      {sIdx === activeSubjectIndex ? formatTime(subjectTimeLeft[sIdx] || 0) : `${subj.duration}m`}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Combined Progress Bar */}
          <div className="h-1 w-full bg-white/5 relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
            />
          </div>

          {/* Main Quiz Layout: Panel + Left Pane */}
          <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/10 flex-1">
            
            {/* Left Question and Answers Content Pane */}
            <div className="flex-1 p-6 sm:p-10 flex flex-col justify-between min-h-[450px]">
              
              {activeQuestion ? (
                <div className="space-y-6">
                  {/* Top Stats */}
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-400 font-bold text-sm sm:text-base">
                      Question {activeQuestionIndex + 1} <span className="text-gray-500 font-normal">of {activeSubject.questions.length}</span>
                    </span>
                    <span className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-gray-400 font-semibold uppercase">
                      Marks: {activeQuestion.marks} | Neg: {activeQuestion.negativeMarks}
                    </span>
                  </div>

                  {/* Question Title */}
                  <h2 className="text-lg sm:text-xl font-bold text-white text-left leading-relaxed">
                    {activeQuestion.text}
                  </h2>

                  {/* Option Buttons */}
                  <div className="grid gap-3 pt-4">
                    {activeQuestion.options.map((opt: string, i: number) => {
                      const isSelected = answers[flatIndex] === i
                      return (
                        <motion.button
                          key={i}
                          onClick={() => selectAnswer(flatIndex, i)}
                          whileHover={{ x: 6 }}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group ${
                            isSelected 
                              ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)] text-white' 
                              : 'bg-white/5 border-white/10 hover:border-white/20 text-gray-300 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-colors shrink-0 ${
                              isSelected ? 'bg-indigo-500 text-white' : 'bg-white/10 text-gray-400 group-hover:bg-white/20'
                            }`}>
                              {String.fromCharCode(65 + i)}
                            </div>
                            <span className="text-xs sm:text-sm font-medium">{opt}</span>
                          </div>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-sm">No questions available in this section.</div>
              )}

              {/* Bottom Nav Bar Controls */}
              <div className="flex flex-wrap gap-4 items-center justify-between border-t border-white/5 pt-6 mt-8">
                <button
                  type="button"
                  disabled={activeQuestionIndex === 0}
                  onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => toggleMarkForReview(flatIndex)}
                    className={`px-4 py-2 border rounded-xl text-xs font-semibold transition-all ${
                      isQuestionMarked
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
                    }`}
                  >
                    {isQuestionMarked ? 'Marked for Review' : 'Mark for Review'}
                  </button>

                  {activeQuestionIndex < activeSubject.questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : activeSubjectIndex < (currentExam.subjects?.length || 0) - 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSubjectIndex(activeSubjectIndex + 1)
                        setActiveQuestionIndex(0)
                      }}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      Next Subject <Layers className="h-4 w-4 ml-1" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleFinish}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      Finish Assessment <CheckCircle2 className="h-4 w-4 ml-1" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Question Palette and Section Details Sidebar */}
            <div className="w-full lg:w-72 p-6 bg-white/[0.02] flex flex-col text-left space-y-6">
              <div>
                <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Section Instructions</h4>
                <p className="text-xs text-gray-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                  {activeSubject.instructions || 'Answer all questions listed in this branch. You can jump directly to questions using the palette below.'}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-3">Question Palette ({activeSubject.name})</h4>
                <div className="grid grid-cols-5 gap-2">
                  {activeSubject.questions.map((_: any, idx: number) => {
                    const qFlatIdx = getFlatQuestionIndex(activeSubjectIndex, idx)
                    const isAnswered = answers[qFlatIdx] !== undefined
                    const isMarked = !!markedForReview[qFlatIdx]
                    const isCur = idx === activeQuestionIndex

                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveQuestionIndex(idx)}
                        className={`h-9 w-9 rounded-lg border text-xs font-bold flex items-center justify-center transition-all ${
                          isCur 
                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_8px_rgba(99,102,241,0.3)]' 
                            : isMarked 
                              ? 'bg-purple-500/30 border-purple-500 text-purple-200' 
                              : isAnswered 
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Status Indicators Legend */}
              <div className="border-t border-white/5 pt-4 space-y-2 text-[10px] text-gray-400">
                <h5 className="uppercase font-bold tracking-wider mb-2">Palette Legend</h5>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded bg-indigo-500" /> Active Question
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded bg-emerald-500/40 border border-emerald-500/50" /> Answered Question
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded bg-purple-500/40 border border-purple-500/50" /> Marked for Review
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded bg-white/10 border border-white/15" /> Unanswered Question
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Live Proctor Footer Details */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-white/40 text-xs">
          {currentExam.webcamMonitoring && (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded bg-green-500 animate-pulse" /> Webcam Proctoring Active
            </div>
          )}
          {currentExam.fullscreenMode && (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded bg-blue-500" /> Fullscreen Environment Locked
            </div>
          )}
          {currentExam.detectTabSwitching && (
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-orange-500 shrink-0" /> Tab-switching Blocked
            </div>
          )}
        </div>
      </div>

      {/* Violation Overlay Warning Strike Modal */}
      <AnimatePresence>
        {showViolationWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              className="max-w-md w-full border border-rose-500/30 bg-stone-950 rounded-3xl p-8 text-center relative overflow-hidden shadow-[0_0_40px_rgba(244,63,94,0.15)]"
            >
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-5 relative">
                <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
                <AlertCircle className="w-8 h-8 text-rose-500" />
              </div>

              <h2 className="text-xl font-black text-rose-500 mb-1 uppercase tracking-wider">Security Breach Flagged</h2>
              <p className="text-xs text-gray-500 mb-4 uppercase font-bold tracking-widest">
                Strike {violationsCount} of {currentExam?.violationLimit || 3}
              </p>
              
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                Proctor detected a system breach (<strong>{latestViolationType === 'fullscreen_exit' ? 'Exited Fullscreen Lock' : latestViolationType === 'tab_switch' ? 'Focus Tab Switch' : 'Window Blur Event'}</strong>). Unauthorized events are logged automatically. Exceeding the strike threshold results in an instant exam auto-submission.
              </p>

              <button
                type="button"
                onClick={() => {
                  setShowViolationWarning(false)
                  enterSecureMode()
                }}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)]"
              >
                Re-Lock Secure Environment
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
