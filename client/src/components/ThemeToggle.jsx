import React from 'react';

const ThemeToggle = ({ theme, setTheme }) => {
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
          ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
          : 'bg-gray-200 hover:bg-gray-300 text-yellow-600'
        } 
        p-2 rounded-lg shadow-md transition-all duration-200 hover:scale-105
        fixed top-4 right-4 z-50
      `}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      <span className="text-xl">
        {theme === 'dark' ? '🌞' : '🌙'}
      </span>
    </button>
  );
};

export default ThemeToggle;
