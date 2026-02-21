const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const Gamification = require('../models/Gamification');
const Task = require('../models/Task');
const crypto = require('crypto');

const awardBadgeIfEligible = async (userId) => {
  const gam = await Gamification.findOne({ user: userId });

  if (!gam) return;

  const badges = await Badge.find();

  for (const badge of badges) {
    let eligible = false;

    if (badge.type === 'streak') {
      if (gam.streak >= badge.criteria.value) {
        eligible = true;
      }
    }

    if (badge.type === 'task') {
      const completedTasks = await Task.countDocuments({
        user: userId,
        completed: true,
      });

      if (completedTasks >= badge.criteria.value) {
        eligible = true;
      }
    }

    if (eligible) {
      const exists = await UserBadge.findOne({
        user: userId,
        badge: badge._id,
      });

      if (!exists) {
        await UserBadge.create({
          user: userId,
          badge: badge._id,
          shareToken: crypto.randomBytes(12).toString('hex'),
        });
      }
    }
  }
};

module.exports = { awardBadgeIfEligible };