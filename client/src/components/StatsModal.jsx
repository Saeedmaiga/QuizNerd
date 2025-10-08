import React, { useMemo } from 'react';

function StatsModal({ onClose }) {
  const attempts = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('quiz-stats') || '[]');
    } catch {
      return [];
    }
  }, []);

  const totals = attempts.length;
  const avg = totals
    ? Math.round(
        attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totals
      )
    : 0;
  const best = attempts.reduce((b, a) => Math.max(b, a.percentage || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white w-full max-w-lg rounded-xl p-6 shadow-2xl border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Your Stats</h3>
          <button className="text-gray-400 hover:text-white" onClick={onClose}>
            ✖
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">{totals}</div>
            <div className="text-gray-400 text-sm">Attempts</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">{avg}%</div>
            <div className="text-gray-400 text-sm">Average</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">{best}%</div>
            <div className="text-gray-400 text-sm">Best</div>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {attempts.map((a) => (
            <div key={a.id} className="bg-gray-800 rounded-lg p-3 flex justify-between text-sm">
              <div>
                <div className="font-semibold">{new Date(a.date).toLocaleString()}</div>
                <div className="text-gray-400">
                  {a.source} • {a.difficulty}{a.category ? ` • ${a.category}` : ''}
                </div>
              </div>
              <div className="font-bold">{a.score}/{a.total} ({a.percentage}%)</div>
            </div>
          ))}
          {!attempts.length && (
            <div className="text-center text-gray-400">No attempts yet.</div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
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

export default StatsModal;



