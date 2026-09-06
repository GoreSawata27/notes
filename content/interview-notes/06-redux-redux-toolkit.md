# Redux & Redux Toolkit Interview Notes

Redux flow, when to use it, RTK createSlice, thunks, selectors, normalization, RTK Query scenarios, and optimization.

**Related:** [React Query notes](./07-react-query.md) — compare RTK Query vs TanStack Query.

---

## Redux Fundamentals

### Q1. What problem does Redux solve? [must-know]

**Short definition:** Redux is a predictable global state container that centralizes app state and updates it through pure reducers triggered by actions.

**Answer:** Redux provides predictable global state management for JavaScript apps. You keep a single source of truth in the store, change state only by dispatching plain action objects, and compute the next state with pure reducer functions. That unidirectional flow makes complex apps easier to debug and test. It solves prop drilling and inconsistent cross-component updates when many distant components need the same data. For small apps with local UI state, Redux is often unnecessary — but for large dashboards, multi-step flows, or shared domain data, it pays off.

**Follow-up:** When is Redux overkill?

**Common mistake:** Putting every piece of UI state — like modal open flags on leaf components — into Redux when `useState` is simpler.

---

### Q2. Explain the Redux unidirectional data flow. [must-know]

**Short definition:** Data moves in one direction: UI dispatches actions, reducers compute new state, store notifies subscribers, UI re-renders.

**Answer:** The UI dispatches an **action** — a plain object with a `type` and optional `payload`. The **reducer**, a pure function, receives the current state and action and returns the next state immutably. The **store** saves that new state and notifies subscribers. Connected components or hooks like `useSelector` read updated slices and re-render. Async work — API calls, timers — lives in middleware such as Redux Thunk or RTK Query, not inside reducers. This loop is easy to trace in DevTools because every change is an explicit action.

**Follow-up:** Why must reducers be pure?

---

### Q3. Why must reducers be pure functions? [must-know]

**Short definition:** A pure reducer always returns the same output for the same input and performs no side effects.

**Answer:** Purity enables time-travel debugging, predictable unit tests, and memoized selectors that assume stable derivation rules. Reducers must not mutate state directly, call APIs, read random values, or depend on external variables that change between calls. Same `(state, action)` must always produce the same next state. Side effects belong in middleware, thunks, or RTK Query endpoints. If you mutate state outside Immer in RTK, you break referential equality and cause subtle re-render bugs.

**Follow-up:** What happens if you mutate state directly?

**Common mistake:** Doing `state.items.push(item)` in a plain reducer without Immer — mutates store in place.

---

### Q4. What are the three core principles of Redux? [must-know]

**Short definition:** Single store, read-only state via actions, and changes through pure reducers.

**Answer:** First, **single source of truth** — one store tree holds the entire client state you choose to globalize. Second, **state is read-only** — the only way to change it is dispatching actions; components never write to the store directly. Third, **reducers are pure functions** — they take `(state, action)` and return a new state object with immutable updates. These principles together make state transitions explicit, replayable, and testable. Flux inspired this model; Redux refined it with a single store and reducer composition.

**Follow-up:** How does this compare to Flux?

---

### Q5. When should you use Redux vs local state or Context? [must-know]

**Short definition:** Use Redux when many components share complex state; use local state or Context for isolated or low-frequency global data.

**Answer:** Use Redux when many components need the same state, updates are complex or frequent, you need middleware for logging or persistence, or you want DevTools time-travel. Prefer `useState` for local UI state like form field focus or toggle open state. Use Context for low-frequency data such as theme or locale that changes rarely. Redux shines in large apps with shared domain state — cart, auth profile, normalized entity collections. Not every React app needs Redux; start simple and promote state when prop drilling or sync bugs appear.

**Follow-up:** Does every React app need Redux?

---

### Q6. What is Redux Toolkit (RTK) and why use it? [must-know]

**Short definition:** RTK is the official, recommended API for writing Redux with less boilerplate and safer defaults.

**Answer:** RTK provides `configureStore` with good defaults, `createSlice` for reducers and auto-generated actions, Immer-powered immutable updates, built-in thunk middleware, and RTK Query for data fetching. It reduces boilerplate and prevents common mistakes like accidental mutation or misconfigured store setup. The Redux team recommends RTK for all new projects instead of hand-written action types and switch statements. You still get the same predictable data flow, but with far less ceremony and better TypeScript inference.

**Follow-up:** Default middleware in `configureStore`?

---

### Q7. What does `configureStore` set up by default? [must-know]

**Short definition:** `configureStore` combines reducers, adds thunk middleware, DevTools, and development invariant checks.

**Answer:** It combines your slice reducers into a root reducer, adds `redux-thunk` middleware automatically, enables Redux DevTools in development, and sets up immutable state invariant and serializable check middleware that warn on non-serializable values like Promises or DOM nodes. You pass `reducer`, optional `middleware`, `preloadedState`, and `devTools` options. For RTK Query, you also add the API reducer path and concatenate `api.middleware`. This one function replaces manual `createStore`, middleware composition, and DevTools wiring.

**Follow-up:** How do you disable serializable check for specific paths?

---

### Q8. Explain `createSlice`. [must-know]

**Short definition:** `createSlice` auto-generates action creators and a reducer from a name, initial state, and reducer functions.

**Answer:** You call `createSlice({ name, initialState, reducers })` and RTK generates action types and creators from reducer names. Inside `reducers`, you can write code that looks mutating — `state.todos.push(item)` — because Immer produces immutable updates under the hood. Export `slice.actions` for dispatching and `slice.reducer` for the store. You can also define `extraReducers` to respond to async thunks or actions from other slices. This colocates actions and reducers, eliminating separate action constant files.

