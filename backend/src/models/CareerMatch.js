const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
  careerName: { type: String, required: true },
  fitScore: { type: Number, default: 0 },
  strengthReason: String,
  riskReason: String,
}, { _id: false });

const CareerMatchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    recommendations: [RecommendationSchema],
    // snapshot of user inputs at generation time so we can detect changes
    generatedFrom: {
      careerInterests: [String],
      skillCount: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CareerMatch', CareerMatchSchema);
