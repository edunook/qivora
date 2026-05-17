import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '../components/ui/GlassCard'
import { PremiumButton } from '../components/ui/PremiumButton'
import { 
  Calendar, XCircle, ArrowLeft, Printer, ShieldCheck, 
  HelpCircle, Loader2, Award, Sparkles, Clock, ChevronRight,
  TrendingUp, Download, Eye, Share2, Star
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'
import { API_BASE_URL } from '../lib/api'

interface ResultData {
  resultsReleased: boolean
  examTitle: string
  subject: string
  resultsReleaseType?: string
  resultsReleaseDate?: string | null
  createdAt: string
  result?: {
    _id: string
    score: number
    totalQuestions: number
    percentage: number
    timeTaken: number
    negativeMarks: number
    finalScore: number
    cheated: boolean
    violationsCount: number
    grade: string
    gpa: number
    passed: boolean
    createdAt: string
    answers: Record<string, number>
    subjectWiseAnalysis?: Record<string, { 
      percentage: number 
      correct: number 
      total: number 
      score: number 
      maxScore: number
      grade?: string
      passed?: boolean
      timeSpent?: number
    }>
    exam: {
      _id: string
      title: string
      description: string
      subject: string
      duration: number
      difficulty: string
      negativeMarking: boolean
      negativeMarkValue: number
      resultType?: 'percentage' | 'grade' | 'gpa' | 'pass_fail' | 'ranking'
      resultTheme?: 'Modern' | 'Futuristic' | 'Cyberpunk' | 'Classic'
      resultColors?: string[]
      resultLayoutStyle?: 'Grid' | 'List' | 'SingleCard'
      showRank?: boolean
      showPercentage?: boolean
      showCorrectAnswers?: boolean
      showWrongAnswers?: boolean
      showExplanations?: boolean
      downloadableResult?: boolean
      printableResult?: boolean
      leaderboardVisibility?: boolean
      questions: Array<{
        text: string
        options: string[]
        correctOption: number
        explanation?: string
        marks?: number
        negativeMarks?: number
        difficulty?: string
      }>
      creator: {
        name: string
        username: string
        profilePicture: string
      }
    }
  }
}

export const ResultDashboard = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [data, setData] = useState<ResultData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Live ticking countdown state for scheduled releases
  const [countdownString, setCountdownString] = useState('')

  // Rating & Review Form State
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)

  const handleSubmitReview = async (examId: string) => {
    setIsSubmittingReview(true)
    try {
      const token = useAuthStore.getState().user?.token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      await axios.post(`${API_BASE_URL}/api/social/exams/${examId}/rate`, { rating, review }, config)
      setReviewSuccess(true)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  // Fetch results and secure data payload
  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = useAuthStore.getState().user?.token
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${API_BASE_URL}/api/results/${id}`, config)
        setData(response.data)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch exam result analytics')
      } finally {
        setIsLoading(false)
      }
    }

    if (user && id) {
      fetchResult()
    } else if (!user) {
      navigate('/login')
    }
  }, [id, user, navigate])

  // Timer interval for ticking scheduled release countdowns
  useEffect(() => {
    if (!data || data.resultsReleased || !data.resultsReleaseDate) return

    const releaseTime = new Date(data.resultsReleaseDate).getTime()

    const updateCountdown = () => {
      const now = new Date().getTime()
      const diff = releaseTime - now

      if (diff <= 0) {
        setCountdownString('Available Now!')
        // Reload page to fetch unlocked results
        window.location.reload()
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setCountdownString(
        `${days.toString().padStart(2, '0')}d : ${hours
          .toString()
          .padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds
          .toString()
          .padStart(2, '0')}s`
      )
    }

    updateCountdown()
    const timerId = setInterval(updateCountdown, 1000)
    return () => clearInterval(timerId)
  }, [data])

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <GlassCard className="p-8 max-w-md text-center border-rose-500/20">
          <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-rose-500 mb-4">Error Fetching Results</h2>
          <p className="text-gray-400 mb-6">{error || 'Please login to verify authentication.'}</p>
          <Link to="/dashboard">
            <PremiumButton>Go to Dashboard</PremiumButton>
          </Link>
        </GlassCard>
      </div>
    )
  }

  // Gorgeous Scheduled Release Gate Screen
  if (!data.resultsReleased) {
    const formattedReleaseDate = data.resultsReleaseDate 
      ? new Date(data.resultsReleaseDate).toLocaleString(undefined, {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Locked by Instructor'

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[80vh]"
      >
        <GlassCard className="max-w-xl w-full p-8 sm:p-12 text-center border-indigo-500/20 relative overflow-hidden" hoverGlow={true}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10" />
          
          <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping" />
            <ShieldCheck className="w-10 h-10 text-indigo-400" />
          </div>

          <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-wide">CBT Response Securely Logged</h2>
          <p className="text-gray-400 text-sm mb-8">Exam: <span className="text-indigo-400 font-semibold">{data.examTitle}</span></p>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 mb-8 space-y-4">
            <Calendar className="w-8 h-8 text-indigo-400 mx-auto" />
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Results Release Schedule</div>
              <div className="text-sm sm:text-base font-bold text-white">{formattedReleaseDate}</div>
            </div>
            {countdownString && (
              <div className="pt-4 border-t border-white/5">
                <div className="text-[10px] text-indigo-300 uppercase tracking-widest font-bold mb-1.5 flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" /> Live Countdown
                </div>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-white tracking-wider">{countdownString}</div>
              </div>
            )}
          </div>

          <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto mb-8 leading-relaxed">
            Your answers have been uploaded and secured on our database. Score calculation and question breakdowns will be available automatically on the scheduled publication date.
          </p>

          <Link to="/dashboard">
            <PremiumButton className="w-full">Return to Dashboard</PremiumButton>
          </Link>
        </GlassCard>
      </motion.div>
    )
  }

  const resVal = data.result!
  const exam = resVal.exam
  const totalCount = resVal.totalQuestions
  const passThreshold = resVal.passed

  // Theme settings variables
  const activeTheme = exam.resultTheme || 'Modern'
  const activeLayout = exam.resultLayoutStyle || 'Grid'

  // Visibility triggers based on configuration settings
  const shouldShowRank = exam.showRank !== undefined ? exam.showRank : true
  const shouldShowPercentage = exam.showPercentage !== undefined ? exam.showPercentage : true
  const shouldShowCorrectAnswers = exam.showCorrectAnswers !== undefined ? exam.showCorrectAnswers : true
  const shouldShowWrongAnswers = exam.showWrongAnswers !== undefined ? exam.showWrongAnswers : true
  const shouldShowExplanations = exam.showExplanations !== undefined ? exam.showExplanations : true
  const shouldAllowDownload = exam.downloadableResult !== undefined ? exam.downloadableResult : true
  const shouldAllowPrint = exam.printableResult !== undefined ? exam.printableResult : true

  const subjectAnalysis = resVal.subjectWiseAnalysis || {}
  
  let strongestSubj = ''
  let strongestPct = -1
  let weakestSubj = ''
  let weakestPct = 101

  Object.keys(subjectAnalysis).forEach((key) => {
    const pct = subjectAnalysis[key].percentage
    if (pct > strongestPct) {
      strongestPct = pct
      strongestSubj = key
    }
    if (pct < weakestPct) {
      weakestPct = pct
      weakestSubj = key
    }
  })

  // Theme-specific CSS Class Builders
  const getThemeContainerClasses = () => {
    switch (activeTheme) {
      case 'Cyberpunk':
        return 'bg-black text-yellow-300 font-mono border-2 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.15)] rounded-none'
      case 'Futuristic':
        return 'bg-gradient-to-br from-cyan-950/20 to-purple-950/20 text-cyan-200 border-cyan-500/20 rounded-3xl shadow-[0_0_30px_rgba(6,182,212,0.15)]'
      case 'Classic':
        return 'bg-stone-900 border-stone-700 text-stone-200 rounded-xl'
      default: // Modern
        return 'bg-indigo-950/20 border-indigo-500/20 text-white rounded-2xl'
    }
  }

  const getThemeTextClasses = () => {
    switch (activeTheme) {
      case 'Cyberpunk':
        return 'text-yellow-400 font-black uppercase tracking-widest'
      case 'Futuristic':
        return 'text-cyan-400 font-bold tracking-tight'
      case 'Classic':
        return 'text-stone-100 font-serif font-semibold'
      default: // Modern
        return 'text-white font-extrabold'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`container mx-auto px-4 sm:px-6 py-12 print:p-0 print:m-0 print:bg-white print:text-black ${
        activeTheme === 'Cyberpunk' ? 'font-mono' : ''
      }`}
    >
      {/* Hide controls during printing */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-white/10 pb-6 gap-4 print:hidden">
        <Link to="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        
        <div className="flex gap-3">
          {shouldAllowPrint && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600/20 transition-all text-xs font-bold"
            >
              <Printer className="w-4 h-4" /> Print Assessment
            </button>
          )}
          {shouldAllowDownload && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all text-xs font-bold shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            >
              <Download className="w-4 h-4" /> Export PDF Scorecard
            </button>
          )}
        </div>
      </div>

      {/* Main Container Envelope */}
      <div className="print:block">
        {/* Certificate / Official Assessment Heading (Only visible in Print) */}
        <div className="hidden print:flex flex-col items-center text-center mb-12 border-b-2 border-slate-200 pb-8 text-black">
          <h1 className="text-3xl font-black tracking-widest uppercase mb-1">Qivora CBT Ecosystem</h1>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">Official Candidate Assessment Report</p>
          <div className="w-24 h-1 bg-indigo-600 rounded-full" />
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${activeLayout === 'List' ? 'lg:grid-cols-1' : ''}`}>
          
          {/* Main Scorecard card */}
          <GlassCard 
            className={`p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden print:border-slate-300 print:bg-white print:text-black print:shadow-none ${getThemeContainerClasses()}`} 
            hoverGlow={false}
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className={`text-2xl leading-tight print:text-black ${getThemeTextClasses()}`}>{exam.title}</h2>
                  <p className="text-xs text-gray-400 print:text-slate-500 mt-1.5 uppercase tracking-wider font-semibold">Subject: {exam.subject}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  passThreshold 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 print:bg-green-100 print:text-green-800' 
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20 print:bg-red-100 print:text-red-800'
                }`}>
                  {passThreshold ? 'PASSED' : 'FAILED'}
                </div>
              </div>

              {/* Dynamic Circular SVG/CSS score representation */}
              {shouldShowPercentage && (
                <div className="flex flex-col items-center py-6">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="80" cy="80" r="70" className="stroke-white/5 print:stroke-slate-100" strokeWidth="8" fill="transparent" />
                      <circle 
                        cx="80" 
                        cy="80" 
                        r="70" 
                        className={passThreshold ? 'stroke-emerald-500' : 'stroke-rose-500'} 
                        strokeWidth="10" 
                        fill="transparent" 
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * resVal.percentage) / 100}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-extrabold">{resVal.percentage}%</span>
                      <span className="text-[10px] text-gray-400 print:text-slate-500 uppercase tracking-widest font-bold mt-1">Overall</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Assessment details breakdown */}
              <div className="space-y-4 border-t border-white/10 print:border-slate-200 pt-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 print:text-slate-500">Letter Grade</span>
                  <span className="font-bold text-lg text-indigo-400 print:text-indigo-600">{resVal.grade}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 print:text-slate-500">Cumulative GPA</span>
                  <span className="font-bold">{resVal.gpa.toFixed(1)} / 4.0 GPA</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 print:text-slate-500">Final Score Marks</span>
                  <span className="font-bold">{resVal.finalScore} / {totalCount}</span>
                </div>
                {exam.negativeMarking && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-rose-400/80">Negative Deductions</span>
                    <span className="font-bold text-rose-400">-{resVal.negativeMarks}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 print:text-slate-500">Time Consumed</span>
                  <span className="font-mono font-bold">
                    {Math.floor(resVal.timeTaken / 60)}m {resVal.timeTaken % 60}s
                  </span>
                </div>
              </div>
            </div>

            {/* Candidate / Examiner details */}
            <div className="mt-8 border-t border-white/10 print:border-slate-200 pt-6 flex items-center gap-4">
              <img 
                src={exam.creator.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200'} 
                alt={exam.creator.name} 
                className="w-10 h-10 rounded-xl bg-white/10 print:border print:border-slate-300 object-cover" 
              />
              <div className="text-left">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Evaluated By</div>
                <div className="text-xs font-bold print:text-black">{exam.creator.name}</div>
                <div className="text-[9px] text-gray-400">@{exam.creator.username}</div>
              </div>
            </div>

            {/* Candidate Rating & Review Form (Omitted in print media) */}
            <div className="mt-8 border-t border-white/10 pt-6 print:hidden">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-3 text-left">Rate & Review Exam</h3>
              {reviewSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center font-medium">
                  Thank you! Your feedback has been secured.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="text-lg focus:outline-none transition-transform active:scale-95"
                        >
                          <Star className={`h-4.5 w-4.5 ${star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-500'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Write a brief comment about this assessment..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                  />
                  <PremiumButton
                    onClick={() => handleSubmitReview(exam._id)}
                    disabled={isSubmittingReview}
                    className="w-full py-2 text-xs font-bold"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Feedback'}
                  </PremiumButton>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Secure Monitoring & Topic breakdown */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Anti Cheat secure proctor checkmark panel */}
            <GlassCard className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6 print:border-slate-300 print:bg-white print:text-black print:shadow-none" hoverGlow={false}>
              <div className="flex items-center gap-4 text-left">
                <div className={`p-3 rounded-2xl ${
                  resVal.cheated 
                    ? 'bg-rose-500/10 text-rose-500 print:bg-red-100' 
                    : 'bg-emerald-500/10 text-emerald-500 print:bg-green-100'
                }`}>
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg print:text-black">Secure Proctor Auditing</h3>
                  <p className="text-xs text-gray-400 print:text-slate-500">
                    {resVal.cheated 
                      ? 'Security logs flag multiple tab switching proctoring violations during session.' 
                      : 'Proctor verified: full-screen integrity checks completed with 0 violations.'}
                  </p>
                </div>
              </div>
              <div className="text-center shrink-0">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">CBT Warnings</div>
                <div className={`text-xl font-bold mt-1 ${resVal.violationsCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {resVal.violationsCount} / {exam.violationLimit || 3} Strikes
                </div>
              </div>
            </GlassCard>

            {/* Subject-Wise Branch Performance & Insights */}
            {Object.keys(subjectAnalysis).length > 0 && (
              <GlassCard className="p-6 sm:p-8 print:border-slate-300 print:bg-white print:text-black print:shadow-none text-left" hoverGlow={false}>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 print:text-black">
                  <TrendingUp className="w-5 h-5 text-indigo-400" /> Multi-Subject Section analytics
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Strongest vs. Weakest */}
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Strongest Subject Branch</div>
                    <div className="text-lg font-extrabold text-white mt-1 uppercase print:text-green-800">{strongestSubj || 'N/A'}</div>
                    <div className="text-xs text-gray-400 print:text-slate-500 mt-1">Accuracy of {strongestPct}% completed</div>
                  </div>
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <div className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Focus Subject Area</div>
                    <div className="text-lg font-extrabold text-white mt-1 uppercase print:text-red-800">{weakestSubj || 'N/A'}</div>
                    <div className="text-xs text-gray-400 print:text-slate-500 mt-1">Accuracy of {weakestPct}% achieved</div>
                  </div>
                </div>

                <div className="space-y-5">
                  {Object.keys(subjectAnalysis).map((subjKey) => {
                    const subjData = subjectAnalysis[subjKey]
                    return (
                      <div key={subjKey} className="space-y-2">
                        <div className="flex justify-between items-center text-sm font-semibold">
                          <span className="uppercase tracking-wider text-gray-200 print:text-slate-700">{subjKey}</span>
                          <span className="font-mono text-xs text-gray-400 print:text-slate-500">
                            {subjData.correct} / {subjData.total} Qs ({subjData.score.toFixed(1)} / {subjData.maxScore} Marks)
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden print:bg-slate-100">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${subjData.percentage}%` }}
                              transition={{ duration: 1 }}
                              className={`h-full rounded-full ${subjData.percentage >= 50 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-rose-500 to-red-400'}`}
                            />
                          </div>
                          <span className={`text-xs font-bold w-8 text-right ${subjData.percentage >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {subjData.percentage}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </GlassCard>
            )}

            {/* Question by question analysis reports */}
            {shouldShowCorrectAnswers && (
              <GlassCard className="p-6 sm:p-8 flex-1 print:border-slate-300 print:bg-white print:text-black print:shadow-none text-left" hoverGlow={false}>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 print:text-black">
                  <HelpCircle className="w-5 h-5 text-indigo-400" /> Answer Key Analysis & Explanations
                </h3>

                <div className="space-y-6">
                  {exam.questions.map((question, i) => {
                    const isCorrect = resVal.answers[i] === question.correctOption
                    return (
                      <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 print:border-slate-200 print:bg-slate-50 mb-4 break-inside-avoid">
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <span className="text-xs font-black uppercase tracking-wider text-indigo-400 print:text-indigo-600">Question {i + 1}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isCorrect 
                              ? 'bg-emerald-500/10 text-emerald-400 print:bg-green-100 print:text-green-800' 
                              : 'bg-rose-500/10 text-rose-400 print:bg-red-100 print:text-red-800'
                          }`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>

                        <p className="text-sm font-semibold mb-4 print:text-slate-800">{question.text}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                          {question.options.map((opt, idx) => {
                            const isOptionCorrect = idx === question.correctOption
                            const isOptionSelected = resVal.answers[i] === idx
                            
                            let bgStyle = 'bg-white/5 border-white/10 text-gray-400 print:bg-white print:border-slate-200 print:text-slate-600'
                            if (isOptionCorrect) {
                              bgStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 print:bg-green-100 print:border-green-300 print:text-green-800 font-medium'
                            } else if (isOptionSelected && !isCorrect && shouldShowWrongAnswers) {
                              bgStyle = 'bg-rose-500/20 border-rose-500/50 text-rose-300 print:bg-red-100 print:border-red-300 print:text-red-800'
                            }

                            return (
                              <div key={idx} className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${bgStyle}`}>
                                <span className="font-bold">{String.fromCharCode(65 + idx)}.</span>
                                <span>{opt}</span>
                              </div>
                            )
                          })}
                        </div>
                        {shouldShowExplanations && question.explanation && (
                          <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400">
                            <span className="font-bold text-indigo-300 mr-1">Explanation:</span> {question.explanation}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </GlassCard>
            )}
          </div>
        </div>

        {/* Certificate print footer (Only shows on PDF/Print page) */}
        <div className="hidden print:flex justify-between items-center mt-16 pt-8 border-t-2 border-slate-200 text-slate-500 text-[10px]">
          <div>Report generated automatically via secure Qivora proctoring servers.</div>
          <div>Evaluation Reference Token: {resVal._id}</div>
        </div>
      </div>
    </motion.div>
  )
}
