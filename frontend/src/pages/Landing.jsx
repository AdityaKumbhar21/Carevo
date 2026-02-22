import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useViewportScroll } from 'framer-motion';
import { ArrowRight, Target, Map, Flame, Fingerprint, Sparkles, ChevronRight, BarChart } from 'lucide-react';
// logo is served from Vite's `public` folder — reference by absolute path
const logoSrc = '/logo.png';

// simple testimonial data (could come from API later)
const testimonials = [
  { quote: 'I landed my dream role in 3 months thanks to Carevo roadmap.', author: 'Aisha R., Frontend Engineer' },
  { quote: 'The daily prompts keep me accountable and focused.', author: 'Carlos M., DevOps Specialist' },
  { quote: 'Finally a career tool built for builders, not buzzwords.', author: 'Priya K., Backend Developer' }
];

export default function Landing({ onStart }) {
  const [hovered, setHovered] = useState(false);

  // Magnetic button effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-50, 50], [5, -5]);
  const rotateY = useTransform(x, [-50, 50], [-5, 5]);

  // parallax scroll for orbs
  const { scrollYProgress } = useViewportScroll();
  const orbY1 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const orbY2 = useTransform(scrollYProgress, [0, 1], [0, -80]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] text-slate-200 overflow-x-hidden relative font-sans">

      {/* Animated Gradient Spotlight */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-[#8c5bf5]/20 blur-[140px] rounded-full animate-pulse"></div>
      </div>

      {/* Subtle Floating Orbs */}
      <motion.div
        className="absolute top-32 left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"
        style={{ y: orbY1 }}
        animate={{ y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 6 }}
      />
      <motion.div
        className="absolute bottom-32 right-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl"
        style={{ y: orbY2 }}
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 8 }}
      />

      {/* NAV */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <img src={logoSrc} alt="Carevo Logo" className="w-8 h-8" />
          <span className="text-lg font-bold text-white tracking-tight">Carevo</span>
        </div>

        <button
          onClick={onStart}
          className="px-5 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-sm transition-all hover:scale-105"
        >
          Sign In
        </button>
      </nav>

      <main className="relative z-10 flex flex-col items-center pt-24 pb-32 px-6 max-w-6xl mx-auto">

        {/* HERO */}
        <div className="text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8c5bf5]/10 border border-[#8c5bf5]/20 text-[#8c5bf5] text-xs font-semibold mb-8 backdrop-blur-md">
            <Sparkles size={12} /> Introducing Career Intelligence
          </div>

          <h1 className="text-5xl md:text-7xl font-semibold text-white leading-tight tracking-tight mb-6 relative">
            Navigate your career
            <br />
            <span className="relative inline-block text-[#8c5bf5]">
              without the guesswork
              <span className="absolute left-0 bottom-1 w-full h-[6px] bg-[#8c5bf5]/20 blur-sm"></span>
            </span>
          </h1>

          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
            Stop relying on static roadmaps. Carevo uses real-time AI to map,
            validate, and track your daily progress toward your dream role.
          </p>

          {/* Magnetic CTA */}
          <motion.button
            onClick={onStart}
            style={{ rotateX, rotateY }}
            onMouseMove={handleMouseMove}
            onMouseLeave={reset}
            className="px-8 py-4 bg-white text-black font-semibold rounded-xl flex items-center gap-2 mx-auto shadow-xl hover:bg-slate-200 transition-all"
          >
            Start Executing <ArrowRight size={16} />
          </motion.button>
        </div>

        {/* FEATURE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full">
          {[
            {
              icon: <Target size={24} />,
              title: "Dynamic Career DNA",
              desc: "AI validation replaces self-reporting with measurable readiness.",
              color: "text-[#8c5bf5]",
            },
            {
              icon: <Map size={24} />,
              title: "Bandwidth Matching",
              desc: "Roadmaps adapt to your real daily availability.",
              color: "text-blue-400",
            },
            {
              icon: <Flame size={24} />,
              title: "Gamified Execution",
              desc: "Developer metrics and XP keep you consistent.",
              color: "text-orange-400",
            }
          ].map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-8 bg-white/[0.03] border border-white/5 rounded-3xl backdrop-blur-md hover:border-white/15 transition-all shadow-lg"
            >
              <div className={`w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 ${f.color}`}>
                {f.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* TESTIMONIALS */}
        <motion.div
          className="mt-20 w-full max-w-3xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl text-center font-semibold text-white mb-8">
            What builders are saying
          </h2>
          <div className="space-y-6">
            {testimonials.map((t, idx) => (
              <motion.blockquote
                key={idx}
                className="bg-white/[0.04] p-6 rounded-2xl backdrop-blur-md italic text-slate-200"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
              >
                “{t.quote}”
                <footer className="mt-4 text-right text-sm font-semibold">
                  — {t.author}
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </motion.div>

        {/* FINAL CTA */}
        <div className="mt-32 text-center max-w-2xl">
          <h2 className="text-4xl font-semibold text-white mb-6">
            Stop learning in a vacuum.
          </h2>
          <p className="text-slate-400 mb-8">
            Align your skills with live industry standards and execute daily.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={onStart}
            className="px-8 py-4 bg-[#8c5bf5] text-white rounded-xl hover:bg-[#7a4de0] transition-all shadow-lg"
          >
            Launch Carevo App <ChevronRight size={16} />
          </motion.button>
        </div>

        {/* FOOTER */}
        <footer className="mt-24 py-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Carevo. All rights reserved.
        </footer>
      </main>
    </div>
  );
}