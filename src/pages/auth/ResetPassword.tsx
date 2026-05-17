import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { FloatingInput } from '../../components/ui/FloatingInput'
import { PremiumButton } from '../../components/ui/PremiumButton'
import axios from 'axios'
import { API_BASE_URL } from '../../lib/api'

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export const ResetPassword = () => {
  const { token } = useParams<{ token: string }>()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema)
  })

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true)
    setError('')
    try {
      await axios.post(`${API_BASE_URL}/api/auth/reset-password/${token}`, {
        password: data.password
      })
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
              <h2 className="text-3xl font-bold mb-2">Set New Password</h2>
              <p className="text-white/50">Enter your new password below.</p>
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
              <FloatingInput 
                label="New Password" 
                type="password" 
                error={errors.password?.message}
                {...register('password')}
              />

              <FloatingInput 
                label="Confirm New Password" 
                type="password" 
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <PremiumButton type="submit" className="w-full mt-6 py-4 text-base" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Reset Password'}
              </PremiumButton>
            </form>
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
            <h2 className="text-3xl font-bold mb-4">Password Updated!</h2>
            <p className="text-white/60 mb-8 max-w-sm mx-auto">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <Link to="/login">
              <PremiumButton className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Go to Sign In
              </PremiumButton>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
