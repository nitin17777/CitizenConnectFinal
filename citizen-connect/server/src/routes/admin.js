const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllComplaints,
  getDashboardStats,
  assignWorker,
  updateStatus,
  getWorkers,
  getUserById,
  verifyCompletion,
} = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/complaints',                       getAllComplaints);
router.get('/stats',                            getDashboardStats);
router.get('/workers',                          getWorkers);
router.get('/user/:id',                         getUserById);
router.patch('/complaints/:id/assign',          assignWorker);
router.patch('/complaints/:id/status',          updateStatus);
router.patch('/complaints/:id/verify-completion', verifyCompletion);

module.exports = router;
