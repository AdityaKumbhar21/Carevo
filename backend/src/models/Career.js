const mongoose = require('mongoose');

const CareerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: String,

    marketDemandScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },

    difficultyScore: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },

    averageSalaryRange: {
      min: Number,
      max: Number,
    },

    skills: [
      {
        name: {
          type: String,
          required: true,
          lowercase: true,
          trim: true,
        },

        requiredLevel: {
          type: Number,
          min: 0,
          max: 100,
          required: true,
        },

        estimatedHours: {
          type: Number,
          required: true,
        },

        type: {
          type: String,
          enum: ['core', 'supporting', 'advanced'],
          required: true,
        },

        phase: {
          type: Number, 
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Career', CareerSchema);