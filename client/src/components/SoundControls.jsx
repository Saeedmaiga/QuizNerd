import React from 'react';

const SoundControls = ({ 
  soundEnabled, 
  musicEnabled, 
  setSoundEnabled, 
  setMusicEnabled, 
  theme,
  isInHeader = false
}) => {
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const toggleMusic = () => {
    setMusicEnabled(!musicEnabled);
  };

  return (
    <div className={`flex gap-2 ${isInHeader ? 'relative z-10' : 'fixed top-4 right-20 z-30'}`}>
      {/* Sound Effects Toggle */}
      <button
        onClick={toggleSound}
        className={`
          ${theme === 'dark' 
            ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-blue-400' 
            : 'bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-100 hover:to-gray-200 text-blue-600'
          } 
          p-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl border border-white/20 backdrop-blur-sm
        `}
        title={`${soundEnabled ? 'Disable' : 'Enable'} sound effects`}
      >
        <span className="text-xl animate-pulse">
          {soundEnabled ? '🔊' : '🔇'}
        </span>
      </button>

      {/* Background Music Toggle */}
      <button
        onClick={toggleMusic}
        className={`
          ${theme === 'dark' 
            ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-purple-400' 
            : 'bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-100 hover:to-gray-200 text-purple-600'
          } 
          ${musicEnabled 
            ? 'ring-2 ring-purple-400 shadow-purple-400/25' 
            : ''
          }
          p-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl border border-white/20 backdrop-blur-sm
        `}
        title={`${musicEnabled ? 'Disable' : 'Enable'} background music`}
      >
        <span className="text-xl animate-pulse">
          {musicEnabled ? '🎵' : '🎶'}
        </span>
      </button>
    </div>
  );
};

export default SoundControls;
