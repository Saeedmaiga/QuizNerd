import React, { useState, useEffect } from 'react';

const PowerUpsSystem = ({ 
  onUsePowerUp, 
  remainingHints, 
  remaining5050, 
  theme,
  disabled = false 
}) => {
  const [powerUps, setPowerUps] = useState({
    skip: 2,
    extraTime: 1,
    doublePoints: 1,
    revealAnswer: 1,
    hint: remainingHints,
    fiftyFifty: remaining5050
  });

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    // Load power-ups from localStorage
    const savedPowerUps = localStorage.getItem('quiz-powerups');
    if (savedPowerUps) {
      setPowerUps(JSON.parse(savedPowerUps));
    }
  }, []);

  useEffect(() => {
    // Update hint and 50/50 counts
    setPowerUps(prev => ({
      ...prev,
      hint: remainingHints,
      fiftyFifty: remaining5050
    }));
  }, [remainingHints, remaining5050]);

  const powerUpDefinitions = [
    {
      id: 'skip',
      name: 'Skip Question',
      description: 'Skip the current question',
      icon: '⏭️',
      cost: 0,
      maxUses: 2,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/30',
      borderColor: 'border-blue-500'
    },
    {
      id: 'extraTime',
      name: 'Extra Time',
      description: 'Add 15 seconds to timer',
      icon: '⏰',
      cost: 0,
      maxUses: 1,
      color: 'text-green-400',
      bgColor: 'bg-green-900/30',
      borderColor: 'border-green-500'
    },
    {
      id: 'doublePoints',
      name: 'Double Points',
      description: 'Next correct answer gives 2 points',
      icon: '💎',
      cost: 0,
      maxUses: 1,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/30',
      borderColor: 'border-purple-500'
    },
    {
      id: 'revealAnswer',
      name: 'Reveal Answer',
      description: 'Show the correct answer',
      icon: '👁️',
      cost: 0,
      maxUses: 1,
      color: 'text-red-400',
      bgColor: 'bg-red-900/30',
      borderColor: 'border-red-500'
    },
    {
      id: 'hint',
      name: 'Hint',
      description: 'Get a helpful hint',
      icon: '💡',
      cost: 0,
      maxUses: 3,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/30',
      borderColor: 'border-yellow-500'
    },
    {
      id: 'fiftyFifty',
      name: '50/50',
      description: 'Remove 2 wrong answers',
      icon: '🎯',
      cost: 0,
      maxUses: 1,
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/30',
      borderColor: 'border-orange-500'
    }
  ];

  const usePowerUp = (powerUpId) => {
    if (disabled || powerUps[powerUpId] <= 0) return;

    const powerUp = powerUpDefinitions.find(p => p.id === powerUpId);
    if (!powerUp) return;

    // Update power-up count
    const newPowerUps = {
      ...powerUps,
      [powerUpId]: powerUps[powerUpId] - 1
    };
    setPowerUps(newPowerUps);
    localStorage.setItem('quiz-powerups', JSON.stringify(newPowerUps));

    // Show notification
    setNotificationMessage(`Used ${powerUp.name}!`);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);

    // Call parent handler
    if (onUsePowerUp) {
      onUsePowerUp(powerUpId);
    }
  };

  const addPowerUp = (powerUpId, amount = 1) => {
    const powerUp = powerUpDefinitions.find(p => p.id === powerUpId);
    if (!powerUp) return;

    const newPowerUps = {
      ...powerUps,
      [powerUpId]: Math.min(powerUps[powerUpId] + amount, powerUp.maxUses)
    };
    setPowerUps(newPowerUps);
    localStorage.setItem('quiz-powerups', JSON.stringify(newPowerUps));
  };

  const resetPowerUps = () => {
    const defaultPowerUps = {
      skip: 2,
      extraTime: 1,
      doublePoints: 1,
      revealAnswer: 1,
      hint: 3,
      fiftyFifty: 1
    };
    setPowerUps(defaultPowerUps);
    localStorage.setItem('quiz-powerups', JSON.stringify(defaultPowerUps));
  };

  return (
    <>
      {/* Power-up Notification */}
      {showNotification && (
        <div className="fixed top-32 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-lg shadow-lg">
            <p className="font-semibold">{notificationMessage}</p>
          </div>
        </div>
      )}

      {/* Power-ups Display */}
      <div className="fixed bottom-32 right-4 z-40">
        <div className="bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚡</span>
            <span className="text-sm font-semibold text-gray-300">Power-ups</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {powerUpDefinitions.map((powerUp) => {
              const count = powerUps[powerUp.id];
              const isAvailable = count > 0 && !disabled;
              
              return (
                <button
                  key={powerUp.id}
                  onClick={() => usePowerUp(powerUp.id)}
                  disabled={!isAvailable}
                  className={`
                    ${powerUp.bgColor} ${powerUp.borderColor}
                    border-2 rounded-lg p-2 text-center transition-all
                    ${isAvailable 
                      ? 'hover:scale-105 cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                    }
                  `}
                  title={`${powerUp.name}: ${powerUp.description}`}
                >
                  <div className={`text-lg ${powerUp.color}`}>
                    {powerUp.icon}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    {count}
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="mt-2 text-center">
            <button
              onClick={resetPowerUps}
              className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
              title="Reset power-ups (for testing)"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PowerUpsSystem;
