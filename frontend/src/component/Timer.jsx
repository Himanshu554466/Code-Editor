import { useState, useEffect } from "react";

const Timer = ({ startTime }) => {
  const [time, setTime] = useState(() => Date.now() - startTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  return <div className="text-white font-mono text-4xl">⏱ {formatTime(time)}</div>;

};

export default Timer;
