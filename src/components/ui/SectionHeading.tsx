import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface SectionHeadingProps {
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  className?: string
}

export const SectionHeading = ({ 
  title, 
  subtitle, 
  align = 'center',
  className 
}: SectionHeadingProps) => {
  return (
    <div className={cn(
      'mb-16',
      align === 'center' ? 'text-center' : 'text-left',
      className
    )}>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-white/60 text-sm sm:text-base md:text-lg max-w-2xl mx-auto"
        >
          {subtitle}
        </motion.p>
      )}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 1 }}
        className={cn(
          "h-1 w-24 bg-primary rounded-full mt-6",
          align === 'center' ? "mx-auto" : ""
        )}
      />
    </div>
  )
}
