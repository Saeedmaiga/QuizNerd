import { useState } from "react";
import Confetti from "react-confetti";
import QuestionCard from "./components/QuestionCard";
import StartScreen from "./components/StartScreen.jsx"; // import the start screen
import { questions } from "./data/questions";
import Timer from "./components/Timer";

function App() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [streak, setStreak] = useState(0);
  const [remaining5050, setRemaining5050] = useState(1);
  const [visibleOptions, setVisibleOptions] = useState([]);

  const handleAnswer = (option) => {
    if (showFeedback) return;

    setSelectedAnswer(option);
    setShowFeedback(true);

    if (option === questions[currentQuestion].answer) {
      setScore(score + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);

      // give extra 50/50 if streak reaches 10
      if (newStreak % 10 === 0) {
        setRemaining5050(remaining5050 + 1);
      }
    } else {
      setStreak(0);
    }
  };

  const use5050 = () => {
    if (remaining5050 <= 0) return; // no 50/50 left

    const allOptions = questions[currentQuestion].options;
    const correct = questions[currentQuestion].answer;

    // Filter out the correct answer
    const wrongOptions = allOptions.filter((opt) => opt !== correct);

    // Pick one random wrong option
    const randomWrong = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];

    // Show only correct + random wrong
    setVisibleOptions([correct, randomWrong].sort(() => Math.random() - 0.5));
    setRemaining5050(remaining5050 - 1);
  };

  const goToNext = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setVisibleOptions([]); // reset for next question
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
    setStreak(0);
    setRemaining5050(1);
    setVisibleOptions([]);
    setQuizStarted(false);
  };

  const calculateProgress = () => {
    if (isFinished) return 100;
    const baseProgress = (currentQuestion / questions.length) * 100;
    const questionProgress = selectedAnswer ? (1 / questions.length) * 100 : 0;
    return baseProgress + questionProgress;
  };

  const percentage = (score / questions.length) * 100;
  const showConfetti = isFinished && percentage > 50;

  // If quiz hasn't started, show start screen
  if (!quizStarted) {
    return <StartScreen onStart={() => setQuizStarted(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      {showConfetti && <Confetti />}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-purple-600 mb-2">Quiz Nerd</h1>
        <p className="text-gray-400">Test your knowledge</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xl mb-6">
        <div className="bg-gray-700 h-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 duration-500 ease-out transition-all"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
      </div>

      {!isFinished ? (
        <>
        {/* Timer goes here */}
        {!showFeedback && (
          <Timer
            duration={10}
            onTimeUp={() => {
            setShowFeedback(true);
           setStreak(0); // reset streak if time runs out
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
            You scored <span>{score}</span> out of{" "}
            <span className="font-bold">{questions.length}</span> ({Math.round(percentage)}%)
          </p>
          <button
            className="bg-gradient-to-r from-indigo-600 to-purple-600 py-3 px-6 rounded-lg font-medium shadow-lg cursor-pointer"
            onClick={restartQuiz}
          >
            Play Again
          </button>
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
