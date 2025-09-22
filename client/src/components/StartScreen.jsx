import React from "react";

const categories = ["History", "Science", "Sports", "Technology"];

const StartScreen = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-bold text-purple-600 mb-6">Quiz Nerd</h1>
      <p className="text-gray-400 mb-8 text-lg">Choose a category to begin:</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        {categories.map((category) => (
          <button
            key={category}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6 rounded-lg font-bold shadow-lg text-white transform transition-transform duration-300 hover:scale-105"
            onClick={() => onStart(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StartScreen;
