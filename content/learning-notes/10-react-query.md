# TanStack Query (React Query) Learning Notes

A progressive, hands-on guide to **TanStack Query v5** (still widely called React Query) — from `QueryClient` and query keys through `useQuery`, mutations, invalidation, optimistic updates, infinite and dependent queries, prefetch, Next.js SSR/hydration, Devtools, retries, and `placeholderData`. Each lesson builds on the last. Read the takeaway, study the explanation and code, then try the exercise in a Vite + React app or a Next.js App Router project.

TanStack Query is a **server-state** cache. It is not a Redux replacement. Pair it with local React state (or Redux) for UI that is not from the server.

---

## Server state mental model

### Lesson 1. Server state vs client state

**Takeaway:** **Server state** lives on a remote source of truth (REST, GraphQL, a database). Your app only holds a **cache** of it. **Client state** is owned entirely by the browser (modal open, wizard step, selected tab).

**Explain:** Server state is incomplete, stale by default, and shared with other users. It requires loading and error states, retries, pagination, and a policy for “how fresh is fresh enough.” `useEffect` + `useState` + `fetch` reinvent that cache badly: duplicate requests, race conditions, no shared cache across screens.

```tsx
// ❌ Home-grown server cache — races, no dedupe, no freshness policy
function Posts() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then(setData)
      .catch(setError);
  }, []);
  // Unmount during fetch? setState on unmounted component.
  // Navigate back? Fetch again even if data is 2 seconds old.
}
```

TanStack Query owns the cache: deduplicated fetches, status flags, retries, background refetch, and garbage collection. You declare **what** to fetch and **how long** it is fresh. The library decides **when**.

Keep client state in `useState` / `useReducer` / Redux. Do not put `isSidebarOpen` in Query, and do not put `posts` from the API in Redux unless you have a rare client-only overlay. The Redux learning track covers that boundary.

**Tip:** If a value is wrong when another tab or another user changes the database, it is server state. If it is only meaningful in this session’s UI, it is client state.

**Try it:** List eight pieces of state in an app you know. Mark each `server` or `client`. For each server item, write the URL or query that would load it.

---

### Lesson 2. `QueryClient`: the cache that owns your server data

**Takeaway:** A `QueryClient` is the object that holds the cache, default options, and methods like `invalidateQueries` and `prefetchQuery`. One client per browser app (and one **per request** on the server).

**Explain:** Instantiating the client is the first setup step. Defaults apply to every query unless an individual hook overrides them.

```ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,      // 1 minute: data is "fresh"
      gcTime: 5 * 60_000,     // 5 minutes: unused cache lives on
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

`queryClient.getQueryData(["posts"])` reads the cache synchronously. `queryClient.setQueryData` writes it. `queryClient.invalidateQueries` marks matching queries stale and refetches active ones. You will use these in mutation callbacks (Lessons 13–15).

On the server (Lesson 21), **do not** use a module-level singleton. A shared server client would leak user A’s cached data into user B’s HTML.

**Tip:** Create the client once in the browser with `useState(() => new QueryClient())` or a module singleton in a client-only app. Creating a new client every render wipes the cache and refetches everything.

**Try it:** Instantiate a `QueryClient` in the console of a small app (or a unit test). `setQueryData(["demo"], { ok: true })` then `getQueryData(["demo"])` and confirm you get the same object.

---

### Lesson 3. Query keys: identity, hierarchy, and partial matching

**Takeaway:** A query key is an array that **identifies** one cache entry. Same key → same data. Different key → different request. Invalidation uses **prefix matching** on that array.

**Explain:** Keys should include every variable that changes the response: resource name, ids, filters, locale.

```ts
["posts"]                          // list
["posts", { status: "open" }]      // filtered list
["posts", postId]                  // detail
["posts", postId, "comments"]      // nested resource
["users", userId, "posts"]         // another list
```

TanStack Query hashes the key (stable JSON). `{ status: "open" }` and `{ status: "open" }` from two components match. Key order matters: `["posts", 1]` ≠ `[1, "posts"]`.

**Partial matching:** `invalidateQueries({ queryKey: ["posts"] })` invalidates the list, the filtered list, **and** every detail that starts with `"posts"`. That is usually what you want after a create. To invalidate only the list, use an exact key: `{ queryKey: ["posts"], exact: true }`.

Factory helpers keep keys consistent:

```ts
export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (filters: { status?: string }) => [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
};
```

**Tip:** Put ids and filters **in the key**, not only in the query function closure. If the key omits `status`, two filters share one cache and overwrite each other.

**Try it:** Design keys for `users`, `user by id`, and `user’s posts`. Write the `invalidateQueries` call that should run after changing a user’s name (detail + that user’s lists, not every post in the app).

---

### Lesson 4. `QueryClientProvider` and default options

**Takeaway:** `QueryClientProvider` puts the client on React context so `useQuery` can find the cache. Hooks throw if they render outside the provider.

**Explain:** Wrap the app once. In Vite, that is `main.tsx`. In Next.js App Router, use a small Client Component (same idea as the Redux `StoreProvider`).

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

`useState(() => new QueryClient())` guarantees one client per browser session even if the provider re-renders. Do not put `new QueryClient()` in the component body without that lazy initializer.

Default options on the client (Lesson 2) are the right place for app-wide `staleTime`. Per-hook options override them. A dashboard that must always be live can set `staleTime: 0` on those queries only.

Devtools (Lesson 25) also mounts under this provider.

**Tip:** In tests, wrap with a **new** `QueryClient` per test (`retry: false`, `gcTime: 0`) so cache never leaks between cases.

**Try it:** Render a `useQuery` without a provider and read the error. Then wrap with `Providers` and confirm the query runs. Add RTL later using the same wrapper.

---

## Freshness & garbage collection

### Lesson 5. `staleTime`: when data is still fresh

**Takeaway:** `staleTime` is how long after a successful fetch the data is considered **fresh**. Fresh data is served from the cache with **no** network. Stale data is still shown, but Query may refetch in the background.

**Explain:** Default `staleTime` in v5 is `0`: data is stale immediately. That is why you see a refetch every time you focus the window or remount a screen. For relatively static data (a product catalog, a user’s profile), raise it.

```tsx
const { data } = useQuery({
  queryKey: ["profile", userId],
  queryFn: () => fetch(`/api/users/${userId}`).then((r) => r.json()),
  staleTime: 5 * 60_000, // 5 minutes fresh
});
```

Timeline:

```text
fetch succeeds
  ├─ 0 … staleTime        → fresh (no automatic refetch)
  └─ after staleTime      → stale (shown, but refetch on mount/focus/reconnect)
