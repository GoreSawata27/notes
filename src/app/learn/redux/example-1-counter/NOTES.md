# RTK basics

Redux Toolkit (RTK) is the standard way to write Redux today.

## `createSlice`

- Defines `initialState`, reducers, and auto-generated action creators.
- Uses **Immer** — you can write `state.value += 1` inside reducers.

**This example:** `_features/counterSlice.ts`

## `configureStore`

- Combines reducers, adds default middleware (including thunk), enables DevTools.

**This example:** `_store/store.ts`

## Typed hooks

```ts
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
// useDispatch.withTypes<AppDispatch>(), useSelector.withTypes<RootState>()
```

**This example:** `_store/hooks.ts` and `../_shared/typedHooks.ts`

Next: multiple slices in Example 2 — `../example-2-todos/NOTES.md`
