import React from "react";

const StartScreen = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-bold text-purple-600 mb-8">Quiz Nerd</h1>
      <button
        className="bg-gradient-to-r from-indigo-600 to-purple-600 py-6 px-12 rounded-2xl font-bold shadow-xl text-white text-2xl transform transition-transform duration-300 hover:scale-105"
        onClick={() => onStart()} // no category needed
      >
        Start Quiz
      </button>
    </div>
  );
};

export default StartScreen;
