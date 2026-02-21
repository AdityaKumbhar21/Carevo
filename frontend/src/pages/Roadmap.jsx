import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, ChevronDown, ChevronUp, Check, Play, Lock, 
  MoreHorizontal, Sparkles, Calendar, Clock, ArrowRight 
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { roadmapAPI } from '../services/api';

export default function Roadmap() {
  // States to control the generation flow
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [roadmapData, setRoadmapData] = useState(null);
  const [error, setError] = useState('');
  
  // Form States
  const [roadmapDays, setRoadmapDays] = useState('30');
  const [dailyHours, setDailyHours] = useState('2');

  // Accordion State for the Roadmap
  const [expandedPhase, setExpandedPhase] = useState(null);

  // Fetch existing roadmap on mount
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setIsGenerating(true);
        const response = await roadmapAPI.getRoadmap();
        if (response.data && response.data.phases) {
          setRoadmapData(response.data);
          setIsGenerated(true);
          setExpandedPhase(1);
        }
      } catch (err) {
        // Roadmap may not exist yet, which is fine
        console.log('No existing roadmap found');
        setIsGenerated(false);
      } finally {
        setIsGenerating(false);
      }
    };

    fetchRoadmap();
  }, []);

  const handleGenerate = async () => {
    setError('');
    setIsGenerating(true);
    
    try {
      const response = await roadmapAPI.generateRoadmap({
        targetDays: parseInt(roadmapDays),
        dailyHours: parseInt(dailyHours)
      });
      
      setRoadmapData(response.data);
      setIsGenerated(true);
      setExpandedPhase(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate roadmap');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

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
              Configure your learning parameters. The AI will generate a custom path to become an <span className="text-white font-bold">AI Software Engineer</span>.
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
  const phases = roadmapData?.phases || [
    {
      id: 1,
      title: 'Foundation',
      status: 'COMPLETED',
      description: 'Python basics, data structures, and algorithmic complexity.',
      icon: 'check',
      progress: 100,
      tasks: []
    },
    {
      id: 2,
      title: 'Core Skills',
      status: 'IN PROGRESS',
      description: 'Machine Learning fundamentals, deep learning, and neural architectures.',
      icon: 'play',
      progress: 42,
      tasks: [
        { day: 14, title: 'Linear & Logistic Regression Models', status: 'completed', action: 'Review' },
        { day: 15, title: 'Neural Networks: Perceptrons & Layers', status: 'current', action: 'Continue' },
        { day: 16, title: 'Backpropagation & Gradient Descent', status: 'locked', action: 'Locked' }
      ]
    },
    {
      id: 3,
      title: 'Advanced Architectures',
      status: 'LOCKED',
      description: 'Transformers, CNNs, and productionizing AI models.',
      icon: 'lock',
      progress: 0,
      tasks: []
    }
  ];

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-5xl mx-auto w-full mt-4">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Career Roadmap</h1>
          <p className="text-slate-400 flex items-center gap-2 text-sm font-medium">
            <BrainCircuit size={16} className="text-[#8c5bf5]" /> AI Software Engineer Path • Estimated {roadmapDays} days to completion
          </p>
        </div>
        
        <div className="w-full md:w-64">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-300">Overall Progress</span>
            <span className="text-sm font-bold text-[#8c5bf5]">{roadmapData?.progress || 42}% Complete</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${roadmapData?.progress || 42}%` }} 
              transition={{ duration: 1, delay: 0.5 }} 
              className="h-full bg-[#8c5bf5] rounded-full shadow-[0_0_10px_rgba(140,91,245,0.5)]" 
            />
          </div>
        </div>
      </div>

      {/* Timeline Layout */}
      <div className="relative mt-4">
        {/* The Vertical Purple Line */}
        <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-[#8c5bf5]/20" />

        <div className="space-y-6">
          
          {phases.map((phase, index) => {
            const isCompleted = phase.status === 'COMPLETED';
            const isInProgress = phase.status === 'IN PROGRESS';
            const isLocked = phase.status === 'LOCKED';

            return (
              <div key={phase.id} className="relative flex gap-6 z-10">
                {/* Timeline Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  isCompleted 
                    ? 'bg-[#0a0b1e] border-2 border-[#8c5bf5] shadow-[0_0_15px_rgba(140,91,245,0.2)]'
                    : isInProgress
                    ? 'bg-[#8c5bf5] shadow-[0_0_15px_rgba(140,91,245,0.6)]'
                    : 'bg-[#0a0b1e] border-2 border-slate-700'
                }`}>
                  {isCompleted ? <Check size={18} className="text-[#8c5bf5]" /> : 
                   isInProgress ? <Play size={18} className="text-white ml-0.5" fill="currentColor" /> :
                   <Lock size={16} className="text-slate-600" />}
                </div>
                
                <GlassCard className={`flex-1 p-6 !rounded-2xl border cursor-pointer transition-colors hover:bg-white/5 ${
                  isLocked ? 'opacity-60 border-white/5' : 'border-white/5'
                }`} onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}>
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`text-lg font-bold ${isLocked ? 'text-slate-400' : 'text-white'}`}>Phase {phase.id}: {phase.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                          isCompleted ? 'bg-emerald-500/10 text-emerald-400' :
                          isInProgress ? 'bg-[#8c5bf5]/20 text-[#8c5bf5]' :
                          'bg-white/10 text-slate-400'
                        }`}>{phase.status}</span>
                      </div>
                      <p className={`text-sm ${isLocked ? 'text-slate-500' : 'text-slate-400'}`}>{phase.description}</p>
                    </div>
                    {phase.tasks.length > 0 && (
                      expandedPhase === phase.id ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />
                    )}
                  </div>

                  {/* Accordion Content for Tasks */}
                  {phase.tasks.length > 0 && (
                    <AnimatePresence>
                      {expandedPhase === phase.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} 
                          animate={{ height: 'auto', opacity: 1 }} 
                          exit={{ height: 0, opacity: 0 }} 
                          className="overflow-hidden space-y-3 mt-6 pt-6 border-t border-white/10"
                        >
                          {phase.tasks.map((task, taskIdx) => (
                            <div 
                              key={taskIdx}
                              className={`flex items-center justify-between p-4 rounded-xl border ${
                                task.status === 'completed'
                                  ? 'bg-white/5 border-white/5'
                                  : task.status === 'current'
                                  ? 'bg-[#8c5bf5]/10 border-[#8c5bf5]/30 shadow-[0_4px_20px_rgba(140,91,245,0.1)]'
                                  : 'bg-white/[0.02] border-white/5 opacity-60'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  task.status === 'completed'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : task.status === 'current'
                                    ? 'bg-[#8c5bf5]/20 text-[#8c5bf5]'
                                    : 'bg-white/10 text-slate-500'
                                }`}>
                                  {task.status === 'completed' && <Check size={16} strokeWidth={3} />}
                                  {task.status === 'current' && <MoreHorizontal size={18} />}
                                  {task.status === 'locked' && <Lock size={14} />}
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-500 tracking-wider">
                                    {task.status === 'current' ? (
                                      <>DAY {task.day} <span className="text-[#8c5bf5] ml-2 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#8c5bf5] animate-pulse"></span> CURRENT</span></>
                                    ) : (
                                      `DAY ${task.day}`
                                    )}
                                  </p>
                                  <p className={`text-sm font-bold ${task.status === 'locked' ? 'text-slate-400' : 'text-white'}`}>{task.title}</p>
                                </div>
                              </div>
                              <button className={`px-5 py-2 text-xs font-bold rounded-full transition-colors ${
                                task.status === 'current'
                                  ? 'bg-[#8c5bf5] hover:bg-[#7e4ee5] text-white shadow-lg'
                                  : task.status === 'locked'
                                  ? 'text-slate-600'
                                  : 'text-slate-400'
                              }`}>
                                {task.action}
                              </button>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </GlassCard>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}