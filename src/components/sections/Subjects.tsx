import { GlassCard } from '../ui/GlassCard'
import { SectionHeading } from '../ui/SectionHeading'
import { PremiumButton } from '../ui/PremiumButton'
import { 
  BookOpen, 
  Languages, 
  Globe2, 
  MoonStar, 
  Calculator, 
  FlaskConical,
  ArrowRight,
  Clock,
  HelpCircle,
  BarChart3
} from 'lucide-react'

const subjects = [
  {
    title: 'English',
    icon: BookOpen,
    color: 'from-blue-500 to-indigo-500',
    questions: 35,
    duration: '45 min',
    difficulty: 'Intermediate'
  },
  {
    title: 'Hindi',
    icon: Languages,
    color: 'from-orange-500 to-red-500',
    questions: 35,
    duration: '45 min',
    difficulty: 'Easy'
  },
  {
    title: 'GK',
    icon: Globe2,
    color: 'from-green-500 to-emerald-500',
    questions: 35,
    duration: '30 min',
    difficulty: 'Medium'
  },
  {
    title: 'Islamic Studies',
    icon: MoonStar,
    color: 'from-purple-500 to-pink-500',
    questions: 35,
    duration: '40 min',
    difficulty: 'Medium'
  },
  {
    title: 'Maths',
    icon: Calculator,
    color: 'from-yellow-500 to-orange-500',
    questions: 35,
    duration: '60 min',
    difficulty: 'Hard'
  },
  {
    title: 'Science',
    icon: FlaskConical,
    color: 'from-cyan-500 to-blue-500',
    questions: 35,
    duration: '50 min',
    difficulty: 'Advanced'
  }
]

export const Subjects = () => {
  return (
    <section id="subjects" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <SectionHeading 
          title="Explore Subjects" 
          subtitle="Choose from our wide range of carefully curated examination subjects designed to challenge and grow your knowledge."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {subjects.map((subject, i) => (
            <GlassCard key={subject.title} delay={i * 0.1} className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-8">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <subject.icon className="text-white w-7 h-7" />
                </div>
                <div className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                  {subject.difficulty}
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-4">{subject.title}</h3>
              
              <div className="space-y-4 mb-8 flex-grow">
                <div className="flex items-center gap-3 text-white/50 text-sm">
                  <HelpCircle className="w-4 h-4" />
                  <span>{subject.questions} Questions</span>
                </div>
                <div className="flex items-center gap-3 text-white/50 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{subject.duration}</span>
                </div>
                <div className="flex items-center gap-3 text-white/50 text-sm">
                  <BarChart3 className="w-4 h-4" />
                  <span>Global Ranking Active</span>
                </div>
              </div>

              <PremiumButton variant="outline" className="w-full group/btn">
                Start Exam <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </PremiumButton>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}
