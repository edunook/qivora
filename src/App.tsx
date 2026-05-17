import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { AuthLayout } from './components/layout/AuthLayout'
import { Home } from './pages/Home'
import { ExploreExams } from './pages/ExploreExams'
import { CreateExam } from './pages/CreateExam'
import { LiveExam } from './pages/LiveExam'
import { Dashboard } from './pages/Dashboard'
import { ResultDashboard } from './pages/ResultDashboard'
import { AdminPanel } from './pages/AdminPanel'
import { SignIn } from './pages/auth/SignIn'
import { SignUp } from './pages/auth/SignUp'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import { ResetPassword } from './pages/auth/ResetPassword'
import { AnimatePresence } from 'framer-motion'

function App() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Main App Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="explore" element={<ExploreExams />} />
            <Route path="create" element={<CreateExam />} />
            <Route path="exam/:id" element={<LiveExam />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="result/:id" element={<ResultDashboard />} />
            <Route path="admin" element={<AdminPanel />} />
          </Route>

          {/* Authentication Routes */}
          <Route element={<AuthLayout />}>
            <Route path="login" element={<SignIn />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </Router>
  )
}

export default App
