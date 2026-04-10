require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// ── Connect MongoDB ──────────────────────────────────────────────────────────
connectDB();

const app = express();

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/admin',      require('./routes/admin'));
app.use('/api/worker',     require('./routes/worker'));
app.use('/api/users',      require('./routes/users'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'citizen-connect-server', timestamp: new Date().toISOString() });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  if (status >= 500) console.error('[SERVER ERROR]', err.message);
  res.status(status).json({ success: false, error: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Demo mode: ${process.env.DEMO_MODE === 'true' ? 'ON' : 'OFF'}`);
});
