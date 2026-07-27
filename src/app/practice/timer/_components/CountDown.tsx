"use client";

import { useEffect, useState } from "react";

export default function CountDown() {
  const [timer, setTimer] = useState(10);

  useEffect(() => {
    if (timer === 0) return;

    const timeout = setTimeout(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [timer]);

  const handleReset = () => setTimer(10);

  return (
    <>
      <h2>{timer}</h2>
      <button type="button" onClick={handleReset}>
        Restart Countdown
      </button>
      {timer === 0 && <p>Time&apos;s Up!</p>}
    </>
  );
}
