"use client";

import { useEffect, useState } from "react";
import {
  clearAuthError,
  hydrateFromStorage,
  login,
  logout,
  selectIsAuthenticated,
} from "../_features/authSlice";
import { useAppDispatch, useAppSelector } from "../_store/hooks";

const DEMO_CREDENTIALS = { email: "demo@notes.local", password: "password123" };

export default function LoginDemo() {
  const dispatch = useAppDispatch();
  const { user, status, error, token } = useAppSelector((s) => s.auth);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);

  useEffect(() => {
    dispatch(hydrateFromStorage());
  }, [dispatch]);

  if (isAuthenticated && user) {
    return (
      <div className="space-y-3 text-sm">
        <p className="rounded border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
          Signed in as <strong>{user.name}</strong> ({user.email})
        </p>
        <p className="font-mono text-xs text-zinc-500 break-all">Token: {token}</p>
        <button
          type="button"
          className="rounded border border-zinc-300 px-3 py-1.5 dark:border-zinc-600"
          onClick={() => dispatch(logout())}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <form
      className="max-w-sm space-y-3 text-sm"
      onSubmit={(e) => {
        e.preventDefault();
        dispatch(clearAuthError());
        dispatch(login({ email, password }));
      }}
    >
      <p className="text-xs text-zinc-500">
        Test user: <code>{DEMO_CREDENTIALS.email}</code> / <code>{DEMO_CREDENTIALS.password}</code>
      </p>
      <label className="block">
        <span className="text-zinc-600 dark:text-zinc-400">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950"
          autoComplete="username"
        />
      </label>
      <label className="block">
        <span className="text-zinc-600 dark:text-zinc-400">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950"
          autoComplete="current-password"
        />
      </label>
      {error ? <p className="text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {status === "loading" ? "Logging in…" : "Login"}
      </button>
      {status === "loading" ? (
        <p className="text-xs text-zinc-500">Watch Redux DevTools: auth/login/pending → fulfilled/rejected</p>
      ) : null}
    </form>
  );
}
