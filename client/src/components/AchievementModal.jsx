import React, { useState, useEffect } from 'react';

const AchievementModal = ({ onClose }) => {
  const [achievements, setAchievements] = useState([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [filter, setFilter] = useState('all');

  // 🏆 Full synced list of 30 achievements from AchievementSystem
  const achievementDefinitions = [
    // 🟢 Common
    { id: 'first_quiz', name: 'Getting Started', description: 'Complete your first quiz', icon: '🎯', rarity: 'common', xp: 10 },
    { id: 'five_quizzes', name: 'Getting the Hang of It', description: 'Complete 5 quizzes', icon: '🧠', rarity: 'common', xp: 15 },
    { id: 'ten_quizzes', name: 'Quiz Enthusiast', description: 'Complete 10 quizzes', icon: '📘', rarity: 'common', xp: 20 },
    { id: 'early_bird', name: 'Early Bird', description: 'Complete a quiz before 8 AM', icon: '🌅', rarity: 'common', xp: 20 },
    { id: 'night_owl', name: 'Night Owl', description: 'Complete a quiz after 10 PM', icon: '🦉', rarity: 'common', xp: 20 },
    { id: 'streak_5', name: 'Hot Streak', description: 'Get a 5-question streak', icon: '🔥', rarity: 'common', xp: 15 },
    { id: 'first_try_correct', name: 'Lucky Guess', description: 'Get the first question of a quiz right', icon: '🍀', rarity: 'common', xp: 10 },

    // 🔵 Rare
    { id: 'perfect_score', name: 'Perfectionist', description: 'Get 100% on any quiz', icon: '🏆', rarity: 'rare', xp: 50 },
    { id: 'streak_10', name: 'On Fire', description: 'Get a 10-question streak', icon: '⚡', rarity: 'rare', xp: 30 },
    { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a quiz in under 2 minutes', icon: '⏱️', rarity: 'rare', xp: 40 },
    { id: 'marathon_runner', name: 'Marathon Runner', description: 'Complete a 50+ question quiz', icon: '🏃', rarity: 'rare', xp: 35 },
    { id: 'category_expert', name: 'Category Expert', description: 'Get 90%+ in any category', icon: '🎓', rarity: 'rare', xp: 45 },
    { id: 'comeback_king', name: 'Comeback King', description: 'Improve your score by 20% compared to your previous attempt', icon: '🔁', rarity: 'rare', xp: 40 },
    { id: 'consistency', name: 'Consistent Performer', description: 'Complete 7 quizzes in a row', icon: '📅', rarity: 'rare', xp: 60 },
    { id: 'almost_there', name: 'So Close!', description: 'Finish a quiz with 90–99%', icon: '🥈', rarity: 'rare', xp: 30 },
    { id: 'double_perfect', name: 'Double Perfection', description: 'Get 100% twice in a row', icon: '✨', rarity: 'rare', xp: 55 },

    // 🟣 Epic
    { id: 'streak_20', name: 'Unstoppable', description: 'Get a 20-question streak', icon: '💎', rarity: 'epic', xp: 75 },
    { id: 'quiz_master', name: 'Quiz Master', description: 'Complete 50 quizzes', icon: '👑', rarity: 'epic', xp: 100 },
    { id: 'marathon_mind', name: 'Marathon Mind', description: 'Play quizzes for 7 straight days', icon: '🧩', rarity: 'epic', xp: 80 },
    { id: 'multitasker', name: 'Multitasker', description: 'Take quizzes in 5 different categories', icon: '🗂️', rarity: 'epic', xp: 70 },
    { id: 'quiz_addict', name: 'Quiz Addict', description: 'Complete 100 quizzes', icon: '💀', rarity: 'epic', xp: 90 },
    { id: 'flawless_day', name: 'Flawless Day', description: 'Get 100% on every quiz taken today', icon: '🌞', rarity: 'epic', xp: 85 },
    { id: 'accuracy_beast', name: 'Accuracy Beast', description: 'Maintain a 90%+ average over 10 quizzes', icon: '🎯', rarity: 'epic', xp: 80 },

    // 🟡 Legendary
    { id: 'legendary_brain', name: 'Legendary Brain', description: 'Maintain a 95%+ average across 25 quizzes', icon: '🧠', rarity: 'legendary', xp: 120 },
    { id: 'iron_focus', name: 'Iron Focus', description: 'Finish a 100-question quiz without dropping below 80%', icon: '🥇', rarity: 'legendary', xp: 150 },
    { id: 'quiz_god', name: 'Quiz God', description: 'Complete 500 quizzes total', icon: '👼', rarity: 'legendary', xp: 200 },
    { id: 'eternal_streak', name: 'Eternal Streak', description: 'Maintain a streak of 50 correct answers', icon: '🔥', rarity: 'legendary', xp: 160 },
    { id: 'time_traveler', name: 'Time Traveler', description: 'Complete a quiz exactly at midnight', icon: '⏰', rarity: 'legendary', xp: 100 },
    { id: 'ultimate_quizzer', name: 'Ultimate Quizzer', description: 'Unlock all other achievements', icon: '🏅', rarity: 'legendary', xp: 250 },
  ];

  useEffect(() => {
    const unlockedIds = JSON.parse(localStorage.getItem('quiz-achievements') || '[]');
    setUnlockedAchievements(unlockedIds);
    setAchievements(achievementDefinitions);
  }, []);

  const getRarityColor = (rarity) => ({
    common: 'text-gray-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-yellow-400',
  }[rarity] || 'text-gray-400');

  const getRarityBorder = (rarity) => ({
    common: 'border-gray-500',
    rare: 'border-blue-500',
    epic: 'border-purple-500',
    legendary: 'border-yellow-500',
  }[rarity] || 'border-gray-500');

  const getRarityBg = (rarity) => ({
    common: 'bg-gray-800',
    rare: 'bg-blue-900/30',
    epic: 'bg-purple-900/30',
    legendary: 'bg-yellow-900/30',
  }[rarity] || 'bg-gray-800');

  const filteredAchievements = achievements.filter(a => {
    const isUnlocked = unlockedAchievements.includes(a.id);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  const unlockedCount = unlockedAchievements.length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white w-full max-w-5xl rounded-xl p-6 shadow-2xl border border-gray-700 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold">Achievements</h3>
            <p className="text-gray-400">
              {unlockedCount}/{totalCount} unlocked ({completionPercentage}%)
            </p>
          </div>
          <button className="text-gray-400 hover:text-white text-2xl" onClick={onClose}>✖</button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="bg-gray-700 h-3 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          {['all', 'unlocked', 'locked'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === type
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} (
                {type === 'all' ? totalCount :
                 type === 'unlocked' ? unlockedCount :
                 totalCount - unlockedCount})
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAchievements.map(a => {
              const isUnlocked = unlockedAchievements.includes(a.id);
              return (
                <div
                  key={a.id}
                  className={`${getRarityBg(a.rarity)} rounded-lg p-4 border-2 ${getRarityBorder(a.rarity)} ${
                    isUnlocked ? 'opacity-100' : 'opacity-50'
                  } transition-all`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-3xl ${isUnlocked ? '' : 'grayscale'}`}>{a.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-bold ${getRarityColor(a.rarity)}`}>{a.name}</h4>
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">+{a.xp} XP</span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{a.description}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          a.rarity === 'common' ? 'bg-gray-600 text-gray-300' :
                          a.rarity === 'rare' ? 'bg-blue-600 text-blue-200' :
                          a.rarity === 'epic' ? 'bg-purple-600 text-purple-200' :
                          'bg-yellow-600 text-yellow-200'
                        }`}>
                          {a.rarity.toUpperCase()}
                        </span>
                        {isUnlocked && <span className="text-xs text-green-400 font-semibold">✓ UNLOCKED</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2 rounded-lg font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementModal;
