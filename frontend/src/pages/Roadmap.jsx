import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, ChevronDown, ChevronUp, Check, Play, Lock, 
  MoreHorizontal, Sparkles, Calendar, Clock, ArrowRight, Loader2 
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { roadmapAPI, profileAPI, careerAPI, taskAPI } from '../services/api';

export default function Roadmap() {
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [roadmapData, setRoadmapData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [careerId, setCareerId] = useState(null);
  const [careerName, setCareerName] = useState('');
  
  const [roadmapDays, setRoadmapDays] = useState('30');
  const [dailyHours, setDailyHours] = useState('2');
  const [expandedDay, setExpandedDay] = useState(null);

  const roadmapLoadingMessages = [
    'Architecting your personalized learning path...',
    'Calculating optimal skill progression...',
    'Designing daily challenges just for you...',
    'Mapping milestones across your journey...',
    'AI is crafting your success blueprint...',
    'Plotting the fastest route to your dream career...',
    'Preparing bite-sized daily goals...',
    'Almost there... your roadmap is taking shape!'
  ];
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => setLoadingMsgIdx(i => (i + 1) % roadmapLoadingMessages.length), 2500);
    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    const init = async () => {
      try {
        setIsGenerating(true);
        // Get user's primary career interest
        const profileRes = await profileAPI.getProfile();
        const user = profileRes.data.user || profileRes.data;
        const interests = user.careerInterests || [];
        
        if (interests.length === 0) {
          setIsGenerating(false);
          return;
        }

        // Find the career ID for the first interest
        const careersRes = await careerAPI.getCareers();
        const allCareers = careersRes.data.careers || careersRes.data || [];
        const career = allCareers.find(c => c.name === interests[0]);
        
        if (!career) {
          setIsGenerating(false);
          return;
        }

        setCareerId(career._id);
        setCareerName(career.name);

        // Try to fetch existing roadmap
        const roadmapRes = await roadmapAPI.getRoadmap(career._id);
        if (roadmapRes.data) {
          setRoadmapData(roadmapRes.data.roadmap || roadmapRes.data);
          
          // Fetch tasks for today to show in timeline
          try {
            const tasksRes = await taskAPI.getTodayTasks();
            setTasks(tasksRes.data.tasks || tasksRes.data || []);
          } catch (e) {
            // No tasks yet is fine
          }
          
          setIsGenerated(true);
        }
      } catch (err) {
        console.log('No existing roadmap found');
        setIsGenerated(false);
      } finally {
        setIsGenerating(false);
      }
    };

    init();
  }, []);

  const handleGenerate = async () => {
    if (!careerId) {
      setError('No career selected. Complete onboarding first.');
      return;
    }
    setError('');
    setIsGenerating(true);
    
    try {
      const response = await roadmapAPI.generateRoadmap({
        careerId,
        targetDays: parseInt(roadmapDays),
        dailyHours: parseInt(dailyHours)
      });
      
      // Re-fetch the full roadmap
      const roadmapRes = await roadmapAPI.getRoadmap(careerId);
      setRoadmapData(roadmapRes.data.roadmap || roadmapRes.data);
      
      try {
        const tasksRes = await taskAPI.getTodayTasks();
        setTasks(tasksRes.data.tasks || tasksRes.data || []);
      } catch (e) {}
      
      setIsGenerated(true);
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.message || 'Failed to generate roadmap');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Loading state
  if (isGenerating && !isGenerated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 size={48} className="animate-spin text-[#8c5bf5]" />
          </div>
          <motion.p
            key={loadingMsgIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-slate-400 text-sm font-medium text-center max-w-xs"
          >
            {roadmapLoadingMessages[loadingMsgIdx]}
          </motion.p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // VIEW 1: CONFIGURATION FORM
  // -------------------------------------------------------------------
  if (!isGenerated) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <GlassCard className="max-w-lg w-full p-10 !rounded-3xl relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#8c5bf5]/20 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 text-center mb-8">
            <div className="w-16 h-16 bg-[#8c5bf5]/20 text-[#8c5bf5] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#8c5bf5]/30 shadow-[0_0_20px_rgba(140,91,245,0.3)]">
              <BrainCircuit size={32} />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Generate AI Roadmap</h2>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed">
              Configure your learning parameters. The AI will generate a custom path to become a <span className="text-white font-bold">{careerName || 'career professional'}</span>.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium mb-6"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <div className="space-y-6 relative z-10">
            {/* Days Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} className="text-[#8c5bf5]" /> Target Timeline (Days)
              </label>
              <div className="relative">
                <select 
                  value={roadmapDays}
                  onChange={(e) => setRoadmapDays(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-[#161022] border border-white/10 rounded-xl py-4 pl-4 pr-10 text-white focus:outline-none focus:border-[#8c5bf5] appearance-none font-medium cursor-pointer disabled:opacity-50"
                >
                  <option value="15">15 Days (Crash Course)</option>
                  <option value="30">30 Days (Standard Pace)</option>
                  <option value="60">60 Days (Deep Dive)</option>
                  <option value="90">90 Days (Comprehensive)</option>
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Hours Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} className="text-[#8c5bf5]" /> Daily Study Commitment
              </label>
              <div className="relative">
                <select 
                  value={dailyHours}
                  onChange={(e) => setDailyHours(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-[#161022] border border-white/10 rounded-xl py-4 pl-4 pr-10 text-white focus:outline-none focus:border-[#8c5bf5] appearance-none font-medium cursor-pointer disabled:opacity-50"
                >
                  <option value="1">1 Hour / Day</option>
                  <option value="2">2 Hours / Day</option>
                  <option value="4">4 Hours / Day</option>
                  <option value="6">6+ Hours / Day (Bootcamp)</option>
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Generate Button */}
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-4 mt-4 bg-gradient-to-r from-[#8c5bf5] to-[#4f46e5] text-white font-black rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(140,91,245,0.4)] transition-all hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
            >
              {isGenerating ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Synthesizing Path
                </>
              ) : (
                <>Generate Custom Roadmap <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // VIEW 2: THE GENERATED ROADMAP
  // -------------------------------------------------------------------
  const progress = roadmapData?.progressPercentage ?? roadmapData?.progress ?? 0;
  const totalDays = roadmapData?.totalDays ?? parseInt(roadmapDays);

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-5xl mx-auto w-full mt-4">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Career Roadmap</h1>
          <p className="text-slate-400 flex items-center gap-2 text-sm font-medium">
            <BrainCircuit size={16} className="text-[#8c5bf5]" /> {careerName || 'Career'} Path &bull; {totalDays} day plan
          </p>
        </div>
        
        <div className="w-full md:w-64">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-300">Overall Progress</span>
            <span className="text-sm font-bold text-[#8c5bf5]">{progress}% Complete</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${progress}%` }} 
              transition={{ duration: 1, delay: 0.5 }} 
              className="h-full bg-[#8c5bf5] rounded-full shadow-[0_0_10px_rgba(140,91,245,0.5)]" 
            />
          </div>
        </div>
      </div>

      {/* Today's Tasks */}
      {tasks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Play size={16} className="text-[#8c5bf5]" /> Today's Tasks
          </h3>
          {tasks.map((task) => (
            <div key={task._id} className={`flex items-center justify-between p-4 rounded-xl border ${
              task.completed 
                ? 'bg-white/5 border-white/5'
                : 'bg-[#8c5bf5]/10 border-[#8c5bf5]/30 shadow-[0_4px_20px_rgba(140,91,245,0.1)]'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  task.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#8c5bf5]/20 text-[#8c5bf5]'
                }`}>
                  {task.completed ? <Check size={16} strokeWidth={3} /> : <MoreHorizontal size={18} />}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 tracking-wider">
                    DAY {task.dayNumber} {!task.completed && <span className="text-[#8c5bf5] ml-2">CURRENT</span>}
                  </p>
                  <p className={`text-sm font-bold ${task.completed ? 'text-slate-400' : 'text-white'}`}>{task.title}</p>
                  {task.description && <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>}
                </div>
              </div>
              {task.estimatedMinutes && (
                <span className="text-xs text-slate-500">{task.estimatedMinutes} min</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Roadmap Summary */}
      <GlassCard className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-[#8c5bf5]/20 p-3 rounded-full text-[#8c5bf5]">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white mb-1">AI-Generated Learning Path</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your personalized {totalDays}-day roadmap for <span className="text-white font-semibold">{careerName}</span> has been generated. 
              Complete daily tasks to progress through your career path. Check the "Today" tab for your current assignments.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}