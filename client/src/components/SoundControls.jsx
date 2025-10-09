import React from 'react';

const SoundControls = ({ 
  soundEnabled, 
  musicEnabled, 
  setSoundEnabled, 
  setMusicEnabled, 
  theme 
}) => {
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const toggleMusic = () => {
    setMusicEnabled(!musicEnabled);
  };

  const playClickSound = () => {
    const clickSound = new Audio("/button-click.mp3");
    clickSound.play();
  }
  return (
    <div className="flex gap-2 fixed top-4 right-16 z-50">
      {/* Sound Effects Toggle */}
      <button
        onClick={() => {
          toggleSound();
          playClickSound();
        }}
        className={`
          ${theme === 'dark' 
            ? 'bg-gray-700 hover:bg-gray-600 text-blue-400' 
            : 'bg-gray-200 hover:bg-gray-300 text-blue-600'
          } 
          p-2 rounded-lg shadow-md transition-all duration-200 hover:scale-105
        `}
        title={`${soundEnabled ? 'Disable' : 'Enable'} sound effects`}
      >
        <span className="text-xl">
          {soundEnabled ? '🔊' : '🔇'}
        </span>
      </button>

      {/* Background Music Toggle */}
      <button
        onClick={toggleMusic}
        className={`
          ${theme === 'dark' 
            ? 'bg-gray-700 hover:bg-gray-600 text-purple-400' 
            : 'bg-gray-200 hover:bg-gray-300 text-purple-600'
          } 
          ${musicEnabled 
            ? 'ring-2 ring-purple-400' 
            : ''
          }
          p-2 rounded-lg shadow-md transition-all duration-200 hover:scale-105
        `}
        title={`${musicEnabled ? 'Disable' : 'Enable'} background music`}
      >
        <span className="text-xl">
          {musicEnabled ? '🎵' : '🎶'}
        </span>
      </button>
    </div>
  );
};

export default SoundControls;
