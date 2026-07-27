"use client";
import { useReducer, useEffect } from "react";

// 1 State Shape
type Todo = { id: number; text: string; completed: boolean };

type State = {
  todos: Todo[];
  filter: "all" | "active" | "completed";
  loading: boolean;
  error: string | null;
};

// 2 Action Types
type Action =
  | { type: "ADD_TODO"; payload: string }
  | { type: "TOGGLE_TODO"; payload: number }
  | { type: "DELETE_TODO"; payload: number }
  | { type: "SET_FILTER"; payload: "all" | "active" | "completed" }
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Todo[] }
  | { type: "FETCH_ERROR"; payload: string };

// 3 Reducer Function
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TODO":
      return {
        ...state,
        todos: [...state.todos, { id: Date.now(), text: action.payload, completed: false }],
      };

    case "TOGGLE_TODO":
      return {
        ...state,
        todos: state.todos.map((t) => (t.id === action.payload ? { ...t, completed: !t.completed } : t)),
      };

    case "DELETE_TODO":
      return {
        ...state,
        todos: state.todos.filter((t) => t.id !== action.payload),
      };

    case "SET_FILTER":
      return { ...state, filter: action.payload };

    case "FETCH_START":
      return { ...state, loading: true, error: null };

    case "FETCH_SUCCESS":
      return { ...state, loading: false, todos: action.payload };

    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}

// 4 Initial State
const initialState: State = {
  todos: [],
  filter: "all",
  loading: false,
  error: null,
};

// 5 Component
export default function TodoApp() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Simulate async fetch
  useEffect(() => {
    dispatch({ type: "FETCH_START" });
    setTimeout(() => {
      if (Math.random() > 0.2) {
        dispatch({
          type: "FETCH_SUCCESS",
          payload: [
            { id: 1, text: "Learn React", completed: false },
            { id: 2, text: "Master useReducer", completed: true },
          ],
        });
      } else {
        dispatch({ type: "FETCH_ERROR", payload: "Failed to fetch todos" });
      }
    }, 1000);
  }, []);

  const filteredTodos = state.todos.filter((t) => {
    if (state.filter === "active") return !t.completed;
    if (state.filter === "completed") return t.completed;
    return true;
  });

  return (
    <div>
      <h1>Todo App with useReducer</h1>

      {state.loading && <p>Loading...</p>}
      {state.error && <p style={{ color: "red" }}>{state.error}</p>}

      <input
        type="text"
        placeholder="New Todo"
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.currentTarget.value.trim()) {
            dispatch({ type: "ADD_TODO", payload: e.currentTarget.value });
            e.currentTarget.value = "";
          }
        }}
      />

      <div>
        <button onClick={() => dispatch({ type: "SET_FILTER", payload: "all" })}>All</button>
        <button onClick={() => dispatch({ type: "SET_FILTER", payload: "active" })}>Active</button>
        <button onClick={() => dispatch({ type: "SET_FILTER", payload: "completed" })}>Completed</button>
      </div>

      <ul>
        {filteredTodos.map((todo) => (
          <li key={todo.id}>
            <span
              style={{ textDecoration: todo.completed ? "line-through" : "none" }}
              onClick={() => dispatch({ type: "TOGGLE_TODO", payload: todo.id })}
            >
              {todo.text}
            </span>
            <button onClick={() => dispatch({ type: "DELETE_TODO", payload: todo.id })}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
