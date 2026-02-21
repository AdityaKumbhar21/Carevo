const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },

  isVerified: { type: Boolean, default: false },
  resetToken: String,
  resetTokenExpiry: Date,
  otpHash: String,
  otpExpiry: Date,

  // Academic Profile
  educationLevel: String,
  currentCourse: String,
  yearOfStudy: String,
  dailyStudyHours: Number,
  dailyAvailableHours: Number,
  careerInterests: [String],
  hasOnboarded: { type: Boolean, default: false },
  hasCompletedQuiz: { type: Boolean, default: false },

  // Resume
  resumeText: { type: String, default: '' },
  resumeSkills: { type: [String], default: [] },
  resumeExperience: { type: [String], default: [] },

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

  ,
  // Per-career fit scores computed from validations
  careerFitScores: { type: Object, default: {} },
  // Raw skill ratings provided by user during onboarding
  skillRatings: { type: Object, default: {} },

}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);