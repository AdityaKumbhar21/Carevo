import React, { useState, useEffect } from 'react';
import { Flame, Medal, GraduationCap, CalendarDays, BadgeCheck, Lock, Trophy, Sparkles, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { gamificationAPI } from '../services/api';

export default function Gamification() {
  const [gamificationData, setGamificationData] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const milestoneMessages = [
    'Loading your achievement vault...',
    'Counting your XP crystals...',
    'Polishing your badges...',
    'Syncing your streak data...',
    'Preparing your milestone timeline...'
  ];
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => setLoadingMsgIdx(i => (i + 1) % milestoneMessages.length), 2000);
    return () => clearInterval(interval);
  }, [loading]);

  const itemAnim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  // Fetch gamification data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [gamResponse, badgesResponse] = await Promise.all([
          gamificationAPI.getGamification(),
          gamificationAPI.getBadges()
        ]);
        
        setGamificationData(gamResponse.data);
        setBadges(badgesResponse.data.badges || []);
        // Automatic daily check-in: if lastCheckIn is not today, attempt check-in once
        try {
          const last = gamResponse.data?.lastCheckIn;
          const lastDate = last ? new Date(last).toDateString() : null;
          const today = new Date().toDateString();
          if (lastDate !== today) {
            const checkRes = await gamificationAPI.checkIn();
            setGamificationData((prev) => ({
              ...prev,
              streak: checkRes.data.streak,
              coins: checkRes.data.coins,
              xp: checkRes.data.xp,
              totalXP: checkRes.data.totalXP ?? checkRes.data.xp ?? prev.totalXP,
              level: checkRes.data.level,
              lastCheckIn: new Date().toISOString(),
              currentDay: checkRes.data.currentDay ?? prev.currentDay,
              currentDayXP: checkRes.data.currentDayXP ?? prev.currentDayXP,
              nextDayXPrequirement: checkRes.data.nextDayXPrequirement ?? prev.nextDayXPrequirement,
              xpToNextDay: checkRes.data.xpToNextDay ?? prev.xpToNextDay,
            }));
            // re-fetch badges since check-in may have awarded one
            try {
              const freshBadges = await gamificationAPI.getBadges();
              setBadges(freshBadges.data.badges || []);
            } catch (e) {}
            // notify app about xp change
            window.dispatchEvent(new CustomEvent('xpUpdated', { detail: { xp: checkRes.data.totalXP || checkRes.data.xp || 0 } }));
            window.dispatchEvent(new Event('contributionUpdated'));
          }
        } catch (ciErr) {
          // fail silently — don't block UI
          console.warn('Auto check-in failed', ciErr);
        }
      } catch (err) {
        setError('Failed to load gamification data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#8c5bf5]/20 border-t-[#8c5bf5] rounded-full animate-spin"></div>
          <motion.p
            key={loadingMsgIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-slate-400 text-sm font-medium text-center"
          >
            {milestoneMessages[loadingMsgIdx]}
          </motion.p>
        </div>
      </div>
    );
  }

  if (!gamificationData) {
    return (
      <div className="max-w-7xl mx-auto w-full pb-10">
        <GlassCard className="p-6 border border-red-500/30 bg-red-500/5">
          <p className="text-red-400 font-medium">{error || 'Failed to load gamification'}</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full pb-10 space-y-8 mt-2">
      
      {/* XP & Stats Section */}
      <motion.section initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Roadmap Progress Card (Replaced Levels with Days) */}
        <motion.div variants={itemAnim} className="lg:col-span-2">
          <GlassCard className="p-8 relative overflow-hidden group h-full !rounded-3xl">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#8c5bf5]/20 blur-[100px] rounded-full"></div>
            <div className="flex justify-between items-end mb-6 relative z-10">
              <div>
                <span className="bg-[#8c5bf5]/20 text-[#8c5bf5] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-2 inline-block">Roadmap Progress</span>
                <h3 className="text-3xl font-black text-white">Day {gamificationData.currentDay}</h3>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-[#8c5bf5]">{gamificationData.currentDayXP} <span className="text-slate-400 text-sm font-medium">/ {gamificationData.nextDayXPrequirement} XP</span></p>
                <p className="text-xs text-slate-500 font-bold mt-1">{gamificationData.xpToNextDay} XP to unlock Day {gamificationData.currentDay + 1}</p>
              </div>

            </div>
            <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden z-10">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${(gamificationData.currentDayXP / gamificationData.nextDayXPrequirement) * 100}%` }} 
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                className="absolute top-0 left-0 h-full bg-[#8c5bf5] rounded-full shadow-[0_0_15px_rgba(140,91,245,0.6)]" 
              />
            </div>
          </GlassCard>
        </motion.div>

        {/* Total XP Card (Replaced Coins with XP) */}
        <motion.div variants={itemAnim}>
          <GlassCard className="p-8 flex flex-col justify-between border-[#8c5bf5]/20 border-2 h-full !rounded-3xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Experience</p>
                <p className="text-4xl font-black text-white mt-1">{gamificationData.totalXP} <span className="text-xl text-[#8c5bf5] font-bold">XP</span></p>
              </div>
              <div className="w-12 h-12 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-2xl flex items-center justify-center text-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.15)]">
                <Trophy size={26} />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <span className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                <Sparkles size={14} /> +{gamificationData.dailyXP} today
              </span>
              <span className="text-slate-500 text-xs">from daily tasks</span>
            </div>
            <button className="mt-4 w-full py-3 bg-white/5 hover:bg-[#8c5bf5]/10 border border-[#8c5bf5]/10 rounded-full text-xs font-bold text-white transition-all">
              View Analytics
            </button>
          </GlassCard>
        </motion.div>
      </motion.section>

      {/* Middle Section: Streak and Badges */}
      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }} className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Streak Widget */}
        <motion.div variants={itemAnim} className="xl:col-span-1">
          <GlassCard className="p-8 flex flex-col items-center text-center justify-center border-l-4 border-l-[#FF4D00] !rounded-3xl h-full">
            <div className="relative">
              <Flame size={72} className="text-[#FF4D00] fill-[#FF4D00] drop-shadow-[0_0_15px_rgba(255,77,0,0.6)]" />
              <div className="absolute -top-1 -right-1 w-8 h-6 bg-[#FF4D00] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0a0a0c]">HOT</div>
            </div>
            <h4 className="text-4xl font-black text-white mt-4 tracking-tighter">{gamificationData.streak} Days</h4>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Current Streak</p>
            <div className="grid grid-cols-7 gap-1 mt-6 w-full">
              {Array.from({ length: gamificationData.streak }).map((_, i) => <div key={i} className="h-1.5 rounded-full bg-[#FF4D00]"></div>)}
              {Array.from({ length: Math.max(0, 7 - (gamificationData.streak % 7)) }).map((_, i) => <div key={i + gamificationData.streak} className="h-1.5 rounded-full bg-slate-800"></div>)}
            </div>
            {gamificationData.longestStreak > gamificationData.streak && (
              <p className="text-[10px] text-slate-500 mt-3 italic font-medium">Keep it up! {gamificationData.longestStreak - gamificationData.streak} days to reach your best of {gamificationData.longestStreak} 🔥</p>
            )}
          </GlassCard>
        </motion.div>

        {/* Achievement Badges Section */}
        <motion.div variants={itemAnim} className="xl:col-span-3">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Medal className="text-[#8c5bf5]" size={24} /> Achievement Badges
            </h3>
            <button className="text-xs font-bold text-[#8c5bf5] hover:underline">View All {badges.length}</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.map((badge) => {
              const colorMap = {
                'orange': { bg: 'bg-orange-500/10', border: 'border-orange-500/20', hover: 'hover:border-orange-500/50', icon: 'text-orange-500' },
                'slate': { bg: 'bg-slate-300/10', border: 'border-slate-300/20', hover: 'hover:border-slate-300/50', icon: 'text-slate-300' },
                'purple': { bg: 'bg-[#8c5bf5]/20', border: 'border-[#8c5bf5]/40', hover: 'hover:border-[#8c5bf5]/70', icon: 'text-[#8c5bf5]' },
                'gray': { bg: 'bg-slate-800', border: 'border-slate-700', hover: '', icon: 'text-slate-500' }
              };
              
              const colors = colorMap[badge.color] || colorMap['slate'];
              const isLocked = !badge.unlocked;

              const IconComponent = {
                GraduationCap, CalendarDays, BadgeCheck, Lock, Trophy, Flame, Medal
              }[badge.icon] || BadgeCheck;

              const handleShare = async (e) => {
                e.stopPropagation();
                if (!badge.shareToken) return;
                const shareUrl = `${window.location.origin}/badge/${badge.shareToken}`;
                const shareText = `I just earned the "${badge.name}" badge on CarEvo! 🏆`;
                if (navigator.share) {
                  try {
                    await navigator.share({ title: `CarEvo Badge: ${badge.name}`, text: shareText, url: shareUrl });
                  } catch (err) {}
                } else {
                  await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                  alert('Badge link copied to clipboard!');
                }
              };
              
              return (
                <GlassCard 
                  key={badge.id}
                  className={`p-6 flex flex-col items-center text-center border transition-all group cursor-pointer relative !rounded-2xl ${
                    isLocked 
                      ? 'opacity-40 grayscale'
                      : `${colors.border} hover:border-${badge.color}-500/50 ${colors.hover}`
                  } ${badge.epic && !isLocked ? `bg-[#8c5bf5]/5 shadow-[0_0_15px_rgba(140,91,245,0.15)] ${colors.border}` : colors.bg}`}
                >
                  {/* Share button for unlocked badges */}
                  {!isLocked && badge.shareToken && (
                    <button
                      onClick={handleShare}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white/5 hover:bg-[#8c5bf5]/20 text-slate-400 hover:text-[#8c5bf5] transition-all opacity-0 group-hover:opacity-100"
                      title="Share badge"
                    >
                      <Share2 size={14} />
                    </button>
                  )}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border group-hover:scale-110 transition-transform ${colors.bg} ${colors.border} ${!isLocked && badge.epic ? `shadow-[0_0_15px_rgba(140,91,245,0.4)]` : ''}`}>
                    <IconComponent size={32} className={colors.icon} />
                  </div>
                  <p className="text-sm font-bold text-white">{badge.name}</p>
                  <p className={`text-[10px] mt-1 font-medium ${isLocked ? 'text-slate-500' : badge.epic ? 'text-[#8c5bf5] font-bold' : 'text-slate-500'}`}>
                    {badge.category}
                  </p>
                </GlassCard>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

    </div>
  );
}