**Follow-up:** Can you write extraReducers in a slice?

```javascript
const todosSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    added(state, action) {
      state.push(action.payload);
    },
  },
});
export const { added } = todosSlice.actions;
export default todosSlice.reducer;
```

---

### Q9. What is Immer and how does RTK use it? [must-know]

**Short definition:** Immer lets you write mutating-looking reducer code while producing immutable state via a draft proxy.

**Answer:** Immer creates a draft proxy of your state slice. You mutate the draft — push to arrays, assign properties — and Immer produces a new immutable state tree with structural sharing for unchanged branches. RTK wraps `createSlice` reducers with Immer automatically. This makes reducers readable without spread gymnastics like `{ ...state, items: [...state.items, newItem] }`. Performance is generally excellent because unchanged subtrees are reused. Avoid returning a new object from an Immer reducer unless you intend to replace the entire slice.

**Follow-up:** Performance implications of Immer?

---

### Q10. What is `createAsyncThunk`? [must-know]

**Short definition:** `createAsyncThunk` is an RTK helper that dispatches pending, fulfilled, and rejected actions for async logic.

**Answer:** You define `createAsyncThunk('users/fetch', async (arg, { rejectWithValue }) => { ... })` and RTK auto-generates three action types for the lifecycle. Handle them in `extraReducers` with `builder.addCase(fetchUser.fulfilled, ...)`. The payload creator can use `rejectWithValue` to return structured errors instead of thrown exceptions. Thunks receive `dispatch`, `getState`, and `extra` for dependency injection. This standardizes async patterns across your codebase and integrates cleanly with DevTools action logs.

**Follow-up:** Difference from plain thunk?

```javascript
export const fetchUser = createAsyncThunk('users/fetchById', async (userId, { rejectWithValue }) => {
  const res = await fetch(`/api/users/${userId}`);
  if (!res.ok) return rejectWithValue(await res.json());
  return res.json();
});
```

---

## Async, Selectors & Normalization

### Q11. Difference between `createAsyncThunk` and a manual thunk?

**Short definition:** `createAsyncThunk` standardizes lifecycle actions; manual thunks offer more ad-hoc flexibility.

**Answer:** `createAsyncThunk` automatically creates pending, fulfilled, and rejected action types with consistent naming and error handling. Manual thunks are functions `(dispatch, getState) => { ... }` where you dispatch whatever actions you want. Manual thunks are more flexible for complex orchestration but lead to inconsistent patterns across teams. Prefer `createAsyncThunk` for standard CRUD fetches; use manual thunks or listener middleware when you need conditional multi-dispatch logic that does not fit the three-state model.

**Follow-up:** Can you cancel an async thunk?

---

### Q12. What is `extraReducers` in a slice? [must-know]

**Short definition:** `extraReducers` handles actions defined outside the slice, such as async thunk lifecycle actions.

**Answer:** Use the builder callback: `extraReducers: (builder) => { builder.addCase(fetchUser.fulfilled, (state, action) => { ... }) }`. This keeps async response handling colocated with the state shape it updates. You can also use `addMatcher` for groups of actions or `addDefaultCase` for fallbacks. Unlike `reducers`, cases in `extraReducers` do not auto-generate action creators — they respond to existing ones. This is the standard place to set `loading`, `error`, and merge fetched entities on fulfillment.

**Follow-up:** `addCase` vs `addMatcher`?

---

### Q13. What are Redux selectors and why use them? [must-know]

**Short definition:** Selectors are functions that read and derive data from the store state tree.

**Answer:** A selector is `(state) => value` that encapsulates how to reach data in the store. They decouple components from state shape — if you rename `state.todos` to `state.todoItems`, you update one selector instead of twenty components. Selectors enable memoization with `createSelector` so expensive derived lists recompute only when inputs change. Components stay clean: `const items = useSelector(selectVisibleTodos)` instead of inline logic. Colocate selectors with their slice for maintainability.

**Follow-up:** Inline selector vs memoized selector?

---

### Q14. Explain `createSelector` (Reselect). [must-know]

**Short definition:** `createSelector` memoizes derived values, recomputing only when input selector outputs change.

**Answer:** You compose input selectors plus a result function: `createSelector([selectTodos, selectFilter], (todos, filter) => todos.filter(...))`. It caches the last result and returns it if input selector outputs are shallowly equal to the previous call. Essential for expensive derived data — filtered lists, totals, grouped entities. Without memoization, a selector that returns a new array every call causes re-renders on every store update even when data is unchanged. Place derived computation in selectors, not in components or reducers.

**Follow-up:** What if input returns new array reference every time?

```javascript
const selectVisibleTodos = createSelector(
  [selectTodos, selectFilter],
  (todos, filter) => todos.filter(t => t.text.includes(filter))
);
```

---

### Q15. What is state normalization and why normalize? [must-know]

**Short definition:** Normalization stores entities in `{ ids: [], entities: { [id]: item } }` instead of nested arrays.

**Answer:** Denormalized nested arrays duplicate data and make updates painful — changing a user name in one place leaves stale copies elsewhere. Normalized shape gives O(1) lookup and update by ID via `entities[id]`. The `ids` array preserves order for rendering. RTK's `createEntityAdapter` provides standard helpers. Normalization is especially important for relational data — posts with author IDs, comments referencing posts — where you store each entity type once and join in selectors.

**Follow-up:** Example of denormalized vs normalized?

