# Redux & Redux Toolkit Learning Notes

A progressive, hands-on guide to **Redux** and **Redux Toolkit (RTK)** — from one-way data flow through `createSlice`, `configureStore`, async thunks, RTK Query, middleware, and testing. Each lesson builds on the last. Read the takeaway, study the explanation and code, then try the exercise.

A live playground ships with this repo at [`/learn/redux`](/learn/redux): six isolated examples from a counter to login, RTK Query, and listener middleware. Open those routes while you study so you can dispatch actions and watch DevTools.

---

## Why Redux & one-way data flow

### Lesson 1. When Redux is the right tool (and when it is not)

**Takeaway:** Redux is a predictable store for **shared client state** that many components read and write. It is not a replacement for `useState`, Server Components, or a server-state cache like TanStack Query.

**Explain:** React local state (`useState`, `useReducer`) is the right default for one component or a small subtree: open/closed, a draft input, a hover index. When the same data must survive route changes, be updated from distant screens, and stay consistent (auth session, cart, wizard step, feature flags), lifting it through props becomes painful. Redux puts that data in one store and lets any subscribed component read it.

Redux answers three questions: **what is the current state**, **what happened** (an action), and **how does state change** (a reducer). The store is the single source of truth for that client tree. Time-travel debugging, middleware, and a strict update path are the reasons teams still pick it.

```text
Good fit                          Skip Redux
------------------------------    ------------------------------
Auth session, current user        One input's draft value
Shopping cart across pages        Accordion open/closed
Multi-step wizard progress        Tooltip / modal local UI
Cross-cutting UI (theme, toast)   Server data already in RSC
Undo / DevTools / audit trail     Data you only display once
```

Do **not** copy Server Component fetch results into Redux “just in case.” If the client must mutate that data globally, store the client-owned piece (selection, draft, optimistic overlay) — not a second copy of the server cache. For server cache, prefer RTK Query or TanStack Query (Lesson 20).

**Tip:** Ask “if this component unmounted, should the value still exist?” If no, keep it local. If yes and many writers exist, consider Redux.

**Try it:** List five pieces of state in an app you know. Label each `local`, `redux`, or `server-cache`. Open [`/learn/redux`](/learn/redux) and skim the six examples so you know which lesson maps to which demo.

---

### Lesson 2. The one-way data flow: UI → action → reducer → store → UI

**Takeaway:** Data in Redux moves in one direction. The UI dispatches an action. A reducer computes the next state. The store replaces the old state. Subscribed components re-render.

**Explain:** Unlike two-way binding, nothing in a component writes the store directly. A click handler **dispatches** a description of what happened: `{ type: "counter/increment" }`. The store runs the matching reducer, which returns a **new** state tree. React-Redux notices the selected slice changed and re-renders that component.

```text
[ User event ]
      │
      ▼
 dispatch(action)  ──►  reducer(state, action)  ──►  new state
      ▲                                              │
      │                                              ▼
   UI reads via useSelector  ◄──────────────  store.notify()
```

