import { SectionHeading } from '../ui/SectionHeading'
import { GlassCard } from '../ui/GlassCard'
import { 
  Zap, 
  Shield, 
  Cpu, 
  BarChart, 
  Smartphone, 
  Trophy, 
  Cloud, 
  Timer,
  Lock,
  Globe
} from 'lucide-react'

const features = [
  {
    title: 'AI-Powered Proctoring',
    desc: 'Advanced facial recognition and behavior analysis ensure 100% integrity during examinations.',
    icon: Cpu,
    color: 'text-primary'
  },
  {
    title: 'Secure Environment',
    desc: 'Military-grade encryption and browser locking prevent any unauthorized access or cheating.',
    icon: Shield,
    color: 'text-accent-blue'
  },
  {
    title: 'Real-time Analytics',
    desc: 'Get deep insights into student performance with heatmaps and granular difficulty analysis.',
    icon: BarChart,
    color: 'text-accent-purple'
  },
  {
    title: 'Instant Results',
    desc: 'No more waiting. Results are calculated and delivered the second the timer hits zero.',
    icon: Zap,
    color: 'text-yellow-500'
  },
  {
    title: 'Mobile First',
    desc: 'Seamlessly transition between devices with our ultra-responsive premium mobile interface.',
    icon: Smartphone,
    color: 'text-accent-cyan'
  },
  {
    title: 'Global Leaderboards',
    desc: 'Compete with the best minds globally and track your percentile rank in real-time.',
    icon: Trophy,
    color: 'text-orange-500'
  }
]

export const Features = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6">
        <SectionHeading 
          title="Engineered for Excellence" 
          subtitle="Qivora combines cutting-edge AI with a premium user experience to redefine online examinations."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <GlassCard key={feature.title} delay={i * 0.1} className="p-6 sm:p-8">
              <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-white/50 leading-relaxed text-sm">
                {feature.desc}
              </p>
            </GlassCard>
          ))}
        </div>

        {/* Bonus Bento-style feature */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassCard delay={0.6} className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
              <div className="flex-1 text-center md:text-left w-full">
                <div className="inline-block p-1 px-3 rounded-full bg-primary/20 text-primary text-[10px] sm:text-xs font-bold mb-4">NEW FEATURE</div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Cloud-Sync Architecture</h3>
                <p className="text-white/60 mb-6 text-sm leading-relaxed">Never lose your progress. Our resilient cloud infrastructure saves every answer in real-time, even during network failures.</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2">
                  <div className="flex items-center gap-2 text-white/40 text-xs"><Cloud className="w-4 h-4" /> 100% Reliability</div>
                  <div className="flex items-center gap-2 text-white/40 text-xs"><Timer className="w-4 h-4" /> 0ms Latency</div>
                </div>
              </div>
              <div className="w-full md:w-48 h-36 md:h-48 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center glow-purple shrink-0">
                 <Globe className="w-16 h-16 md:w-24 md:h-24 text-primary opacity-50" />
              </div>
            </div>
          </GlassCard>
          
          <GlassCard delay={0.7} className="bg-gradient-to-br from-accent-cyan/10 to-transparent border-accent-cyan/20 p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
              <div className="flex-1 text-center md:text-left w-full">
                <div className="inline-block p-1 px-3 rounded-full bg-accent-cyan/20 text-accent-cyan text-[10px] sm:text-xs font-bold mb-4">ENTERPRISE GRADE</div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Advanced Security</h3>
                <p className="text-white/60 mb-6 text-sm leading-relaxed">Encryption that exceeds industry standards. We protect student data with end-to-end multi-layer security protocols.</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2">
                  <div className="flex items-center gap-2 text-white/40 text-xs"><Lock className="w-4 h-4" /> AES-256</div>
                  <div className="flex items-center gap-2 text-white/40 text-xs"><Shield className="w-4 h-4" /> SOC2 Compliant</div>
                </div>
              </div>
              <div className="w-full md:w-48 h-36 md:h-48 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center glow-cyan shrink-0">
                 <Shield className="w-16 h-16 md:w-24 md:h-24 text-accent-cyan opacity-50" />
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  )
}
