import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export const PremiumButton = ({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  disabled,
  ...props 
}: any) => {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20',
    secondary: 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm',
    outline: 'border border-white/20 text-white hover:bg-white/5 hover:border-white/40',
    ghost: 'text-white/70 hover:text-white hover:bg-white/5',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg font-semibold',
  }

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      disabled={disabled}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full transition-all duration-300',
        variants[variant as keyof typeof variants] || variants.primary,
        sizes[size as keyof typeof sizes] || sizes.md,
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {variant === 'primary' && !disabled && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent-purple opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}
    </motion.button>
  )
}
