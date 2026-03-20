const mongoose = require("mongoose");

const diagnosisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  age: Number,
  gender: String,
  symptoms: [String],
  durationDays: Number,
  medicalHistory: [String],
  topPossibleConditions: [
    {
      condition: String,
      confidenceScore: Number,
      reasoning: String,
    },
  ],
  riskLevel: {
    type: String,
    enum: ["Low", "Moderate", "High", "Emergency"],
    default: "Low",
  },
  recommendation: String,
  preventiveAdvice: String,
  redFlagsDetected: [String],
  disclaimer: {
    type: String,
    default:
      "This is a preventive health assessment and not a medical diagnosis.",
  },
  source: {
    type: String,
    default: "ai-reasoning-engine",
  },
});

module.exports = mongoose.model("Diagnosis", diagnosisSchema);
