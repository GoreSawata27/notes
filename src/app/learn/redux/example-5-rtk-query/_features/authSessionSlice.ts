import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../_features/authApi";

type SessionState = {
  token: string | null;
  user: { id: string; email: string; name: string } | null;
};

const initialState: SessionState = {
  token: null,
  user: null,
};

const authSessionSlice = createSlice({
  name: "authSession",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
    },
  },
  extraReducers(builder) {
    builder.addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    });
  },
});

export const { logout } = authSessionSlice.actions;
export default authSessionSlice.reducer;
