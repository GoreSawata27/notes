"use client";

import { useState } from "react";
import { addTodo, removeTodo, toggleTodo } from "../_features/todosSlice";
import { setFilter, type TodoFilter } from "../_features/uiSlice";
import { selectActiveCount, selectFilteredTodos } from "../_features/selectors";
import { useAppDispatch, useAppSelector } from "../_store/hooks";

const FILTERS: TodoFilter[] = ["all", "active", "completed"];

export default function TodosDemo() {
  const dispatch = useAppDispatch();
  const todos = useAppSelector(selectFilteredTodos);
  const filter = useAppSelector((s) => s.ui.filter);
  const activeCount = useAppSelector(selectActiveCount);
  const [text, setText] = useState("");

  return (
    <div className="space-y-4 text-sm">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          dispatch(addTodo(text));
          setText("");
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="New todo"
          className="flex-1 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950"
        />
        <button type="submit" className="rounded bg-zinc-800 px-3 py-1 text-white dark:bg-zinc-200 dark:text-zinc-900">
          Add
        </button>
      </form>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => dispatch(setFilter(f))}
            className={`rounded px-2 py-1 capitalize ${
              filter === f ? "bg-blue-600 text-white" : "border border-zinc-300 dark:border-zinc-600"
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-zinc-500">{activeCount} active</span>
      </div>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch(toggleTodo(todo.id))}
            />
            <span className={todo.completed ? "text-zinc-400 line-through" : ""}>{todo.text}</span>
            <button
              type="button"
              className="ml-auto text-xs text-red-600"
              onClick={() => dispatch(removeTodo(todo.id))}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <p className="text-xs text-zinc-500">
        Two slices (<code>todos</code>, <code>ui</code>) in one store. Filtered list uses{" "}
        <code>createSelector</code> — compare with manual{" "}
        <code>useReducer</code> in practice/reducer.
      </p>
    </div>
  );
}