This loop is why Redux is predictable: given the same prior state and the same action, the next state is determined. You can replay actions in [Redux DevTools](https://github.com/reduxjs/redux-devtools) and see every transition. The live counter at [`/learn/redux/example-1-counter`](/learn/redux/example-1-counter) is this loop with almost no extras.

Reducers stay **synchronous and pure**. Network calls, timers, and analytics happen in **middleware** (thunks, RTK Query, `listenerMiddleware`) — they dispatch more actions when they finish. The store never “waits” inside a reducer.

**Tip:** When debugging a wrong UI, ask: (1) did the action fire, (2) did the reducer handle it, (3) did the selector return the new value? DevTools answers (1) and (2); a `console.log` in the selector answers (3).

**Try it:** Draw the loop on paper for “Add todo.” Name the action type, the state field that changes, and which component should re-render. Then click through example 1 and watch the action log.

---

### Lesson 3. The store is a single source of truth

**Takeaway:** One Redux store holds the whole client state tree for a React tree. Features own **slices** of that tree (`state.auth`, `state.cart`), not separate stores, unless you have a rare isolated playground.

**Explain:** Classic Flux allowed many stores. Redux chose one store so every update is a single dispatch, DevTools can serialize the whole tree, and hydration has one object to load. You still organize code by feature: each slice file exports a reducer that `configureStore` **combines** under a key.

```ts
// Conceptual tree after configureStore({ reducer: { auth, cart, ui } })
{
  auth: { user: null, status: "idle" },
  cart: { items: [], coupon: null },
  ui: { sidebarOpen: true, theme: "dark" },
}
```

`store.getState()` returns that object. `store.dispatch(action)` is the only way to request a change. `store.subscribe(listener)` is how React-Redux (and DevTools) hear about updates — you almost never call `subscribe` yourself.

This repo’s playground **intentionally** creates a new `configureStore` per example so you can copy a folder. In production you usually create **one** store for the app (or one per request on the server — Lesson 12).

**Tip:** Name reducer keys after the feature, not after a component (`auth`, not `LoginPage`). Components come and go; the slice outlives any one screen.

**Try it:** In DevTools on example 1, expand the state tree. Confirm there is a `counter` key and that increment only changes `counter.value`.

---

### Lesson 4. Actions are plain objects with a `type`

**Takeaway:** An action is a plain object that must have a string `type`. Optional `payload` carries data. The type is a unique event name; the rest is arguments for the reducer.

**Explain:** Reducers cannot guess *why* state should change. You tell them with an action. The Flux Standard Action convention (what RTK uses) looks like this:

```ts
// Event: "the user incremented"
{ type: "counter/increment" }

// Event: "the user added 5"
{ type: "counter/incrementByAmount", payload: 5 }

// Event with metadata / error (async thunks use this shape)
{ type: "posts/fetch/rejected", error: { message: "Network Error" }, meta: { requestId: "…" } }
```

You rarely write these objects by hand after you adopt `createSlice`. The slice generates **action creators**: `increment()` returns `{ type: "counter/increment" }`. Calling `dispatch(increment())` is the same as dispatching that object.

Types are namespaced as `sliceName/reducerName` so two features can both have `reset` without colliding. Treat types as **events that happened**, not as setter names (`todos/todoAdded`, not `SET_TODOS`). Event names stay meaningful when you later add listeners or analytics.

**Tip:** Never put a non-serializable value (a class instance, a Promise, a DOM node) on `payload` if you want DevTools and persistence to work. Pass ids and plain data; look up objects in the reducer.

**Try it:** In the counter demo, dispatch increment a few times. In DevTools, click an action and read `type` and `payload`. Write the equivalent plain object on paper.

---

## Reducers & immutability

### Lesson 5. Reducers: pure functions that return the next state

**Takeaway:** A reducer is `(state, action) => nextState`. It is pure: no fetch, no `Date.now()`, no mutation of arguments, same inputs → same output.

**Explain:** “Reducer” comes from `Array.prototype.reduce`: you fold a list of actions over an initial state. Redux runs **one** root reducer on every dispatch. Unrelated slices return their previous state reference so React-Redux can skip those subscribers.

```ts
type CounterState = { value: number };

function counterReducer(
  state: CounterState = { value: 0 },
  action: { type: string; payload?: number },
): CounterState {
  switch (action.type) {
    case "counter/increment":
      return { ...state, value: state.value + 1 };
    case "counter/incrementByAmount":
      return { ...state, value: state.value + (action.payload ?? 0) };
    default:
      return state; // unknown actions: no change
  }
}

counterReducer({ value: 2 }, { type: "counter/increment" });
// → { value: 3 }
```

The `default` branch is mandatory. Actions for *other* slices still flow through this function; returning the same `state` reference tells subscribers nothing changed.

Handwritten `switch` reducers are how Redux still works under the hood. RTK’s `createSlice` writes this switch for you and lets you “mutate” a draft (Lesson 6 and 9). Understanding the pure function is what makes DevTools and tests make sense.

**Tip:** If you need the current time or a random id, generate it **before** dispatch (in the component or thunk) and put it on `payload`. Reducers that call `Date.now()` are harder to test and replay.

**Try it:** Implement `todosReducer` with `todos/added` and `todos/toggled`. Write two Jest assertions: add a todo, then toggle it. Do not use RTK yet.

---

### Lesson 6. Immutability: why you never mutate Redux state

**Takeaway:** Redux compares state by **reference**. If you mutate a nested field in place, the store may keep the same root reference and UI will not update. Always produce a new object for every changed level — or let Immer do it inside `createSlice`.

**Explain:** React-Redux’s `useSelector` runs after every dispatch. It checks `===` between the previous and next selected value (or a custom equality function). If you do `state.items.push(todo)` and return `state`, the array is the same reference. Subscribers that selected `state.items` see no change.

```ts
// ❌ Mutation — same references, UI may stay stale
function bad(state, action) {
  state.items.push(action.payload);
  return state;
}

// ✅ New array and new root
function good(state, action) {
  return { ...state, items: [...state.items, action.payload] };
}
```

Nested updates get noisy (`{ ...state, user: { ...state.user, name } }`). **Immer** (bundled in RTK) lets you write `state.user.name = name` on a **draft**. Immer produces the immutable copy. The draft is not the real state; mutating it outside a slice reducer is still wrong.

Serializability also depends on immutability: DevTools snapshots, `redux-persist`, and SSR hydration expect plain JSON-like trees. Mutating after the fact corrupts those snapshots.

**Tip:** Enable Redux Toolkit’s immutability check in development (on by default in `configureStore`). If you mutate outside a slice, the console will scream. Fix the mutation; do not disable the check to silence it.

**Try it:** Take your handwritten todos reducer. Intentionally `state.items.push` and return `state`. Wire it to a tiny React list. Confirm the UI does not update. Fix it with a spread (or move to `createSlice` in Lesson 9).

---

### Lesson 7. Combining reducers and owning a slice of the tree

**Takeaway:** Each feature reducer owns one key on the root state. `combineReducers` (used inside `configureStore`) calls every slice reducer with **its** slice of state and the same action.

**Explain:** You do not write one giant switch for the whole app. You write `authReducer`, `cartReducer`, `uiReducer`. The combiner does:

```ts
import { combineReducers } from "@reduxjs/toolkit";

const rootReducer = combineReducers({
  auth: authReducer,   // receives state.auth
  cart: cartReducer,   // receives state.cart
  ui: uiReducer,
});

// Equivalent to:
function rootReducer(state = {}, action) {
  return {
    auth: authReducer(state.auth, action),
    cart: cartReducer(state.cart, action),
    ui: uiReducer(state.ui, action),
  };
}
```

When `cart/itemAdded` fires, `authReducer` hits `default` and returns the same `state.auth` reference. Only `cart` gets a new object. Components that selected `state.auth` do not re-render.

**Ownership rule:** a slice may read only its own state inside its reducers. If `cart` needs `auth.user.id`, pass the id on the action payload or handle a cross-slice action in `extraReducers` (Lesson 18). Do not import another slice’s mutable state into a reducer.

**Tip:** Keep slice files next to the feature (`features/cart/cartSlice.ts`), not in a global `reducers/` dump. The playground folders under `src/app/learn/redux/example-*/_features/` show this layout.

**Try it:** Combine a `counter` reducer and a `ui` reducer (`theme: "light" | "dark"`). Dispatch `ui/toggled` and confirm `state.counter` is the same reference in a test (`expect(next.counter).toBe(prev.counter)`).

---

## Redux Toolkit: slices & store

### Lesson 8. Why Redux Toolkit replaced handwritten Redux

**Takeaway:** Redux Toolkit is the official way to write Redux. It generates action types, action creators, and immutable updates, and `configureStore` turns on DevTools and useful middleware by default.

**Explain:** Classic Redux required action type constants, action creator functions, a `switch` reducer, `combineReducers`, and a hand-built store with DevTools compose. That boilerplate hid the data-flow idea and invited mutation bugs. RTK’s motto: **the store setup should be one function, and a feature should be one slice file.**

```ts
// Classic (abridged) — types, creators, and switch you maintain by hand
const INCREMENT = "counter/increment";
const increment = () => ({ type: INCREMENT });

// RTK — same runtime behavior, one declaration
const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: {
    increment(state) {
      state.value += 1;
    },
  },
});
```

RTK still **is** Redux: same store, same actions, same DevTools. `createSlice` uses Immer. `configureStore` uses `redux-thunk` and the serializable/immutable checks. `createAsyncThunk` and `createApi` cover async. You should not add `redux-saga` or handwritten action folders unless you have a rare constraint.

New apps should depend on `@reduxjs/toolkit` and `react-redux`. You almost never import `createStore` from `redux` anymore.

**Tip:** If a tutorial still starts with `const ADD_TODO = "ADD_TODO"`, treat it as history. Translate it to a slice as you read.

**Try it:** Compare the classic switch from Lesson 5 with `src/app/learn/redux/example-1-counter/_features/counterSlice.ts` in this repo. List three things RTK generates for you.

---

### Lesson 9. `createSlice`: name, initialState, and reducers

**Takeaway:** `createSlice` is the unit of feature state. You give it a `name`, `initialState`, and a map of reducer functions. It returns `reducer`, `actions`, and `caseReducers`.

**Explain:** The `name` prefixes every generated type (`counter` + `increment` → `"counter/increment"`). `initialState` is used when the slice first runs and when you reset in tests. Each function under `reducers` becomes both a **case** in the switch and an **action creator**.

```ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type CounterState = { value: number };

const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 } satisfies CounterState,
  reducers: {
    increment(state) {
      state.value += 1; // Immer draft
    },
    incrementByAmount(state, action: PayloadAction<number>) {
      state.value += action.payload;
    },
    reset() {
      return { value: 0 }; // replacing the whole slice is OK
    },
  },
});

export const { increment, incrementByAmount, reset } = counterSlice.actions;
export default counterSlice.reducer;
```

Inside these functions, `state` is an Immer **draft**. You can assign, `push`, and `delete`. You can also `return` a new object to replace the slice. Do not mix “mutate draft” and `return` in the same case except `return` of a brand-new value.

`prepare` callbacks (next lesson) customize the payload before it reaches the reducer. `extraReducers` (Lesson 18) handle actions this slice did not define.

**Tip:** Export the reducer as `default` and the actions as named exports. Import the reducer only in the store file so components depend on actions and selectors, not on the slice object.

**Try it:** Recreate the example-1 counter slice in a scratch file. Add `decrement`. Mount it in a store (Lesson 11) and dispatch from the console via DevTools.

---

### Lesson 10. Action creators and payloads from `createSlice`

**Takeaway:** `counterSlice.actions.incrementByAmount(5)` returns `{ type: "counter/incrementByAmount", payload: 5 }`. `PayloadAction<T>` types that payload. Use `prepare` when the reducer should not decide ids or timestamps.

**Explain:** Action creators are functions. With no argument, the payload is `undefined`. With one argument, that value **is** the payload. RTK does not wrap extra arguments — pass one object if you need several fields.

```ts
const todosSlice = createSlice({
  name: "todos",
  initialState: [] as { id: string; text: string; done: boolean }[],
  reducers: {
    todoAdded: {
      reducer(state, action: PayloadAction<{ id: string; text: string }>) {
        state.push({ ...action.payload, done: false });
      },
      prepare(text: string) {
        return { payload: { id: crypto.randomUUID(), text } };
      },
    },
    todoToggled(state, action: PayloadAction<string>) {
      const todo = state.find((t) => t.id === action.payload);
      if (todo) todo.done = !todo.done;
    },
  },
});

todosSlice.actions.todoAdded("Write notes");
// { type: "todos/todoAdded", payload: { id: "…", text: "Write notes" } }
```

`prepare` runs in the action creator, **before** dispatch reaches the reducer. That keeps the reducer pure (Lesson 5) while still generating ids. You can also attach `meta` from `prepare` for analytics.

Generated creators have a `type` property: `todoAdded.type === "todos/todoAdded"`. Use that in listeners and tests instead of stringly-typed comparisons.

**Tip:** Prefer `PayloadAction<string>` (an id) over passing a whole entity the UI already has, when the slice can look the entity up. Smaller payloads are easier to read in DevTools.

**Try it:** Add `todoAdded` with `prepare` to a todos slice. Write a test that `todoAdded("x").payload.id` is a string and `payload.text` is `"x"`. Open [`/learn/redux/example-2-todos`](/learn/redux/example-2-todos) and compare.

---

### Lesson 11. `configureStore`: reducer map, DevTools, and defaults

**Takeaway:** `configureStore` creates the store, combines reducers, adds thunk middleware, enables DevTools in development, and turns on immutability and serializability checks.

**Explain:** Pass a `reducer` object whose keys become state keys. That is usually all you need.

```ts
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../_features/counterSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

`RootState` and `AppDispatch` are inferred from the store. You will use them for typed hooks (Lesson 15). If you later add RTK Query, you put `api.reducer` in this map and `api.middleware` in `middleware` (Lesson 21).

Defaults you inherit:

- **redux-thunk** — `dispatch` can accept functions (thunks).
- **serializableCheck** — warns on non-JSON values in actions/state.
- **immutableCheck** — warns if you mutate state outside Immer.
- **DevTools** — compose with the browser extension.

`getDefaultMiddleware()` lets you prepend `listenerMiddleware` or concat `api.middleware` without dropping those defaults (Lessons 26–27).

**Tip:** Do not copy a custom `middleware: () => [thunk]` from old tutorials — you will lose the safety checks. Always start from `getDefaultMiddleware()`.

**Try it:** Create a store with `counter` and log `store.getState()`. `store.dispatch(increment())` and log again. This is the same store file as example 1.

---

### Lesson 12. `Provider`: wiring the store in React and Next.js

**Takeaway:** React-Redux’s `<Provider store={store}>` makes the store available to `useSelector` and `useDispatch`. In the Next.js App Router, the provider must live in a **Client Component** so the store is not created on the server per render unless you intend that.

**Explain:** Without `Provider`, hooks throw. Wrap the part of the tree that needs the store — usually the whole app.

```tsx
// app/StoreProvider.tsx
"use client";

import { Provider } from "react-redux";
import { store } from "./store";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}

