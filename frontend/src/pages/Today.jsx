import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, PenLine, Bot, Check, Timer, Sparkles } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export default function Today() {
  // Mock state to toggle task completion
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Review SQL Optimization', time: '15 mins', description: 'Advanced indexing techniques', icon: 'Database', completed: false },
    { id: 2, title: 'Code Interview Practice', time: '30 mins', description: 'LeetCode Medium Problems', icon: 'PenLine', completed: true },
    { id: 3, title: 'Gemini AI Interview Prep', time: '20 mins', description: 'Talking through a system design problem', icon: 'Bot', completed: false }
  ]);
  const [progressPercentage, setProgressPercentage] = useState(65);
  const [currentDay, setCurrentDay] = useState(14);
  const [loading, setLoading] = useState(false);

  // In a real app, this would be fetched from the backend
  useEffect(() => {
    // Uncomment this when you have a task API endpoint
    // const fetchTasks = async () => {
    //   try {
    //     setLoading(true);
    //     const response = await taskAPI.getTodaysTasks();
    //     setTasks(response.data.tasks || []);
    //     setProgressPercentage(response.data.progressPercentage || 65);
    //     setCurrentDay(response.data.currentDay || 14);
    //   } catch (err) {
    //     console.error('Failed to fetch tasks:', err);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchTasks();
  }, []);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const itemAnim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <div className="max-w-4xl mx-auto w-full pb-10 pt-4">
      
      {/* Top Header Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8c5bf5]/10 border border-[#8c5bf5]/20 mb-6">
          <div className="w-2 h-2 rounded-full bg-[#8c5bf5] animate-pulse"></div>
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Focus Session Active</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          Day 14 - Strengthening Foundations
        </h1>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <p className="text-slate-300 text-sm">
            You're <span className="font-black text-white">65%</span> through this module. Keep the momentum!
          </p>
          <div className="w-full sm:w-64 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: '65%' }} 
              transition={{ duration: 1, delay: 0.5 }} 
              className="h-full bg-[#8c5bf5] rounded-full shadow-[0_0_10px_rgba(140,91,245,0.5)]" 
            />
          </div>
        </div>
      </motion.div>

      {/* Tasks List */}
      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="space-y-4">
        
        {/* Task 1 */}
        <motion.div variants={itemAnim}>
          <div 
            onClick={() => toggleTask(1)}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
              tasks.find(t => t.id === 1).completed 
                ? 'bg-[#8c5bf5]/10 border-[#8c5bf5]/50' 
                : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                 tasks.find(t => t.id === 1).completed ? 'bg-[#8c5bf5] text-white shadow-[0_0_15px_rgba(140,91,245,0.4)]' : 'bg-white/5 text-slate-400 group-hover:text-white'
              }`}>
                <Database size={24} />
              </div>
              <div>
                <h3 className={`font-bold text-lg transition-colors ${tasks.find(t => t.id === 1).completed ? 'text-white' : 'text-slate-200'}`}>Review SQL Optimization</h3>
                <p className="text-xs text-slate-400 mt-1">15 mins • Advanced indexing techniques</p>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
              tasks.find(t => t.id === 1).completed ? 'bg-[#8c5bf5] border-[#8c5bf5] text-white' : 'border-slate-600 text-transparent group-hover:border-slate-500'
            }`}>
              <Check size={16} strokeWidth={3} />
            </div>
          </div>
        </motion.div>

        {/* Task 2 (Active/Highlighted state based on screenshot) */}
        <motion.div variants={itemAnim} className="relative">
          {/* Floating XP Badge */}
          {tasks.find(t => t.id === 2).completed && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-3 right-6 bg-[#8c5bf5] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-[0_0_15px_rgba(140,91,245,0.4)] z-10 flex items-center gap-1">
              <Sparkles size={12} /> +50 XP
            </motion.div>
          )}
          
          <div 
            onClick={() => toggleTask(2)}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
              tasks.find(t => t.id === 2).completed 
                ? 'bg-[#8c5bf5]/10 border-[#8c5bf5] shadow-[0_4px_20px_rgba(140,91,245,0.15)]' 
                : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                 tasks.find(t => t.id === 2).completed ? 'bg-[#8c5bf5] text-white shadow-[0_0_15px_rgba(140,91,245,0.4)]' : 'bg-white/5 text-slate-400 group-hover:text-white'
              }`}>
                <PenLine size={24} />
              </div>
              <div>
                <h3 className={`font-bold text-lg transition-colors ${tasks.find(t => t.id === 2).completed ? 'text-white' : 'text-slate-200'}`}>Update Portfolio Bio</h3>
                <p className="text-xs text-slate-400 mt-1">10 mins • AI assisted rewrite based on new skills</p>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
              tasks.find(t => t.id === 2).completed ? 'bg-[#8c5bf5] border-[#8c5bf5] text-white' : 'border-slate-600 text-transparent group-hover:border-slate-500'
            }`}>
              <Check size={16} strokeWidth={3} />
            </div>
          </div>
        </motion.div>

        {/* Task 3 */}
        <motion.div variants={itemAnim}>
          <div 
            onClick={() => toggleTask(3)}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
              tasks.find(t => t.id === 3).completed 
                ? 'bg-[#8c5bf5]/10 border-[#8c5bf5]/50' 
                : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                 tasks.find(t => t.id === 3).completed ? 'bg-[#8c5bf5] text-white shadow-[0_0_15px_rgba(140,91,245,0.4)]' : 'bg-white/5 text-slate-400 group-hover:text-white'
              }`}>
                <Bot size={24} />
              </div>
              <div>
                <h3 className={`font-bold text-lg transition-colors ${tasks.find(t => t.id === 3).completed ? 'text-white' : 'text-slate-200'}`}>AI Mock Interview</h3>
                <p className="text-xs text-slate-400 mt-1">20 mins • Backend Architecture focus</p>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
              tasks.find(t => t.id === 3).completed ? 'bg-[#8c5bf5] border-[#8c5bf5] text-white' : 'border-slate-600 text-transparent group-hover:border-slate-500'
            }`}>
              <Check size={16} strokeWidth={3} />
            </div>
          </div>
        </motion.div>

      </motion.div>

      {/* --- NEW MOTIVATIONAL COUNTDOWN SECTION --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-12 flex flex-col items-center justify-center text-center"
      >
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8c5bf5]/10 border border-[#8c5bf5]/30 text-[#8c5bf5] text-sm font-black tracking-wide shadow-[0_0_20px_rgba(140,91,245,0.15)] mb-4">
          <Timer size={18} className="animate-pulse" />
          Next challenge unlocks in 14h 22m
        </div>
        <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
          Great work today! Rest up and let the AI synthesize your next optimal learning path. <span className="text-white font-bold">You're building an unstoppable streak! 🚀</span>
        </p>
      </motion.div>

    </div>
  );
}