```

`staleTime: Infinity` means “never automatically refetch” — useful for data that only changes when **you** mutate it (then you `invalidateQueries`). `staleTime: 0` is correct for inbox counts and trading prices.

`staleTime` is **not** “how long we keep the data.” That is `gcTime` (next lesson). A query can be stale and still in memory.

**Tip:** Start with `staleTime: 60_000` as an app default and lower it on screens that must feel live. Blind `staleTime: 0` everywhere is why people think Query “fetches too much.”

**Try it:** Set `staleTime: 10_000` on a list. Mount the page, navigate away, come back at 3 seconds (no fetch) and at 12 seconds (background fetch). Watch the Network tab.

---

### Lesson 6. `gcTime`: when unused cache is thrown away

**Takeaway:** `gcTime` (garbage-collection time, formerly `cacheTime`) is how long an **unused** query stays in memory after the last subscriber unmounts. Default is 5 minutes.

**Explain:** “Unused” means zero `useQuery` / `useInfiniteQuery` observers. The cache entry is kept so a quick back-navigation is instant. After `gcTime`, the entry is discarded and the next mount is a cold load.

```tsx
useQuery({
  queryKey: ["search", q],
  queryFn: () => search(q),
  staleTime: 30_000,
  gcTime: 60_000, // gone 1 minute after you leave the search page
});
```

```text
Last component using ["search", "redux"] unmounts
  ├─ 0 … gcTime     → data still in cache (instant remount)
  └─ after gcTime   → cache deleted