```javascript
// Denormalized — hard to update author in one place
{ posts: [{ id: 1, author: { id: 5, name: 'Ada' } }] }

// Normalized — single source per entity
{
  posts: { ids: [1], entities: { 1: { id: 1, authorId: 5 } } },
  users: { ids: [5], entities: { 5: { id: 5, name: 'Ada' } } },
}
```

---

### Q16. What is `createEntityAdapter`? [must-know]

**Short definition:** `createEntityAdapter` is an RTK utility for standardized normalized CRUD state and selectors.

**Answer:** It provides `initialState`, reducer helpers like `addOne`, `setAll`, `updateOne`, `removeMany`, and selectors `selectAll`, `selectById`, `selectIds`. You pass a `sortComparer` for ordered collections. Use `adapter.getInitialState({ loading: false })` to extend with extra fields. Reducer cases call `adapter.addOne(state, action.payload)` inside Immer drafts. This eliminates hand-written normalization boilerplate and keeps entity patterns consistent across features.

**Follow-up:** Sorting entities with adapter?

```javascript
const usersAdapter = createEntityAdapter({
  selectId: (user) => user.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});
const usersSlice = createSlice({
  name: 'users',
  initialState: usersAdapter.getInitialState({ loading: false }),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      usersAdapter.setAll(state, action.payload);
      state.loading = false;
    });
  },
});
```

---

## RTK Query

### Q17. What is RTK Query? [must-know]

**Short definition:** RTK Query is a data-fetching and caching layer built into Redux Toolkit.

**Answer:** Define APIs with `createApi` and RTK auto-generates hooks like `useGetPostsQuery`, cache management, tags, invalidation, polling, and optimistic updates. It reduces hand-written thunks and reducers for server state. Cache lives in the Redux store under the API reducer path. Subscriptions reference-count cache entries — data stays while components use it. RTK Query is ideal when you already use Redux and want server cache integrated with DevTools and the rest of your state.

**Follow-up:** RTK Query vs React Query?

---

### Q18. RTK Query vs React Query — key differences? [must-know]

**Short definition:** RTK Query integrates with Redux store; React Query is standalone and lighter if you do not use Redux.

**Answer:** RTK Query stores cache in Redux, shares DevTools with client state, and colocates with RTK slices — great when Redux is already your architecture. React Query is standalone with a smaller bundle if you are not using Redux, excellent DevTools, and a larger community example set. Both handle caching, background refetch, and mutations well. Choose RTK Query when invested in Redux; choose React Query when avoiding Redux overhead. Using both in one app is possible but usually redundant.

**Follow-up:** Can you use both in one app?

---

### Q19. How does RTK Query caching work? [must-know]

**Short definition:** RTK Query caches data by endpoint plus serialized arguments with configurable TTL and subscription counting.

**Answer:** Each endpoint and argument combination is a cache entry with metadata — status, timestamps, error. `providesTags` labels cached data; `invalidatesTags` on mutations marks entries stale and triggers refetch for active subscriptions. Default `keepUnusedDataFor` is 60 seconds after the last subscriber unmounts. `refetchOnMountOrArgChange` controls refetch when args change or component remounts. Serialized args mean `{ id: 1 }` and `{ id: 1 }` hit the same cache entry.

**Follow-up:** What is `refetchOnMountOrArgChange`?

---

### Q20. What are cache tags in RTK Query? [must-know]

**Short definition:** Cache tags are labels attached to cached query data for granular invalidation after mutations.

**Answer:** Queries declare `providesTags: ['Post']` or `{ type: 'Post', id: 1 }` for specific items. Mutations declare `invalidatesTags: ['Post']` or `{ type: 'Post', id: arg.id }` to refetch affected entries. The LIST tag pattern uses `{ type: 'Post', id: 'LIST' }` for collection queries and invalidates it when any post changes. Tags decouple mutations from knowing every query key — you invalidate by domain concept, not manual cache key strings.

**Follow-up:** LIST tag pattern for collections?

---

### Q21. How do you set up the Redux store with RTK Query? [must-know]

**Short definition:** Add the API reducer and middleware to `configureStore` and wrap the app in `Provider`.

**Answer:** Add `[api.reducerPath]: api.reducer` to the reducer object. Concatenate middleware: `getDefaultMiddleware().concat(api.middleware)` — the middleware handles subscriptions, invalidation, and refetch scheduling. Wrap the app in `<Provider store={store}>`. Export typed hooks `useAppDispatch` and `useAppSelector` with `RootState` and `AppDispatch` types. Without API middleware, hooks will not fetch or update cache correctly.

**Follow-up:** Why is API middleware required?

```javascript
export const store = configureStore({
  reducer: {
    [postsApi.reducerPath]: postsApi.reducer,
    ui: uiSlice.reducer,
  },
  middleware: (getDefault) => getDefault().concat(postsApi.middleware),
});
```

---

### Q22. RTK Query scenario: full CRUD for posts. [must-know]

**Short definition:** Define getList, getById, create, update, and delete endpoints with matching tags for automatic cache sync.

**Answer:** A typical posts API defines `getPosts` providing `{ type: 'Post', id: 'LIST' }`, `getPostById` providing `{ type: 'Post', id }`, and mutations that invalidate appropriate tags. Create invalidates LIST; update invalidates both the item and LIST; delete invalidates both. Components use generated hooks without manual cache bookkeeping. Optimistic updates can patch cache in `onQueryStarted` before the server responds. This pattern scales to nested resources by extending tag types.

**Follow-up:** How do optimistic creates assign temporary IDs?

