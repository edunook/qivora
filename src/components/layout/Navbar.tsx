import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { PremiumButton } from '../ui/PremiumButton'
import { Menu, X, Sparkles, User, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Explore Exams', href: '/explore' },
    { name: 'Create Exam', href: '/create' },
    { name: 'Dashboard', href: '/dashboard' },
  ]

  if (user && user.role === 'admin') {
    navLinks.push({ name: 'Admin Control', href: '/admin' })
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'py-4' : 'py-6'
      }`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className={`relative glass rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between transition-all duration-500 ${
            isScrolled ? 'bg-black/40 backdrop-blur-md border-white/10' : 'bg-transparent border-transparent'
          }`}>
            {/* Logo */}
            <Link to="/">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1.5 sm:gap-2"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center glow-purple shrink-0">
                  <Sparkles className="text-white w-4.5 h-4.5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-lg sm:text-2xl font-bold tracking-tighter text-white">
                  Qivora<span className="text-primary">.</span>
                </span>
              </motion.div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={link.href}
                    className="text-sm font-medium text-white/70 hover:text-white transition-colors relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                      <User className="w-4 h-4" />
                    </div>
                    <span>{user.name.split(' ')[0]}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-white/50 hover:text-red-500 transition-colors p-2"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-bold text-white hover:text-primary transition-colors px-4">
                    Login
                  </Link>
                  <Link to="/signup">
                    <PremiumButton size="sm">Sign Up</PremiumButton>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-white p-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass mt-2 mx-4 sm:mx-6 rounded-3xl overflow-hidden"
            >
              <div className="p-6 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-lg font-medium text-white/80 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                <hr className="border-white/10" />
                <div className="flex flex-col gap-3">
                  {user ? (
                    <PremiumButton onClick={handleLogout} className="bg-red-500/20 text-red-500 border-red-500/30">
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </PremiumButton>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <PremiumButton variant="outline" className="w-full">Login</PremiumButton>
                      </Link>
                      <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                        <PremiumButton className="w-full">Sign Up</PremiumButton>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}
