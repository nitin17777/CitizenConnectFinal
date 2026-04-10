require('dotenv').config();
const express = require('express');
const cors = require('cors');
const analyseRouter = require('./routes/analyse');

const app = express();
const PORT = process.env.PORT || 5001;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/analyse', analyseRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ai-service', timestamp: new Date().toISOString() });
});

// ── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[AI-SERVICE ERROR]', err.message);
  res.status(500).json({ error: err.message || 'Internal AI service error' });
});

app.listen(PORT, () => {
  console.log(`🤖 AI Service running on http://localhost:${PORT}`);
  console.log(`   Mode: ${process.env.USE_MOCK_AI === 'true' ? 'MOCK' : 'REAL API'}`);
});
