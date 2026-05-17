import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hoverGlow?: boolean
  delay?: number
}

export const GlassCard = ({ 
  children, 
  className, 
  hoverGlow = true,
  delay = 0 
}: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      whileHover={hoverGlow ? { y: -5, transition: { duration: 0.3 } } : {}}
      className={cn(
        'glass-card p-6 overflow-hidden relative group',
        className
      )}
    >
      {/* Subtle inner glow on hover */}
      {hoverGlow && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
