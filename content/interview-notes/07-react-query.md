# React Query (TanStack Query) Interview Notes

Full syllabus: useQuery, useMutation, cache, staleTime, invalidation, infinite queries, vs RTK Query, and testing. Each question includes a **Short definition** and a spoken **Answer**.

**Related:** [Redux & RTK notes](./06-redux-redux-toolkit.md) — RTK Query bridge (Q17–Q21 there, Q30–Q31 here).

---

## Fundamentals & Setup

### Q1. What is TanStack Query (React Query)? [must-know]

**Short definition:** A server-state library for React that fetches, caches, syncs, and updates async data via hooks like `useQuery`.

**Answer:** TanStack Query is a server-state management library for React. It handles fetching, caching, synchronizing, and updating async data from APIs without manual `useEffect` boilerplate. It separates server state from client/UI state like modal open or form drafts. Hooks like `useQuery`, `useMutation`, and `useInfiniteQuery` provide consistent loading, error, and refetch semantics across the app. The cache is keyed by query keys and managed by a central `QueryClient`. Interviewers use it to test whether you understand caching and sync, not just fetch calls.

**Follow-up:** Why "server state" not "API state"?

---

### Q2. Why is server state different from client state? [must-know]

**Short definition:** Server state is async, shared, and can go stale; client state is synchronous and owned by the UI.

**Answer:** Server state is asynchronous, shared across users and components, can become stale without your knowledge, and is often paginated or normalized on the backend. Client state—modal open, selected tab, form input—is synchronous and owned entirely by the UI until you submit it. Caching, background refetch, deduplication, and invalidation are server-state concerns React Query handles out of the box. Putting API lists only in `useState` duplicates requests, shows stale data, and loses loading/error consistency. Redux slices for server data often reinvent what React Query already optimizes.

**Follow-up:** What breaks if you put API data only in useState?

---

### Q3. What are the core concepts of React Query? [must-know]

**Short definition:** Query (read), Mutation (write), QueryClient (cache), query keys, staleTime, gcTime, and invalidation.

**Answer:** A **query** is an async read cached by key; a **mutation** is an async write with side effects. **QueryClient** is the cache manager; **query keys** uniquely identify cache entries and must include all variables the fetch depends on. **staleTime** controls how long data is considered fresh; **gcTime** (formerly `cacheTime`) controls how long unused data stays in memory after unmount. **Invalidation** marks queries stale and triggers refetch for active observers. Together these replace fetch-in-`useEffect` patterns with declarative cache lifecycle rules.

**Follow-up:** Where does QueryClient live?

---

### Q4. How do you set up React Query in a React app? [must-know]

**Short definition:** Create one `QueryClient`, wrap the app in `QueryClientProvider`, optionally add Devtools in development.

**Answer:** Create `const queryClient = new QueryClient()` once at module scope in client apps—or per request on the server for SSR. Wrap the app in `<QueryClientProvider client={queryClient}>` above any component using hooks. Optionally add `<ReactQueryDevtools initialIsOpen={false} />` in development to inspect cache entries and refetch timing. In Next.js App Router, the provider must be a Client Component because hooks cannot run in Server Components. Pass `defaultOptions` on construction to set global staleTime, retry, and refetch behavior once instead of per hook.

```tsx
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000 } },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
```

**Follow-up:** Singleton QueryClient per app vs per request?

---

## useQuery, Keys & Cache Lifetime

### Q5. Explain `useQuery` basics. [must-know]

**Short definition:** Declarative hook that runs `queryFn` on mount, caches by `queryKey`, and exposes data plus status flags.

**Answer:** `useQuery({ queryKey: ['todos'], queryFn: fetchTodos })` returns `{ data, isPending, isError, error, isFetching, refetch, status }` in TanStack Query v5. It automatically runs on mount when enabled, caches the result, deduplicates concurrent requests with the same key, and refetches on window focus by default when data is stale. Cached data returns synchronously on remount while background refetch may run. You declare what data you need; the library handles request timing and cache consistency. Replace manual `useEffect` + `useState` fetch patterns with this hook for reads.

**Follow-up:** `isLoading` vs `isFetching`?

---

### Q6. What is the difference between `isLoading` and `isFetching`? [must-know]

**Short definition:** `isLoading` means first fetch with no cached data; `isFetching` means any request in flight including background refetch.

**Answer:** In v5, `isPending && isFetching` corresponds to what v4 called `isLoading`—true only on first fetch when no cached data exists yet. `isFetching` is true whenever a request is in flight, including background refetches while cached data is already shown on screen. Show a full skeleton on initial load (`isPending`); show a subtle spinner or stale indicator on `isFetching` during refresh. Users keep seeing old data during background refetch unless you choose otherwise—this is intentional stale-while-revalidate UX. Interviewers test whether you will flash empty states on every refocus incorrectly.

