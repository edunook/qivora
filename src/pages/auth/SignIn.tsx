import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { FloatingInput } from '../../components/ui/FloatingInput'
import { PremiumButton } from '../../components/ui/PremiumButton'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required')
})

type SignInForm = z.infer<typeof signInSchema>

export const SignIn = () => {
  const navigate = useNavigate()
  const { login, isLoading, isError, isSuccess, message, reset, user } = useAuthStore()

  const { register, handleSubmit, formState: { errors } } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema)
  })

  useEffect(() => {
    if (isSuccess || user) {
      navigate('/dashboard')
      reset()
    }
  }, [isSuccess, user, navigate, reset])

  const onSubmit = (data: SignInForm) => {
    login(data)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
        <p className="text-white/50">Enter your credentials to access your account.</p>
      </div>

      {isError && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center"
        >
          {message}
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <FloatingInput 
          label="Email Address" 
          type="email" 
          error={errors.email?.message}
          {...register('email')}
        />

        <FloatingInput 
          label="Password" 
          type="password" 
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between mt-6 mb-8">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center w-4 h-4">
              <input type="checkbox" className="peer sr-only" />
              <div className="w-4 h-4 border border-white/20 rounded bg-white/5 peer-checked:bg-primary peer-checked:border-primary transition-all" />
              <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span className="text-sm text-white/50 group-hover:text-white transition-colors">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-primary hover:text-white transition-colors font-medium">
            Forgot Password?
          </Link>
        </div>

        <PremiumButton type="submit" className="w-full py-4 text-base" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Sign In'}
        </PremiumButton>
      </form>

      <div className="mt-8 flex items-center gap-4">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/30 uppercase tracking-widest font-bold">Or continue with</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <button type="button" className="mt-8 w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3 font-medium group">
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google
      </button>

      <p className="mt-10 text-center text-sm text-white/50">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary font-bold hover:text-white transition-colors">
          Sign Up
        </Link>
      </p>
    </motion.div>
  )
}
