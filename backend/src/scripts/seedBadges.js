require('dotenv').config({
  path: require('path').resolve(__dirname, '../../.env'),
});

const mongoose = require('mongoose');
const Badge = require('../models/Badge');

const MONGO_URI = process.env.MONGO_URI;

const badges = [
  {
    name: 'First Check-In',
    code: 'FIRST_CHECKIN',
    description: 'Completed your first daily check-in.',
    type: 'streak',
    criteria: { value: 1 },
    icon: 'CalendarDays',
  },
  {
    name: '7 Day Streak',
    code: 'STREAK_7',
    description: 'Maintained streak for 7 days.',
    type: 'streak',
    criteria: { value: 7 },
    icon: 'CalendarDays',
  },
  {
    name: '15 Day Streak',
    code: 'STREAK_15',
    description: 'Maintained streak for 15 days.',
    type: 'streak',
    criteria: { value: 15 },
    icon: 'CalendarDays',
  },
  {
    name: '30 Day Streak',
    code: 'STREAK_30',
    description: 'Achieved a 30-day streak!',
    type: 'streak',
    criteria: { value: 30 },
    icon: 'CalendarDays',
  },
  {
    name: 'First Task',
    code: 'TASK_1',
    description: 'Completed your first task.',
    type: 'task',
    criteria: { value: 1 },
    icon: 'BadgeCheck',
  },
  {
    name: 'Task Achiever',
    code: 'TASK_10',
    description: 'Completed 10 tasks.',
    type: 'task',
    criteria: { value: 10 },
    icon: 'BadgeCheck',
  },
  {
    name: 'Task Master',
    code: 'TASK_50',
    description: 'Completed 50 tasks.',
    type: 'task',
    criteria: { value: 50 },
    icon: 'GraduationCap',
  },
];

const seedBadges = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');

    await Badge.deleteMany();
    console.log('Old badges removed');

    await Badge.insertMany(badges);
    console.log('Badges seeded successfully');

    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedBadges();