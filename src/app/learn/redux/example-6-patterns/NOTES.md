# Production patterns

## Composing features

One `configureStore` can mount reducers from separate feature folders (here: auth + posts reducers reused from Examples 3 & 4).

## Listener middleware

Side effects that react to actions (logging, analytics, cross-slice workflows) live in `createListenerMiddleware` instead of inside reducers.

**Files:** `_store/store.ts`, `_store/listenerMiddleware.ts`

## Typed hooks

Always export `RootState` / `AppDispatch` and use typed `useAppDispatch` / `useAppSelector`.

## What not to put in Redux

- Data Next.js already fetched on the server for a page (RSC props) — pass it down.
- Ephemeral local UI (one modal on one screen) — `useState`.

Use Redux when **many client components** need the same mutable client-global state (session, cart, multi-step flow).

## Interview checklist

- Async: thunks or RTK Query; never async in reducers.
- Login: dispatch → pending → fulfilled/rejected; clear errors on retry.
- Hub overview: `../NOTES.md`
