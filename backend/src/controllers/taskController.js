const Task = require('../models/Task');
const Roadmap = require('../models/Roadmap');
const { rewardForTaskCompletion } = require('./gamificationController');



const getTodayTasks = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const tasks = await Task.find({
      user: req.user._id,
      date: { $gte: today, $lt: tomorrow },
    }).sort({ createdAt: 1 });

    res.json(tasks);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch today tasks' });
  }
};


const completeTask = async (req, res) => {
  try {
    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({ msg: 'taskId required' });
    }

    const task = await Task.findOne({
      _id: taskId,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    // Prevent double completion
    if (task.completed) {
      return res.status(400).json({
        msg: 'Task already completed',
      });
    }

    task.completed = true;
    task.completedAt = new Date();
    await task.save();

    // 🔥 Reward user
    await rewardForTaskCompletion(req.user._id);

    // 🔥 Update roadmap progress
    const totalTasks = await Task.countDocuments({
      roadmap: task.roadmap,
    });

    const completedTasks = await Task.countDocuments({
      roadmap: task.roadmap,
      completed: true,
    });

    const progress =
      totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);

    await Roadmap.findByIdAndUpdate(task.roadmap, {
      progressPercentage: progress,
      status: progress === 100 ? 'completed' : 'active',
    });

    res.json({
      msg: 'Task completed successfully',
      progressPercentage: progress,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to update task' });
  }
};


const checkDailyCompletion = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const tasks = await Task.find({
      user: req.user._id,
      date: { $gte: today, $lt: tomorrow },
    });

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(t => t.completed).length;

    const allCompleted =
      totalTasks > 0 && completedTasks === totalTasks;

    res.json({
      totalTasks,
      completedTasks,
      allCompleted,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to check completion' });
  }
};


module.exports = {
  getTodayTasks,
  completeTask,
  checkDailyCompletion,
};