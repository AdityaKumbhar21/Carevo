const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema(
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

    skills: [
      {
        name: { type: String, required: true },

        selfRating: {
          type: Number,
          min: 0,
          max: 100,
          required: true,
        },

        validatedScore: {
          type: Number,
          min: 0,
          max: 100,
          default: null,
        },

        finalScore: {
          type: Number,
          min: 0,
          max: 100,
          default: null,
        },

        highestQuizLevelCleared: {
          type: String,
          enum: ['easy', 'medium', 'advanced'],
          default: null,
        },

        totalAttempts: {
          type: Number,
          default: 0,
        },

        lastQuizAttemptDate: Date,
      },
    ],
  },
  { timestamps: true }
);


SkillSchema.index({ user: 1, career: 1 }, { unique: true });

module.exports = mongoose.model('Skill', SkillSchema);