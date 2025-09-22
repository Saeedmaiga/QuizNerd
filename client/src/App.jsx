import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Confetti from "react-confetti";

import QuestionCard from "./components/QuestionCard";
import StartScreen from "./components/StartScreen.jsx"; // from SimonBranch
import Timer from "./components/Timer";                  // from SimonBranch

import LoginButton from "./components/LoginButton";      // from main
import LogoutButton from "./components/LogoutButton";    // from main
import QuizSelector from "./components/QuizSelector";    // from main
import LoadingSpinner from "./components/LoadingSpinner";// from main
import apiService from "./services/api";                 // from main

// local questions support (SimonBranch)
import { questions as localQuestions } from "./data/questions";

function App() {
  const { isAuthenticated, isLoading } = useAuth0();

  // Questions & game state
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Extra features referenced in your snippet
  const [streak, setStreak] = useState(0);
  const [remaining5050, setRemaining5050] = useState(1);
  const [visibleOptions, setVisibleOptions] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);

  // Fetch/UI state (from main)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showQuizSelector, setShowQuizSelector] = useState(true);
  const [quizConfig, setQuizConfig] = useState({
    // supported sources: 'opentdb' | 'trivia' | 'local'
    source: "opentdb",
    amount: 10,
    difficulty: "easy",
    category: null,
  });

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsFinished(false);
    setStreak(0);
    setRemaining5050(1);
    setVisibleOptions([]);
  };

  const startNewQuiz = () => {
    setShowQuizSelector(true);
    setQuestions([]);
    resetQuiz();
  };

  const fetchQuestions = async (config) => {
    setLoading(true);
    setError(null);

    try {
      // Support local questions as a source
      if (config.source === "local") {
        // Expect localQuestions in the same shape the app uses
        // If your local data has a different shape, transform here.
        const transformed = localQuestions.map((q) => ({
          question: q.question ?? q.text,
          options: q.options?.map((opt) => (typeof opt === "string" ? opt : opt.text)) ?? [],
          answer:
            q.answer ??
            q.options?.find((opt) => opt.isCorrect)?.text ??
            q.correct, // fallback keys if your local shape differs
          category: q.category ?? "Local",
          difficulty: q.difficulty ?? "mixed",
          source: "local",
        }));

        setQuestions(transformed);
        setShowQuizSelector(false);
        resetQuiz();
        return;
      }

      // Remote API sources (from main)
      const data = await apiService.fetchQuestions(config.source, {
        amount: config.amount,
        limit: config.amount,
        difficulty: config.difficulty,
        category: config.category,
        categories: config.category,
      });

      const transformedQuestions = data.questions.map((q) => ({
        question: q.text,
        options: q.options.map((opt) => opt.text),
        answer: q.options.find((opt) => opt.isCorrect)?.text,
        category: q.category,
        difficulty: q.difficulty,
        source: data.source,
      }));

      setQuestions(transformedQuestions);
      setShowQuizSelector(false);
      resetQuiz();
    } catch (err) {
      setError(err.message || "Failed to fetch questions");
      console.error("Failed to fetch questions:", err);
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
      setScore((s) => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);

      // bonus 50/50 every 10 streak
      if (newStreak % 10 === 0) {
        setRemaining5050((r) => r + 1);
      }
    } else {
      setStreak(0);
    }
  };

  const use5050 = () => {
    if (remaining5050 <= 0) return;

    const allOptions = questions[currentQuestion].options;
    const correct = questions[currentQuestion].answer;

    const wrongOptions = allOptions.filter((opt) => opt !== correct);
    const randomWrong =
      wrongOptions[Math.floor(Math.random() * wrongOptions.length)];

    setVisibleOptions([correct, randomWrong].sort(() => Math.random() - 0.5));
    setRemaining5050((r) => r - 1);
  };

  const goToNext = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((i) => i + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setVisibleOptions([]);
    } else {
      setIsFinished(true);
    }
  };

  const restartQuiz = () => {
    resetQuiz();
    // keep the same questions set; if you want a fresh set, call startNewQuiz()
  };

  const calculateProgress = () => {
    if (isFinished) return 100;
    if (questions.length === 0) return 0;
    const base = (currentQuestion / questions.length) * 100;
    const perQ = selectedAnswer ? (1 / questions.length) * 100 : 0;
    return base + perQ;
  };

  const percentage =
    questions.length > 0 ? (score / questions.length) * 100 : 0;
  const showConfetti = isFinished && percentage > 50;

  // ----- RENDER GUARDS -----

  // Auth0 global loading
  if (isLoading) return <LoadingSpinner />;

  // Require login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-purple-600 mb-4">React Quiz</h1>
        <p className="text-gray-400 mb-6">Please log in to access the quiz.</p>
        <LoginButton />
      </div>
    );
  }

  // Start screen (from SimonBranch) before showing the selector
  if (!quizStarted) {
    return <StartScreen onStart={() => setQuizStarted(true)} />;
  }

  // Quiz configuration screen
  if (showQuizSelector) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-2">React Quiz</h1>
          <p className="text-gray-400 mb-4">Choose your quiz settings</p>
          <LogoutButton />
        </div>

        <QuizSelector onStart={handleQuizStart} loading={loading} error={error} />
      </div>
    );
  }

  // ----- MAIN QUIZ UI -----
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      {showConfetti && <Confetti />}

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-purple-600 mb-2">React Quiz</h1>
        <p className="text-gray-400 mb-2">
          {quizConfig.source === "opentdb"
            ? "OpenTDB"
            : quizConfig.source === "local"
            ? "Local Questions"
            : "Trivia API"}{" "}
          • {quizConfig.difficulty} • {questions.length} questions
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

      {/* Progress Bar */}
      <div className="w-full max-w-xl mb-6">
        <div className="bg-gray-700 h-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 duration-500 ease-out transition-all"
            style={{ width: `${calculateProgress()}%` }}
          />
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
          {/* Timer (SimonBranch) — only count down while waiting for an answer */}
          {!showFeedback && (
            <Timer
              duration={10}
              onTimeUp={() => {
                setShowFeedback(true);
                setStreak(0);
              }}
            />
          )}

          <div className="relative w-full max-w-4xl flex justify-center">
            <QuestionCard
              showFeedback={showFeedback}
              onAnswer={handleAnswer}
              data={questions[currentQuestion]}
              current={currentQuestion}
              total={questions.length}
              selected={selectedAnswer}
              options={
                visibleOptions.length
                  ? visibleOptions
                  : questions[currentQuestion].options
              }
            />
          </div>

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
            You scored{" "}
            <span className="text-green-400 font-bold">{score}</span> out of{" "}
            <span className="font-bold">{questions.length}</span> (
            {Math.round(percentage)}%)
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

      {/* Buttons fixed bottom-right */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded-lg shadow-md font-medium"
          onClick={() => alert("This is a hint! 💡")}
        >
          💡 Hint
        </button>
        <button
          className={`bg-green-500 hover:bg-green-600 py-2 px-4 rounded-lg shadow-md font-medium ${
            remaining5050 <= 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={use5050}
          disabled={remaining5050 <= 0}
        >
          🎯 50/50 ({remaining5050})
        </button>
      </div>

      {/* Streak bar fixed bottom-left */}
      <div className="fixed bottom-4 left-4 bg-gradient-to-r from-yellow-400 to-red-500 text-black font-bold py-3 px-8 rounded-lg shadow-lg">
        🔥 Streak: {streak}
      </div>
    </div>
  );
}

export default App;