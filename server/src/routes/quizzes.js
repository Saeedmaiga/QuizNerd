// server/src/routes/quizzes.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ items: [], message: 'Use /api/external/* endpoints to fetch questions live.' });
});

module.exports = router;