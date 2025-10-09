import React, { useState, useEffect } from 'react';

const DailyChallenge = ({ onStartChallenge, theme }) => {
  const [challenge, setChallenge] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const challenges = [
    {
      id: 'speed_master',
      name: 'Speed Master',
      description: 'Complete 10 questions in under 2 minutes',
      icon: '⚡',
      difficulty: 'medium',
      reward: { xp: 50, coins: 10 },
      config: { amount: 10, difficulty: 'medium', timeLimit: 120 }
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Get 100% on a 15-question quiz',
      icon: '🏆',
      difficulty: 'hard',
      reward: { xp: 75, coins: 15 },
      config: { amount: 15, difficulty: 'medium', perfectScore: true }
    },
    {
      id: 'streak_champion',
      name: 'Streak Champion',
      description: 'Maintain a 10-question streak',
      icon: '🔥',
      difficulty: 'hard',
      reward: { xp: 60, coins: 12 },
      config: { amount: 15, difficulty: 'medium', streakGoal: 10 }
    },
    {
      id: 'category_expert',
      name: 'Category Expert',
      description: 'Score 80%+ in Science & Nature',
      icon: '🔬',
      difficulty: 'medium',
      reward: { xp: 40, coins: 8 },
      config: { amount: 10, difficulty: 'medium', category: 'Science & Nature', minScore: 80 }
    },
    {
      id: 'marathon_runner',
      name: 'Marathon Runner',
      description: 'Complete 25 questions without breaks',
      icon: '🏃',
      difficulty: 'hard',
      reward: { xp: 80, coins: 20 },
      config: { amount: 25, difficulty: 'easy', noBreaks: true }
    },
    {
      id: 'night_owl',
      name: 'Night Owl',
      description: 'Complete any quiz after 10 PM',
      icon: '🦉',
      difficulty: 'easy',
      reward: { xp: 25, coins: 5 },
      config: { amount: 10, difficulty: 'easy', timeRestriction: 'night' }
    }
  ];

  useEffect(() => {
    // Get today's challenge
    const today = new Date().toDateString();
    const savedChallenge = localStorage.getItem(`daily-challenge-${today}`);
    
    if (savedChallenge) {
      const challengeData = JSON.parse(savedChallenge);
      setChallenge(challengeData);
      setIsCompleted(challengeData.completed || false);
    } else {
      // Generate new challenge for today
      const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
      const newChallenge = {
        ...randomChallenge,
        date: today,
        completed: false,
        attempts: 0
      };
      
      setChallenge(newChallenge);
      localStorage.setItem(`daily-challenge-${today}`, JSON.stringify(newChallenge));
    }

    // Calculate time until next challenge (midnight)
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    setTimeLeft(Math.floor((midnight - now) / 1000));
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getDifficultyBg = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-900/30 border-green-500';
      case 'medium': return 'bg-yellow-900/30 border-yellow-500';
      case 'hard': return 'bg-red-900/30 border-red-500';
      default: return 'bg-gray-900/30 border-gray-500';
    }
  };

  const handleStartChallenge = () => {
    if (challenge && !isCompleted) {
      onStartChallenge(challenge.config);
    }
  };

  if (!challenge) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="text-center text-gray-400">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          Loading daily challenge...
        </div>
      </div>
    );
  }

  return (
    <div className={`${getDifficultyBg(challenge.difficulty)} rounded-lg p-4 border-2 shadow-lg`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{challenge.icon}</span>
          <div>
            <h3 className="text-lg font-bold text-white">Daily Challenge</h3>
            <p className={`text-sm font-medium ${getDifficultyColor(challenge.difficulty)}`}>
              {challenge.difficulty.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">Next challenge in:</div>
          <div className="text-sm font-mono text-gray-300">{formatTime(timeLeft)}</div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-white mb-1">{challenge.name}</h4>
        <p className="text-gray-300 text-sm">{challenge.description}</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">⭐</span>
            <span className="text-gray-300">+{challenge.reward.xp} XP</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">🪙</span>
            <span className="text-gray-300">+{challenge.reward.coins} coins</span>
          </div>
        </div>
        
        {challenge.attempts > 0 && (
          <div className="text-xs text-gray-400">
            Attempts: {challenge.attempts}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {isCompleted ? (
          <div className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-center font-semibold">
            ✓ COMPLETED
          </div>
        ) : (
          <button
            onClick={handleStartChallenge}
            className={`flex-1 ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
            } text-white py-2 px-4 rounded-lg font-semibold transition-all hover:scale-105`}
          >
            Start Challenge
          </button>
        )}
        
        <button
          onClick={() => {/* Show challenge details modal */}}
          className="bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 px-3 rounded-lg transition-colors"
          title="View details"
        >
          ℹ️
        </button>
      </div>
    </div>
  );
};

export default DailyChallenge;
