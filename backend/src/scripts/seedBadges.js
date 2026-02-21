const Badge = require('../models/Badge');

const badges = [
  {
    name: 'First Check-In',
    code: 'FIRST_CHECKIN',
    description: 'Completed your first daily check-in.',
    type: 'streak',
    criteria: { value: 1 },
  },
  {
    name: '15 Day Streak',
    code: 'STREAK_15',
    description: 'Maintained streak for 15 days.',
    type: 'streak',
    criteria: { value: 15 },
  },
  {
    name: 'Daily Task Achiever',
    code: 'TASK_10',
    description: 'Completed 10 tasks.',
    type: 'task',
    criteria: { value: 10 },
  },
];