import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  status: "idle" | "loading" | "authenticated" | "error";
  error: string | null;
};

const AUTH_API = "/learn/redux/api/mock-auth";

// Production note: prefer httpOnly cookies set by the server for tokens.
// localStorage is shown here only so refresh keeps the demo logged in — XSS can read it.
const TOKEN_STORAGE_KEY = "learn-redux-demo-token";
const USER_STORAGE_KEY = "learn-redux-demo-user";

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: "idle",
  error: null,
};

export const login = createAsyncThunk<
  LoginResponse,
  LoginCredentials,
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  const res = await fetch(AUTH_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const data = (await res.json()) as LoginResponse | { message?: string };

  if (!res.ok) {
    return rejectWithValue(
      "message" in data && data.message ? data.message : "Login failed",
    );
  }

  return data as LoginResponse;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    },
    hydrateFromStorage(state) {
      const token = readStoredToken();
      const user = readStoredUser();
      if (token && user) {
        state.token = token;
        state.user = user;
        state.status = "authenticated";
      }
    },
    clearAuthError(state) {
      state.error = null;
      if (state.status === "error") state.status = "idle";
    },
  },
  extraReducers(builder) {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.status = "authenticated";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        if (typeof window !== "undefined") {
          localStorage.setItem(TOKEN_STORAGE_KEY, action.payload.token);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(action.payload.user));
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "Login failed";
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout, hydrateFromStorage, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.status === "authenticated" && state.auth.user !== null;