```

`gcTime: 0` evicts as soon as the last observer is gone — good in tests. `gcTime: Infinity` keeps unused data for the session — good for a small, expensive payload you will need again.

v4 called this `cacheTime`. If you read old posts, mentally rename it. `staleTime` and `gcTime` are independent: you can be stale at 0 ms and still cached for 5 minutes.

**Tip:** Search queries with unbounded keys (`["search", userTypedString]`) can bloat memory. Use a shorter `gcTime` or `queryClient.removeQueries` when the user clears the box.

**Try it:** Set `gcTime: 5_000`. Open a detail page, go back, wait 6 seconds, open it again. Confirm a new request. Repeat with a 1-second wait and confirm a cache hit.

---

### Lesson 7. Automatic refetch: focus, reconnect, and intervals

**Takeaway:** When data is **stale**, Query refetches on window focus, on network reconnect, and on remount. You can add `refetchInterval` for polling. Fresh data skips these triggers.

**Explain:** These flags live on the query (or on `defaultOptions.queries`):

```tsx
useQuery({
  queryKey: ["inbox"],
  queryFn: fetchInbox,
  staleTime: 15_000,
  refetchOnWindowFocus: true,   // default true
  refetchOnReconnect: true,     // default true
  refetchOnMount: true,         // default true if stale
  refetchInterval: 30_000,      // poll every 30s while a subscriber is mounted
  refetchIntervalInBackground: false,
});
```

`refetchOnMount: "always"` refetches even when fresh. `false` never refetches on mount (you then rely on invalidation and focus).

Polling is for live dashboards. Pause it when the tab is hidden unless you set `refetchIntervalInBackground`. Combine with `staleTime` so a focus event does not stampede if you just polled.

In Next.js, “window focus” is the browser tab, not a client-side route change. A route change remounts observers and uses `refetchOnMount`.

**Tip:** Turn `refetchOnWindowFocus` off in Devtools-heavy local work if it gets in the way — but leave it on in production for data that goes stale. Users alt-tab back expecting new messages.

**Try it:** Build a “last fetched at” readout (`dataUpdatedAt` from `useQuery`). Alt-tab away and back with `staleTime: 0` vs `staleTime: Infinity`. Note when the timestamp jumps.

---

## Reading with useQuery

### Lesson 8. `useQuery`: status, data, error, and `isFetching`

**Takeaway:** `useQuery` subscribes to a key. Read `status` / `isPending` for the first load, `isFetching` for any in-flight request, `data` for the cache, and `error` when the last request failed.

**Explain:** v5 renamed `isLoading` to a more precise pair: `isPending` (no data yet) and `isLoading` (`isPending && isFetching`). Prefer `isPending` for the first-paint spinner and `isFetching` for a quiet refresh bar.

```tsx
function PostList() {
  const { data, error, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: postKeys.lists(),
    queryFn: async () => {
      const res = await fetch("/api/posts");
      if (!res.ok) throw new Error("Failed to load posts");
      return res.json() as Promise<Post[]>;
    },
  });

  if (isPending) return <p>Loading posts…</p>;
  if (isError) return <p role="alert">{error.message}</p>;

  return (
    <div>
      {isFetching && <p>Refreshing…</p>}
      <ul>{data.map((p) => <li key={p.id}>{p.title}</li>)}</ul>
      <button type="button" onClick={() => refetch()}>
        Reload
      </button>
    </div>
  );
}
```

`queryFn` **must throw** (or return a rejected promise) on failure. Returning `{ error: true }` is treated as success and will not trigger `retry` or `isError`.

`status` is `"pending" | "error" | "success"`. There is also `fetchStatus`: `"fetching" | "paused" | "idle"` — useful when you want to know about the network independently of whether you have cached data.

**Tip:** Keep `queryFn` a pure fetch + parse. Do not dispatch Redux or navigate inside it. Side effects belong in `useEffect` or mutation callbacks.

**Try it:** Render the list, then trigger `refetch`. Confirm `isPending` is false while `isFetching` is true and the old list stays on screen.

---

### Lesson 9. Dependent queries with the `enabled` option

**Takeaway:** A query that needs another query’s result should set `enabled: Boolean(parentId)`. It does not run until the dependency exists, and it still gets a proper cache key.

**Explain:** Classic mistake: calling `useQuery` for `/users/${undefined}` on the first render. You either 404 or cache a bad entry. `enabled` skips the fetch without breaking the rules of hooks.

```tsx
function UserPosts({ userId }: { userId?: string }) {
  const userQuery = useQuery({
    queryKey: ["users", userId],
    queryFn: () => fetchUser(userId!),
    enabled: Boolean(userId),
  });

  const postsQuery = useQuery({
    queryKey: ["users", userId, "posts"],
    queryFn: () => fetchUserPosts(userId!),
    enabled: Boolean(userId) && userQuery.isSuccess,
  });

  if (!userId) return <p>Pick a user</p>;
  if (userQuery.isPending) return <p>Loading user…</p>;
  if (postsQuery.isPending) return <p>Loading posts…</p>;
  return <PostList posts={postsQuery.data} />;
}
```

You can depend on more than success: `enabled: userQuery.data?.role === "admin"`. The disabled query is `status: "pending"` and `fetchStatus: "idle"` — not an error.

`skipToken` from `@tanstack/react-query` is an alternative to `enabled` when you want TypeScript to narrow the key/fn arguments.

**Tip:** Always include the dependency in the **key** (`userId`), not only in `enabled`. Otherwise two users could share one cache entry.

**Try it:** Build a user picker. Posts should not request until a user is selected. Change users and confirm the posts key changes in Devtools.

---

### Lesson 10. `placeholderData`, `initialData`, and keeping the previous page

**Takeaway:** `placeholderData` shows stand-in data **without** putting it in the cache as a successful fetch. `initialData` **does** seed the cache. `placeholderData: keepPreviousData` keeps the last page’s data visible while the next page’s key loads.

**Explain:** Use `placeholderData` for a skeleton object or for pagination UX:

```tsx
import { keepPreviousData, useQuery } from "@tanstack/react-query";

