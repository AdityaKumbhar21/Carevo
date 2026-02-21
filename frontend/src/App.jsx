import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Target,
  Map,
  Calendar,
  BarChart2,
  Trophy,
  Bell,
  Activity,
  Settings as SettingsIcon,
  Loader2
} from 'lucide-react';

import {
  NavLink,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate
} from 'react-router-dom';

import { GlassCard } from './components/GlassCard';
import { profileAPI, gamificationAPI } from './services/api';

// Pages
import Auth from './pages/Auth';
import OTPVerify from './pages/OTPVerify';
import Onboarding from './pages/Onboarding';
import Quiz from './pages/Quiz';
import Dashboard from './pages/Dashboard';
import CareerMatch from './pages/CareerMatch';
import Roadmap from './pages/Roadmap';
import Today from './pages/Today';
import Analytics from './pages/Analytics';
import Gamification from './pages/Gamification';
import Settings from './pages/Settings';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(localStorage.getItem('authToken'))
  );

  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [xp, setXp] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // -------------------------
  // FETCH USER PROFILE (hooks must run before any early return)
  // -------------------------
  useEffect(() => {
    if (!isAuthenticated) return;
    let mounted = true;
    const fetchUserState = async () => {
      try {
        setLoadingProfile(true);
        const res = await profileAPI.getProfile();
        const user = res.data.user || res.data;

        if (!mounted) return;
        setHasOnboarded(!!user.hasOnboarded);
        setHasCompletedQuiz(!!user.hasCompletedQuiz);

        try {
          const gamRes = await gamificationAPI.getStatus();
          if (mounted) setXp(gamRes.data.xp || gamRes.data.totalXP || 0);
        } catch (e) {
          console.log('Gamification not ready');
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    };

    fetchUserState();
    return () => { mounted = false; };
  }, [isAuthenticated]);

  // XP global listener (attach only when authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;
    const handler = (e) => {
      const xpVal = e?.detail?.xp;
      if (typeof xpVal === 'number') setXp(xpVal);
    };
    window.addEventListener('xpUpdated', handler);
    return () => window.removeEventListener('xpUpdated', handler);
  }, [isAuthenticated]);

  // -------------------------
  // PUBLIC ROUTES (NOT LOGGED IN)
  // -------------------------
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route
          path="/"
          element={<Auth onLoginSuccess={() => setIsAuthenticated(true)} />}
        />
        <Route path="/verify-otp" element={<OTPVerify />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  

  // -------------------------
  // LOADING SCREEN
  // -------------------------
  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[#0a0b1e]">
        <Loader2 size={40} className="animate-spin text-[#8c5bf5]" />
      </div>
    );
  }

  // -------------------------
  // GATED FLOWS
  // -------------------------
  if (!hasOnboarded) {
    return <Onboarding onComplete={() => setHasOnboarded(true)} />;
  }

  if (!hasCompletedQuiz) {
    return <Quiz onComplete={() => setHasCompletedQuiz(true)} />;
  }

  // -------------------------
  // PROTECTED APP LAYOUT
  // -------------------------

  const tabs = [
    { id: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { id: 'Career Match', path: '/career-match', icon: Target },
    { id: 'Roadmap', path: '/roadmap', icon: Map },
    { id: 'Today', path: '/today', icon: Calendar },
    { id: 'Trajectory', path: '/trajectory', icon: BarChart2 },
    { id: 'Milestones', path: '/milestones', icon: Trophy },
    { id: 'Settings', path: '/settings', icon: SettingsIcon }
  ];

  const tabToPath = Object.fromEntries(tabs.map(t => [t.id, t.path]));
  const pathToTab = Object.fromEntries(tabs.map(t => [t.path, t.id]));

  const activeTab = pathToTab[location.pathname] || 'Dashboard';

  return (
    <div className="flex h-screen w-full bg-[#0a0b1e] text-slate-100 font-sans overflow-hidden p-4 gap-4">

      {/* SIDEBAR */}
      <aside className="w-64 h-full flex flex-col shrink-0">
        <GlassCard className="h-full flex flex-col p-6">

          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#8c5bf5] to-[#4f46e5] rounded-xl flex items-center justify-center text-white">
              <Activity size={24} />
            </div>
            <div>
              <h2 className="font-bold text-lg uppercase">CAREVO</h2>
              <p className="text-xs text-[#8c5bf5] font-bold uppercase">
                Pro Member
              </p>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-2">
            {tabs.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-full transition-all w-full ${
                    isActive
                      ? 'bg-[#8c5bf5]/15 text-[#8c5bf5]'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <item.icon size={20} />
                <span className="text-sm font-semibold">{item.id}</span>
              </NavLink>
            ))}
          </nav>
        </GlassCard>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-4">

        {/* HEADER */}
        <div className="flex items-center justify-between pt-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {activeTab}
          </h1>

          <div className="flex items-center gap-4">

            <GlassCard className="flex items-center px-5 py-2 !rounded-full border-[#8c5bf5]/40 bg-[#8c5bf5]/10 shadow-[0_0_15px_rgba(140,91,245,0.2)]">
              <Trophy size={18} className="text-[#8c5bf5] mr-2" />
              <span className="font-black text-white text-lg">
                {xp}
                <span className="text-[#8c5bf5] text-xs font-bold uppercase tracking-wider ml-1">
                  XP
                </span>
              </span>
            </GlassCard>

            <GlassCard className="p-2.5 !rounded-full cursor-pointer hover:bg-white/10 transition-colors relative">
              <Bell size={18} className="text-slate-400" />
              <div className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-[#0a0b1e]"></div>
            </GlassCard>

          </div>
        </div>

        {/* PROTECTED ROUTES */}
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/career-match" element={<CareerMatch />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/today" element={<Today />} />
          <Route path="/trajectory" element={<Analytics />} />
          <Route path="/milestones" element={<Gamification />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

      </main>
    </div>
  );
}