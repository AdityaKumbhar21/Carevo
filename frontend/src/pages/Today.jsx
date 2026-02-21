import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Timer, Sparkles, BookOpen, Loader2 } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { taskAPI, gamificationAPI } from '../services/api';

export default function Today() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await taskAPI.getTodayTasks();
      setTasks(res.data.tasks || res.data || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Could not load today\'s tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleComplete = async (taskId) => {
    if (completing) return;
    setCompleting(taskId);
    try {
      await taskAPI.completeTask(taskId);
      // refresh gamification status and notify app of xp change
      try {
        const gamRes = await gamificationAPI.getStatus();
        const newXp = gamRes.data.xp || gamRes.data.totalXP || 0;
        window.dispatchEvent(new CustomEvent('xpUpdated', { detail: { xp: newXp } }));
        // notify analytics to refresh heatmap / contributions
        window.dispatchEvent(new Event('contributionUpdated'));
      } catch (e) {
        // ignore
      }
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, completed: true } : t));
    } catch (err) {
      console.error('Failed to complete task:', err);
    } finally {
      setCompleting(null);
    }
  };

  const itemAnim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-[#8c5bf5]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full pb-10 pt-4">
      
      {/* Top Header Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8c5bf5]/10 border border-[#8c5bf5]/20 mb-6">
          <div className="w-2 h-2 rounded-full bg-[#8c5bf5] animate-pulse"></div>
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Focus Session Active</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          Today's Tasks
        </h1>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <p className="text-slate-300 text-sm">
            {completedCount} of {totalCount} tasks completed — <span className="font-black text-white">{progressPercentage}%</span> done
          </p>
          <div className="w-full sm:w-64 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${progressPercentage}%` }} 
              transition={{ duration: 1, delay: 0.5 }} 
              className="h-full bg-[#8c5bf5] rounded-full shadow-[0_0_10px_rgba(140,91,245,0.5)]" 
            />
          </div>
        </div>
      </motion.div>

      {error && (
        <GlassCard className="p-4 mb-6 border border-red-500/30 bg-red-500/5">
          <p className="text-red-400 text-sm">{error}</p>
        </GlassCard>
      )}

      {tasks.length === 0 && !error && (
        <GlassCard className="p-8 text-center">
          <BookOpen size={40} className="text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">No tasks for today.</p>
          <p className="text-slate-500 text-sm">Generate a roadmap first to get daily tasks assigned.</p>
        </GlassCard>
      )}

      {/* Tasks List */}
      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="space-y-4">
        {tasks.map((task) => (
          <motion.div key={task._id} variants={itemAnim} className="relative">
            {task.completed && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-3 right-6 bg-[#8c5bf5] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-[0_0_15px_rgba(140,91,245,0.4)] z-10 flex items-center gap-1">
                <Sparkles size={12} /> Done
              </motion.div>
            )}
            
            <div 
              onClick={() => !task.completed && handleComplete(task._id)}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                task.completed 
                  ? 'bg-[#8c5bf5]/10 border-[#8c5bf5]/50' 
                  : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                   task.completed ? 'bg-[#8c5bf5] text-white shadow-[0_0_15px_rgba(140,91,245,0.4)]' : 'bg-white/5 text-slate-400 group-hover:text-white'
                }`}>
                  {completing === task._id ? <Loader2 size={24} className="animate-spin" /> : <BookOpen size={24} />}
                </div>
                <div>
                  <h3 className={`font-bold text-lg transition-colors ${task.completed ? 'text-white line-through opacity-70' : 'text-slate-200'}`}>{task.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{task.description || 'Learning task'}</p>
                </div>
              </div>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                task.completed ? 'bg-[#8c5bf5] border-[#8c5bf5] text-white' : 'border-slate-600 text-transparent group-hover:border-slate-500'
              }`}>
                <Check size={16} strokeWidth={3} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {completedCount === totalCount && totalCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 flex flex-col items-center justify-center text-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8c5bf5]/10 border border-[#8c5bf5]/30 text-[#8c5bf5] text-sm font-black tracking-wide shadow-[0_0_20px_rgba(140,91,245,0.15)] mb-4">
            <Timer size={18} className="animate-pulse" />
            All tasks completed!
          </div>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
            Great work today! Rest up and come back tomorrow for your next set of tasks.
          </p>
        </motion.div>
      )}
    </div>
  );
}