**Follow-up:** `isPending` in TanStack Query v5?

---

### Q7. What are query keys and why do they matter? [must-know]

**Short definition:** Serializable arrays that uniquely identify cached data and drive deduplication and invalidation.

**Answer:** Query keys are arrays like `['todos']`, `['todo', id]`, or `['todos', { status: 'done' }]`. They must be serializable, stable, and include every variable the `queryFn` depends on—filters, page, sort order, user id. Keys drive caching, invalidation prefix matching, and deduplication of in-flight requests. Unstable keys—inline objects recreated each render without memoization—fragment the cache and cause redundant fetches. Design keys from general to specific: `['users', userId, 'posts']`.

**Follow-up:** Object key order sensitivity?

---

### Q8. How does query key hierarchy work for invalidation? [must-know]

**Short definition:** Invalidation matches by key prefix so parent keys invalidate all nested variants.

**Answer:** Keys are matched by prefix unless `exact: true` is set. `invalidateQueries({ queryKey: ['todos'] })` invalidates `['todos']`, `['todos', 1]`, and `['todos', { filter: 'active' }]`. Finer keys allow surgical refetch—invalidate one detail without wiping every list. Design hierarchy from general to specific so one mutation can refresh all related views. Use query key factories to avoid typos and document hierarchy in one module per feature.

**Follow-up:** `exact: true` option?

---

### Q9. What is `staleTime`? [must-know]

**Short definition:** Duration in ms that fetched data is considered fresh and won't auto-refetch on mount/focus.

**Answer:** `staleTime` is the duration in milliseconds that data is considered fresh after a successful fetch. Default is `0`, meaning data is stale immediately and triggers refetch on mount and window focus. Set `staleTime: 5 * 60 * 1000` for five minutes where data changes infrequently—dashboards, user profile, config. Fresh data is served from cache synchronously with no loading state. Tune per query: real-time chat needs low staleTime; reference data can use minutes or hours.

**Follow-up:** staleTime vs gcTime?

---

### Q10. What is `gcTime` (formerly `cacheTime`)? [must-know]

**Short definition:** How long unused query data stays in memory after the last observer unmounts before garbage collection.

**Answer:** `gcTime` controls how long inactive query data—no subscribed components—remains in cache before garbage collection. Default is five minutes. It differs from staleTime: data can be stale yet still cached for instant display while refetching in the background. Set longer gcTime for offline-friendly UX or back-navigation to list pages. Set `gcTime: 0` to drop cache immediately on unmount—rare, but useful for sensitive data you never want retained.

**Follow-up:** What happens when gcTime is 0?

---

### Q11. staleTime vs gcTime — explain with an example. [must-know]

**Short definition:** staleTime controls freshness; gcTime controls how long inactive cached data survives in memory.

**Answer:** User views todos with `staleTime: 30s` and `gcTime: 5min`. Leaves and returns within 30 seconds—data is fresh, no refetch on remount. Returns after two minutes—data is stale, cached todos show instantly plus background refetch updates the UI. Returns after ten minutes away—cache was garbage-collected, full loading state on remount. Configure dashboards with higher staleTime and gcTime; configure sensitive checkout data with lower gcTime and explicit cache clear on logout. Saying both numbers aloud in interviews shows you understand the cache lifecycle.

**Follow-up:** Configure for dashboard vs real-time chat?

---

## Mutations & Optimistic Updates

### Q12. What is `useMutation`? [must-know]

**Short definition:** Hook for create/update/delete writes with `mutationFn` and lifecycle callbacks—not cached like queries.

**Answer:** `useMutation` handles create, update, and delete operations: `useMutation({ mutationFn: createTodo, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }) })`. It returns `{ mutate, mutateAsync, isPending, isError, reset }`. Mutations do not cache results like queries—they orchestrate side effects and cache updates on success or error. Typical pattern: mutate on form submit, invalidate or `setQueryData` on success, show toast on error. Multiple components can share one mutation hook exported from a feature module.

**Follow-up:** `mutate` vs `mutateAsync`?

---

### Q13. `mutate` vs `mutateAsync`? [must-know]

**Short definition:** `mutate` is fire-and-forget with callbacks; `mutateAsync` returns a Promise for async/await flows.

**Answer:** `mutate(variables, { onSuccess, onError })` is fire-and-forget—callbacks live in the second argument or hook options. `mutateAsync(variables)` returns a Promise you can await in async handlers with try/catch for sequential flows like "create then navigate." Prefer `mutateAsync` when the next step depends on mutation success or you need unified error handling in one async function. `mutate` is fine for simple button clicks where callbacks suffice. Both trigger the same `mutationFn` and lifecycle hooks defined on the hook.

**Follow-up:** Can mutations have optimistic updates?

---

