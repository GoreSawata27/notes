import type { Metadata } from "next";
import Timer from "./_components/Timer";
import CountDown from "./_components/CountDown";

export const metadata: Metadata = {
  title: "Timer",
};

export default function TimerPage() {
  return (
    <div className="flex flex-col items-center gap-12">
      <section className="text-center">
        <h2 className="mb-4 text-lg font-semibold">Stopwatch</h2>
        <Timer />
      </section>
      <section className="text-center">
        <h2 className="mb-4 text-lg font-semibold">Countdown</h2>
        <CountDown />
      </section>
    </div>
  );
}
