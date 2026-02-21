// routes/careerRoutes.js

const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  getCareers,
  getRecommendations,
  simulateCareer,
} = require('../controllers/careerController');

const router = express.Router();


router.get('/', protect, getCareers);
router.get('/recommendations', protect, getRecommendations);
router.post('/simulate', protect, simulateCareer);

module.exports = router;