import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type TodoFilter = "all" | "active" | "completed";

type UiState = {
  filter: TodoFilter;
};

const initialState: UiState = {
  filter: "all",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<TodoFilter>) {
      state.filter = action.payload;
    },
  },
});

export const { setFilter } = uiSlice.actions;
export default uiSlice.reducer;
