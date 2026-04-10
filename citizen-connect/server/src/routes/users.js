const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// PATCH /api/users/profile
router.patch('/profile', protect, async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
