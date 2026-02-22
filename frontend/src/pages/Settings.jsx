import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mail, Clock, Lock, Shield, Trash2, Loader2, FileText, Upload, CheckCircle2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { profileAPI, careerAPI } from '../services/api';

export default function Settings() {
  const [reminders, setReminders] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resumeText, setResumeText] = useState('');
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeSaved, setResumeSaved] = useState(false);
  const [resumeError, setResumeError] = useState('');
  const fileInputRef = useRef(null);

  // Settings: no embedded Course Intelligence UI

  // PDF OCR disabled: prefer plain text resume uploads or paste into settings
  const extractTextFromPDF = async (file) => {
    // PDF/image OCR is intentionally disabled. Return empty so caller can handle fallback.
    return '';
  };

  // Handle resume file upload
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeUploading(true);
    setResumeError('');
    setResumeSaved(false);

    try {
      let extractedText = '';

      if (file.type === 'text/plain') {
        extractedText = await file.text();
      } else {
        setResumeError('PDF/image OCR is disabled. Please paste plain text or upload a .txt file.');
        setResumeUploading(false);
        return;
      }

      const cleaned = extractedText ? extractedText.trim() : '';
      if (!cleaned || cleaned.length < 20) {
        setResumeError('Could not extract enough text from the file. Try a different format.');
        setResumeUploading(false);
        return;
      }

      // Truncate if too long (max 50000 chars)
      const trimmed = cleaned.slice(0, 50000);
      setResumeText(trimmed);
      // quick parse for skills and experience (console output)
      try {
        const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const skills = [];
        const experience = [];
        for (let i = 0; i < lines.length; i++) {
          const l = lines[i].toLowerCase();
          if (l.includes('skills') && lines[i+1]) {
            const toks = lines[i+1].split(/[;,\/]|\band\b/).map(t => t.trim()).filter(Boolean);
            toks.forEach(t => skills.push(t));
          }
          if (/\b(19|20)\d{2}\b/.test(l) || l.includes('worked at') || l.includes('experience')) {
            experience.push(lines[i]);
          }
        }
        console.info('Parsed resume (settings):', { skills: Array.from(new Set(skills)).slice(0,20), experience: Array.from(new Set(experience)).slice(0,20) });
      } catch (e) {
        console.debug('Parsing resume failed', e);
      }

      // Save to backend (trimmed)
      await profileAPI.updateProfile({ resumeText: trimmed });
      setResumeSaved(true);
      setTimeout(() => setResumeSaved(false), 3000);
    } catch (err) {
      console.error('Resume upload failed:', err);
      setResumeError('Failed to process resume. Please try again.');
    } finally {
      setResumeUploading(false);
    }
  };

  const clearResume = async () => {
    setResumeText('');
    setResumeError('');
    try {
      await profileAPI.updateProfile({ resumeText: '' });
    } catch (err) {
      console.error('Failed to clear resume:', err);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await profileAPI.getProfile();
        const userData = res.data.user || res.data;
        setUser(userData);
        if (userData.resumeText) setResumeText(userData.resumeText);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // No course intelligence effect (feature removed)

  const itemAnim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-[#8c5bf5]" />
      </div>
    );
  }

  const userName = user?.name || 'User';
  const userEmail = user?.email || '';
  const educationLevel = user?.educationLevel || '';
  const currentCourse = user?.currentCourse || '';

  return (
    <div className="max-w-4xl mx-auto w-full pb-10">
      
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 mt-2">
        <h2 className="text-3xl font-black tracking-tight mb-2 text-white">Settings</h2>
        <p className="text-slate-400">Manage your profile, notifications, and app preferences.</p>
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
                  <img className="w-full h-full object-cover" src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(userName)}`} alt={userName} />
                </div>
                <button className="absolute bottom-0 right-0 bg-[#8c5bf5] w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#0a0b1e] hover:brightness-110 transition-all">
                  <Camera size={14} className="text-white" />
                </button>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-white">{userName}</h4>
                <p className="text-slate-400 flex items-center justify-center sm:justify-start gap-2">
                  <Mail size={14} /> {userEmail}
                </p>
                {(educationLevel || currentCourse) && (
                  <p className="text-slate-500 text-sm mt-2">{educationLevel}{currentCourse ? ` • ${currentCourse}` : ''}</p>
                )}
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

        {/* Resume Upload Section */}
        <motion.section variants={itemAnim}>
          <GlassCard className="p-8 !rounded-3xl">
            <h3 className="text-xl font-bold mb-2 text-white flex items-center gap-2">
              <FileText size={20} className="text-[#8c5bf5]" /> Resume Intelligence
            </h3>
            <p className="text-sm text-slate-400 mb-6">Upload your resume (PDF or TXT) to enhance AI career matching and quiz generation.</p>
            
            <div className="space-y-4">
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".pdf,.txt" 
                onChange={handleResumeUpload}
                className="hidden"
              />
              
              {!resumeText ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={resumeUploading}
                  className="w-full p-8 border-2 border-dashed border-white/10 hover:border-[#8c5bf5]/30 rounded-2xl transition-all flex flex-col items-center gap-3 group"
                >
                  {resumeUploading ? (
                    <>
                      <Loader2 size={32} className="text-[#8c5bf5] animate-spin" />
                      <p className="text-slate-400 text-sm">Extracting text from your resume...</p>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-[#8c5bf5]/10 flex items-center justify-center group-hover:bg-[#8c5bf5]/20 transition-colors">
                        <Upload size={24} className="text-[#8c5bf5]" />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-semibold text-sm">Upload Resume</p>
                        <p className="text-slate-500 text-xs mt-1">PDF or TXT files · Client-side processing · No data sent to third parties</p>
                      </div>
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span className="text-sm text-emerald-400 font-semibold">Resume Uploaded</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={resumeUploading}
                        className="text-xs text-[#8c5bf5] hover:text-white font-semibold transition-colors"
                      >
                        Replace
                      </button>
                      <button
                        onClick={clearResume}
                        className="text-xs text-red-400 hover:text-red-300 font-semibold transition-colors flex items-center gap-1"
                      >
                        <X size={12} /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 max-h-32 overflow-y-auto">
                    <p className="text-xs text-slate-400 font-mono leading-relaxed whitespace-pre-wrap">
                      {resumeText.slice(0, 500)}{resumeText.length > 500 ? '...' : ''}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-500">{resumeText.length.toLocaleString()} characters extracted · Used for AI career matching & quiz personalization</p>
                </div>
              )}

              {resumeSaved && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-emerald-400 text-sm">
                  <CheckCircle2 size={14} /> Resume saved successfully!
                </motion.div>
              )}

              {resumeError && (
                <p className="text-red-400 text-sm">{resumeError}</p>
              )}
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