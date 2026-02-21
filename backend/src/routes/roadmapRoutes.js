// routes/roadmapRoutes.js

const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  generateRoadmap,
  getRoadmap,
} = require('../controllers/roadmapController');

const router = express.Router();


router.post('/generate', protect, generateRoadmap);
router.get('/', protect, getRoadmap);

module.exports = router;