// app/layout.tsx (Server Component — OK to import a client provider)
import { StoreProvider } from "./StoreProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
```

A module-level `export const store` is fine for a client-only SPA and for this repo’s `/learn/redux` examples. For **SSR with per-request state**, create the store inside the provider with `useRef` so each request/browser tab gets its own instance and you do not leak user A’s cart to user B.

The playground examples each wrap only their page so stores stay isolated — copy that idea when you want a demo, not when you ship one product store.

**Tip:** Keep the store module free of React. Components import hooks; only `StoreProvider` imports `Provider`. That split keeps tests able to create a fresh store (Lesson 29).

**Try it:** Wrap a page with `Provider`, render a component that `useSelector`s `state.counter.value`, and confirm it throws if you comment out `Provider`.

---

## Reading and writing from React

### Lesson 13. `useSelector`: subscribe to the pieces you need

**Takeaway:** `useSelector(selector)` runs `selector(store.getState())` after every dispatch and re-renders the component only when the **selected value** changes by `===` (or your equality fn).

**Explain:** Select the smallest value that the component needs. Selecting `state` (the whole tree) re-renders on every action anywhere.

```tsx
import { useSelector } from "react-redux";
import type { RootState } from "./store";

function CounterReadout() {
  const value = useSelector((state: RootState) => state.counter.value);
  return <p aria-live="polite">{value}</p>;
}
```

The selector should be a **pure** function of state. Do not dispatch inside it. Avoid creating a new object every time unless you use `shallowEqual` as the second argument:

```tsx
import { shallowEqual, useSelector } from "react-redux";

