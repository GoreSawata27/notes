import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../_store/store";

const selectTodosState = (state: RootState) => state.todos.items;
const selectFilter = (state: RootState) => state.ui.filter;

export const selectFilteredTodos = createSelector(
  [selectTodosState, selectFilter],
  (items, filter) => {
    if (filter === "active") return items.filter((t) => !t.completed);
    if (filter === "completed") return items.filter((t) => t.completed);
    return items;
  },
);

export const selectActiveCount = createSelector([selectTodosState], (items) =>
  items.filter((t) => !t.completed).length,
);