function PaginatedPosts({ page }: { page: number }) {
  const { data, isPlaceholderData, isFetching } = useQuery({
    queryKey: ["posts", { page }],
    queryFn: () => fetchPostsPage(page),
    placeholderData: keepPreviousData,
  });

  return (
    <div>
      <ul>{data?.items.map((p) => <li key={p.id}>{p.title}</li>)}</ul>
      {isPlaceholderData && isFetching && <p>Loading page {page}…</p>}
    </div>
  );
}
```

When `page` changes, the key changes. Without `keepPreviousData` the list flashes empty. With it, you see page 1 while page 2 loads; `isPlaceholderData` is true so you can dim the list.

`initialData` is treated as if a fetch already succeeded (it affects `staleTime` / `dataUpdatedAt` unless you also set `initialDataUpdatedAt`). Use it when you already have the object from a list cache:

```tsx
useQuery({
  queryKey: postKeys.detail(id),
  queryFn: () => fetchPost(id),
  initialData: () => queryClient.getQueryData<Post[]>(postKeys.lists())?.find((p) => p.id === id),
  initialDataUpdatedAt: () => queryClient.getQueryState(postKeys.lists())?.dataUpdatedAt,
});
```

**Tip:** Prefer `placeholderData` for UX shims. Prefer `initialData` only when you truly have that entity and want fewer loading states.

**Try it:** Paginate a list of 5 + 5 items. First without `keepPreviousData` (notice the flash), then with it. Log `isPlaceholderData` as you click Next.

---

### Lesson 11. Errors, `retry`, and `retryDelay`

**Takeaway:** Failed `queryFn`s retry with exponential backoff by default (3 retries in the browser). Tune `retry`, `retryDelay`, and `throwOnError` so users are not stuck on a spinner and so 404s do not retry.

**Explain:** Default retry is aggressive for a “not found” or a 401. Customize:

```tsx
useQuery({
  queryKey: ["posts", id],
  queryFn: async () => {
    const res = await fetch(`/api/posts/${id}`);
    if (res.status === 404) throw new NotFoundError();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  retry: (failureCount, error) => {
    if (error instanceof NotFoundError) return false;
    return failureCount < 2;
  },
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  throwOnError: false, // default: stay in the hook as isError
});
```

`retry: false` is the right default in **tests** so a failure fails the test immediately.

`throwOnError: true` (or a predicate) sends the error to the nearest Error Boundary (Lesson 27). Use that for unexpected failures; keep expected 404s in `isError` UI.

Network offline: Query marks fetches `paused` and resumes on reconnect when `refetchOnReconnect` is on. You can read `failureCount` and `failureReason` from the query result for a “retrying…” message.

**Tip:** Never retry `POST` mutations by default (Lesson 12). A retried charge can double-bill. Queries are idempotent GETs; mutations often are not.

**Try it:** Point `queryFn` at a 500 URL. Watch Devtools: three retries with increasing delay. Then set `retry: (n, err) => false` for 404 and confirm a single request.

---

## Mutations & cache updates

### Lesson 12. `useMutation` for creates, updates, and deletes

**Takeaway:** `useMutation` runs a write. It does not cache by query key. You get `mutate` / `mutateAsync`, `isPending`, `error`, and callbacks (`onSuccess`, `onError`, `onSettled`).

**Explain:** Mutations are fire-and-forget from the cache’s point of view until **you** update or invalidate queries.

```tsx
function AddPost() {
  const queryClient = useQueryClient();
  const addPost = useMutation({
    mutationFn: (title: string) =>
      fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      }).then((r) => {
        if (!r.ok) throw new Error("Could not create");
        return r.json() as Promise<Post>;
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });

  return (
    <button
      type="button"
      disabled={addPost.isPending}
      onClick={() => addPost.mutate("Hello")}
    >
      {addPost.isPending ? "Saving…" : "Add post"}
    </button>
  );
}
```

`mutate` is fire-and-forget (errors go to `onError`). `mutateAsync` returns a promise you can `await` in a submit handler (then `catch` or let the form library handle it).

`mutationKey` is optional; use it if you want to `useMutationState` to find in-flight mutations from another component.

**Tip:** Disable the submit button with `isPending` and ignore double clicks. Do not `retry: 3` on payments.

**Try it:** Add a post, then confirm the list query refetches (Network tab). Temporarily remove `invalidateQueries` and confirm the list stays stale — that is why Lesson 13 exists.

---

### Lesson 13. Invalidation: telling queries to refetch

**Takeaway:** `invalidateQueries` marks matching queries **stale** and refetches those with active observers. It is the default, safe way to keep the UI honest after a write.

**Explain:** After a mutation, the cache is wrong. You can either patch it by hand (Lesson 15) or invalidate and let Query refetch.

```ts
const queryClient = useQueryClient();

// All posts queries (lists + details)
await queryClient.invalidateQueries({ queryKey: ["posts"] });

// Only the exact list
await queryClient.invalidateQueries({ queryKey: ["posts"], exact: true });

// Predicate
await queryClient.invalidateQueries({
  predicate: (q) => q.queryKey[0] === "posts" && q.queryKey[1] !== "drafts",
});

// Mark stale but do not refetch yet
await queryClient.invalidateQueries({ queryKey: ["posts"], refetchType: "none" });
```

`refetchQueries` forces a fetch even if fresh. `resetQueries` returns them to the initial state (data cleared). Prefer invalidate after mutations; prefer refetch when the user clicks “Refresh.”

Invalidation is async — it returns a promise that resolves when active refetches finish. `await` it in `onSuccess` if you need to close a modal only after the list is current.

**Tip:** Invalidate the **prefix** that must change, not the entire client (`invalidateQueries()` with no filter refetches everything and can stampede).

**Try it:** From a detail edit screen, invalidate `["posts", id]` only and watch Devtools: the detail refetches, the list stays until you also invalidate `["posts"]` or use a shared prefix.

---

### Lesson 14. Optimistic updates with `onMutate`

**Takeaway:** Optimistic UI updates the cache **before** the server answers, snapshots the previous value, and **rolls back** in `onError`. `onSettled` always invalidates so the server remains the source of truth.

**Explain:** The v5 pattern uses `onMutate`’s return value as context for `onError`:

```tsx
const queryClient = useQueryClient();

const toggle = useMutation({
  mutationFn: (input: { id: string; done: boolean }) => patchTodo(input),
  onMutate: async (input) => {
    await queryClient.cancelQueries({ queryKey: todoKeys.lists() });
    const previous = queryClient.getQueryData<Todo[]>(todoKeys.lists());
    queryClient.setQueryData<Todo[]>(todoKeys.lists(), (old = []) =>
      old.map((t) => (t.id === input.id ? { ...t, done: input.done } : t)),
    );
    return { previous };
  },
  onError: (_err, _input, ctx) => {
    if (ctx?.previous) queryClient.setQueryData(todoKeys.lists(), ctx.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: todoKeys.all });
  },
});
```

`cancelQueries` is important: an in-flight list fetch could overwrite your optimistic patch when it arrives. Snapshot **every** key you touch (list and detail).

This is the same idea as RTK Query’s `onQueryStarted` + `undo` (Redux Lesson 25). Use it for toggles and renames, not for irreversible money movement.

**Tip:** Always `invalidate` on settle. Optimistic data can drift (another user edited the same row). Invalidation reconciles.

**Try it:** Toggle a todo with the network tab set to “Offline” (or `mutationFn` that throws). Confirm the checkbox snaps back. Then succeed and confirm invalidation.

---

### Lesson 15. `setQueryData` and surgical cache edits

**Takeaway:** `setQueryData` writes a cache entry immediately. Use it when the mutation **returns the new entity** and a refetch would be wasteful. Use `setQueriesData` to patch many keys at once.

**Explain:** Invalidation is simplest. Surgical updates are faster:

```ts
onSuccess: (newPost) => {
  queryClient.setQueryData(postKeys.detail(newPost.id), newPost);
  queryClient.setQueryData<Post[]>(postKeys.lists(), (old = []) => [newPost, ...old]);
},
```

`setQueryData` does not mark the query fresh or stale by itself in a way that replaces a good invalidation policy — pair with a reasonable `staleTime` or still invalidate slowly in the background.

Updater functions must be **immutable**: return a new array/object. The updater receives `undefined` if the key is empty; handle that.

```ts
queryClient.setQueriesData<Post[]>(
  { queryKey: postKeys.lists() },
  (old) => old?.map((p) => (p.id === updated.id ? updated : p)),
);
```

`getQueryData` + `setQueryData` is also how you seed a detail from a list (Lesson 10) without waiting.

**Tip:** If you cannot write a correct updater in two minutes, invalidate instead. Wrong cache patches are worse than one extra GET.

**Try it:** Create a post whose `mutationFn` returns the full `Post`. Append it to the list with `setQueryData` and **do not** invalidate. Confirm the list updates with zero extra GET. Then add a second client (or Devtools Delete) and see why invalidation is still wise.

---

## Advanced query patterns

### Lesson 16. Infinite queries with `useInfiniteQuery`

**Takeaway:** `useInfiniteQuery` stacks pages in `data.pages`. You provide `getNextPageParam` so Query knows the next cursor. `fetchNextPage` loads more; `hasNextPage` drives the button.

**Explain:** One key holds an array of pages, not a flat list you mutate yourself.

```tsx
function InfinitePosts() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useInfiniteQuery({
    queryKey: ["posts", "infinite"],
    queryFn: ({ pageParam }) => fetchPostsPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
  });

  if (isPending) return <p>Loading…</p>;

  const posts = data.pages.flatMap((p) => p.items);

  return (
    <div>
      <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>
      <button
        type="button"
        disabled={!hasNextPage || isFetchingNextPage}
        onClick={() => fetchNextPage()}
      >
        {isFetchingNextPage ? "Loading more…" : hasNextPage ? "More" : "End"}
      </button>
    </div>
  );
}
```

v5 requires `initialPageParam`. Cursor APIs use `getNextPageParam: (last) => last.nextCursor`. Returning `undefined` means no more pages.

Invalidating the infinite key refetches **from the first page** by default (`maxPages` and `getPreviousPageParam` exist for bidirectional lists). After a create, invalidate and let the user see the new item at the top of page 1.

**Tip:** Flatten `pages` in the render, not in `queryFn`. Keep each page the shape the server returned so `getNextPageParam` stays simple.

**Try it:** Implement page-number infinite scroll with a “More” button. Confirm Devtools shows one query with multiple pages. Invalidate and watch pages reset.

---

### Lesson 17. Parallel queries and `useQueries`

**Takeaway:** Several `useQuery` hooks in one component run in **parallel**. `useQueries` is for a **dynamic** list of keys (one query per id in an array).

**Explain:** Hooks are fixed at render time. Three known queries:

```tsx
const user = useQuery({ queryKey: ["users", id], queryFn: () => fetchUser(id) });
const posts = useQuery({ queryKey: ["posts", { author: id }], queryFn: () => fetchPosts(id) });
const stats = useQuery({ queryKey: ["stats", id], queryFn: () => fetchStats(id) });
```

When the count comes from data (`selectedIds`), use `useQueries`:

```tsx
const results = useQueries({
  queries: selectedIds.map((postId) => ({
    queryKey: postKeys.detail(postId),
    queryFn: () => fetchPost(postId),
    staleTime: 60_000,
  })),
});