### Q14. How do optimistic updates work in React Query? [must-know]

**Short definition:** Update cache before the server responds, snapshot for rollback, invalidate on settle.

**Answer:** Optimistic updates make the UI feel instant by writing to the cache in `onMutate` before the network returns. Cancel outgoing refetches for the affected query so they do not overwrite your optimistic data. Snapshot previous cache with `getQueryData`, apply optimistic value with `setQueryData`, and return snapshot from `onMutate` as context. On error, restore snapshot in `onError`; on settle (success or failure), call `invalidateQueries` in `onSettled` to reconcile with server truth. Handle overlapping mutations by canceling queries and always rolling back from the latest snapshot.

**Follow-up:** Race condition if two mutations overlap?

---

### Q15. Full optimistic update walkthrough — toggle todo complete

**Short definition:** End-to-end pattern: cancel, snapshot, optimistic `setQueryData`, rollback on error, invalidate on settle.

**Answer:** This walkthrough toggles a todo's `completed` flag in a list cache while the PATCH request is in flight. `onMutate` receives the todo id, cancels `['todos']` queries, saves the previous list, and maps the toggled item optimistically. `onError` restores the snapshot if the server rejects. `onSettled` always invalidates so ordering, timestamps, and server-only fields sync correctly. The component calls `mutate(id)` and keeps rendering from `useQuery`—no local duplicate state. This is the pattern interviewers ask you to whiteboard because it hits every cache API.

```tsx
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

type Todo = { id: string; title: string; completed: boolean };

function fetchTodos(): Promise<Todo[]> {
  return fetch("/api/todos").then((r) => r.json());
}

function patchTodo(id: string, completed: boolean): Promise<Todo> {
  return fetch(`/api/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  }).then((r) => r.json());
}

export function useTodos() {
  return useQuery({ queryKey: ["todos"], queryFn: fetchTodos });
}

