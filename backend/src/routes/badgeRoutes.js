const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { getUserBadges, getSharedBadge } = require('../controllers/badgeController');

const router = express.Router();

router.get('/', protect, getUserBadges);
// Public: view shared badge (no auth)
router.get('/share/:token', getSharedBadge);

module.exports = router;