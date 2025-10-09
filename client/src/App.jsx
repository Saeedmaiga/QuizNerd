import { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Confetti from "react-confetti";

import QuestionCard from "./components/QuestionCard";
import StartScreen from "./components/StartScreen.jsx"; // from SimonBranch
import Timer from "./components/Timer";
import CelebrationAnimation from "./components/CelebrationAnimation";                  // from SimonBranch

import LoginButton from "./components/LoginButton";      // from main
import LogoutButton from "./components/LogoutButton";    // from main
import QuizSelector from "./components/QuizSelector";    // from main
import LoadingSpinner from "./components/LoadingSpinner";// from main
import ThemeToggle from "./components/ThemeToggle";       // NEW
import SoundControls from "./components/SoundControls";   // NEW
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
  
  // Hint system
  const [remainingHints, setRemainingHints] = useState(3);
  const [currentHint, setCurrentHint] = useState("");
  const [hintUsed, setHintUsed] = useState(false);

  // Celebration Animation state
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState('');

  // Theme & Sound state
  const [theme, setTheme] = useState('dark');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const [stopTimer, setStopTimer] = useState(false);

  // Animation state
  const [questionTransition, setQuestionTransition] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('quiz-theme') || 'dark';
    const savedSound = localStorage.getItem('quiz-sound') === 'true' || true;
    const savedMusic = localStorage.getItem('quiz-music') === 'true' || false;
    
    setTheme(savedTheme);
    setSoundEnabled(savedSound);
    setMusicEnabled(savedMusic);
    
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    document.documentElement.classList.toggle('light', savedTheme === 'light');
  }, []);

  // Update theme class when theme changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('quiz-theme', theme);
  }, [theme]);

  // Save sound preferences
  useEffect(() => {
    localStorage.setItem('quiz-sound', soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('quiz-music', musicEnabled.toString());
  }, [musicEnabled]);

  // Sound effects setup
  const soundMap = {
  correct: new Audio('correct.mp3'),
  incorrect: new Audio('wrong.mp3'),
  click: new Audio('button-click.mp3'),
  hint: new Audio('hint.mp3'),
  milestone: new Audio('milestone.mp3'),
  complete: new Audio('complete.mp3')
};

// Sound effects playback
const playSound = useCallback((soundName) => {
  if (!soundEnabled) return;

  const audio = soundMap[soundName];
  if (audio) {
    audio.currentTime = 0; // restart sound from beginning
    audio.play().catch((e) => console.log('Audio play failed:', e));
  }
}, [soundEnabled]);
/*
    
    try {
      const audio = soundMap[soundName];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio play failed:', e));
      }
    } catch (error) {
      console.error('Sound error:', error);
    }
  }, [soundEnabled]);
  */

  // Background music setup
  useEffect(() => {
    if (musicEnabled && !backgroundMusic) {
      const music = new Audio('/background-music.mp3');
      music.loop = true;
      music.volume = 0.3;
      setBackgroundMusic(music);
      
      music.play().catch(e => console.log('Background music failed:', e));
    } else if (!musicEnabled && backgroundMusic) {
      backgroundMusic.pause();
      setBackgroundMusic(null);
    }
  }, [musicEnabled, backgroundMusic]);

  const getThemeClasses = () => {
    return {
      bg: theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
      text: theme === 'dark' ? 'text-white' : 'text-gray-900',
      panelBg: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
      border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
      accent: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
      button: theme === 'dark' 
        ? 'bg-gradient-to-r from-indigo-600 to-purple-600' 
        : 'bg-gradient-to-r from-indigo-500 to-purple-500'
    };
  };

  const themeClasses = getThemeClasses();

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
    setRemainingHints(3);
    setCurrentHint("");
    setHintUsed(false);
    setShowCelebration(false);
    setCelebrationType("");
  };

  const startNewQuiz = () => {
    playSound('click');
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
    playSound('click');
    setQuizConfig(config);
    fetchQuestions(config);
  };

  const triggerCelebration = (streak, currentScore, totalQuestions) => {
    const percentage = (currentScore / totalQuestions) * 100;
    let celebrationType = '';
    
    if (streak === 5) {
      celebrationType = 'streak-5';
    } else if (streak === 10) {
      celebrationType = 'streak-10';
    } else if (streak === 15) {
      celebrationType = 'streak-15';
    } else if (percentage === 100 && currentQuestion === totalQuestions - 1) {
      celebrationType = 'perfect';
    }

    if (celebrationType) {
      setCelebrationType(celebrationType);
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        setCelebrationType("");
      }, 3000);
    }
  };

  const handleAnswer = (option) => {
    if (showFeedback) return;

    playSound('click');
    setSelectedAnswer(option);
    setShowFeedback(true);

    if (option === questions[currentQuestion].answer) {
      playSound('correct');
      setScore((s) => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);

    
      triggerCelebration(newStreak, score + 1, questions.length);

      // bonus 50/50 every 10 streak, bonus hint every 5 streak
      if (newStreak % 10 === 0) {
        setRemaining5050((r) => r + 1);
        playSound('milestone');
      }
      if (newStreak % 5 === 0) {
        setRemainingHints((r) => r + 1);
      }
    } else {
      playSound('incorrect');
      setStreak(0);
    }
  };
  const handleAnswerClick = (option) => {
    setStopTimer(true); // stop the ticking sound immediately
    handleAnswer(option); // call your existing answer logic
  };

  const use5050 = () => {
    if (remaining5050 <= 0) return;

    playSound('click');
    const allOptions = questions[currentQuestion].options;
    const correct = questions[currentQuestion].answer;

    const wrongOptions = allOptions.filter((opt) => opt !== correct);
    const randomWrong =
      wrongOptions[Math.floor(Math.random() * wrongOptions.length)];

    setVisibleOptions([correct, randomWrong].sort(() => Math.random() - 0.5));
    setRemaining5050((r) => r - 1);
  };

  const useHint = () => {
    if (remainingHints <= 0 || hintUsed || selectedAnswer || showFeedback) return;

    playSound('hint');
    const question = questions[currentQuestion];
    const correctAnswer = question.answer;
    
    // Generate different types of hints based on the question content
    let hint = "";
    
    if (question.category === "Science" || question.question.toLowerCase().includes("chemical")) {
      // Science hints
      if (correctAnswer.toLowerCase().includes("oxygen")) {
        hint = "💨 This element is essential for breathing...";
      } else if (correctAnswer.toLowerCase().includes("carbon")) {
        hint = "🌍 This element is the basis of all organic life...";
      } else if (correctAnswer.toLowerCase().includes("water")) {
        hint = "💧 The boiling point is 100°C at sea level...";
      } else {
        hint = "🔬 Think about what scientists study...";
      }
    } else if (question.category === "Geography" || question.question.toLowerCase().includes("capital") || question.question.toLowerCase().includes("country")) {
      // Geography hints
      if (correctAnswer.toLowerCase().includes("paris")) {
        hint = "🗼 The City of Light, famous for art and romance...";
      } else if (correctAnswer.toLowerCase().includes("brazil")) {
        hint = "⚽ This South American country speaks Portuguese...";
      } else if (correctAnswer.toLowerCase().includes("pacific")) {
        hint = "🌊 The largest body of water on Earth...";
      } else {
        hint = "🌍 Consider the location mentioned in the question...";
      }
    } else if (question.category === "History" || question.question.toLowerCase().includes("year")) {
            if (correctAnswer.toLowerCase().includes("1912")) {
        hint = "🚢 This year marked a famous maritime disaster...";
      } else {
        hint = "📚 Think about what happened in that time period...";
      }
    } else if (question.category === "Entertainment" || question.question.toLowerCase().includes("wrote") || question.question.toLowerCase().includes("painted")) {
      // Literature/Art hints
      if (correctAnswer.toLowerCase().includes("shakespeare")) {
        hint = "📜 The Bard of Avon...";
      } else if (correctAnswer.toLowerCase().includes("da vinci")) {
        hint = "🎨 Renaissance master, inventor, artist...";
      } else {
        hint = "🎭 Think about famous creators...";
      }
    } else if (question.question.toLowerCase().includes("einstein")) {
      // Physics hints
      hint = "⚛️ Think about E=mc²...";
    } else if (question.question.toLowerCase().includes("mountain")) {
      hint = "🏔️ The tallest peak on our planet...";
    } else if (question.question.toLowerCase().includes("animal")) {
      if (correctAnswer.toLowerCase().includes("cheetah")) {
        hint = "🐆 The fastest runner in the animal kingdom...";
      } else {
        hint = "🦁 Think about animal characteristics...";
      }
    } else if (question.question.toLowerCase().includes("language") || question.question.toLowerCase().includes("css")) {
      hint = "💻 Used for styling web pages, not programming logic...";
    } else {
      if (correctAnswer.length <= 3) {
        hint = "📝 The answer is quite short...";
      } else if (correctAnswer.length >= 10) {
        hint = "📖 The answer is longer, think about famous names...";
      } else {
        hint = "💡 Consider what you learned in school about this topic...";
      }
    }

    setCurrentHint(hint);
    setHintUsed(true);
    setRemainingHints((r) => r - 1);
  };

  const goToNext = () => {
    playSound('click');
    if (currentQuestion + 1 < questions.length) {
      // Animate transition
      setQuestionTransition(true);
      
      setTimeout(() => {
        setCurrentQuestion((i) => i + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setVisibleOptions([]);
        setCurrentHint("");
        setHintUsed(false);
        setQuestionTransition(false);
      }, 300);
    } else {
      setIsFinished(true);
      playSound('complete');
    }
  };

  const restartQuiz = () => {
    playSound('click');
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
    return (
      <div className={`min-h-screen ${themeClasses.bg}`}>
        <StartScreen 
          onStart={() => {
            setQuizStarted(true);
            playSound('click');
          }} 
        />
        <ThemeToggle theme={theme} setTheme={setTheme} />
        <SoundControls 
          soundEnabled={soundEnabled} 
          musicEnabled={musicEnabled}
          setSoundEnabled={setSoundEnabled}
          setMusicEnabled={setMusicEnabled}
          theme={theme}
        />
      </div>
    );
  }

  // Quiz configuration screen
  if (showQuizSelector) {
    return (
      <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} flex flex-col items-center justify-center p-4`}>
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold ${themeClasses.accent} mb-2`}>React Quiz</h1>
          <p className={`${themeClasses.accent} mb-4`}>Choose your quiz settings</p>
          <LogoutButton />
        </div>

        <QuizSelector onStart={handleQuizStart} loading={loading} error={error} />
        
        <ThemeToggle theme={theme} setTheme={setTheme} />
        <SoundControls 
          soundEnabled={soundEnabled} 
          musicEnabled={musicEnabled}
          setSoundEnabled={setSoundEnabled}
          setMusicEnabled={setMusicEnabled}
          theme={theme}
        />
      </div>
    );
  }

  // ----- MAIN QUIZ UI -----
  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} flex flex-col items-center justify-center p-4 relative`}>
      {showConfetti && <Confetti />}
      
      {/* Celebration Animation */}
      {showCelebration && (
        <CelebrationAnimation 
          type={celebrationType} 
          onComplete={() => setShowCelebration(false)}
        />
      )}

      {/* Theme and Sound Controls */}
      <ThemeToggle theme={theme} setTheme={setTheme} />
      <SoundControls 
        soundEnabled={soundEnabled} 
        musicEnabled={musicEnabled}
        setSoundEnabled={setSoundEnabled}
        setMusicEnabled={setMusicEnabled}
        theme={theme}
      />

      <div className="text-center mb-8">
        <h1 className={`text-4xl font-bold ${themeClasses.accent} mb-2`}>React Quiz</h1>
        <p className={`${themeClasses.text} mb-2`}>
          {quizConfig.source === "opentdb"
            ? "OpenTDB"
            : quizConfig.source === "local"
            ? "Local Questions"
            : "Trivia API"}{" "}
          • {quizConfig.difficulty} • {questions.length} questions
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              playSound('click');
              startNewQuiz();
            }}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            New Quiz
          </button>
          <LogoutButton />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xl mb-6">
        <div className={`${themeClasses.panelBg} h-3 rounded-full overflow-hidden`}>
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
              duration={20}
              onTimeUp={() => {
              setShowFeedback(true);
              setStreak(0);
              playSound('incorrect');
            }}
            stopSignal={stopTimer}
            />
          )}

          <div className={`relative w-full max-w-4xl flex justify-center transition-all duration-300 ${questionTransition ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
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
              theme={theme}
            />
          </div>

          <div className="mt-6 min-h-[60px]">
            {showFeedback && (
              <button
                className={`${themeClasses.button} py-3 px-6 rounded-lg font-medium shadow-lg cursor-pointer transition-transform hover:scale-105`}
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

      {/* Hint Display */}
      {currentHint && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-lg max-w-md animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <p className="font-medium">{currentHint}</p>
          </div>
        </div>
      )}

      {/* Buttons fixed bottom-right */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-4">
        <button
          className={`bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded-lg shadow-md font-medium ${
            remainingHints <= 0 || hintUsed || selectedAnswer || showFeedback ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => {
            playSound('click');
            useHint;
          }}
          disabled={remainingHints <= 0 || hintUsed || selectedAnswer || showFeedback}
        >
          💡 Hint ({remainingHints})
        </button>
        <button
          className={`bg-green-500 hover:bg-green-600 py-2 px-4 rounded-lg shadow-md font-medium ${
            remaining5050 <= 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => {
            playSound('click');
            use5050();
          }}
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