const { name, role } = useSelector(
  (state: RootState) => ({ name: state.auth.user?.name, role: state.auth.user?.role }),
  shallowEqual,
);
```

Without `shallowEqual`, `{ name, role }` is a new object every run, so the component always re-renders. Better: two `useSelector` calls, or a memoized `createSelector` (Lesson 16).

`useSelector` is how the one-way loop closes. It is a subscription, not a one-shot read. For a one-shot read in an event handler, use `store.getState()` or the `getState` from a thunk.

**Tip:** If a component re-renders “too often,” log the selector result and the action type in DevTools. The usual culprit is selecting a new object/array each time.

**Try it:** In example 2, add a component that selects `state.todos` (the array) vs one that selects `state.todos.length`. Dispatch a UI-only action if the slice has one, and notice which component re-renders.

---

### Lesson 14. `useDispatch`: sending actions from the UI

**Takeaway:** `useDispatch()` returns the store’s `dispatch`. Event handlers call `dispatch(actionCreator(payload))`. Do not dispatch during render.

**Explain:** Components describe events; they do not compute next state.

```tsx
"use client";

import { useDispatch, useSelector } from "react-redux";
import { increment, incrementByAmount, reset } from "./counterSlice";
import type { RootState } from "./store";

export function CounterDemo() {
  const value = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <p>{value}</p>
      <button type="button" onClick={() => dispatch(increment())}>
        +1
      </button>
      <button type="button" onClick={() => dispatch(incrementByAmount(5))}>
        +5
      </button>
      <button type="button" onClick={() => dispatch(reset())}>
        Reset
      </button>
    </div>
  );
}
```

`dispatch` is stable — it does not change between renders — so it is safe to omit from hook dependency arrays. What you dispatch can be a plain action, a thunk, or an RTK Query initiate call. Type it as `AppDispatch` (next lesson) so thunks type-check.

Never `dispatch` in the component body. That would dispatch every render and can loop. Side effects belong in handlers, `useEffect` (rare for Redux), or listener middleware.

**Tip:** If a handler needs current state **and** a dispatch, prefer a thunk (`dispatch(saveDraft())`) so the logic is testable without rendering the component.

**Try it:** Wire increment/decrement/reset like example 1. Use the keyboard: bind `+` and `-` in a `keydown` handler that dispatches. Confirm DevTools shows one action per keypress.

---

### Lesson 15. Typed hooks: `RootState`, `AppDispatch`, `useAppSelector`

**Takeaway:** Infer `RootState` and `AppDispatch` from the store, then wrap `useSelector` / `useDispatch` once. Components import `useAppSelector` and `useAppDispatch` so they never repeat `(state: RootState)`.

**Explain:** Untyped `useDispatch()` is `(action: UnknownAction) => void` and **rejects** thunks. `AppDispatch` includes thunk types from `configureStore`.

```ts
// store.ts
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// hooks.ts
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

```tsx
const user = useAppSelector((state) => state.auth.user);
const dispatch = useAppDispatch();
dispatch(login({ email, password })); // thunk: OK
```

`withTypes` is the RTK / React-Redux 9 pattern. Older code used `TypedUseSelectorHook<RootState>`. Same idea.

Keep `hooks.ts` next to the store, not inside a feature. Features import the hooks; they do not create their own. When you add a slice, `RootState` updates automatically because it is inferred from `getState`.

**Tip:** If TypeScript complains that a thunk is not assignable to `UnknownAction`, you forgot `AppDispatch`. Fix the hook; do not `as any`.

**Try it:** Convert example 1 to typed hooks. Add a thunk that reads `getState().counter.value` and only increments when `value < 10`. Confirm the thunk type-checks only with `useAppDispatch`.

---

### Lesson 16. Selectors and `createSelector` for derived data

**Takeaway:** Put derived data in **selectors**, not in every component. `createSelector` memoizes so a filtered list is not recomputed unless its inputs change.

**Explain:** A selector is `(state) => T`. Simple ones are one-liners: `(s) => s.todos.items`. Derived ones filter, sort, or join slices:

