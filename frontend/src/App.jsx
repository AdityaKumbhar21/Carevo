import React, { useState } from 'react';
import { LayoutDashboard, Target, Map, Calendar, BarChart2, Trophy, Bell, Activity, Settings as SettingsIcon } from 'lucide-react';
import { GlassCard } from './components/GlassCard';

// Import our page components
import Auth from './pages/Auth';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false); 
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false); 
  const [activeTab, setActiveTab] = useState('Dashboard');

  if (!isAuthenticated) return <Auth onLoginSuccess={() => setIsAuthenticated(true)} />;
  if (isAuthenticated && !hasOnboarded) return <Onboarding onComplete={() => setHasOnboarded(true)} />;
  if (isAuthenticated && hasOnboarded && !hasCompletedQuiz) return <Quiz onComplete={() => setHasCompletedQuiz(true)} />;

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
              <p className="text-xs text-[#8c5bf5] font-bold uppercase">Pro Member</p>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-2">
            {[
              { id: 'Dashboard', icon: LayoutDashboard },
              { id: 'Career Match', icon: Target },
              { id: 'Roadmap', icon: Map },
              { id: 'Today', icon: Calendar },
              { id: 'Trajectory', icon: BarChart2 },
              { id: 'Milestones', icon: Trophy },
              { id: 'Settings', icon: SettingsIcon }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all w-full ${
                  activeTab === item.id ? 'bg-[#8c5bf5]/15 text-[#8c5bf5]' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="text-sm font-semibold">{item.id}</span>
              </button>
            ))}
          </nav>
        </GlassCard>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
        
        {/* Global Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
             <h1 className="text-2xl font-bold tracking-tight">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-4">
            
            {/* REPLACED SEARCH BAR WITH GLOBAL XP POINTS */}
            <GlassCard className="flex items-center px-5 py-2 !rounded-full border-[#8c5bf5]/40 bg-[#8c5bf5]/10 shadow-[0_0_15px_rgba(140,91,245,0.2)]">
              <Trophy size={18} className="text-[#8c5bf5] mr-2" />
              <span className="font-black text-white text-lg">450 <span className="text-[#8c5bf5] text-xs font-bold uppercase tracking-wider ml-0.5">XP</span></span>
            </GlassCard>
            
            {/* Optional Notification Bell */}
            <GlassCard className="p-2.5 !rounded-full cursor-pointer hover:bg-white/10 transition-colors relative">
              <Bell size={18} className="text-slate-400" />
              <div className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-[#0a0b1e]"></div>
            </GlassCard>
            
          </div>
        </div>

        {/* Dynamic Page Rendering */}
        {activeTab === 'Dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'Career Match' && <CareerMatch />}
        {activeTab === 'Roadmap' && <Roadmap />}
        {activeTab === 'Today' && <Today />} 
        {activeTab === 'Trajectory' && <Analytics />}
        {activeTab === 'Milestones' && <Gamification />}
        {activeTab === 'Settings' && <Settings />}
        
      </main>
    </div>
  );
}