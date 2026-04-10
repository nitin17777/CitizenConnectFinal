const express = require('express');
const router  = express.Router();
const upload  = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');
const {
  getAvailableJobs,
  getMyJobs,
  acceptJob,
  updateJobStatus,
  completeJob,
} = require('../controllers/workerController');

router.use(protect, authorize('worker'));

router.get('/jobs',                  getAvailableJobs);
router.get('/my-jobs',               getMyJobs);
router.patch('/jobs/:id/accept',     acceptJob);
router.patch('/jobs/:id/status',     updateJobStatus);
router.patch('/jobs/:id/complete',   upload.single('proofImage'), completeJob);

module.exports = router;