```javascript
export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Post'],
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => '/posts',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Post', id })), { type: 'Post', id: 'LIST' }]
          : [{ type: 'Post', id: 'LIST' }],
    }),
    addPost: builder.mutation({
      query: (body) => ({ url: '/posts', method: 'POST', body }),
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),
    updatePost: builder.mutation({
      query: ({ id, ...patch }) => ({ url: `/posts/${id}`, method: 'PATCH', body: patch }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Post', id }],
    }),
    deletePost: builder.mutation({
      query: (id) => ({ url: `/posts/${id}`, method: 'DELETE' }),
      invalidatesTags: (r, e, id) => [{ type: 'Post', id }, { type: 'Post', id: 'LIST' }],
    }),
  }),
});
```

---

### Q23. RTK Query scenario: normalized cache with related entities. [must-know]

**Short definition:** Store users and posts separately in slices while RTK Query fetches; join in selectors or use `transformResponse`.

**Answer:** RTK Query cache is keyed by endpoint args, not automatically normalized across entity types. For heavy relational apps, use `transformResponse` to normalize into entity adapter slices on fulfillment via `onQueryStarted` and manual dispatch, or keep RTK Query cache denormalized for simple apps. A hybrid pattern: RTK Query holds server cache; a normalized slice syncs on `matchFulfilled` for offline selectors. Avoid duplicating the same API response in both RTK Query cache and a manual slice without a clear source of truth.

**Follow-up:** When is denormalized RTK Query cache enough?

```javascript
// transformResponse flattens nested authors into lookup map in cache
getPosts: builder.query({
  query: () => '/posts?include=author',
  transformResponse: (response) => ({
    posts: response.posts,
    usersById: Object.fromEntries(response.included.users.map(u => [u.id, u])),
  }),
}),
```

---

### Q24. What is `injectEndpoints` in RTK Query?

**Short definition:** `injectEndpoints` adds endpoints to an existing API slice from feature modules for code splitting.

**Answer:** Split a large API across files: define `createApi` in `baseApi.ts` with empty endpoints and `tagTypes`, then in `postsApi.ts` call `baseApi.injectEndpoints({ endpoints: (builder) => ({ ... }) })`. Endpoints merge into one reducer and middleware. Enables lazy loading API definitions in large apps. Export hooks from the inject return value. All injected endpoints share the same cache and tag types.

**Follow-up:** Order of injection vs store setup?

---

### Q25. What is `selectFromResult` in RTK Query hooks?

**Short definition:** `selectFromResult` lets you pick specific fields from query results to reduce component re-renders.

**Answer:** Pass `selectFromResult: ({ data, isLoading }) => ({ post: data?.title, isLoading })` to `useGetPostQuery`. The component re-renders only when selected fields change per shallow compare. Useful when a large query object changes reference but you only care about one field. Similar philosophy to memoized Redux selectors. Combine with `skip: !id` to avoid fetching when args are missing.

**Follow-up:** `skipToken` vs conditional skip?

---

## Middleware, Components & Patterns

### Q26. What are typed hooks (`useAppSelector`, `useAppDispatch`)? [must-know]

**Short definition:** Pre-typed wrappers around `useSelector` and `useDispatch` with your store's TypeScript types.

**Answer:** Define `export type RootState = ReturnType<typeof store.getState>` and `export type AppDispatch = typeof store.dispatch`. Create `useAppSelector: TypedUseSelectorHook<RootState>` and `useAppDispatch = () => useDispatch<AppDispatch>()`. Components get autocomplete for state paths and correct thunk dispatch typing. Without these wrappers, every component repeats type parameters. This is standard in RTK TypeScript templates.

**Follow-up:** Typing `createAsyncThunk` return?

---

### Q27. What is middleware in Redux? [must-know]

**Short definition:** Middleware intercepts actions between dispatch and reducer for side effects and cross-cutting concerns.

**Answer:** Middleware forms a chain: `(store) => (next) => (action) => { ... }`. Each function can log, transform, delay, or dispatch additional actions before calling `next(action)`. Thunk middleware detects function actions and executes them. RTK Query middleware manages cache lifecycle. Custom middleware handles analytics or crash reporting. Order matters — apply extensions before passing to the next link. Middleware is the escape hatch for impure work while keeping reducers pure.

**Follow-up:** Example custom middleware?

---

### Q28. What does `redux-thunk` enable? [must-know]

**Short definition:** Thunk middleware allows dispatching functions that perform async work and dispatch multiple actions.

**Answer:** If an action is a function, thunk middleware calls it with `(dispatch, getState, extraArgument)`. Inside, you can await fetch, branch on current state, and dispatch success or failure actions. Default in RTK's `configureStore`. Alternatives like `redux-saga` or `redux-observable` use generators or RxJS for complex orchestration — more powerful but steeper learning curve. Thunks cover most CRUD apps; sagas suit long-running workflows with cancellation.

**Follow-up:** When prefer saga over thunk?

---

### Q29. How do you connect React components to Redux? [must-know]

**Short definition:** Use `useSelector` to read state and `useDispatch` to dispatch actions in function components.

**Answer:** Modern React-Redux uses hooks: `const value = useSelector(selectX)` and `const dispatch = useDispatch()`. Legacy code uses `connect(mapStateToProps, mapDispatchToProps)(Component)`. RTK recommends hooks with typed variants. Avoid connecting every leaf component — connect containers or call selectors at the point of need. Memoize selectors to prevent unnecessary re-renders when unrelated store slices update.

**Follow-up:** `useSelector` equality check default?

---

### Q30. What equality function does `useSelector` use by default?

**Short definition:** `useSelector` uses strict reference equality (`===`) on the selected value by default.

**Answer:** If your selector returns a new object or array every call, the component re-renders on every store update even when contents are identical. Fix with `createSelector` memoization or pass a custom equality function: `useSelector(selectX, shallowEqual)`. `shallowEqual` compares first-level properties — useful for selecting small objects. For primitive selections like `state.user.id`, default equality works fine.

