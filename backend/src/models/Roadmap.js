// models/Roadmap.js

const mongoose = require('mongoose');

const RoadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    career: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Career',
      required: true,
    },

    totalDays: {
      type: Number,
      required: true,
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    progressPercentage: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },

    aiModelUsed: {
      type: String,
      default: 'gemini-1.5-pro',
    },
  },
  { timestamps: true }
);

// Only one active roadmap per user per career
RoadmapSchema.index({ user: 1, career: 1 }, { unique: true });

module.exports = mongoose.model('Roadmap', RoadmapSchema);