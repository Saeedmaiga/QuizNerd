import { useState, useEffect } from 'react';
import QuizCreationTool from './QuizCreationTool';

const QuizSelector = ({ onStart, loading, error }) => {
  const [config, setConfig] = useState({
    source: 'opentdb',
    amount: 10,
    difficulty: 'easy',
    category: null
  });

  const [customQuizzes, setCustomQuizzes] = useState([]);
  const [showCreationTool, setShowCreationTool] = useState(false);

  useEffect(() => {
    // Load custom quizzes
    const savedQuizzes = JSON.parse(localStorage.getItem('custom-quizzes') || '[]');
    setCustomQuizzes(savedQuizzes);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onStart(config);
  };

  const handleCustomQuizStart = (quiz) => {
    const customConfig = {
      source: 'custom',
      amount: quiz.questions.length,
      difficulty: quiz.difficulty,
      category: quiz.category,
      customQuiz: quiz
    };
    onStart(customConfig);
  };

  const handleQuizCreated = (newQuiz) => {
    setCustomQuizzes(prev => [...prev, newQuiz]);
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
    <div className="space-y-4">
      {/* Custom Quizzes Section */}
      {customQuizzes.length > 0 && (
        <div className="bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-gray-700/50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">📚</span>
              Your Quizzes
            </h3>
            <button
              onClick={() => setShowCreationTool(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105"
            >
              ✨ New
            </button>
          </div>
          <div className="space-y-3">
            {customQuizzes.slice(0, 3).map((quiz) => (
              <div key={quiz.id} className="bg-gray-700/60 backdrop-blur-sm rounded-xl p-3 border border-gray-600/30 hover:scale-105 transition-all duration-200">
                <h4 className="font-bold text-white mb-1 text-sm">{quiz.title}</h4>
                <p className="text-gray-300 text-xs mb-2 line-clamp-2">{quiz.description}</p>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-400 bg-gray-600/50 px-2 py-1 rounded-full">
                    {quiz.questions.length}q • {quiz.difficulty}
                  </div>
                  <button
                    onClick={() => handleCustomQuizStart(quiz)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                  >
                    🎮 Play
                  </button>
                </div>
              </div>
            ))}
            {customQuizzes.length > 3 && (
              <div className="text-center text-gray-400 text-xs">
                +{customQuizzes.length - 3} more quizzes
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Quiz Button (when no custom quizzes) */}
      {customQuizzes.length === 0 && (
        <div className="bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-2xl text-center border border-gray-700/50">
          <div className="text-4xl mb-3">✨</div>
          <h3 className="text-lg font-bold text-white mb-2">Create Quiz</h3>
          <p className="text-gray-300 mb-4 text-sm">Design custom quizzes</p>
          <button
            onClick={() => setShowCreationTool(true)}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 shadow-lg"
          >
            🚀 Start Creating
          </button>
        </div>
      )}

      {/* Standard Quiz Options */}
      <div className="bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Standard Quizzes
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
        {/*<div>
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            📡 Source
          </label>
          <select
            value={config.source}
            onChange={(e) => setConfig({ ...config, source: e.target.value, category: null })}
            className="w-full bg-gray-700/80 backdrop-blur-sm text-white rounded-lg px-3 py-2 border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
          >
            <option value="opentdb">OpenTDB</option>
            <option value="triviaapi">The Trivia API</option>
          </select>
        </div>
        */}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              🔢 Questions
            </label>
            <select
              value={config.amount}
              onChange={(e) => setConfig({ ...config, amount: parseInt(e.target.value) })}
              className="w-full bg-gray-700/80 backdrop-blur-sm text-white rounded-lg px-3 py-2 border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              ⚡ Difficulty
            </label>
            <select
              value={config.difficulty}
              onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
              className="w-full bg-gray-700/80 backdrop-blur-sm text-white rounded-lg px-3 py-2 border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            📂 Category
          </label>
          <select
            value={config.category || ''}
            onChange={(e) => setConfig({ ...config, category: e.target.value || null })}
            className="w-full bg-gray-700/80 backdrop-blur-sm text-white rounded-lg px-3 py-2 border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
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
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 text-xs text-center p-3 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 py-3 px-4 rounded-xl font-semibold text-sm shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              Loading...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🚀 Start Quiz
            </span>
          )}
        </button>
      </form>
    </div>

    {/* Quiz Creation Tool Modal */}
    {showCreationTool && (
      <QuizCreationTool
        onSaveQuiz={handleQuizCreated}
        onClose={() => setShowCreationTool(false)}
        theme="dark" // You could pass this as a prop
      />
    )}
  </div>
  );
};

export default QuizSelector;