const isPending = results.some((r) => r.isPending);
const posts = results.flatMap((r) => (r.data ? [r.data] : []));
```

This still **dedupes** with any other component that requested the same `postId`. Prefer `useQueries` over a loop of custom hook calls that would break the rules of hooks.

`combine` (v5) can merge results so you do not rerender on every individual query if you only need an aggregate.

**Tip:** If the server can return the batch in one HTTP call (`/posts?ids=1,2,3`), one query is faster than N. Use `useQueries` when you already have per-id endpoints and mixed freshness.

**Try it:** Select three post ids in checkboxes. Load them with `useQueries`. Uncheck one and confirm that query can garbage-collect while the others stay.

---

### Lesson 18. Prefetching so the next screen is already warm

**Takeaway:** `queryClient.prefetchQuery` runs a query and seeds the cache. On hover or on the server, prefetch the **next** page’s key so `useQuery` there hits memory first.

**Explain:** Prefetch uses the same key and `queryFn` as the destination screen. If the data is still fresh, prefetch is a no-op.

```tsx
function PostLink({ post }: { post: Post }) {
  const queryClient = useQueryClient();

  return (
    <a
      href={`/posts/${post.id}`}
      onMouseEnter={() => {
        queryClient.prefetchQuery({
          queryKey: postKeys.detail(post.id),
          queryFn: () => fetchPost(post.id),
          staleTime: 60_000,
        });
      }}
    >
      {post.title}
    </a>
  );
}
```

`prefetchInfiniteQuery` exists for infinite lists. `ensureQueryData` returns cached data or fetches — useful in route loaders.

On the server, prefetch is how you avoid a client waterfalls (Lesson 23). In the browser, prefetch on hover, on viewport intersection, or right after a list succeeds (`onSuccess` of the list query).

Do not prefetch the entire catalog on app boot. Prefetch what the user is **about** to see.

**Tip:** Use the **same key factory** as the page. A prefetch with `["post", id]` and a page with `["posts", id]` is two caches and a wasted request.

**Try it:** Prefetch a detail on hover. Throttle the CPU in DevTools, click immediately after hover, and confirm the detail renders without a spinner. Click without hover and note the pending state.

---

### Lesson 19. `select`, structural sharing, and `notifyOnChangeProps`

**Takeaway:** `select` derives a slice of the cached data so the component re-renders only when **that** slice changes. Query already uses structural sharing so unchanged JSON keeps the same references.

**Explain:** A list query might return 200 posts. A badge only needs `data.length`:

```tsx
function OpenCount() {
  const count = useQuery({
    queryKey: postKeys.lists(),
    queryFn: fetchPosts,
    select: (posts) => posts.filter((p) => !p.done).length,
  }).data;

  return <span>{count ?? 0} open</span>;
}
```

`OpenCount` does not re-render when a post **title** changes if the open count stayed the same (the selected number is `===`).

Structural sharing: if a refetch returns the same list with one object changed, other objects keep their references. Child `memo` components that receive a post object can skip render.

`notifyOnChangeProps: ["data", "error"]` (or `"all"`) limits which result-field changes trigger a render. The default is already tuned; reach for this when a profiler says a leaf is noisy.

**Tip:** Put `select` on the hook that needs the slice. Do not `select` into a new object without a stable comparison — `{ items, extra }` is a new object every time and defeats the point.

**Try it:** Two components subscribe to `["posts"]`: one `select`s `length`, one renders titles. Patch one title via `setQueryData`. Confirm the length badge does not re-render (React profiler or a `console.count` in the badge).

---

### Lesson 20. Cancellation and `AbortSignal`

**Takeaway:** Every `queryFn` receives `{ signal }`. Pass it to `fetch` so when the query is cancelled (key change, unmount, `cancelQueries`) the in-flight HTTP request aborts.

**Explain:** Changing `["posts", { page: 1 }]` to `page: 2` cancels the first query’s observers. Without `signal`, the old response can still arrive and you waste bandwidth. With `signal`, `fetch` throws an `AbortError` that Query ignores (it is not shown as `isError`).

```tsx
useQuery({
  queryKey: ["posts", { page }],
  queryFn: async ({ signal }) => {
    const res = await fetch(`/api/posts?page=${page}`, { signal });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  },
});
```

Axios: `axios.get(url, { signal })`. GraphQL clients have their own abort integration.

Optimistic updates call `cancelQueries` so a late GET does not overwrite a PATCH you just applied (Lesson 14). That cancellation uses the same signal path.

Do not treat abort as a user-facing error. Check `error.name === "AbortError"` only if you wrap fetch yourself and rethrow — usually you should let Query swallow it.

**Tip:** If you use a wrapper `api.get(url)` , thread `signal` through the wrapper. A hidden fetch without signal cannot be cancelled.

**Try it:** Log inside `queryFn` when it starts and in a `finally`. Change the page key quickly. Confirm an abort and that `isError` stays false.

---

## Next.js SSR & tooling

### Lesson 21. SSR and hydration with TanStack Query

**Takeaway:** On the server you prefetch into a **per-request** `QueryClient`, **dehydrate** the cache into JSON, and on the client **hydrate** so `useQuery` reuses that data instead of flashing a spinner and refetching.

**Explain:** SSR without hydration: the server renders pending fallbacks (or nothing), the HTML arrives, the client fetches — users see a loading state you already paid for on the server. Hydration means the HTML includes the data and the client cache is pre-filled.

```text
Server request
  new QueryClient()
  await prefetchQuery(...)
  dehydrate(client)  →  JSON in the RSC payload
  render HTML that already has data
