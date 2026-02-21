const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  checkIn,
  getStatus,
} = require('../controllers/gamificationController');

const router = express.Router();
router.post('/check-in', protect, checkIn);
router.get('/status', protect, getStatus);

module.exports = router;