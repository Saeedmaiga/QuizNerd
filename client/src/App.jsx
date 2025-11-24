import { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Confetti from "react-confetti";

import QuestionCard from "./components/QuestionCard";
import StartScreen from "./components/StartScreen.jsx"; // from SimonBranch
import Timer from "./components/Timer";
import CelebrationAnimation from "./components/CelebrationAnimation";                  // from SimonBranch
import ProfilePage from "./components/ProfilePage";  // NEW

import LoginButton from "./components/LoginButton";      // from main
import LogoutButton from "./components/LogoutButton";    // from main
import QuizSelector from "./components/QuizSelector";    // from main
import LoadingSpinner from "./components/LoadingSpinner";// from main
import ThemeToggle from "./components/ThemeToggle";       // NEW
import SoundControls from "./components/SoundControls";   // NEW
import StatsModal from "./components/StatsModal";         // NEW
import ReviewModal from "./components/ReviewModal";       // NEW
import AchievementSystem from "./components/AchievementSystem"; // NEW
import AchievementModal from "./components/AchievementModal"; // NEW
import DailyChallenge from "./components/DailyChallenge"; // NEW
import PowerUpsSystem from "./components/PowerUpsSystem"; // NEW
import XPLevelSystem from "./components/XPLevelSystem"; // NEW
import LearningMode from "./components/LearningMode"; // NEW
import apiService from "./services/api";                 // from main

//imports for multiplayer use
import MultiplayerLobby from "./components/MultiplayerLobby";
import MultiplayerSession from "./components/MultiplayerSession";


// local questions support (SimonBranch)
import { questions as localQuestions } from "./data/questions";

function App() {
  const { isAuthenticated, isLoading, user } = useAuth0();

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

  const [userAnswers, setUserAnswers] = useState([]);

  
  const [showStats, setShowStats] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showLearningMode, setShowLearningMode] = useState(false);
  const [learningModeData, setLearningModeData] = useState(null);

  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);

  // Power-ups
  const [doublePointsActive, setDoublePointsActive] = useState(false);
  const [extraTimeUsed, setExtraTimeUsed] = useState(false);
  const [currentTimerDuration, setCurrentTimerDuration] = useState(10);

  // Daily Challenge
  const [dailyChallengeConfig, setDailyChallengeConfig] = useState(null);
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);

  // Profile
  const [showProfile, setShowProfile] = useState(false);

  // Multiplayer state
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [multiplayerSessionCode, setMultiplayerSessionCode] = useState(null);
  const [multiplayerPlayers, setMultiplayerPlayers] = useState([]);
  const [multiplayerLeaderboard, setMultiplayerLeaderboard] = useState([]);
  const [currentUsername, setCurrentUsername] = useState('');

  // Fetch leaderboard during multiplayer session
  useEffect(() => {
    if (isMultiplayer && multiplayerSessionCode && !isFinished) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:4000/api/multiplayer/session/${multiplayerSessionCode}/leaderboard`);
          if (response.ok) {
            const data = await response.json();
            setMultiplayerLeaderboard(data.leaderboard);
          }
        } catch (error) {
          console.error('Error fetching leaderboard:', error);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isMultiplayer, multiplayerSessionCode, isFinished, currentQuestion]);

  // Handle starting multiplayer session
  const handleStartMultiplayer = async (sessionCode, config, userId, username, serverQuestions = null) => {
    try {
      setLoading(true);
      setCurrentUsername(username);
      
      let transformedQuestions = [];
      
      // Check if questions were provided from server (for joined players)
      if (serverQuestions && serverQuestions.length > 0) {
        // Use questions from server (they should already be in the correct format)
        transformedQuestions = serverQuestions.map((q) => ({
          question: q.question || q.text || '',
          options: Array.isArray(q.options) ? q.options : [],
          answer: q.answer || (Array.isArray(q.options) ? q.options.find((opt) => opt.isCorrect)?.text : ''),
          category: q.category || '',
          difficulty: q.difficulty || 'medium',
          source: q.source || config.source || 'opentdb',
        }));
      } else {
        // Host: Fetch questions and send to server
        const data = await apiService.fetchQuestions(config.source || 'opentdb', {
          amount: config.amount || 10,
          limit: config.amount || 10,
          difficulty: config.difficulty || 'medium',
          category: config.category,
          categories: config.category,
        });

        transformedQuestions = data.questions.map((q) => ({
          question: q.text,
          options: q.options.map((opt) => opt.text),
          answer: q.options.find((opt) => opt.isCorrect)?.text,
          category: q.category,
          difficulty: q.difficulty,
          source: data.source,
        }));

        // Host sends questions to server to start the session
        try {
          const startResponse = await fetch(`http://localhost:4000/api/multiplayer/start/${sessionCode}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userId,
              questions: transformedQuestions,
            }),
          });

          if (!startResponse.ok) {
            const errorData = await startResponse.json();
            throw new Error(errorData.error || 'Failed to start session on server');
          }
        } catch (startErr) {
          console.error('Failed to start session on server:', startErr);
          throw startErr;
        }
      }

      setQuestions(transformedQuestions);
      setIsMultiplayer(true);
      setMultiplayerSessionCode(sessionCode);
      setShowProfile(false);
      setShowQuizSelector(false);
      resetQuiz();
    } catch (err) {
      setError(err.message || "Failed to start multiplayer session");
      console.error("Failed to start multiplayer session:", err);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcuts: 1-4 select option, H=hint, F=50/50, N=next
  useEffect(() => {
    const onKey = (e) => {
      if (isFinished) return;
      if (!questions[currentQuestion]) return;

      const opts = visibleOptions.length ? visibleOptions : questions[currentQuestion].options;

      // Numbers 1-4
      if (!showFeedback) {
        if (e.key >= '1' && e.key <= '4') {
          const idx = Number(e.key) - 1;
          if (opts[idx]) {
            e.preventDefault();
            handleAnswer(opts[idx]);
          }
        }
      }

      // Hint
      if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        useHint();
      }
      // 50/50
      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        use5050();
      }
      // Next
      if (e.key.toLowerCase() === 'n' && showFeedback) {
        e.preventDefault();
        goToNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [questions, currentQuestion, visibleOptions, showFeedback, isFinished]);

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
      bg: theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50',
      text: theme === 'dark' ? 'text-white' : 'text-gray-900',
      panelBg: theme === 'dark' 
        ? 'bg-gray-800/80 backdrop-blur-xl border border-gray-700/50' 
        : 'bg-white/80 backdrop-blur-xl border border-gray-200/50',
      border: theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50',
      accent: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
      button: theme === 'dark' 
        ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500' 
        : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400',
      card: theme === 'dark'
        ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/30 shadow-2xl'
        : 'bg-white/60 backdrop-blur-xl border border-gray-200/30 shadow-2xl',
      glass: theme === 'dark'
        ? 'bg-gray-800/20 backdrop-blur-md border border-gray-700/20'
        : 'bg-white/20 backdrop-blur-md border border-gray-200/20'
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
    setUserAnswers([]);
    setShowStats(false);
    setShowReview(false);
    setShowAchievements(false);
    setShowLearningMode(false);
    setLearningModeData(null);
    setDoublePointsActive(false);
    setExtraTimeUsed(false);
    setCurrentTimerDuration(25);
    setIsDailyChallenge(false);
    setDailyChallengeConfig(null);
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

      // Support custom quizzes
      if (config.source === "custom" && config.customQuiz) {
        const transformed = config.customQuiz.questions.map((q) => ({
          question: q.question,
          options: q.options,
          answer: q.answer,
          category: q.category,
          difficulty: q.difficulty,
          source: "custom",
          explanation: q.explanation
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

  const handleAnswer = async (option) => {
    if (showFeedback) return;

    playSound('click');
    setSelectedAnswer(option);
    setShowFeedback(true);

    // Record answer for review
    setUserAnswers((prev) => [
      ...prev,
      {
        index: currentQuestion,
        question: questions[currentQuestion]?.question,
        selected: option,
        correct: questions[currentQuestion]?.answer,
        options:
          visibleOptions.length
            ? visibleOptions
            : questions[currentQuestion]?.options,
      },
    ]);

    const isCorrect = option === questions[currentQuestion].answer;

    // Submit answer to multiplayer session if in multiplayer mode
    if (isMultiplayer && multiplayerSessionCode && user?.sub) {
      try {
        // Submit to API
        await fetch(`http://localhost:4000/api/multiplayer/session/${multiplayerSessionCode}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.sub,
            questionIndex: currentQuestion,
            answer: option,
            isCorrect,
          }),
        });
      } catch (error) {
        console.error('Failed to submit multiplayer answer:', error);
      }
    }

    if (isCorrect) {
      playSound('correct');
      const pointsEarned = doublePointsActive ? 2 : 1;
      setScore((s) => s + pointsEarned);
      const newStreak = streak + 1;
      setStreak(newStreak);

      // Reset double points after use
      if (doublePointsActive) {
        setDoublePointsActive(false);
      }
    
      triggerCelebration(newStreak, score + pointsEarned, questions.length);

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
      
      // Show learning mode for wrong answers
      setTimeout(() => {
        handleLearningMode(questions[currentQuestion], option, questions[currentQuestion].answer);
      }, 1000);
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

      // Persist attempt stats
      try {
        const attemptsRaw = localStorage.getItem('quiz-stats') || '[]';
        const attempts = JSON.parse(attemptsRaw);
        const attempt = {
          id: Date.now(),
          date: new Date().toISOString(),
          score,
          total: questions.length,
          percentage: Math.round((score / questions.length) * 100),
          difficulty: quizConfig.difficulty,
          source: quizConfig.source,
          category: quizConfig.category,
        };
        localStorage.setItem('quiz-stats', JSON.stringify([attempt, ...attempts].slice(0, 100)));
      } catch (e) {
        console.error('Failed to save stats', e);
      }
    }
  };

  const restartQuiz = () => {
    playSound('click');
    resetQuiz();
    
  };

  const calculateProgress = () => {
    if (isFinished) return 100;
    if (questions.length === 0) return 0;
    const base = (currentQuestion / questions.length) * 100;
    const perQ = selectedAnswer ? (1 / questions.length) * 100 : 0;
    return base + perQ;
  };

  // New handler functions for enhanced features
  const handleAchievementUnlocked = (achievement) => {
    playSound('milestone');
    // Add XP for achievement
    const xpReward = achievement.xp || 10;
    // This will be handled by XPLevelSystem component
  };

  const handleLevelUp = (newLevel, levelsGained) => {
    playSound('complete');
    // Could add special rewards for leveling up
  };

  const handleXPChange = (xpGained, newStats) => {
    setUserLevel(newStats.level);
    setUserXP(newStats.xp);
  };

  const handlePowerUpUse = (powerUpId) => {
    switch (powerUpId) {
      case 'skip':
        goToNext();
        break;
      case 'extraTime':
        setCurrentTimerDuration(25); // Add 15 seconds
        setExtraTimeUsed(true);
        break;
      case 'doublePoints':
        setDoublePointsActive(true);
        break;
      case 'revealAnswer':
        // Show correct answer
        setShowFeedback(true);
        setSelectedAnswer(questions[currentQuestion].answer);
        break;
      case 'hint':
        useHint();
        break;
      case 'fiftyFifty':
        use5050();
        break;
      default:
        break;
    }
  };

  const handleDailyChallengeStart = (challengeConfig) => {
    setIsDailyChallenge(true);
    setDailyChallengeConfig(challengeConfig);
    fetchQuestions(challengeConfig);
  };

  const handleLearningMode = (questionData, userAnswer, correctAnswer) => {
    setLearningModeData({
      question: questionData.question,
      userAnswer,
      correctAnswer,
      explanation: null // Could be enhanced with custom explanations
    });
    setShowLearningMode(true);
  };

  const handleLearningModeNext = () => {
    setShowLearningMode(false);
    setLearningModeData(null);
    goToNext();
  };

  const handleLearningModeClose = () => {
    setShowLearningMode(false);
    setLearningModeData(null);
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
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-1 drop-shadow-lg">
        QuizNerds
      </h1>
      <p className="text-gray-300 mb-8 text-lg">Please login to access quiz</p>
        <LoginButton />
      </div>
    );
  }
  if (showProfile) {
  return (
    <ProfilePage
      onBack={() => {
        setShowProfile(false);
        playSound("click");
      }}
      themeClasses={themeClasses}
      playSound={playSound}
      onStartMultiplayer={handleStartMultiplayer}
      theme={theme}
    />
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
          themeClasses={themeClasses}

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
      <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} overflow-y-auto`}>
        {/* Header */}
        <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50">
          <div className="flex justify-between items-center p-4">
                {/* Profile button on top-left */}
            <button
              onClick={() => {
                setShowProfile(true);
                playSound("click");
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 
                  bg-gradient-to-r from-indigo-600 to-purple-600 
                  hover:from-indigo-700 hover:to-purple-700 
                  text-white px-4 py-2 rounded-lg font-semibold 
                  shadow-md transition-all hover:scale-105"
           >
              Profile
            </button>
            <div className="text-center flex-1">
              <h1 className={`text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent`}>
                QuizNerds
              </h1>
              <p className={`text-gray-400 text-sm`}>Choose your quiz settings</p>
            </div>
            <div className="flex items-center gap-3">
              <LogoutButton theme={theme} />
              <ThemeToggle theme={theme} setTheme={setTheme} isInHeader={true} />
              <SoundControls 
                soundEnabled={soundEnabled} 
                musicEnabled={musicEnabled}
                setSoundEnabled={setSoundEnabled}
                setMusicEnabled={setMusicEnabled}
                theme={theme}
                isInHeader={true}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Quiz Selector */}
            <div className="space-y-6">
              <QuizSelector onStart={handleQuizStart} loading={loading} error={error} />
            </div>
            
            {/* Right Column - Daily Challenge */}
            <div className="space-y-6">
              <DailyChallenge 
                onStartChallenge={handleDailyChallengeStart}
                theme={theme}
              />
            {/* 🚀 NEW: Multiplayer Session Card (Structured for style matching) 🚀 */}
            <div className={`${themeClasses.card} p-6 rounded-2xl shadow-2xl border-t-4 border-cyan-500`}>
              <div className="flex justify-between items-start mb-4">
                  <h2 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400`}>
                      🎮 Multiplayer Session
                  </h2>
                  <span className="text-sm font-semibold text-cyan-400">LIVE</span>
              </div>

              <p className="text-gray-400 mb-6 text-sm">
                  Challenge your friends in real-time. Create a private room or join an existing session with a code.
              </p>
              
              <button
                onClick={() => {
                  // This action routes the user to the Profile page, where the 
                  // multiplayer session creation/joining logic is handled.
                  setShowQuizSelector(false);
                  setShowProfile(true);
                  playSound('click');
                }}
                className={`
                  ${themeClasses.button} 
                  w-full py-3 
                  rounded-lg font-semibold text-lg
                  shadow-lg transition-all hover:scale-[1.01]
                  bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700
                `}
              >
                Start Multiplayer
              </button>
            </div>
            {/* END NEW MULTIPLAYER CARD */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----- MAIN QUIZ UI -----
  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-indigo-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

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
        
      {/* XP and Level System */}
      <XPLevelSystem 
        onLevelUp={handleLevelUp}
        onXPChange={handleXPChange}
        showLevelUpAnimation={true}
      />

      {/* Achievement System */}
      <AchievementSystem 
        score={score}
        totalQuestions={questions.length}
        streak={streak}
        attempts={JSON.parse(localStorage.getItem('quiz-stats') || '[]')}
        currentQuestion={currentQuestion}
        isFinished={isFinished}
        onAchievementUnlocked={handleAchievementUnlocked}
      />

      {/* Power-ups System */}
      <PowerUpsSystem 
        onUsePowerUp={handlePowerUpUse}
        remainingHints={remainingHints}
        remaining5050={remaining5050}
        theme={theme}
        disabled={showFeedback}
      />

      <div className="text-center mb-4 relative z-10">
        <div className={`${themeClasses.card} rounded-2xl p-4 mb-4 transform hover:scale-105 transition-all duration-300`}>
          <h1 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2 animate-pulse`}>
            QuizNerds
          </h1>
          <p className={`${themeClasses.textSecondary} text-sm mb-3`}>
            {quizConfig.source === "opentdb"
              ? "OpenTDB"
              : quizConfig.source === "local"
              ? "Local Questions"
              : quizConfig.source === "custom"
              ? `Custom: ${quizConfig.customQuiz?.title || 'Custom Quiz'}`
              : "Trivia API"}{" "}
            • {quizConfig.difficulty} • {questions.length} questions
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
          <button
            onClick={startNewQuiz}
            className={`${themeClasses.glass} text-xs px-3 py-1 rounded-full font-medium 
                      bg-gradient-to-r from-green-500 to-emerald-600 
                      hover:from-green-600 hover:to-emerald-700 
                      text-white shadow-md hover:scale-105 transition-all duration-200`}
          >
            🆕 New
          </button>
            <LogoutButton theme={theme} />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xl mb-4 relative z-10">
        <div className={`${themeClasses.card} rounded-xl p-3`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-400">Progress</span>
            <span className="text-xs font-bold text-purple-400">{Math.round(calculateProgress())}%</span>
          </div>
          <div className={`${themeClasses.panelBg} h-3 rounded-full overflow-hidden shadow-inner`}>
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 duration-500 ease-out transition-all shadow-lg"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
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
              duration={currentTimerDuration}
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

          <div className="mt-4 min-h-[50px] relative z-10">
            {showFeedback && (
              <div className="flex justify-center">
                <button
                  className={`${themeClasses.button} py-3 px-6 rounded-xl font-semibold shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-purple-500/25 text-base`}
                  onClick={goToNext}
                >
                  <span className="flex items-center gap-2">
                    {currentQuestion + 1 < questions.length ? (
                      <>
                        <span>Continue</span>
                        <span className="text-lg">→</span>
                      </>
                    ) : (
                      <>
                        <span>See Results</span>
                        <span className="text-lg">🏆</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center relative z-10">
          <div className={`${themeClasses.card} rounded-2xl p-6 max-w-xl mx-auto`}>
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Quiz Completed!
            </h2>
            <div className={`${themeClasses.glass} rounded-xl p-4 mb-4`}>
              <p className="text-lg mb-1">
                You scored{" "}
                <span className="text-green-400 font-bold text-xl">{score}</span> out of{" "}
                <span className="font-bold text-lg">{questions.length}</span>
              </p>
              <p className="text-sm text-gray-400">
                ({Math.round(percentage)}% accuracy)
              </p>
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
              <button
                className={`${themeClasses.button} py-2 px-4 rounded-lg font-semibold shadow-lg cursor-pointer transition-all hover:scale-105 text-sm`}
                onClick={restartQuiz}
              >
                🔄 Retry
              </button>
              <button
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white py-2 px-4 rounded-lg font-semibold shadow-lg cursor-pointer transition-all hover:scale-105 text-sm"
                onClick={startNewQuiz}
              >
                🆕 New Quiz
              </button>
              <button
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white py-2 px-4 rounded-lg font-semibold shadow-lg cursor-pointer transition-all hover:scale-105 text-sm"
                onClick={() => setShowReview(true)}
              >
                📖 Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hint Display */}
      {currentHint && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-3 rounded-xl shadow-lg max-w-sm border border-white/20 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg animate-pulse">💡</span>
              <p className="font-semibold text-xs">{currentHint}</p>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Controls */}
      <ThemeToggle theme={theme} setTheme={setTheme} />
      <SoundControls 
        soundEnabled={soundEnabled} 
        musicEnabled={musicEnabled}
        setSoundEnabled={setSoundEnabled}
        setMusicEnabled={setMusicEnabled}
        theme={theme}
      />

      {/* Streak bar fixed bottom-left */}
      <div className="fixed bottom-3 left-3 z-40">
        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 text-black font-bold py-2 px-4 rounded-lg shadow-lg border border-yellow-300/30 backdrop-blur-sm">
          <span className="flex items-center gap-1">
            <span className="text-sm animate-pulse">🔥</span>
            <span className="text-sm">{streak}</span>
          </span>
        </div>
      </div>

      {/* Multiplayer Leaderboard */}
      {isMultiplayer && multiplayerLeaderboard.length > 0 && (
        <div className="fixed top-20 right-3 z-40 max-w-xs">
          <div className={`${themeClasses.card} rounded-xl p-4 shadow-2xl border-2 border-purple-500/50`}>
            <h3 className="text-sm font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              🏆 Leaderboard
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {multiplayerLeaderboard.map((player, index) => (
                <div
                  key={index}
                  className={`${themeClasses.panelBg} rounded-lg p-2 flex items-center justify-between ${
                    player.username === currentUsername ? 'ring-2 ring-purple-400' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">#{index + 1}</span>
                    <span className="text-sm font-semibold truncate max-w-[120px]">{player.username}</span>
                  </div>
                  <span className="text-xs font-bold">{player.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {showStats && (
        <StatsModal onClose={() => setShowStats(false)} />
      )}
      {showReview && (
        <ReviewModal answers={userAnswers} onClose={() => setShowReview(false)} />
      )}
      {showAchievements && (
        <AchievementModal onClose={() => setShowAchievements(false)} />
      )}
      {showLearningMode && learningModeData && (
        <LearningMode 
          question={learningModeData.question}
          userAnswer={learningModeData.userAnswer}
          correctAnswer={learningModeData.correctAnswer}
          explanation={learningModeData.explanation}
          onNext={handleLearningModeNext}
          onClose={handleLearningModeClose}
          theme={theme}
        />
      )}
    </div>
    </div>

  );
};


export default App;