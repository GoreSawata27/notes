import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { fetchPosts } from "../../example-3-async-thunk/_features/postsSlice";
import { login, logout } from "../../example-4-login/_features/authSlice";

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: isAnyOf(login.fulfilled, login.rejected, logout, fetchPosts.fulfilled),
  effect: (action, listenerApi) => {
    const state = listenerApi.getState() as {
      auth: { status: string };
      posts: { status: string; items: unknown[] };
    };
    if (process.env.NODE_ENV !== "production") {
      console.info("[learn-redux listener]", action.type, {
        authStatus: state.auth.status,
        postsStatus: state.posts.status,
        postsCount: state.posts.items.length,
      });
    }
  },
});

export type AppStartListening = typeof listenerMiddleware.startListening;
