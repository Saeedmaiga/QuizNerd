require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDb } = require('./services/db');

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: true, credentials: true })); // Allow all origins
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Routes
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/external', require('./routes/external'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

connectDb().then(() => {
  app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
});