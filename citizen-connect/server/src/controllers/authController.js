const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// Consistent user shape returned to the client
const formatUser = (user) => ({
  id:                user._id,
  name:              user.name,
  email:             user.email,
  role:              user.role,
  phone:             user.phone             || '',
  city:              user.city              || '',
  specialization:    user.specialization    || 'general_worker',
  workerEarnings:    user.workerEarnings    || 0,
  completedJobsCount: user.completedJobsCount || 0,
});

// ── POST /api/auth/register ──────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, specialization, city, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'citizen',
      specialization: role === 'worker' ? (specialization || 'general_worker') : 'general_worker',
      city:  city  || '',
      phone: phone || '',
    });

    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user: formatUser(user) });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login ─────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const token = signToken(user._id);
    res.json({ success: true, token, user: formatUser(user) });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({ success: true, user: formatUser(req.user) });
};
