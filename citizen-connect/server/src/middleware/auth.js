const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes — requires valid JWT
 * In DEMO_MODE: auto-attaches demo user based on x-demo-role header
 */
const protect = async (req, res, next) => {
  // ── DEMO MODE ────────────────────────────────────────────────────────────
  if (process.env.DEMO_MODE === 'true') {
    const demoRole = req.headers['x-demo-role'] || 'citizen';
    try {
      let demoUser = await User.findOne({ email: `demo_${demoRole}@citizenconnect.demo` });
      if (!demoUser) {
        demoUser = await User.create({
          name: `Demo ${demoRole.charAt(0).toUpperCase() + demoRole.slice(1)}`,
          email: `demo_${demoRole}@citizenconnect.demo`,
          password: 'demo1234',
          role: demoRole,
        });
      }
      req.user = demoUser;
      return next();
    } catch (err) {
      console.error('Demo user error:', err.message);
    }
  }

  // ── JWT MODE ─────────────────────────────────────────────────────────────
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized — no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

/**
 * Role-based authorization guard
 * Usage: authorize('admin', 'worker')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role '${req.user?.role}' is not authorized for this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
