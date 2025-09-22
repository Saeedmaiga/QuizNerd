const express = require('express');
const { z } = require('zod');
const { mapOpenTDB, mapTriviaApi } = require('../services/externalFormat');

const router = express.Router();

router.get('/opentdb', async (req, res, next) => {
  try {
    const schema = z.object({
      amount: z.coerce.number().int().min(1).max(50).default(10),
      category: z.coerce.number().int().optional(),
      difficulty: z.enum(['easy','medium','hard']).optional(),
      type: z.enum(['multiple','boolean']).optional()
    });
    const { amount, category, difficulty, type } = schema.parse(req.query);

    const qs = new URLSearchParams({ amount: String(amount) });
    if (category) qs.set('category', String(category));
    if (difficulty) qs.set('difficulty', difficulty);
    if (type) qs.set('type', type);

    const r = await fetch(`https://opentdb.com/api.php?${qs.toString()}`);
    const data = await r.json();
    if (data.response_code !== 0) return res.status(502).json({ error: 'OpenTDB error', code: data.response_code });
    return res.json({ source: 'OPENTDB', count: data.results.length, questions: mapOpenTDB(data.results) });
  } catch (e) { next(e); }
});

router.get('/triviaapi', async (req, res, next) => {
  try {
    const schema = z.object({
      limit: z.coerce.number().int().min(1).max(50).default(10),
      categories: z.string().optional(),
      difficulty: z.enum(['easy','medium','hard']).optional()
    });
    const { limit, categories, difficulty } = schema.parse(req.query);

    const qs = new URLSearchParams({ limit: String(limit) });
    if (categories) qs.set('categories', categories);
    if (difficulty) qs.set('difficulty', difficulty);

    const r = await fetch(`https://the-trivia-api.com/api/questions?${qs.toString()}`);
    const items = await r.json();
    return res.json({ source: 'TRIVIA_API', count: items.length, questions: mapTriviaApi(items) });
  } catch (e) { next(e); }
});

module.exports = router;