const cron = require('node-cron');
const User = require('../models/User');
const Task = require('../models/Task');
const Reminder = require('../models/Reminder');
const { sendEmail } = require('./emailService');


cron.schedule('*/10 * * * *', async () => {
  try {
    console.log('Running reminder cron...');

    const now = new Date();

    // Get all reminder configs with daily reminders enabled
    const reminders = await Reminder.find({
      dailyTaskReminder: true,
    }).populate('user');

    for (const reminder of reminders) {
      const user = reminder.user;

      if (!user || !user.isVerified) continue;

      // Match reminder time (HH:MM)
      const currentTime = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: reminder.timezone || 'Asia/Kolkata',
      });

      if (currentTime !== reminder.reminderTime) continue;

      // Prevent duplicate same-day reminder
      const lastSent = reminder.lastDailyReminderSent;
      if (lastSent) {
        const lastDate = new Date(lastSent);
        lastDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (lastDate.getTime() === today.getTime()) {
          continue;
        }
      }

      // Check today's incomplete tasks
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const tomorrow = new Date(todayStart);
      tomorrow.setDate(todayStart.getDate() + 1);

      const tasks = await Task.find({
        user: user._id,
        completed: false,
        date: { $gte: todayStart, $lt: tomorrow },
      });

      if (tasks.length === 0) continue;

      
      await sendEmail(
        user.email,
        'Daily Task Reminder',
        `You have ${tasks.length} incomplete task(s) today. Stay consistent 🚀`
      );

      reminder.lastDailyReminderSent = new Date();
      await reminder.save();
    }

  } catch (err) {
    console.error('Reminder cron error:', err);
  }
});

module.exports = {
  startCrons: () => console.log('Reminder cron started'),
};