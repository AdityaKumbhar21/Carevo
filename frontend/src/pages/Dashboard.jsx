import React, { useState, useEffect } from 'react';
import { TrendingUp, Flame, CalendarDays, ArrowRight, Fingerprint, GraduationCap, Clock, Target, Activity, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { careerDnaAPI } from '../services/api';

// 1️⃣ Add setActiveTab as a prop here
export default function Dashboard({ setActiveTab }) {
  const [careerDNA, setCareerDNA] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch Career DNA data from API
  useEffect(() => {
    const fetchCareerDNA = async () => {
      try {
        setLoading(true);
        const response = await careerDnaAPI.getCareerDNA();
        setCareerDNA(response.data);
      } catch (err) {
        setError('Failed to load career DNA data');
        console.error(err);
        // Set fallback data for demo purposes
        setCareerDNA({
          userId: "demo_user",
          context: {
            educationLevel: "Undergraduate",
            currentCourse: "Electronics and Telecommunications",
            yearOfStudy: 2,
            dailyStudyHours: 3,
            timezone: "Asia/Kolkata"
          },
          interests: ["Software Engineer", "AI/ML Engineer"],
          abilities: [
            {
              name: "python",
              selfRating: 70,
              validatedScore: 65,
              finalScore: 67,
              highestQuizLevelCleared: "medium"
            },
            {
              name: "data structures",
              selfRating: 60,
              validatedScore: 55,
              finalScore: 57,
              highestQuizLevelCleared: "easy"
            }
          ],
          learningProfile: {
            averageQuizAccuracy: 72,
            learningSpeedIndex: 0.8,
            consistencyScore: 75
          },
          executionProfile: {
            streak: 5,
            longestStreak: 12,
            xp: 450,
            level: 3,
            roadmapProgress: 38
          }
        });
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
                  <p className="text-sm flex justify-between"><span className="text-slate-400">Level:</span> <span className="font-semibold">{careerDNA.context.educationLevel}</span></p>
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
            {careerDNA.abilities.map((ability, idx) => (
              <motion.div variants={itemAnim} key={idx}>
                <GlassCard className="p-5 flex flex-col transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-black text-slate-100 uppercase tracking-widest">{ability.name}</h4>
                    <span className="text-[10px] font-bold bg-[#8c5bf5]/20 text-[#8c5bf5] px-2 py-1 rounded uppercase">
                      Cleared: {ability.highestQuizLevelCleared}
                    </span>
                  </div>
                  
                  {/* Progress Visualization */}
                  <div className="space-y-3">
                    {/* Final Score Bar */}
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-white bg-white/10">
                            Final Score
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-[#8c5bf5]">
                            {ability.finalScore}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-white/10">
                        <motion.div 
                          initial={{ width: 0 }} animate={{ width: `${ability.finalScore}%` }} transition={{ duration: 1, delay: 0.5 }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#8c5bf5]" 
                        />
                      </div>
                    </div>

                    {/* Stats Breakdown */}
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-600"></span> Self-Rated: {ability.selfRating}</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> AI Validated: {ability.validatedScore}</span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
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
                {[
                  { label: 'Phase 1: Foundations', progress: 100, color: 'bg-[#8c5bf5]', text: 'text-[#8c5bf5]', val: '100%' },
                  { label: 'Phase 2: Core Skills', progress: 38, color: 'bg-[#8c5bf5]', text: 'text-[#8c5bf5]', val: '38%' },
                  { label: 'Phase 3: Advanced', progress: 0, color: 'bg-white/10', text: 'text-slate-500', val: 'Locked', opacity: 'opacity-50' }
                ].map((skill, i) => (
                  <div key={i} className={skill.opacity || ''}>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-white">{skill.label}</span>
                      <span className={`text-xs font-bold ${skill.text}`}>{skill.val}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${skill.progress}%` }} transition={{ duration: 1, delay: 0.5 + (i * 0.2) }} className={`h-full rounded-full ${skill.color}`} />
                    </div>
                  </div>
                ))}
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