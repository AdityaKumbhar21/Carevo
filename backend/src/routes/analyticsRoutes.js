const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  getSkillProgress,
  getCareerProbability,
} = require('../controllers/analyticsController');

const router = express.Router();

router.get('/skills', protect, getSkillProgress);
router.get('/probability', protect, getCareerProbability);

module.exports = router;