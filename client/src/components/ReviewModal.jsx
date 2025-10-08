import React from 'react';

function ReviewModal({ answers, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white w-full max-w-3xl rounded-xl p-6 shadow-2xl border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Review Answers</h3>
          <button className="text-gray-400 hover:text-white" onClick={onClose}>
            ✖
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto space-y-4">
          {answers.map((a, idx) => (
            <div key={`${a.index}-${idx}`} className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Question {a.index + 1}</div>
              <div className="font-semibold mb-2">{a.question}</div>
              <div className="space-y-2">
                {a.options.map((opt, i) => {
                  const isCorrect = opt === a.correct;
                  const isSelected = opt === a.selected;
                  const base = 'px-3 py-2 rounded-md text-sm';
                  const cls = isCorrect
                    ? 'bg-emerald-600'
                    : isSelected
                    ? 'bg-rose-600'
                    : 'bg-gray-700';
                  return (
                    <div key={i} className={`${base} ${cls}`}>{opt}</div>
                  );
                })}
              </div>
            </div>
          ))}
          {!answers.length && (
            <div className="text-center text-gray-400">No answers recorded.</div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewModal;



