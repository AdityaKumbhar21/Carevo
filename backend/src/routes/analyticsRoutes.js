const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  getSkillProgress,
  getCareerProbability,
  getOverview,
} = require('../controllers/analyticsController');

const router = express.Router();

router.get('/skills', protect, getSkillProgress);
router.get('/probability', protect, getCareerProbability);
router.get('/overview', protect, getOverview);

module.exports = router;