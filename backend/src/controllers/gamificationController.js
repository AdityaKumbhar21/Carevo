const Gamification = require('../models/Gamification');

// XP → Level formula
const calculateLevel = (xp) => {
  return Math.floor(xp / 200) + 1;
};

const checkIn = async (req, res) => {
  try {
    const userId = req.user._id;

    let gam = await Gamification.findOne({ user: userId });

    // Auto-create if not exists
    if (!gam) {
      gam = await Gamification.create({ user: userId });
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const last = gam.lastCheckIn
      ? new Date(gam.lastCheckIn)
      : null;

    if (last) {
      last.setHours(0, 0, 0, 0);

      // ❌ Already checked in today
      if (now.getTime() === last.getTime()) {
        return res.status(400).json({
          msg: 'Already checked in today',
        });
      }
    }

    // Check streak continuity
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

    // Update longest streak
    if (gam.streak > gam.longestStreak) {
      gam.longestStreak = gam.streak;
    }

    // Reward logic
    const coinReward = 10;
    const xpReward = 50;

    gam.coins += coinReward;
    gam.xp += xpReward;
    gam.totalCheckIns += 1;
    gam.lastCheckIn = now;

    // Level recalculation
    gam.level = calculateLevel(gam.xp);

    await gam.save();

    res.json({
      msg: 'Check-in successful',
      streak: gam.streak,
      coins: gam.coins,
      xp: gam.xp,
      level: gam.level,
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
        coins: 0,
        xp: 0,
        level: 1,
      });
    }

    res.json({
      streak: gam.streak,
      longestStreak: gam.longestStreak,
      coins: gam.coins,
      xp: gam.xp,
      level: gam.level,
      totalCheckIns: gam.totalCheckIns,
      lastCheckIn: gam.lastCheckIn,
    });

  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch status' });
  }
};



const rewardForTaskCompletion = async (userId, xpReward = 20, coinReward = 5) => {
  let gam = await Gamification.findOne({ user: userId });

  if (!gam) {
    gam = await Gamification.create({ user: userId });
  }

  gam.xp += xpReward;
  gam.coins += coinReward;
  gam.level = calculateLevel(gam.xp);

  await gam.save();
};


module.exports = {
  checkIn,
  getStatus,
rewardForTaskCompletion,
};