**Follow-up:** When to use custom equality?

---

### Q31. How do you optimize Redux re-renders? [must-know]

**Short definition:** Minimize selected state, memoize selectors, normalize data, and split components to limit subscription scope.

**Answer:** Use `createSelector` for derived data so referential equality holds when inputs are unchanged. Normalize state to avoid passing huge nested objects. Split components so only subscribers to changed slices re-render. Apply `React.memo` on presentational children receiving stable props. Avoid storing derived data in the store — compute in selectors. RTK Query handles fetch cache separately; do not mirror it unnecessarily in slices. React-Redux v8+ batches notify updates in React 18.

**Follow-up:** Does Redux cause all components to re-render?

---

### Q32. Does Redux cause all components to re-render on every dispatch?

**Short definition:** No — only components whose selected state changed re-render, if selectors are written correctly.

**Answer:** The store notifies all subscribers, but React-Redux compares each selector's output to its previous value using the equality function. Unchanged selections bail out before triggering a React re-render. Poor selector design — returning new object literals inline — defeats this optimization. The dispatch itself is cheap; unnecessary re-renders come from selector mistakes, not Redux architecture. DevTools Profiler plus React-Redux debug flags help diagnose subscription issues.

**Follow-up:** React-Redux v8+ batching behavior?

---

### Q33. What is the difference between client state and server state?

**Short definition:** Client state is UI-owned; server state is fetched, cacheable, and potentially stale.

**Answer:** **Client state** includes UI toggles, selected tab IDs, form drafts, and modal visibility — belongs in RTK slices. **Server state** is API data that can be shared, cached, and invalidated — RTK Query or React Query handles it better than manual reducers. Anti-pattern: copying entire API responses into hand-written slices and manually syncing mutations. Let RTK Query own server cache; slices hold only client concerns and IDs pointing to selected entities.

**Follow-up:** Where to put form state during edit?

---

### Q34. How do you handle optimistic updates in RTK? [must-know]

**Short definition:** Optimistic updates patch cache or state immediately, then roll back on server error.

**Answer:** In mutation `onQueryStarted`, call `dispatch(api.util.updateQueryData('getPosts', undefined, draft => { draft.push(optimisticItem) }))` and capture `patchResult`. Await the mutation promise; on error call `patchResult.undo()`. For slice state, dispatch a temporary action and revert on rejection. Users see instant feedback while the network request completes. Always handle rollback — silent failures leave UI out of sync with server truth.

**Follow-up:** Rollback strategy on failure?

```javascript
async onQueryStarted(body, { dispatch, queryFulfilled }) {
  const patch = dispatch(
    postsApi.util.updateQueryData('getPosts', undefined, (draft) => {
      draft.push({ ...body, id: 'temp-' + Date.now() });
    })
  );
  try {
    await queryFulfilled;
  } catch {
    patch.undo();
  }
}
```

---

### Q35. What is `redux-persist`?

**Short definition:** `redux-persist` saves Redux state to storage and rehydrates it on app load.

**Answer:** Wrap the root reducer with `persistReducer` and configure `persistStore`. Whitelist slices like auth preferences or UI settings — not volatile server cache. Rehydration is async; show a loading gate until complete. Watch for serializable check warnings on persist actions — configure ignored paths. Do not persist RTK Query cache unless you have a deliberate offline strategy; stale API data causes confusing UX.

**Follow-up:** Serializable check conflicts?

---

### Q36. What is the Redux DevTools extension used for? [must-know]

**Short definition:** DevTools inspect actions, state diffs, and enable time-travel debugging in development.

**Answer:** Every dispatched action appears with payload and timestamp. You see state diffs per action, jump backward and forward in history, and trace which component dispatched what. Export and import state for bug reports. Enabled automatically by `configureStore` in development. Essential for debugging complex multi-slice transitions. Action sanitizer can hide sensitive payloads from logs.

**Follow-up:** Production DevTools?

---

### Q37. Can you use Redux DevTools in production?

**Short definition:** Possible but usually disabled for security and performance in production builds.

**Answer:** Configure `devTools: process.env.NODE_ENV !== 'production'`. Exposing full state in production risks leaking tokens or PII. Performance overhead from logging every action adds up at scale. Use structured logging middleware and error tracking like Sentry for production debugging instead. If enabled for internal staging, sanitize actions containing passwords.

**Follow-up:** Action sanitization?

---

### Q38. What is a Redux anti-pattern? [must-know]

**Short definition:** Common Redux mistakes that cause bugs, performance issues, or unmaintainable stores.

**Answer:** Storing non-serializable values — class instances, Promises, DOM nodes. Duplicating server data manually without normalization. Putting everything in Redux including local modal state. One giant monolithic slice with no feature separation. Mutating state outside Immer reducers. Storing React elements in state. Dispatching in render. These patterns break DevTools, time-travel, and memoization assumptions. Keep Redux for shared domain state with clear boundaries.

**Follow-up:** Storing React component in state?

---

### Q39. How do you structure Redux in a feature-based architecture? [must-know]

**Short definition:** Organize code by feature folders, each with slice, API, selectors, and components.

**Answer:** Structure like `features/todos/todosSlice.ts`, `todosApi.ts`, `selectors.ts`, and UI components. Root store combines feature reducers. RTK Query APIs split per domain with `injectEndpoints`. Scales better than type-based folders (`actions/`, `reducers/`) where one feature touches five directories. Export public API from feature index. Shared utilities live in `app/` or `shared/`. New hires navigate by product feature, not file type.

