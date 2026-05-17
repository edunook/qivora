import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '../components/ui/GlassCard'
import { PremiumButton } from '../components/ui/PremiumButton'
import { ShieldCheck, Users, FileText, AlertTriangle, Trash2, Ban, CheckCircle, Search, Loader2, RefreshCw, BarChart2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'
import { API_BASE_URL } from '../lib/api'

interface UserData {
  _id: string
  name: string
  username: string
  email: string
  role: string
  isSuspended: boolean
  profilePicture: string
}

interface ExamData {
  _id: string
  title: string
  subject: string
  creator: {
    name: string
    username: string
  }
  attempts: number
  totalViolations: number
  cheatCount: number
}

interface PlatformAnalytics {
  metrics: {
    totalUsers: number
    totalExams: number
    totalAttempts: number
    totalViolations: number
    cheatedResults: number
    cheatingRate: number
  }
  demographics: {
    studentCount: number
    teacherCount: number
    orgCount: number
    adminCount: number
  }
}

export const AdminPanel = () => {
  const { user } = useAuthStore()
  
  const [users, setUsers] = useState<UserData[]>([])
  const [exams, setExams] = useState<ExamData[]>([])
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null)
  
  const [userSearch, setUserSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'exams'>('analytics')

  const API_BASE = `${API_BASE_URL}/api/admin`

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const token = useAuthStore.getState().user?.token
      const config = { headers: { Authorization: `Bearer ${token}` } }
      
      const [usersRes, examsRes, analyticsRes] = await Promise.all([
        axios.get(`${API_BASE}/users?search=${userSearch}&role=${roleFilter}`, config),
        axios.get(`${API_BASE}/exams`, config),
        axios.get(`${API_BASE}/analytics`, config),
      ])
      
      setUsers(usersRes.data)
      setExams(examsRes.data)
      setAnalytics(analyticsRes.data)
    } catch (err) {
      console.error('Failed to load admin intelligence metrics', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchData()
    }
  }, [user, userSearch, roleFilter])

  const handleToggleSuspend = async (userId: string) => {
    try {
      const token = useAuthStore.getState().user?.token
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const res = await axios.post(`${API_BASE}/users/${userId}/suspend`, {}, config)
      
      setUsers(users.map(u => u._id === userId ? { ...u, isSuspended: res.data.isSuspended } : u))
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle account suspension')
    }
  }

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const token = useAuthStore.getState().user?.token
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const res = await axios.post(`${API_BASE}/users/${userId}/role`, { role: newRole }, config)
      
      setUsers(users.map(u => u._id === userId ? { ...u, role: res.data.role } : u))
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user role')
    }
  }

  const handleDeleteExam = async (examId: string) => {
    if (!window.confirm('Are you absolutely sure you want to administratively delete this exam?')) return
    try {
      const token = useAuthStore.getState().user?.token
      const config = { headers: { Authorization: `Bearer ${token}` } }
      await axios.delete(`${API_BASE}/exams/${examId}`, config)
      
      setExams(exams.filter(e => e._id !== examId))
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete exam')
    }
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <GlassCard className="max-w-md text-center p-8 border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.05)]">
          <Ban className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-500 mb-4">Unauthorized Access</h2>
          <p className="text-white/60 text-sm mb-6">
            You do not have permission to view the administrative terminal. Please contact the platform administrators for security access.
          </p>
        </GlassCard>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="container mx-auto px-4 sm:px-6 py-12 max-w-7xl"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold flex items-center gap-3">
            <ShieldCheck className="w-9 h-9 text-primary" /> Admin Control Dashboard
          </h1>
          <p className="text-white/50 text-sm mt-1">Platform operations audits, user permissions management, and exam violations moderation.</p>
        </div>

        <div className="flex gap-3">
          <PremiumButton onClick={fetchData} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh Intelligence
          </PremiumButton>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-white/5 mb-8 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'analytics' ? 'border-primary text-white' : 'border-transparent text-white/40 hover:text-white/60'
          }`}
        >
          <BarChart2 className="w-4 h-4" /> Operations Intelligence
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'users' ? 'border-primary text-white' : 'border-transparent text-white/40 hover:text-white/60'
          }`}
        >
          <Users className="w-4 h-4" /> User Management
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'exams' ? 'border-primary text-white' : 'border-transparent text-white/40 hover:text-white/60'
          }`}
        >
          <FileText className="w-4 h-4" /> Exams & Violations Registry
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'analytics' && analytics && (
              <div className="space-y-8">
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <GlassCard className="p-6">
                    <Users className="w-7 h-7 text-primary mb-3" />
                    <div className="text-2xl font-black">{analytics.metrics.totalUsers}</div>
                    <div className="text-xs text-white/40 font-bold uppercase tracking-wider mt-1">Platform Members</div>
                  </GlassCard>
                  <GlassCard className="p-6">
                    <FileText className="w-7 h-7 text-accent-cyan mb-3" />
                    <div className="text-2xl font-black">{analytics.metrics.totalExams}</div>
                    <div className="text-xs text-white/40 font-bold uppercase tracking-wider mt-1">Examinations Published</div>
                  </GlassCard>
                  <GlassCard className="p-6">
                    <CheckCircle className="w-7 h-7 text-green-400 mb-3" />
                    <div className="text-2xl font-black">{analytics.metrics.totalAttempts}</div>
                    <div className="text-xs text-white/40 font-bold uppercase tracking-wider mt-1">Sessions Attempted</div>
                  </GlassCard>
                  <GlassCard className="p-6 border-red-500/20">
                    <AlertTriangle className="w-7 h-7 text-red-400 mb-3" />
                    <div className="text-2xl font-black">{analytics.metrics.totalViolations}</div>
                    <div className="text-xs text-white/40 font-bold uppercase tracking-wider mt-1">Secured Breach Flags</div>
                  </GlassCard>
                </div>

                {/* Sub-Metrics Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <GlassCard className="p-6">
                    <h3 className="font-bold text-lg mb-4">Roles Breakdown</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/60">Students / Candidates</span>
                        <span className="font-bold">{analytics.demographics.studentCount}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/60">Teachers / Creators</span>
                        <span className="font-bold">{analytics.demographics.teacherCount}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/60">Organizations / Enterprises</span>
                        <span className="font-bold">{analytics.demographics.orgCount}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/60">Administrators</span>
                        <span className="font-bold">{analytics.demographics.adminCount}</span>
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6">
                    <h3 className="font-bold text-lg mb-4">Security Proctor Intelligence</h3>
                    <div className="flex flex-col justify-center items-center h-full pb-8 text-center">
                      <div className="text-5xl font-black text-red-500">{analytics.metrics.cheatingRate}%</div>
                      <p className="text-sm font-semibold uppercase text-white/40 tracking-wider mt-2">Suspicious Exam Rate</p>
                      <p className="text-xs text-white/60 max-w-xs mt-3">
                        Calculated by dividing flagged cheat breaches against completed exam attempts. Active proctoring prevents client manipulations.
                      </p>
                    </div>
                  </GlassCard>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3.5 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      placeholder="Search accounts by name, username, or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none"
                  >
                    <option value="all" className="bg-background">All Roles</option>
                    <option value="student" className="bg-background">Student</option>
                    <option value="teacher" className="bg-background">Teacher</option>
                    <option value="admin" className="bg-background">Administrator</option>
                    <option value="organization" className="bg-background">Organization</option>
                  </select>
                </div>

                {/* Users Directory Table */}
                <GlassCard className="p-0 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-white/60 text-xs font-bold uppercase tracking-widest">
                          <th className="py-4 px-6">User / Account</th>
                          <th className="py-4 px-6">Email / Username</th>
                          <th className="py-4 px-6">Authorization Role</th>
                          <th className="py-4 px-6">Security Status</th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {users.map((u) => (
                          <tr key={u._id} className="text-sm text-white/80 hover:bg-white/[0.01] transition-colors">
                            <td className="py-4 px-6 flex items-center gap-3">
                              <img src={u.profilePicture} alt={u.name} className="w-9 h-9 rounded-xl bg-white/10" />
                              <div className="font-bold text-white">{u.name}</div>
                            </td>
                            <td className="py-4 px-6">
                              <div>{u.email}</div>
                              <div className="text-xs text-white/40">@{u.username}</div>
                            </td>
                            <td className="py-4 px-6">
                              <select
                                value={u.role}
                                onChange={(e) => handleChangeRole(u._id, e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-primary/50"
                              >
                                <option value="student" className="bg-background">Student</option>
                                <option value="teacher" className="bg-background">Teacher</option>
                                <option value="admin" className="bg-background">Admin</option>
                                <option value="organization" className="bg-background">Organization</option>
                              </select>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                u.isSuspended 
                                  ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                                  : 'bg-green-500/10 text-green-400 border border-green-500/20'
                              }`}>
                                {u.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => handleToggleSuspend(u._id)}
                                className={`p-1.5 rounded-lg border transition-all ${
                                  u.isSuspended
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                                }`}
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </div>
            )}

            {activeTab === 'exams' && (
              <GlassCard className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-white/60 text-xs font-bold uppercase tracking-widest">
                        <th className="py-4 px-6">Exam Title / Subject</th>
                        <th className="py-4 px-6">Creator</th>
                        <th className="py-4 px-6">Attempts</th>
                        <th className="py-4 px-6">Secured Violations</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {exams.map((e) => (
                        <tr key={e._id} className="text-sm text-white/80 hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-bold text-white">{e.title}</div>
                            <div className="text-xs text-white/40 uppercase mt-0.5">{e.subject}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div>{e.creator?.name || 'Unknown'}</div>
                            <div className="text-xs text-white/40">@{e.creator?.username || 'unknown'}</div>
                          </td>
                          <td className="py-4 px-6 font-mono font-bold">{e.attempts} Attempts</td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                              e.totalViolations > 0
                                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                : 'bg-green-500/10 text-green-400 border border-green-500/20'
                            }`}>
                              {e.totalViolations} Flagged Breach Warnings ({e.cheatCount} submissions breached)
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleDeleteExam(e._id)}
                              className="p-1.5 rounded-lg border bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
export default AdminPanel
