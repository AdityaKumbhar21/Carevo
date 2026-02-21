const User = require('../models/User');
const Gamification = require('../models/Gamification');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../services/emailService');

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

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    user.verificationToken = hashedToken;
    user.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    // 🔥 AUTO CREATE GAMIFICATION DOC
    await Gamification.create({
      user: user._id,
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${rawToken}`;

    await sendEmail(
      email,
      'Verify Your Email',
      `Click to verify your email: ${verifyUrl}`
    );

    res.status(201).json({
      msg: 'Registration successful. Please verify your email.',
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
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
    res.status(500).json({ msg: 'Server error' });
  }
};


const verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;

    await user.save();

    res.json({ msg: 'Email verified successfully' });

  } catch (err) {
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