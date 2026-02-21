const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    career: {
      type: String,
      required: true,
      enum: [
        'Software Engineer',
        'Data Scientist',
        'Data Analyst',
        'Product Manager',
        'UI/UX Designer',
        'Cybersecurity Analyst',
        'Cloud Engineer',
        'AI/ML Engineer',
        'DevOps Engineer',
        'Business Analyst',
      ],
    },

    skill: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    level: {
      type: String,
      enum: ['easy', 'medium', 'advanced'],
      required: true,
    },

    
    status: {
      type: String,
      enum: ['generated', 'submitted'],
      default: 'generated',
    },

    mode: {
      type: String,
      enum: ['validation', 'practice'],
      default: 'validation',
    },

    
    correctAnswerKey: [
      {
        questionId: String,
        correctAnswer: String,
      },
    ],

    
    score: {
      type: Number,
      min: 0,
      max: 100,
    },

    accuracy: {
      type: Number,
      min: 0,
      max: 100,
    },

    passed: Boolean,

    totalQuestions: {
      type: Number,
      required: true,
    },

    correctCount: {
      type: Number,
    },

    timeTakenSeconds: Number,

    attemptNumber: {
      type: Number,
      default: 1,
    },

    responses: [
      {
        questionId: {
          type: String,
          required: true,
        },
        userAnswer: String,
        isCorrect: Boolean,
      },
    ],
  },
  { timestamps: true }
);


QuizSchema.index({ user: 1, career: 1, skill: 1, level: 1 });

module.exports = mongoose.model('Quiz', QuizSchema);