**Follow-up:** Shared vs feature-specific selectors?

---

### Q40. What is `combineReducers`?

**Short definition:** `combineReducers` merges multiple reducers, each managing one key in the state tree.

**Answer:** Each reducer only receives its slice of state and returns updated slice. `configureStore` calls this internally when you pass a reducer object. Changing `state.todos` does not pass `state.auth` to the todos reducer — isolation by key. Root state type is the union of slice shapes. Rarely needed manually with RTK since `configureStore` handles it.

**Follow-up:** Still needed with RTK?

---

### Q41. How do slices communicate across features? [must-know]

**Short definition:** Slices communicate via shared actions, `extraReducers`, thunks, or listener middleware — not direct state imports.

**Answer:** Listen to another slice's actions in `extraReducers`. Dispatch shared actions from thunks when one feature's success should update another. Avoid importing another slice's state directly into reducers — couple at the action level. `createListenerMiddleware` reacts to actions with side effects: analytics, cross-slice sync, conditional dispatches. Prefer loose coupling so features can evolve independently.

**Follow-up:** `createListenerMiddleware` use case?

---

### Q42. What is `createListenerMiddleware` in RTK?

**Short definition:** Listener middleware runs declarative side effects in response to specific actions.

**Answer:** Register listeners: `listenerMiddleware.startListening({ actionCreator: todoAdded, effect: async (action, listenerApi) => { ... } })`. Effects can dispatch more actions, cancel previous runs, and access `getState`. Replaces some saga use cases — analytics on login, syncing cart to localStorage, refetching on route change. Add to store middleware chain after defaults. Cleaner than scattering logic across many `useEffect` dispatches in components.

**Follow-up:** vs `useEffect` dispatching?

---

### Q43. How do you test Redux reducers? [must-know]

**Short definition:** Test reducers as pure functions with given state and action, asserting output state.

**Answer:** Import reducer and action creators directly. Call `expect(reducer(initialState, added(todo))).toEqual(expectedState)`. Verify original state is unchanged — immutability. No store needed for reducer unit tests. Edge cases: unknown action returns current state, undefined state uses initial state. RTK slices export everything you need from one file. Fast, deterministic, no DOM.

**Follow-up:** Testing thunks?

---

### Q44. How do you test async thunks and RTK Query? [must-know]

**Short definition:** Mock dispatch/getState for thunks; use `setupApiStore` or MSW for RTK Query integration tests.

**Answer:** Thunks: mock `dispatch` and `getState`, invoke the thunk, assert dispatched action sequence. RTK Query: use `setupApiStore` from RTK docs with mocked `baseQuery`, or MSW for network-level integration. Wrap components in Provider with test store. Assert UI reflects loading, success, and error. Reset store between tests. Prefer MSW when testing the full fetch path through hooks.

**Follow-up:** Mock store vs real store in tests?

---

### Q45. What is `prepare` in `createSlice` reducers?

**Short definition:** `prepare` customizes the action payload shape before the reducer runs.

**Answer:** Define `addTodo: { reducer(state, action) { ... }, prepare(text) { return { payload: { id: uuid(), text, done: false } } } }`. Encapsulates action shape logic next to the reducer. Consumers call `dispatch(added('Buy milk'))` without building payload objects manually. Keeps action creators consistent and typed. Use when payload needs computed fields or normalization at dispatch time.

**Follow-up:** When use vs creating action manually?

---

### Q46. Bridge pattern: RTK Query with traditional slices. [must-know]

**Short definition:** RTK Query owns server cache; slices hold UI state; sync via `extraReducers` or `onQueryStarted`.

**Answer:** Do not duplicate API entities in both RTK Query cache and a manual normalized slice unless one is clearly authoritative. Typical split: RTK Query for fetched posts; UI slice for `selectedPostId`, filter text, and sort order. On mutation success, either rely on tag invalidation or update client slice in `extraReducers` listening to `api.endpoints.addPost.matchFulfilled`. Selectors join RTK Query data with UI slice preferences.

**Follow-up:** Sync selected item ID in slice, data in RTK Query?

---

### Q47. How do you handle authentication state in Redux? [must-know]

**Short definition:** Auth slice stores user identity and session flags; tokens prefer httpOnly cookies in SSR apps.

**Answer:** Store `user`, `isAuthenticated`, and optionally token if not using httpOnly cookies. Login thunk or RTK Query mutation sets state; logout clears all auth fields. Hydrate from cookie or localStorage on app init via `preloadedState` or persist. Never store refresh tokens in localStorage for XSS-sensitive apps. Route guards read from selector; API baseQuery reads token for Authorization header. Server must still validate every request — client auth state is UX only.

**Follow-up:** Redux auth vs Context auth?

---

### Q48. What is the flux standard action shape?

**Short definition:** FSA recommends actions have `type`, optional `payload`, `error` flag, and `meta`.

**Answer:** Consistent shape enables middleware and DevTools to handle actions predictably. RTK action creators follow this convention automatically. `error: true` distinguishes failure payloads. `meta` carries request IDs or timestamps without polluting payload. TypeScript types from RTK infer payload types per action creator. Custom actions should follow the same pattern for tooling compatibility.

**Follow-up:** FSA and TypeScript typing?

---

### Q49. How does Redux work with Next.js App Router? [must-know]

**Short definition:** Create the store per-request on server or client-only; avoid shared singletons across SSR requests.

**Answer:** Most Redux apps use a client Provider with `"use client"`. For SSR prefetch, use `makeStore` factory creating fresh store per request — singleton store on server leaks state between users. Pass `preloadedState` from server to client for hydration. RTK Query SSR needs manual cache extraction and rehydration or client-only fetching. App Router Server Components cannot use hooks — fetch on server, pass props to client components that dispatch if needed.

