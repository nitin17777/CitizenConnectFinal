const Complaint = require('../models/Complaint');

function buildImageUrl(req, filename) {
  if (!filename) return '';
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
}

// ── GET /api/worker/jobs ─────────────────────────────────────────────────────
exports.getAvailableJobs = async (req, res, next) => {
  try {
    const spec = req.user.specialization || 'general_worker';
    // general_worker sees all; specialized workers see their type + general_worker jobs
    const specializationFilter =
      spec === 'general_worker' ? {} : { jobType: { $in: [spec, 'general_worker'] } };

    const jobs = await Complaint.find({
      $or: [
        { status: 'verified', ...specializationFilter },
        { assignedWorkerId: req.user._id, status: { $in: ['assigned', 'in_progress', 'completed_pending_verification'] } },
      ],
    })
      .sort({ acknowledgementCount: -1, createdAt: -1 })
      .populate('citizenId', 'name email');

    res.json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/worker/my-jobs ──────────────────────────────────────────────────
exports.getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Complaint.find({ assignedWorkerId: req.user._id })
      .sort({ updatedAt: -1 })
      .populate('citizenId', 'name email');

    res.json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/worker/jobs/:id/accept ───────────────────────────────────────
exports.acceptJob = async (req, res, next) => {
  try {
    // Enforce 1-active-job limit
    const activeJob = await Complaint.findOne({
      assignedWorkerId: req.user._id,
      status: { $in: ['assigned', 'in_progress'] },
    });
    if (activeJob) {
      return res.status(400).json({
        success: false,
        error: 'You already have an active job. Complete it before accepting a new one.',
      });
    }

    const complaint = await Complaint.findOneAndUpdate(
      { _id: req.params.id, status: 'verified' },
      { assignedWorkerId: req.user._id, status: 'assigned' },
      { new: true }
    ).populate('citizenId', 'name email');

    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Job not found or already assigned' });
    }
    res.json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/worker/jobs/:id/status ─────────────────────────────── (in_progress only)
exports.updateJobStatus = async (req, res, next) => {
  try {
    const { status, workerNotes } = req.body;
    if (status !== 'in_progress') {
      return res.status(400).json({ success: false, error: 'Use the /complete endpoint to mark a job as done' });
    }

    const complaint = await Complaint.findOneAndUpdate(
      { _id: req.params.id, assignedWorkerId: req.user._id, status: 'assigned' },
      { status, ...(workerNotes && { workerNotes }) },
      { new: true }
    ).populate('citizenId', 'name email');

    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Job not found or cannot be updated' });
    }
    res.json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/worker/jobs/:id/complete ──────────────────────────────────────
exports.completeJob = async (req, res, next) => {
  try {
    const { completionNote } = req.body;
    const proofFile = req.file;

    const complaint = await Complaint.findOne({
      _id: req.params.id,
      assignedWorkerId: req.user._id,
      status: { $in: ['assigned', 'in_progress'] },
    });

    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Job not found or cannot be completed' });
    }

    const proofImageUrl = proofFile ? buildImageUrl(req, proofFile.filename) : '';

    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        status:               'completed_pending_verification',
        completionProofImage: proofImageUrl,
        completionNote:       completionNote || '',
        completedAt:          new Date(),
        ...(completionNote && { workerNotes: completionNote }),
      },
      { new: true }
    ).populate('citizenId', 'name email');

    res.json({ success: true, complaint: updated });
  } catch (err) {
    next(err);
  }
};