```ts
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./store";

const selectTodos = (state: RootState) => state.todos.items;
const selectFilter = (state: RootState) => state.ui.filter;

export const selectFilteredTodos = createSelector(
  [selectTodos, selectFilter],
  (items, filter) => {
    if (filter === "done") return items.filter((t) => t.done);
    if (filter === "open") return items.filter((t) => !t.done);
    return items;
  },
);

export const selectOpenCount = createSelector([selectTodos], (items) => items.filter((t) => !t.done).length);
```

`createSelector` recomputes the output only when `items` or `filter` change by reference. The **output** is also referentially stable if the inputs did not change — that is what keeps `useSelector` from re-rendering.

Do not create a new `createSelector` **inside** a component on every render; define it at module scope. For selectors that take a parameter (an id), use `createSelector` with a factory or the v5 `createSelector` input that reads args.

Example 2 in the playground keeps filter logic in selectors — copy that habit.

**Tip:** If a selector returns a new array every time without memoization, every consumer re-renders on unrelated actions. Memoize or select a primitive.

**Try it:** Write `selectFilteredTodos` and use it from two components. Change `ui.filter` and confirm both update. Dispatch an unrelated action and confirm the selector’s result is `===` to the previous one.

---

## Async thunks

### Lesson 17. `createAsyncThunk`: pending, fulfilled, and rejected

**Takeaway:** Reducers stay sync. `createAsyncThunk` turns an async function into a thunk that dispatches `pending`, then `fulfilled` or `rejected`, with typed payloads.

**Explain:** A thunk is a function that receives `(dispatch, getState)`. `createAsyncThunk` writes that function and standardizes the three lifecycle actions.

```ts
import { createAsyncThunk } from "@reduxjs/toolkit";

type Post = { id: number; title: string };

export const fetchPosts = createAsyncThunk<Post[], void, { rejectValue: string }>(
  "posts/fetch",
  async (_, { rejectWithValue }) => {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    if (!res.ok) return rejectWithValue("Could not load posts");
    return (await res.json()) as Post[];
  },
);
```

Dispatch `fetchPosts()` from a button or `useEffect`. The thunk:

1. Dispatches `{ type: "posts/fetch/pending", meta: { requestId } }`.
2. Awaits your callback.
3. Dispatches `fulfilled` with `payload` = return value, or `rejected` with `error` / `rejectWithValue`.

The slice does **not** fetch. It only reacts to those three actions in `extraReducers` (next lesson). See [`/learn/redux/example-3-async-thunk`](/learn/redux/example-3-async-thunk) for a full posts list, and example 4 for login against `/learn/redux/api/mock-auth`.

`condition` can skip a dispatch if data is already fresh. `abort` via `thunkApi.signal` cancels in-flight work when the component unmounts if you pass the signal to `fetch`.

**Tip:** Use `rejectWithValue` for expected domain errors (401, validation). Let unexpected throws become `rejected` with `error.message` so you can distinguish “wrong password” from “TypeError”.

**Try it:** Write `fetchPosts` against any JSON API. Log the three action types in DevTools. Click fetch twice quickly and notice two `requestId`s.

---

### Lesson 18. `extraReducers`: handling thunks and external actions

**Takeaway:** `reducers` define actions **this slice creates**. `extraReducers` handle actions **created elsewhere** — async thunks, another slice’s logout, an RTK Query matcher.

**Explain:** Thunk action creators are not listed under `reducers`, so the slice would ignore them without `extraReducers`. The builder API is the current style:

```ts
const postsSlice = createSlice({
  name: "posts",
  initialState: { items: [] as Post[], status: "idle" as "idle" | "loading" | "succeeded" | "failed", error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Unknown error";
      });
  },
});
```

`addMatcher` handles groups (`isAnyOf(login.fulfilled, logout)`). `addDefaultCase` is rarely needed. You can also `addCase(otherSlice.actions.reset, …)` so logout clears cart.

Do not put the same action type in both `reducers` and `extraReducers`. Keep “this feature’s verbs” in `reducers` and “reactions to the world” in `extraReducers`.

**Tip:** Handle `pending` even if the UI only checks `status === "loading"`. Clearing `error` on `pending` prevents a stale error flash.

**Try it:** Add `extraReducers` for `fetchPosts`. In a test, `dispatch(fetchPosts.fulfilled(mockPosts, "req", undefined))` and assert `state.items`. You can dispatch the action creator’s lifecycle actions without hitting the network.

---

### Lesson 19. Loading, error, and request lifecycle in the slice

**Takeaway:** Model async UI as explicit fields: `status`, `error`, and sometimes `currentRequestId`. The component renders from those fields; it does not track its own `isLoading` duplicate.

**Explain:** A good async slice looks like a small state machine: `idle → loading → succeeded | failed`. Login (example 4) is the interview version of this: form submit → `login.pending` → spinner → `fulfilled` stores user or `rejected` shows a message.

```ts
.addCase(login.pending, (state, action) => {
  state.status = "loading";
  state.error = null;
  state.currentRequestId = action.meta.requestId;
})
.addCase(login.fulfilled, (state, action) => {
  if (state.currentRequestId !== action.meta.requestId) return; // stale
  state.status = "succeeded";
  state.user = action.payload.user;
  state.currentRequestId = undefined;
})
```

Ignoring stale responses matters when the user fires two logins or a fetch is aborted. Compare `action.meta.requestId` to the one you stored on `pending`.

Components:

```tsx
const { status, error, user } = useAppSelector((s) => s.auth);
if (status === "loading") return <p>Signing in…</p>;
if (status === "failed") return <p role="alert">{error}</p>;
```

Do not store the password in the slice. Do not put the JWT in a place you would log. Persist tokens in `httpOnly` cookies when you can; if you must keep a client token, treat the slice as sensitive.

**Tip:** Prefer one `status` discriminant over `isLoading` + `isError` + `isSuccess` booleans that can contradict each other.

**Try it:** Open [`/learn/redux/example-4-login`](/learn/redux/example-4-login). Submit wrong then right credentials. Sketch the status transitions you see in DevTools.

---

