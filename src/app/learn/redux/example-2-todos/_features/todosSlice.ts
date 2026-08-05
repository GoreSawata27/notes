import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

type TodosState = {
  items: Todo[];
};

const initialState: TodosState = {
  items: [
    { id: "1", text: "Learn createSlice", completed: true },
    { id: "2", text: "Wire useSelector", completed: false },
  ],
};

const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    addTodo(state, action: PayloadAction<string>) {
      const text = action.payload.trim();
      if (!text) return;
      state.items.push({
        id: crypto.randomUUID(),
        text,
        completed: false,
      });
    },
    toggleTodo(state, action: PayloadAction<string>) {
      const todo = state.items.find((t) => t.id === action.payload);
      if (todo) todo.completed = !todo.completed;
    },
    removeTodo(state, action: PayloadAction<string>) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
  },
});

export const { addTodo, toggleTodo, removeTodo } = todosSlice.actions;
export default todosSlice.reducer;
