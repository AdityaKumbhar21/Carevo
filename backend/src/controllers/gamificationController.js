const Gamification = require('../models/Gamification');
const { awardBadgeIfEligible } = require('../services/badgeService');


const calculateLevel = (xp) => {
  return Math.floor(xp / 200) + 1;
};


const checkIn = async (req, res) => {
  try {
    const userId = req.user._id;

    let gam = await Gamification.findOne({ user: userId });

    
    if (!gam) {
      gam = await Gamification.create({
        user: userId,
        streak: 0,
        longestStreak: 0,
        coins: 0,
        xp: 0,
        level: 1,
        totalCheckIns: 0,
      });
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const last = gam.lastCheckIn
      ? new Date(gam.lastCheckIn)
      : null;

    if (last) {
      last.setHours(0, 0, 0, 0);

      
      if (now.getTime() === last.getTime()) {
        return res.status(400).json({
          msg: 'Already checked in today',
        });
      }
    }

  
    if (last) {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);

      if (last.getTime() === yesterday.getTime()) {
        gam.streak += 1;
      } else {
        gam.streak = 1;
      }
    } else {
      gam.streak = 1;
    }

    if (gam.streak > gam.longestStreak) {
      gam.longestStreak = gam.streak;
    }

   
    const coinReward = 10;
    const xpReward = 50;

    gam.coins += coinReward;
    gam.xp += xpReward;
    gam.totalCheckIns += 1;
    gam.lastCheckIn = now;

    gam.level = calculateLevel(gam.xp);

    await gam.save();

    
    await awardBadgeIfEligible(userId);

    // Compute derived fields for frontend
    const totalXP = gam.xp || 0;
    const currentDay = Math.floor(totalXP / 200) + 1;
    const currentDayXP = totalXP % 200;
    const nextDayXPrequirement = 200;
    const xpToNextDay = nextDayXPrequirement - currentDayXP;

    res.json({
      msg: 'Check-in successful',
      streak: gam.streak,
      coins: gam.coins,
      xp: gam.xp,
      totalXP,
      level: gam.level,
      currentDay,
      currentDayXP,
      nextDayXPrequirement,
      xpToNextDay,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Check-in failed' });
  }
};


const getStatus = async (req, res) => {
  try {
    const gam = await Gamification.findOne({ user: req.user._id });

    if (!gam) {
      return res.json({
        streak: 0,
        longestStreak: 0,
        coins: 0,
        xp: 0,
        totalXP: 0,
        level: 1,
        totalCheckIns: 0,
        lastCheckIn: null,
        currentDay: 1,
        currentDayXP: 0,
        nextDayXPrequirement: 200,
        xpToNextDay: 200,
        dailyXP: 0,
      });
    }

    const totalXP = gam.xp || 0;
    const currentDay = Math.floor(totalXP / 200) + 1;
    const currentDayXP = totalXP % 200;
    const nextDayXPrequirement = 200;
    const xpToNextDay = nextDayXPrequirement - currentDayXP;

    // Compute today's XP earned (approximate from tasks completed today + check-in)
    const Task = require('../models/Task');
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTasks = await Task.countDocuments({ user: req.user._id, completedAt: { $gte: todayStart } });
    const checkedInToday = gam.lastCheckIn && new Date(gam.lastCheckIn).toDateString() === new Date().toDateString();
    const dailyXP = (todayTasks * 20) + (checkedInToday ? 50 : 0);

    res.json({
      streak: gam.streak,
      longestStreak: gam.longestStreak,
      coins: gam.coins,
      xp: totalXP,
      totalXP,
      level: gam.level,
      totalCheckIns: gam.totalCheckIns,
      lastCheckIn: gam.lastCheckIn,
      currentDay,
      currentDayXP,
      nextDayXPrequirement,
      xpToNextDay,
      dailyXP,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch status' });
  }
};



const rewardForTaskCompletion = async (
  userId,
  xpReward = 20,
  coinReward = 5
) => {
  let gam = await Gamification.findOne({ user: userId });

  if (!gam) {
    gam = await Gamification.create({
      user: userId,
      streak: 0,
      longestStreak: 0,
      coins: 0,
      xp: 0,
      level: 1,
      totalCheckIns: 0,
    });
  }

  gam.xp += xpReward;
  gam.coins += coinReward;
  gam.level = calculateLevel(gam.xp);

  await gam.save();

  // 🏆 Badge check after task completion
  await awardBadgeIfEligible(userId);
};


const getBadges = async (req, res) => {
  try {
    const UserBadge = require('../models/UserBadge');
    const Badge = require('../models/Badge');

    const userBadges = await UserBadge.find({ user: req.user._id }).populate('badge');
    const allBadges = await Badge.find();

    // Icon name mapping: normalize any emoji/legacy icons to lucide icon names
    const iconNormalize = (raw) => {
      if (!raw) return 'BadgeCheck';
      // Already a lucide name
      if (['GraduationCap', 'CalendarDays', 'BadgeCheck', 'Lock', 'Trophy', 'Flame', 'Star', 'Medal'].includes(raw)) return raw;
      // Emoji fallbacks
      const emojiMap = { '🔥': 'CalendarDays', '🏆': 'GraduationCap', '✅': 'BadgeCheck', '⭐': 'Star', '🎖️': 'Medal' };
      return emojiMap[raw] || 'BadgeCheck';
    };

    const badges = allBadges.map((badge) => {
      const earned = userBadges.find(ub => ub.badge._id.toString() === badge._id.toString());
      return {
        id: badge._id,
        name: badge.name,
        category: badge.description || badge.type,
        icon: iconNormalize(badge.icon),
        color: earned ? 'purple' : 'gray',
        unlocked: !!earned,
        awardedAt: earned?.awardedAt || null,
        shareToken: earned?.shareToken || null,
      };
    });

    res.json({ badges });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch badges' });
  }
};


module.exports = {
  checkIn,
  getStatus,
  getBadges,
  rewardForTaskCompletion,
};