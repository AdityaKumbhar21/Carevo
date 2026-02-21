const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

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