### Lesson 20. Thunks vs RTK Query: choosing the right async tool

**Takeaway:** Use **createAsyncThunk** for client workflows (login that writes `auth` + navigates). Use **RTK Query** for cacheable server data (lists, details, mutations that invalidate lists). Do not fetch the same REST resource both ways.

**Explain:** A thunk is “run this async work and dump the result into **my** slice.” You own loading flags, deduping, and cache. That is correct for **auth**, **checkout**, and one-shot commands.

RTK Query is “this endpoint has a cache key; components subscribe to it.” It dedupes in-flight requests, refetches on focus, and invalidates via tags (Lessons 21–25). Example 5 in the playground is the same mock auth API as example 4, rewritten with `createApi` — compare them.

```text
Thunk                              RTK Query
-------------------------------    --------------------------------
Writes a feature slice you own     Writes api.queries cache
You invent status/error            Generated isLoading / data / error
Good: login, logout, analytics     Good: posts, users, search
You invalidate by hand             Tags + invalidateTags
```

Mixing both is normal: `auth` slice via thunk + `createApi` for the rest of the backend. The store then has `auth` and `api` keys.

TanStack Query (the `10-react-query.md` track) solves the same server-cache problem outside Redux. Pick **one** server cache for a given resource.

**Tip:** If you are about to store `entities` + `ids` + `status` for a REST list, stop and write an RTK Query endpoint instead.

**Try it:** Write one sentence: “I would load the post list with ____ because ____.” Then open example 3 and example 5 and see which code you would rather maintain.

---

## RTK Query

### Lesson 21. `createApi`: endpoints, `baseQuery`, and `reducerPath`

**Takeaway:** `createApi` defines a set of endpoints, a `baseQuery` (usually `fetchBaseQuery`), and a `reducerPath`. It produces a reducer and middleware you must add to `configureStore`.

**Explain:** One API slice per backend (or per bounded context). Endpoints are `query` (GET-like, cached) or `mutation` (writes).

```ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const postsApi = createApi({
  reducerPath: "postsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Post"],
  endpoints: (build) => ({
    getPosts: build.query<Post[], void>({
      query: () => "/posts",
      providesTags: ["Post"],
    }),
    addPost: build.mutation<Post, { title: string }>({
      query: (body) => ({ url: "/posts", method: "POST", body }),
      invalidatesTags: ["Post"],
    }),
  }),
});

export const { useGetPostsQuery, useAddPostMutation } = postsApi;
```

Store:

```ts
export const store = configureStore({
  reducer: {
    [postsApi.reducerPath]: postsApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(postsApi.middleware),
});
```

Forgetting the middleware means queries never run. Forgetting the reducer means the cache has nowhere to live. `reducerPath` must be unique if you have two APIs.

Example 5 uses `baseUrl: "/learn/redux/api"` against this app’s mock routes — a good template for Next.js.

**Tip:** Import from `@reduxjs/toolkit/query/react` in React apps so hooks are generated. The non-React entry point is for vanilla or React Native custom wrappers.

**Try it:** Add `postsApi` to a store. In DevTools, find the `postsApi` state after a query. Confirm `middleware` is concatenated, not replaced.

---

### Lesson 22. Generated hooks: queries and mutations

**Takeaway:** `useGetPostsQuery()` subscribes to the cache. `useAddPostMutation()` returns a trigger function. Multiple components with the same hook arguments share one request and one cached result.

**Explain:** Query hooks return a rich result: `data`, `currentData`, `error`, `isLoading` (no data yet), `isFetching` (any in-flight), `isSuccess`, `refetch`, `fulfilledTimeStamp`.

```tsx
function PostList() {
  const { data, isLoading, isFetching, error } = useGetPostsQuery();

  if (isLoading) return <p>Loading…</p>;
  if (error) return <p role="alert">Could not load posts</p>;

  return (
    <div>
      {isFetching && <p>Refreshing…</p>}
      <ul>{data?.map((p) => <li key={p.id}>{p.title}</li>)}</ul>
    </div>
  );
}

function AddPost() {
  const [addPost, { isLoading }] = useAddPostMutation();
  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={() => addPost({ title: "New" })}
    >
      Add
    </button>
  );
}
```

Hook arguments become the cache key: `useGetPostQuery(id)` is a different cache entry per `id`. Skipping a query uses `skip: true` or `skipToken`.

Mutations are not cached like queries. Their result lives until the next trigger unless you read it from the hook tuple.

**Tip:** Use `isLoading` for the first paint and `isFetching` for a quiet refresh indicator. Do not unmount the whole list on every refetch.

**Try it:** Mount `PostList` twice on one page with the same query. Watch the network tab — you should see **one** request. This is the point of the cache.

---

### Lesson 23. Cache tags: `providesTags` and `invalidatesTags`

**Takeaway:** Tags are labels on cached queries. A mutation that `invalidatesTags: ["Post"]` marks those queries stale so they refetch. List + detail tags keep invalidation precise.

**Explain:** Without tags you would call `refetch()` in every component. Tags let the API slice declare relationships:

```ts
getPosts: build.query<Post[], void>({
  query: () => "/posts",
  providesTags: (result) =>
    result
      ? [...result.map(({ id }) => ({ type: "Post" as const, id })), { type: "Post", id: "LIST" }]
      : [{ type: "Post", id: "LIST" }],
}),
getPost: build.query<Post, number>({
  query: (id) => `/posts/${id}`,
  providesTags: (_r, _e, id) => [{ type: "Post", id }],
}),
updatePost: build.mutation<Post, Pick<Post, "id" | "title">>({
  query: ({ id, ...body }) => ({ url: `/posts/${id}`, method: "PATCH", body }),
  invalidatesTags: (_r, _e, { id }) => [{ type: "Post", id }],
}),
addPost: build.mutation<Post, { title: string }>({
  query: (body) => ({ url: "/posts", method: "POST", body }),
  invalidatesTags: [{ type: "Post", id: "LIST" }],
}),
```

