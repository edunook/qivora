import { Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowLeft } from 'lucide-react'

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Background Orbs for Mobile fallback */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[100px] rounded-full lg:hidden pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-cyan/20 blur-[100px] rounded-full lg:hidden pointer-events-none" />

      {/* Left Branding Side (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black/50 border-r border-white/5 items-center justify-center p-12 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full mix-blend-screen"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[20%] right-[20%] w-[50%] h-[50%] bg-accent-cyan/20 blur-[100px] rounded-full mix-blend-screen"
          />
        </div>

        <div className="relative z-10 w-full max-w-lg">
          <Link to="/" className="flex items-center gap-2 mb-12 hover:opacity-80 transition-opacity w-max">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center glow-purple">
              <Sparkles className="text-white w-7 h-7" />
            </div>
            <span className="text-3xl font-bold tracking-tighter text-white">
              Qivora<span className="text-primary">.</span>
            </span>
          </Link>

          <h1 className="text-5xl font-bold mb-6 leading-tight">
            The Future of <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent-purple to-accent-cyan">
              Examinations
            </span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed mb-12">
            Join thousands of institutions and educators delivering highly secure, AI-driven assessments with a world-class user experience.
          </p>

          <div className="glass p-6 rounded-2xl border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="font-bold text-sm">Alex Morrison</div>
                <div className="text-xs text-white/50">Lead Instructor, Tech Academy</div>
              </div>
            </div>
            <p className="text-sm text-white/70 italic">
              "Qivora completely revolutionized how we conduct midterms. The interface is stunning and the security features are unmatched."
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col relative z-10">
        <div className="p-6 sm:p-8 flex items-center justify-between">
          <Link to="/" className="text-white/50 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center">
              <Sparkles className="text-white w-4 h-4" />
            </div>
            <span className="font-bold tracking-tighter text-white">Qivora.</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
