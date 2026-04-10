const path      = require('path');
const Complaint = require('../models/Complaint');
const AIReport  = require('../models/AIReport');
const { callAIService } = require('../services/aiService');

const JOB_TYPE_MAP = Complaint.JOB_TYPE_MAP;

// ── Helpers ──────────────────────────────────────────────────────────────────
function buildImageUrl(req, filename) {
  if (!filename) return '';
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
}

function priorityFromAcks(count) {
  if (count >= 20) return 'high';
  if (count >= 5)  return 'medium';
  return 'low';
}

// ── POST /api/complaints ─────────────────────────────────────────────────────
exports.submitComplaint = async (req, res, next) => {
  try {
    const { description, category, location } = req.body;
    const imageFile = req.file;

    if (!description || description.trim().length < 10) {
      return res.status(400).json({ success: false, error: 'Description must be at least 10 characters' });
    }

    const jobType = JOB_TYPE_MAP[category] || 'general_worker';

    // 1. Save as pending_ai
    const complaint = await Complaint.create({
      description: description.trim(),
      category:    category || 'other',
      location:    location || '',
      imageUrl:    imageFile ? buildImageUrl(req, imageFile.filename) : '',
      status:      'pending_ai',
      citizenId:   req.user._id,
      jobType,
    });

    // 2. Call AI service
    let aiData;
    try {
      const imagePath = imageFile
        ? path.join(__dirname, '..', '..', 'uploads', imageFile.filename)
        : null;
      aiData = await callAIService(imagePath, {
        complaintText: description,
        category:      category || 'other',
        location:      location || '',
      });
    } catch (aiErr) {
      console.error('[COMPLAINT] AI service unreachable:', aiErr.message);
      await Complaint.findByIdAndUpdate(complaint._id, { rejectionReason: 'AI service temporarily unavailable' });
      return res.status(202).json({
        success: false,
        error: 'AI service unavailable. Complaint saved as pending.',
        complaintId: complaint._id,
      });
    }

    // 3. Decision
    const { verdict, confidence, issueType, severity, estimatedCost, flags } = aiData;
    let newStatus;
    let rejectionReason = '';

    if (verdict === 'REAL' && confidence >= 0.40) {
      newStatus = 'verified';
    } else {
      newStatus = 'rejected_by_ai';
      if (verdict === 'FAKE') {
        rejectionReason = `AI detected this as a fake complaint (confidence: ${(confidence * 100).toFixed(0)}%)`;
      } else if (verdict === 'SUSPICIOUS') {
        rejectionReason = `AI flagged as suspicious (confidence: ${(confidence * 100).toFixed(0)}%). Flags: ${flags.join(', ') || 'none'}`;
      } else {
        rejectionReason = `AI confidence too low (${(confidence * 100).toFixed(0)}%) to verify complaint`;
      }
    }

    // 4. AI Report
    const aiReport = await AIReport.create({ verdict, confidence, issueType, severity, estimatedCost, flags, rawResponse: aiData });

    // 5. Refine jobType from AI-detected issueType (more accurate)
    const finalJobType = JOB_TYPE_MAP[issueType] || jobType;

    // 6. Update complaint
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaint._id,
      { status: newStatus, rejectionReason, issueType, severity, aiConfidence: confidence, estimatedCost, aiVerdict: verdict, aiReportId: aiReport._id, jobType: finalJobType },
      { new: true }
    ).populate('citizenId', 'name email');

    res.status(201).json({
      success: true,
      complaint: updatedComplaint,
      aiReport: { verdict, confidence, issueType, severity, estimatedCost, flags },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/complaints (citizen: own) ───────────────────────────────────────
exports.getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ citizenId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('aiReportId')
      .populate('assignedWorkerId', 'name email');

    const userId = req.user._id.toString();
    const result = complaints.map((c) => {
      const obj = c.toObject();
      obj.userHasAcknowledged = (c.acknowledgedBy || []).some((id) => id.toString() === userId);
      return obj;
    });

    res.json({ success: true, count: result.length, complaints: result });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/complaints/community ────────────────────────────────────────────
exports.getCommunityIssues = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({
      citizenId: { $ne: req.user._id },
      status: { $in: ['verified', 'assigned', 'in_progress'] },
    })
      .sort({ acknowledgementCount: -1, createdAt: -1 })
      .limit(20)
      .populate('citizenId', 'name');

    const userId = req.user._id.toString();
    const result = complaints.map((c) => {
      const obj = c.toObject();
      obj.userHasAcknowledged = (c.acknowledgedBy || []).some((id) => id.toString() === userId);
      return obj;
    });

    res.json({ success: true, complaints: result });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/complaints/:id ──────────────────────────────────────────────────
exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizenId', 'name email')
      .populate('assignedWorkerId', 'name email')
      .populate('aiReportId');

    if (!complaint) return res.status(404).json({ success: false, error: 'Complaint not found' });

    if (req.user.role === 'citizen' && complaint.citizenId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const obj = complaint.toObject();
    obj.userHasAcknowledged = (complaint.acknowledgedBy || []).some((id) => id.toString() === req.user._id.toString());

    res.json({ success: true, complaint: obj });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/complaints/:id/acknowledge ─────────────────────────────────────
exports.acknowledgeComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, error: 'Complaint not found' });

    if (complaint.citizenId.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, error: 'You cannot acknowledge your own complaint' });
    }

    const userId = req.user._id;
    const alreadyAcked = complaint.acknowledgedBy.some((id) => id.toString() === userId.toString());

    const updateOp = alreadyAcked
      ? { $pull: { acknowledgedBy: userId }, $inc: { acknowledgementCount: -1 } }
      : { $addToSet: { acknowledgedBy: userId }, $inc: { acknowledgementCount: 1 } };

    const updated = await Complaint.findByIdAndUpdate(req.params.id, updateOp, { new: true });

    // Recalculate priority
    const priority = priorityFromAcks(updated.acknowledgementCount);
    await Complaint.findByIdAndUpdate(req.params.id, { priority });

    res.json({ success: true, acknowledged: !alreadyAcked, count: updated.acknowledgementCount, priority });
  } catch (err) {
    next(err);
  }
};
