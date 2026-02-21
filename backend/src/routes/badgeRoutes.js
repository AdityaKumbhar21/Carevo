const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { getUserBadges } = require('../controllers/badgeController');

const router = express.Router();

router.get('/', protect, getUserBadges);

module.exports = router;