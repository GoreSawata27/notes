# RTK Query

RTK Query is part of Redux Toolkit for **server state**: fetching, caching, invalidation, loading/error flags.

## Core pieces

- **`createApi`** — defines endpoints (queries = GET-ish, mutations = POST/PUT/DELETE).
- **`fetchBaseQuery`** — wrapper around `fetch`; use `prepareHeaders` for auth tokens.
- **Generated hooks** — `useGetXQuery`, `useLoginMutation`, etc.
- **Middleware + reducer** — must add `api.middleware` and `api.reducer` to the store.

## Thunk vs RTK Query

| Use case | Prefer |
|----------|--------|
| One-off imperative action (login, submit form) | Thunk or mutation |
| Lists/details with cache, refetch, tags | RTK Query |
| Complex orchestration across many APIs | Mix: RTK Query + listeners |

**This example:** `_features/authApi.ts`, `_features/authSessionSlice.ts`, `_store/store.ts`

After login mutation, `getMe` query runs with `Authorization: Bearer <token>` against `../api/mock-me/route.ts`.

Compare manual thunk login in Example 4 (`../example-4-login/NOTES.md`).
