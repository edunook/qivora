import { motion } from 'framer-motion'
import { GlassCard } from '../ui/GlassCard'
import { SectionHeading } from '../ui/SectionHeading'
import { 
  History, 
  ChevronRight,
  Award
} from 'lucide-react'

export const DashboardPreview = () => {
  return (
    <section id="dashboard" className="py-24 relative overflow-hidden bg-background">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-purple/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6">
        <SectionHeading 
          title="Student Intelligence Hub" 
          subtitle="Track your growth with beautiful, data-driven analytics that help you identify strengths and master every subject."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analytics Card */}
          <GlassCard className="lg:col-span-2 p-4 sm:p-8" hoverGlow={false}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold">Performance Analytics</h3>
                <p className="text-white/40 text-xs sm:text-sm">Monthly progression overview</p>
              </div>
              <div className="flex gap-1.5 self-start sm:self-auto">
                {['Week', 'Month', 'Year'].map((tab) => (
                  <button key={tab} className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${
                    tab === 'Month' ? 'bg-primary/20 text-primary' : 'text-white/40 hover:text-white'
                  }`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Mock Chart Area */}
            <div className="h-[250px] sm:h-[300px] w-full flex items-end gap-1 sm:gap-2 mb-8">
              {[60, 45, 75, 50, 90, 65, 80, 55, 95, 70, 85, 90].map((height, i) => (
                <div key={i} className="flex-1 group relative">
                  <motion.div 
                    initial={{ height: 0 }}
                    whileInView={{ height: `${height}%` }}
                    transition={{ duration: 1, delay: i * 0.05 }}
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      i === 8 ? 'bg-primary' : 'bg-white/10 group-hover:bg-white/20'
                    }`}
                  />
                  {i === 8 && (
                    <div className="absolute -top-8 sm:-top-10 left-1/2 -translate-x-1/2 glass px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-bold">
                      95%
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-8 border-t border-white/10 text-center sm:text-left">
              <div>
                <div className="text-white/40 text-xs sm:text-sm mb-1">Total Exams</div>
                <div className="text-2xl sm:text-3xl font-bold flex items-center justify-center sm:justify-start gap-2">
                  128 <span className="text-green-500 text-xs font-normal">+12%</span>
                </div>
              </div>
              <div>
                <div className="text-white/40 text-xs sm:text-sm mb-1">Avg. Accuracy</div>
                <div className="text-2xl sm:text-3xl font-bold">84.2%</div>
              </div>
              <div>
                <div className="text-white/40 text-xs sm:text-sm mb-1">Study Hours</div>
                <div className="text-2xl sm:text-3xl font-bold">342h</div>
              </div>
            </div>
          </GlassCard>

          {/* Side Stats */}
          <div className="flex flex-col gap-8">
            <GlassCard className="p-4 sm:p-6 bg-gradient-to-br from-primary/20 to-transparent border-primary/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/20 rounded-xl"><Award className="text-primary w-6 h-6" /></div>
                <div>
                  <div className="text-xs text-white/50 uppercase tracking-widest font-bold">Global Rank</div>
                  <div className="text-2xl font-bold">#42 <span className="text-white/40 text-sm font-normal">of 15k</span></div>
                </div>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   whileInView={{ width: '92%' }}
                   className="h-full bg-primary" 
                />
              </div>
              <div className="mt-2 text-[10px] text-white/30 text-right">Top 2% Globally</div>
            </GlassCard>

            <GlassCard className="p-4 sm:p-6">
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-accent-cyan" /> Recent Results
              </h4>
              <div className="space-y-4">
                {[
                  { sub: 'Science', score: '34/35', date: '2h ago', status: 'Passed' },
                  { sub: 'Maths', score: '28/35', date: 'Yesterday', status: 'Passed' },
                  { sub: 'English', score: '35/35', date: '3 days ago', status: 'Perfect' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors">
                    <div>
                      <div className="text-sm font-semibold">{item.sub}</div>
                      <div className="text-[10px] text-white/40">{item.date}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${item.status === 'Perfect' ? 'text-primary' : 'text-accent-cyan'}`}>{item.score}</div>
                      <div className="text-[10px] text-white/40">{item.status}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 text-xs text-white/40 hover:text-white flex items-center justify-center gap-1 transition-colors">
                View all history <ChevronRight className="w-3 h-3" />
              </button>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  )
}