Client
  HydrationBoundary state={dehydrated}
  useQuery → cache hit (if staleTime allows)
```

v5’s React API is `HydrationBoundary` (not the old `Hydrate`). The dehydrated state is a serializable snapshot of successful queries. Errors and in-flight queries have rules — prefetch until settled before dehydrating.

`staleTime` on the prefetched query should be **greater than 0** (e.g. 60 seconds) or the client will immediately refetch after hydrate, defeating SSR.

Next lesson wires this to the App Router.

**Tip:** Never export a global `queryClient` from a server module. Per-request isolation is a security boundary, not just a performance trick.

**Try it:** Mentally trace a `/posts` page: where is the client created, when does prefetch run, what JSON crosses the wire, which component hydrates?

---

### Lesson 22. `dehydrate` and `HydrationBoundary` in the App Router

**Takeaway:** A Server Component creates a client, prefetches, and passes `dehydrate(queryClient)` into a Client `HydrationBoundary`. Client children call `useQuery` with the **same keys**.

**Explain:**

```tsx
// app/posts/page.tsx — Server Component
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { PostList } from "./post-list";
import { fetchPosts } from "./api";
import { postKeys } from "./keys";

export default async function PostsPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: postKeys.lists(),
    queryFn: fetchPosts,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostList />
    </HydrationBoundary>
  );
}
```

```tsx
// post-list.tsx — Client Component
"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPosts } from "./api";
import { postKeys } from "./keys";