export function useToggleTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      patchTodo(id, completed),

    onMutate: async ({ id, completed }) => {
      // 1. Prevent in-flight refetches from clobbering optimistic data
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // 2. Snapshot for rollback
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

      // 3. Optimistically update list cache
      queryClient.setQueryData<Todo[]>(["todos"], (old) =>
        old?.map((todo) =>
          todo.id === id ? { ...todo, completed } : todo
        ) ?? []
      );

      // 4. Pass snapshot to onError via context
      return { previousTodos };
    },

    onError: (_err, _vars, context) => {
      // 5. Roll back on failure
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos);
      }
    },

    onSettled: () => {
      // 6. Reconcile with server (success OR error)
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

// Usage in component:
// const { data: todos } = useTodos();
// const toggle = useToggleTodo();
// toggle.mutate({ id: todo.id, completed: !todo.completed });
```

**Common mistake:** Optimistic update without `cancelQueries`, then refetch overwrites UI mid-mutation.

---

## Invalidation & Cache Updates

### Q16. What is query invalidation? [must-know]

**Short definition:** Marks matching queries stale and refetches active ones—standard post-mutation sync pattern.

**Answer:** `queryClient.invalidateQueries({ queryKey: ['todos'] })` marks matching queries stale and refetches those with active observers by default. Call after mutations to sync UI with server when you do not know exact cache shape from the response. Pass `refetchType: 'active' | 'inactive' | 'all' | 'none'` to control which observers refetch immediately. Invalidation respects staleTime on next mount for inactive queries unless you force refetch. It is the safe default when multiple queries might be affected by one write.

**Follow-up:** `invalidateQueries` vs `refetchQueries`?

---

### Q17. `invalidateQueries` vs `refetchQueries`? [must-know]

**Short definition:** Invalidate marks stale then refetches active; refetch immediately hits the network regardless.

**Answer:** **invalidateQueries** marks queries stale and refetches active ones, respecting broader cache rules for inactive entries. **refetchQueries** immediately fetches matching queries regardless of stale state—use for manual "Refresh" buttons. Use invalidate after mutations as the standard pattern when server is source of truth. Use refetch when user explicitly requests fresh data or you implement polling substitutes. Both accept query key filters and predicates for advanced targeting.

**Follow-up:** When to use `setQueryData` instead?

---

### Q18. When should you use `setQueryData` vs invalidation? [must-know]

**Short definition:** `setQueryData` when you know exact cache update; invalidation when server shape is unpredictable.

**Answer:** Use `setQueryData` when the mutation response contains exactly what the cache should show—instant, no extra GET request. Use invalidation when the server transforms data unpredictably, computes fields, or multiple queries need refresh. Often combine: `setQueryData` for immediate UI on the edited list item plus `invalidateQueries` on related detail or stats queries. Updating one item inside a list means mapping the array in `setQueryData`, not replacing the whole cache blindly. If unsure, invalidate—correctness beats saving one request.

**Follow-up:** Updating item in a list cache?

---

### Q19. What is `placeholderData` / `initialData`? [must-know]

**Short definition:** `initialData` is real cached seed data; `placeholderData` is temporary until fetch completes.

**Answer:** **initialData** is treated as real cached data—it affects staleTime timing and persists in cache until replaced by fetch. **placeholderData** is temporary until fetch completes and is not persisted as successful fetch result. Use initialData from SSR dehydration, prefetch, or parent query data already in cache. Use placeholderData to show previous list while loading detail after navigation. Confusing the two causes wrong staleTime behavior and missing refetches—read the docs carefully for your version.

**Follow-up:** `keepPreviousData` / `placeholderData: keepPreviousData`?

---

### Q20. What is `placeholderData: keepPreviousData` (v5 pattern)?

**Short definition:** When query key changes (pagination), show previous page data while fetching the next page.

**Answer:** When query key changes—pagination, filter, sort—show previous page data while fetching the new page to avoid loading flicker. In v4, `keepPreviousData: true` was a boolean option; in v5, use `placeholderData: (previousData) => previousData` or the exported `keepPreviousData` helper from the library. Smooth pagination UX depends on including page/filter in the key while preserving prior data as placeholder. Reset to page 1 when filters change by changing the key prefix. Interviewers love this for "how would you implement pagination?"

**Follow-up:** Pagination state in query key?

---

## Infinite Queries, Prefetch & SSR

### Q21. How do infinite queries work? [must-know]

**Short definition:** `useInfiniteQuery` pages data with `initialPageParam`, `getNextPageParam`, and flattened `data.pages`.

**Answer:** `useInfiniteQuery({ queryKey, queryFn: ({ pageParam }) => fetchPage(pageParam), initialPageParam: 0, getNextPageParam: (lastPage) => lastPage.nextCursor })` accumulates pages in cache. Returns `data.pages`, `fetchNextPage`, `hasNextPage`, `isFetchingNextPage`, and `isFetching`. Cache key includes all pages for that query key until invalidated or reset. `getNextPageParam` returns `undefined` when no more pages exist. Flatten for render: `data.pages.flatMap((p) => p.items)`.

**Follow-up:** Bidirectional infinite scroll?

---

### Q22. Implement infinite scroll interview pattern. [must-know]

**Short definition:** Intersection Observer on a sentinel calls `fetchNextPage` when `hasNextPage && !isFetchingNextPage`.

**Answer:** Attach Intersection Observer to a sentinel element at the list bottom; on intersect call `fetchNextPage()` if `hasNextPage && !isFetchingNextPage`. Flatten pages for render: `data.pages.flatMap((p) => p.items)`. Include filter params in query key so filter change resets pagination and cache. Show `isFetchingNextPage` spinner at bottom, not full-page loader. Optionally set `maxPages` to limit memory for very long feeds.

```tsx
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useInfiniteQuery({
    queryKey: ["posts", filter],
    queryFn: ({ pageParam }) => fetchPosts({ cursor: pageParam, filter }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

const items = data?.pages.flatMap((p) => p.items) ?? [];
```

**Follow-up:** `maxPages` limit?

---

### Q23. What is query prefetching? [must-know]

**Short definition:** Load data into cache before the component needs it—hover, route transition, or SSR.

**Answer:** `queryClient.prefetchQuery({ queryKey, queryFn })` loads data into cache before the component mounts or navigates. Use on link hover, route transition start, or server render so the next screen hits cache instantly. Component `useQuery` with the same key gets synchronous cache hit on mount if prefetch completed. Prefetch does not throw to caller by default on error—handle errors in the consuming query. Measure impact—prefetching every link can waste bandwidth.

**Follow-up:** Prefetch in Next.js Server Component?

---

### Q24. How does React Query integrate with SSR? [must-know]

**Short definition:** Prefetch on server, dehydrate cache, pass to client, hydrate in `HydrationBoundary`—new QueryClient per request.

**Answer:** Prefetch on server with a fresh `QueryClient`, dehydrate cache via `dehydrate(queryClient)`, embed serialized state in HTML, and hydrate on client with `HydrationBoundary` and `hydrate()`. Ensures server HTML matches client first paint without fetch mismatch waterfalls. **Never share one QueryClient singleton across SSR requests**—that leaks user data between requests. Create `new QueryClient()` per request on server; singleton is fine on client SPA. Next.js examples use `@tanstack/react-query-next-experimental` or manual dehydration patterns.

**Follow-up:** `@tanstack/react-query-next-experimental`?

---

### Q25. What is the enabled option? [must-know]

**Short definition:** `enabled: false` prevents the query from running until a condition like `!!userId` is true.

**Answer:** `enabled: !!userId` prevents query from running until condition is true—avoids `/users/undefined` requests. Useful for dependent queries: fetch details only when parent id exists. Replaces manual `useEffect` guards and reduces error noise on initial render. Can be dynamic: enable search query only when debounced term length exceeds two characters. Disabled queries are idle, not error—they simply do not fetch until enabled flips true.

**Follow-up:** Chaining dependent queries?

---

### Q26. How do dependent queries work? [must-know]

**Short definition:** Query B uses Query A's data in its key and `queryFn`, gated with `enabled: !!dependency`.

**Answer:** Query B uses data from Query A declaratively: fetch user, then projects with `enabled: !!user?.id` and `queryKey: ['projects', user.id]`. Clean alternative to nested `useEffect` chains that are hard to cancel and test. If dependency becomes undefined, B stops and may retain previous data depending on gcTime—handle UI accordingly. For graphs of dependencies, consider one server endpoint or `useQueries` for parallel known ids. Dependent queries are a top-five React Query interview pattern.

**Follow-up:** `useQueries` for parallel dynamic fetches?

---

### Q27. What is `useQueries`?

**Short definition:** Run multiple queries in parallel from a dynamic list of query option objects.

**Answer:** `useQueries({ queries: userIds.map(id => ({ queryKey: ['user', id], queryFn: () => fetchUser(id) })) })` returns an array of query results. Use when you have a dynamic set of ids—not one batch endpoint—and need per-id loading and error states. Combine results in render or derive aggregate loading with `.some(r => r.isPending)`. Contrast with one query returning all users—fewer requests but coarser cache granularity. Watch for N+1 if the id list grows large; batch APIs may win.

**Follow-up:** vs single query returning all users?

---

## Defaults, Comparisons & Cache

### Q28. What are default refetch triggers? [must-know]

**Short definition:** By default refetch on window focus, reconnect, and mount when data is stale.

**Answer:** By default React Query refetches on window refocus, network reconnect, and component mount if data is stale. Disable globally or per query with `refetchOnWindowFocus: false` when it causes disruptive full-page refresh behavior. Dashboards with heavy queries often tune this; checkout flows may disable focus refetch during payment. `refetchOnMount: 'always' | true | false` fine-tunes remount behavior. Document global defaults in your QueryClient setup so the team knows baseline behavior.

**Follow-up:** When disable refetchOnWindowFocus?

---

### Q29. How do you configure global defaults? [must-know]

**Short definition:** Pass `defaultOptions` to `QueryClient` for queries and mutations app-wide.

**Answer:** `new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false }, mutations: { retry: 0 } } })` reduces per-hook repetition. Override per query when specific endpoints need different freshness or retry rules. Global mutation retry 0 is common—double-submit on POST is worse than double-read on GET. Export the configured client from one module for tests to reuse the same defaults. Review defaults when upgrading major TanStack Query versions.

**Follow-up:** Retry behavior defaults?

---

### Q30. How does retry logic work? [must-know]

**Short definition:** Queries default to 3 retries with exponential backoff; mutations default to 0 retries.

**Answer:** Queries default to 3 retries with exponential backoff; mutations default to 0 retries to avoid duplicate writes. Customize with `retry: false`, `retry: 1`, or `retry: (failureCount, error) => error.status !== 404`. Do not retry 401/403 blindly—handle auth redirect instead. Network blips benefit from retry; validation 400 errors should not retry. In tests, set `retry: false` globally to fail fast.

**Follow-up:** Retry only on network error?

---

### Q31. React Query vs RTK Query — when to choose which? [must-know]

**Short definition:** React Query if no Redux; RTK Query if already invested in Redux store and DevTools.

**Answer:** **React Query:** no Redux needed, smaller integration surface, excellent standalone DX, framework-agnostic TanStack ecosystem. **RTK Query:** already using Redux, unified DevTools with slices, codegen from OpenAPI in many setups. Both solve server cache; choice depends on existing architecture, not raw feature checklists. Greenfield React apps often pick React Query plus lightweight client state (Zustand, context). Enterprise apps with heavy Redux history often extend RTK Query rather than migrate.

**Follow-up:** Using React Query with Redux?

---

### Q32. Can you use React Query alongside Redux?

**Short definition:** Yes—Redux for client/UI state, React Query for server data; avoid duplicating the same data in both.

**Answer:** Yes—common pattern: Redux for client/UI state (wizard step, filters UI), React Query for server data (lists, details). Avoid duplicating the same API list in both a slice and a query cache. Some teams migrate from RTK Query to React Query while keeping Redux slices for non-server concerns. Coordinate logout: clear both Redux state and `queryClient.clear()`. Interview answer: complementary tools with clear boundaries, not competitors in the same layer.

**Follow-up:** TanStack Query vs SWR?

---

### Q33. React Query vs SWR? [must-know]

**Short definition:** Both cache server data; React Query has richer mutations, infinite queries, and devtools.

**Answer:** Both handle server state caching with similar hooks philosophy. React Query offers richer mutation/invalidation API, infinite queries, granular cache observers, and first-class devtools. SWR is lighter with simpler API from Vercel, great for basic fetch-cache in Next.js-centric apps. React Query preferred for complex apps with mutations, optimistic updates, and cache orchestration across features. Compare bundle size only after measuring your actual import surface—tree-shaking matters.

**Follow-up:** Bundle size comparison?

---

### Q34. What is `select` in useQuery? [must-know]

**Short definition:** Transforms query data before return; component re-renders only when selected slice changes.

**Answer:** `select: (data) => data.items.filter(i => i.done)` transforms data before the component sees it. React Query memoizes select with structural sharing—component re-renders only when selected slice changes referentially. Performance optimization for large query results when child only needs counts or one field. Do not mutate inside select—return new derived data immutably. Contrast with `useMemo` on full data—select integrates with query subscription granularity.

**Follow-up:** select vs useMemo on data?

---

### Q35. What is structural sharing?

**Short definition:** React Query reuses unchanged object references from previous cache when merging fetch results.

**Answer:** React Query compares new fetch result with cached data and reuses unchanged object references at each level of the tree. Unchanged branches keep same reference—helps `React.memo`, `useMemo`, and Redux-like equality checks. Works with `select` for fine-grained subscriptions to nested slices. Expect immutable-style updates from the server merge, not in-place mutation of cached objects. Important when explaining why React Query plays well with React rendering optimizations.

**Follow-up:** Immutable update expectations?

---

### Q36. How do you handle errors globally? [must-know]

**Short definition:** Use QueryClient/MutationCache `onError`, defaultOptions, or Error Boundaries with `throwOnError`.

**Answer:** Configure `QueryCache` and `MutationCache` global `onError` for toast notifications and logging. Per-query `error` return value powers inline UI without throwing. `throwOnError: true` in query options or defaultOptions delegates to nearest Error Boundary for catastrophic failures. Mutations often use inline error plus toast rather than boundaries. Centralize 401 handling to trigger logout once, not per hook.

**Follow-up:** Error boundary vs inline error UI?

---

### Q37. What are QueryCache and MutationCache?

**Short definition:** Global cache instances holding all queries/mutations with subscribe-able lifecycle events.

**Answer:** QueryCache holds all query entries; MutationCache holds mutation observers and state. Subscribe to events like `onSuccess`, `onError`, `onSettled` at cache level for analytics and global UX. Configured via `new QueryClient({ queryCache: new QueryCache({ onError }) })`. Useful for one toast system instead of duplicating `onError` on every mutation. Understand distinction: QueryClient orchestrates; caches store and notify.

**Follow-up:** Clearing all cache on logout?

---

### Q38. How do you reset cache on logout? [must-know]

**Short definition:** Call `queryClient.clear()` on logout so the next user never sees cached private data.

**Answer:** `queryClient.clear()` removes all queries and mutations from memory—call on logout before redirect. Alternatively `removeQueries({ queryKey: ['user'] })` for targeted cleanup. Critical security consideration for shared-browser and kiosk scenarios. Pair with clearing client state in Redux or localStorage tokens. Persist plugins need explicit purge on logout—disk cache survives `clear()` in memory unless you clear storage too.

**Follow-up:** Persist cache to localStorage?

---

### Q39. What is `@tanstack/react-query-persist-client`?

**Short definition:** Persists dehydrated cache to localStorage/AsyncStorage for offline or faster cold starts.

**Answer:** Persists cache to localStorage or AsyncStorage via a persister adapter for offline or faster cold starts. Configure dehydrate/hydrate options and max age for persisted entries. **Whitelist non-sensitive queries only**—never persist auth tokens, PII, or health data without encryption and review. Stale persisted data can flash wrong user content on startup—validate session before showing persisted private queries. Often persist catalog/reference data only.

**Follow-up:** stale persisted data risks?

---

## Testing

### Q40. How do you test React Query hooks? [must-know]

**Short definition:** Test `QueryClient` with `retry: false`, wrap in provider, use MSW and `waitFor`.

**Answer:** Create test `QueryClient` with `{ defaultOptions: { queries: { retry: false } } }` to avoid flaky timeouts. Wrap in `QueryClientProvider`; use `@testing-library/react` `renderHook` with wrapper helper. MSW mocks API; `waitFor` asserts async resolution. Seed cache with `queryClient.setQueryData` for specific scenarios without mocking fetch. Create fresh QueryClient per test to isolate cache pollution.

**Follow-up:** `wrapQueryClient` test utility pattern?

---

### Q41. Example test setup for useQuery. [must-know]

**Short definition:** Reusable wrapper factory with QueryClientProvider and retry disabled for deterministic tests.

**Answer:** Helper factory returns a wrapper component with isolated QueryClient. Use in `renderHook(() => useTodos(), { wrapper: createWrapper() })`. Assert `result.current.isPending` then `waitFor` data presence. Test error by MSW returning 500 and expecting `isError`. Avoid sharing QueryClient across tests—order-dependent failures follow.

```tsx
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}
```

**Follow-up:** Testing loading/error states?

---

### Q42. How do you test mutations and invalidation?

**Short definition:** Trigger mutate, assert UI or spy invalidation; MSW error tests optimistic rollback.

**Answer:** Mock API with MSW; render component; trigger mutate; `await waitFor` UI or cache assertions. Spy `queryClient.invalidateQueries` or inspect cache with `getQueryData` after settle. Test optimistic rollback by MSW returning error on PATCH after optimistic UI updated. Use `mutateAsync` in tests when you need to await completion before assertions. Flush microtasks with `waitFor`, not arbitrary `setTimeout`.

**Follow-up:** flushPromises vs waitFor?

---

## Advanced Patterns & Interview

### Q43. What is `queryClient.fetchQuery` vs `prefetchQuery`?

**Short definition:** `fetchQuery` returns data or throws (awaitable); `prefetchQuery` warms cache without returning data.

**Answer:** `fetchQuery` returns data or throws—await in route loader or SSR before continuing render. `prefetchQuery` returns void, non-blocking cache warm for likely navigation. Both populate cache for subsequent `useQuery` with same key. Use fetchQuery when next step requires data to proceed—auth gate, redirect decision. Use prefetchQuery for speculative optimization on hover.

**Follow-up:** ensureQueryData?

---

### Q44. What is `ensureQueryData`?

**Short definition:** Returns cached data if fresh enough; otherwise fetches—one call for loaders.

**Answer:** Returns cached data if present and valid; otherwise fetches and populates cache. Useful in route loaders: skip network if user navigates back within staleTime. Combines cache check and conditional fetch in one API—cleaner than manual `getQueryData` branching. Works outside React components via `queryClient` instance. Pair with consistent query keys and staleTime tuned for navigation patterns.

**Follow-up:** Difference from useQuery on server?

---

### Q45. Polling with React Query? [must-know]

**Short definition:** `refetchInterval` refetches on a timer while the query is active.

**Answer:** `refetchInterval: 5000` refetches every five seconds while query has active observers. `refetchIntervalInBackground: true` continues when tab unfocused—use carefully for battery and server load. Dynamic function form can stop polling when job completes: `refetchInterval: (query) => query.state.data?.done ? false : 2000`. Simpler than manual `setInterval` plus `useEffect` cleanup. Prefer WebSockets for high-frequency real-time when available.

**Follow-up:** refetchInterval vs WebSockets?

---

### Q46. When to use WebSockets instead of polling?

**Short definition:** WebSockets for push real-time; polling for low-frequency updates; both can update query cache manually.

**Answer:** Real-time chat, live scores, and collaborative cursors need WebSocket push plus `queryClient.setQueryData` or invalidate on message. Polling acceptable for dashboards every 30–60 seconds or job status until complete. React Query handles polling natively; WebSockets need separate subscription logic updating cache on events. On socket reconnect, invalidate affected queries to heal missed messages. Mention cost: polling is simpler ops; sockets scale differently on infra.

**Follow-up:** invalidateQueries on socket event?

---

### Q47. What is suspense mode in React Query?

**Short definition:** `useSuspenseQuery` suspends while loading—works with React Suspense boundaries, no manual isPending checks.

**Answer:** `useSuspenseQuery` throws a promise while loading—works with React Suspense boundaries and fallback UI. Component assumes `data` is defined in success path—no `isPending` branches cluttering render. `useSuspenseQueries` runs parallel suspense queries in one component. Errors throw to nearest Error Boundary unless caught—pair boundary with retry UI. Cleaner loading UX in frameworks that already use Suspense for routing and code splitting.

**Follow-up:** Error boundary pairing?

---

### Q48. Custom hooks pattern with React Query. [must-know]

**Short definition:** Encapsulate query key plus queryFn in feature hooks—single source of truth.

**Answer:** Export `useTodos(filter)` wrapping `useQuery({ queryKey: ['todos', filter], queryFn: () => fetchTodos(filter) })`. Export `useCreateTodo()` mutation hook similarly from the same module. Prevents key typos and documents API surface per feature. Components stay thin—business UI only, data wiring in hooks. Colocate hooks with MSW handlers in tests for the same feature folder.

**Follow-up:** Query key factory pattern?

---

### Q49. What is a query key factory? [must-know]

**Short definition:** Centralized typed functions building hierarchical query keys for lists, details, and filters.

**Answer:** Centralized builder: `const todoKeys = { all: ['todos'] as const, lists: () => [...todoKeys.all, 'list'], list: (f) => [...todoKeys.lists(), f], detail: (id) => [...todoKeys.all, 'detail', id] }`. Type-safe, consistent invalidation: `invalidateQueries({ queryKey: todoKeys.lists() })`. Colocate factory with feature module hooks. Scales when dozens of queries share prefixes—reduces string typo bugs in large codebases.

```tsx
export const todoKeys = {
  all: ["todos"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
  list: (filter: string) => [...todoKeys.lists(), filter] as const,
  detail: (id: string) => [...todoKeys.all, "detail", id] as const,
};
```

**Follow-up:** Colocate with feature module?

---

### Q50. Common React Query mistakes in interviews. [must-know]

**Short definition:** Unstable keys, missing invalidation, shared SSR client, fetch in useEffect, sensitive cache on logout.

**Answer:** Unstable query keys from inline objects recreated each render without stable serialization. Missing query key params causes wrong cache reuse—stale data for user B after user A. Not invalidating after mutations leaves UI out of sync with server. Sharing one QueryClient across SSR requests leaks data between users. Using raw `useEffect` + fetch instead of useQuery loses deduplication and background sync. Ignoring gcTime and persist plugins for sensitive data on logout fails security review.

**Follow-up:** Inline object in queryKey fix?

---

### Q51. What is query `meta` used for?

**Short definition:** Arbitrary per-query metadata passed to global cache callbacks for logging, toasts, or analytics.

**Answer:** `meta` on query or mutation options carries custom fields accessible in global `QueryCache`/`MutationCache` callbacks. Example: `meta: { errorMessage: 'Failed to load todos' }` read in global `onError` to show contextual toast without duplicating handlers. Keeps UI side effects centralized while hooks stay declarative. Do not put secrets in meta—it lives in client memory. Useful for feature flags affecting error reporting verbosity.

**Follow-up:** meta vs passing callbacks to every hook?

---

### Q52. What is `networkMode`?

**Short definition:** Controls whether queries/mutations run offline, always, or only when online.

**Answer:** `networkMode: 'online' | 'always' | 'offlineFirst'` adjusts behavior when `navigator.onLine` is false. Default pauses fetches offline and resumes on reconnect—pairs with `@tanstack/react-query-persist-client`. `offlineFirst` serves cache and queues mutations in some setups with persist plugins. Document behavior for field apps with intermittent connectivity. Interview mention shows you know PWA and offline scenarios beyond happy-path Wi-Fi.

**Follow-up:** How does reconnect interact with refetch?

---

### Q53. How do `queryFilters` and predicates work?

**Short definition:** Target cache operations by partial key, type, or custom predicate function—not just exact keys.

**Answer:** `invalidateQueries({ queryKey: ['todos'], predicate: (query) => query.state.dataUpdatedAt < Date.now() - 60_000 })` targets subsets. `refetchQueries`, `removeQueries`, and `cancelQueries` accept the same filter shapes. Use when multiple query variants exist and you need bulk operations after role change or feature flag flip. `type: 'active' | 'inactive' | 'all'` filters observer state. Powerful for maintenance tasks—dangerous without understanding prefix matching.

**Follow-up:** `exact: true` vs default prefix match?

---

### Q54. TanStack Query v5 migration highlights?

**Short definition:** `isLoading` → `isPending`, `cacheTime` → `gcTime`, `keepPreviousData` → placeholder function pattern.

**Answer:** v5 renames `isLoading` to `isPending` for no-data state and `cacheTime` to `gcTime` for clarity. `keepPreviousData` becomes `placeholderData: (prev) => prev` or imported helper. Removes `onSuccess`/`onError` from `useQuery` options—prefer `useEffect` on data or global cache callbacks for side effects. `status: 'loading'` → `'pending'`. Mention you read migration guide when upgrading—interviewers appreciate version awareness without reciting every breaking change.

**Follow-up:** Why remove useQuery onSuccess?

---

### Q55. Interview sound bite: explain React Query in 30 seconds. [must-know]

**Short definition:** One-paragraph summary of server-state caching, keys, staleTime, mutations, and invalidation.

**Answer:** "TanStack Query manages server state—caching, background sync, and mutations. I define queries with stable hierarchical keys and query functions, tune staleTime and gcTime for freshness versus memory, and after mutations I either setQueryData when I know the response shape or invalidateQueries to refetch from the server. Optimistic updates use onMutate snapshot and rollback on error. Infinite queries and prefetch handle pagination and navigation UX. It eliminates fetch-in-useEffect bugs and gives consistent loading, error, and refetch behavior across the app."

**Follow-up:** Draw cache lifecycle diagram on whiteboard.

---

**Total: 55 Q&As** (Q15 includes full optimistic update code walkthrough)
