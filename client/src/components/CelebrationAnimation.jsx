import React, { useEffect } from 'react';

const CelebrationAnimation = ({ type, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const getAnimationContent = () => {
    switch (type) {
      case 'streak-5':
        return {
          emoji: '🔥🔥🔥',
          message: 'INCREDIBLE STREAK!',
          color: 'text-red-400',
          bgColor: 'bg-red-900'
        };
      case 'streak-10':
        return {
          emoji: '⚡⚡⚡',
          message: 'LEGENDARY!',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-900'
        };
      case 'streak-15':
        return {
          emoji: '💎💎💎',
          message: 'QUIZ MASTER!',
          color: 'text-blue-400',
          bgColor: 'bg-blue-900'
        };
      case 'perfect':
        return {
          emoji: '🏆🎉👑',
          message: 'PERFECT SCORE!',
          color: 'text-purple-400',
          bgColor: 'bg-purple-900'
        };
      case 'milestone':
        return {
          emoji: '🚀🎊',
          message: 'ACHIEVEMENT UNLOCKED!',
          color: 'text-green-400',
          bgColor: 'bg-green-900'
        };
      default:
        return {
          emoji: '🎊',
          message: 'GREAT JOB!',
          color: 'text-green-400',
          bgColor: 'bg-green-900'
        };
    }
  };

  const content = getAnimationContent();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className={`
        ${content.bgColor} 
        ${content.color}
        rounded-2xl shadow-2xl p-8 animate-bounce
        transform transition-all duration-500 ease-out
      `}>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">
            {content.emoji}
          </div>
          <h2 className="text-3xl font-bold animate-pulse">
            {content.message}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default CelebrationAnimation;
