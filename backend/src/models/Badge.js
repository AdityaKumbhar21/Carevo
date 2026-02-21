const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true }, 
  description: String,
  icon: String,
  type: {
    type: String,
    enum: ['streak', 'task', 'milestone', 'special'],
    required: true,
  },
  criteria: {
    value: Number, 
  },
}, { timestamps: true });

module.exports = mongoose.model('Badge', BadgeSchema);