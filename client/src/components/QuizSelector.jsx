import { useState } from 'react';

const QuizSelector = ({ onStart, loading, error }) => {
  const [config, setConfig] = useState({
    source: 'opentdb',
    amount: 10,
    difficulty: 'easy',
    category: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onStart(config);
  };

  const opentdbCategories = [
    { id: 9, name: 'General Knowledge' },
    { id: 10, name: 'Entertainment: Books' },
    { id: 11, name: 'Entertainment: Film' },
    { id: 12, name: 'Entertainment: Music' },
    { id: 17, name: 'Science & Nature' },
    { id: 18, name: 'Science: Computers' },
    { id: 19, name: 'Science: Mathematics' },
    { id: 22, name: 'Geography' },
    { id: 23, name: 'History' },
    { id: 27, name: 'Animals' }
  ];

  const triviaApiCategories = [
    'arts_and_literature',
    'film_and_tv',
    'food_and_drink',
    'general_knowledge',
    'geography',
    'history',
    'music',
    'science',
    'society_and_culture',
    'sport_and_leisure'
  ];

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Question Source
          </label>
          <select
            value={config.source}
            onChange={(e) => setConfig({ ...config, source: e.target.value, category: null })}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
          >
            <option value="opentdb">OpenTDB</option>
            <option value="triviaapi">The Trivia API</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Number of Questions
          </label>
          <select
            value={config.amount}
            onChange={(e) => setConfig({ ...config, amount: parseInt(e.target.value) })}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
          >
            <option value={5}>5 Questions</option>
            <option value={10}>10 Questions</option>
            <option value={15}>15 Questions</option>
            <option value={20}>20 Questions</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Difficulty
          </label>
          <select
            value={config.difficulty}
            onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category (Optional)
          </label>
          <select
            value={config.category || ''}
            onChange={(e) => setConfig({ ...config, category: e.target.value || null })}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
          >
            <option value="">Any Category</option>
            {config.source === 'opentdb' 
              ? opentdbCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))
              : triviaApiCategories.map(cat => (
                  <option key={cat} value={cat}>{cat.replace(/_/g, ' ').toUpperCase()}</option>
                ))
            }
          </select>
        </div>

        {error && (
          <div className="text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 py-3 px-6 rounded-lg font-medium shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Start Quiz'}
        </button>
      </form>
    </div>
  );
};

export default QuizSelector;