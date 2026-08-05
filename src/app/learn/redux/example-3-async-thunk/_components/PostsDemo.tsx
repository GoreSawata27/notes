"use client";

import { clearPosts, fetchPosts } from "../_features/postsSlice";
import { useAppDispatch, useAppSelector } from "../_store/hooks";

export default function PostsDemo() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((s) => s.posts);

  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={status === "loading"}
          className="rounded bg-blue-600 px-3 py-1.5 text-white disabled:opacity-50"
          onClick={() => dispatch(fetchPosts())}
        >
          {status === "loading" ? "Loading…" : "Fetch posts"}
        </button>
        <button
          type="button"
          className="rounded border border-zinc-300 px-3 py-1.5 dark:border-zinc-600"
          onClick={() => dispatch(clearPosts())}
        >
          Clear
        </button>
      </div>

      <p className="text-zinc-600 dark:text-zinc-400">
        Status: <strong>{status}</strong>
        {error ? <span className="ml-2 text-red-600">— {error}</span> : null}
      </p>

      {items.length > 0 ? (
        <ul className="list-inside list-disc">
          {items.map((p) => (
            <li key={p.id}>{p.title}</li>
          ))}
        </ul>
      ) : (
        <p className="text-zinc-500">No posts yet — click Fetch to run the async thunk.</p>
      )}

      <p className="text-xs text-zinc-500">
        Interview flow: dispatch thunk → pending sets loading → API returns → fulfilled/rejected updates
        store → every component using <code>useSelector</code> re-renders.
      </p>
    </div>
  );
}
