"use client";

import { fetchPosts } from "../../example-3-async-thunk/_features/postsSlice";
import { login, logout, selectIsAuthenticated } from "../../example-4-login/_features/authSlice";
import { useAppDispatch, useAppSelector } from "../_store/hooks";

const DEMO = { email: "demo@notes.local", password: "password123" };

export default function PatternsDemo() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const auth = useAppSelector((s) => s.auth);
  const posts = useAppSelector((s) => s.posts);

  return (
    <div className="space-y-6 text-sm">
      <section>
        <h3 className="mb-2 font-semibold">Combined features</h3>
        <p className="mb-2 text-zinc-600 dark:text-zinc-400">
          One store mounts <code>auth</code> + <code>posts</code> reducers (imported from Examples 3
          &amp; 4). Open DevTools console to see listener logs on login and fetch.
        </p>
        {!isAuthenticated ? (
          <button
            type="button"
            className="rounded bg-blue-600 px-3 py-1.5 text-white"
            onClick={() => dispatch(login(DEMO))}
          >
            Quick login
          </button>
        ) : (
          <button
            type="button"
            className="rounded border border-zinc-300 px-3 py-1 dark:border-zinc-600"
            onClick={() => dispatch(logout())}
          >
            Logout
          </button>
        )}
        <p className="mt-2 text-xs text-zinc-500">Auth: {auth.status}</p>
      </section>

      <section>
        <h3 className="mb-2 font-semibold">Posts (same thunk as Ex 3)</h3>
        <button
          type="button"
          disabled={posts.status === "loading"}
          className="rounded bg-zinc-800 px-3 py-1.5 text-white disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900"
          onClick={() => dispatch(fetchPosts())}
        >
          Fetch posts
        </button>
        <p className="mt-2 text-xs text-zinc-500">
          {posts.status} — {posts.items.length} items
        </p>
      </section>

      <section className="rounded border border-amber-200 bg-amber-50 p-3 text-xs dark:border-amber-900 dark:bg-amber-950">
        <strong>What not to put in Redux:</strong> data that Next.js already fetches on the server
        (RSC props, cached fetch in Server Components). Use Redux for client-global UI state, session
        the whole SPA needs, and optimistic flows — not as a duplicate server cache.
      </section>
    </div>
  );
}
