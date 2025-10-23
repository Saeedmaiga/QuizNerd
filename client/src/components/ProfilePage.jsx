import React, { useState } from "react";
import AchievementModal from "./AchievementModal";
import StatsModal from "./StatsModal";

export default function ProfilePage({ onBack, themeClasses }) {
  const [showAchievements, setShowAchievements] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Sound effect
  const playClickSound = () => {
    const audio = new Audio("/sounds/click.mp3");
    audio.volume = 0.5; // optional: adjust volume
    audio.play().catch(() => {}); // avoid console errors on autoplay restrictions
  };

  const handleStatsClick = () => {
    playClickSound();
    setShowStats(true);
  };

  const handleAchievementsClick = () => {
    playClickSound();
    setShowAchievements(true);
  };

  return (
    <div className={`min-h-screen p-8 flex flex-col items-center ${themeClasses.bg} ${themeClasses.text}`}>
      {/* Header */}
      <header className="w-full mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Profile</h1>
        <button
          onClick={() => {
            playClickSound();
            onBack();
          }}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-semibold hover:scale-105 transition-transform"
        >
          Back
        </button>
      </header>

      {/* Profile Card */}
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center gap-6">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-3xl font-bold">
          👤
        </div>

        {/* Info */}
        <div className="w-full flex flex-col gap-2 text-center">
          <p className="font-semibold text-lg">Username</p>
          <p className="text-sm text-gray-500 dark:text-gray-300">Your role / status</p>
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
        </div>
      </div>

      {/* Modals */}
      {showAchievements && <AchievementModal onClose={() => setShowAchievements(false)} />}
      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
    </div>
  );
}
