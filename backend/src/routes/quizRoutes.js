const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { generateQuiz, submitQuiz } = require('../controllers/quizController');

const router = express.Router();
router.post('/generate', protect, generateQuiz);
router.post('/submit', protect, submitQuiz);

module.exports = router;