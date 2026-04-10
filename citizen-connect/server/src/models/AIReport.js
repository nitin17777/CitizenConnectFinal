const mongoose = require('mongoose');

const aiReportSchema = new mongoose.Schema(
  {
    verdict: {
      type: String,
      enum: ['REAL', 'SUSPICIOUS', 'FAKE'],
      required: true,
    },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    issueType: {
      type: String,
      enum: ['pothole', 'garbage', 'sewage', 'road', 'streetlight', 'other'],
      default: 'other',
    },
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'severe', 'critical'],
      default: 'moderate',
    },
    estimatedCost: { type: Number, default: 0 },
    flags: [{ type: String }],
    rawResponse: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIReport', aiReportSchema);
