import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:4000/api/multiplayer';

export default function MultiplayerLobby({ 
  sessionCode, 
  userId, 
  username, 
  onStartSession,
  onLeave,
  theme,
  themeClasses 
}) {
  const [session, setSession] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 2000); // Poll every 2 seconds
    
    return () => clearInterval(interval);
  }, [sessionCode]);

  const fetchSession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/session/${sessionCode}`);
      if (!response.ok) return;
      
      const data = await response.json();
      setSession(data);
      setPlayers(data.players || []);
      setIsHost(data.hostId === userId);
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveSession = async () => {
    try {
      await fetch(`${API_BASE_URL}/leave/${sessionCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      onLeave();
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  };

  const handleStartSession = () => {
    onStartSession(sessionCode, session.quizConfig);
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className={`${themeClasses.card} rounded-2xl p-6 text-center`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-400">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className={`${themeClasses.card} rounded-2xl p-6 space-y-6`}>
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              🎮 Multiplayer Lobby
            </h2>
            <p className="text-sm text-gray-400 mt-1">Session Code: <span className="font-mono font-bold text-purple-400">{sessionCode}</span></p>
          </div>
          {isHost && (
            <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold rounded-full">
              👑 Host
            </span>
          )}
        </div>

        {/* Quiz Config */}
        <div className={`${themeClasses.glass} rounded-lg p-4`}>
          <h3 className="font-semibold mb-2">Quiz Settings</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-400">Questions:</span> <span className="font-semibold">{session?.quizConfig?.amount || 10}</span></div>
            <div><span className="text-gray-400">Difficulty:</span> <span className="font-semibold capitalize">{session?.quizConfig?.difficulty || 'medium'}</span></div>
          </div>
        </div>

        {/* Players List */}
        <div>
          <h3 className="font-semibold mb-3">
            Players ({players.length}/{session?.maxPlayers || 8})
          </h3>
          <div className="space-y-2">
            {players.map((player, index) => (
              <div
                key={index}
                className={`${themeClasses.panelBg} rounded-lg p-3 flex items-center justify-between ${
                  player.userId === userId ? 'ring-2 ring-purple-400' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {player.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">
                      {player.username}
                      {player.isHost && <span className="ml-2 text-yellow-400">👑</span>}
                    </div>
                    <div className="text-xs text-gray-400">Waiting...</div>
                  </div>
                </div>
                {player.userId === userId && (
                  <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">You</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Share Code */}
        <div className={`${themeClasses.glass} rounded-lg p-4`}>
          <p className="text-sm text-gray-400 mb-2">Share this code with friends:</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={sessionCode}
              className={`flex-1 px-3 py-2 rounded-lg font-mono font-bold text-center ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(sessionCode);
                alert('Code copied!');
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleLeaveSession}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
          >
            Leave Session
          </button>
          {isHost && (
            <button
              onClick={handleStartSession}
              disabled={players.length < 2}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {players.length < 2 ? 'Waiting for players...' : 'Start Game'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
