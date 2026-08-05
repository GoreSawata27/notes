# Multiple slices + selectors

## One store, two reducers

- **`todos`** — domain data (add, toggle, remove).
- **`ui`** — view state (filter: all / active / completed).

Keeping UI-only state in a separate slice avoids bloating the todos reducer.

## Memoized selectors

`createSelector` builds a derived list (filtered todos) that only recalculates when inputs change.

**Files:** `_features/todosSlice.ts`, `_features/uiSlice.ts`, `_features/selectors.ts`

Compare with manual `useReducer` + action types in `src/app/practice/reducer`.
