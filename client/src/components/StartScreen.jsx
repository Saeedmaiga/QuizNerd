import React from "react";

const StartScreen = ({ onStart, themeClasses }) => {
  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} flex flex-col items-center justify-center p-4`}>
      <h1 className={`text-5xl font-bold mb-8`} style={{ color: themeClasses.accent }}>
        QuizNerd
      </h1>
      <button
        className={`${themeClasses.button} py-6 px-12 rounded-2xl font-bold shadow-xl text-white text-2xl transform transition-transform duration-300 hover:scale-105`}
        onClick={onStart} // no category needed
      >
        Start Learning
      </button>
    </div>
  );
};

export default StartScreen;
