import { useState} from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Confetti from "react-confetti";
import QuestionCard from "./components/QuestionCard";
import LoginButton from "./components/LoginButton";
import LogoutButton from "./components/LogoutButton";
import QuizSelector from "./components/QuizSelector";
import LoadingSpinner from "./components/LoadingSpinner";
import apiService from "./services/api";

function App() {
  const { isAuthenticated, isLoading } = useAuth0();
  

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showQuizSelector, setShowQuizSelector] = useState(true);
  const [quizConfig, setQuizConfig] = useState({
    source: 'opentdb',
    amount: 10,
    difficulty: 'easy',
    category: null
  });

  const fetchQuestions = async (config) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.fetchQuestions(config.source, {
        amount: config.amount,
        limit: config.amount,
        difficulty: config.difficulty,
        category: config.category,
        categories: config.category
      });
      
    
      const transformedQuestions = data.questions.map((q) => ({
        question: q.text,
        options: q.options.map(opt => opt.text),
        answer: q.options.find(opt => opt.isCorrect)?.text,
        category: q.category,
        difficulty: q.difficulty,
        source: data.source
      }));
      
      setQuestions(transformedQuestions);
      setShowQuizSelector(false);
      resetQuiz();
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizStart = (config) => {
    setQuizConfig(config);
    fetchQuestions(config);
  };

  const handleAnswer = (option) => {
    if (showFeedback) return;

    setSelectedAnswer(option);
    setShowFeedback(true);

    if (option === questions[currentQuestion].answer) {
      setScore(score + 1);
    }
  };

  const goToNext = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setIsFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsFinished(false);
  };

  const startNewQuiz = () => {
    setShowQuizSelector(true);
    setQuestions([]);
    resetQuiz();
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsFinished(false);
  };

  const calculateProgress = () => {
    if (isFinished) return 100;
    const baseProgress = (currentQuestion / questions.length) * 100;
    const questionProgress = selectedAnswer ? (1 / questions.length) * 100 : 0;
    return baseProgress + questionProgress;
  };

  const percentage = questions.length > 0 ? (score / questions.length) * 100 : 0;
  const showConfetti = isFinished && percentage > 50;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-purple-600 mb-4">React Quiz</h1>
        <p className="text-gray-400 mb-6">Please log in to access the quiz.</p>
        <LoginButton />
      </div>
    );
  }

  if (showQuizSelector) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-2">React Quiz</h1>
          <p className="text-gray-400 mb-4">Choose your quiz settings</p>
          <LogoutButton />
        </div>
        
        <QuizSelector 
          onStart={handleQuizStart}
          loading={loading}
          error={error}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      {showConfetti && <Confetti />}
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-purple-600 mb-2">React Quiz</h1>
        <p className="text-gray-400 mb-2">
          {quizConfig.source === 'opentdb' ? 'OpenTDB' : 'Trivia API'} • {quizConfig.difficulty} • {questions.length} questions
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={startNewQuiz}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            New Quiz
          </button>
          <LogoutButton />
        </div>
      </div>

      <div className="w-full max-w-xl mb-6">
        <div className="bg-gray-700 h-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 duration-500 ease-out transition-all"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={() => setShowQuizSelector(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 py-3 px-6 rounded-lg font-medium"
          >
            Try Again
          </button>
        </div>
      ) : !isFinished ? (
        <>
          <QuestionCard
            showFeedback={showFeedback}
            onAnswer={handleAnswer}
            data={questions[currentQuestion]}
            current={currentQuestion}
            total={questions.length}
            selected={selectedAnswer}
          />
          <div className="mt-6 min-h-[60px]">
            {showFeedback && (
              <button
                className="bg-gradient-to-r from-indigo-600 to-purple-600 py-3 px-6 rounded-lg font-medium shadow-lg cursor-pointer"
                onClick={goToNext}
              >
                {currentQuestion + 1 < questions.length
                  ? "Continue"
                  : "See Results"}
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Quiz Completed!</h2>
          <p className="text-xl mb-6">
            You scored <span className="text-green-400 font-bold">{score}</span> out of{" "}
            <span className="font-bold">{questions.length}</span> ({Math.round(percentage)}%)
          </p>
          <div className="flex gap-4 justify-center">
            <button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 py-3 px-6 rounded-lg font-medium shadow-lg cursor-pointer"
              onClick={restartQuiz}
            >
              Retry Same Quiz
            </button>
            <button
              className="bg-gradient-to-r from-gray-600 to-gray-700 py-3 px-6 rounded-lg font-medium shadow-lg cursor-pointer"
              onClick={startNewQuiz}
            >
              New Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;