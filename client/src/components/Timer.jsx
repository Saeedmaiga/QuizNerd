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
    <div className="fixed top-4 left-4 z-50">
      <div
        className={`text-3xl font-bold px-6 py-3 rounded-xl shadow-lg bg-gray-800 border-2 ${timerColor}`}
      >
        ⏳ {timeLeft}s
      </div>
    </div>
  );
}

export default Timer;
