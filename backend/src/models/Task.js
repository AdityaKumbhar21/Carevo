const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    roadmap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
      required: true,
    },

    career: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Career',
      required: true,
    },

    dayNumber: {
      type: Number,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    title: String,
    description: String,
    skill: String,
    estimatedMinutes: Number,

    completed: {
      type: Boolean,
      default: false,
    },

    completedAt: Date,
  },
  { timestamps: true }
);

// Fast daily lookup
TaskSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('Task', TaskSchema);