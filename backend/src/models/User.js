const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },

  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpiry: Date,

  resetToken: String,
  resetTokenExpiry: Date,

  // Academic Profile
  educationLevel: String,
  currentCourse: String,
  yearOfStudy: String,
  dailyAvailableHours: Number,

  // Gamification
  totalCoins: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  maxStreak: { type: Number, default: 0 },
  lastCheckInDate: Date,

  // Career Intelligence
  careerDNA: {
    interestVector: Object,
    abilityVector: Object,
    skillVector: Object,
    learningSpeed: Number,
    confidenceAccuracy: Number,
    consistencyIndex: Number
  }

}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);