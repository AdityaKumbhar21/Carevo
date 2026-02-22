import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Target, Sliders, BrainCircuit, ArrowRight, ArrowLeft, CheckCircle2, Code, Database, Layout, Shield, Cloud, Terminal, AlertCircle, TrendingUp, Briefcase, ChevronDown, Plus, X } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { careerAPI, profileAPI } from '../services/api';
import { createWorker } from 'tesseract.js';

// Icon mapping by career name
const CAREER_ICON_MAP = {
  'Software Engineer': Code,
  'Data Scientist': Database,
  'Data Analyst': TrendingUp,
  'Product Manager': Target,
  'UI/UX Designer': Layout,
  'Cybersecurity Analyst': Shield,
  'Cloud Engineer': Cloud,
  'AI/ML Engineer': BrainCircuit,
  'DevOps Engineer': Terminal,
  'Business Analyst': Briefcase,
};

// Helper to determine string label for skill level
const getSkillLevelLabel = (score) => {
  if (score < 30) return 'Beginner';
  if (score < 70) return 'Intermediate';
  if (score < 90) return 'Advanced';
  return 'Expert';
};

export default function Onboarding({ onComplete }) {
  const [careers, setCareers] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Form States
  const [educationLevel, setEducationLevel] = useState(''); 
  const [course, setCourse] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [studyHours, setStudyHours] = useState(''); 
  const [availableHours, setAvailableHours] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [extractedExperience, setExtractedExperience] = useState([]);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedCareers, setSelectedCareers] = useState([]);
  
  // Dynamic Skill Ratings Object
  const [skillRatings, setSkillRatings] = useState({});
  const [currentSkillSelect, setCurrentSkillSelect] = useState('');
  const [currentLevelSelect, setCurrentLevelSelect] = useState('25');

  // Fetch careers from API on mount
  useEffect(() => {
    const fetchCareers = async () => {
      try {
        setLoading(true);
        const response = await careerAPI.getCareers();
        if (response.data && response.data.length > 0) {
          // Map API data to include icon components and skill names
          const mapped = response.data.map(c => ({
            id: c._id,
            name: c.name,
            icon: CAREER_ICON_MAP[c.name] || BrainCircuit,
            skills: c.skills ? c.skills.map(s => s.name.toLowerCase()) : [],
          }));
          setCareers(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch careers:', err);
        setError('Failed to load careers. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchCareers();
  }, []);

  // Extract unique skills based on selected careers
  const derivedSkills = useMemo(() => {
    const skillsSet = new Set();
    // selectedCareers intentionally supports only one selection now
    if (selectedCareers.length > 0) {
      const careerId = selectedCareers[0];
      const career = careers.find(c => c.id === careerId);
      if (career && career.skills) career.skills.forEach(skill => skillsSet.add(skill));
    }
    return Array.from(skillsSet);
  }, [selectedCareers, careers]);

  // Filter out skills that have already been added to the profile
  const unaddedSkills = derivedSkills.filter(skill => skillRatings[skill] === undefined);

  // Now restrict selection to a single career (choose 1 of 10)
  const toggleCareer = (id) => {
    if (selectedCareers.includes(id)) {
      setSelectedCareers([]);
    } else {
      setSelectedCareers([id]);
    }
  };

  const handleAddSkill = () => {
    if (currentSkillSelect) {
      setSkillRatings(prev => ({
        ...prev,
        [currentSkillSelect]: parseInt(currentLevelSelect, 10)
      }));
      setCurrentSkillSelect(''); // Reset dropdown
      setCurrentLevelSelect('25'); // Reset level
      setError('');
    }
  };

  // Simple resume parser: find a Skills section and an Experience section
  const parseResumeForSkillsAndExperience = (text) => {
    if (!text || !text.trim()) return { skills: [], experience: [] };
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    const lowerLines = lines.map(l => l.toLowerCase());
    const skillHeadings = ['skills', 'technical skills', 'skills & tools', 'skills:', 'expertise', 'technical stack'];
    const expHeadings = ['experience', 'work experience', 'professional experience', 'employment', 'work history'];

    const findHeadingIndex = (headings) => {
      for (let i = 0; i < lowerLines.length; i++) {
        for (const h of headings) {
          if (lowerLines[i].includes(h)) return i;
        }
      }
      return -1;
    };

    const skillsIdx = findHeadingIndex(skillHeadings);
    const expIdx = findHeadingIndex(expHeadings);

    let skills = [];
    const techKeywords = ['javascript','python','java','react','node','sql','docker','aws','kubernetes','html','css','typescript','c++','c#','git','linux','tensorflow','pytorch','excel','tableau','powerbi','azure','gcp','mongodb','postgres','mysql','redux','graphql','rest','django','flask','spring','spark','hadoop','matlab','r','scala'];

    const splitTokens = (line) => line.split(/[•·\-\*;,\/\\|\(\)]|\band\b|\s{2,}/).map(t => t.trim()).filter(Boolean);

    if (skillsIdx !== -1) {
      // collect lines after heading until next blank or next heading
      for (let i = skillsIdx + 1; i < lines.length && i < skillsIdx + 20; i++) {
        const l = lines[i];
        if (!l) break;
        const low = l.toLowerCase();
        if (skillHeadings.some(h => low.includes(h)) || expHeadings.some(h => low.includes(h))) break;
        // prefer lines that look like lists (commas, bullets) or short token lists
        if (l.includes(',') || l.includes('•') || splitTokens(l).length <= 8) {
          const tokens = splitTokens(l);
          tokens.forEach(tok => {
            const cleaned = tok.replace(/[().]/g, '').trim();
            if (cleaned.length > 1 && !/^[0-9]+$/.test(cleaned)) skills.push(cleaned);
          });
        }
      }
    }

    // Fallback: scan whole document for likely skill lines if none found above
    if (skills.length === 0) {
      for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        const low = l.toLowerCase();
        // heuristics: many commas OR contains tech keywords OR is short list-like
        const tokens = splitTokens(l);
        const containsTech = techKeywords.some(k => low.includes(k));
        if (l.split(',').length >= 3 || containsTech || (tokens.length > 1 && tokens.length <= 8 && tokens.some(t => /[A-Za-z]/.test(t) && t.length < 40))) {
          tokens.forEach(tok => {
            const cleaned = tok.replace(/[().]/g, '').trim();
            if (cleaned.length > 1 && !/^[0-9]+$/.test(cleaned)) skills.push(cleaned);
          });
        }
        if (skills.length >= 40) break;
      }
    }

    // dedupe, normalize
    skills = Array.from(new Set(skills.map(s => s.replace(/\s+/g, ' ').trim()))).filter(s => s.length > 1 && s.length < 120);

    // score and prioritize likely technical skills (prefer tokens containing tech keywords or short phrases)
    const scoreToken = (tok) => {
      const low = tok.toLowerCase();
      let score = 0;
      if (techKeywords.some(k => low.includes(k))) score += 10;
      if (tok.length < 20) score += 5;
      const words = tok.split(/\s+/).length;
      if (words <= 3) score += 3;
      if (/[,;:\/\\]/.test(tok)) score += 1;
      return score;
    };

    skills.sort((a, b) => scoreToken(b) - scoreToken(a));
    // keep only short phrases (<=4 words) or ones that contain known tech keywords
    skills = skills.filter(s => s.split(/\s+/).length <= 4 || techKeywords.some(k => s.toLowerCase().includes(k)));
    if (skills.length > 30) skills = skills.slice(0, 30);

    let experience = [];
    if (expIdx !== -1) {
      // collect paragraph blocks under experience heading
      const blocks = [];
      let current = [];
      for (let i = expIdx + 1; i < lines.length; i++) {
        const l = lines[i];
        if (!l) {
          if (current.length) { blocks.push(current.join(' ')); current = []; }
          continue;
        }
        // break if next major section
        if (skillHeadings.some(h => l.toLowerCase().includes(h))) break;
        // treat uppercase-start lines with company/role hints as separators
        if (/^[A-Z][A-Za-z0-9 ,.-]{4,}$/.test(l) && current.length) { blocks.push(current.join(' ')); current = [l]; continue; }
        current.push(l);
      }
      if (current.length) blocks.push(current.join(' '));

      // keep blocks that contain years or 'year' text or look like role/company lines
      for (const b of blocks) {
        if (/(19|20)\d{2}|\byears?\b|\bmonth\b/i.test(b) || /\bexperience\b/i.test(b)) {
          experience.push(b);
        } else if (b.split(' ').length <= 6 && /[A-Z][a-z]+/.test(b)) {
          experience.push(b);
        }
      }
    } else {
      // fallback: lines containing years or 'worked at' patterns
      for (const l of lines) {
        if (/(19|20)\d{2}|\bexperience\b|\bworked at\b|\bexperience as\b|\bat\b/i.test(l)) {
          experience.push(l);
        }
      }
    }

    // dedupe experience and limit
    experience = Array.from(new Set(experience)).slice(0, 20);

    return { skills, experience };
  };

  const handleRemoveSkill = (skillToRemove) => {
    const newRatings = { ...skillRatings };
    delete newRatings[skillToRemove];
    setSkillRatings(newRatings);
  };

  const handleNextStep = () => {
    setError(''); 

    // Validation for Step 1
    if (step === 1) {
      const hours = parseFloat(studyHours);
      if (!studyHours || isNaN(hours) || hours <= 0) {
        setError('Please enter a valid number of daily study hours (greater than 0).');
        return;
      }
      if (!educationLevel) {
        setError('Please select your education level.');
        return;
      }
    }

    // Validation for Step 2
    if (step === 2 && selectedCareers.length === 0) {
      setError('Please select at least one target career.');
      return;
    }

    // Validation for Step 3 (Make sure they added at least one skill)
    if (step === 3 && Object.keys(skillRatings).length === 0) {
      setError('Please add at least one skill to proceed.');
      return;
    }

    setStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setError(''); 
    setStep(prev => Math.max(prev - 1, 1));
  };

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#0a0b1e] p-6">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#8c5bf5]/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4f46e5]/20 blur-[120px] rounded-full pointer-events-none" />

      {loading ? (
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="w-12 h-12 border-4 border-[#8c5bf5]/20 border-t-[#8c5bf5] rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading career paths...</p>
        </div>
      ) : (
      <div className="w-full max-w-3xl z-10">
        <div className="mb-8">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">System Initialization</h1>
              <p className="text-slate-400 mt-1">Calibrating your personalized career DNA.</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#8c5bf5] uppercase tracking-widest">Step {step} of 4</span>
            </div>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#8c5bf5] to-[#4f46e5]"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        <GlassCard className="p-8 md:p-10 !rounded-3xl shadow-2xl bg-[#161022]/80 backdrop-blur-xl border border-white/10 min-h-[450px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div 
              key={step}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-[#8c5bf5]/20 text-[#8c5bf5]"><BookOpen size={24} /></div>
                    <h2 className="text-2xl font-bold text-white">Academic Profile</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Education Level</label>
                      <div className="relative">
                        <select 
                          value={educationLevel}
                          onChange={(e) => { setEducationLevel(e.target.value); setError(''); }}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-white focus:outline-none focus:border-[#8c5bf5] appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-[#161022]">Select Level</option>
                          <option value="ug" className="bg-[#161022]">Undergraduate (B.Tech, BBA, etc.)</option>
                          <option value="pg" className="bg-[#161022]">Postgraduate</option>
                          <option value="wp" className="bg-[#161022]">Working Professional</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {educationLevel === 'wp' ? 'Years of Experience' : 'Year of Study'}
                      </label>
                      <div className="relative">
                        <select
                          value={yearOfStudy}
                          onChange={(e) => { setYearOfStudy(e.target.value); setError(''); }}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-white focus:outline-none focus:border-[#8c5bf5] appearance-none cursor-pointer">
                          {educationLevel === 'wp' ? (
                            <>
                              <option value="" className="bg-[#161022]">Select Experience</option>
                              <option value="0-1" className="bg-[#161022]">0 - 1 Years</option>
                              <option value="1-3" className="bg-[#161022]">1 - 3 Years</option>
                              <option value="3-5" className="bg-[#161022]">3 - 5 Years</option>
                              <option value="5+" className="bg-[#161022]">5+ Years</option>
                            </>
                          ) : (
                            <>
                              <option value="" className="bg-[#161022]">Select Year</option>
                              <option value="1" className="bg-[#161022]">1st Year</option>
                              <option value="2" className="bg-[#161022]">2nd Year</option>
                              <option value="3" className="bg-[#161022]">3rd Year</option>
                              <option value="4" className="bg-[#161022]">4th Year</option>
                            </>
                          )}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daily Study Hours</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 2" 
                        value={studyHours}
                        onChange={(e) => { setStudyHours(e.target.value); setError(''); }}
                        className={`w-full bg-white/5 border rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                          error && (!studyHours || parseFloat(studyHours) <= 0) 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                            : 'border-white/10 focus:border-[#8c5bf5] focus:ring-[#8c5bf5]'
                        }`} 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daily Available Hours</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 4" 
                        value={availableHours}
                        onChange={(e) => { setAvailableHours(e.target.value); setError(''); }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:border-[#8c5bf5] focus:ring-[#8c5bf5] transition-all"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Course / Stream</label>
                      <div className="relative">
                        <select 
                          value={course}
                          onChange={(e) => { setCourse(e.target.value); setError(''); }}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-white focus:outline-none focus:border-[#8c5bf5] appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-[#161022]">Select Course</option>
                          <option value="engineering" className="bg-[#161022]">Engineering</option>
                          <option value="science" className="bg-[#161022]">Science</option>
                          <option value="commerce" className="bg-[#161022]">Commerce</option>
                          <option value="arts" className="bg-[#161022]">Arts</option>
                          <option value="other" className="bg-[#161022]">Other</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resume <span className="text-slate-600 normal-case font-normal">(optional — paste plain text)</span></label>
                      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4">
                          <textarea
                            placeholder="Paste your resume text here (optional)."
                            value={resumeText}
                            onChange={(e) => { setResumeText(e.target.value); setExtractedSkills([]); setExtractedExperience([]); }}
                            className="w-full min-h-[140px] bg-transparent text-sm text-slate-200 placeholder-slate-500 p-3 rounded resize-y focus:outline-none border border-white/5"
                          />
                          <div className="mt-3 flex flex-col sm:flex-row gap-3 items-start">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="file"
                                accept="application/pdf,image/*"
                                onChange={(e) => { setResumeFile(e.target.files?.[0] || null); }}
                                className="hidden"
                              />
                              <span className="px-4 py-2 bg-white/5 rounded-xl text-sm text-slate-300">Choose file</span>
                              <span className="text-xs text-slate-500">{resumeFile ? resumeFile.name : 'No file selected'}</span>
                            </label>

                            <button
                              type="button"
                              disabled={!resumeFile || isExtracting}
                              onClick={async () => {
                                  if (!resumeFile) return;
                                  try {
                                    setIsExtracting(true);
                                    setOcrProgress(0);

                                    // Resolve createWorker robustly in case of different bundler/module shapes
                                    const resolveCreateWorker = async () => {
                                      if (typeof createWorker === 'function') return createWorker;
                                      try {
                                        const mod = await import('tesseract.js');
                                        return mod.createWorker || (mod.default && mod.default.createWorker);
                                      } catch (e) {
                                        return null;
                                      }
                                    };

                                    const createWorkerFn = await resolveCreateWorker();
                                    if (!createWorkerFn) throw new Error('tesseract.createWorker not available');

                                    const worker = createWorkerFn({
                                      logger: (m) => {
                                        if (m && m.progress) setOcrProgress(Math.round(m.progress * 100));
                                      }
                                    });

                                    if (typeof worker.load !== 'function') {
                                      // Some builds return a Promise that resolves to a worker instance
                                      if (worker && typeof worker.then === 'function') {
                                        const realWorker = await worker;
                                        if (!realWorker) throw new Error('Invalid tesseract worker API');
                                        // call lifecycle methods only if present
                                        if (typeof realWorker.load === 'function') await realWorker.load();
                                        if (typeof realWorker.loadLanguage === 'function') await realWorker.loadLanguage('eng');
                                        if (typeof realWorker.initialize === 'function') await realWorker.initialize('eng');

                                        const arrayBuffer = await resumeFile.arrayBuffer();
                                        const { data: { text } } = await realWorker.recognize(new Uint8Array(arrayBuffer));
                                        if (typeof realWorker.terminate === 'function') await realWorker.terminate();

                                        const extracted = text || '';
                                        setResumeText(extracted);

                                        const parsed = parseResumeForSkillsAndExperience(extracted);
                                        setExtractedSkills(parsed.skills || []);
                                        setExtractedExperience(parsed.experience || []);

                                        try { await profileAPI.updateProfile({ resumeText: extracted }); } catch (saveErr) { console.error('Failed to save resumeText to profile', saveErr); setError('Saved locally but failed to persist to server.'); }
                                        return;
                                      }
                                      throw new Error('tesseract worker API missing lifecycle methods');
                                    }

                                    // call lifecycle methods only when available (newer builds may pre-load workers)
                                    if (typeof worker.load === 'function') await worker.load();
                                    if (typeof worker.loadLanguage === 'function') await worker.loadLanguage('eng');
                                    if (typeof worker.initialize === 'function') await worker.initialize('eng');

                                    const arrayBuffer = await resumeFile.arrayBuffer();
                                    const { data: { text } } = await worker.recognize(new Uint8Array(arrayBuffer));

                                    await worker.terminate();

                                  const extracted = text || '';
                                  setResumeText(extracted);

                                  // parse for skills/experience client-side
                                  const parsed = parseResumeForSkillsAndExperience(extracted);
                                  setExtractedSkills(parsed.skills || []);
                                  setExtractedExperience(parsed.experience || []);

                                  // Persist extracted text to backend as resumeText
                                  try {
                                    await profileAPI.updateProfile({ resumeText: extracted });
                                  } catch (saveErr) {
                                    console.error('Failed to save resumeText to profile', saveErr);
                                    setError('Saved locally but failed to persist to server.');
                                  }

                                } catch (e) {
                                  console.error('OCR failed', e);
                                  setError('Failed to extract text from the uploaded file.');
                                } finally {
                                  setIsExtracting(false);
                                  setOcrProgress(0);
                                }
                              }}
                              className={`px-4 py-2 rounded-xl font-bold ${resumeFile ? 'bg-[#8c5bf5] text-white' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}
                            >
                              {isExtracting ? `Extracting (${ocrProgress}%)` : 'Extract & Save'}
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">Tip: You can paste resume text or upload a PDF/image to extract text (OCR).</p>

                          
                        </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-6 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400"><Target size={24} /></div>
                      <h2 className="text-2xl font-bold text-white">Target Horizons</h2>
                    </div>
                    <span className="text-sm font-medium text-slate-400">Select 1 of 10</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {careers.slice(0, 10).map(career => {
                      const isSelected = selectedCareers.includes(career.id);
                      return (
                        <button 
                          key={career.id}
                          onClick={() => { toggleCareer(career.id); setError(''); }}
                          className={`p-4 rounded-xl border flex flex-col items-center gap-3 text-center transition-all duration-300 ${
                            isSelected 
                              ? 'bg-gradient-to-br from-[#8c5bf5]/20 to-[#4f46e5]/20 border-[#8c5bf5] shadow-[0_0_15px_rgba(140,91,245,0.3)]' 
                              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <career.icon size={24} className={isSelected ? 'text-[#8c5bf5]' : 'text-slate-400'} />
                          <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>{career.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: DYNAMIC SKILL BUILDER */}
              {step === 3 && (
                <div className="flex-1 flex flex-col h-full max-h-[400px]">
                  <div className="flex items-center gap-3 mb-4 shrink-0">
                    <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400"><Sliders size={24} /></div>
                    <h2 className="text-2xl font-bold text-white">Skill Declaration</h2>
                  </div>
                  <p className="text-sm text-slate-400 mb-6 shrink-0">Select a core skill required for your chosen paths, set your proficiency, and add it to your profile.</p>

                  {/* Input Row for adding new skills */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-6 shrink-0">
                    <div className="relative flex-1">
                      <select 
                        value={currentSkillSelect}
                        onChange={(e) => setCurrentSkillSelect(e.target.value)}
                        className="w-full bg-[#161022] border border-white/10 rounded-xl py-3 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-[#8c5bf5] appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-[#161022]">Select a skill...</option>
                        {unaddedSkills.map(skill => (
                          <option key={skill} value={skill} className="bg-[#161022] uppercase">{skill}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="relative w-full sm:w-48 shrink-0">
                      <select 
                        value={currentLevelSelect}
                        onChange={(e) => setCurrentLevelSelect(e.target.value)}
                        className="w-full bg-[#161022] border border-white/10 rounded-xl py-3 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-[#8c5bf5] appearance-none cursor-pointer"
                      >
                        <option value="25" className="bg-[#161022]">Beginner</option>
                        <option value="50" className="bg-[#161022]">Intermediate</option>
                        <option value="75" className="bg-[#161022]">Advanced</option>
                        <option value="100" className="bg-[#161022]">Expert</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <button 
                      onClick={handleAddSkill}
                      disabled={!currentSkillSelect}
                      className={`px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                        currentSkillSelect 
                          ? 'bg-[#8c5bf5] text-white hover:brightness-110 shadow-[0_0_15px_rgba(140,91,245,0.4)]' 
                          : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/10'
                      }`}
                    >
                      <Plus size={18} /> Add
                    </button>
                  </div>

                  {/* Render the list of added skills */}
                  <div className="overflow-y-auto pr-2 pb-4 scrollbar-hide flex-1 space-y-3">
                    {Object.entries(skillRatings).length === 0 ? (
                      <div className="text-center p-8 border border-dashed border-white/10 rounded-2xl text-slate-500 text-sm font-medium">
                        No skills added yet. Select a skill from the dropdown above.
                      </div>
                    ) : (
                      Object.entries(skillRatings).map(([skill, level]) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }} 
                          animate={{ opacity: 1, scale: 1 }}
                          key={skill} 
                          className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              level < 30 ? 'bg-orange-400' : 
                              level < 70 ? 'bg-blue-400' : 
                              'bg-emerald-400'
                            }`} />
                            <span className="text-sm font-bold text-white uppercase tracking-wider">{skill}</span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                              level < 30 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' : 
                              level < 70 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 
                              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {getSkillLevelLabel(level)}
                            </span>
                            <button 
                              onClick={() => handleRemoveSkill(skill)} 
                              className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-1 rounded transition-colors"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#8c5bf5]/30 blur-[40px] rounded-full animate-pulse" />
                    <div className="w-24 h-24 bg-[#161022] border-4 border-[#8c5bf5] rounded-full flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(140,91,245,0.5)]">
                      <BrainCircuit size={40} className="text-[#8c5bf5]" />
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-3xl font-black text-white mb-2">Neural Link Ready</h2>
                    <p className="text-slate-400 max-w-md mx-auto">
                      To prevent overconfidence bias, the system will now administer a 3-level adaptive quiz based on your declared skills.
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full max-w-sm text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span className="text-sm text-slate-300">Level 1 - Conceptual Baseline</span>
                    </div>
                    <div className="flex items-center gap-3 mb-2 opacity-50">
                      <div className="w-4 h-4 rounded-full border border-slate-500" />
                      <span className="text-sm text-slate-400">Level 2 - Applied Problems</span>
                    </div>
                    <div className="flex items-center gap-3 opacity-50">
                      <div className="w-4 h-4 rounded-full border border-slate-500" />
                      <span className="text-sm text-slate-400">Level 3 - Scenario Synthesis</span>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Navigation & Errors */}
          <div className="mt-8 border-t border-white/5 pt-6 shrink-0">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-400 text-sm font-bold mb-4 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                <AlertCircle size={16} /> {error}
              </motion.div>
            )}

            <div className="flex justify-between items-center">
              {step > 1 ? (
                <button onClick={prevStep} className="px-5 py-2.5 rounded-full font-bold text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all">
                  <ArrowLeft size={18} /> Back
                </button>
              ) : <div></div>}
              
              {step < 4 ? (
                <button onClick={handleNextStep} className="px-8 py-2.5 bg-white text-[#0a0b1e] font-black rounded-full hover:bg-slate-200 flex items-center gap-2 transition-all shadow-lg">
                  Continue <ArrowRight size={18} />
                </button>
              ) : (
                <button onClick={async () => {
                  setSaving(true);
                  setError('');
                  try {
                    // Get career names from selected IDs
                    const careerNames = selectedCareers.map(id => {
                      const career = careers.find(c => c.id === id);
                      return career ? career.name : id;
                    });

                    // Normalize skillRatings values to numbers to satisfy backend validator
                    const normalizedSkillRatings = {};
                    if (skillRatings && typeof skillRatings === 'object') {
                      Object.entries(skillRatings).forEach(([k, v]) => {
                        const num = Number(v);
                        if (!Number.isNaN(num)) normalizedSkillRatings[k] = num;
                      });
                    }

                    const payload = {
                      educationLevel,
                      currentCourse: course,
                      yearOfStudy,
                      dailyStudyHours: parseFloat(studyHours),
                      dailyAvailableHours: availableHours ? parseFloat(availableHours) : undefined,
                      resumeText: resumeText?.trim() ? resumeText.trim() : undefined,
                      resumeSkills: extractedSkills && extractedSkills.length ? extractedSkills : undefined,
                      resumeExperience: extractedExperience && extractedExperience.length ? extractedExperience : undefined,
                      careerInterests: careerNames,
                      hasOnboarded: true,
                      skillRatings: Object.keys(normalizedSkillRatings).length ? normalizedSkillRatings : undefined,
                    };

                    // Debug: log payload before sending
                    console.debug('Profile setup payload:', payload);

                    const res = await profileAPI.setupProfile(payload);
                    onComplete();
                  } catch (err) {
                    console.error('Failed to save profile:', err);
                    // Surface Zod validation errors if present
                    const apiErr = err.response?.data;
                    if (apiErr) {
                      if (apiErr.errors && Array.isArray(apiErr.errors)) {
                        setError(apiErr.errors.map(e => `${e.field || ''}: ${e.message}`).join(' | '));
                      } else if (apiErr.msg) {
                        setError(apiErr.msg);
                      } else {
                        setError('Failed to save profile. See console for details.');
                      }
                    } else {
                      setError('Failed to save profile. Please try again.');
                    }
                    setSaving(false);
                  }
                }} disabled={saving} className="px-8 py-3 bg-gradient-to-r from-[#8c5bf5] to-[#4f46e5] text-white font-black rounded-full hover:shadow-[0_0_20px_rgba(140,91,245,0.4)] hover:scale-105 flex items-center gap-2 transition-all disabled:opacity-70">
                  {saving ? (
                    <><span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Saving...</>
                  ) : (
                    <>Commence Adaptive Quiz <BrainCircuit size={18} /></>
                  )}
                </button>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
      )}
    </div>
  );
}