Updating post `3` refetches `getPost(3)` and any list that provided `{ type: "Post", id: 3 }`. Adding a post invalidates `LIST` so the collection refetches, without necessarily refetching every detail.

`tagTypes` on `createApi` is the allowlist. A typo in a tag type is a silent no-op — declare types first.

**Tip:** Invalidate the **smallest** tag that must change. Broad `invalidatesTags: ["Post"]` is a blunt instrument that refetches everything.

**Try it:** Sketch tags for `Comment` on a post. Which mutation invalidates the post’s comment list but not the posts index?

---

### Lesson 24. Cache lifetime: `keepUnusedDataFor`, refetch on focus

**Takeaway:** A query stays subscribed while a hook is mounted. After the last subscriber unmounts, RTK Query keeps the data for `keepUnusedDataFor` seconds (default 60), then garbage-collects. Refetch-on-focus keeps long-lived screens honest.

**Explain:** Navigate away from a list, come back in 10 seconds, and you see cached data instantly while a refetch may run. Come back after the unused timer and you get a full load.

```ts
export const postsApi = createApi({
  reducerPath: "postsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  keepUnusedDataFor: 120, // seconds after last unsubscribe
  refetchOnFocus: true,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: 30, // refetch if older than 30s
  endpoints: (build) => ({
    getPosts: build.query<Post[], void>({
      query: () => "/posts",
      keepUnusedDataFor: 15, // override per endpoint
    }),
  }),
});
```

`refetchOnMountOrArgChange: true` always refetches when a component mounts. A number means “refetch if the cache is older than N seconds.” That is the closest RTK Query equivalent to TanStack Query’s `staleTime`.

Polling uses `pollingInterval` on the hook. Disable refetch-on-focus for expensive admin reports if the flicker is worse than staleness.

**Tip:** For user-specific data, reset the API cache on logout: `dispatch(postsApi.util.resetApiState())` so the next user never sees the previous cache.

**Try it:** Set `keepUnusedDataFor: 5` on a query. Mount, unmount, wait 6 seconds, remount. Confirm a new network request. Then remount within 2 seconds and confirm a cache hit.

---

### Lesson 25. Transforming responses and optimistic updates in RTK Query

**Takeaway:** `transformResponse` reshapes server JSON before it hits the cache. Optimistic updates use `onQueryStarted` with `api.util.updateQueryData` and `patchResult.undo()` on failure.

**Explain:** Servers rarely return the exact view model. Transform at the boundary so components stay dumb:

```ts
getPosts: build.query<Post[], void>({
  query: () => "/posts",
  transformResponse: (raw: { data: Post[] }) => raw.data,
}),
```

Optimistic update (mutation):

```ts
toggleTodo: build.mutation<Todo, { id: string; done: boolean }>({
  query: ({ id, done }) => ({ url: `/todos/${id}`, method: "PATCH", body: { done } }),
  async onQueryStarted({ id, done }, { dispatch, queryFulfilled }) {
    const patch = dispatch(
      todosApi.util.updateQueryData("getTodos", undefined, (draft) => {
        const todo = draft.find((t) => t.id === id);
        if (todo) todo.done = done;
      }),
    );
    try {
      await queryFulfilled;
    } catch {
      patch.undo();
    }
  },
}),
```

The UI flips immediately. If the request fails, `undo` restores the cached list. Pair this with tags if other endpoints must stay consistent.

`updateQueryData` uses Immer drafts — same mutation style as `createSlice`.

**Tip:** Optimistic updates are for **reversible, likely-to-succeed** actions (toggle, rename). Do not optimistically delete the current user’s account.

**Try it:** Implement toggle with `onQueryStarted` and force the mock API to fail. Confirm the checkbox rolls back. Compare with TanStack Query’s `onMutate` in the React Query track.

---

## Middleware, listeners & testing

### Lesson 26. Middleware: the pipeline around `dispatch`

**Takeaway:** Middleware wraps `dispatch`. Each piece can log, delay, translate, or swallow an action before it reaches the reducer. Thunks and RTK Query **are** middleware.

**Explain:** The store pipeline is:

```text
dispatch(action)
  → middleware1
    → middleware2
      → reducer  →  new state  →  subscribers
```

A logger middleware:

```ts
import type { Middleware } from "@reduxjs/toolkit";

export const logger: Middleware = (store) => (next) => (action) => {
  console.log("dispatch", action);
  const result = next(action);
  console.log("next state", store.getState());
  return result;
};

// configureStore
middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
```

`next(action)` passes the action down. If you omit `next`, the reducer never runs. Async middleware can `next` later or dispatch extra actions.

Order matters: RTK Query’s middleware should be in the chain (via `.concat(api.middleware)`). Listener middleware is usually **prepended** so it sees actions early (next lesson).

You do not need custom middleware for most apps. Prefer listeners for “when X happens, do Y.” Use custom middleware for cross-cutting logging or feature flags on every dispatch.

**Tip:** Keep middleware pure of UI. Do not import React components into middleware. Dispatch actions; let React render.

**Try it:** Add a 5-line logger in development only. Dispatch increment and confirm two logs. Remove it before you commit — DevTools already does this job.

---

### Lesson 27. `listenerMiddleware`: side effects without sagas

**Takeaway:** `createListenerMiddleware` runs an `effect` when an action matches. Use it for analytics, toasts, persistence, and chaining (“after login.fulfilled, fetch posts”). It replaces most saga/observable use cases.

**Explain:** Listeners are registered with `startListening` and a `predicate`, `actionCreator`, or `matcher`.

```ts
import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { login, logout } from "../auth/authSlice";
import { fetchPosts } from "../posts/postsSlice";

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: isAnyOf(login.fulfilled, logout),
  effect: async (action, api) => {
    if (login.fulfilled.match(action)) {
      api.dispatch(fetchPosts());
    }
    if (logout.match(action)) {
      localStorage.removeItem("session");
    }
  },
});
```

Store:

```ts
middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware().prepend(listenerMiddleware.middleware),
```

