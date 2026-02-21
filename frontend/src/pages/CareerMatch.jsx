import React, { useState } from 'react';
import { Lightbulb, Sparkles, Star, Code, Rocket, Brain, ArrowRight, Briefcase, TrendingUp, Radar, LineChart, X, Target, Calendar, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';

export default function CareerMatch() {
  // State to handle which career modal is open
  const [selectedCareer, setSelectedCareer] = useState(null);

  const itemAnim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  return (
    <div className="flex flex-col gap-6 pb-4 max-w-7xl mx-auto w-full relative">
      
      {/* AI Insight Box */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        <GlassCard className="p-6 flex items-start gap-4 border-l-4 border-l-[#8c5bf5] relative overflow-hidden mt-2">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Lightbulb size={100} />
          </div>
          <div className="bg-[#8c5bf5]/20 p-3 rounded-full text-[#8c5bf5]">
            <Sparkles size={24} />
          </div>
          <div className="space-y-1 relative z-10">
            <h3 className="font-bold text-lg text-white">AI Recommendation Engine</h3>
            <p className="text-slate-300 leading-relaxed text-sm">
              Based on your recent quiz performance in <span className="text-[#8c5bf5] font-semibold">Python</span> and <span className="text-[#8c5bf5] font-semibold">Statistics</span>, your fit for Data Science has increased by <span className="inline-flex items-center text-emerald-400 font-bold">5% <TrendingUp size={14} className="ml-1"/></span>.
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Top 3 Careers Section */}
      <section className="space-y-6 mt-4">
        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
          <Star size={20} className="text-[#8c5bf5] fill-[#8c5bf5]" /> Top Career Matches
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Data Scientist */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
            <GlassCard className="p-6 relative group border-t-2 border-t-[#8c5bf5]/50 hover:border-t-[#8c5bf5] transition-all flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8c5bf5] to-[#4f46e5] flex items-center justify-center text-white shadow-lg shadow-[#8c5bf5]/20">
                  <Code size={28} />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-[#8c5bf5]">92%</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Fit Score</div>
                </div>
              </div>
              <h4 className="text-xl font-bold mb-1 text-white">Data Scientist</h4>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase">Low Risk</span>
                <span className="text-slate-500 text-xs font-medium">$120k - $180k</span>
              </div>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">Ideal path based on your strong analytical foundation and coding proficiency.</p>
              
              {/* TRIGGER MODAL HERE */}
              <button 
                onClick={() => setSelectedCareer({ title: 'Data Scientist', match: '92%', color: '#8c5bf5', time: '6-8 Months', salary: '$120k - $180k' })}
                className="mt-auto w-full py-3 rounded-full bg-gradient-to-r from-[#8c5bf5] to-[#4f46e5] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#8c5bf5]/30 hover:scale-[1.02] transition-all"
              >
                Simulate Future <Rocket size={16} />
              </button>
            </GlassCard>
          </motion.div>

          {/* Card 2: AI/ML Engineer */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <GlassCard className="p-6 flex flex-col h-full border-t-2 border-t-yellow-500/50 hover:border-t-yellow-500 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-500"><Brain size={28} /></div>
                <div className="text-right">
                  <div className="text-3xl font-black text-yellow-500">88%</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Fit Score</div>
                </div>
              </div>
              <h4 className="text-xl font-bold mb-1 text-white">AI/ML Engineer</h4>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase">Medium Risk</span>
                <span className="text-slate-500 text-xs font-medium">$130k - $200k</span>
              </div>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">Requires scaling your knowledge in deep learning frameworks and MLOps.</p>
              
              {/* TRIGGER MODAL HERE */}
              <button 
                onClick={() => setSelectedCareer({ title: 'AI/ML Engineer', match: '88%', color: '#eab308', time: '10-12 Months', salary: '$130k - $200k' })}
                className="mt-auto w-full py-3 rounded-full bg-[#1e1b2e] hover:bg-[#2a2640] border border-white/5 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all"
              >
                View Path <ArrowRight size={16} />
              </button>
            </GlassCard>
          </motion.div>

          {/* Card 3: Product Manager */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
            <GlassCard className="p-6 flex flex-col h-full border-t-2 border-t-rose-500/50 hover:border-t-rose-500 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-500"><Briefcase size={28} /></div>
                <div className="text-right">
                  <div className="text-3xl font-black text-rose-500">75%</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Fit Score</div>
                </div>
              </div>
              <h4 className="text-xl font-bold mb-1 text-white">Product Manager</h4>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase">High Risk</span>
                <span className="text-slate-500 text-xs font-medium">$100k - $160k</span>
              </div>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">Significant pivot required. Focus on stakeholder management and strategy skills.</p>
              
              {/* TRIGGER MODAL HERE */}
              <button 
                onClick={() => setSelectedCareer({ title: 'Product Manager', match: '75%', color: '#f43f5e', time: '14-16 Months', salary: '$100k - $160k' })}
                className="mt-auto w-full py-3 rounded-full bg-[#1e1b2e] hover:bg-[#2a2640] border border-white/5 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all"
              >
                View Path <ArrowRight size={16} />
              </button>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Skill Gap Analysis Section */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mt-10">
        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2 text-white">
            <Radar size={24} className="text-[#8c5bf5]" /> Skill Gap Analysis
          </h3>
          <p className="text-slate-400 leading-relaxed text-sm">
            Comparing your current expertise against the industry requirements for a <span className="text-white font-bold">Senior Data Scientist</span> role. The gaps highlighted in blue represent your immediate learning opportunities.
          </p>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#8c5bf5] to-[#4f46e5]"></div>
              <span className="text-sm font-semibold text-slate-200">Your Current Skills</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full bg-slate-700 border border-slate-500"></div>
              <span className="text-sm font-semibold text-slate-200">Role Requirement</span>
            </div>
          </div>
          <div className="pt-6 grid grid-cols-2 gap-4">
            <GlassCard className="p-4 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Python Proficiency</div>
              <div className="text-xl font-black text-white">Advanced</div>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Statistics Mastery</div>
              <div className="text-xl font-black text-white">Expert</div>
            </GlassCard>
          </div>
        </div>
        
        {/* Radar Chart Visual */}
        <div className="relative aspect-square flex items-center justify-center rounded-full border border-[#8c5bf5]/10" style={{ backgroundImage: 'radial-gradient(circle, rgba(140, 91, 245, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="w-full h-full rounded-full border border-[#8c5bf5]/20 scale-75"></div>
            <div className="absolute w-full h-full rounded-full border border-[#8c5bf5]/20 scale-50"></div>
            <div className="absolute w-full h-full rounded-full border border-[#8c5bf5]/20 scale-[0.25]"></div>
          </div>
          
          <span className="absolute top-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Python</span>
          <span className="absolute right-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">ML Ops</span>
          <span className="absolute bottom-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Leadership</span>
          <span className="absolute left-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Statistics</span>
          
          <motion.svg initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }} className="w-64 h-64 drop-shadow-[0_0_15px_rgba(140,91,245,0.4)] z-10" viewBox="0 0 100 100">
            <polygon fill="rgba(140, 91, 245, 0.4)" points="50,10 85,50 50,90 15,50" stroke="#8c5bf5" strokeWidth="1"></polygon>
            <polygon fill="none" opacity="0.6" points="50,25 70,50 50,75 30,50" stroke="white" strokeDasharray="2" strokeWidth="0.5"></polygon>
          </motion.svg>
          
          <div className="absolute flex flex-col items-center z-20">
            <LineChart size={40} className="text-[#8c5bf5] opacity-80" />
          </div>
        </div>
      </motion.div>

      {/* --- CAREER SIMULATION MODAL --- */}
      <AnimatePresence>
        {selectedCareer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0b1e]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl"
            >
              <GlassCard className="p-8 relative" style={{ borderTop: `4px solid ${selectedCareer.color}` }}>
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedCareer(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Target size={24} color={selectedCareer.color} />
                    <h2 className="text-3xl font-black text-white">{selectedCareer.title}</h2>
                  </div>
                  <p className="text-slate-400">Path Simulation based on your current Career DNA.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2 mb-1">
                      <TrendingUp size={14} color={selectedCareer.color} /> Match Score
                    </p>
                    <p className="text-2xl font-black" style={{ color: selectedCareer.color }}>{selectedCareer.match}</p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2 mb-1">
                      <Calendar size={14} color={selectedCareer.color} /> Est. Time
                    </p>
                    <p className="text-2xl font-black text-white">{selectedCareer.time}</p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl col-span-2">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2 mb-1">
                      <Award size={14} color={selectedCareer.color} /> Projected Salary Curve
                    </p>
                    <p className="text-2xl font-black text-white">{selectedCareer.salary}</p>
                  </div>
                </div>

                <div className="bg-[#8c5bf5]/10 border border-[#8c5bf5]/20 rounded-xl p-4 mb-8">
                  <p className="text-sm text-slate-300">
                    <span className="font-bold text-[#8c5bf5]">AI Note:</span> To reach this role, you need to focus heavily on <strong>System Design</strong> and <strong>Advanced Analytics</strong> over the next 3 months.
                  </p>
                </div>

                <button 
                  onClick={() => setSelectedCareer(null)}
                  className="w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all hover:brightness-110"
                  style={{ backgroundColor: selectedCareer.color }}
                >
                  Set as Target Goal & Update Roadmap
                </button>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}