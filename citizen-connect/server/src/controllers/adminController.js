const Complaint = require('../models/Complaint');
const User      = require('../models/User');

// ── GET /api/admin/complaints ────────────────────────────────────────────────
exports.getAllComplaints = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('citizenId', 'name email')
        .populate('assignedWorkerId', 'name email specialization workerEarnings')
        .populate('aiReportId'),
      Complaint.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: parseInt(page), complaints });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/stats ─────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      total, verified, rejected, assigned, inProgress,
      completedPendingVerification, completed, pending,
      totalCostAgg, totalEarningsAgg,
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'verified' }),
      Complaint.countDocuments({ status: 'rejected_by_ai' }),
      Complaint.countDocuments({ status: 'assigned' }),
      Complaint.countDocuments({ status: 'in_progress' }),
      Complaint.countDocuments({ status: 'completed_pending_verification' }),
      Complaint.countDocuments({ status: 'completed' }),
      Complaint.countDocuments({ status: 'pending_ai' }),
      Complaint.aggregate([{ $group: { _id: null, total: { $sum: '$estimatedCost' } } }]),
      User.aggregate([{ $match: { role: 'worker' } }, { $group: { _id: null, total: { $sum: '$workerEarnings' } } }]),
    ]);

    const byCategory = await Complaint.aggregate([
      { $group: { _id: '$issueType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const bySeverity = await Complaint.aggregate([
      { $match: { status: { $in: ['verified', 'assigned', 'in_progress', 'completed_pending_verification', 'completed'] } } },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: {
        total, verified, rejected, assigned, inProgress,
        completedPendingVerification, completed, pending,
        totalEstimatedCost: totalCostAgg[0]?.total || 0,
        totalEarningsPaid:  totalEarningsAgg[0]?.total || 0,
        byCategory,
        bySeverity,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/admin/complaints/:id/assign ───────────────────────────────────
exports.assignWorker = async (req, res, next) => {
  try {
    const { workerId } = req.body;
    const worker = await User.findOne({ _id: workerId, role: 'worker' });
    if (!worker) return res.status(404).json({ success: false, error: 'Worker not found' });

    // Enforce 1-active-job rule
    const activeJob = await Complaint.findOne({
      assignedWorkerId: workerId,
      status: { $in: ['assigned', 'in_progress'] },
    });
    if (activeJob) {
      return res.status(400).json({ success: false, error: 'Worker already has an active job' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assignedWorkerId: workerId, status: 'assigned', adminNotes: req.body.adminNotes || '' },
      { new: true }
    ).populate('citizenId', 'name email').populate('assignedWorkerId', 'name email');

    if (!complaint) return res.status(404).json({ success: false, error: 'Complaint not found' });
    res.json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/admin/complaints/:id/status ───────────────────────────────────
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const valid = ['verified', 'assigned', 'in_progress', 'completed_pending_verification', 'completed', 'rejected_by_ai'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, ...(adminNotes && { adminNotes }) },
      { new: true }
    ).populate('citizenId', 'name email').populate('assignedWorkerId', 'name email');

    if (!complaint) return res.status(404).json({ success: false, error: 'Complaint not found' });
    res.json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/admin/complaints/:id/verify-completion ───────────────────────
exports.verifyCompletion = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('assignedWorkerId');
    if (!complaint) return res.status(404).json({ success: false, error: 'Complaint not found' });
    if (complaint.status !== 'completed_pending_verification') {
      return res.status(400).json({ success: false, error: 'Complaint is not awaiting verification' });
    }

    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    ).populate('citizenId', 'name email').populate('assignedWorkerId', 'name email');

    // Credit worker: 10% of estimatedCost
    if (complaint.assignedWorkerId) {
      const earnings = Math.round((complaint.estimatedCost || 0) * 0.10);
      await User.findByIdAndUpdate(complaint.assignedWorkerId._id, {
        $inc: { workerEarnings: earnings, completedJobsCount: 1 },
      });
    }

    res.json({ success: true, complaint: updated });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/workers ───────────────────────────────────────────────────
exports.getWorkers = async (req, res, next) => {
  try {
    const workers = await User.find({ role: 'worker' }).select('-password');
    res.json({ success: true, workers });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/user/:id ──────────────────────────────────────────────────
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const [activeJobs, completedJobs, pendingVerification, totalHandled] = await Promise.all([
      Complaint.countDocuments({ assignedWorkerId: user._id, status: { $in: ['assigned', 'in_progress'] } }),
      Complaint.countDocuments({ assignedWorkerId: user._id, status: 'completed' }),
      Complaint.countDocuments({ assignedWorkerId: user._id, status: 'completed_pending_verification' }),
      user.role === 'citizen'
        ? Complaint.countDocuments({ citizenId: user._id })
        : Complaint.countDocuments({ assignedWorkerId: user._id }),
    ]);

    res.json({
      success: true,
      user: { ...user.toObject(), liveStats: { activeJobs, completedJobs, pendingVerification, totalHandled } },
    });
  } catch (err) {
    next(err);
  }
};
