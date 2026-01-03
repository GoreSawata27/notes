import { useEffect, useState } from "react";

export default function Timer() {
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const handleStart = () => setIsRunning(true);

  const handlePause = () => setIsRunning(false);

  const handleClear = () => {
    setIsRunning(false);
    setTimer(0);
  };

  return (
    <>
      <h2>{timer}</h2>
      <button onClick={handleStart}>Start</button>
      <button onClick={handlePause}>Pause</button>
      <button onClick={handleClear}>Clear</button>
    </>
  );
}
