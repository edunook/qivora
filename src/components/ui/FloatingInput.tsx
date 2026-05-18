import React, { useState, useCallback } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, type = 'text', className = '', onChange, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [hasValue, setHasValue] = useState(Boolean(props.value || props.defaultValue))

    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      onFocus?.(e)
    }, [onFocus])

    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(Boolean(e.target.value))
      onBlur?.(e)
    }, [onBlur])

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(Boolean(e.target.value))
      onChange?.(e)
    }, [onChange])

    return (
      <div className="relative mb-4 w-full">
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={`w-full bg-white/5 border rounded-xl px-4 pt-6 pb-2 text-white outline-none transition-all duration-300 peer ${
              error 
                ? 'border-red-500/50 focus:border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                : 'border-white/10 focus:border-primary/50 focus:bg-white/10 shadow-[0_0_10px_rgba(139,92,246,0)] focus:shadow-[0_0_15px_rgba(139,92,246,0.15)]'
            } ${className}`}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
          <label
            className={`absolute left-4 transition-all duration-300 pointer-events-none ${
              isFocused || hasValue
                ? 'top-2 text-[10px] text-primary font-medium tracking-wider uppercase'
                : 'top-1/2 -translate-y-1/2 text-sm text-white/40'
            } ${error && (isFocused || hasValue) ? 'text-red-400' : ''}`}
          >
            {label}
          </label>

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error && (
          <p className="absolute -bottom-5 left-1 text-[10px] text-red-500 font-medium">
            {error}
          </p>
        )}
      </div>
    )
  }
)

FloatingInput.displayName = 'FloatingInput'
