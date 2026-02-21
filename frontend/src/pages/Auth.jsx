import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Activity, ShieldCheck, MailCheck } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { authAPI } from '../services/api';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Simple mock for password strength
  const getPasswordStrength = () => {
    if (password.length === 0) return 0;
    if (password.length < 6) return 1;
    if (password.length < 10) return 2;
    return 3;
  };

  const strength = getPasswordStrength();

  // Handle Initial Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login API call
        const response = await authAPI.login({ email, password });
        const { token, user } = response.data;
        
        // Store token and user in localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        if (onLoginSuccess) onLoginSuccess();
      } else {
        // Register API call
        const response = await authAPI.register({ name, email, password });
        
        // Show verification screen on successful registration
        setShowVerification(true);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.msg || 
                          err.response?.data?.message || 
                          err.response?.data?.errors?.[0]?.message ||
                          'An error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Simulate the user clicking the link in their email
  const handleVerifySimulation = async () => {
    // In a real app, clicking the email link would redirect them back to the app
    // with a token in the URL (e.g., /verify?token=xyz)
    // For now, we'll switch to login mode
    setShowVerification(false);
    setIsLogin(true);
    setPassword('');
    setEmail('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0a0b1e]">
      
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#8c5bf5]/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#4f46e5]/20 blur-[150px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md px-6 z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-[#8c5bf5] to-[#4f46e5] rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(140,91,245,0.4)] mb-4">
            <Activity size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">CAREVO</h1>
          <p className="text-slate-400 text-sm mt-1">AI Career Intelligence</p>
        </div>

        <GlassCard className="p-8 !rounded-3xl shadow-2xl border-white/10 bg-[#161022]/80 backdrop-blur-2xl">
          <AnimatePresence mode="wait">
            
            {/* --- STATE 2: EMAIL VERIFICATION SCREEN --- */}
            {showVerification ? (
              <motion.div 
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-center py-4"
              >
                <div className="w-20 h-20 bg-[#8c5bf5]/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-[#8c5bf5]/30 relative">
                  <div className="absolute inset-0 rounded-full bg-[#8c5bf5]/20 animate-ping"></div>
                  <MailCheck size={36} className="text-[#8c5bf5] relative z-10" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">Check Your Inbox</h2>
                
                <p className="text-sm text-slate-400 leading-relaxed">
                  We've sent a secure verification link to <br/>
                  <span className="text-white font-bold">{email || "your email"}</span>. <br/>
                  Please click the link to activate your account.
                </p>

                <div className="pt-4">
                  {/* Demo Button to simulate the email redirect */}
                  <button 
                    onClick={handleVerifySimulation}
                    className="w-full py-3.5 bg-gradient-to-r from-[#8c5bf5] to-[#4f46e5] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(140,91,245,0.4)] hover:scale-[1.02] transition-all"
                  >
                    I've verified my email <ArrowRight size={18} />
                  </button>
                </div>

                <div className="mt-6 pt-2 border-t border-white/10">
                  <p className="text-xs text-slate-400">
                    Didn't receive the email? <button type="button" className="text-[#8c5bf5] font-bold hover:underline ml-1">Resend link</button>
                  </p>
                </div>
              </motion.div>
            ) : (
              
              /* --- STATE 1: LOGIN / REGISTER SCREEN --- */
              <motion.form 
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {isLogin ? 'Enter your credentials to continue.' : 'Start your AI-guided career journey.'}
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Name Field (Only on Register) */}
                {!isLogin && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="text" 
                        required 
                        placeholder="Alex Rivera" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#8c5bf5] focus:ring-1 focus:ring-[#8c5bf5] transition-all" 
                      />
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="email" 
                      required 
                      placeholder="alex@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#8c5bf5] focus:ring-1 focus:ring-[#8c5bf5] transition-all" 
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                    {isLogin && <a href="#" className="text-xs text-[#8c5bf5] hover:underline font-medium">Forgot Password?</a>}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="password" 
                      required 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#8c5bf5] focus:ring-1 focus:ring-[#8c5bf5] transition-all" 
                    />
                  </div>
                </div>

                {/* Password Strength (Only on Register) */}
                {!isLogin && (
                  <div className="space-y-2 pt-1">
                    <div className="flex gap-2 h-1.5 w-full">
                      <div className={`flex-1 rounded-full transition-all duration-300 ${strength >= 1 ? 'bg-red-500' : 'bg-white/10'}`}></div>
                      <div className={`flex-1 rounded-full transition-all duration-300 ${strength >= 2 ? 'bg-yellow-500' : 'bg-white/10'}`}></div>
                      <div className={`flex-1 rounded-full transition-all duration-300 ${strength >= 3 ? 'bg-emerald-500' : 'bg-white/10'}`}></div>
                    </div>
                    <p className="text-[10px] text-right text-slate-500 font-medium">
                      {strength === 0 ? 'Enter a password' : strength === 1 ? 'Weak' : strength === 2 ? 'Good' : 'Strong'}
                    </p>
                  </div>
                )}

                {/* Remember Me (Only on Login) */}
                {isLogin && (
                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" id="remember" className="w-4 h-4 rounded bg-white/5 border-white/10 text-[#8c5bf5] focus:ring-[#8c5bf5]" />
                    <label htmlFor="remember" className="text-sm text-slate-400 cursor-pointer">Remember me</label>
                  </div>
                )}

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3.5 mt-4 bg-gradient-to-r from-[#8c5bf5] to-[#4f46e5] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(140,91,245,0.4)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Toggle Login/Register (Hide if currently verifying email) */}
          {!showVerification && (
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => { setIsLogin(!isLogin); setPassword(''); }} 
                  className="text-[#8c5bf5] font-bold hover:underline"
                >
                  {isLogin ? 'Sign Up' : 'Log In'}
                </button>
              </p>
            </div>
          )}
        </GlassCard>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
          <ShieldCheck size={14} /> Secure AI Environment
        </div>
      </motion.div>
    </div>
  );
}