import { Hero } from '../components/sections/Hero'
import { Features } from '../components/sections/Features'
import { Testimonials } from '../components/sections/Testimonials'
import { ExamPreview } from '../components/sections/ExamPreview'
import { motion } from 'framer-motion'

export const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col flex-1"
    >
      <Hero />
      <div className="py-12 bg-background relative z-10">
        <div className="container mx-auto px-4 sm:px-6 mb-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Experience the Interface</h2>
            <p className="text-white/60 text-sm sm:text-base">Get a taste of the most advanced examination environment.</p>
          </div>
        </div>
        <ExamPreview />
      </div>
      <Features />
      <Testimonials />
    </motion.div>
  )
}
