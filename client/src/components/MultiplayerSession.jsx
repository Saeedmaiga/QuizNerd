import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:4000/api/multiplayer';

export default function MultiplayerSession({ userId, username, onSessionCreated, onSessionJoined, theme, themeClasses }) {
  const [mode, setMode] = useState('select'); // 'select', 'create', 'join'
  const [sessionCode, setSessionCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizConfig, setQuizConfig] = useState({
    source: 'opentdb',
    amount: 10,
    difficulty: 'medium',
    category: null,
  });

  const handleCreateSession = async () => {
    setLoading(true);
    setError(null);

    if (!userId || !username) {
      setError('User information missing. Please make sure you are logged in.');
      setLoading(false);
      return;
    }

    try {
      console.log('Creating session with:', { userId, username, quizConfig });
      const response = await fetch(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          username,
          quizConfig,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create session');
      }

      const data = await response.json();
      console.log('Session created:', data);
      onSessionCreated(data.sessionCode, data.sessionId, quizConfig);
    } catch (err) {
      console.error('Error creating session:', err);
      setError(err.message || 'Failed to create session. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async () => {
    if (!sessionCode.trim()) {
      setError('Please enter a session code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionCode: sessionCode.toUpperCase(),
          userId,
          username,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join session');
      }

      const data = await response.json();
      onSessionJoined(data.sessionCode);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className={`${themeClasses.card} rounded-2xl p-6`}>
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          🎮 Multiplayer Session
        </h2>

        {mode === 'select' && (
          <div className="space-y-4">
            <p className={`text-sm ${themeClasses.text} opacity-75 mb-6`}>
              Create a new session or join an existing one with friends!
            </p>
            
            <button
              onClick={() => setMode('create')}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:scale-105 transition-transform shadow-md"
            >
              ➕ Create Session
            </button>

            <button
              onClick={() => setMode('join')}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold hover:scale-105 transition-transform shadow-md"
            >
              🔗 Join Session
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Create Session</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Number of Questions</label>
                <select
                  value={quizConfig.amount}
                  onChange={(e) => setQuizConfig({ ...quizConfig, amount: parseInt(e.target.value) })}
                  className={`w-full px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select
                  value={quizConfig.difficulty}
                  onChange={(e) => setQuizConfig({ ...quizConfig, difficulty: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMode('select');
                  setError(null);
                }}
                className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
              >
                Back
              </button>
              <button
                onClick={handleCreateSession}
                disabled={loading}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Join Session</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Session Code</label>
              <input
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                maxLength={6}
                className={`w-full px-4 py-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} font-mono text-lg tracking-widest text-center`}
              />
            </div>

            {error && (
              <div className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMode('select');
                  setError(null);
                  setSessionCode('');
                }}
                className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
              >
                Back
              </button>
              <button
                onClick={handleJoinSession}
                disabled={loading || !sessionCode}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Join Session'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