**Follow-up:** Singleton store anti-pattern on server?

---

### Q50. What is preloadedState / store hydration?

**Short definition:** `preloadedState` initializes the store with server or persisted data before the app runs.

**Answer:** Pass into `configureStore({ preloadedState })` from SSR HTML payload, `getServerSideProps`, or redux-persist rehydration. Enables consistent server and client render for auth or theme. Shape must match reducer keys exactly or use merge utilities for partial hydration. Mismatch causes hydration warnings in Next.js. Client may dispatch additional fetch actions after hydration to refresh stale server data.

**Follow-up:** Hydration mismatch debugging?

---

### Q51. RTK Query scenario: polling and lazy queries. [must-know]

**Short definition:** Polling refetches on an interval; lazy queries fetch on demand instead of on mount.

**Answer:** Pass `pollingInterval: 3000` to `useGetStatusQuery` for live dashboards — pauses when tab is hidden by default. `useLazyGetReportQuery` returns a trigger function you call on button click, avoiding fetch until needed. Combine with `skip: !shouldFetch` for conditional queries. `refetch()` manually refreshes current args. Useful for Infosys scenarios: load detail only when row expands, poll order status until delivered.

**Follow-up:** Polling vs WebSockets?

```javascript
const { data } = useGetOrderStatusQuery(orderId, { pollingInterval: 2000 });
const [fetchReport, { data: report }] = useLazyGetReportQuery();
// later: fetchReport(filters);
```

---

### Q52. RTK Query scenario: error handling and retry. [must-know]

**Short definition:** RTK Query exposes `isError`, `error`, and `refetch`; customize retry in `baseQuery`.

**Answer:** Components branch on `isLoading`, `isError`, and `isSuccess` from hooks. Display `error.status` and `error.data` from `fetchBaseQuery`. Wrap `baseQuery` with retry logic for transient failures. Global error handling via middleware or `onQueryStarted` catch blocks. Mutations expose `[mutate, { isError, error }]`. Normalize error shape in API layer so UI does not parse raw fetch responses everywhere.

**Follow-up:** Global toast on mutation failure?

---

### Q53. Normalized state example: e-commerce cart with products. [must-know]

**Short definition:** Store products in entity adapter; cart holds `{ productId, qty }[]` references.

**Answer:** Products slice uses `createEntityAdapter` for catalog from API. Cart slice stores line items as `{ productId, quantity }` without embedding full product objects. Selector joins cart lines with product entities for display and price totals. Updating product price in catalog automatically reflects in cart total via selector. Adding to cart dispatches `cartAdded({ productId, qty })` without duplicating product name or price.

**Follow-up:** What if product is deleted while in cart?

```javascript
// cart slice
{ items: [{ productId: 'p1', quantity: 2 }] }
// products slice (entity adapter)
{ ids: ['p1'], entities: { p1: { id: 'p1', name: 'Book', price: 19 } } }
// selector
const selectCartLines = createSelector(
  [selectCartItems, selectProductEntities],
  (items, products) => items.map(i => ({ ...i, product: products[i.productId] }))
);
```

---

### Q54. When would you choose Zustand/Jotai over Redux?

**Short definition:** Zustand and Jotai suit simpler global state; Redux wins for large teams, middleware, and complex async.

**Answer:** Smaller apps benefit from Zustand's minimal API — no providers, selective subscriptions. Jotai and Recoil offer atomic fine-grained updates. Redux wins when the team knows it, needs middleware and DevTools ecosystem, manages complex normalized entities, or already invested in RTK Query across the app. Migration from Redux to Zustand is common when apps outgrow Redux ceremony but not its patterns. Choose based on team and complexity, not hype.

**Follow-up:** Migration from Redux to Zustand?

---

### Q55. What is selector colocation best practice?

**Short definition:** Define selectors next to the slice they read from, not in a global dump folder.

**Answer:** Place selectors in the same feature folder as `todosSlice.ts` — export from `selectors.ts` or the slice file. Export public selectors from feature index. Global `selectors/` folders become unmaintainable at scale. Memoized selectors for one feature can compose lower-level input selectors from the same feature. Cross-feature selectors live in the consuming feature or a shared `selectors` module with clear naming.

**Follow-up:** Parameterized selectors pattern?

---

### Q56. How do parameterized selectors work? [must-know]

**Short definition:** Parameterized selectors use factory functions or curried `createSelector` to select by ID.

**Answer:** Factory pattern: `const makeSelectTodoById = (id) => createSelector([selectEntities], (entities) => entities[id])`. In component: `useSelector(makeSelectTodoById(id))` — stabilize factory with `useMemo(() => makeSelectTodoById(id), [id])` or use RTK's entity adapter `selectById(state, id)`. Without stabilization, a new selector instance each render breaks memoization. Entity adapters ship `selectById` out of the box.

**Follow-up:** `selectTodoById` with createSelector currying?

```javascript
export const selectTodoById = (id) =>
  createSelector(selectTodoEntities, (entities) => entities[id]);
// In component:
const todo = useSelector(selectTodoById(todoId));
```

---

### Q57. What is `fetchBaseQuery` vs custom `baseQuery`?

**Short definition:** `fetchBaseQuery` wraps fetch with base URL and headers; custom baseQuery adds auth, retry, or refresh logic.