export function PostList() {
  const { data } = useQuery({
    queryKey: postKeys.lists(),
    queryFn: fetchPosts,
    staleTime: 60_000,
  });
  return <ul>{data?.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

The browser still needs `QueryClientProvider` (Lesson 4) **above** the boundary. `HydrationBoundary` fills that client’s cache; it does not replace the provider.

`fetchPosts` must be safe on server and client (absolute URL or a server-only module imported only from the page). Do not pass functions across the server/client boundary — only the dehydrated state.

**Tip:** Prefetch in the page or layout that knows the params. Do not prefetch in a client `useEffect` and call that “SSR.”

**Try it:** Implement the two files above against `/api/posts`. Disable JavaScript in the browser and confirm the list HTML is present. Re-enable JS and confirm no immediate refetch (thanks to `staleTime`).

---

### Lesson 23. Prefetch on the server, hydrate on the client

**Takeaway:** Server prefetch should use the **same** `queryKey` + `queryFn` as the client hook. Prefetch details you will need for the first paint; leave below-the-fold queries to the client.

**Explain:** Dynamic routes:

```tsx
// app/posts/[id]/page.tsx
export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: postKeys.detail(id),
      queryFn: () => fetchPost(id),
    }),
    queryClient.prefetchQuery({
      queryKey: postKeys.comments(id),
      queryFn: () => fetchComments(id),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostDetail id={id} />
      <CommentList postId={id} />
    </HydrationBoundary>
  );
}
```

`Promise.all` avoids a server-side waterfall. If comments are below the fold, skip that prefetch and let `useQuery` run after hydrate — smaller HTML, slower comments. That is a product choice.

`prefetchQuery` swallows errors by default (the client will retry). If the post is 404, throw in the Server Component (`notFound()`) **before** hydrate so you do not send an empty shell.

**Tip:** Share `queryFn` modules between server and client only when they do not secretly import server-only secrets. For authenticated fetches, use cookies on the server and the same cookie-aware `queryFn` on the client.

**Try it:** Prefetch detail + comments in parallel. Remove comments prefetch and measure HTML size vs time-to-comments. Pick a policy and write it as a comment in the page.

---

### Lesson 24. Per-request `QueryClient` and streaming pitfalls

**Takeaway:** Create a new `QueryClient` inside the Server Component (or a `cache()`d factory per request), not at module scope. With streaming/Suspense, dehydrate only queries that have **finished**, or use the streaming hydration helpers so partial cache is sent as chunks resolve.

**Explain:** Module-level singleton on the server:

```ts
// ❌ Leaks cache across users and requests
export const queryClient = new QueryClient();
```

Per-request:

```ts
import { cache } from "react";
import { QueryClient } from "@tanstack/react-query";

export const getQueryClient = cache(() => new QueryClient());
```

`cache()` in React dedupes for the lifetime of one server request, so two server components can `prefetch` into the **same** request client, then one of them dehydrates.

Streaming: if you `dehydrate` before a prefetch finishes, the client misses that data. Either `await` all prefetches in the page, or use TanStack Query’s streaming / `hydrate` patterns documented for RSC so each chunk carries its dehydrated queries.

Client provider vs server client: the browser `QueryClient` is long-lived; the server one is thrown away after the request. Hydration **copies** data into the browser client. After that, `staleTime` and refetch rules apply as in a SPA.

**Tip:** If you see another user’s name in a “static” page, you used a shared server cache. Fix the client lifetime first, then check `fetch` cache headers.

**Try it:** Log `queryClient` identity from two Server Components on the same page with and without `cache()`. Confirm they match only when `cache()` wraps the factory.

---

### Lesson 25. React Query Devtools

**Takeaway:** Devtools show every query and mutation: key, status, stale vs fresh, observers, data, and actions (refetch, invalidate, reset). Install them in development and learn to read the panel before you add `console.log`.

**Explain:**

```tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

The floating button lists queries. A green/fresh vs stale indicator maps to Lesson 5. Observer count maps to “who is subscribed.” If observer count is 0, `gcTime` is ticking (Lesson 6).

You can trigger refetch or delete a query to simulate eviction. Mutations appear with their variables and status — useful when `onMutate` rollback is hard to see in the UI.

Do not ship Devtools in production bundles if you are sensitive to bundle size; the package is tree-shakeable when you import it only in `process.env.NODE_ENV === "development"`.

**Tip:** When a “bug” is stale UI, open Devtools before you change code. If the cache already has the new data, the bug is in the component (`select`, a leftover `useState`, or a wrong key). If the cache is old, the bug is invalidation.

**Try it:** Mount a list and a detail. Watch observer counts as you navigate. Invalidate from the panel and watch the UI catch up without a code change.

---

### Lesson 26. Persistence and an offline-friendly cache

**Takeaway:** `@tanstack/query-persist-client-core` (and the React persist client) writes the cache to `localStorage` or IndexedDB so a reload can show last-known data while a refetch runs. It is optional and must not persist secrets carelessly.

**Explain:** Persistence is not a database. It is a snapshot of query state for UX:

```tsx
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
});

