import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Timer, ArrowRight, CheckCircle2, AlertCircle, ShieldAlert, Maximize, AlertTriangle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { quizAPI, profileAPI, authAPI } from '../services/api';

export default function Quiz({ onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [currentLevel, setCurrentLevel] = useState('easy');
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overallFinished, setOverallFinished] = useState(false);

  // Proctoring state
  const [proctoringActive, setProctoringActive] = useState(false);
  const [proctoringReady, setProctoringReady] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [warningMessage, setWarningMessage] = useState('');
  const [violated, setViolated] = useState(false);
  const warningsRef = useRef(0);
  const quizStartedRef = useRef(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const lastWarningAtRef = useRef(0);

  // Fetch user profile to get career and generate three-level quizzes
  const [quizzes, setQuizzes] = useState([]); // [{level, quizId, questions}]
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);

  const [career, setCareer] = useState(null);
  const [skillUsed, setSkillUsed] = useState('general');

  // === PROCTORING: Violation handler ===
  const handleViolation = useCallback(async () => {
    setViolated(true);
    try {
      await authAPI.proctoringViolation();
    } catch (err) {
      console.error('Failed to report proctoring violation:', err);
    }
    // Clear auth and redirect to registration
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setTimeout(() => {
      window.location.href = '/';
    }, 3000);
  }, []);

  // === PROCTORING: Show warning ===
  const addWarning = useCallback((msg) => {
    if (!quizStartedRef.current) return;

    const now = Date.now();
    // cooldown: ignore warnings within 2 seconds of the last one
    if (now - lastWarningAtRef.current < 2000) return;
    lastWarningAtRef.current = now;

    const newCount = warningsRef.current + 1;
    warningsRef.current = newCount;
    setWarnings(newCount);
    setWarningMessage(msg);

    if (newCount === 3) {
      handleViolation();
    } else {
      // Clear warning message after 4 seconds
      setTimeout(() => setWarningMessage(''), 4000);
    }
  }, [handleViolation]);

  // === PROCTORING: Enter fullscreen ===
  const enterFullscreen = useCallback(async () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) await el.msRequestFullscreen();
      return true;
    } catch (err) {
      console.error('Fullscreen request failed:', err);
      return false;
    }
  }, []);

  // === PROCTORING: Start quiz with fullscreen ===
  const startProctoring = useCallback(async () => {
    const success = await enterFullscreen();
    if (success) {
      // reset warning counters and cooldown
      setWarnings(0);
      warningsRef.current = 0;
      setWarningMessage('');
      lastWarningAtRef.current = 0;

      setProctoringActive(true);
      setProctoringReady(true);
      setQuizStarted(true);
      quizStartedRef.current = true;
    } else {
      setError('Fullscreen is required to take this quiz. Please allow fullscreen access.');
    }
  }, [enterFullscreen]);

  // === PROCTORING: Fullscreen change listener ===
  useEffect(() => {
    if (!quizStarted) return;

    const handleFullscreenChange = () => {
      const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
      if (!isFullscreen && quizStartedRef.current && !violated) {
        addWarning('You exited fullscreen. Please remain in fullscreen mode during the quiz.');
        // Try to re-enter fullscreen
        enterFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [quizStarted, addWarning, enterFullscreen, violated]);

  // === PROCTORING: Tab visibility change listener ===
  useEffect(() => {
    if (!quizStarted) return;

    const handleVisibilityChange = () => {
      if (document.hidden && quizStartedRef.current && !violated) {
        addWarning('Tab switch detected. Do not leave the quiz tab.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [quizStarted, addWarning, violated]);

  // === PROCTORING: DevTools detection (resize-based heuristic) ===
  useEffect(() => {
    if (!quizStarted) return;

    let devtoolsOpen = false;
    const threshold = 160;

    const checkDevTools = () => {
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      const isOpen = widthDiff || heightDiff;
      
      if (isOpen && !devtoolsOpen && quizStartedRef.current && !violated) {
        devtoolsOpen = true;
        addWarning('DevTools detected. Please close developer tools during the quiz.');
      } else if (!isOpen) {
        devtoolsOpen = false;
      }
    };

    const interval = setInterval(checkDevTools, 1000);

    return () => clearInterval(interval);
  }, [quizStarted, addWarning, violated]);

  // === PROCTORING: Keyboard shortcut blocking ===
  useEffect(() => {
    if (!quizStarted) return;

    const handleKeyDown = (e) => {
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u')) ||
        (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        if (quizStartedRef.current && !violated) {
          addWarning('Developer shortcuts are not allowed during the quiz.');
        }
      }
    };

    // Block right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [quizStarted, addWarning, violated]);

  // Cleanup: exit fullscreen when quiz finishes or component unmounts
  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    const initValidationFlow = async () => {
      try {
        setLoading(true);
        const profileRes = await profileAPI.getProfile();
        const profile = profileRes.data;
        const c = profile.careerInterests?.[0];
        if (!c) {
          setError('No career selected. Please complete onboarding first.');
          setLoading(false);
          return;
        }
        setCareer(c);

        // Ensure validation quizzes exist (backend will skip AI if already present)
        // Keep any returned quiz summaries so we can show progress
        // Determine a target skill for validation: prefer explicit skill ratings, then parsed resume skills, then fallback to 'general'
        const profileSkillKeys = profile.skillRatings ? Object.keys(profile.skillRatings) : [];
        const skillToTest = (profileSkillKeys && profileSkillKeys.length > 0)
          ? profileSkillKeys[0]
          : 'general';

        // Persist the skill used for all subsequent quiz fetches
        setSkillUsed(skillToTest);

        const genRes = await quizAPI.generateValidation({ career: c, skill: skillToTest });
        if (genRes?.data?.quizzes) {
          setQuizzes(genRes.data.quizzes.map((q) => ({ level: q.level, quizId: q.quizId })));
        }

        // Fetch the first level (easy)
        const qRes = await quizAPI.getValidation({ career: c, skill: skillToTest, level: 'easy' });
        if (qRes.data && qRes.data.questions) {
          setCurrentLevel(qRes.data.level || 'easy');
          setQuestions(qRes.data.questions);
          setQuizId(qRes.data.quizId);
          setAnswers(new Array(qRes.data.questions.length).fill(null));
          setCurrentQ(0);
        } else {
          setError('Failed to load validation quiz.');
        }
      } catch (err) {
        console.error('Failed to initialize validation quiz:', err);
        setError('Failed to generate/load quizzes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initValidationFlow();
  }, []);

  // Timer countdown
  useEffect(() => {
    // Only start countdown after quiz has started (fullscreen accepted)
    if (!quizStarted) return;

    if (timeLeft > 0 && !isSubmitting && !quizFinished && !loading) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !loading) {
      handleNext();
    }
  }, [timeLeft, isSubmitting, quizFinished, loading, quizStarted]);

  const handleSelect = (index) => {
    if (!isSubmitting) setSelectedOption(index);
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    
    // Save the selected answer
    const newAnswers = [...answers];
    newAnswers[currentQ] = questions[currentQ].options[selectedOption] ?? null;
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setTimeout(() => {
        setCurrentQ(currentQ + 1);
        setSelectedOption(null);
        setIsSubmitting(false);
        setTimeLeft(45);
      }, 500);
    } else {
      // Submit quiz to backend
      try {
        if (quizId) {
          const res = await quizAPI.submitQuiz({ quizId, answers: newAnswers, timeTakenSeconds: questions.length * 45 });
          const { nextLevel, passed } = res.data || {};

          // Allow progression to the next level regardless of pass/fail
          if (nextLevel) {
            // record that this level was completed
            setQuizzes((prev) => {
              // avoid duplicate entries for same quizId
              const exists = prev.find((p) => p.quizId === quizId);
              if (exists) return prev;
              return [...prev, { level: currentLevel, quizId }];
            });

            // fetch next level quiz from server (answers hidden)
            try {
              setLoading(true);
              const nextRes = await quizAPI.getValidation({ career, skill: skillUsed, level: nextLevel });
              if (nextRes.data && nextRes.data.questions) {
                setCurrentLevel(nextRes.data.level || nextLevel);
                setQuestions(nextRes.data.questions);
                setQuizId(nextRes.data.quizId);
                setAnswers(new Array(nextRes.data.questions.length).fill(null));
                setCurrentQ(0);
                setSelectedOption(null);
                setTimeLeft(45);
                setIsSubmitting(false);
                setLoading(false);
                return;
              }
            } catch (e) {
              console.error('Failed to load next level quiz:', e);
            } finally {
              setLoading(false);
            }
          }
        }
        // finished all quizzes
        // push the last quiz result into summaries (if not already)
        setQuizzes((prev) => {
          const exists = prev.find((p) => p.quizId === quizId);
          if (exists) return prev;
          return [...prev, { level: currentLevel, quizId }];
        });

          await profileAPI.updateProfile({ hasCompletedQuiz: true });
        setOverallFinished(true);
        // Exit fullscreen on quiz completion
        quizStartedRef.current = false;
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      } catch (err) {
        console.error('Failed to submit quiz:', err);
      }
      setQuizFinished(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0a0b1e] p-6">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-[#8c5bf5]/20 border-t-[#8c5bf5] rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-400 text-sm mt-4">Generating AI quiz questions...</p>
      </div>
    );
  }

  // === PROCTORING VIOLATION SCREEN ===
  if (violated) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0a0b1e] p-6 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-24 h-24 bg-red-500/20 border-4 border-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
            <ShieldAlert size={40} className="text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Proctoring Violation</h2>
          <p className="text-red-400 font-bold mb-2">Maximum warnings exceeded (3/3)</p>
          <p className="text-slate-400 mb-6 max-w-md">
            You've violated the quiz proctoring rules multiple times. Your quiz data has been reset. 
            You will be redirected to register again.
          </p>
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <div className="w-4 h-4 border-2 border-slate-500/30 border-t-slate-500 rounded-full animate-spin"></div>
            Redirecting...
          </div>
        </motion.div>
      </div>
    );
  }

  // === PROCTORING GATEWAY: Show before quiz starts ===
  if (!proctoringReady && !error && questions.length > 0) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0a0b1e] p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-[#8c5bf5]/20 border-4 border-[#8c5bf5] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(140,91,245,0.4)]">
            <ShieldAlert size={36} className="text-[#8c5bf5]" />
          </div>
          <h2 className="text-3xl font-black text-white mb-3">Proctored Assessment</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            This quiz is proctored for integrity. Please read the rules below carefully before starting.
          </p>
          
          <GlassCard className="p-6 text-left mb-6 space-y-4">
            <div className="flex items-start gap-3">
              <Maximize size={18} className="text-[#8c5bf5] mt-0.5 shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">Fullscreen Required</p>
                <p className="text-slate-400 text-xs">The quiz will launch in fullscreen mode. Do not exit fullscreen.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">No Tab Switching</p>
                <p className="text-slate-400 text-xs">Switching tabs or windows will trigger a warning.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldAlert size={18} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">No Developer Tools</p>
                <p className="text-slate-400 text-xs">Opening DevTools or using keyboard shortcuts will be detected.</p>
              </div>
            </div>
            <hr className="border-white/5" />
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-red-400 font-bold text-sm">3 Warnings = Disqualification</p>
                <p className="text-slate-400 text-xs">After 3 violations, your quiz data will be reset and you must re-register.</p>
              </div>
            </div>
          </GlassCard>
          
          <button 
            onClick={startProctoring}
            className="w-full py-4 bg-gradient-to-r from-[#8c5bf5] to-[#4f46e5] text-white font-black rounded-xl hover:shadow-[0_0_20px_rgba(140,91,245,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <Maximize size={20} /> Enter Fullscreen & Start Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0a0b1e] p-6 text-center">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Quiz Generation Failed</h2>
        <p className="text-slate-400 mb-6">{error || 'No questions were generated.'}</p>
        <button 
          onClick={onComplete}
          className="px-8 py-3 bg-[#8c5bf5] text-white font-bold rounded-xl hover:brightness-110 transition-all"
        >
          Skip to Dashboard
        </button>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0a0b1e] p-6 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full">
          <div className="w-24 h-24 bg-[#8c5bf5]/20 border-4 border-[#8c5bf5] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(140,91,245,0.5)]">
            <CheckCircle2 size={40} className="text-[#8c5bf5]" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Neural Scan Complete</h2>
          <p className="text-slate-400 mb-8">You completed {quizzes.length || 1} quizzes. Generating your personalized roadmap and career matches...</p>
          <button 
            onClick={onComplete}
            className="w-full py-4 bg-gradient-to-r from-[#8c5bf5] to-[#4f46e5] text-white font-black rounded-xl hover:shadow-[0_0_20px_rgba(140,91,245,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            Enter Dashboard <ArrowRight size={20} />
          </button>
        </motion.div>
      </div>
    );
  }

  const question = questions[currentQ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#0a0b1e] p-6">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#8c5bf5]/20 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Proctoring Warning Overlay */}
      <AnimatePresence>
        {warningMessage && !violated && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full"
          >
            <div className="bg-red-500/10 border-2 border-red-500/50 backdrop-blur-xl rounded-2xl p-4 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} className="text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-red-400 font-bold text-sm">Warning {warnings}/3</p>
                  <p className="text-slate-300 text-xs">{warningMessage}</p>
                </div>
              </div>
              <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${(warnings / 3) * 100}%` }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proctoring Status Indicator */}
      {proctoringActive && (
        <div className="fixed top-4 right-4 z-[90] flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Proctored</span>
          <span className="text-[10px] font-bold text-red-400">{warnings}/3</span>
        </div>
      )}

      <div className="w-full max-w-3xl z-10">
        {/* Header & Progress */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#8c5bf5] font-bold text-sm uppercase tracking-widest mb-2">
              <BrainCircuit size={18} /> AI Validation Engine • {currentLevel.toUpperCase()}
            </div>
            <h1 className="text-2xl font-black text-white">Skill Assessment</h1>
            <p className="text-slate-400">Question {currentQ + 1} of {questions.length}</p>
          </div>
          
          <div className="flex flex-col items-end">
            <div className={`flex items-center gap-2 font-bold text-xl mb-2 ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              <Timer size={24} /> 00:{timeLeft.toString().padStart(2, '0')}
            </div>
            <span className="text-xs text-slate-500 font-bold uppercase">Question {currentQ + 1} of {questions.length}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-8">
          <motion.div 
            className="h-full bg-[#8c5bf5]"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQ) / questions.length) * 100}%` }}
          />
        </div>

        {/* Quiz Card */}
        <GlassCard className="p-8 md:p-10 !rounded-3xl shadow-2xl bg-[#161022]/80 backdrop-blur-xl border border-white/10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-8 leading-relaxed">
                {question.question}
              </h2>

              <div className="space-y-4">
                {question.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={isSubmitting}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${
                      selectedOption === idx 
                        ? 'border-[#8c5bf5] bg-[#8c5bf5]/10 shadow-[0_0_15px_rgba(140,91,245,0.2)]' 
                        : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-slate-200 font-medium">{opt}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedOption === idx ? 'border-[#8c5bf5]' : 'border-slate-600'
                    }`}>
                      {selectedOption === idx && <div className="w-2.5 h-2.5 bg-[#8c5bf5] rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleNext}
                  disabled={selectedOption === null || isSubmitting}
                  className={`px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all ${
                    selectedOption !== null 
                      ? 'bg-[#8c5bf5] text-white hover:brightness-110 shadow-lg' 
                      : 'bg-white/5 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Analyzing...' : 'Submit Answer'} <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  );
}


