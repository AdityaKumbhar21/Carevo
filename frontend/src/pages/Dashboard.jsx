import React, { useState, useEffect } from 'react';
import { TrendingUp, Flame, CalendarDays, ArrowRight, Fingerprint, GraduationCap, Clock, Target, Activity, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { gamificationAPI } from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { careerDnaAPI } from '../services/api';

// 1️⃣ Add setActiveTab as a prop here
export default function Dashboard({ setActiveTab }) {
  const [careerDNA, setCareerDNA] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showXpToast, setShowXpToast] = useState(false);
  const [xpToastAmount, setXpToastAmount] = useState(0);

  // Fetch Career DNA data from API
  useEffect(() => {
    const fetchCareerDNA = async () => {
      try {
        setLoading(true);
        const response = await careerDnaAPI.getCareerDNA();
        setCareerDNA(response.data);
        // After loading career DNA, check daily XP toast condition
        try {
          const gamRes = await gamificationAPI.getStatus();
          const currentXp = gamRes.data.xp || gamRes.data.totalXP || 0;

          const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
          const lastToastDate = localStorage.getItem('lastXpToastDate');
          const lastXpValue = parseInt(localStorage.getItem('lastXpValue') || '0', 10);

          if (lastToastDate !== today) {
            const delta = Math.max(0, currentXp - (isNaN(lastXpValue) ? 0 : lastXpValue));
            if (delta > 0) {
              setXpToastAmount(delta);
              setShowXpToast(true);
              // Auto-hide after 4s
              setTimeout(() => setShowXpToast(false), 4000);
            }
            // record that we've shown (or checked) today and persist current xp
            localStorage.setItem('lastXpToastDate', today);
            localStorage.setItem('lastXpValue', String(currentXp));
          }
        } catch (e) {
          // ignore gamification errors
        }
      } catch (err) {
        setError('Failed to load career DNA data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCareerDNA();
  }, []);

  const itemAnim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 pb-4 w-full h-full items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#8c5bf5]/20 border-t-[#8c5bf5] rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Loading your career DNA...</p>
      </div>
    );
  }

  if (!careerDNA) {
    return (
      <div className="flex flex-col gap-6 pb-4 w-full">
        <GlassCard className="p-6 border border-red-500/30 bg-red-500/5">
          <p className="text-red-400 font-medium">{error || 'Failed to load career data'}</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-4 w-full">

      {/* XP Toast (top-right) */}
      {showXpToast && (
        <div className="fixed top-6 right-6 z-50">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="bg-gradient-to-r from-emerald-400 to-emerald-300 text-[#041014] px-5 py-3 rounded-full shadow-lg font-black flex items-center gap-3">
            <div className="text-lg">+{xpToastAmount} XP</div>
            <div className="text-xs text-slate-800 font-semibold">Daily Check-in</div>
          </motion.div>
        </div>
      )}
      
      {/* Top Stats Row (Updated using DNA Data) */}
      <motion.section initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">

        {/* Primary Target Card */}
        <motion.div variants={itemAnim}>
          <GlassCard className="p-6 flex items-center justify-between relative overflow-hidden h-full">
            <div className="relative z-10">
              <p className="text-slate-400 text-sm font-medium mb-1">Primary Target</p>
              <h3 className="text-xl font-bold mb-4 text-white">{careerDNA.interests[0]}</h3>
              <div className="flex items-center gap-2">
                <Target size={16} className="text-[#8c5bf5]" />
                <span className="text-xs text-[#8c5bf5] font-bold">Priority Match</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-[#8c5bf5]/10 rounded-full flex items-center justify-center shrink-0 border border-[#8c5bf5]/20">
               <Fingerprint size={32} className="text-[#8c5bf5]" />
            </div>
          </GlassCard>
        </motion.div>

        {/* Streak Card */}
        <motion.div variants={itemAnim}>
          <GlassCard className="p-6 flex items-center justify-between h-full">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Execution Streak</p>
              <h3 className="text-3xl font-black text-white flex items-center gap-2">
                {careerDNA.executionProfile.streak} Days <Flame size={28} className="text-orange-500 fill-orange-500 animate-pulse" />
              </h3>
              <p className="text-xs text-slate-400 mt-2 font-medium">Longest streak: <span className="text-white">{careerDNA.executionProfile.longestStreak} Days</span></p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-tr from-orange-600/20 to-[#8c5bf5]/20 rounded-full flex items-center justify-center border border-orange-500/20">
              <CalendarDays size={28} className="text-orange-500" />
            </div>
          </GlassCard>
        </motion.div>

        {/* Validation Score Card */}
        <motion.div variants={itemAnim}>
          <GlassCard className="p-6 flex items-center justify-between h-full">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Validation Avg</p>
              <h3 className="text-3xl font-black text-white flex items-center gap-2">
                {careerDNA.learningProfile?.validation?.average ?? 0}%
              </h3>
              <p className="text-xs text-slate-400 mt-2 font-medium">Tests: {careerDNA.learningProfile?.validation?.count ?? 0}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-tr from-purple-600/20 to-[#8c5bf5]/20 rounded-full flex items-center justify-center border border-purple-500/20">
              <GraduationCap size={28} className="text-purple-400" />
            </div>
          </GlassCard>
        </motion.div>

        {/* Consistency / Speed Card */}
        <motion.div variants={itemAnim}>
          <GlassCard className="p-6 flex flex-col justify-center h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Activity size={16} className="text-emerald-400" />
                </div>
                <span className="font-bold text-slate-400 text-sm">Consistency Score</span>
              </div>
              <span className="text-xl font-black text-emerald-400">{careerDNA.learningProfile.consistencyScore}/100</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${careerDNA.learningProfile.consistencyScore}%` }} transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-3 flex justify-between">
              <span>Speed Index: {careerDNA.learningProfile.learningSpeedIndex}x</span>
              <span>Accuracy: {careerDNA.learningProfile.averageQuizAccuracy}%</span>
            </p>
          </GlassCard>
        </motion.div>

      </motion.section>

      {/* Main DNA Section */}
      <motion.section initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }} className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">

        {/* CAREER DNA COLUMN */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Fingerprint size={20} className="text-[#8c5bf5]" /> Identity & Context
            </h2>
          </div>

          {/* Context Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <motion.div variants={itemAnim}>
              <GlassCard className="p-5 border-l-4 border-l-[#8c5bf5] flex flex-col justify-center h-full">
                <div className="flex items-center gap-3 mb-4">
                  <GraduationCap className="text-[#8c5bf5]" size={20} />
                  <h4 className="font-bold text-slate-100">Academic Context</h4>
                </div>
                <div className="space-y-2">
                  <p className="text-sm flex justify-between"><span className="text-slate-400">Level:</span> <span className="font-semibold">{(function(){
                    const map = { ug: 'Undergraduate', pg: 'Postgraduate', wp: 'Working Professional' };
                    const val = careerDNA.context.educationLevel;
                    return map[val] || (typeof val === 'string' ? (val.charAt(0).toUpperCase() + val.slice(1)) : val);
                  })()}</span></p>
                  <p className="text-sm flex justify-between"><span className="text-slate-400">Course:</span> <span className="font-semibold text-right">{careerDNA.context.currentCourse}</span></p>
                  <p className="text-sm flex justify-between"><span className="text-slate-400">Year:</span> <span className="font-semibold">Year {careerDNA.context.yearOfStudy}</span></p>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div variants={itemAnim}>
              <GlassCard className="p-5 border-l-4 border-l-blue-400 flex flex-col justify-center h-full">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="text-blue-400" size={20} />
                  <h4 className="font-bold text-slate-100">Learning Parameters</h4>
                </div>
                <div className="space-y-2">
                  <p className="text-sm flex justify-between"><span className="text-slate-400">Bandwidth:</span> <span className="font-semibold">{careerDNA.context.dailyStudyHours} Hrs/Day</span></p>
                  <p className="text-sm flex justify-between"><span className="text-slate-400">Timezone:</span> <span className="font-semibold">{careerDNA.context.timezone}</span></p>
                  <p className="text-sm flex justify-between"><span className="text-slate-400">Interests:</span> <span className="font-semibold text-right">{careerDNA.interests.length} Roles Tracked</span></p>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          <div className="flex items-center justify-between mb-2 mt-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap size={20} className="text-yellow-400" /> Validated Abilities
            </h2>
          </div>

          {/* Abilities Map */}
          <div className="grid grid-cols-1 gap-4">
            {careerDNA.abilities.length === 0 ? (
              <GlassCard className="p-6 text-center">
                <p className="text-slate-400 text-sm">No validated abilities yet. Complete quizzes to see your skill scores here.</p>
              </GlassCard>
            ) : (
              careerDNA.abilities.map((ability, idx) => {
                const levelColors = {
                  easy: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
                  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
                  advanced: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
                };
                const level = ability.highestQuizLevelCleared || 'none';
                const lc = levelColors[level] || { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' };
                const score = ability.finalScore ?? 0;
                const barColor = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500';

                return (
                  <motion.div variants={itemAnim} key={idx}>
                    <GlassCard className="p-5 flex flex-col transition-all hover:border-[#8c5bf5]/20">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#8c5bf5]/10 rounded-lg flex items-center justify-center">
                            <Zap size={16} className="text-[#8c5bf5]" />
                          </div>
                          <h4 className="font-bold text-slate-100 capitalize">{ability.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          {level !== 'none' && (
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${lc.bg} ${lc.text} ${lc.border} uppercase`}>
                              {level}
                            </span>
                          )}
                          <span className="text-lg font-black text-[#8c5bf5]">{score}%</span>
                        </div>
                      </div>
                      
                      {/* Score Bar */}
                      <div className="overflow-hidden h-2 mb-3 rounded-full bg-white/5">
                        <motion.div 
                          initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1, delay: 0.3 + idx * 0.1 }}
                          className={`h-full rounded-full ${barColor}`}
                        />
                      </div>

                      {/* Score Breakdown */}
                      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-500"></span> Self: {ability.selfRating}/5
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> AI Score: {ability.validatedScore}%
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#8c5bf5]"></span> Final: {score}%
                        </span>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })
            )}
          </div>

        </div>

        {/* Roadmap Progress Column (Right Side) */}
        <motion.div variants={itemAnim} className="lg:col-span-4 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-white mb-2">Roadmap Progress</h2>
          <GlassCard className="flex-1 p-6 relative overflow-hidden flex flex-col">
            
            {/* Abstract SVG Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 100 Q 50 20, 100 80 T 200 60 T 300 120 T 400 40" fill="none" stroke="#8c5bf5" strokeWidth="4"></path>
                <circle cx="50" cy="100" fill="#8c5bf5" r="5"></circle>
                <circle cx="150" cy="70" fill="#8c5bf5" r="5"></circle>
                <circle cx="250" cy="90" fill="#8c5bf5" opacity="0.5" r="5"></circle>
                <circle cx="350" cy="80" fill="#8c5bf5" opacity="0.3" r="5"></circle>
              </svg>
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(140,91,245,0.5)]">
                    {careerDNA.executionProfile.roadmapProgress}%
                  </p>
                  <p className="text-xs text-slate-400 font-bold uppercase mt-1">Overall Completion</p>
                </div>
                <div className="text-right">
                  <span className="text-[#8c5bf5] text-[10px] font-bold bg-[#8c5bf5]/10 border border-[#8c5bf5]/20 px-2 py-1 rounded-lg">TARGET PATH</span>
                </div>
              </div>

              <div className="space-y-6 flex-1 mt-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-white">Roadmap Completion</span>
                    <span className="text-xs font-bold text-[#8c5bf5]">{careerDNA.executionProfile.roadmapProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${careerDNA.executionProfile.roadmapProgress}%` }} transition={{ duration: 1, delay: 0.7 }} className="h-full rounded-full bg-[#8c5bf5]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-white">XP Progress</span>
                    <span className="text-xs font-bold text-yellow-400">{careerDNA.executionProfile.xp} XP</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((careerDNA.executionProfile.xp / 1000) * 100, 100)}%` }} transition={{ duration: 1, delay: 0.9 }} className="h-full rounded-full bg-yellow-400" />
                  </div>
                </div>
              </div>

              {/* 2️⃣ Add the onClick handler to change the tab */}
              <button 
                onClick={() => setActiveTab('Roadmap')} 
                className="w-full mt-6 py-3 bg-transparent border border-[#8c5bf5]/30 text-sm font-bold text-white rounded-xl hover:bg-[#8c5bf5] transition-all flex items-center justify-center gap-2 group"
              >
                Continue Roadmap <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </motion.section>
    </div>
  );
}