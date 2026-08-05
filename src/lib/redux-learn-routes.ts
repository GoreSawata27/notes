export type ReduxLearnExample = {
  slug: string;
  href: string;
  title: string;
  level: number;
  concepts: string[];
  notesPath: string;
  sourcePaths: string[];
};

export const REDUX_LEARN_HUB = "/learn/redux";

export const REDUX_HUB_NOTES_PATH = "src/app/learn/redux/NOTES.md";

export const REDUX_LEARN_EXAMPLES: ReduxLearnExample[] = [
  {
    slug: "example-1-counter",
    href: "/learn/redux/example-1-counter",
    title: "Example 1 — Counter",
    level: 1,
    concepts: ["createSlice", "configureStore", "useDispatch", "useSelector", "Immer"],
    notesPath: "src/app/learn/redux/example-1-counter/NOTES.md",
    sourcePaths: [
      "src/app/learn/redux/example-1-counter/NOTES.md",
      "src/app/learn/redux/example-1-counter/_features/counterSlice.ts",
      "src/app/learn/redux/example-1-counter/_store/store.ts",
      "src/app/learn/redux/example-1-counter/_components/CounterDemo.tsx",
    ],
  },
  {
    slug: "example-2-todos",
    href: "/learn/redux/example-2-todos",
    title: "Example 2 — Todos + filter",
    level: 2,
    concepts: ["payload actions", "multiple slices", "createSelector"],
    notesPath: "src/app/learn/redux/example-2-todos/NOTES.md",
    sourcePaths: [
      "src/app/learn/redux/example-2-todos/NOTES.md",
      "src/app/learn/redux/example-2-todos/_features/todosSlice.ts",
      "src/app/learn/redux/example-2-todos/_features/uiSlice.ts",
      "src/app/learn/redux/example-2-todos/_features/selectors.ts",
      "src/app/learn/redux/example-2-todos/_components/TodosDemo.tsx",
    ],
  },
  {
    slug: "example-3-async-thunk",
    href: "/learn/redux/example-3-async-thunk",
    title: "Example 3 — createAsyncThunk",
    level: 3,
    concepts: ["createAsyncThunk", "extraReducers", "loading / error state"],
    notesPath: "src/app/learn/redux/example-3-async-thunk/NOTES.md",
    sourcePaths: [
      "src/app/learn/redux/example-3-async-thunk/NOTES.md",
      "src/app/learn/redux/example-3-async-thunk/_features/postsSlice.ts",
      "src/app/learn/redux/example-3-async-thunk/_components/PostsDemo.tsx",
    ],
  },
  {
    slug: "example-4-login",
    href: "/learn/redux/example-4-login",
    title: "Example 4 — Login flow",
    level: 4,
    concepts: ["auth slice", "rejectWithValue", "login interview flow"],
    notesPath: "src/app/learn/redux/example-4-login/NOTES.md",
    sourcePaths: [
      "src/app/learn/redux/example-4-login/NOTES.md",
      "src/app/learn/redux/api/mock-auth/route.ts",
      "src/app/learn/redux/example-4-login/_features/authSlice.ts",
      "src/app/learn/redux/example-4-login/_components/LoginDemo.tsx",
    ],
  },
  {
    slug: "example-5-rtk-query",
    href: "/learn/redux/example-5-rtk-query",
    title: "Example 5 — RTK Query",
    level: 5,
    concepts: ["createApi", "fetchBaseQuery", "mutations", "cache tags"],
    notesPath: "src/app/learn/redux/example-5-rtk-query/NOTES.md",
    sourcePaths: [
      "src/app/learn/redux/example-5-rtk-query/NOTES.md",
      "src/app/learn/redux/example-5-rtk-query/_features/authApi.ts",
      "src/app/learn/redux/example-5-rtk-query/_components/RtkQueryDemo.tsx",
    ],
  },
  {
    slug: "example-6-patterns",
    href: "/learn/redux/example-6-patterns",
    title: "Example 6 — Production patterns",
    level: 6,
    concepts: ["listener middleware", "multi-feature store", "typed hooks"],
    notesPath: "src/app/learn/redux/example-6-patterns/NOTES.md",
    sourcePaths: [
      "src/app/learn/redux/example-6-patterns/NOTES.md",
      "src/app/learn/redux/example-6-patterns/_store/store.ts",
      "src/app/learn/redux/example-6-patterns/_store/listenerMiddleware.ts",
      "src/app/learn/redux/example-6-patterns/_components/PatternsDemo.tsx",
    ],
  },
];
