import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { SectionHeading } from '../components/ui/SectionHeading'
import { GlassCard } from '../components/ui/GlassCard'
import { PremiumButton } from '../components/ui/PremiumButton'
import { Clock, HelpCircle, Star, Users, ArrowRight, Loader2 } from 'lucide-react'
import { useExamStore } from '../store/examStore'

const SUBJECTS = ['All Subjects', 'Computer Science', 'Physics', 'Mathematics', 'History', 'Other']

export const ExploreExams = () => {
  const { exams, getPublicExams, isLoading } = useExamStore()
  const [activeFilter, setActiveFilter] = useState('All Subjects')

  useEffect(() => {
    getPublicExams(activeFilter)
  }, [activeFilter, getPublicExams])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 sm:px-6 py-12"
    >
      <SectionHeading 
        title="Explore Public Exams" 
        subtitle="Discover and attempt thousands of premium examinations created by top educators and institutions worldwide."
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-12 items-center justify-center">
        {SUBJECTS.map((filter) => (
          <button 
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all ${
              activeFilter === filter 
                ? 'bg-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]' 
                : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-20 text-white/50">
          <p className="text-xl">No exams found for this subject.</p>
          <p className="text-sm mt-2">Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {exams.map((exam, i) => (
            <GlassCard key={exam._id} delay={i * 0.1} className="flex flex-col h-full p-6 sm:p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="text-xs font-bold px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
                  {exam.subject}
                </div>
                <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold bg-yellow-500/10 px-2 py-1 rounded-lg">
                  <Star className="w-3 h-3 fill-current" /> {exam.rating.toFixed(1)}
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold mb-2 leading-tight">{exam.title}</h3>
              
              <div className="flex items-center gap-2 text-white/50 text-xs sm:text-sm mb-6">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10 shrink-0">
                  <img src={exam.creator.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${exam.creator.name}`} alt={exam.creator.name} className="w-full h-full object-cover" />
                </div>
                <span>{exam.creator.name}</span>
              </div>
              
              <div className="space-y-3 mb-8 flex-grow">
                <div className="flex items-center justify-between text-white/60 text-sm">
                  <div className="flex items-center gap-2"><HelpCircle className="w-4 h-4" /> {exam.questions.length} Questions</div>
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {exam.duration} mins</div>
                </div>
                <div className="flex items-center justify-between text-white/60 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      exam.difficulty === 'Beginner' ? 'bg-green-500' :
                      exam.difficulty === 'Intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} /> 
                    {exam.difficulty}
                  </div>
                  <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {exam.attempts} attempts</div>
                </div>
              </div>

              <Link to={`/exam/${exam._id}`} className="w-full">
                <PremiumButton className="w-full group/btn">
                  Start Exam <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </PremiumButton>
              </Link>
            </GlassCard>
          ))}
        </div>
      )}
    </motion.div>
  )
}
