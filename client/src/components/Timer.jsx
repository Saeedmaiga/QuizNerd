import { useState, useEffect } from "react";

function Timer({ duration = 10, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onTimeUp]);

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
