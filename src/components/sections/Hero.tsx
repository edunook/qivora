import { motion, useScroll, useTransform } from 'framer-motion'
import { PremiumButton } from '../ui/PremiumButton'
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react'

export const Hero = () => {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 200])
  const y2 = useTransform(scrollY, [0, 500], [0, -150])

  return (
    <section className="relative pt-32 pb-20 overflow-hidden min-h-screen flex items-center">
      {/* Background Glows with Parallax */}
      <motion.div style={{ y: y1 }} className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <motion.div style={{ y: y2 }} className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent-cyan/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full glass mb-6 sm:mb-8 border-white/10"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs sm:text-sm font-medium text-white/80 tracking-wide uppercase">Next-Gen AI Examinations</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-8xl font-extrabold mb-6 sm:mb-8 tracking-tighter leading-tight"
          >
            The Future of <br />
            <span className="text-gradient">Smart Examinations</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm sm:text-base md:text-xl text-white/60 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0"
          >
            Experience the world's most advanced examination platform. AI-powered proctoring, 
            instant results, and a seamless futuristic interface for modern learning.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 max-w-sm sm:max-w-none mx-auto w-full px-4 sm:px-0"
          >
            <PremiumButton size="lg" className="w-full sm:w-auto gap-2">
              Start Exam <ArrowRight className="w-5 h-5" />
            </PremiumButton>
            <PremiumButton variant="secondary" size="lg" className="w-full sm:w-auto gap-2">
              <Play className="w-5 h-5 fill-current" /> Explore Subjects
            </PremiumButton>
          </motion.div>
        </div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 100, rotateX: 15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          className="relative max-w-6xl mx-auto perspective-1000"
        >
          <div className="relative glass rounded-3xl p-2 border-white/20 shadow-2xl overflow-hidden group">
            <img 
              src="/assets/dashboard.png" 
              alt="Qivora Dashboard" 
              className="w-full rounded-2xl shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-40" />
            
            {/* Floating Stats over Dashboard */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-10 top-1/4 glass p-4 rounded-2xl hidden lg:block border-white/10 glow-purple"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg"><CheckCircle2 className="text-primary w-5 h-5" /></div>
                <div>
                  <div className="text-xs text-white/50">Completion Rate</div>
                  <div className="text-lg font-bold">98.4%</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -right-10 bottom-1/4 glass p-4 rounded-2xl hidden lg:block border-white/10 glow-cyan"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-cyan/20 rounded-lg"><div className="w-5 h-5 border-2 border-accent-cyan rounded-full border-t-transparent animate-spin" /></div>
                <div>
                  <div className="text-xs text-white/50">AI Proctoring</div>
                  <div className="text-lg font-bold">Active</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Floating Particles/Elements */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 10
          }}
          className="absolute w-2 h-2 bg-primary/30 rounded-full blur-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
        />
      ))}
    </section>
  )
}
