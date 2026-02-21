import React, { useState } from 'react';
import { Camera, Mail, Clock, Lock, Shield, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';

export default function Settings() {
  // State for the interactive toggle switches
  const [reminders, setReminders] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const itemAnim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  // Reusable Toggle Component
  const ToggleSwitch = ({ isOn, onToggle }) => (
    <button 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full flex items-center px-1 transition-all duration-300 ${
        isOn ? 'bg-[#8c5bf5] shadow-[0_0_15px_rgba(140,91,245,0.4)]' : 'bg-white/10'
      }`}
    >
      <span className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
        isOn ? 'translate-x-6' : 'translate-x-0 opacity-40'
      }`} />
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto w-full pb-10">
      
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 mt-2">
        <h2 className="text-3xl font-black tracking-tight mb-2 text-white">Settings</h2>
        <p className="text-slate-400">Manage your intelligence profile, notifications, and app preferences.</p>
      </motion.header>

      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="grid gap-8">
        
        {/* Profile Section */}
        <motion.section variants={itemAnim}>
          <GlassCard className="p-8 !rounded-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h3 className="text-xl font-bold text-white">Profile Management</h3>
              <button className="px-5 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm font-semibold border border-white/10 transition-all text-white">
                Edit Profile
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 text-center sm:text-left">
              <div className="relative">
                <div className="w-24 h-24 rounded-full ring-4 ring-[#8c5bf5]/20 overflow-hidden bg-slate-800">
                  <img className="w-full h-full object-cover" src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex" alt="Alex Rivera" />
                </div>
                <button className="absolute bottom-0 right-0 bg-[#8c5bf5] w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#0a0b1e] hover:brightness-110 transition-all">
                  <Camera size={14} className="text-white" />
                </button>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-white">Alex Rivera</h4>
                <p className="text-slate-400 flex items-center justify-center sm:justify-start gap-2">
                  <Mail size={14} /> alex.rivera@example.com
                </p>
                <p className="text-slate-500 text-sm mt-2">Product Designer • San Francisco, CA</p>
              </div>
            </div>
          </GlassCard>
        </motion.section>

        {/* Notifications Section */}
        <motion.section variants={itemAnim}>
          <GlassCard className="p-8 !rounded-3xl">
            <h3 className="text-xl font-bold mb-6 text-white">Preferences & Notifications</h3>
            <div className="space-y-6">
              
              {/* Daily Reminders */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-200">Daily AI Reminders</p>
                  <p className="text-sm text-slate-500 italic">Get personalized career insights every morning.</p>
                </div>
                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                    <Clock size={14} className="text-[#8c5bf5]" />
                    <select className="bg-transparent border-none text-white focus:ring-0 text-xs font-bold appearance-none cursor-pointer outline-none">
                      <option className="bg-[#161022]" value="08:00">08:00 AM</option>
                      <option className="bg-[#161022]" value="09:00">09:00 AM</option>
                      <option className="bg-[#161022]" value="10:00">10:00 AM</option>
                    </select>
                  </div>
                  <ToggleSwitch isOn={reminders} onToggle={() => setReminders(!reminders)} />
                </div>
              </div>
              
              <hr className="border-white/5" />
              
              {/* Email Notifications */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-200">Email Notifications</p>
                  <p className="text-sm text-slate-500">Receive weekly summaries and important job matches.</p>
                </div>
                <div className="flex justify-end">
                  <ToggleSwitch isOn={emailNotifs} onToggle={() => setEmailNotifs(!emailNotifs)} />
                </div>
              </div>
              
              <hr className="border-white/5" />
              
              {/* Dark Mode */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-200">Dark Mode</p>
                  <p className="text-sm text-slate-500">Enable high-contrast dark theme for better visibility.</p>
                </div>
                <div className="flex justify-end">
                  <ToggleSwitch isOn={darkMode} onToggle={() => setDarkMode(!darkMode)} />
                </div>
              </div>

            </div>
          </GlassCard>
        </motion.section>

        {/* Security Section */}
        <motion.section variants={itemAnim}>
          <GlassCard className="p-8 !rounded-3xl">
            <h3 className="text-xl font-bold mb-6 text-white">Security & Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <button className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left group">
                <div className="w-10 h-10 rounded-xl bg-slate-500/20 flex items-center justify-center group-hover:bg-[#8c5bf5]/20 transition-colors">
                  <Lock size={18} className="text-slate-300 group-hover:text-[#8c5bf5] transition-colors" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-200">Change Password</p>
                  <p className="text-xs text-slate-500">Updated 3 months ago</p>
                </div>
              </button>
              
              <button className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left group">
                <div className="w-10 h-10 rounded-xl bg-slate-500/20 flex items-center justify-center group-hover:bg-[#8c5bf5]/20 transition-colors">
                  <Shield size={18} className="text-slate-300 group-hover:text-[#8c5bf5] transition-colors" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-200">Two-Factor Auth</p>
                  <p className="text-xs text-slate-500">Currently disabled</p>
                </div>
              </button>

            </div>
          </GlassCard>
        </motion.section>

        {/* Danger Zone */}
        <motion.div variants={itemAnim} className="flex flex-col sm:flex-row justify-between items-center px-4 pt-2 gap-4">
          <button className="text-sm font-medium text-slate-500 hover:text-white transition-colors">
            Privacy Policy
          </button>
          <button className="text-sm font-bold text-red-500/80 hover:text-red-400 transition-colors flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-full">
            <Trash2 size={16} /> Delete Account
          </button>
        </motion.div>

      </motion.div>
    </div>
  );
}