`api.getState()`, `api.dispatch`, `api.delay`, `api.cancelActiveListeners`, and `api.take` cover waiting and cancellation. Effects can be async. They should not throw uncaught — wrap in try/catch.

This repo’s [`/learn/redux/example-6-patterns`](/learn/redux/example-6-patterns) logs auth and posts actions through a listener. Read `_store/listenerMiddleware.ts`.

**Tip:** If two slices must stay in sync, prefer `extraReducers` on the reacting slice (same dispatch, no extra tick). Use a listener when the reaction is **not** a state update (navigation, storage, a second thunk).

**Try it:** Start a listener on `increment` that `console.info`s the new value from `getState`. Then change it to persist `value` to `sessionStorage`. Refresh and rehydrate in `initialState` if you want extra credit.

---

### Lesson 28. Serializability checks and other store middleware

**Takeaway:** `configureStore` warns when actions or state contain Promises, class instances, or functions. Those checks keep DevTools, persistence, and SSR honest. You can ignore specific paths; you should not turn the check off globally to hide a bug.

**Explain:** Redux state should be JSON-serializable: objects, arrays, numbers, strings, booleans, `null`. Dates should be ISO strings. Map/Set should be arrays or records.

```ts
middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      ignoredPaths: ["auth.socket"], // last resort
    },
    immutableCheck: { warnAfter: 128 },
  }).concat(postsApi.middleware),
```

RTK Query and redux-persist put a few non-serializable values in actions; the community lists those action types as ignored. A **FormData** upload should happen inside a thunk or `baseQuery`, not as `action.payload`.

`immutableCheck` walks the state tree in development to detect mutations after the reducer returned. Large states can make this slow — raise `warnAfter` or disable in a known-heavy slice, but keep it on while you learn.

**Tip:** The serializability error’s stack tells you **which action** introduced the bad value. Fix that action’s payload; do not silence the middleware first.

**Try it:** Dispatch `{ type: "debug/bad", payload: new Date() }` from DevTools and read the warning. Change the payload to `new Date().toISOString()` and confirm the warning disappears.

---

### Lesson 29. Testing slices, thunks, and selectors

**Takeaway:** Test reducers as pure functions, thunks with a real store plus a mocked `fetch`, and selectors with fixture state. You rarely need to render React to know a slice is correct.

**Explain:** Slice tests dispatch actions into a tiny store or call the reducer directly:

```ts
import { configureStore } from "@reduxjs/toolkit";
import counterReducer, { increment, incrementByAmount } from "./counterSlice";

function makeStore() {
  return configureStore({ reducer: { counter: counterReducer } });
}

test("incrementByAmount adds the payload", () => {
  const store = makeStore();
  store.dispatch(increment());
  store.dispatch(incrementByAmount(4));
  expect(store.getState().counter.value).toBe(5);
});
```

Thunk tests mock the network:

```ts
beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => [{ id: 1, title: "Hello" }],
  });
});

test("fetchPosts stores items", async () => {
  const store = makeStore();
  await store.dispatch(fetchPosts());
  expect(store.getState().posts.items).toHaveLength(1);
  expect(store.getState().posts.status).toBe("succeeded");
});
```

Selector tests pass a **fake** `RootState` — no store required. Prefer `toEqual` on data and `toBe` on memoized references when you assert memoization.

MSW (see the Jest learning track) is cleaner than mocking `fetch` once you have several endpoints.

**Tip:** Dispatch `fetchPosts.fulfilled(posts, "id", undefined)` when you only want to test `extraReducers`, not the HTTP layer.

**Try it:** Write three tests for your todos slice: add, toggle, and “unknown action leaves state ===”. Then add one thunk test that handles `ok: false`.

---

### Lesson 30. Testing connected components and the live playground

**Takeaway:** Component tests wrap the tree in a `Provider` with a **fresh** store per test. The [`/learn/redux`](/learn/redux) playground is the manual equivalent: six isolated stores you can click through before an interview.

**Explain:** Extract a test helper so every test starts from a known state:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import counterReducer, { increment } from "./counterSlice";
import { CounterDemo } from "./CounterDemo";

function renderWithStore(preloaded?: { counter: { value: number } }) {
  const store = configureStore({
    reducer: { counter: counterReducer },
    preloadedState: preloaded,
  });
  const ui = render(
    <Provider store={store}>
      <CounterDemo />
    </Provider>,
  );
  return { store, ...ui };
}

test("shows preloaded value and increments", async () => {
  const user = userEvent.setup();
  renderWithStore({ counter: { value: 3 } });
  expect(screen.getByText("3")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /\+1/i }));
  expect(screen.getByText("4")).toBeInTheDocument();
});
```

Do not import the app’s singleton store in tests — leftover state leaks between cases. For RTK Query, use `postsApi.util.resetApiState()` or a new store each time, and prefer MSW over mocking hooks.

**Study path for this repo:**

| Lesson themes | Playground |
| ------------- | ---------- |
| Slices, store, hooks | [`/learn/redux/example-1-counter`](/learn/redux/example-1-counter) |
| Selectors, extra UI slice | [`/learn/redux/example-2-todos`](/learn/redux/example-2-todos) |
| `createAsyncThunk` | [`/learn/redux/example-3-async-thunk`](/learn/redux/example-3-async-thunk) |
| Login lifecycle | [`/learn/redux/example-4-login`](/learn/redux/example-4-login) |
| `createApi` + tags | [`/learn/redux/example-5-rtk-query`](/learn/redux/example-5-rtk-query) |
| `listenerMiddleware` | [`/learn/redux/example-6-patterns`](/learn/redux/example-6-patterns) |

Interview Q&A lives at [`/notes/redux`](/notes/redux). Use the playground to *show* the data flow, then the interview notes to *say* it out loud.

**Tip:** In an interview, walk the one-way loop first, then say “RTK’s `createSlice` writes the reducer; thunks/RTK Query handle async; listeners handle side effects.” That sentence is this entire track.

**Try it:** Render `CounterDemo` with RTL as above. Then sit down with DevTools on all six `/learn/redux` examples and explain each action you click to a rubber duck (or a teammate).
