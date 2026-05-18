import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload, Camera } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { FloatingInput } from '../../components/ui/FloatingInput'
import { PremiumButton } from '../../components/ui/PremiumButton'

const signUpSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type SignUpForm = z.infer<typeof signUpSchema>

export const SignUp = () => {
  const navigate = useNavigate()
  const { register: registerUser, isLoading, isError, isSuccess, message, reset, user } = useAuthStore()
  
  // Mock profile picture state
  const [profilePicUrl, _setProfilePicUrl] = useState<string>('https://api.dicebear.com/7.x/avataaars/svg?seed=qivora')

  const { register, handleSubmit, formState: { errors } } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema)
  })

  // Clear stale errors when mounting signup page
  useEffect(() => {
    reset()
  }, [reset])

  useEffect(() => {
    if (isSuccess) {
      navigate('/dashboard')
      reset()
    } else if (user) {
      navigate('/dashboard')
    }
  }, [isSuccess, user, navigate, reset])

  const onSubmit = (data: SignUpForm) => {
    // Inject the mock profile picture into the data before sending to backend
    registerUser({ ...data, profilePicture: profilePicUrl })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Create Account</h2>
        <p className="text-white/50">Join Qivora and revolutionize your examinations.</p>
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

      {/* Mock Profile Picture Upload */}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary/50 transition-colors">
            <img src={profilePicUrl} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-background">
            <Upload className="w-4 h-4 text-white" />
          </div>
        </div>
        <span className="text-xs text-white/40 mt-3 font-medium tracking-wide">Upload Avatar (Mock)</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FloatingInput 
            label="Full Name" 
            error={errors.name?.message}
            {...register('name')}
          />
          <FloatingInput 
            label="Username" 
            error={errors.username?.message}
            {...register('username')}
          />
        </div>

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

        <FloatingInput 
          label="Confirm Password" 
          type="password" 
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <PremiumButton type="submit" className="w-full mt-8 py-4 text-base" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Account'}
        </PremiumButton>
      </form>

      <p className="mt-8 text-center text-sm text-white/50">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-bold hover:text-white transition-colors">
          Sign In
        </Link>
      </p>
    </motion.div>
  )
}
