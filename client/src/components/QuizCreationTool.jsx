import React, { useState } from 'react';

const QuizCreationTool = ({ onSaveQuiz, onClose, theme }) => {
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'medium',
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });

  const [showQuestionForm, setShowQuestionForm] = useState(false);

  const categories = [
    'General Knowledge',
    'Science & Nature',
    'History',
    'Geography',
    'Entertainment',
    'Sports',
    'Literature',
    'Mathematics',
    'Technology',
    'Art & Culture'
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', color: 'text-green-400' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
    { value: 'hard', label: 'Hard', color: 'text-red-400' }
  ];

  const themeClasses = {
    bg: theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
    panelBg: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    textSecondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    input: theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900',
    button: theme === 'dark' 
      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' 
      : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
  };

  const handleQuizInfoChange = (field, value) => {
    setQuizData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuestionChange = (field, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim() || 
        !currentQuestion.options.every(opt => opt.trim()) ||
        currentQuestion.options[currentQuestion.correctAnswer].trim() === '') {
      alert('Please fill in all fields and select a correct answer');
      return;
    }

    const newQuestion = {
      id: Date.now(),
      question: currentQuestion.question.trim(),
      options: currentQuestion.options.map(opt => opt.trim()),
      answer: currentQuestion.options[currentQuestion.correctAnswer].trim(),
      explanation: currentQuestion.explanation.trim(),
      category: quizData.category,
      difficulty: quizData.difficulty
    };

    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    // Reset form
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    });
    setShowQuestionForm(false);
  };

  const removeQuestion = (questionId) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const saveQuiz = () => {
    if (!quizData.title.trim() || !quizData.description.trim() || quizData.questions.length === 0) {
      alert('Please fill in quiz title, description, and add at least one question');
      return;
    }

    const quizToSave = {
      ...quizData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      author: 'You', // Could be enhanced with user authentication
      playCount: 0,
      rating: 0
    };

    // Save to localStorage
    const savedQuizzes = JSON.parse(localStorage.getItem('custom-quizzes') || '[]');
    savedQuizzes.push(quizToSave);
    localStorage.setItem('custom-quizzes', JSON.stringify(savedQuizzes));

    if (onSaveQuiz) {
      onSaveQuiz(quizToSave);
    }

    alert('Quiz saved successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className={`${themeClasses.panelBg} ${themeClasses.text} w-full max-w-4xl rounded-xl p-6 shadow-2xl border ${themeClasses.border} max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-purple-500">✏️</span>
            Create Custom Quiz
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✖
          </button>
        </div>

        <div className="space-y-6">
          {/* Quiz Information */}
          <div className={`${themeClasses.panelBg} rounded-lg p-4 border ${themeClasses.border}`}>
            <h4 className="font-semibold mb-4 text-lg">Quiz Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quiz Title</label>
                <input
                  type="text"
                  value={quizData.title}
                  onChange={(e) => handleQuizInfoChange('title', e.target.value)}
                  className={`w-full ${themeClasses.input} rounded-lg px-3 py-2 border`}
                  placeholder="Enter quiz title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={quizData.category}
                  onChange={(e) => handleQuizInfoChange('category', e.target.value)}
                  className={`w-full ${themeClasses.input} rounded-lg px-3 py-2 border`}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={quizData.description}
                  onChange={(e) => handleQuizInfoChange('description', e.target.value)}
                  className={`w-full ${themeClasses.input} rounded-lg px-3 py-2 border`}
                  rows="3"
                  placeholder="Describe your quiz..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  value={quizData.difficulty}
                  onChange={(e) => handleQuizInfoChange('difficulty', e.target.value)}
                  className={`w-full ${themeClasses.input} rounded-lg px-3 py-2 border`}
                >
                  {difficulties.map(diff => (
                    <option key={diff.value} value={diff.value}>{diff.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className={`${themeClasses.panelBg} rounded-lg p-4 border ${themeClasses.border}`}>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-lg">Questions ({quizData.questions.length})</h4>
              <button
                onClick={() => setShowQuestionForm(true)}
                className={`${themeClasses.button} text-white px-4 py-2 rounded-lg font-medium`}
              >
                Add Question
              </button>
            </div>

            {quizData.questions.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No questions added yet. Click "Add Question" to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {quizData.questions.map((question, index) => (
                  <div key={question.id} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-gray-300">
                            Q{index + 1}:
                          </span>
                          <span className="text-sm text-gray-400">
                            {question.question.length > 60 
                              ? question.question.substring(0, 60) + '...' 
                              : question.question}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Correct: {question.answer}
                        </div>
                      </div>
                      <button
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Question Form Modal */}
          {showQuestionForm && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60">
              <div className={`${themeClasses.panelBg} ${themeClasses.text} w-full max-w-2xl rounded-xl p-6 shadow-2xl border ${themeClasses.border}`}>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xl font-bold">Add Question</h4>
                  <button
                    onClick={() => setShowQuestionForm(false)}
                    className="text-gray-400 hover:text-white text-xl"
                  >
                    ✖
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Question</label>
                    <textarea
                      value={currentQuestion.question}
                      onChange={(e) => handleQuestionChange('question', e.target.value)}
                      className={`w-full ${themeClasses.input} rounded-lg px-3 py-2 border`}
                      rows="3"
                      placeholder="Enter your question..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Answer Options</label>
                    <div className="space-y-2">
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={currentQuestion.correctAnswer === index}
                            onChange={() => handleQuestionChange('correctAnswer', index)}
                            className="text-green-500"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            className={`flex-1 ${themeClasses.input} rounded-lg px-3 py-2 border`}
                            placeholder={`Option ${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Explanation (Optional)</label>
                    <textarea
                      value={currentQuestion.explanation}
                      onChange={(e) => handleQuestionChange('explanation', e.target.value)}
                      className={`w-full ${themeClasses.input} rounded-lg px-3 py-2 border`}
                      rows="2"
                      placeholder="Explain why this is the correct answer..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={addQuestion}
                    className={`flex-1 ${themeClasses.button} text-white py-2 px-4 rounded-lg font-medium`}
                  >
                    Add Question
                  </button>
                  <button
                    onClick={() => setShowQuestionForm(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={saveQuiz}
            disabled={quizData.questions.length === 0}
            className={`flex-1 ${themeClasses.button} text-white py-3 px-6 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
          >
            Save Quiz ({quizData.questions.length} questions)
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizCreationTool;
