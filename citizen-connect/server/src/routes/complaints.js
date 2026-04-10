const express = require('express');
const router  = express.Router();
const upload  = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');
const {
  submitComplaint,
  getMyComplaints,
  getCommunityIssues,
  getComplaintById,
  acknowledgeComplaint,
} = require('../controllers/complaintController');

// Citizen: submit complaint with image
router.post('/', protect, authorize('citizen'), upload.single('image'), submitComplaint);

// Citizen: view own complaints
router.get('/', protect, authorize('citizen'), getMyComplaints);

// Citizen: view verified complaints by other citizens (for acknowledgement)
router.get('/community', protect, getCommunityIssues);

// Any auth user: view single complaint
router.get('/:id', protect, getComplaintById);

// Any auth user: acknowledge / un-acknowledge a complaint
router.post('/:id/acknowledge', protect, acknowledgeComplaint);

module.exports = router;
