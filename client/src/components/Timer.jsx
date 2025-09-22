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
