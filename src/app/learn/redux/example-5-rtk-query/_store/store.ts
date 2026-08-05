import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../_features/authApi";
import authSessionReducer from "../_features/authSessionSlice";

export const store = configureStore({
  reducer: {
    authSession: authSessionReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
