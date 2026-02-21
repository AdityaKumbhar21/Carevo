const User = require('../models/User');
const Gamification = require('../models/Gamification');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const { sendOtpEmail } = require('../services/emailService');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });


const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const user = new User({ name, email, password });

    // Generate a 6-digit OTP and store its hash (OTP-only verification flow).
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    user.otpHash = otpHash;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    if (process.env.NODE_ENV !== 'production') {
      console.debug('REGISTER: otp=', otp);
      console.debug('REGISTER: otpHash=', otpHash);
    }
    await user.save();

    // 🔥 AUTO CREATE GAMIFICATION DOC
    await Gamification.create({
      user: user._id,
    });

    // For OTP-only flow we send the OTP in the email without any link.
    await sendVerificationEmail(email, null, otp);

    res.status(201).json({
      msg: 'Registration successful. Please verify your email.',
    });

  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ msg: 'Please verify your email first' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};


const verifyEmail = async (req, res) => {
  try {
    // Link-based verification has been removed in favor of OTP-only flow.
    // If a browser opens this route, redirect them to the OTP entry page.
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const acceptsHtml = String(req.headers.accept || '').includes('text/html');

    if (acceptsHtml) {
      return res.redirect(`${frontendUrl}/verify-otp?reason=link_disabled`);
    }

    return res.status(410).json({ msg: 'Link-based verification disabled. Use OTP flow.' });

  } catch (err) {
    console.error('VERIFY EMAIL ERROR:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};


const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Do not reveal if user exists
    if (!user) {
      return res.json({ msg: 'If account exists, reset link sent' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    user.resetToken = hashedToken;
    user.resetTokenExpiry = Date.now() + 60 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    await sendEmail(
      email,
      'Reset Password',
      `Click to reset your password: ${resetUrl}`
    );

    res.json({ msg: 'If account exists, reset link sent' });

  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};


// Send an OTP to the given email (for verification or resend)
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: 'Email is required' });

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    user.otpHash = otpHash;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    await sendOtpEmail(email, otp);

    return res.json({ msg: 'OTP sent' });
  } catch (err) {
    console.error('SEND OTP ERROR:', err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
};


const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ msg: 'Email and OTP required' });

    const otpHash = crypto.createHash('sha256').update(String(otp).trim()).digest('hex');

    const user = await User.findOne({
      email,
      otpHash,
      otpExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ msg: 'Invalid or expired OTP' });

    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpiry = undefined;

    await user.save();
    // Issue JWT so client can continue to onboarding/logged-in state
    const token = generateToken(user._id);

    return res.json({
      msg: 'Email verified successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('VERIFY OTP ERROR:', err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
};



const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ msg: 'Password reset successful' });

  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};


module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
};

// Development-only: return masked verification token and expiry for an email
const debugToken = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    const { email } = req.query;
    if (!email) return res.status(400).json({ msg: 'Email query required' });

    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const reveal = req.query.reveal === '1';

    const masked = user.verificationToken
      ? `${user.verificationToken.slice(0, 8)}...${user.verificationToken.slice(-8)}`
      : null;

    // If explicitly requested (and not in production), reveal the full stored hashed token
    const verificationToken = reveal ? user.verificationToken : masked;

    return res.json({ email: user.email, isVerified: user.isVerified, verificationToken, verificationTokenExpiry: user.verificationTokenExpiry });
  } catch (err) {
    console.error('DEBUG TOKEN ERROR:', err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// append debugToken to exports for route registration
module.exports.debugToken = debugToken;

// Development-only: test a raw token directly (for debugging token mismatch)
const testVerifyRawToken = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    const rawToken = req.query.token || req.body.token;
    if (!rawToken) return res.status(400).json({ msg: 'Raw token required' });

    const token = String(rawToken).trim();
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    console.debug('TEST_VERIFY: rawToken =', token.slice(0, 16) + '...');
    console.debug('TEST_VERIFY: hashedToken =', hashedToken);

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpiry: { $gt: Date.now() },
    }).lean();

    console.debug('TEST_VERIFY: userFound =', Boolean(user), user ? `(${user.email})` : '');

    if (!user) {
      // Try to find user with ANY hashed token to help debug
      const anyUser = await User.findOne({ verificationToken: { $exists: true, $ne: null } }).lean();
      if (anyUser) {
        console.debug('TEST_VERIFY: DEBUG - found user with token: email=', anyUser.email, 'storedToken=', anyUser.verificationToken.slice(0, 16) + '...');
      }
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await User.findByIdAndUpdate(user._id, {
      isVerified: true,
      verificationToken: undefined,
      verificationTokenExpiry: undefined,
    });

    return res.json({ msg: 'Email verified successfully (test route)', email: user.email });
  } catch (err) {
    console.error('TEST_VERIFY ERROR:', err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
};

module.exports.testVerifyRawToken = testVerifyRawToken;
module.exports.sendOtp = sendOtp;
module.exports.verifyOtp = verifyOtp;

// Proctoring violation: reset user to force re-registration through onboarding
const proctoringViolation = async (req, res) => {
  try {
    const userId = req.user._id;

    // Reset user's onboarding and quiz status so they must go through registration flow again
    const Quiz = require('../models/Quiz');
    const Skill = require('../models/Skill');

    // Delete all quizzes for this user
    await Quiz.deleteMany({ user: userId });

    // Delete all skills for this user
    await Skill.deleteMany({ user: userId });

    // Reset user flags
    const user = await User.findById(userId);
    if (user) {
      user.hasCompletedQuiz = false;
      user.hasOnboarded = false;
      user.careerDNA = undefined;
      await user.save();
    }

    res.json({ msg: 'Proctoring violation recorded. User must re-register.' });
  } catch (err) {
    console.error('PROCTORING VIOLATION ERROR:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports.proctoringViolation = proctoringViolation;