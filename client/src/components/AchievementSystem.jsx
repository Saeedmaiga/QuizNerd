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

  // 🎯 Define all 30 achievements
  const achievementDefinitions = [
    // 🟢 Beginner / Common
    {
      id: 'first_quiz',
      name: 'Getting Started',
      description: 'Complete your first quiz',
      icon: '🎯',
      condition: (stats) => stats.totalAttempts >= 1,
      rarity: 'common'
    },
    {
      id: 'five_quizzes',
      name: 'Getting the Hang of It',
      description: 'Complete 5 quizzes',
      icon: '🧠',
      condition: (stats) => stats.totalAttempts >= 5,
      rarity: 'common'
    },
    {
      id: 'ten_quizzes',
      name: 'Quiz Enthusiast',
      description: 'Complete 10 quizzes',
      icon: '📘',
      condition: (stats) => stats.totalAttempts >= 10,
      rarity: 'common'
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
      id: 'streak_5',
      name: 'Hot Streak',
      description: 'Get a 5-question streak',
      icon: '🔥',
      condition: (stats) => stats.maxStreak >= 5,
      rarity: 'common'
    },
    {
      id: 'first_try_correct',
      name: 'Lucky Guess',
      description: 'Get the first question of a quiz right',
      icon: '🍀',
      condition: (stats) => stats.firstTryCorrect,
      rarity: 'common'
    },

    // 🔵 Rare
    {
      id: 'perfect_score',
      name: 'Perfectionist',
      description: 'Get 100% on any quiz',
      icon: '🏆',
      condition: (stats) => stats.bestScore === 100,
      rarity: 'rare'
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
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Complete a quiz in under 2 minutes',
      icon: '⏱️',
      condition: (stats) => stats.fastestTime <= 120,
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
      id: 'comeback_king',
      name: 'Comeback King',
      description: 'Improve your score by 20% compared to your previous attempt',
      icon: '🔁',
      condition: (stats) => stats.improvedScoreBy20,
      rarity: 'rare'
    },
    {
      id: 'consistency',
      name: 'Consistent Performer',
      description: 'Complete 7 quizzes in a row',
      icon: '📅',
      condition: (stats) => stats.consecutiveDays >= 7,
      rarity: 'rare'
    },
    {
      id: 'almost_there',
      name: 'So Close!',
      description: 'Finish a quiz with 90–99%',
      icon: '🥈',
      condition: (stats) => stats.bestScore >= 90 && stats.bestScore < 100,
      rarity: 'rare'
    },
    {
      id: 'double_perfect',
      name: 'Double Perfection',
      description: 'Get 100% twice in a row',
      icon: '✨',
      condition: (stats) => stats.perfectStreak >= 2,
      rarity: 'rare'
    },

    // 🟣 Epic
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
      id: 'marathon_mind',
      name: 'Marathon Mind',
      description: 'Play quizzes for 7 straight days',
      icon: '🧩',
      condition: (stats) => stats.consecutiveDays >= 7,
      rarity: 'epic'
    },
    {
      id: 'multitasker',
      name: 'Multitasker',
      description: 'Take quizzes in 5 different categories',
      icon: '🗂️',
      condition: (stats) => Object.keys(stats.categoryScores).length >= 5,
      rarity: 'epic'
    },
    {
      id: 'quiz_addict',
      name: 'Quiz Addict',
      description: 'Complete 100 quizzes',
      icon: '💀',
      condition: (stats) => stats.totalAttempts >= 100,
      rarity: 'epic'
    },
    {
      id: 'flawless_day',
      name: 'Flawless Day',
      description: 'Get 100% on every quiz taken today',
      icon: '🌞',
      condition: (stats) => stats.allPerfectToday,
      rarity: 'epic'
    },
    {
      id: 'accuracy_beast',
      name: 'Accuracy Beast',
      description: 'Maintain a 90%+ average over 10 quizzes',
      icon: '🎯',
      condition: (stats) => stats.averageScore >= 90 && stats.totalAttempts >= 10,
      rarity: 'epic'
    },

    // 🟡 Legendary
    {
      id: 'legendary_brain',
      name: 'Legendary Brain',
      description: 'Maintain a 95%+ average across 25 quizzes',
      icon: '🧠',
      condition: (stats) => stats.averageScore >= 95 && stats.totalAttempts >= 25,
      rarity: 'legendary'
    },
    {
      id: 'iron_focus',
      name: 'Iron Focus',
      description: 'Finish a 100-question quiz without dropping below 80%',
      icon: '🥇',
      condition: (stats) => stats.maxQuestions >= 100 && stats.bestScore >= 80,
      rarity: 'legendary'
    },
    {
      id: 'quiz_god',
      name: 'Quiz God',
      description: 'Complete 500 quizzes total',
      icon: '👼',
      condition: (stats) => stats.totalAttempts >= 500,
      rarity: 'legendary'
    },
    {
      id: 'eternal_streak',
      name: 'Eternal Streak',
      description: 'Maintain a streak of 50 correct answers',
      icon: '🔥',
      condition: (stats) => stats.maxStreak >= 50,
      rarity: 'legendary'
    },
    {
      id: 'time_traveler',
      name: 'Time Traveler',
      description: 'Complete a quiz exactly at midnight',
      icon: '⏰',
      condition: (stats) => stats.hasMidnightQuiz,
      rarity: 'legendary'
    },
    {
      id: 'ultimate_quizzer',
      name: 'Ultimate Quizzer',
      description: 'Unlock all other achievements',
      icon: '🏅',
      condition: (stats) => stats.unlockedCount >= 29,
      rarity: 'legendary'
    },
  ];

  // 🧮 Calculate current stats
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
      hasMidnightQuiz: false,
      consecutiveDays: 0,
      averageScore: 0,
      improvedScoreBy20: false,
      perfectStreak: 0,
      allPerfectToday: false,
      unlockedCount: JSON.parse(localStorage.getItem('quiz-achievements') || '[]').length,
      firstTryCorrect: false
    };

    if (attempts.length > 0) {
      stats.averageScore = attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length;
    }

    if (attempts.length > 1) {
      const last = attempts[attempts.length - 1].percentage;
      const prev = attempts[attempts.length - 2].percentage;
      if (last - prev >= 20) stats.improvedScoreBy20 = true;
    }

    let perfectCount = 0;
    attempts.forEach(a => {
      if (a.percentage === 100) perfectCount++;
      else perfectCount = 0;
    });
    stats.perfectStreak = perfectCount;

    // Calculate category averages
    attempts.forEach(attempt => {
      if (attempt.category) {
        if (!stats.categoryScores[attempt.category]) stats.categoryScores[attempt.category] = [];
        stats.categoryScores[attempt.category].push(attempt.percentage);
      }
      const hour = new Date(attempt.date).getHours();
      if (hour < 8) stats.hasEarlyBird = true;
      if (hour >= 22) stats.hasNightOwl = true;
      if (hour === 0) stats.hasMidnightQuiz = true;
    });

    Object.keys(stats.categoryScores).forEach(cat => {
      const arr = stats.categoryScores[cat];
      stats.categoryScores[cat] = arr.reduce((s, v) => s + v, 0) / arr.length;
    });

    const sorted = attempts.sort((a, b) => new Date(a.date) - new Date(b.date));
    let consecutiveDays = 0;
    let currentDate = new Date();
    for (let i = sorted.length - 1; i >= 0; i--) {
      const attemptDate = new Date(sorted[i].date);
      const daysDiff = Math.floor((currentDate - attemptDate) / (1000 * 60 * 60 * 24));
      if (daysDiff === consecutiveDays) {
        consecutiveDays++;
        currentDate = attemptDate;
      } else break;
    }
    stats.consecutiveDays = consecutiveDays;

    const today = new Date().toDateString();
    stats.allPerfectToday = attempts
      .filter(a => new Date(a.date).toDateString() === today)
      .every(a => a.percentage === 100);

    stats.firstTryCorrect = attempts.some(a => a.firstCorrect);

    return stats;
  };

  // 🏆 Check and unlock new achievements
  const checkAchievements = () => {
    const stats = calculateStats();
    const unlocked = JSON.parse(localStorage.getItem('quiz-achievements') || '[]');
    const newOnes = achievementDefinitions.filter(a => !unlocked.includes(a.id) && a.condition(stats));

    if (newOnes.length > 0) {
      const latest = newOnes[newOnes.length - 1];
      const updated = [...unlocked, ...newOnes.map(a => a.id)];
      localStorage.setItem('quiz-achievements', JSON.stringify(updated));
      setNewAchievement(latest);
      setShowNotification(true);
      if (onAchievementUnlocked) onAchievementUnlocked(latest);
      setTimeout(() => {
        setShowNotification(false);
        setNewAchievement(null);
      }, 4000);
    }
  };

  useEffect(() => {
    if (isFinished || attempts.length > 0) checkAchievements();
  }, [isFinished, attempts.length, streak]);

  useEffect(() => {
    const unlockedIds = JSON.parse(localStorage.getItem('quiz-achievements') || '[]');
    const unlockedAchievements = achievementDefinitions.filter(a => unlockedIds.includes(a.id));
    setAchievements(unlockedAchievements);
  }, []);

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
      {/* 🏅 Notification */}
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

      {/* 🧾 Display */}
      <div className="fixed bottom-20 left-4 z-40">
        <div className="bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🏆</span>
            <span className="text-sm font-semibold text-gray-300">Achievements</span>
          </div>
          <div className="flex gap-1">
            {achievements.slice(-3).map((a) => (
              <div
                key={a.id}
                className={`w-8 h-8 rounded-full border-2 ${getRarityBorder(a.rarity)} flex items-center justify-center text-sm cursor-pointer hover:scale-110 transition-transform`}
                title={`${a.name}: ${a.description}`}
              >
                {a.icon}
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
