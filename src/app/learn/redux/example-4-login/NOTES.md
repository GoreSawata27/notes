# Login flow (interview)

## Question: “User clicks Login — how does Redux work?”

### Step by step

1. **Login form** (client component) holds controlled `email` / `password` (local `useState` is fine for form fields).
2. On submit, **`dispatch(login({ email, password }))`** — `login` is a `createAsyncThunk`.
3. **`login.pending`**: auth slice sets `status: 'loading'`, clears previous error. Any component selecting `state.auth` re-renders (button shows “Logging in…”).
4. **Thunk runs** `fetch('/learn/redux/api/mock-auth', { method: 'POST', body })`.
5. **Success — `login.fulfilled`**: store `user` + `token`, `status: 'authenticated'`. UI switches to logged-in view (via selector like `selectIsAuthenticated`).
6. **Failure — `login.rejected`**: store error message from API (`rejectWithValue`), show under form.

### Sequence (mental model)

```text
Click Login → dispatch(login) → pending → POST API → fulfilled | rejected → UI updates
```

### Where to keep the token (follow-ups)

| Approach | Pros | Cons |
|----------|------|------|
| **httpOnly cookie** (server sets) | Not readable by JS — better vs XSS | Needs API routes / BFF |
| **Memory only** | Safest on client | Lost on refresh |
| **localStorage** | Persists refresh | XSS can steal token |

This example uses localStorage **only for learning** — see comments in `_features/authSlice.ts`.

### Protected routes (follow-up)

- **Client:** read `isAuthenticated` from Redux; redirect with `useRouter` if false (flash of content possible).
- **Better:** middleware checks cookie on server; Redux mirrors session for UI.

**Mock API:** `../api/mock-auth/route.ts`  
**Test user:** `demo@notes.local` / `password123`

## RTK Query variant

Same API with `useLoginMutation` — Example 5 (`../example-5-rtk-query/NOTES.md`).
