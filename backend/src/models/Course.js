const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mappedSkill: {
    type: String, // which career skill this course improves
    required: true,
  },
  skillBoostLevel: {
    type: Number, // how strong the boost (0-100)
    default: 80,
  }
});

module.exports = mongoose.model('Course', courseSchema);