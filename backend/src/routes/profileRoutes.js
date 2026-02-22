const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const {
  setupProfileSchema,
  updateProfileSchema,
} = require('../validators/profileValidator');
const {
  setupProfile,
  getProfile,
  updateProfile,
} = require('../controllers/profileController');

const router = express.Router();

router.post('/setup', protect, validate(setupProfileSchema), setupProfile);
router.put('/update', protect, validate(updateProfileSchema), updateProfile);
router.get('/', protect, getProfile);
// OCR upload: accepts file and returns extracted text (saves to user.resumeText)
// Note: OCR is performed client-side; no server-side OCR route required.

module.exports = router;