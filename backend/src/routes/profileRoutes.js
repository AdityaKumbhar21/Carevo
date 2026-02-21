const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const {
  setupProfileSchema,
  updateProfileSchema,
} = require('../validations/profileValidation');
const {
  setupProfile,
  updateProfile,
  getProfile,
} = require('../controllers/profileController');

const router = express.Router();

router.post('/setup', protect, validate(setupProfileSchema), setupProfile);
router.put('/update', protect, validate(updateProfileSchema), updateProfile);
router.get('/', protect, getProfile);

module.exports = router;