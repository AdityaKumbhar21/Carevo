import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Timer, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { quizAPI } from '../services/api';

// Fallback mock data
const MOCK_QUESTIONS = [
  {
    skill: "Python",
    level: "Level 1 - Conceptual Baseline",
    question: "Which of the following data structures in Python is immutable?",
    options: ["List", "Dictionary", "Tuple", "Set"],
    correct: 2
  },
  {
    skill: "System Design",
    level: "Level 2 - Applied Problems",
    question: "When designing a highly available system, which component is primarily responsible for distributing incoming network traffic?",
    options: ["Message Queue", "Load Balancer", "API Gateway", "Reverse Proxy"],
    correct: 1
  },
  {
    skill: "Statistics",
    level: "Level 3 - Scenario Synthesis",
    question: "If a p-value is less than your chosen significance level (alpha), what is the correct statistical conclusion?",
    options: ["Accept the null hypothesis", "Reject the null hypothesis", "Increase the sample size", "Change the alpha value"],
    correct: 1
  }
];

export default function Quiz({ onComplete }) {
  const [questions, setQuestions] = useState(MOCK_QUESTIONS);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45); // 45 seconds per question
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch quiz questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await quizAPI.getQuiz();
        if (response.data && response.data.questions) {
          setQuestions(response.data.questions);
        }
      } catch (err) {
        console.error('Failed to fetch quiz questions:', err);
        // Use fallback data
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitting && !quizFinished && !loading) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !loading) {
      handleNext();
    }
  }, [timeLeft, isSubmitting, quizFinished, loading]);

  const handleSelect = (index) => {
    if (!isSubmitting) setSelectedOption(index);
  };

  const handleNext = () => {
    setIsSubmitting(true);
    
    // Simulate API delay for "AI processing"
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setSelectedOption(null);
        setIsSubmitting(false);
        setTimeLeft(45); // Reset timer
      } else {
        setQuizFinished(true);
      }
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0a0b1e] p-6">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-[#8c5bf5]/20 border-t-[#8c5bf5] rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-400 text-sm mt-4">Loading quiz questions...</p>
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
          <p className="text-slate-400 mb-8">Your career DNA has been successfully mapped. Generating your personalized roadmap and career matches...</p>
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
      
      <div className="w-full max-w-3xl z-10">
        {/* Header & Progress */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#8c5bf5] font-bold text-sm uppercase tracking-widest mb-2">
              <BrainCircuit size={18} /> AI Validation Engine
            </div>
            <h1 className="text-2xl font-black text-white">{question.skill}</h1>
            <p className="text-slate-400">{question.level}</p>
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