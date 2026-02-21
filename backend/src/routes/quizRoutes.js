const express = require('express');
const { protect } = require('../middlewares/authMiddleware');

const {
  generateValidationQuiz,
  getValidationQuiz,
  submitQuiz,
} = require('../controllers/quizController');

const router = express.Router();

router.post('/validation/generate', protect, generateValidationQuiz);

router.get('/validation', protect, getValidationQuiz);

router.post('/submit', protect, submitQuiz);

module.exports = router;