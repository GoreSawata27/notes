import { configureStore } from "@reduxjs/toolkit";
import todosReducer from "../_features/todosSlice";
import uiReducer from "../_features/uiSlice";

export const store = configureStore({
  reducer: {
    todos: todosReducer,
    ui: uiReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
