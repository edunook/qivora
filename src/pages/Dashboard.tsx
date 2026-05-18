import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '../components/ui/GlassCard'
import { Award, History, TrendingUp, BookOpen, Clock, Target, ChevronRight, Loader2, Plus, ArrowRight, Settings } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../lib/api'

interface DashboardData {
  stats: {
    examsAttempted: number
    avgScore: number
    totalTimeHrs: number
    passed: number
    examsCreated: number
  }
  recentResults: Array<{
    _id: string
    examTitle: string
    subject: string
    score: number | null
    totalQuestions: number
    percentage: number | null
    createdAt: string
  }>
  chartData: number[]
  myExams: Array<{
    _id: string
    title: string
    subject: string
    attempts: number
    createdAt: string
  }>
}

export const Dashboard = () => {
  const { user } = useAuthStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = useAuthStore.getState().user?.token
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${API_BASE_URL}/api/results/dashboard`, config)
        setData(response.data)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard analytics')
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <GlassCard className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Analytics</h2>
          <p className="text-white/60 mb-6">{error || 'Please login to view dashboard analytics.'}</p>
          <Link to="/login">
            <button className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold">Go to Login</button>
          </Link>
        </GlassCard>
      </div>
    )
  }

  const { stats, recentResults, chartData, myExams } = data
  const userName = user?.name || 'Academician'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 sm:px-6 py-12"
    >
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}</h1>
          <p className="text-white/60">Here's your learning progress and ecosystem metrics.</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-sm text-white/50">Successful Passes</div>
            <div className="text-xl font-bold text-orange-500 flex items-center justify-end gap-1">
              {stats.passed} Exams <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Exams Attempted', value: stats.examsAttempted, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/20' },
          { label: 'Avg. Score', value: `${stats.avgScore}%`, icon: Target, color: 'text-accent-cyan', bg: 'bg-accent-cyan/20' },
          { label: 'Total Study Time', value: `${stats.totalTimeHrs}h`, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
          { label: 'Exams Created', value: stats.examsCreated, icon: Award, color: 'text-green-500', bg: 'bg-green-500/20' },
        ].map((stat, i) => (
          <GlassCard key={i} delay={i * 0.1} className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <div className="text-sm text-white/50">{stat.label}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Analytics Card */}
        <GlassCard className="lg:col-span-2 p-6 sm:p-8" hoverGlow={false}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold">Performance Analytics</h3>
              <p className="text-white/40 text-xs sm:text-sm">Weekly & monthly progression overview</p>
            </div>
            <div className="flex gap-2">
              <Link to="/explore">
                <button className="px-4 py-2 rounded-lg text-xs sm:text-sm bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors">
                  Take An Exam
                </button>
              </Link>
            </div>
          </div>

          {/* Real Dynamic Chart Area */}
          {chartData.length > 0 ? (
            <div className="h-[250px] sm:h-[300px] w-full flex items-end gap-1 sm:gap-2 mb-8">
              {chartData.map((pct, i) => (
                <div key={i} className="flex-1 group relative h-full flex flex-col justify-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ duration: 1, delay: i * 0.05 }}
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-primary' : 'bg-red-500/80'
                    } group-hover:brightness-110`}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 border border-white/10 px-2 py-1 rounded text-[10px] font-bold z-10 whitespace-nowrap">
                    {pct}% Score
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[250px] sm:h-[300px] w-full flex flex-col items-center justify-center text-center p-6 border border-white/5 rounded-2xl bg-white/5 mb-8">
              <TrendingUp className="w-12 h-12 text-white/20 mb-4" />
              <p className="text-white/60 mb-2 font-semibold">No Performance Data Yet</p>
              <p className="text-white/40 text-xs max-w-sm">Complete exams to start visualising your performance analytics here.</p>
            </div>
          )}
        </GlassCard>

        {/* Side Stats */}
        <div className="flex flex-col gap-8">
          {/* Creator Metrics */}
          <GlassCard className="p-4 sm:p-6 bg-gradient-to-br from-primary/20 to-transparent border-primary/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/20 rounded-xl"><Plus className="text-primary w-6 h-6" /></div>
                <div>
                  <div className="text-xs text-white/50 uppercase tracking-widest font-bold">Creator Sandbox</div>
                  <div className="text-2xl font-bold">Build & Share</div>
                </div>
              </div>
              <p className="text-white/60 text-xs mb-6">Create fully functional public and private exams with our modern Exam Engine.</p>
            </div>
            <Link to="/create" className="mb-4">
              <button className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2">
                Create New Exam <ArrowRight className="w-4 h-4" />
              </button>
            </Link>

            {myExams.length > 0 && (
              <div className="mt-2 border-t border-white/5 pt-4">
                <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-2">My Created Exams ({myExams.length})</div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                  {myExams.map((exam) => (
                    <div key={exam._id} className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col gap-3 group/item">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-white/90 font-bold text-sm truncate max-w-[150px]">{exam.title}</span>
                          <span className="text-[10px] text-white/40 uppercase tracking-widest">{exam.attempts} attempts</span>
                        </div>
                        <Link 
                          to={`/create?edit=${exam._id}`}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-primary/20 text-white/60 hover:text-primary transition-colors cursor-pointer"
                          title="Edit Exam Config"
                        >
                          <Settings className="w-4 h-4" />
                        </Link>
                      </div>
                      <Link 
                        to={`/manage-subjects/${exam._id}`}
                        className="w-full py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold text-xs text-center border border-indigo-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-3.5 h-3.5" /> Manage Subjects
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>

          {/* Recent Results */}
          <GlassCard className="p-4 sm:p-6 flex-1 flex flex-col">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-accent-cyan" /> Recent Results
            </h4>
            <div className="space-y-4 flex-1">
              {recentResults.length > 0 ? (
                recentResults.map((item) => {
                  const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  const status = item.percentage !== null && item.percentage >= 80 
                    ? 'Perfect' 
                    : item.percentage !== null && item.percentage >= 50 
                      ? 'Passed' 
                      : 'Failed'
                  return (
                    <Link key={item._id} to={`/result/${item._id}`} className="flex items-center justify-between group p-2.5 rounded-xl transition-all hover:bg-white/5 border border-transparent hover:border-white/5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                      <div className="pr-2 min-w-0">
                        <div className="text-sm font-semibold truncate max-w-[140px] sm:max-w-none group-hover:text-primary transition-colors">{item.examTitle}</div>
                        <div className="text-[10px] text-white/40">{dateStr}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-sm font-bold ${status === 'Perfect' ? 'text-green-400' : status === 'Failed' ? 'text-red-500' : 'text-accent-cyan'}`}>
                          {item.score !== null ? `${item.score}/${item.totalQuestions}` : 'Pending'}
                        </div>
                        <div className="text-[10px] text-white/40">{item.score !== null ? status : 'Locked'}</div>
                      </div>
                    </Link>
                  )
                })
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 py-12 flex-1">
                  <BookOpen className="w-8 h-8 text-white/20 mb-3" />
                  <p className="text-white/60 text-xs">No attempt history available yet.</p>
                </div>
              )}
            </div>
            {recentResults.length > 0 && (
              <Link to="/explore" className="w-full mt-6 text-xs text-white/40 hover:text-white flex items-center justify-center gap-1 transition-colors">
                View all exams <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </GlassCard>
        </div>
      </div>
    </motion.div>
  )
}
