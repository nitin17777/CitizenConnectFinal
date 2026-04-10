const mongoose = require('mongoose');

// Maps issue type → required worker specialization
const JOB_TYPE_MAP = {
  pothole:     'road_worker',
  road:        'road_worker',
  garbage:     'sanitation_worker',
  sewage:      'sanitation_worker',
  streetlight: 'electrical_worker',
  other:       'general_worker',
};

const complaintSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    imageUrl:  { type: String, default: '' },
    category: {
      type: String,
      enum: ['pothole', 'garbage', 'sewage', 'road', 'streetlight', 'other'],
      default: 'other',
    },
    location: { type: String, default: '' },

    status: {
      type: String,
      enum: [
        'pending_ai',
        'verified',
        'rejected_by_ai',
        'assigned',
        'in_progress',
        'completed_pending_verification', // Worker done, waiting admin sign-off
        'completed',
      ],
      default: 'pending_ai',
    },
    rejectionReason: { type: String, default: '' },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'low',
    },

    // ── AI Analysis (denormalised for fast queries) ─────────────────────────
    issueType: {
      type: String,
      enum: ['pothole', 'garbage', 'sewage', 'road', 'streetlight', 'other'],
      default: 'other',
    },
    // Required worker specialisation derived from issueType
    jobType: {
      type: String,
      enum: ['road_worker', 'sanitation_worker', 'electrical_worker', 'general_worker'],
      default: 'general_worker',
    },
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'severe', 'critical'],
      default: 'moderate',
    },
    aiConfidence:  { type: Number, default: 0 },
    estimatedCost: { type: Number, default: 0 },
    aiVerdict: { type: String, enum: ['REAL', 'SUSPICIOUS', 'FAKE', ''], default: '' },

    // ── Task Completion ─────────────────────────────────────────────────────
    completionProofImage: { type: String, default: '' },
    completionNote:       { type: String, default: '' },
    completedAt:          { type: Date,   default: null },

    // ── Community Acknowledgement / Upvote ──────────────────────────────────
    acknowledgementCount: { type: Number, default: 0 },
    acknowledgedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // ── Relations ───────────────────────────────────────────────────────────
    citizenId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    aiReportId:       { type: mongoose.Schema.Types.ObjectId, ref: 'AIReport', default: null },

    // ── Notes ───────────────────────────────────────────────────────────────
    adminNotes:  { type: String, default: '' },
    workerNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Indexes
complaintSchema.index({ citizenId: 1, createdAt: -1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ assignedWorkerId: 1 });
complaintSchema.index({ jobType: 1 });
complaintSchema.index({ acknowledgementCount: -1 });

const Complaint = mongoose.model('Complaint', complaintSchema);
Complaint.JOB_TYPE_MAP = JOB_TYPE_MAP; // Expose for controllers
module.exports = Complaint;
