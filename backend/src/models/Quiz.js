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
      trim: true,
    },

      skills: {
    type: [String],
    required: true,
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

    // Questions stored with answers hidden by default
    questions: [
      {
        questionId: { type: String },
        question: { type: String },
        options: [{ type: String }],
        correctAnswer: { type: String, select: false },
      },
    ],

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



QuizSchema.index(
  { user: 1, career: 1, level: 1, mode: 1 },
  { unique: true }
);

module.exports = mongoose.model('Quiz', QuizSchema);