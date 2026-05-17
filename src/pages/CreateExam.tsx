import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { SectionHeading } from '../components/ui/SectionHeading'
import { GlassCard } from '../components/ui/GlassCard'
import { PremiumButton } from '../components/ui/PremiumButton'
import { 
  Plus, Settings, Clock, CheckCircle2, Trash2, Loader2, 
  AlertCircle, ShieldCheck, Calendar, BookOpen, Layers, 
  ChevronRight, ChevronLeft, Eye, Award, Sparkles, Check, Info
} from 'lucide-react'
import { useExamStore } from '../store/examStore'
import { useAuthStore } from '../store/authStore'

export const CreateExam = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { createExam, isLoading, isError, isSuccess, message, reset } = useExamStore()

  // Step Tracker
  const [currentStep, setCurrentStep] = useState(1)

  // STEP 1 State: Basic Information
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [instructions, setInstructions] = useState('')
  const [banner, setBanner] = useState('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1470')
  const [category, setCategory] = useState('Technology')
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600')
  const [subject, setSubject] = useState('Computer Science')
  const [isPublic, setIsPublic] = useState(true)

  // STEP 2 State: Schedule Configuration
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [resultsReleaseDate, setResultsReleaseDate] = useState('')
  const [resultsReleaseTime, setResultsReleaseTime] = useState('')
  const [resultsReleaseType, setResultsReleaseType] = useState<'immediate' | 'scheduled' | 'manual'>('immediate')

  // STEP 3 State: Subject & Question hierarchy Management
  const [subjectsList, setSubjectsList] = useState<any[]>([
    {
      id: Date.now(),
      name: 'Core Concepts',
      description: 'Foundational topic questions',
      duration: 15,
      totalMarks: 10,
      passingMarks: 5,
      instructions: 'Answer all multiple choice questions.',
      questions: [
        {
          id: Date.now() + 1,
          text: 'What does CPU stand for?',
          options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Processor Utility', 'Core Processing Unit'],
          correctOption: 0,
          explanation: 'CPU is the primary component of a computer that performs most processing.',
          difficulty: 'Beginner',
          marks: 5,
          negativeMarks: 1,
          questionImage: '',
          randomization: false
        }
      ],
      quizzes: []
    }
  ])

  // STEP 4 State: Security Protocols
  const [fullscreenMode, setFullscreenMode] = useState(true)
  const [detectTabSwitching, setDetectTabSwitching] = useState(true)
  const [detectMinimizeEvents, setDetectMinimizeEvents] = useState(true)
  const [disableCopy, setDisableCopy] = useState(true)
  const [disablePaste, setDisablePaste] = useState(true)
  const [disableRightClick, setDisableRightClick] = useState(true)
  const [autoSubmitOnViolations, setAutoSubmitOnViolations] = useState(true)
  const [violationLimit, setViolationLimit] = useState(3)
  const [webcamMonitoring, setWebcamMonitoring] = useState(false)
  const [suspiciousActivityLogging, setSuspiciousActivityLogging] = useState(true)

  // STEP 5 State: Result Config & Themes
  const [resultType, setResultType] = useState<'percentage' | 'grade' | 'gpa' | 'pass_fail' | 'ranking'>('percentage')
  const [resultTheme, setResultTheme] = useState<'Modern' | 'Futuristic' | 'Cyberpunk' | 'Classic'>('Modern')
  const [resultColors, setResultColors] = useState<string[]>(['#6366f1', '#a855f7'])
  const [resultLayoutStyle, setResultLayoutStyle] = useState<'Grid' | 'List' | 'SingleCard'>('Grid')
  const [showRank, setShowRank] = useState(true)
  const [showPercentage, setShowPercentage] = useState(true)
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(true)
  const [showWrongAnswers, setShowWrongAnswers] = useState(true)
  const [showExplanations, setShowExplanations] = useState(true)
  const [downloadableResult, setDownloadableResult] = useState(true)
  const [printableResult, setPrintableResult] = useState(true)
  const [leaderboardVisibility, setLeaderboardVisibility] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        reset()
        navigate('/explore')
      }, 2000)
    }
  }, [isSuccess, reset, navigate])

  // Subject Management Helpers
  const addSubject = () => {
    const newSubj = {
      id: Date.now(),
      name: `Subject ${subjectsList.length + 1}`,
      description: 'Add description here',
      duration: 15,
      totalMarks: 10,
      passingMarks: 5,
      instructions: 'Instructions here...',
      questions: [
        {
          id: Date.now() + 1,
          text: '',
          options: ['', '', '', ''],
          correctOption: 0,
          explanation: '',
          difficulty: 'Intermediate',
          marks: 5,
          negativeMarks: 1,
          questionImage: '',
          randomization: false
        }
      ],
      quizzes: []
    }
    setSubjectsList([...subjectsList, newSubj])
  }

  const updateSubjectField = (subId: number, field: string, val: any) => {
    setSubjectsList(subjectsList.map(s => s.id === subId ? { ...s, [field]: val } : s))
  }

  const removeSubject = (subId: number) => {
    if (subjectsList.length > 1) {
      setSubjectsList(subjectsList.filter(s => s.id !== subId))
    }
  }

  // Question Management Helpers inside Subjects
  const addQuestion = (subId: number) => {
    setSubjectsList(subjectsList.map(s => {
      if (s.id === subId) {
        return {
          ...s,
          questions: [
            ...s.questions,
            {
              id: Date.now() + Math.random(),
              text: '',
              options: ['', '', '', ''],
              correctOption: 0,
              explanation: '',
              difficulty: 'Intermediate',
              marks: 1,
              negativeMarks: 0,
              questionImage: '',
              randomization: false
            }
          ]
        }
      }
      return s
    }))
  }

  const removeQuestion = (subId: number, qId: number) => {
    setSubjectsList(subjectsList.map(s => {
      if (s.id === subId && s.questions.length > 1) {
        return { ...s, questions: s.questions.filter((q: any) => q.id !== qId) }
      }
      return s
    }))
  }

  const updateQuestionField = (subId: number, qId: number, field: string, val: any) => {
    setSubjectsList(subjectsList.map(s => {
      if (s.id === subId) {
        const updatedQs = s.questions.map((q: any) => q.id === qId ? { ...q, [field]: val } : q)
        return { ...s, questions: updatedQs }
      }
      return s
    }))
  }

  const updateQuestionOption = (subId: number, qId: number, optIndex: number, val: string) => {
    setSubjectsList(subjectsList.map(s => {
      if (s.id === subId) {
        const updatedQs = s.questions.map((q: any) => {
          if (q.id === qId) {
            const newOpts = [...q.options]
            newOpts[optIndex] = val
            return { ...q, options: newOpts }
          }
          return q
        })
        return { ...s, questions: updatedQs }
      }
      return s
    }))
  }

  const handleNext = () => {
    if (currentStep === 1 && (!title || !description)) {
      alert('Please fill out Title and Description.')
      return
    }
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleCreateExam = () => {
    // Process overall computed duration
    const computedDuration = subjectsList.reduce((acc, curr) => acc + (Number(curr.duration) || 0), 0)

    // Build the payload hierarchy
    const formattedSubjects = subjectsList.map(sub => ({
      name: sub.name,
      description: sub.description,
      duration: Number(sub.duration) || 15,
      totalMarks: Number(sub.totalMarks) || 10,
      passingMarks: Number(sub.passingMarks) || 5,
      instructions: sub.instructions,
      questions: sub.questions.map((q: any) => ({
        text: q.text || 'Untitled Question',
        options: q.options.map((o: string) => o || 'Option'),
        correctOption: Number(q.correctOption),
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'Intermediate',
        marks: Number(q.marks) || 1,
        negativeMarks: Number(q.negativeMarks) || 0,
        questionImage: q.questionImage || '',
        randomization: !!q.randomization
      })),
      quizzes: sub.quizzes || []
    }))

    // Use flat questions parameter to retain legacy compatibility
    const flatQuestionsList: any[] = []
    formattedSubjects.forEach(s => {
      s.questions.forEach(q => {
        flatQuestionsList.push(q)
      })
    })

    const payload = {
      title,
      description,
      instructions,
      banner,
      category,
      thumbnail,
      subject,
      isPublic,
      // Scheduling details
      startDate: startDate || undefined,
      startTime: startTime || undefined,
      endDate: endDate || undefined,
      endTime: endTime || undefined,
      resultsReleaseDate: resultsReleaseDate || undefined,
      resultsReleaseTime: resultsReleaseTime || undefined,
      resultsReleaseType,
      resultsReleased: resultsReleaseType === 'immediate',
      // Security
      fullscreenMode,
      detectTabSwitching,
      detectMinimizeEvents,
      disableCopy,
      disablePaste,
      disableRightClick,
      autoSubmitOnViolations,
      violationLimit: Number(violationLimit) || 3,
      webcamMonitoring,
      suspiciousActivityLogging,
      // Design & Themes
      resultType,
      resultTheme,
      resultColors,
      resultLayoutStyle,
      showRank,
      showPercentage,
      showCorrectAnswers,
      showWrongAnswers,
      showExplanations,
      downloadableResult,
      printableResult,
      leaderboardVisibility,
      // Subjects
      subjects: formattedSubjects,
      questions: flatQuestionsList, // Legacy compatibility mapping
      duration: computedDuration,
      difficulty: 'Intermediate'
    }

    createExam(payload)
  }

  const steps = [
    { num: 1, label: 'General Info', icon: BookOpen },
    { num: 2, label: 'Schedule Settings', icon: Calendar },
    { num: 3, label: 'Subject Architect', icon: Layers },
    { num: 4, label: 'Security & Proctoring', icon: ShieldCheck },
    { num: 5, label: 'Scorecard Designer', icon: Award }
  ]

  return (
    <div className="min-h-screen py-8 px-4 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Wizard Steps Navigation Panel */}
      <div className="lg:w-1/4">
        <GlassCard className="p-6 sticky top-24 border-indigo-500/20 backdrop-blur-xl">
          <div className="mb-6">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="h-3 w-3 animate-pulse" /> Qivora Creator Studio
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-1">CBT Builder</h2>
          </div>

          <div className="space-y-4">
            {steps.map((s) => {
              const Icon = s.icon
              const isActive = s.num === currentStep
              const isCompleted = s.num < currentStep
              return (
                <div
                  key={s.num}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-indigo-600/20 border border-indigo-500/30 text-white shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' 
                      : isActive 
                        ? 'bg-indigo-500 text-white' 
                        : 'bg-white/5 border border-white/10'
                  }`}>
                    {isCompleted ? <Check className="h-4 w-4" /> : s.num}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Step 0{s.num}</span>
                    <span className="text-sm font-semibold">{s.label}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Security Assurance Badge */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-gray-400 text-left">
              <p className="font-semibold text-white">Academic Integrity Built-In</p>
              <p className="mt-0.5">Configured settings dynamically lock down proctored candidate environments in real-time.</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Main Form Content Window */}
      <div className="flex-1">
        <GlassCard className="p-8 border-indigo-500/10 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          {isSuccess && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>Exam published successfully! Routing to explore panel...</span>
            </div>
          )}

          {isError && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>Error publishing exam: {message}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* STEP 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <BookOpen className="text-indigo-400 h-5 w-5" /> Basic Exam Information
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">Provide core identification details and descriptive instructions for candidates.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Exam Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Professional Coding Assessment"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Primary Subject Group</label>
                      <input
                        type="text"
                        placeholder="e.g. Science, Mathematics"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Description Summary</label>
                    <textarea
                      rows={3}
                      placeholder="Briefly state the goal of this comprehensive assessment..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all resize-none"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Exam Instructions</label>
                    <textarea
                      rows={4}
                      placeholder="e.g. Maintain absolute silence. Full screen locked proctoring is enabled..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all resize-none"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Category</label>
                      <select
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="Technology">Technology</option>
                        <option value="Sciences">Sciences</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Humanities">Humanities</option>
                        <option value="General">General</option>
                      </select>
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Banner URL</label>
                      <input
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-300 text-xs focus:outline-none focus:border-indigo-500 transition-all"
                        value={banner}
                        onChange={(e) => setBanner(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Visibility Setting</label>
                      <div className="flex items-center gap-3 h-[46px] px-2">
                        <input
                          type="checkbox"
                          id="isPublic"
                          checked={isPublic}
                          onChange={(e) => setIsPublic(e.target.checked)}
                          className="h-5 w-5 text-indigo-600 rounded bg-white/5 border-white/10 focus:ring-indigo-500 focus:ring-offset-0"
                        />
                        <label htmlFor="isPublic" className="text-sm font-semibold text-gray-300 cursor-pointer">
                          Public Assessment
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Scheduling Settings */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Calendar className="text-indigo-400 h-5 w-5" /> Schedule Configuration
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">Configure active windows for exams and schedule independent results release timing.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-white/5 pb-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider text-left border-l-2 border-indigo-500 pl-2">Exam Window Start</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 text-left">
                          <label className="text-xs text-gray-400">Start Date</label>
                          <input
                            type="date"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 text-left">
                          <label className="text-xs text-gray-400">Start Time</label>
                          <input
                            type="time"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider text-left border-l-2 border-indigo-500 pl-2">Exam Window End</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 text-left">
                          <label className="text-xs text-gray-400">End Date</label>
                          <input
                            type="date"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 text-left">
                          <label className="text-xs text-gray-400">End Time</label>
                          <input
                            type="time"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider text-left border-l-2 border-purple-500 pl-2">Score Release Protocol</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { val: 'immediate', label: 'Instant', desc: 'Released immediately upon final submit' },
                        { val: 'scheduled', label: 'Scheduled', desc: 'Released at a specific date and time' },
                        { val: 'manual', label: 'Hold / Manual', desc: 'Held until teacher manually publishes' }
                      ].map((t) => (
                        <div
                          key={t.val}
                          onClick={() => setResultsReleaseType(t.val as any)}
                          className={`p-4 rounded-xl border cursor-pointer text-left transition-all ${
                            resultsReleaseType === t.val 
                              ? 'bg-purple-500/10 border-purple-500 text-white' 
                              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                          }`}
                        >
                          <p className="font-bold text-sm">{t.label}</p>
                          <p className="text-xs mt-1">{t.desc}</p>
                        </div>
                      ))}
                    </div>

                    {resultsReleaseType === 'scheduled' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="space-y-2 text-left">
                          <label className="text-xs text-gray-300">Results Release Date</label>
                          <input
                            type="date"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
                            value={resultsReleaseDate}
                            onChange={(e) => setResultsReleaseDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 text-left">
                          <label className="text-xs text-gray-300">Results Release Time</label>
                          <input
                            type="time"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
                            value={resultsReleaseTime}
                            onChange={(e) => setResultsReleaseTime(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: Subject & Question Hierarchy */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-4 flex justify-between items-center">
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Layers className="text-indigo-400 h-5 w-5" /> Subject & Question Architect
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">Organize your exam by multiple subject sections, with specific timers and questions.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addSubject}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" /> Add Subject Section
                    </button>
                  </div>

                  <div className="space-y-6">
                    {subjectsList.map((subj, sIdx) => (
                      <GlassCard key={subj.id} className="p-6 border-white/15 bg-white/5">
                        {/* Subject Metadata Settings */}
                        <div className="flex justify-between items-start gap-4 mb-4 border-b border-white/10 pb-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                            <div className="space-y-1 text-left">
                              <label className="text-[10px] uppercase font-bold text-indigo-300">Subject Name</label>
                              <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
                                value={subj.name}
                                onChange={(e) => updateSubjectField(subj.id, 'name', e.target.value)}
                              />
                            </div>
                            <div className="space-y-1 text-left">
                              <label className="text-[10px] uppercase font-bold text-indigo-300">Section Timer (Mins)</label>
                              <input
                                type="number"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
                                value={subj.duration}
                                onChange={(e) => updateSubjectField(subj.id, 'duration', Number(e.target.value))}
                              />
                            </div>
                            <div className="space-y-1 text-left">
                              <label className="text-[10px] uppercase font-bold text-indigo-300">Total Marks</label>
                              <input
                                type="number"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
                                value={subj.totalMarks}
                                onChange={(e) => updateSubjectField(subj.id, 'totalMarks', Number(e.target.value))}
                              />
                            </div>
                            <div className="space-y-1 text-left">
                              <label className="text-[10px] uppercase font-bold text-indigo-300">Passing Marks</label>
                              <input
                                type="number"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
                                value={subj.passingMarks}
                                onChange={(e) => updateSubjectField(subj.id, 'passingMarks', Number(e.target.value))}
                              />
                            </div>
                          </div>
                          
                          {subjectsList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSubject(subj.id)}
                              className="p-2 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-white/10 mt-5 transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {/* Subject Instructions */}
                        <div className="space-y-1 text-left mb-6">
                          <label className="text-[10px] uppercase font-bold text-indigo-300">Subject-Specific instructions</label>
                          <input
                            type="text"
                            placeholder="e.g. This section covers Algebra and has no negative marking..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none"
                            value={subj.instructions}
                            onChange={(e) => updateSubjectField(subj.id, 'instructions', e.target.value)}
                          />
                        </div>

                        {/* Question Builder inside Subject */}
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Question List ({subj.questions.length})</h4>
                            <button
                              type="button"
                              onClick={() => addQuestion(subj.id)}
                              className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] border border-white/10 font-bold transition-all flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" /> Add Question
                            </button>
                          </div>

                          {subj.questions.map((q: any, qIdx: number) => (
                            <div key={q.id} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 space-y-2 text-left">
                                  <label className="text-[10px] font-bold text-gray-400">Question {qIdx + 1}</label>
                                  <input
                                    type="text"
                                    placeholder="Enter your question text here..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    value={q.text}
                                    onChange={(e) => updateQuestionField(subj.id, q.id, 'text', e.target.value)}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeQuestion(subj.id, q.id)}
                                  className="p-1.5 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-white/10 mt-6 transition-all"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>

                              {/* MCQ Option Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {q.options.map((opt: string, oIdx: number) => (
                                  <div key={oIdx} className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`correct_${subj.id}_${q.id}`}
                                      checked={q.correctOption === oIdx}
                                      onChange={() => updateQuestionField(subj.id, q.id, 'correctOption', oIdx)}
                                      className="h-4 w-4 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                    />
                                    <input
                                      type="text"
                                      placeholder={`Option ${oIdx + 1}`}
                                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                      value={opt}
                                      onChange={(e) => updateQuestionOption(subj.id, q.id, oIdx, e.target.value)}
                                    />
                                  </div>
                                ))}
                              </div>

                              {/* Question Parameters */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left border-t border-white/5 pt-3">
                                <div className="space-y-1">
                                  <label className="text-[9px] uppercase font-bold text-gray-500">Marks</label>
                                  <input
                                    type="number"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-white focus:outline-none"
                                    value={q.marks}
                                    onChange={(e) => updateQuestionField(subj.id, q.id, 'marks', Number(e.target.value))}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] uppercase font-bold text-gray-500">Negative Marks</label>
                                  <input
                                    type="number"
                                    step="0.25"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-white focus:outline-none"
                                    value={q.negativeMarks}
                                    onChange={(e) => updateQuestionField(subj.id, q.id, 'negativeMarks', Number(e.target.value))}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] uppercase font-bold text-gray-500">Difficulty</label>
                                  <select
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-white focus:outline-none"
                                    value={q.difficulty}
                                    onChange={(e) => updateQuestionField(subj.id, q.id, 'difficulty', e.target.value)}
                                  >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] uppercase font-bold text-gray-500">Explanation</label>
                                  <input
                                    type="text"
                                    placeholder="Explanation details..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-white focus:outline-none"
                                    value={q.explanation}
                                    onChange={(e) => updateQuestionField(subj.id, q.id, 'explanation', e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: Security Configuration */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="text-indigo-400 h-5 w-5" /> Security & Proctoring Configuration
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">Enable secure browser environment constraints and anti-cheating tracking.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { state: fullscreenMode, set: setFullscreenMode, label: 'Enforce Fullscreen Mode', desc: 'Candidates must enter fullscreen to launch the exam session.' },
                      { state: detectTabSwitching, set: setTabSwitching => setDetectTabSwitching(setTabSwitching), label: 'Detect Tab Switching', desc: 'Warn candidates if they attempt to switch browser tabs.' },
                      { state: detectMinimizeEvents, set: setMinimizeEvents => setDetectMinimizeEvents(setMinimizeEvents), label: 'Detect Window Minimize', desc: 'Log strikes if candidate minimizes the CBT examination window.' },
                      { state: disableCopy, set: setDisableCopy, label: 'Disable Clipboard Copy', desc: 'Locks clipboard to block copying quiz questions.' },
                      { state: disablePaste, set: setDisablePaste, label: 'Disable Clipboard Paste', desc: 'Blocks paste interactions inside subjective or input fields.' },
                      { state: disableRightClick, set: setDisableRightClick, label: 'Deactivate Right-Click Menu', desc: 'Blocks context menus to prevent inspect element attempts.' },
                      { state: autoSubmitOnViolations, set: setAutoSubmitOnViolations, label: 'Auto-Submit on Violations Limit', desc: 'Immediately force-submits the candidate if strikes limit is reached.' },
                      { state: suspiciousActivityLogging, set: setSuspiciousActivityLogging, label: 'Suspicious Activity Audits', desc: 'Logs user agent parameters and platform breach records.' }
                    ].map((sec, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-xl text-left">
                        <input
                          type="checkbox"
                          id={`sec_${idx}`}
                          checked={sec.state}
                          onChange={(e) => sec.set(e.target.checked)}
                          className="h-5 w-5 text-indigo-600 focus:ring-0 focus:ring-offset-0 rounded border-white/10 bg-white/5 mt-0.5 cursor-pointer shrink-0"
                        />
                        <div>
                          <label htmlFor={`sec_${idx}`} className="text-sm font-semibold text-white cursor-pointer select-none">{sec.label}</label>
                          <p className="text-xs text-gray-400 mt-0.5">{sec.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between text-left">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Breach Strike Limit</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Define maximum violation warnings before auto-submission or lockouts occur.</p>
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-24 text-center font-bold text-white focus:outline-none"
                      value={violationLimit}
                      onChange={(e) => setViolationLimit(Number(e.target.value))}
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: Scorecard Designer */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Award className="text-indigo-400 h-5 w-5" /> Scorecard Theme & Result Designer
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">Design the final academic scorecard report displayed to successful candidates.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    {/* Design Controls */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Evaluation Grading Logic</label>
                        <select
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                          value={resultType}
                          onChange={(e) => setResultType(e.target.value as any)}
                        >
                          <option value="percentage">Percentage Based (0 - 100%)</option>
                          <option value="grade">Academic Grades (A+, A, B, C, D, F)</option>
                          <option value="gpa">Standard GPA Scale (0.0 - 4.0 GPA)</option>
                          <option value="pass_fail">Binary Pass / Fail</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Visual Template Theme</label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'Modern', label: 'Modern Premium' },
                            { id: 'Futuristic', label: 'Neo-Futuristic' },
                            { id: 'Cyberpunk', label: 'Cyberpunk Tech' },
                            { id: 'Classic', label: 'Classic Board' }
                          ].map((theme) => (
                            <button
                              key={theme.id}
                              type="button"
                              onClick={() => setResultTheme(theme.id as any)}
                              className={`p-3 rounded-xl border font-bold text-xs transition-all ${
                                resultTheme === theme.id 
                                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                              }`}
                            >
                              {theme.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Visible Metrics</label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { state: showRank, set: setShowRank, label: 'Show Absolute Rank' },
                            { state: showPercentage, set: setShowPercentage, label: 'Show Percentage' },
                            { state: showCorrectAnswers, set: setShowCorrectAnswers, label: 'Reveal Correct Key' },
                            { state: showWrongAnswers, set: setShowWrongAnswers, label: 'Highlight Missed Options' },
                            { state: showExplanations, set: setShowExplanations, label: 'Show Written Explanations' },
                            { state: downloadableResult, set: setDownloadableResult, label: 'Download PDF Report' },
                            { state: printableResult, set: setPrintableResult, label: 'Print Result Page' },
                            { state: leaderboardVisibility, set: setLeaderboardVisibility, label: 'Leaderboard Visibility' }
                          ].map((met, idx) => (
                            <label key={idx} className="flex items-center gap-2 p-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer">
                              <input
                                type="checkbox"
                                checked={met.state}
                                onChange={(e) => met.set(e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-0 rounded border-white/10 bg-white/5"
                              />
                              <span className="text-[11px] font-semibold text-gray-300">{met.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Live Preview Card */}
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Scorecard Interactive Preview</label>
                      <div className={`p-6 rounded-2xl border backdrop-blur-xl relative overflow-hidden transition-all duration-500 ${
                        resultTheme === 'Futuristic' 
                          ? 'bg-cyan-950/20 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] text-cyan-200' 
                          : resultTheme === 'Cyberpunk' 
                            ? 'bg-yellow-950/10 border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.15)] text-yellow-300' 
                            : resultTheme === 'Classic' 
                              ? 'bg-stone-900 border-stone-700 text-stone-200' 
                              : 'bg-indigo-950/20 border-indigo-500/20 text-indigo-200'
                      }`}>
                        <div className="absolute top-0 right-0 p-2 bg-indigo-500/20 rounded-bl-xl text-[9px] font-bold uppercase tracking-widest text-indigo-300">
                          {resultTheme} Layout
                        </div>

                        <div className="space-y-4 text-center">
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">QIVORA REPORT CARD</span>
                            <h4 className="text-lg font-bold text-white">{title || 'Exam Title'}</h4>
                          </div>

                          <div className="my-6 flex justify-center">
                            <div className="h-28 w-28 rounded-full border-4 border-indigo-500/30 flex flex-col items-center justify-center relative">
                              <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin-slow" />
                              <span className="text-3xl font-extrabold text-white">92%</span>
                              <span className="text-[9px] uppercase tracking-wider text-gray-400 mt-1">Excellent</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10 text-xs">
                            <div>
                              <p className="text-[9px] text-gray-400 uppercase">Rank</p>
                              <p className="font-bold text-white">#04/180</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-gray-400 uppercase">Grade</p>
                              <p className="font-bold text-white">A+</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-gray-400 uppercase">GPA Scale</p>
                              <p className="font-bold text-white">4.0 GPA</p>
                            </div>
                          </div>

                          {subjectsList.length > 0 && (
                            <div className="space-y-2 text-left">
                              <p className="text-[9px] text-gray-400 uppercase">Subject Performance</p>
                              {subjectsList.map((s, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs">
                                  <span className="text-gray-300 font-semibold">{s.name}</span>
                                  <span className="font-bold text-white">95% (A+)</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls footer */}
          <div className="mt-8 pt-6 border-t border-white/10 flex justify-between">
            <PremiumButton
              type="button"
              variant="outline"
              disabled={currentStep === 1 || isLoading}
              onClick={handlePrev}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </PremiumButton>

            {currentStep < 5 ? (
              <PremiumButton
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </PremiumButton>
            ) : (
              <PremiumButton
                type="button"
                onClick={handleCreateExam}
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Publishing...
                  </>
                ) : (
                  <>
                    Publish Secure Exam <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </PremiumButton>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
