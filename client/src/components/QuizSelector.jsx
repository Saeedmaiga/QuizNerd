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
    <div className="space-y-6">
      {/* Custom Quizzes Section */}
      {customQuizzes.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Your Custom Quizzes</h3>
            <button
              onClick={() => setShowCreationTool(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm font-medium"
            >
              + Create New
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customQuizzes.map((quiz) => (
              <div key={quiz.id} className="bg-gray-700 rounded-lg p-3">
                <h4 className="font-semibold text-white mb-1">{quiz.title}</h4>
                <p className="text-gray-300 text-sm mb-2">{quiz.description}</p>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-400">
                    {quiz.questions.length} questions • {quiz.difficulty}
                  </div>
                  <button
                    onClick={() => handleCustomQuizStart(quiz)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Play
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Quiz Button (when no custom quizzes) */}
      {customQuizzes.length === 0 && (
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Create Your Own Quiz</h3>
          <p className="text-gray-300 mb-4">Design custom quizzes with your own questions</p>
          <button
            onClick={() => setShowCreationTool(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Start Creating
          </button>
        </div>
      )}

      {/* Standard Quiz Options */}
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-md">
        <h3 className="text-lg font-semibold text-white mb-4">Standard Quizzes</h3>
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