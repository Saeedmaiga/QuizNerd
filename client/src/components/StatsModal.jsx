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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900/90 backdrop-blur-xl text-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl border border-gray-700/50 transform animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-3xl font-bold flex items-center gap-3">
            <span className="text-4xl">📊</span>
            Your Stats
          </h3>
          <button className="text-gray-400 hover:text-white text-2xl transition-colors" onClick={onClose}>
            ✖
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-blue-500/30">
            <div className="text-4xl font-bold text-blue-400 mb-2">{totals}</div>
            <div className="text-gray-300 text-sm font-semibold">Total Attempts</div>
          </div>
          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-green-500/30">
            <div className="text-4xl font-bold text-green-400 mb-2">{avg}%</div>
            <div className="text-gray-300 text-sm font-semibold">Average Score</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-yellow-500/30">
            <div className="text-4xl font-bold text-yellow-400 mb-2">{best}%</div>
            <div className="text-gray-300 text-sm font-semibold">Best Score</div>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-3">
          <h4 className="text-lg font-semibold text-gray-300 mb-4">Recent Attempts</h4>
          {attempts.map((a) => (
            <div key={a.id} className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 flex justify-between items-center border border-gray-700/30 hover:bg-gray-700/60 transition-all">
              <div>
                <div className="font-semibold text-white">{new Date(a.date).toLocaleString()}</div>
                <div className="text-gray-400 text-sm">
                  {a.source} • {a.difficulty}{a.category ? ` • ${a.category}` : ''}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{a.score}/{a.total}</div>
                <div className="text-sm text-gray-400">({a.percentage}%)</div>
              </div>
            </div>
          ))}
          {!attempts.length && (
            <div className="text-center text-gray-400 py-8">
              <div className="text-4xl mb-2">📈</div>
              <p>No attempts yet. Start your first quiz!</p>
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

export default StatsModal;



