import { useEffect, useState } from "react";

function CountDown() {
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
      <button onClick={handleReset}>Restart Countdown</button>
      {timer === 0 && <p>Time's Up!</p>}
    </>
  );
}

export default CountDown;
