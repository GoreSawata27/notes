# Async with `createAsyncThunk`

## Pattern

1. Define thunk: `createAsyncThunk('posts/fetch', async () => { ... })`
2. In slice `extraReducers`, handle:
   - `.pending` → set loading
   - `.fulfilled` → store data
   - `.rejected` → store error (`action.payload` if you used `rejectWithValue`)

## Status enum (common in production)

```ts
status: 'idle' | 'loading' | 'succeeded' | 'failed'
```

Disable buttons when `loading`. Show error from `state.error`.

## Interview: “How do you handle async API calls in Redux?”

- Use **`createAsyncThunk`** (or RTK Query for server cache).
- Never put async logic inside the reducer — reducers stay synchronous.
- Flow: **dispatch thunk → pending → await fetch → fulfilled/rejected → UI subscribed via selectors updates**.

**This example:** `_features/postsSlice.ts`, `_components/PostsDemo.tsx`

Compare with manual `useReducer` + `FETCH_START` in `src/app/practice/reducer`.
