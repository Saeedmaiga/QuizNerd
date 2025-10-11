import React, { useState, useEffect } from 'react';

const XPLevelSystem = ({ 
  onLevelUp, 
  onXPChange,
  showLevelUpAnimation = true 
}) => {
  const [userStats, setUserStats] = useState({
    level: 1,
    xp: 0,
    totalXP: 0,
    xpToNext: 100
  });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpMessage, setLevelUpMessage] = useState('');

  // XP requirements for each level (exponential growth)
  const getXPForLevel = (level) => {
    return Math.floor(100 * Math.pow(1.2, level - 1));
  };

  const getTotalXPForLevel = (level) => {
    let total = 0;
    for (let i = 1; i < level; i++) {
      total += getXPForLevel(i);
    }
    return total;
  };

  useEffect(() => {
    // Load user stats from localStorage
    const savedStats = localStorage.getItem('quiz-user-stats');
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      setUserStats(stats);
    }
  }, []);

  const addXP = (amount, source = 'quiz') => {
    const newTotalXP = userStats.totalXP + amount;
    let newLevel = userStats.level;
    let newXP = userStats.xp;
    let newXPToNext = userStats.xpToNext;

    // Check for level up
    while (newTotalXP >= getTotalXPForLevel(newLevel + 1)) {
      newLevel++;
      newXPToNext = getXPForLevel(newLevel);
      newXP = newTotalXP - getTotalXPForLevel(newLevel);
      
      // Show level up animation
      if (showLevelUpAnimation && newLevel > userStats.level) {
        setLevelUpMessage(`Level ${newLevel}!`);
        setShowLevelUp(true);
        
        if (onLevelUp) {
          onLevelUp(newLevel, newLevel - userStats.level);
        }
        
        setTimeout(() => {
          setShowLevelUp(false);
          setLevelUpMessage('');
        }, 3000);
      }
    }

    // Calculate current level XP
    if (newLevel > 1) {
      newXP = newTotalXP - getTotalXPForLevel(newLevel);
    } else {
      newXP = newTotalXP;
    }

    const updatedStats = {
      level: newLevel,
      xp: newXP,
      totalXP: newTotalXP,
      xpToNext: newXPToNext
    };

    setUserStats(updatedStats);
    localStorage.setItem('quiz-user-stats', JSON.stringify(updatedStats));

    if (onXPChange) {
      onXPChange(amount, updatedStats);
    }
  };

  const getLevelTitle = (level) => {
    if (level >= 50) return 'Quiz Legend';
    if (level >= 40) return 'Quiz Master';
    if (level >= 30) return 'Quiz Expert';
    if (level >= 20) return 'Quiz Scholar';
    if (level >= 15) return 'Quiz Enthusiast';
    if (level >= 10) return 'Quiz Apprentice';
    if (level >= 5) return 'Quiz Novice';
    return 'Quiz Beginner';
  };

  const getLevelColor = (level) => {
    if (level >= 50) return 'text-yellow-400';
    if (level >= 40) return 'text-purple-400';
    if (level >= 30) return 'text-blue-400';
    if (level >= 20) return 'text-green-400';
    if (level >= 15) return 'text-indigo-400';
    if (level >= 10) return 'text-orange-400';
    if (level >= 5) return 'text-pink-400';
    return 'text-gray-400';
  };

  const getLevelIcon = (level) => {
    if (level >= 50) return '👑';
    if (level >= 40) return '🏆';
    if (level >= 30) return '🥇';
    if (level >= 20) return '🥈';
    if (level >= 15) return '🥉';
    if (level >= 10) return '⭐';
    if (level >= 5) return '🌟';
    return '🌱';
  };

  const progressPercentage = (userStats.xp / userStats.xpToNext) * 100;

  return (
    <>
      {/* Level Up Animation */}
      {showLevelUp && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black p-8 rounded-2xl shadow-2xl animate-bounce">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-pulse">
                {getLevelIcon(userStats.level)}
              </div>
              <h2 className="text-4xl font-bold mb-2">
                {levelUpMessage}
              </h2>
              <p className="text-xl font-semibold">
                {getLevelTitle(userStats.level)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* XP Display */}
      <div className="fixed top-20 right-4 z-40">
        <div className="bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-700 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getLevelIcon(userStats.level)}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${getLevelColor(userStats.level)}`}>
                  Level {userStats.level}
                </span>
                <span className="text-xs text-gray-400">
                  {getLevelTitle(userStats.level)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>XP Progress</span>
              <span>{userStats.xp}/{userStats.xpToNext}</span>
            </div>
            <div className="bg-gray-700 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          
          <div className="text-xs text-gray-400">
            Total XP: {userStats.totalXP.toLocaleString()}
          </div>
        </div>
      </div>
    </>
  );
};

export default XPLevelSystem;
