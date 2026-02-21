const mongoose = require('mongoose');

const GamificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    streak: {
      type: Number,
      default: 0,
    },

    longestStreak: {
      type: Number,
      default: 0,
    },

    coins: {
      type: Number,
      default: 0,
    },

    xp: {
      type: Number,
      default: 0,
    },

    level: {
      type: Number,
      default: 1,
    },

    totalCheckIns: {
      type: Number,
      default: 0,
    },

    lastCheckIn: Date,

    lastRewardDate: Date, // prevents double rewards same day
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gamification', GamificationSchema);