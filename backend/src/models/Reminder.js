// models/Reminder.js

const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    
    dailyTaskReminder: {
      type: Boolean,
      default: true,
    },

    streakAlert: {
      type: Boolean,
      default: true,
    },

    milestoneReminder: {
      type: Boolean,
      default: true,
    },

   
    reminderTime: {
      type: String,
      default: '19:00',
    },

    
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },

    
    lastDailyReminderSent: Date,
    lastStreakAlertSent: Date,
    lastMilestoneReminderSent: Date,

  },
  { timestamps: true }
);

module.exports = mongoose.model('Reminder', ReminderSchema);