const express = require('express');
const {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  debugToken,
  testVerifyRawToken,
  sendOtp,
  verifyOtp,
  proctoringViolation,
} = require('../controllers/authController');

const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validators/authValidatior');

const router = express.Router();


router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
// Support both /verify-email/:token and /verify-email?token=... (some clients may use query)
router.get('/verify-email', verifyEmail);
router.get('/verify-email/:token', verifyEmail);
// Dev-only: inspect verification token for an email (masked). Not for production.
router.get('/debug-token', debugToken);
// Dev-only: test a raw token directly (for debugging token mismatch)
router.get('/test-verify', testVerifyRawToken);
router.post('/test-verify', testVerifyRawToken);
// OTP endpoints
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), resetPassword);
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// Proctoring violation: reset user data and force re-onboarding
router.post('/proctoring-violation', protect, proctoringViolation);

module.exports = router;