<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{ persister, maxAge: 24 * 60 * 60 * 1000 }}
>
  {children}
</PersistQueryClientProvider>
```

`maxAge` drops persisted entries that are too old. `buster` (a string) wipes persistence when you change key shapes between deploys.

Do not persist auth tokens or PII you would not store in `localStorage`. Prefer persisting public catalogs, not “my inbox.”

Offline: queries pause when there is no network (`networkMode`). Mutations can be paused and resumed (`pausedMutations`). Persistence plus pause gives a primitive offline queue — enough for drafts, not enough for a conflict-free offline editor.

**Tip:** If persisted data looks “stuck” after a schema change, bump `buster` or bump your key factory version (`["posts", "v2"]`).

**Try it:** Persist a posts list, reload the app offline, and confirm the list paints from storage. Go online and confirm a refetch.

---

### Lesson 27. Global error handling and Error Boundaries

**Takeaway:** Query errors default to the hook (`isError`). You can also send them to an Error Boundary with `throwOnError`, and handle mutation failures globally with `QueryCache` / `MutationCache` callbacks.

**Explain:** Per-query UI is right for “this list failed.” Global toasts are right for unexpected mutations:

```ts
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.toast === false) return;
      toast.error(error.message);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(error.message);
    },
  }),
  defaultOptions: {
    queries: {
      throwOnError: (error) => error instanceof UnexpectedServerError,
    },
  },
});
```

`meta` on a query lets you opt out of toasts for queries that already render `role="alert"`.

Error Boundaries catch render-time throws. `throwOnError: true` rethrows the query error during render so the boundary can show a fallback. Reset the boundary and `queryClient.resetQueries` when the user clicks Retry.

Do not throw on every 404 — the page should render a not-found state, not crash the layout.

**Tip:** Distinguish **expected** domain errors (validation, 404) from **unexpected** ones (500, TypeError). Only the latter belong in a boundary or a global toast.

**Try it:** Add a mutation that throws. Show a toast from `MutationCache.onError`. Then set `throwOnError` on a query and wrap it in a boundary with a Retry button that calls `resetQueries`.

---

### Lesson 28. Testing queries and a production checklist

**Takeaway:** Tests wrap components in a fresh `QueryClient` with `retry: false`. Mock the network with MSW. In production, set explicit `staleTime`, never share a server client, and keep keys stable.

**Explain:** Test helper:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";

export function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return {
    client,
    ...render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>),
  };
}
```

Use `await screen.findByText` for success UI. Use MSW handlers (Jest learning track) so you do not mock `fetch` in every file. For hook-only tests, `renderHook` + the same provider works.

**Production checklist**

- One browser `QueryClient`; per-request server clients.
- Query key factories; ids and filters inside the key.
- App-wide `staleTime` > 0 unless the screen must be live.
- `queryFn` throws on HTTP errors; `signal` passed to `fetch`.
- Mutations invalidate (or surgically update) the right prefix.
- Optimistic updates snapshot + rollback + `onSettled` invalidate.
- SSR: prefetch → dehydrate → `HydrationBoundary` → matching client keys.
- Devtools on in development; no secrets in persisted cache.
- Tests: new client, `retry: false`, MSW.

Compare with Redux/RTK Query when the data is already in a Redux app — pick **one** cache per resource. Interview Q&A for this topic lives at [`/notes/react-query`](/notes/react-query).

**Tip:** If a test flakes, it is usually leftover cache or a real retry. `gcTime: 0` and `retry: false` fix the first two.

**Try it:** Write an RTL test for `PostList` with MSW returning two posts. Then add a mutation test that asserts `invalidateQueries` caused a second GET (MSW request count).
