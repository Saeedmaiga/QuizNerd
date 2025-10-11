import { useState, useEffect, useRef } from "react";

function Timer({ duration = 20, onTimeUp, stopTimerSignal }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const clockSound = useRef(null);
  const tickingStarted = useRef(false); // Prevents multiple restarts

  const playClockSound = () => {
    if (!clockSound.current) {
      clockSound.current = new Audio("/clock-ticking.mp3");
      clockSound.current.loop = true;
      clockSound.current.play().catch((e) => console.log("Audio play failed:", e));
    }
  };

  const stopClockSound = () => {
    if (clockSound.current) {
      clockSound.current.pause();
      clockSound.current.currentTime = 0;
      clockSound.current = null;
      tickingStarted.current = false; // reset the flag
    }
  };

  // Stop ticking sound if user picks an answer
  useEffect(() => {
    if (stopTimerSignal) stopClockSound();
  }, [stopTimerSignal]);

  useEffect(() => {
    if (timeLeft <= 0) {
      stopClockSound();
      onTimeUp();
      return;
    }

    if (timeLeft === 5 && !tickingStarted.current) {
      playClockSound();
      tickingStarted.current = true;
    }

    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, onTimeUp]);

  // Clean up on unmount or reset
  useEffect(() => {
    return () => stopClockSound();
  }, []);

  const timerColor =
    timeLeft <= 3 ? "text-red-500 animate-pulse" : "text-green-400";

  return (
    <div className="fixed top-3 left-3 z-50">
      <div
        className={`text-xl font-bold px-4 py-2 rounded-lg shadow-lg bg-gray-800/80 backdrop-blur-xl border ${timerColor} border-gray-700/50`}
      >
        <span className="flex items-center gap-1">
          <span className="text-lg animate-pulse">⏳</span>
          <span>{timeLeft}s</span>
        </span>
      </div>
    </div>
  );
}

export default Timer;
