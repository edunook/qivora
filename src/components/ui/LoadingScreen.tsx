import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export const LoadingScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1, delay: 2 }}
      onAnimationComplete={() => {
        document.body.style.overflow = 'auto'
      }}
      className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center pointer-events-none"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center glow-purple">
          <Sparkles className="text-white w-10 h-10" />
        </div>
        
        {/* Animated rings */}
        <motion.div
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 rounded-3xl border-2 border-primary"
        />
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 text-2xl font-bold tracking-widest"
      >
        QIVORA<span className="text-primary text-4xl leading-[0]">.</span>
      </motion.div>
      
      <div className="mt-4 w-48 h-1 bg-white/5 rounded-full overflow-hidden relative">
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-primary"
        />
      </div>
    </motion.div>
  )
}
