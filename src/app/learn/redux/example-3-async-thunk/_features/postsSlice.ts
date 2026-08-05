import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type Post = {
  id: number;
  title: string;
};

type PostsState = {
  items: Post[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: PostsState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchPosts = createAsyncThunk<Post[], void, { rejectValue: string }>(
  "posts/fetchPosts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
      if (!res.ok) return rejectWithValue(`HTTP ${res.status}`);
      return (await res.json()) as Post[];
    } catch {
      return rejectWithValue("Network error");
    }
  },
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearPosts(state) {
      state.items = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers(builder) {
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
        state.error = action.payload ?? action.error.message ?? "Failed";
      });
  },
});

export const { clearPosts } = postsSlice.actions;
export default postsSlice.reducer;
