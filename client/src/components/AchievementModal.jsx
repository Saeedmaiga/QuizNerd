import React, { useState, useEffect } from 'react';

const AchievementModal = ({ onClose }) => {
  const [achievements, setAchievements] = useState([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unlocked, locked

  const achievementDefinitions = [
    {
      id: 'first_quiz',
      name: 'Getting Started',
      description: 'Complete your first quiz',
      icon: '🎯',
      rarity: 'common',
      xp: 10
    },
    {
      id: 'perfect_score',
      name: 'Perfectionist',
      description: 'Get 100% on any quiz',
      icon: '🏆',
      rarity: 'rare',
      xp: 50
    },
    {
      id: 'streak_5',
      name: 'Hot Streak',
      description: 'Get a 5-question streak',
      icon: '🔥',
      rarity: 'common',
      xp: 15
    },
    {
      id: 'streak_10',
      name: 'On Fire',
      description: 'Get a 10-question streak',
      icon: '⚡',
      rarity: 'rare',
      xp: 30
    },
    {
      id: 'streak_20',
      name: 'Unstoppable',
      description: 'Get a 20-question streak',
      icon: '💎',
      rarity: 'epic',
      xp: 75
    },
    {
      id: 'quiz_master',
      name: 'Quiz Master',
      description: 'Complete 50 quizzes',
      icon: '👑',
      rarity: 'epic',
      xp: 100
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Complete a quiz in under 2 minutes',
      icon: '⚡',
      rarity: 'rare',
      xp: 40
    },
    {
      id: 'marathon_runner',
      name: 'Marathon Runner',
      description: 'Complete a 50+ question quiz',
      icon: '🏃',
      rarity: 'rare',
      xp: 35
    },
    {
      id: 'category_expert',
      name: 'Category Expert',
      description: 'Get 90%+ in any category',
      icon: '🎓',
      rarity: 'rare',
      xp: 45
    },
    {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Complete a quiz before 8 AM',
      icon: '🌅',
      rarity: 'common',
      xp: 20
    },
    {
      id: 'night_owl',
      name: 'Night Owl',
      description: 'Complete a quiz after 10 PM',
      icon: '🦉',
      rarity: 'common',
      xp: 20
    },
    {
      id: 'consistency',
      name: 'Consistent Performer',
      description: 'Complete 7 quizzes in a row',
      icon: '📅',
      rarity: 'rare',
      xp: 60
    }
  ];

  useEffect(() => {
    const unlockedIds = JSON.parse(localStorage.getItem('quiz-achievements') || '[]');
    setUnlockedAchievements(unlockedIds);
    setAchievements(achievementDefinitions);
  }, []);

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityBorder = (rarity) => {
    switch (rarity) {
      case 'common': return 'border-gray-500';
      case 'rare': return 'border-blue-500';
      case 'epic': return 'border-purple-500';
      case 'legendary': return 'border-yellow-500';
      default: return 'border-gray-500';
    }
  };

  const getRarityBg = (rarity) => {
    switch (rarity) {
      case 'common': return 'bg-gray-800';
      case 'rare': return 'bg-blue-900/30';
      case 'epic': return 'bg-purple-900/30';
      case 'legendary': return 'bg-yellow-900/30';
      default: return 'bg-gray-800';
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    const isUnlocked = unlockedAchievements.includes(achievement.id);
    switch (filter) {
      case 'unlocked': return isUnlocked;
      case 'locked': return !isUnlocked;
      default: return true;
    }
  });

  const unlockedCount = unlockedAchievements.length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white w-full max-w-4xl rounded-xl p-6 shadow-2xl border border-gray-700 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold">Achievements</h3>
            <p className="text-gray-400">
              {unlockedCount}/{totalCount} unlocked ({completionPercentage}%)
            </p>
          </div>
          <button className="text-gray-400 hover:text-white text-2xl" onClick={onClose}>
            ✖
          </button>
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
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unlocked' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'locked' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Locked ({totalCount - unlockedCount})
          </button>
        </div>

        {/* Achievements Grid */}
        <div className="max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAchievements.map((achievement) => {
              const isUnlocked = unlockedAchievements.includes(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`${getRarityBg(achievement.rarity)} rounded-lg p-4 border-2 ${getRarityBorder(achievement.rarity)} transition-all ${
                    isUnlocked ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-3xl ${isUnlocked ? '' : 'grayscale'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-bold ${getRarityColor(achievement.rarity)}`}>
                          {achievement.name}
                        </h4>
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                          +{achievement.xp} XP
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">
                        {achievement.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          achievement.rarity === 'common' ? 'bg-gray-600 text-gray-300' :
                          achievement.rarity === 'rare' ? 'bg-blue-600 text-blue-200' :
                          achievement.rarity === 'epic' ? 'bg-purple-600 text-purple-200' :
                          'bg-yellow-600 text-yellow-200'
                        }`}>
                          {achievement.rarity.toUpperCase()}
                        </span>
                        {isUnlocked && (
                          <span className="text-xs text-green-400 font-semibold">
                            ✓ UNLOCKED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2 rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementModal;
