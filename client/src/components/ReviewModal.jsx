import React from 'react';

function ReviewModal({ answers, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900/90 backdrop-blur-xl text-white w-full max-w-4xl rounded-3xl p-8 shadow-2xl border border-gray-700/50 transform animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-3xl font-bold flex items-center gap-3">
            <span className="text-4xl">📖</span>
            Review Answers
          </h3>
          <button className="text-gray-400 hover:text-white text-2xl transition-colors" onClick={onClose}>
            ✖
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto space-y-6">
          {answers.map((a, idx) => (
            <div key={`${a.index}-${idx}`} className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-xl font-bold text-sm">
                  Q{a.index + 1}
                </div>
                <div className="text-sm text-gray-400">Question {a.index + 1}</div>
              </div>
              <div className="font-semibold mb-4 text-lg text-white">{a.question}</div>
              <div className="space-y-3">
                {a.options.map((opt, i) => {
                  const isCorrect = opt === a.correct;
                  const isSelected = opt === a.selected;
                  const base = 'px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3';
                  const cls = isCorrect
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                    : isSelected
                    ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white'
                    : 'bg-gray-700/50 text-gray-300';
                  return (
                    <div key={i} className={`${base} ${cls}`}>
                      <span className="bg-white/20 px-2 py-1 rounded-lg font-bold text-xs">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span>{opt}</span>
                      {isCorrect && <span className="ml-auto text-lg">✅</span>}
                      {isSelected && !isCorrect && <span className="ml-auto text-lg">❌</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {!answers.length && (
            <div className="text-center text-gray-400 py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-lg">No answers recorded.</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
          >
            ✨ Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewModal;



