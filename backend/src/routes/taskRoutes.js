const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  getTodayTasks,
  completeTask,
  checkDailyCompletion,
} = require('../controllers/taskController');

const router = express.Router();

router.get('/today', protect, getTodayTasks);
router.post('/complete', protect, completeTask);
router.get('/check-completion', protect, checkDailyCompletion);

module.exports = router;