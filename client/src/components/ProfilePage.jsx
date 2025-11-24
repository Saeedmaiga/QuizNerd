import React, { useState } from "react";
import AchievementModal from "./AchievementModal";
import StatsModal from "./StatsModal";
import MultiplayerSession from "./MultiplayerSession";
import MultiplayerLobby from "./MultiplayerLobby";
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "./LogoutButton";
import ThemeToggle from "./ThemeToggle";
import SoundControls from "./SoundControls";
import AddFriends from "./AddFriends";

export default function ProfilePage({ onBack, themeClasses, onStartMultiplayer, theme, setTheme }) {
  const [showAchievements, setShowAchievements] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showMultiplayer, setShowMultiplayer] = useState(false);
  const [multiplayerMode, setMultiplayerMode] = useState(null); // null, 'create', 'join', 'lobby'
  const [sessionCode, setSessionCode] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [quizConfig, setQuizConfig] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [showAddFriends, setShowAddFriends] = useState(false);

  const { user } = useAuth0();

  const userId = user?.sub || "temp-user-" + Date.now();
  const username = user?.name || user?.nickname || user?.email || "Player";

  const playClickSound = () => {
    const audio = new Audio("/button-click.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const handleStatsClick = () => {
    playClickSound();
    setShowStats(true);
  };

  const handleAchievementsClick = () => {
    playClickSound();
    setShowAchievements(true);
  };

  const handleMultiplayerClick = () => {
    playClickSound();
    setShowMultiplayer(true);
    setMultiplayerMode("create");
  };

  const handleSessionCreated = (code, id, config) => {
    setSessionCode(code);
    setSessionId(id);
    setQuizConfig(config);
    setMultiplayerMode("lobby");
  };

  const handleSessionJoined = (code) => {
    setSessionCode(code);
    setMultiplayerMode("lobby");
  };

  const handleStartMultiplayerSession = async (code, config, questions) => {
    // If questions are provided (from server), use them directly
    // Otherwise, fetch questions (host only)
    if (questions && questions.length > 0) {
      // Questions already fetched from server, start game directly
      onStartMultiplayer(code, config, userId, username, questions);
    } else {
      // Host needs to fetch questions first, then start
      onStartMultiplayer(code, config, userId, username);
    }
  };

  const handleLeaveMultiplayer = () => {
    setMultiplayerMode(null);
    setSessionCode(null);
    setSessionId(null);
    setQuizConfig(null);
    setShowMultiplayer(false);
  };

  const handleAddFriendsClick = () => {
  playClickSound();
  setShowAddFriends(true);
};
  if (showAddFriends) {
    return (
      <AddFriends
        onBack={() => setShowAddFriends(false)}
        themeClasses={themeClasses}
        playSound={playClickSound}
        userId={userId}
        username={username}
      />
    );
  }
  
  // Multiplayer lobby
  if (multiplayerMode === "lobby" && sessionCode) {
    return (
      <div className={`min-h-screen p-8 flex flex-col items-center ${themeClasses.bg} ${themeClasses.text}`}>
        <header className="w-full mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Multiplayer Session</h1>
          <button
            onClick={() => {
              playClickSound();
              handleLeaveMultiplayer();
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-semibold hover:scale-105 transition-transform"
          >
            ← Back
          </button>
        </header>
        <MultiplayerLobby
          sessionCode={sessionCode}
          userId={userId}
          username={username}
          onStartSession={handleStartMultiplayerSession}
          onLeave={handleLeaveMultiplayer}
          theme={theme}
          themeClasses={themeClasses}
        />
      </div>
    );
  }

  // Multiplayer creation/join
  if (showMultiplayer && (multiplayerMode === "create" || multiplayerMode === "join")) {
    return (
      <div className={`min-h-screen p-8 flex flex-col items-center ${themeClasses.bg} ${themeClasses.text}`}>
        <header className="w-full mb-8 flex justify-between items-center">
          <button
            onClick={() => {
              playClickSound();
              setShowMultiplayer(false);
              setMultiplayerMode(null);
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-semibold hover:scale-105 transition-transform"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold">Multiplayer</h1>
        </header>
        <MultiplayerSession
          userId={userId}
          username={username}
          onSessionCreated={handleSessionCreated}
          onSessionJoined={handleSessionJoined}
          theme={theme}
          themeClasses={themeClasses}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text}`}>
  {/* Sticky Header */}
  <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 h-20 flex items-center px-4">
    <button
      onClick={() => {
        playClickSound();
        onBack();
      }}
      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:scale-105 transition-all"
    >
      ← Back
    </button>
    <div className="flex-1 text-center">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
        Profile
      </h1>
    </div>
    <div className="flex items-center gap-3">
      <LogoutButton theme={theme} />
      <ThemeToggle theme={theme} setTheme={setTheme} isInHeader={true} />
      <SoundControls
        soundEnabled={soundEnabled}
        musicEnabled={musicEnabled}
        setSoundEnabled={setSoundEnabled}
        setMusicEnabled={setMusicEnabled}
        theme={theme}
        isInHeader={true}
      />
    </div>
  </div>

  {/* Main Content */}
  <div className="p-8 flex flex-col items-center">
    {/* Profile Card */}
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center gap-6">
      {/* Avatar */}
      <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-3xl font-bold">
        👤
      </div>

      {/* Info */}
      <div className="w-full flex flex-col gap-2 text-center">
        <p className="font-semibold text-lg">{username}</p>
        <p className="text-sm text-gray-500 dark:text-gray-300">Your profile</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 break-all font-mono">
        ID: {userId}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 break-all font-mono">
        Name: {username}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-col gap-4 mt-4">
        <button
          onClick={handleStatsClick}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:scale-105 transition-transform shadow-md"
        >
          📊 View Statistics
        </button>

        <button
          onClick={handleAchievementsClick}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold hover:scale-105 transition-transform shadow-md"
        >
          🏆 View Achievements
        </button>

        <button
          onClick={handleAddFriendsClick}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold hover:scale-105 transition-transform shadow-md"
        >
          🤝 Friends
        </button>
        <button
          onClick={handleMultiplayerClick}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:scale-105 transition-transform shadow-md"
        >
          🎮 Start Multiplayer Session
        </button>

      </div>
    </div>
  </div>

  {/* Modals */}
  {showAchievements && <AchievementModal onClose={() => setShowAchievements(false)} />}
  {showStats && <StatsModal onClose={() => setShowStats(false)} />}
</div>

  );
}
