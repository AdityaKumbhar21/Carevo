import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { authAPI } from '../services/api';

const OTP_LENGTH = 6;

export default function OTPVerify() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const inputsRef = useRef([]);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let t;
    if (cooldown > 0) {
      t = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const e = params.get('email');
      if (e) setEmail(e);
    } catch (e) {
      // ignore
    }
  }, []);

  const handleSend = async () => {
    setStatus('sending');
    setMessage('');
    try {
      await authAPI.sendOtp(email);
      setStatus('sent');
      setMessage('OTP sent to your email.');
      setCooldown(60);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.msg || 'Failed to send OTP');
    }
  };

  const handleDigit = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && inputsRef.current[index + 1]) inputsRef.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !digits[index] && inputsRef.current[index - 1]) {
      const prev = [...digits];
      prev[index - 1] = '';
      setDigits(prev);
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = digits.join('');
    if (otpCode.length !== OTP_LENGTH) {
      setStatus('error');
      setMessage('Please enter the full code');
      return;
    }

    setStatus('verifying');
    setMessage('');
    try {
      const res = await authAPI.verifyOtp(email, otpCode);
      setStatus('success');
      setMessage(res.data?.msg || 'Verified');

      // Store token and user then redirect to app root (Onboarding will run)
      if (res.data?.token) {
        localStorage.setItem('authToken', res.data.token);
        if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
      }

      // Slight delay to show success state
      setTimeout(() => {
        window.location.href = '/';
      }, 700);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.msg || 'Invalid or expired OTP');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0a0b1e]">
      <div className="w-full max-w-md px-6 z-10">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">Verify Email</h1>
          <p className="text-slate-400 text-sm mt-1">Enter your email and the OTP sent to it.</p>
        </div>

        <GlassCard className="p-8 !rounded-3xl shadow-2xl border-white/10 bg-[#161022]/80 backdrop-blur-2xl text-center">
            <div className="space-y-6">
              <div className="text-left">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</label>
                <div className="mt-2 flex items-center gap-2">
                  <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="flex-1 p-3 rounded-xl bg-white/5 text-white" />
                  <button onClick={handleSend} disabled={!email || cooldown>0} className={`px-4 py-2 rounded-xl font-bold ${cooldown>0? 'bg-white/6 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#8c5bf5] to-[#4f46e5] text-white'}`}>
                    {cooldown>0 ? `Resend (${cooldown}s)` : 'Send OTP'}
                  </button>
                </div>
              </div>

              <div className="text-left">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enter Code</label>
                <div className="mt-3 flex justify-center gap-3">
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={el => inputsRef.current[i] = el}
                      value={d}
                      onChange={(e) => handleDigit(i, e.target.value.slice(-1))}
                      onKeyDown={(e) => handleKeyDown(e, i)}
                      maxLength={1}
                      inputMode="numeric"
                      className="w-12 h-12 text-center rounded-xl bg-white/6 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#8c5bf5]"
                    />
                  ))}
                </div>
              </div>

              <div>
                <button onClick={handleVerify} className="w-full py-3 bg-gradient-to-r from-[#8c5bf5] to-[#4f46e5] text-white rounded-xl flex items-center justify-center gap-3">
                  {status === 'verifying' ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : status === 'success' ? (
                    <CheckCircle size={18} className="text-green-300" />
                  ) : (
                    <ArrowRight size={18} />
                  )}
                  <span className="font-bold">Verify & Continue</span>
                </button>
              </div>

              {message && <p className={`text-sm ${status==='error'?'text-red-400':'text-slate-300'}`}>{message}</p>}
            </div>
        </GlassCard>
      </div>
    </div>
  );
}
