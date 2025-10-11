import React from 'react';

const ThemeToggle = ({ theme, setTheme, isInHeader = false }) => {
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

const playClickSound = () => {
    const clickSound = new Audio("/button-click.mp3");
    clickSound.play();
  }

  return (
    <button
      onClick={() => {
        toggleTheme();
        playClickSound();
      }}
      
      className={`
        ${theme === 'dark' 
          ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-yellow-400' 
          : 'bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-100 hover:to-gray-200 text-yellow-600'
        } 
        p-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl border border-white/20 backdrop-blur-sm
        ${isInHeader ? 'relative z-10' : 'fixed top-4 right-4 z-30'}
      `}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      <span className="text-2xl animate-pulse">
        {theme === 'dark' ? '🌞' : '🌙'}
      </span>
    </button>
  );
};

export default ThemeToggle;
