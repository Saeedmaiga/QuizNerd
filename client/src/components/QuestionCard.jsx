import React from "react";

const QuestionCard = ({
  data,
  onAnswer,
  showFeedback,
  selected,
  current,
  total,
  options, // <-- add options prop
}) => {
  const { question, answer } = data; // no longer destructure options from data

  const getButtonStyle = (option) => {
    if (!showFeedback) {
      return "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:scale-105 hover:shadow-lg transition-all duration-200";
    }
    if (option === answer) return "bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg";
    if (option === selected) return "bg-gradient-to-r from-rose-500 to-red-500 shadow-lg";
    return "bg-gradient-to-r from-gray-600 to-gray-700 opacity-60";
  };

  return (
    <div className="bg-gray-800/80 backdrop-blur-xl p-4 md:p-6 rounded-2xl shadow-lg w-full max-w-xl border border-gray-700/50 transform hover:scale-105 transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg font-bold text-sm">
            Q{current + 1}
          </div>
          <h2 className="text-sm font-semibold text-gray-300">
            {current + 1} of {total}
          </h2>
        </div>
        <div className="bg-gray-700/50 px-3 py-1 rounded-lg border border-gray-600/50">
          <span className="text-xs font-medium text-gray-300">
            {selected
              ? Math.round(((current + 1) / total) * 100) + "%"
              : Math.round((current / total) * 100) + "%"}
          </span>
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-lg font-semibold leading-relaxed text-white">{question}</p>
      </div>
      
      <div className="grid gap-3">
        {options.map((option, index) => (
          <button
            className={`${getButtonStyle(option)} text-left px-4 py-3 cursor-pointer rounded-lg text-white font-medium text-base border border-white/10 transition-all duration-200`}
            key={index}
            onClick={() => onAnswer(option)}
            disabled={showFeedback}
          >
            <span className="flex items-center gap-2">
              <span className="bg-white/20 px-2 py-1 rounded-md font-bold text-xs">
                {String.fromCharCode(65 + index)}
              </span>
              <span>{option}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;

