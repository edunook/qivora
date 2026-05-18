import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { GlassCard } from '../components/ui/GlassCard'
import { PremiumButton } from '../components/ui/PremiumButton'
import { 
  ShieldCheck, Clock, ChevronLeft, ChevronRight, AlertCircle, 
  Loader2, CheckCircle2, Trophy, ArrowRight, Play, BookOpen, Award,
  XCircle
} from 'lucide-react'
import { useExamStore } from '../store/examStore'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'
import { API_BASE_URL } from '../lib/api'

export const LiveExam = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentExam, getExamById, isLoading } = useExamStore()

  // Lobby and attempt tracking states
  const [existingResults, setExistingResults] = useState<any[]>([])
  const [isLobbyLoading, setIsLobbyLoading] = useState(true)
  const [activeAttemptSubject, setActiveAttemptSubject] = useState<any | null>(null)
  
  // Navigation tracking inside the active subject attempt
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({})
  
  // Active Timer State
  const [timeLeft, setTimeLeft] = useState(0)
  const [examFinished, setExamFinished] = useState(false)

  // Anti-Cheat Secure States
  const [isFullscreenActive, setIsFullscreenActive] = useState(false)
  const [violationsCount, setViolationsCount] = useState(0)
  const [showViolationWarning, setShowViolationWarning] = useState(false)
  const [latestViolationType, setLatestViolationType] = useState('')
  const [isCheatedState, setIsCheatedState] = useState(false)
  const [createdResultId, setCreatedResultId] = useState('')

  // Fetch user attempts for this exam
  const fetchExistingResults = useCallback(async () => {
    if (!id) return
    try {
      const token = useAuthStore.getState().user?.token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      const response = await axios.get(`${API_BASE_URL}/api/results/exam/${id}`, config)
      setExistingResults(response.data)
    } catch (error) {
      console.error('Failed to fetch existing results:', error)
    } finally {
      setIsLobbyLoading(false)
    }
  }, [id])

  // Fetch exam structure and user attempts on mount
  useEffect(() => {
    if (id) {
      getExamById(id)
      fetchExistingResults()
    }
  }, [id, getExamById, fetchExistingResults])

  // Countdown timer tick for the active subject session
  useEffect(() => {
    if (timeLeft <= 0 || examFinished || !isFullscreenActive || !activeAttemptSubject) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleFinish()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, examFinished, isFullscreenActive, activeAttemptSubject])

  // Secure Mode Listeners (Anti-Cheat)
  useEffect(() => {
    if (!isFullscreenActive || examFinished || !currentExam || !activeAttemptSubject) return

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
  }, [isFullscreenActive, examFinished, currentExam, activeAttemptSubject])

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

  const selectAnswer = (qIdx: number, optionIndex: number) => {
    setAnswers({ ...answers, [qIdx]: optionIndex })
  }

  const toggleMarkForReview = (qIdx: number) => {
    setMarkedForReview({ ...markedForReview, [qIdx]: !markedForReview[qIdx] })
  }

  const startSubjectAttempt = (subj: any) => {
    setActiveAttemptSubject(subj)
    setActiveQuestionIndex(0)
    setAnswers({})
    setMarkedForReview({})
    setTimeLeft((subj.duration || 15) * 60)
    setViolationsCount(0)
    setIsCheatedState(false)
    setShowViolationWarning(false)
    setExamFinished(false)
    enterSecureMode()
  }

  const handleForceSubmit = async (violations: number) => {
    if (!currentExam || !activeAttemptSubject) return
    const durationLimit = (activeAttemptSubject.duration || 15) * 60
    const timeTaken = durationLimit - timeLeft

    try {
      const token = useAuthStore.getState().user?.token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      const response = await axios.post(`${API_BASE_URL}/api/results`, {
        examId: currentExam._id,
        subjectName: activeAttemptSubject.name,
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
    if (!currentExam || !activeAttemptSubject) return
    const durationLimit = (activeAttemptSubject.duration || 15) * 60
    const timeTaken = durationLimit - timeLeft

    try {
      const token = useAuthStore.getState().user?.token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      const response = await axios.post(`${API_BASE_URL}/api/results`, {
        examId: currentExam._id,
        subjectName: activeAttemptSubject.name,
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

  const handleReturnToLobby = () => {
    setActiveAttemptSubject(null)
    setExamFinished(false)
    setCreatedResultId('')
    setIsFullscreenActive(false)
    fetchExistingResults()
  }

  // Helper to determine the schedule window status of a subject section
  const getSubjectTimingStatus = (subj: any) => {
    if (!subj.startDate) {
      return { status: 'active', label: 'Available', isLocked: false }
    }

    const now = new Date()
    const startDateTime = new Date(`${subj.startDate}T${subj.startTime || '00:00'}`)
    const endDateTime = subj.endDate ? new Date(`${subj.endDate}T${subj.endTime || '23:59'}`) : null

    if (now < startDateTime) {
      return { 
        status: 'locked', 
        label: `Locked until ${startDateTime.toLocaleDateString()} ${startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        isLocked: true 
      }
    }

    if (endDateTime && now > endDateTime) {
      return { status: 'expired', label: 'Closed / Expired', isLocked: true }
    }

    return { status: 'active', label: 'Available', isLocked: false }
  }

  if (isLoading || isLobbyLoading || !currentExam) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    )
  }

  // Get subjects array (fallback to a single virtual subject if the exam is flat)
  const subjects = currentExam.subjects && currentExam.subjects.length > 0
    ? currentExam.subjects
    : [{
        name: currentExam.subject || 'General Section',
        description: 'Comprehensive subject evaluation questions',
        duration: currentExam.duration || 30,
        passingMarks: 5,
        totalMarks: 10,
        questions: currentExam.questions || [],
        instructions: currentExam.instructions || ''
      }]

  // LOBBY VIEW: Choose which subject modules to attempt
  if (!activeAttemptSubject && !examFinished) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-12 max-w-5xl"
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-12 backdrop-blur-2xl shadow-2xl mb-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -z-10" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-white/10 pb-8">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full">
                Exam Lobby
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-3 mb-2">
                {currentExam.title}
              </h1>
              <p className="text-gray-400 text-sm max-w-2xl">{currentExam.description}</p>
            </div>
            
            <Link to="/dashboard">
              <PremiumButton variant="outline" className="text-xs">
                Back to Dashboard
              </PremiumButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
              <span className="text-[10px] text-indigo-300 uppercase tracking-widest font-bold block mb-1">Total Subjects</span>
              <span className="text-2xl font-bold text-white">{subjects.length}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
              <span className="text-[10px] text-indigo-300 uppercase tracking-widest font-bold block mb-1">Attempt Completed</span>
              <span className="text-2xl font-bold text-green-400">
                {subjects.filter(s => existingResults.some(r => r.subjectName === s.name)).length} / {subjects.length}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
              <span className="text-[10px] text-indigo-300 uppercase tracking-widest font-bold block mb-1">Security Level</span>
              <span className="text-2xl font-bold text-indigo-400">Secure CBT</span>
            </div>
          </div>

          {/* List of Subjects / Modular Exams */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <BookOpen className="w-5 h-5 text-indigo-400" /> Subject-Wise Exam Modules
            </h3>
            
            <div className="grid gap-4">
              {subjects.length === 0 || (subjects.length === 1 && (!subjects[0].questions || subjects[0].questions.length === 0) && !currentExam.subjects?.length) ? (
                <div className="p-8 text-center bg-white/5 border border-white/5 rounded-2xl">
                  <BookOpen className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm font-semibold">No subject modules have been published for this exam yet.</p>
                  <p className="text-xs text-gray-500 mt-1">Please wait for the exam publisher to configure the subjects.</p>
                </div>
              ) : (
                subjects.map((subj: any, idx: number) => {
                  const completedResult = existingResults.find(r => r.subjectName === subj.name)
                  const timing = getSubjectTimingStatus(subj)
                
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.01 }}
                    className={`p-6 rounded-2xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${
                      completedResult 
                        ? 'bg-emerald-500/5 border-emerald-500/20' 
                        : timing.isLocked
                          ? 'bg-white/[0.01] border-white/5 opacity-60'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2 text-left">
                        <h4 className="text-lg font-bold text-white">{subj.name}</h4>
                        {completedResult ? (
                          <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        ) : timing.status === 'locked' ? (
                          <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-500/20">
                            <ShieldCheck className="w-3 h-3" /> {timing.label}
                          </span>
                        ) : timing.status === 'expired' ? (
                          <span className="text-[10px] font-extrabold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 border border-rose-500/20">
                            <XCircle className="w-3 h-3" /> {timing.label}
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3 animate-pulse" /> Available
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-3 text-left">{subj.description || 'Module section assessment'}</p>
                      
                      <div className="flex flex-wrap gap-4 text-xs text-gray-400 text-left">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {subj.duration} mins</span>
                        <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> {subj.questions?.length || 0} Questions</span>
                        {subj.startDate && (
                          <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            Schedule: {subj.startDate} {subj.startTime || '00:00'} to {subj.endDate || subj.startDate} {subj.endTime || '23:59'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-full md:w-auto shrink-0 flex items-center gap-3">
                      {completedResult ? (
                        <>
                          <div className="text-right hidden sm:block pr-2">
                            <div className="text-xs text-gray-400">Grade Score</div>
                            <div className="text-sm font-bold text-emerald-400">
                              {completedResult.percentage !== null ? `${completedResult.percentage}%` : 'Graded'}
                            </div>
                          </div>
                          <Link to={`/result/${completedResult._id}`}>
                            <PremiumButton variant="outline" className="w-full md:w-auto py-2 text-xs">
                              View Result
                            </PremiumButton>
                          </Link>
                        </>
                      ) : (
                        <PremiumButton
                          disabled={timing.isLocked}
                          onClick={() => startSubjectAttempt(subj)}
                          className={`w-full md:w-auto py-3 px-6 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                            timing.isLocked
                              ? 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed shadow-none'
                              : 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                          }`}
                        >
                          {timing.status === 'locked' ? (
                            <>Locked <ShieldCheck className="w-3.5 h-3.5" /></>
                          ) : timing.status === 'expired' ? (
                            <>Closed <XCircle className="w-3.5 h-3.5" /></>
                          ) : (
                            <>Attempt Module <Play className="w-3.5 h-3.5" /></>
                          )}
                        </PremiumButton>
                      )}
                    </div>
                  </motion.div>
                )
              }))}
            </div>
          </div>
        </div>

        {/* Security / integrity protocol footer */}
        <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] text-left space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">Academic Integrity Protocols</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Qivora CBT utilizes advanced full-screen lock and system blur proctoring. Starting any subject module will trigger a secure proctor window. Ensure your environment remains distraction-free. Exiting full-screen or switching browser tabs logs proctoring violations and will auto-submit the exam under strike limits.
          </p>
        </div>
      </motion.div>
    )
  }

  // POST-EXAM SUBJECT FINISHED SUMMARY SCREEN
  if (examFinished && activeAttemptSubject) {
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
            className="w-20 h-20 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-8 border border-indigo-500/30"
          >
            <Trophy className="w-10 h-10 text-indigo-400" />
          </motion.div>
          
          <h2 className="text-3xl font-extrabold text-white mb-2">{activeAttemptSubject.name} Submitted!</h2>
          <p className="text-gray-400 mb-8">{currentExam.title}</p>

          <GlassCard className="p-8 mb-8" hoverGlow={false}>
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-7 w-7 text-emerald-400" />
            </div>
            <p className="text-white font-bold text-base">Your responses are locked securely.</p>
            <p className="text-xs text-gray-400 mt-2">
              The grading calculation engine has successfully submitted your modular results. You can now attempt remaining modules or view details.
            </p>
          </GlassCard>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <PremiumButton variant="outline" onClick={handleReturnToLobby}>
              Return to Exam Lobby
            </PremiumButton>
            {createdResultId && (
              <PremiumButton onClick={() => navigate(`/result/${createdResultId}`)}>
                View Scorecard <ArrowRight className="h-4 w-4 ml-1" />
              </PremiumButton>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  // ACTIVE PROCTORED EXAM QUESTION ATTEMPT SCREEN
  const activeQuestion = activeAttemptSubject.questions && activeAttemptSubject.questions.length > 0
    ? activeAttemptSubject.questions[activeQuestionIndex]
    : null

  const isQuestionMarked = !!markedForReview[activeQuestionIndex]
  const progressPercent = ((activeQuestionIndex + 1) / activeAttemptSubject.questions.length) * 100

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
                Module: <span className="font-bold text-white uppercase">{activeAttemptSubject.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Active Subject Module Countdown Clock */}
              <div className={`flex items-center gap-2 font-mono px-3 py-1.5 rounded-lg border text-xs sm:text-sm ${
                timeLeft <= 60 ? 'text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse' : 'text-purple-300 bg-purple-500/10 border-purple-500/20'
              }`}>
                <Clock className="w-4 h-4 shrink-0" />
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-sans">Module Timer:</span>
                <span className="font-bold">{formatTime(timeLeft)}</span>
              </div>

              <button
                type="button"
                onClick={handleFinish}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all"
              >
                Finish Module
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1 w-full bg-white/5 relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
            />
          </div>

          {/* Main Quiz Layout */}
          <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/10 flex-1">
            
            {/* Left Question and Answers Content Pane */}
            <div className="flex-1 p-6 sm:p-10 flex flex-col justify-between min-h-[450px]">
              
              {activeQuestion ? (
                <div className="space-y-6">
                  {/* Simplified Top Stats - Dynamic & distraction free */}
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-400 font-bold text-sm sm:text-base">
                      Question {activeQuestionIndex + 1} <span className="text-gray-500 font-normal">of {activeAttemptSubject.questions.length}</span>
                    </span>
                  </div>

                  {/* Question Title */}
                  <h2 className="text-lg sm:text-xl font-bold text-white text-left leading-relaxed">
                    {activeQuestion.text}
                  </h2>

                  {/* Option Buttons */}
                  <div className="grid gap-3 pt-4">
                    {activeQuestion.options.map((opt: string, i: number) => {
                      const isSelected = answers[activeQuestionIndex] === i
                      return (
                        <motion.button
                          key={i}
                          onClick={() => selectAnswer(activeQuestionIndex, i)}
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
                    onClick={() => toggleMarkForReview(activeQuestionIndex)}
                    className={`px-4 py-2 border rounded-xl text-xs font-semibold transition-all ${
                      isQuestionMarked
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
                    }`}
                  >
                    {isQuestionMarked ? 'Marked for Review' : 'Mark for Review'}
                  </button>

                  {activeQuestionIndex < activeAttemptSubject.questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleFinish}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      Finish Module <CheckCircle2 className="h-4 w-4 ml-1" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Question Palette Sidebar */}
            <div className="w-full lg:w-72 p-6 bg-white/[0.02] flex flex-col text-left space-y-6">
              <div>
                <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Module Instructions</h4>
                <p className="text-xs text-gray-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                  {activeAttemptSubject.instructions || 'Answer all multiple choice questions listed in this section module. Use the palette below to jump directly.'}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-3">Question Palette</h4>
                <div className="grid grid-cols-5 gap-2">
                  {activeAttemptSubject.questions.map((_: any, idx: number) => {
                    const isAnswered = answers[idx] !== undefined
                    const isMarked = !!markedForReview[idx]
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

              {/* Palette Legend */}
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

      {/* Violation Strike Modal Overlay */}
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
