const express = require('express');
const router = express.Router();
const MultiplayerSession = require('../models/MultiplayerSession');
const { authenticateRequest } = require('../middleware/auth');

// Create a new multiplayer session
router.post('/create', authenticateRequest, async (req, res, next) => {
  try {
    const { userId, username, quizConfig } = req.body;
    
    if (!userId || !username) {
      return res.status(400).json({ error: 'User ID and username are required' });
    }

    const sessionCode = await MultiplayerSession.generateSessionCode();
    
    const session = new MultiplayerSession({
      sessionCode,
      hostId: userId,
      players: [{
        userId,
        username,
        isHost: true,
        score: 0,
        currentQuestion: 0,
      }],
      quizConfig: quizConfig || {
        source: 'opentdb',
        amount: 10,
        difficulty: 'medium',
      },
      status: 'WAITING',
    });

    await session.save();
    
    res.json({
      sessionCode: session.sessionCode,
      sessionId: session._id,
      status: session.status,
    });
  } catch (error) {
    next(error);
  }
});

// Join a session by code
router.post('/join', authenticateRequest, async (req, res, next) => {
  try {
    const { sessionCode, userId, username } = req.body;
    
    if (!sessionCode || !userId || !username) {
      return res.status(400).json({ error: 'Session code, user ID, and username are required' });
    }

    const session = await MultiplayerSession.findOne({ sessionCode });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status !== 'WAITING') {
      return res.status(400).json({ error: 'Session already started' });
    }

    if (session.players.length >= session.maxPlayers) {
      return res.status(400).json({ error: 'Session is full' });
    }

    if (session.players.some(p => p.userId === userId)) {
      return res.status(400).json({ error: 'You are already in this session' });
    }

    session.players.push({
      userId,
      username,
      score: 0,
      currentQuestion: 0,
      isHost: false,
    });

    await session.save();
    
    res.json({
      sessionCode: session.sessionCode,
      players: session.players,
      status: session.status,
    });
  } catch (error) {
    next(error);
  }
});

// Get session details
router.get('/session/:sessionCode', async (req, res, next) => {
  try {
    const { sessionCode } = req.params;
    
    const session = await MultiplayerSession.findOne({ sessionCode });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({
      sessionCode: session.sessionCode,
      hostId: session.hostId,
      players: session.players,
      status: session.status,
      maxPlayers: session.maxPlayers,
      quizConfig: session.quizConfig,
      questions: session.questions || [],
      startedAt: session.startedAt,
    });
  } catch (error) {
    next(error);
  }
});

// Start a session (host only)
router.post('/start/:sessionCode', async (req, res, next) => {
  try {
    const { sessionCode } = req.params;
    const { userId, questions } = req.body;
    
    const session = await MultiplayerSession.findOne({ sessionCode });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.hostId !== userId) {
      return res.status(403).json({ error: 'Only the host can start the session' });
    }

    if (session.players.length < 1) {
      return res.status(400).json({ error: 'Need at least 1 player to start' });
    }

    if (session.status !== 'WAITING') {
      return res.status(400).json({ error: 'Session already started' });
    }

    if (!questions || questions.length === 0) {
      return res.status(400).json({ error: 'Questions are required to start the session' });
    }

    session.status = 'IN_PROGRESS';
    session.questions = questions;
    session.startedAt = new Date();
    await session.save();
    
    res.json({
      sessionCode: session.sessionCode,
      status: session.status,
      questions: session.questions,
      startedAt: session.startedAt,
    });
  } catch (error) {
    next(error);
  }
});

// Update player score/answer
router.post('/session/:sessionCode/answer', async (req, res, next) => {
  try {
    const { sessionCode } = req.params;
    const { userId, questionIndex, answer, isCorrect } = req.body;
    
    const session = await MultiplayerSession.findOne({ sessionCode });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const player = session.players.find(p => p.userId === userId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found in session' });
    }

    if (isCorrect) {
      player.score += 1;
    }
    player.currentQuestion = questionIndex + 1;

    if (player.currentQuestion >= session.questions.length) {
      player.finished = true;
    }

    await session.save();
    
    res.json({
      score: player.score,
      currentQuestion: player.currentQuestion,
      finished: player.finished,
    });
  } catch (error) {
    next(error);
  }
});

// Get leaderboard for a session
router.get('/session/:sessionCode/leaderboard', async (req, res, next) => {
  try {
    const { sessionCode } = req.params;
    
    const session = await MultiplayerSession.findOne({ sessionCode });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const leaderboard = session.players
      .map(p => ({
        username: p.username,
        score: p.score,
        isHost: p.isHost,
        finished: p.finished,
        currentQuestion: p.currentQuestion,
      }))
      .sort((a, b) => b.score - a.score);
    
    res.json({ leaderboard });
  } catch (error) {
    next(error);
  }
});

// End session
router.post('/end/:sessionCode', async (req, res, next) => {
  try {
    const { sessionCode } = req.params;
    const { userId } = req.body;
    
    const session = await MultiplayerSession.findOne({ sessionCode });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.hostId !== userId) {
      return res.status(403).json({ error: 'Only the host can end the session' });
    }

    session.status = 'FINISHED';
    session.finishedAt = new Date();
    await session.save();
    
    res.json({ message: 'Session ended successfully' });
  } catch (error) {
    next(error);
  }
});

// Leave session
router.post('/leave/:sessionCode', async (req, res, next) => {
  try {
    const { sessionCode } = req.params;
    const { userId } = req.body;
    
    const session = await MultiplayerSession.findOne({ sessionCode });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const playerIndex = session.players.findIndex(p => p.userId === userId);
    
    if (playerIndex === -1) {
      return res.status(404).json({ error: 'Player not found in session' });
    }

    session.players.splice(playerIndex, 1);

    // If host leaves and there are other players, make the next player the host
    if (session.players.length > 0 && session.hostId === userId) {
      session.hostId = session.players[0].userId;
      session.players[0].isHost = true;
    }

    await session.save();
    
    res.json({ message: 'Left session successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
