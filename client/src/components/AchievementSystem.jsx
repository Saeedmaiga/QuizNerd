import React, { useState, useEffect } from 'react';

const AchievementSystem = ({ 
  score, 
  totalQuestions, 
  streak, 
  attempts, 
  currentQuestion, 
  isFinished,
  onAchievementUnlocked 
}) => {
  const [achievements, setAchievements] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);

  // Define all possible achievements
  const achievementDefinitions = [
    {
      id: 'first_quiz',
      name: 'Getting Started',
      description: 'Complete your first quiz',
      icon: '🎯',
      condition: (stats) => stats.totalAttempts >= 1,
      rarity: 'common'
    },
    {
      id: 'perfect_score',
      name: 'Perfectionist',
      description: 'Get 100% on any quiz',
      icon: '🏆',
      condition: (stats) => stats.bestScore === 100,
      rarity: 'rare'
    },
    {
      id: 'streak_5',
      name: 'Hot Streak',
      description: 'Get a 5-question streak',
      icon: '🔥',
      condition: (stats) => stats.maxStreak >= 5,
      rarity: 'common'
    },
    {
      id: 'streak_10',
      name: 'On Fire',
      description: 'Get a 10-question streak',
      icon: '⚡',
      condition: (stats) => stats.maxStreak >= 10,
      rarity: 'rare'
    },
    {
      id: 'streak_20',
      name: 'Unstoppable',
      description: 'Get a 20-question streak',
      icon: '💎',
      condition: (stats) => stats.maxStreak >= 20,
      rarity: 'epic'
    },
    {
      id: 'quiz_master',
      name: 'Quiz Master',
      description: 'Complete 50 quizzes',
      icon: '👑',
      condition: (stats) => stats.totalAttempts >= 50,
      rarity: 'epic'
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Complete a quiz in under 2 minutes',
      icon: '⚡',
      condition: (stats) => stats.fastestTime <= 120, // 2 minutes in seconds
      rarity: 'rare'
    },
    {
      id: 'marathon_runner',
      name: 'Marathon Runner',
      description: 'Complete a 50+ question quiz',
      icon: '🏃',
      condition: (stats) => stats.maxQuestions >= 50,
      rarity: 'rare'
    },
    {
      id: 'category_expert',
      name: 'Category Expert',
      description: 'Get 90%+ in any category',
      icon: '🎓',
      condition: (stats) => Object.values(stats.categoryScores).some(score => score >= 90),
      rarity: 'rare'
    },
    {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Complete a quiz before 8 AM',
      icon: '🌅',
      condition: (stats) => stats.hasEarlyBird,
      rarity: 'common'
    },
    {
      id: 'night_owl',
      name: 'Night Owl',
      description: 'Complete a quiz after 10 PM',
      icon: '🦉',
      condition: (stats) => stats.hasNightOwl,
      rarity: 'common'
    },
    {
      id: 'consistency',
      name: 'Consistent Performer',
      description: 'Complete 7 quizzes in a row',
      icon: '📅',
      condition: (stats) => stats.consecutiveDays >= 7,
      rarity: 'rare'
    }
  ];

  // Calculate current stats
  const calculateStats = () => {
    const stats = {
      totalAttempts: attempts.length,
      bestScore: Math.max(...attempts.map(a => a.percentage), 0),
      maxStreak: Math.max(...attempts.map(a => a.maxStreak || 0), streak),
      fastestTime: Math.min(...attempts.map(a => a.timeTaken || Infinity), Infinity),
      maxQuestions: Math.max(...attempts.map(a => a.total), 0),
      categoryScores: {},
      hasEarlyBird: false,
      hasNightOwl: false,
      consecutiveDays: 0
    };

    // Calculate category scores
    attempts.forEach(attempt => {
      if (attempt.category) {
        if (!stats.categoryScores[attempt.category]) {
          stats.categoryScores[attempt.category] = [];
        }
        stats.categoryScores[attempt.category].push(attempt.percentage);
      }
    });

    // Calculate average category scores
    Object.keys(stats.categoryScores).forEach(category => {
      const scores = stats.categoryScores[category];
      stats.categoryScores[category] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });

    // Check time-based achievements
    attempts.forEach(attempt => {
      const hour = new Date(attempt.date).getHours();
      if (hour < 8) stats.hasEarlyBird = true;
      if (hour >= 22) stats.hasNightOwl = true;
    });

    // Calculate consecutive days (simplified)
    const sortedAttempts = attempts.sort((a, b) => new Date(a.date) - new Date(b.date));
    let consecutiveDays = 0;
    let currentDate = new Date();
    
    for (let i = sortedAttempts.length - 1; i >= 0; i--) {
      const attemptDate = new Date(sortedAttempts[i].date);
      const daysDiff = Math.floor((currentDate - attemptDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === consecutiveDays) {
        consecutiveDays++;
        currentDate = attemptDate;
      } else {
        break;
      }
    }
    
    stats.consecutiveDays = consecutiveDays;

    return stats;
  };

  // Check for new achievements
  const checkAchievements = () => {
    const stats = calculateStats();
    const unlockedAchievements = JSON.parse(localStorage.getItem('quiz-achievements') || '[]');
    
    const newAchievements = achievementDefinitions.filter(achievement => {
      // Skip if already unlocked
      if (unlockedAchievements.includes(achievement.id)) return false;
      
      // Check if condition is met
      return achievement.condition(stats);
    });

    if (newAchievements.length > 0) {
      const latestAchievement = newAchievements[newAchievements.length - 1];
      
      // Save to localStorage
      const updatedAchievements = [...unlockedAchievements, ...newAchievements.map(a => a.id)];
      localStorage.setItem('quiz-achievements', JSON.stringify(updatedAchievements));
      
      // Show notification
      setNewAchievement(latestAchievement);
      setShowNotification(true);
      
      // Call callback if provided
      if (onAchievementUnlocked) {
        onAchievementUnlocked(latestAchievement);
      }
      
      // Hide notification after 4 seconds
      setTimeout(() => {
        setShowNotification(false);
        setNewAchievement(null);
      }, 4000);
    }
  };

  // Check achievements when relevant stats change
  useEffect(() => {
    if (isFinished || attempts.length > 0) {
      checkAchievements();
    }
  }, [isFinished, attempts.length, streak]);

  // Load existing achievements
  useEffect(() => {
    const unlockedIds = JSON.parse(localStorage.getItem('quiz-achievements') || '[]');
    const unlockedAchievements = achievementDefinitions.filter(a => unlockedIds.includes(a.id));
    setAchievements(unlockedAchievements);
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

  return (
    <>
      {/* Achievement Notification */}
      {showNotification && newAchievement && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className={`bg-gradient-to-r from-yellow-400 to-orange-500 text-black p-4 rounded-xl shadow-2xl border-2 ${getRarityBorder(newAchievement.rarity)}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{newAchievement.icon}</span>
              <div>
                <h3 className="font-bold text-lg">Achievement Unlocked!</h3>
                <p className="font-semibold">{newAchievement.name}</p>
                <p className="text-sm">{newAchievement.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Display Component */}
      <div className="fixed bottom-20 left-4 z-40">
        <div className="bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🏆</span>
            <span className="text-sm font-semibold text-gray-300">Achievements</span>
          </div>
          <div className="flex gap-1">
            {achievements.slice(-3).map((achievement, index) => (
              <div
                key={achievement.id}
                className={`w-8 h-8 rounded-full border-2 ${getRarityBorder(achievement.rarity)} flex items-center justify-center text-sm cursor-pointer hover:scale-110 transition-transform`}
                title={`${achievement.name}: ${achievement.description}`}
              >
                {achievement.icon}
              </div>
            ))}
            {achievements.length > 3 && (
              <div className="w-8 h-8 rounded-full border-2 border-gray-500 flex items-center justify-center text-xs text-gray-400">
                +{achievements.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AchievementSystem;
