import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '../ui/GlassCard'
import { SectionHeading } from '../ui/SectionHeading'
import { PremiumButton } from '../ui/PremiumButton'
import { Clock, ChevronLeft, ChevronRight, AlertCircle, ShieldCheck } from 'lucide-react'

export const ExamPreview = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  
  const options = [
    "Quantum computing utilizes bits like traditional computers.",
    "Quantum computing uses qubits which can exist in multiple states.",
    "Quantum computers are just faster versions of current laptops.",
    "Quantum computing is only useful for basic arithmetic."
  ]

  return (
    <section className="py-24 relative bg-primary/5">
      <div className="container mx-auto px-6">
        <SectionHeading 
          title="Premium Exam Interface" 
          subtitle="A clutter-free, immersive experience designed to keep students focused and engaged."
        />

        <div className="max-w-5xl mx-auto">
          <GlassCard className="p-0 border-white/20 overflow-hidden shadow-2xl" hoverGlow={false}>
            {/* Header / Info Bar */}
            <div className="bg-white/5 border-b border-white/10 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                <div className="flex items-center gap-2 text-primary font-bold text-xs sm:text-sm md:text-base">
                  <ShieldCheck className="w-4 h-4 sm:w-5 h-5" />
                  <span>SECURE MODE</span>
                </div>
                <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />
                <div className="text-white/80 text-xs sm:text-sm">Subject: <span className="font-semibold text-white">Science & Tech</span></div>
              </div>
              
              <div className="flex items-center gap-3 sm:gap-6">
                <div className="flex items-center gap-2 text-accent-purple font-mono bg-accent-purple/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl">
                  <Clock className="w-4 h-4 sm:w-5 h-5" />
                  <span className="text-sm sm:text-lg md:text-xl">44:52</span>
                </div>
                <PremiumButton variant="primary" size="sm" className="bg-red-500/80 hover:bg-red-600 text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2">Finish</PremiumButton>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-white/5 relative">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: '40%' }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent-cyan shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
              />
            </div>

            <div className="p-4 sm:p-8 md:p-12">
              <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-8">
                <span className="text-primary font-bold text-sm sm:text-lg">Question 14</span>
                <span className="text-white/30 text-xs sm:text-sm">of 35</span>
              </div>

              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-12 leading-tight">
                Which of the following best describes the fundamental principle of Quantum Computing?
              </h2>

              <div className="grid gap-3 sm:gap-4 mb-6 sm:mb-12">
                {options.map((option, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setSelectedOption(i)}
                    whileHover={{ x: 10 }}
                    className={`w-full text-left p-4 sm:p-6 rounded-xl sm:rounded-2xl border transition-all duration-300 flex items-center justify-between group ${
                      selectedOption === i 
                        ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(139,92,246,0.2)]' 
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 pr-2">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm transition-colors shrink-0 ${
                        selectedOption === i ? 'bg-primary text-white' : 'bg-white/10 text-white/50 group-hover:bg-white/20'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className={`text-xs sm:text-sm md:text-base leading-snug ${selectedOption === i ? 'text-white font-medium' : 'text-white/70'}`}>{option}</span>
                    </div>
                    {selectedOption === i && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary shrink-0" />
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-white/5 pt-6">
                <button className="flex items-center justify-center gap-2 text-white/50 hover:text-white transition-colors text-sm sm:text-base w-full sm:w-auto py-2">
                  <ChevronLeft className="w-4 h-4 sm:w-5 h-5" /> Previous
                </button>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 text-xs sm:text-sm font-medium">Mark for Review</button>
                  <PremiumButton className="w-full sm:w-auto gap-2 text-xs sm:text-sm py-2.5 sm:py-3">
                    Next Question <ChevronRight className="w-4 h-4 sm:w-5 h-5" />
                  </PremiumButton>
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-8 text-white/40 text-xs sm:text-sm text-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" /> Web-Cam Monitoring Active
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> Full-Screen Mode Locked
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" /> Tab Switching Forbidden
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
