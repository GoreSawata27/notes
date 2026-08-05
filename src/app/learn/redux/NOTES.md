# Redux mindset

## One-way data flow

1. **State** lives in a single store (for a given React tree).
2. **UI** reads state via selectors (`useSelector` / typed `useAppSelector`).
3. **Events** dispatch plain actions or async thunks.
4. **Reducers** compute the next state (pure functions).

```text
User click → dispatch(action) → reducer → new state → UI re-renders
```

## When Redux helps

- Many components need the same client state (auth session, cart, wizard step).
- Updates come from many places and you want predictable transitions.
- You need time-travel debugging (DevTools) or middleware (logging, analytics).

## When to skip Redux

- Local UI state (open/closed, one input) → `useState`.
- Server data already loaded in RSC → pass props; don’t duplicate in Redux unless the client must mutate/sync it globally.

## Track map

| Level | Route | Notes file |
|-------|-------|------------|
| 1 | `/learn/redux/example-1-counter` | `example-1-counter/NOTES.md` |
| 2 | `/learn/redux/example-2-todos` | `example-2-todos/NOTES.md` |
| 3 | `/learn/redux/example-3-async-thunk` | `example-3-async-thunk/NOTES.md` |
| 4 | `/learn/redux/example-4-login` | `example-4-login/NOTES.md` |
| 5 | `/learn/redux/example-5-rtk-query` | `example-5-rtk-query/NOTES.md` |
| 6 | `/learn/redux/example-6-patterns` | `example-6-patterns/NOTES.md` |

## Interview checklist (quick)

- Async: reducers stay sync; use **thunks** or **RTK Query**. Dispatch → pending → network → fulfilled/rejected.
- Login: form dispatches login thunk → loading → store user/token or show error.
- Structure: feature folders, typed hooks, listener middleware for cross-cutting effects.
- Don’t mirror RSC/server cache in Redux without a client-global need.
