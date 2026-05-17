import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { FloatingInput } from '../../components/ui/FloatingInput'
import { PremiumButton } from '../../components/ui/PremiumButton'
import axios from 'axios'
import { API_BASE_URL } from '../../lib/api'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email')
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true)
    setError('')
    try {
      await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, data)
      setIsSuccess(true)
    } catch (err: any) {
      const message =
        (err.response && err.response.data && err.response.data.message) ||
        err.message || 'Something went wrong'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Reset Password</h2>
              <p className="text-white/50">Enter your email address and we'll send you a link to reset your password.</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FloatingInput 
                label="Email Address" 
                type="email" 
                error={errors.email?.message}
                {...register('email')}
              />

              <PremiumButton type="submit" className="w-full mt-6 py-4 text-base" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Send Reset Link'}
              </PremiumButton>
            </form>

            <p className="mt-8 text-center text-sm text-white/50">
              Remember your password?{' '}
              <Link to="/login" className="text-primary font-bold hover:text-white transition-colors">
                Sign In
              </Link>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6 border border-green-500/30"
            >
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-4">Check your email</h2>
            <p className="text-white/60 mb-8 max-w-sm mx-auto">
              We've sent a password reset link to your email address. Please check your inbox. The link expires in 15 minutes.
            </p>
            <Link to="/login">
              <PremiumButton variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </PremiumButton>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
