import { SectionHeading } from '../ui/SectionHeading'
import { GlassCard } from '../ui/GlassCard'
import { Quote, Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Computer Science Student',
    text: "The interface is simply breathtaking. It's the first time I've actually enjoyed taking an examination. The dark theme is so easy on the eyes.",
    avatar: 'SC'
  },
  {
    name: 'Marcus Thorne',
    role: 'Educator at EduTech',
    text: "Qivora's AI proctoring is lightyears ahead of the competition. It provides a fair environment without being intrusive for the students.",
    avatar: 'MT'
  },
  {
    name: 'Aisha Rahman',
    role: 'Graduate Applicant',
    text: "I love the instant analytics. Seeing exactly where I struggled helps me focus my revision much more effectively. Truly a game changer.",
    avatar: 'AR'
  }
]

export const Testimonials = () => {
  return (
    <section className="py-24 relative bg-background/50">
      <div className="container mx-auto px-4 sm:px-6">
        <SectionHeading 
          title="Loved by Students Worldwide" 
          subtitle="Join thousands of learners who are already experiencing the future of examinations."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <GlassCard key={i} delay={i * 0.1} className="relative pt-12">
              <div className="absolute top-6 left-6 text-primary/20">
                <Quote className="w-12 h-12 fill-current" />
              </div>
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                ))}
              </div>

              <p className="text-white/70 italic mb-8 relative z-10 leading-relaxed">
                "{t.text}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center font-bold text-white shadow-lg">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-bold">{t.name}</div>
                  <div className="text-xs text-white/40">{t.role}</div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}
