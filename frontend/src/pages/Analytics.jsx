import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Hexagon, LineChart, Calendar, Target, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { analyticsAPI } from '../services/api';

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('1M');

  // Generate the random GitHub-style heatmap data
  const heatmapData = useMemo(() => {
    const colors = ['bg-white/5', 'bg-[#8c5bf5]/10', 'bg-[#8c5bf5]/30', 'bg-[#8c5bf5]/60', 'bg-[#8c5bf5]/90'];
    return Array.from({ length: 52 }, () => 
      Array.from({ length: 7 }, () => colors[Math.floor(Math.random() * colors.length)])
    );
  }, []);

  const itemAnim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await analyticsAPI.getAnalyticsByPeriod(selectedPeriod);
        setAnalyticsData(response.data);
      } catch (err) {
        setError('Failed to load analytics data');
        console.error(err);
        // Set fallback data
        setAnalyticsData({
          marketValue: 164500,
          marketValueChange: 12.4,
          skillPercentile: 'Top 4.2%',
          skillPercentileChange: 0.8,
          interviewReadiness: 92,
          interviewReadinessChange: 5.2,
          contributionLog: 4281,
          targetRole: 'Staff AI Engineer @ FAANG+',
          estimatedBreakthrough: 'Q3 2025',
          skillCompetencies: {
            'ML/AI': 85,
            'Python': 78,
            'Stats': 88,
            'SQL': 72,
            'Comm': 81
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedPeriod]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#8c5bf5]/20 border-t-[#8c5bf5] rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="max-w-7xl mx-auto w-full pb-10">
        <GlassCard className="p-6 border border-red-500/30 bg-red-500/5">
          <p className="text-red-400 font-medium">{error || 'Failed to load analytics'}</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full pb-10">
      
      {/* Top Header */}
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 mt-2">
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-1 text-white">Career Trajectory <span className="text-[#8c5bf5]">Intelligence</span></h2>
          <p className="text-slate-400 font-medium italic">Predictive modeling based on current skill velocity.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
          {['7D', '1M', '6M', '1Y'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
                selectedPeriod === period
                  ? 'bg-[#8c5bf5] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {period}
            </button>
          ))}
          <div className="h-4 w-px bg-white/10 mx-1"></div>
          <button className="flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors">
            <Download size={14} /> Export
          </button>
        </div>
      </motion.header>

      {/* Stats Grid */}
      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <motion.div variants={itemAnim}>
          <GlassCard className="p-6 !rounded-3xl relative overflow-hidden group h-full">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#8c5bf5]/10 rounded-full blur-2xl group-hover:bg-[#8c5bf5]/20 transition-all"></div>
            <p className="text-sm font-semibold text-slate-400 mb-1">Current Market Value</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-white">${analyticsData.marketValue?.toLocaleString()}</h3>
              <span className="text-emerald-400 text-sm font-bold flex items-center">+{analyticsData.marketValueChange}% <TrendingUp size={14} className="ml-1" /></span>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemAnim}>
          <GlassCard className="p-6 !rounded-3xl relative overflow-hidden group h-full">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#8c5bf5]/10 rounded-full blur-2xl group-hover:bg-[#8c5bf5]/20 transition-all"></div>
            <p className="text-sm font-semibold text-slate-400 mb-1">Global Skill Percentile</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-white">{analyticsData.skillPercentile}</h3>
              <span className="text-emerald-400 text-sm font-bold flex items-center">+{analyticsData.skillPercentileChange}% <TrendingUp size={14} className="ml-1" /></span>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemAnim}>
          <GlassCard className="p-6 !rounded-3xl relative overflow-hidden group h-full">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#8c5bf5]/10 rounded-full blur-2xl group-hover:bg-[#8c5bf5]/20 transition-all"></div>
            <p className="text-sm font-semibold text-slate-400 mb-1">Interview Readiness</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-white">{analyticsData.interviewReadiness}%</h3>
              <span className="text-emerald-400 text-sm font-bold flex items-center">+{analyticsData.interviewReadinessChange}% <TrendingUp size={14} className="ml-1" /></span>
            </div>
          </GlassCard>
        </motion.div>

      </motion.div>

      {/* Main Charts Grid */}
      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Skill Radar Chart */}
        <motion.div variants={itemAnim} className="lg:col-span-4">
          <GlassCard className="p-6 !rounded-3xl flex flex-col justify-between h-full min-h-[400px]">
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
              <Hexagon className="text-[#8c5bf5]" size={20} /> Skill Competencies
            </h4>
            <div className="flex-1 flex items-center justify-center relative">
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Background Circles */}
                <div className="absolute inset-0 rounded-full border border-white/5"></div>
                <div className="absolute inset-[20%] rounded-full border border-white/5"></div>
                <div className="absolute inset-[40%] rounded-full border border-white/5"></div>
                <div className="absolute inset-[60%] rounded-full border border-white/5"></div>
                <div className="absolute inset-[80%] rounded-full border border-white/5"></div>
                
                {/* Radial Lines */}
                <div className="absolute h-full w-px bg-white/10 rotate-0"></div>
                <div className="absolute h-full w-px bg-white/10 rotate-[72deg]"></div>
                <div className="absolute h-full w-px bg-white/10 rotate-[144deg]"></div>
                <div className="absolute h-full w-px bg-white/10 rotate-[216deg]"></div>
                <div className="absolute h-full w-px bg-white/10 rotate-[288deg]"></div>
                
                {/* Radar Polygon */}
                <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_15px_rgba(140,91,245,0.4)]" viewBox="0 0 100 100">
                  <polygon fill="rgba(140, 91, 245, 0.3)" stroke="#8c5bf5" strokeWidth="2" points="50,10 85,38 72,82 28,82 15,38"></polygon>
                  <circle cx="50" cy="10" fill="#8c5bf5" r="1.5"></circle>
                  <circle cx="85" cy="38" fill="#8c5bf5" r="1.5"></circle>
                  <circle cx="72" cy="82" fill="#8c5bf5" r="1.5"></circle>
                  <circle cx="28" cy="82" fill="#8c5bf5" r="1.5"></circle>
                  <circle cx="15" cy="38" fill="#8c5bf5" r="1.5"></circle>
                </svg>
                
                {/* Labels */}
                <span className="absolute -top-4 text-[10px] font-bold text-slate-400">ML/AI</span>
                <span className="absolute top-[32%] -right-10 text-[10px] font-bold text-slate-400">PYTHON</span>
                <span className="absolute bottom-1 -right-4 text-[10px] font-bold text-slate-400">STATS</span>
                <span className="absolute bottom-1 -left-4 text-[10px] font-bold text-slate-400">SQL</span>
                <span className="absolute top-[32%] -left-10 text-[10px] font-bold text-slate-400">COMM</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* XP Growth Chart */}
        <motion.div variants={itemAnim} className="lg:col-span-8">
          <GlassCard className="p-6 !rounded-3xl min-h-[400px] flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-lg font-bold flex items-center gap-2 text-white">
                <LineChart className="text-[#8c5bf5]" size={20} /> XP Accumulation Trend
              </h4>
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#8c5bf5]"></div>Your Velocity</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-white/10"></div>Benchmark</div>
              </div>
            </div>
            
            <div className="flex-1 relative mt-4">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 240">
                {/* Grid */}
                <line x1="0" y1="240" x2="800" y2="240" stroke="rgba(255,255,255,0.05)" strokeWidth="1"></line>
                <line x1="0" y1="180" x2="800" y2="180" stroke="rgba(255,255,255,0.05)" strokeWidth="1"></line>
                <line x1="0" y1="120" x2="800" y2="120" stroke="rgba(255,255,255,0.05)" strokeWidth="1"></line>
                <line x1="0" y1="60" x2="800" y2="60" stroke="rgba(255,255,255,0.05)" strokeWidth="1"></line>
                
                {/* Gradients & Paths */}
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8c5bf5" stopOpacity="0.3"></stop>
                    <stop offset="100%" stopColor="#8c5bf5" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <path d="M0,220 C100,210 200,180 300,160 C400,140 500,80 600,60 C700,40 800,20 L800,240 L0,240 Z" fill="url(#areaGradient)"></path>
                <path d="M0,220 C100,210 200,180 300,160 C400,140 500,80 600,60 C700,40 800,20" fill="none" stroke="#8c5bf5" strokeWidth="3" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px rgba(140, 91, 245, 0.5))' }}></path>
                <path d="M0,230 C150,220 300,200 450,180 C600,160 750,140 800,135" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="8,4"></path>
              </svg>
              
              <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-500 tracking-tighter uppercase">
                <span>Week 01</span><span>Week 04</span><span>Week 08</span><span>Week 12</span><span>Current</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Consistency Heatmap */}
        <motion.div variants={itemAnim} className="lg:col-span-12">
          <GlassCard className="p-6 !rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold flex items-center gap-2 text-white">
                <Calendar className="text-[#8c5bf5]" size={20} /> Intelligence Contributions
              </h4>
              <div className="text-sm font-medium text-slate-500">{analyticsData.contributionLog?.toLocaleString()} actions in the last year</div>
            </div>
            
            <div className="flex flex-col gap-2 overflow-x-auto pb-2">
              <div className="flex gap-1 min-w-max">
                {heatmapData.map((week, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    {week.map((colorClass, j) => (
                      <div key={j} className={`w-3 h-3 rounded-[2px] ${colorClass}`}></div>
                    ))}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between mt-2 min-w-max">
                <div className="flex gap-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                  <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest mr-4">
                  <span>Less</span>
                  <div className="w-3 h-3 rounded-[2px] bg-white/5"></div>
                  <div className="w-3 h-3 rounded-[2px] bg-[#8c5bf5]/20"></div>
                  <div className="w-3 h-3 rounded-[2px] bg-[#8c5bf5]/50"></div>
                  <div className="w-3 h-3 rounded-[2px] bg-[#8c5bf5]/90"></div>
                  <span>More</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Target Role Probability */}
        <motion.div variants={itemAnim} className="lg:col-span-12">
          <GlassCard className="p-6 !rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-lg font-bold flex items-center gap-2 text-white">
                  <Target className="text-[#8c5bf5]" size={20} /> Target Role Probability
                </h4>
                <p className="text-xs text-slate-400 mt-1">Goal: <span className="text-[#8c5bf5] font-bold tracking-wide">{analyticsData.targetRole}</span></p>
              </div>
              <div className="bg-[#8c5bf5]/10 border border-[#8c5bf5]/20 px-4 py-2 rounded-full hidden sm:block">
                <span className="text-xs font-bold text-[#8c5bf5]">ESTIMATED BREAKTHROUGH: {analyticsData.estimatedBreakthrough}</span>
              </div>
            </div>
            
            <div className="h-48 w-full relative">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 180">
                <line x1="0" y1="40" x2="1200" y2="40" stroke="#8c5bf5" strokeWidth="1" strokeDasharray="4,4" opacity="0.4"></line>
                <text x="10" y="30" fill="#8c5bf5" fontSize="10" fontWeight="bold" className="uppercase tracking-widest">Success Threshold (85%)</text>
                
                <path d="M0,170 C200,165 400,160 500,140 C600,120 700,90 800,85 C900,80 1000,60 1100,50 C1150,45 1200,35" fill="none" stroke="#8c5bf5" strokeWidth="4" style={{ filter: 'drop-shadow(0 0 8px rgba(140, 91, 245, 0.5))' }}></path>
                
                <circle cx="500" cy="140" r="4" fill="#8c5bf5"></circle>
                <circle cx="800" cy="85" r="4" fill="#8c5bf5"></circle>
                <circle cx="1100" cy="50" r="4" fill="#8c5bf5"></circle>
              </svg>
              <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">
                <span className="hidden md:inline">Current Position</span>
                <span>Mid-Level Skills Peak</span>
                <span>Senior Certification</span>
                <span>Portfolio Milestone</span>
                <span className="hidden md:inline">Target Horizon</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

      </motion.div>
    </div>
  );
}