**Answer:** `fetchBaseQuery({ baseUrl, prepareHeaders })` handles JSON parsing and error normalization. Wrap it: `const baseQueryWithReauth = async (args, api, extra) => { ... }` to refresh tokens on 401 and retry. Centralize Authorization header from auth slice in `prepareHeaders`. Custom baseQuery can integrate GraphQL or axios while keeping RTK Query hooks. All endpoints inherit baseQuery behavior.

**Follow-up:** Token refresh without infinite loop?

---

### Q58. What is the difference between `dispatch` and `getState` in thunks?

**Short definition:** `dispatch` sends actions; `getState` reads current store snapshot inside async logic.

**Answer:** Thunks use `dispatch` to fire actions synchronously or dispatch other thunks. `getState` returns the full RootState at call time — useful for conditional logic: skip fetch if data already loaded, read auth token for API call. Do not mutate state returned by `getState`. For RTK Query, prefer hooks in components; thunks remain for fire-and-forget workflows outside React.

**Follow-up:** Reading state in `prepareHeaders`?

---

### Q59. How do you handle loading states across multiple async thunks?

**Short definition:** Track per-request loading flags or use a generic `loading` map keyed by action type.

**Answer:** Each slice can have `loading: false` updated in pending/fulfilled/rejected cases. For multiple concurrent requests, use `{ fetchingUser: bool, fetchingPosts: bool }` or a counter `loadingCount`. RTK Query tracks loading per hook automatically — prefer it for API loading. Global loading bar can listen to pending actions via middleware. Avoid one global `loading` boolean that flickers when parallel requests overlap.

**Follow-up:** RTK Query `isFetching` vs `isLoading`?

---

### Q60. What is `redux-saga` and when use it over thunk?

**Short definition:** Sagas use generator functions for complex async orchestration with cancellation and debouncing.

**Answer:** `yield takeEvery`, `call`, `put`, `fork`, and `cancel` model long-running workflows — login sequences, WebSocket reconnect loops, race conditions. More boilerplate than thunks but superior for cancellable background tasks. RTK's listener middleware covers many saga use cases now. Choose saga when team already has saga expertise or workflows need sophisticated concurrency. Thunks suffice for most CRUD apps.

**Follow-up:** Cancellation with `takeLatest`?

---

### Q61. RTK Query scenario: pagination and infinite scroll. [must-know]

**Short definition:** Use query args for page/cursor; merge pages in `serializeQueryArgs` or a custom cache strategy.

**Answer:** Pass `{ page: 1, limit: 20 }` as query args — each page is separate cache entry. For infinite scroll, use `merge` in endpoint config to append new pages to existing cache data when args change. Track `hasMore` from API response. Alternative: manual slice accumulates pages while RTK Query fetches each page. Invalidate LIST tag on filter change to reset pagination.

**Follow-up:** `merge` vs `forceRefetch`?

```javascript
getPostsPaginated: builder.query({
  query: ({ page }) => `/posts?page=${page}`,
  serializeQueryArgs: ({ queryArgs }) => queryArgs.filter,
  merge: (currentCache, newItems, { arg }) => {
    if (arg.page === 1) return newItems;
    currentCache.items.push(...newItems.items);
    currentCache.hasMore = newItems.hasMore;
  },
  forceRefetch: ({ currentArg, previousArg }) => currentArg.page !== previousArg.page,
}),
```

---

### Q62. How do you split Redux bundle for code splitting?

**Short definition:** Lazy-load feature reducers and RTK Query endpoints with dynamic injection or `injectEndpoints`.

**Answer:** Use `redux-dynamic-modules` or lazy load route-based slices by dispatching inject actions on navigation. RTK Query `injectEndpoints` splits API definitions per route. ReducerManager pattern adds/removes reducers at runtime. Ensure removed reducers do not leave stale state on re-entry unless intentional. Most apps keep one store with all reducers — code split only when bundle analysis shows Redux as significant chunk.

**Follow-up:** Dynamic reducer removal pitfalls?

---

### Q63. What is serializable check middleware?

**Short definition:** Development middleware warns when actions or state contain non-serializable values.

**Answer:** RTK's default middleware flags Promises, functions, DOM nodes, and Symbols in actions and state. Configure `serializableCheck: { ignoredActions: [FLUSH], ignoredPaths: ['items.dates'] }` for known exceptions like redux-persist actions or Date objects. Non-serializable state breaks time-travel and persist. Fix by storing IDs instead of class instances, or converting Dates to ISO strings.

**Follow-up:** Dates in normalized entities?

---

### Q64. Enterprise pattern: feature flags in Redux.

**Short definition:** Store feature flags in slice or RTK Query; selectors gate UI and routes.

**Answer:** Fetch flags from API on app init into `featuresSlice`. Selectors like `selectIsNewDashboardEnabled` read flags. Components conditionally render; routes redirect if disabled. Avoid hardcoding flags in components — centralize for A/B tests and gradual rollout. Cache flags with long TTL; refetch on interval or websocket for kill switches. Do not put flags in RTK Query if they rarely change and are needed before first query.

**Follow-up:** Flags in Context vs Redux?

---

### Q65. Summary: Redux Toolkit interview sound bite. [must-know]

**Short definition:** RTK is the standard way to manage predictable global client state with slices, thunks, and RTK Query.

**Answer:** In interviews, say: "I use Redux Toolkit for predictable global client state — slices with Immer, async thunks or RTK Query for server data, memoized selectors for performance, and normalized entities for collections. Server cache lives in RTK Query with tag-based invalidation; UI state like selection and filters lives in slices. I connect via typed hooks and structure by feature folders." Draw the unidirectional loop on a whiteboard if asked. Mention when you would not use Redux — local state and React Query alternatives.

**Follow-up:** Draw data flow on whiteboard.

---

**Total questions: 65**
