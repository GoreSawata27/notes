"use client";

import { useState } from "react";
import {
  decrement,
  increment,
  incrementByAmount,
  reset,
} from "../_features/counterSlice";
import { useAppDispatch, useAppSelector } from "../_store/hooks";

export default function CounterDemo() {
  const dispatch = useAppDispatch();
  const value = useAppSelector((state) => state.counter.value);
  const [amount, setAmount] = useState("5");

  return (
    <div className="space-y-4 text-sm">
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded bg-zinc-800 px-3 py-1.5 text-white dark:bg-zinc-200 dark:text-zinc-900"
          onClick={() => dispatch(increment())}
        >
          +1
        </button>
        <button
          type="button"
          className="rounded border border-zinc-300 px-3 py-1.5 dark:border-zinc-600"
          onClick={() => dispatch(decrement())}
        >
          −1
        </button>
        <button
          type="button"
          className="rounded border border-zinc-300 px-3 py-1.5 dark:border-zinc-600"
          onClick={() => dispatch(reset())}
        >
          Reset
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-20 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950"
        />
        <button
          type="button"
          className="rounded bg-blue-600 px-3 py-1.5 text-white"
          onClick={() => dispatch(incrementByAmount(Number(amount) || 0))}
        >
          Add amount
        </button>
      </div>
      <p className="text-xs text-zinc-500">
        UI reads <code>state.counter.value</code>; buttons dispatch slice actions. RTK uses Immer so
        reducers can look mutable.
      </p>
    </div>
  );
}
