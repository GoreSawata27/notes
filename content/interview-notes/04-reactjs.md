# React Interview Notes

## React Fundamentals
### Q1. What is React and why use it over vanilla JavaScript? [must-know]

**Short definition:** React is a declarative JavaScript library for building user interfaces.

**Answer:** React is a declarative JavaScript library for building user interfaces. You describe UI as a function of state; React updates the DOM efficiently when state changes. Benefits include component reusability, a strong ecosystem, virtual DOM diffing, one-way data flow, and excellent tooling (DevTools, JSX, hooks).

**Follow-up:** How does React differ from a framework like Angular?

**Common mistake:** Calling React a full framework — it is a view library; routing, data fetching, and global state are added via libraries.

---

### Q2. What is the difference between declarative and imperative UI programming?

**Short definition:** Imperative code tells the browser step-by-step how to change the DOM (`document.getElementById(...).innerText = ...`).

**Answer:** Imperative code tells the browser step-by-step how to change the DOM (`document.getElementById(...).innerText = ...`). Declarative code describes what the UI should look like for a given state; React reconciles the DOM to match.

```jsx
// Declarative (React)
function Greeting({ name }) {
  return <h1>Hello, {name}</h1>;
}
```

**Follow-up:** Give a real example where declarative UI reduces bugs.

**Common mistake:** Manually syncing DOM nodes inside React components instead of updating state.

---

### Q3. What is one-way data flow in React? [must-know]

**Short definition:** Data flows parent → child via props.

**Answer:** Data flows parent → child via props. Children notify parents through callback props. State is owned by the component that defines it unless lifted to a common ancestor.

**Follow-up:** Why does React discourage two-way binding at the component level?

**Common mistake:** Mutating props directly in a child component.

---

### Q4. What is the difference between React Element, React Component, and React Node?

**Short definition:** - **React Element:** Lightweight plain object describing what to render (`{ type, props, key }`).

**Answer:** - **React Element:** Lightweight plain object describing what to render (`{ type, props, key }`).
- **React Component:** Function or class that returns elements.
- **React Node:** Anything renderable — element, string, number, fragment, portal, null.

**Follow-up:** What does `React.createElement` return?

**Common mistake:** Confusing a component reference (`<MyComp />`) with an element instance.

---

### Q5. What are the main differences between functional and class components?

**Short definition:** Class components use `extends React.Component`, `this.state`, lifecycle methods, and `this` binding.

**Answer:** Class components use `extends React.Component`, `this.state`, lifecycle methods, and `this` binding. Functional components use hooks for state and effects, have less boilerplate, and are the modern default since React 16.8+.

**Follow-up:** Can you use hooks in class components?

**Common mistake:** Creating class components in new code when hooks cover all use cases.

---

### Q6. What is Strict Mode and what does it do?

**Short definition:** `<React.StrictMode>` is a development-only wrapper that double-invokes certain functions (render, effects, constructors) to surface side effects and...

**Answer:** `<React.StrictMode>` is a development-only wrapper that double-invokes certain functions (render, effects, constructors) to surface side effects and deprecated API usage. It does not affect production builds.

**Follow-up:** Why does Strict Mode run effects twice in development?

**Common mistake:** Assuming double effect runs happen in production and adding guards that hide real bugs.

---

### Q7. What is the purpose of `key` in lists? [must-know]

**Short definition:** Keys help React identify which list items changed, were added, or removed during reconciliation.

**Answer:** Keys help React identify which list items changed, were added, or removed during reconciliation. Keys must be stable and unique among siblings — prefer IDs over array index when items can reorder.

```jsx
{users.map(user => (
  <li key={user.id}>{user.name}</li>
))}
```

**Follow-up:** What breaks when you use index as key on a sortable list?

**Common mistake:** Using random keys (`key={Math.random()}`) which forces full re-mount every render.

---

### Q8. What is React 18's concurrent rendering at a high level?

**Short definition:** Concurrent features let React interrupt, pause, or abandon rendering work to keep the UI responsive.

**Answer:** Concurrent features let React interrupt, pause, or abandon rendering work to keep the UI responsive. Examples: `startTransition`, `useDeferredValue`, Suspense. Rendering becomes priority-aware rather than purely synchronous.

**Follow-up:** How is concurrent rendering different from async/await?

**Common mistake:** Thinking concurrent mode means React renders on multiple threads (main thread still runs JS).

---

## JSX

---

### Q9. What is JSX and how does it compile? [must-know]

**Short definition:** JSX is syntax sugar that looks like HTML in JavaScript.

**Answer:** JSX is syntax sugar that looks like HTML in JavaScript. Babel (or similar) transforms `<App />` into `React.createElement(App, null)` or `_jsx(App, {})` with the automatic runtime.

```jsx
const el = <h1 className="title">Hi</h1>;
// becomes roughly:
const el = React.createElement('h1', { className: 'title' }, 'Hi');
```

**Follow-up:** Why must JSX tags be closed (`<br />`)?

**Common mistake:** Using `class` instead of `className` or `for` instead of `htmlFor`.

---

### Q10. Can you use JavaScript expressions inside JSX?

**Short definition:** Yes, inside curly braces `{}`.

**Answer:** Yes, inside curly braces `{}`. You can render variables, call functions, ternaries, and `map`. You cannot use statements (`if`, `for`) directly — use ternaries, `&&`, or compute values before the return.

```jsx
{isLoggedIn ? <Dashboard /> : <Login />}
{items.length > 0 && <List items={items} />}
```

**Follow-up:** What happens if you render `{0}` vs `{false}` vs `{null}`?

**Common mistake:** Writing `{count && <Badge />}` when count can be `0`, rendering `0` on screen.

---

### Q11. What is a React Fragment and when do you use it?

**Short definition:** Fragments let you group multiple children without adding an extra DOM node.

**Answer:** Fragments let you group multiple children without adding an extra DOM node. Syntax: `<>...</>` or `<React.Fragment key={...}>`.

```jsx
return (
  <>
    <Header />
    <Main />
  </>
);
```

**Follow-up:** When must you use `<React.Fragment key>` instead of `<>`?

**Common mistake:** Wrapping lists in unnecessary `<div>` elements that break CSS layout (flex/grid).

---

### Q12. How do you embed comments in JSX?

**Short definition:** Use JavaScript block comments inside an expression: `{/* comment */}`.

**Answer:** Use JavaScript block comments inside an expression: `{/* comment */}`. HTML-style `<!-- -->` does not work inside JSX children.

**Follow-up:** Where can you not place JSX comments?

**Common mistake:** Placing `{/* comment */}` outside `{}` in attribute positions incorrectly.

---

### Q13. What attributes differ between HTML and JSX?

**Short definition:** JSX uses camelCase: `className`, `htmlFor`, `onClick`, `tabIndex`, `aria-*`.

**Answer:** JSX uses camelCase: `className`, `htmlFor`, `onClick`, `tabIndex`, `aria-*`. Style is an object: `style={{ color: 'red' }}`. Boolean attributes use explicit booleans: `disabled={true}`.

**Follow-up:** How do you pass a custom data attribute?

**Common mistake:** Passing string `"true"` to a boolean prop expecting actual boolean.

---

### Q14. What is the difference between `children` as prop vs nested JSX?

**Short definition:** They are equivalent.

**Answer:** They are equivalent. `<Card title="A">Content</Card>` passes `"Content"` as `props.children`. You can also pass explicit `children` prop or multiple slots via named props.

```jsx
function Card({ title, children }) {
  return <section><h2>{title}</h2>{children}</section>;
}
```

**Follow-up:** What is `React.Children` used for?

**Common mistake:** Assuming `children` is always a single element — it can be array, string, or undefined.

---

## Components, Props & State

---

### Q15. What are props and can you modify them? [must-know]

**Short definition:** Props are read-only inputs passed from parent to child.

**Answer:** Props are read-only inputs passed from parent to child. They enable component composition and configuration. Never mutate props; if you need local changes, copy to state.

**Follow-up:** What is prop drilling?

**Common mistake:** Treating props like state and assigning to them inside the child.

---

### Q16. What is state and how is it different from props?

**Short definition:** State is mutable data owned and managed by the component (via `useState`/`useReducer`).

**Answer:** State is mutable data owned and managed by the component (via `useState`/`useReducer`). Props are external and immutable from the child's perspective. State changes trigger re-renders.

**Follow-up:** When should you lift state up?

**Common mistake:** Duplicating prop values into state unnecessarily (`useState(props.value)` without sync strategy).

---

### Q17. What is lifting state up?

**Short definition:** When two siblings need shared data, move state to their closest common parent and pass data down via props and callbacks up.

**Answer:** When two siblings need shared data, move state to their closest common parent and pass data down via props and callbacks up.

```jsx
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <>
      <Display count={count} />
      <Controls onIncrement={() => setCount(c => c + 1)} />
    </>
  );
}
```

**Follow-up:** When is Context better than lifting state?

**Common mistake:** Lifting state too high, causing unrelated components to re-render.

---

### Q18. What is composition vs inheritance in React?

**Short definition:** React favors composition — nesting components and passing JSX via `children` or render props — over class inheritance.

**Answer:** React favors composition — nesting components and passing JSX via `children` or render props — over class inheritance. There is no `extends` for UI reuse like OOP hierarchies.

**Follow-up:** Give an example of specialization via composition.

**Common mistake:** Trying to model UI reuse with deep class inheritance trees.

---

### Q19. What are default props and default parameters?

**Short definition:** Modern functional components use ES default parameters: `function Btn({ label = 'OK' })`.

**Answer:** Modern functional components use ES default parameters: `function Btn({ label = 'OK' })`. Class components historically used `Component.defaultProps` (deprecated pattern in favor of defaults in signature).

**Follow-up:** How do default props interact with `undefined` vs `null`?

**Common mistake:** Relying on `defaultProps` on function components when destructuring defaults are clearer.

---

### Q20. What is prop types validation?

**Short definition:** `prop-types` runtime library checks prop shapes in development.

**Answer:** `prop-types` runtime library checks prop shapes in development. TypeScript is preferred at compile time for larger apps. Example: `PropTypes.string.isRequired`.

**Follow-up:** Does PropTypes run in production?

**Common mistake:** Assuming PropTypes replaces TypeScript — they solve different layers.

---

### Q21. What causes a component to re-render?

**Short definition:** Re-render occurs when: (1) its state changes, (2) its parent re-renders (unless memoized), (3) context it consumes changes, (4) forced update in class...

**Answer:** Re-render occurs when: (1) its state changes, (2) its parent re-renders (unless memoized), (3) context it consumes changes, (4) forced update in class (`forceUpdate`). Props changing reference also triggers child render.

**Follow-up:** Does changing state always change DOM output?

**Common mistake:** Believing `useMemo` prevents component re-render — it only memoizes a computed value.

---

### Q22. What is the difference between shallow and deep comparison for props?

**Short definition:** Shallow compare checks top-level reference equality for each prop.

**Answer:** Shallow compare checks top-level reference equality for each prop. Deep compare recursively compares nested objects (expensive). `React.memo` uses shallow compare by default.

**Follow-up:** When would you pass a custom comparison to `React.memo`?

**Common mistake:** Passing new object/array literals inline as props on every render, defeating memoization.

---

## React Hooks

---

### Q23. What are Rules of Hooks? [must-know]

**Short definition:** 1.

**Answer:** 1. Only call hooks at the top level — not inside loops, conditions, or nested functions.
2. Only call hooks from React function components or custom hooks.

These rules ensure hook call order stays consistent across renders.

**Follow-up:** What error appears if you break the rules?

**Common mistake:** Calling `useEffect` conditionally when a feature flag is on.

---

### Q24. Explain `useState` and functional updates. [must-know]

**Short definition:** `useState(initial)` returns `[state, setState]`.

**Answer:** `useState(initial)` returns `[state, setState]`. Updates may be batched and asynchronous. Use functional form when next state depends on previous: `setCount(c => c + 1)`.

```jsx
const [count, setCount] = useState(0);
setCount(prev => prev + 1);
```

**Follow-up:** What happens if you call `setState` twice with the same literal value?

**Common mistake:** Reading stale state immediately after `setCount(count + 1)` in the same event handler without functional updates.

---

### Q25. What is `useReducer` and when prefer it over `useState`?

**Short definition:** `useReducer(reducer, initialState)` manages complex state transitions via `(state, action) => newState`.

**Answer:** `useReducer(reducer, initialState)` manages complex state transitions via `(state, action) => newState`. Prefer when multiple sub-values exist, next state depends on previous, or logic is testable outside component.

```jsx
function reducer(state, action) {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    default: return state;
  }
}
```

**Follow-up:** How does `useReducer` relate to Redux?

**Common mistake:** Using `useReducer` for a single boolean toggle — overkill.

---

### Q26. Explain `useRef` and its common use cases. [must-know]

**Short definition:** `useRef(initial)` returns a mutable object `{ current }` that persists across renders without causing re-render when updated.

**Answer:** `useRef(initial)` returns a mutable object `{ current }` that persists across renders without causing re-render when updated. Uses: DOM references, storing previous values, timers, instance variables.

```jsx
const inputRef = useRef(null);
useEffect(() => { inputRef.current?.focus(); }, []);
return <input ref={inputRef} />;
```

**Follow-up:** Difference between ref and state for storing a counter?

**Common mistake:** Expecting UI to update when mutating `ref.current` without state.

---

### Q27. What does `useMemo` do?

**Short definition:** Memoizes expensive computation between renders.

**Answer:** Memoizes expensive computation between renders. Recomputes only when dependencies change. Returns cached value: `const sorted = useMemo(() => heavySort(data), [data])`.

**Follow-up:** Does `useMemo` guarantee performance improvement?

**Common mistake:** Wrapping every expression in `useMemo` — adds overhead without benefit.

---

### Q28. What does `useCallback` do?

**Short definition:** Returns memoized callback function: `const fn = useCallback(() => doThing(id), [id])`.

**Answer:** Returns memoized callback function: `const fn = useCallback(() => doThing(id), [id])`. Useful when passing stable function references to memoized children.

```jsx
const handleClick = useCallback(() => {
  onSelect(item.id);
}, [item.id, onSelect]);
```

**Follow-up:** Relationship between `useCallback` and `useMemo`?

**Common mistake:** Using `useCallback` everywhere instead of fixing unnecessary parent re-renders.

---

### Q29. Explain `useContext`. [must-know]

**Short definition:** Reads nearest matching context value from `React.createContext`.

**Answer:** Reads nearest matching context value from `React.createContext`. Avoids prop drilling for global-ish data (theme, auth, locale).

```jsx
const ThemeContext = createContext('light');
function Toolbar() {
  const theme = useContext(ThemeContext);
  return <div className={theme}>...</div>;
}
```

**Follow-up:** Why can context cause performance issues?

**Common mistake:** Putting fast-changing values in a single large context consumed by entire tree.

---

### Q30. What is `useLayoutEffect` vs `useEffect`?

**Short definition:** Both run after render.

**Answer:** Both run after render. `useLayoutEffect` fires synchronously after DOM mutations but before browser paint — use for DOM measurements or preventing visual flicker. `useEffect` runs asynchronously after paint — preferred for data fetching and subscriptions.

**Follow-up:** What UX bug occurs if you measure DOM in `useEffect` instead?

**Common mistake:** Using `useLayoutEffect` for API calls, blocking paint unnecessarily.

---

### Q31. What is `useId` for?

**Short definition:** Generates stable unique IDs for accessibility attributes (`htmlFor`, `aria-describedby`) that are consistent between server and client, avoiding hydration...

**Answer:** Generates stable unique IDs for accessibility attributes (`htmlFor`, `aria-describedby`) that are consistent between server and client, avoiding hydration mismatches.

```jsx
const id = useId();
return (
  <>
    <label htmlFor={id}>Email</label>
    <input id={id} />
  </>
);
```

**Follow-up:** Why not use `Math.random()` for IDs?

**Common mistake:** Using `useId` as list keys — it is per-component instance, not per list item.

---

### Q32. What are `useImperativeHandle` and `forwardRef`?

**Short definition:** `forwardRef` lets parent pass ref to child.

**Answer:** `forwardRef` lets parent pass ref to child. `useImperativeHandle(ref, createHandle, deps)` customizes the instance value exposed to parent — e.g., focus a custom input.

**Follow-up:** When should you avoid imperative handles?

**Common mistake:** Overusing imperative APIs instead of declarative props.

---

### Q33. What is `useTransition`?

**Short definition:** Marks state updates as non-urgent transitions.

**Answer:** Marks state updates as non-urgent transitions. Returns `[isPending, startTransition]`. Keeps UI responsive during expensive re-renders (e.g., filtering large lists).

```jsx
const [isPending, startTransition] = useTransition();
startTransition(() => setFilter(value));
```

**Follow-up:** Compare with `debounce`.

**Common mistake:** Wrapping every setState in `startTransition` when update is already cheap.

---

### Q34. What is `useDeferredValue`?

**Short definition:** Defers updating a value until more urgent renders finish.

**Answer:** Defers updating a value until more urgent renders finish. Similar effect to debouncing but integrated with React's scheduler — good for live search over heavy UI.

**Follow-up:** Difference between `useDeferredValue` and `useTransition`?

**Common mistake:** Using deferred value when input itself must feel instant but only results lag.

---

### Q35. How do you create a custom hook?

**Short definition:** Extract reusable stateful logic into a function starting with `use` that calls other hooks.

**Answer:** Extract reusable stateful logic into a function starting with `use` that calls other hooks. Example: `useFetch`, `useLocalStorage`, `useDebounce`.

```jsx
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    return JSON.parse(localStorage.getItem(key)) ?? initial;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}
```

**Follow-up:** Can custom hooks return JSX?

**Common mistake:** Naming a helper without `use` prefix while it calls hooks — violates Rules of Hooks for callers.

---

## Lifecycle & useEffect

---

### Q36. Map class lifecycle methods to hooks. [must-know]

**Short definition:** | Class | Hooks equivalent | |-------|------------------| | constructor | `useState` initializers | | componentDidMount | `useEffect(() => {}, [])` | |...

**Answer:** | Class | Hooks equivalent |
|-------|------------------|
| constructor | `useState` initializers |
| componentDidMount | `useEffect(() => {}, [])` |
| componentDidUpdate | `useEffect(() => {}, [deps])` |
| componentWillUnmount | `useEffect` cleanup return |
| shouldComponentUpdate | `React.memo` / `useMemo` |
| getDerivedStateFromProps | Derive during render or key reset |
| getSnapshotBeforeUpdate | `useLayoutEffect` |

**Follow-up:** Why is there no direct `componentDidCatch` hook?

**Common mistake:** Using empty-deps effect for logic that depends on props without listing them.

---

### Q37. Explain `useEffect` dependency array patterns. [must-know]

**Short definition:** - No array: runs every render (rarely wanted).

**Answer:** - No array: runs every render (rarely wanted).
- `[]`: runs once after mount (plus Strict Mode double-run in dev).
- `[a, b]`: runs when `a` or `b` change.

```jsx
useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]);
```

**Follow-up:** What is an exhaustive-deps ESLint rule?

**Common mistake:** Omitting dependencies and reading stale closures.

---

### Q38. What is the cleanup function in `useEffect`?

**Short definition:** Return a function from effect to clean subscriptions, timers, listeners before re-run or unmount.

**Answer:** Return a function from effect to clean subscriptions, timers, listeners before re-run or unmount.

```jsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);
```

**Follow-up:** When does cleanup run relative to next effect?

**Common mistake:** Forgetting cleanup on WebSocket/event listeners causing memory leaks.

---

### Q39. How do you fetch data with `useEffect`?

**Short definition:** Call async function inside effect; handle race conditions with abort flag or `AbortController`; set state on success/error.

**Answer:** Call async function inside effect; handle race conditions with abort flag or `AbortController`; set state on success/error.

```jsx
useEffect(() => {
  let cancelled = false;
  (async () => {
    const res = await fetch(url);
    const data = await res.json();
    if (!cancelled) setData(data);
  })();
  return () => { cancelled = true; };
}, [url]);
```

**Follow-up:** Why not make the effect callback itself async?

**Common mistake:** No cleanup leading to setState on unmounted component warnings.

---

### Q40. What are stale closures in hooks?

**Short definition:** Event handlers or effects capture variables from the render they were created in.

**Answer:** Event handlers or effects capture variables from the render they were created in. If dependencies are wrong, they read outdated state/props.

**Follow-up:** How does functional setState help avoid stale state?

**Common mistake:** Empty dependency array while using props inside effect without including them.

---

### Q41. Can `useEffect` run on the server?

**Short definition:** Effects do not run during SSR — only after hydration on client.

**Answer:** Effects do not run during SSR — only after hydration on client. Server-specific logic belongs in server components (React 19/RSC) or data loaders, not client effects.

**Follow-up:** Where to fetch data in Next.js App Router?

**Common mistake:** Expecting `useEffect` to populate SEO-critical content on server.

---

### Q42. What is the difference between mounting, updating, and unmounting?

**Short definition:** - **Mount:** Component inserted into DOM first time.

**Answer:** - **Mount:** Component inserted into DOM first time.
- **Update:** Re-render from state/props/context change.
- **Unmount:** Component removed — cleanup runs.

**Follow-up:** Does React guarantee `componentWillUnmount` if mount fails midway?

**Common mistake:** Confusing first render with mount in Strict Mode double mounting.

---

## Virtual DOM, Reconciliation & Fiber

---

### Q43. What is the Virtual DOM? [must-know]

**Short definition:** In-memory lightweight representation of UI (React elements tree).

**Answer:** In-memory lightweight representation of UI (React elements tree). On update, React builds new tree, diffs with previous (reconciliation), and applies minimal real DOM changes.

**Follow-up:** Is virtual DOM always faster than direct DOM manipulation?

**Common mistake:** Claiming virtual DOM makes React faster in every scenario — targeted imperative updates can win for tiny changes.

---

### Q44. What is reconciliation?

**Short definition:** Algorithm comparing old and new element trees to determine minimal DOM operations.

**Answer:** Algorithm comparing old and new element trees to determine minimal DOM operations. Considers element type, keys, and props. Different component types tear down and rebuild subtree.

**Follow-up:** What happens if you change `<div>` to `<span>` at same position?

**Common mistake:** Assuming React diffs by HTML tag content text only, ignoring component type boundaries.

---

### Q45. What is the React Fiber architecture?

**Short definition:** Fiber is React's reconciliation engine rewrite (React 16+).

**Answer:** Fiber is React's reconciliation engine rewrite (React 16+). Work split into units (fibers) that can be paused, resumed, prioritized, and retried — enabling concurrent features and incremental rendering.

**Follow-up:** What is a fiber node conceptually?

**Common mistake:** Thinking Fiber means Web Workers — still main-thread cooperative scheduling.

---

### Q46. What is the render phase vs commit phase?

**Short definition:** - **Render phase:** Build/update fiber tree, diff, mark side effects — can be interrupted.

**Answer:** - **Render phase:** Build/update fiber tree, diff, mark side effects — can be interrupted.
- **Commit phase:** Apply DOM changes, run layout effects, passive effects — synchronous, not interruptible.

**Follow-up:** Which phase runs `useLayoutEffect` vs `useEffect`?

**Common mistake:** Performing heavy synchronous work during render phase causing jank.

---

### Q47. What does `ReactDOM.createRoot` change from legacy `ReactDOM.render`?

**Short definition:** `createRoot` enables React 18 concurrent features, automatic batching across more cases, and stricter warning paths.

**Answer:** `createRoot` enables React 18 concurrent features, automatic batching across more cases, and stricter warning paths. Legacy `render` is deprecated.

```jsx
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

**Follow-up:** What is hydration with `hydrateRoot`?

**Common mistake:** Mixing legacy render with React 18 APIs expecting full batching behavior.

---

### Q48. What is hydration?

**Short definition:** Attaching event listeners and reconciling client React tree with HTML pre-rendered on server.

**Answer:** Attaching event listeners and reconciling client React tree with HTML pre-rendered on server. Mismatch causes hydration errors/warnings.

**Follow-up:** Common causes of hydration mismatch?

**Common mistake:** Rendering `Date.now()` or random IDs differently on server vs client.

---

### Q49. What is time slicing in React?

**Short definition:** Breaking render work into chunks yielding to browser between frames to keep input responsive — part of concurrent mode via Fiber scheduler.

**Answer:** Breaking render work into chunks yielding to browser between frames to keep input responsive — part of concurrent mode via Fiber scheduler.

**Follow-up:** How does `startTransition` relate to priority?

**Common mistake:** Assuming time slicing eliminates need for memoization on huge lists.

---

## Performance Optimization

---

### Q50. What is `React.memo`? [must-know]

**Short definition:** Higher-order component that memoizes functional component output, skipping re-render if props are shallow-equal.

**Answer:** Higher-order component that memoizes functional component output, skipping re-render if props are shallow-equal.

```jsx
const Row = React.memo(function Row({ item }) {
  return <tr><td>{item.name}</td></tr>;
});
```

**Follow-up:** When does `memo` not help?

**Common mistake:** Memoizing parent while passing unstable inline functions/objects to child.

---

### Q51. What is code splitting with `React.lazy` and `Suspense`?

**Short definition:** `React.lazy(() => import('./Page'))` dynamically imports component.

**Answer:** `React.lazy(() => import('./Page'))` dynamically imports component. Wrap with `<Suspense fallback={...}>` to show UI while loading.

```jsx
const Admin = lazy(() => import('./Admin'));
<Suspense fallback={<Spinner />}>
  <Admin />
</Suspense>
```

**Follow-up:** Can lazy work with named exports directly?

**Common mistake:** Not handling load errors — need error boundary or retry pattern.

---

### Q52. How do you optimize large lists?

**Short definition:** Virtualization/windowing (`react-window`, `react-virtualized`), stable keys, memoized row components, avoid inline handlers, paginate or defer filter with...

**Answer:** Virtualization/windowing (`react-window`, `react-virtualized`), stable keys, memoized row components, avoid inline handlers, paginate or defer filter with transitions.

**Follow-up:** Why is index key bad for virtual lists with reorder?

**Common mistake:** Rendering 10k DOM nodes without virtualization.

---

### Q53. What is windowing/virtualization?

**Short definition:** Render only visible viewport items plus small buffer, recycling DOM nodes as user scrolls — reduces nodes from O(n) to O(visible).

**Answer:** Render only visible viewport items plus small buffer, recycling DOM nodes as user scrolls — reduces nodes from O(n) to O(visible).

**Follow-up:** Trade-offs of virtualization?

**Common mistake:** Applying virtualization to tiny lists adding complexity without gain.

---

### Q54. How does state colocation improve performance?

**Short definition:** Keep state as close as possible to where it is used so fewer components re-render when it changes.

**Answer:** Keep state as close as possible to where it is used so fewer components re-render when it changes.

**Follow-up:** Example of bad vs good colocation?

**Common mistake:** Single mega state object at app root for form field typing.

---

### Q55. What is profiling in React DevTools?

**Short definition:** Profiler records commit times, component render durations, and why components rendered — helps find unnecessary re-renders.

**Answer:** Profiler records commit times, component render durations, and why components rendered — helps find unnecessary re-renders.

**Follow-up:** What is "rendered because parent rendered"?

**Common mistake:** Optimizing before measuring — premature memo everywhere.

---

### Q56. What are bailouts in React rendering?

**Short definition:** When React skips rendering a subtree because props/state/context unchanged (e.g., `memo`, same state reference, offscreen tree).

**Answer:** When React skips rendering a subtree because props/state/context unchanged (e.g., `memo`, same state reference, offscreen tree). Fiber can bail out early during reconciliation.

**Follow-up:** Does bailout skip effects?

**Common mistake:** Assuming `memo` bails out if deep nested object unchanged but parent recreated wrapper object.

---

## Forms & Controlled Components

---

### Q57. What is a controlled component? [must-know]

**Short definition:** Form element whose value is driven by React state.

**Answer:** Form element whose value is driven by React state. Changes flow through `onChange` updating state, which updates input — single source of truth.

```jsx
const [email, setEmail] = useState('');
<input value={email} onChange={e => setEmail(e.target.value)} />
```

**Follow-up:** What is an uncontrolled component?

**Common mistake:** Setting `value` without `onChange` — read-only field warning.

---

### Q58. What is an uncontrolled component?

**Short definition:** DOM holds form state; access via ref (`inputRef.current.value`) or FormData.

**Answer:** DOM holds form state; access via ref (`inputRef.current.value`) or FormData. Useful for simple forms or file inputs.

```jsx
const ref = useRef();
const submit = () => console.log(ref.current.value);
<input ref={ref} defaultValue="hello" />
```

**Follow-up:** When prefer uncontrolled?

**Common mistake:** Mixing controlled and uncontrolled by toggling between `value` and `defaultValue`.

---

### Q59. How do you handle multiple inputs in one form?

**Short definition:** Single state object or reducer; generic handler keyed by input name:

**Answer:** Single state object or reducer; generic handler keyed by input name:

```jsx
const [form, setForm] = useState({ name: '', age: '' });
const onChange = e => {
  setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
};
```

**Follow-up:** How does React Hook Form simplify this?

**Common mistake:** Separate `useState` per field in large forms without structure.

---

### Q60. How do you validate forms in React?

**Short definition:** Client-side: onChange/onBlur/onSubmit validation with local state or libraries (React Hook Form + Zod/Yup).

**Answer:** Client-side: onChange/onBlur/onSubmit validation with local state or libraries (React Hook Form + Zod/Yup). Display field errors; prevent submit if invalid. Server validation still required.

**Follow-up:** Controlled validation vs schema validation?

**Common mistake:** Only HTML5 `required` with no UX error messages.

---

### Q61. How do you handle form submission?

**Short definition:** Prevent default on submit handler, validate, then call API or update state.

**Answer:** Prevent default on submit handler, validate, then call API or update state.

```jsx
function onSubmit(e) {
  e.preventDefault();
  if (!valid) return;
  save(form);
}
```

**Follow-up:** How to show loading state during async submit?

**Common mistake:** Using `<button onClick={submit}>` inside form without `type="button"`, causing accidental submits.

---

### Q62. What is React Hook Form and why use it?

**Short definition:** Library minimizing re-renders by registering uncontrolled inputs via refs, offering validation, dirty/touched tracking, and good TS support.

**Answer:** Library minimizing re-renders by registering uncontrolled inputs via refs, offering validation, dirty/touched tracking, and good TS support.

**Follow-up:** Compare with Formik.

**Common mistake:** Reimplementing full form library features manually in every project.

---

## Context API & HOC Patterns

---

### Q63. How does Context API work?

**Short definition:** `createContext(default)`, `Provider` supplies value, `useContext` or `Context.Consumer` reads it.

**Answer:** `createContext(default)`, `Provider` supplies value, `useContext` or `Context.Consumer` reads it. All consumers re-render when provider value changes.

```jsx
const AuthContext = createContext(null);
<AuthContext.Provider value={user}>
  <App />
</AuthContext.Provider>
```

**Follow-up:** How to split contexts for performance?

**Common mistake:** Storing `{ user, theme, cart, modal }` in one context object recreated each render.

---

### Q64. What is a Higher-Order Component (HOC)?

**Short definition:** Function taking component, returning enhanced component: `const Enhanced = withAuth(Wrapped)`.

**Answer:** Function taking component, returning enhanced component: `const Enhanced = withAuth(Wrapped)`. Used for cross-cutting concerns (auth, logging, data fetching) before hooks era.

```jsx
function withAuth(Component) {
  return function Authenticated(props) {
    const user = useAuth();
    if (!user) return <Login />;
    return <Component {...props} user={user} />;
  };
}
```

**Follow-up:** HOC vs custom hook — modern preference?

**Common mistake:** Wrapping HOCs in render causing remount: `{cond && withAuth(Comp)}`.

---

### Q65. What is the render props pattern?

**Short definition:** Component receives function as prop/child that returns JSX with shared state: `<DataFetcher render={data => <List data={data} />} />`.

**Answer:** Component receives function as prop/child that returns JSX with shared state: `<DataFetcher render={data => <List data={data} />} />`.

**Follow-up:** Equivalent with hooks?

**Common mistake:** Nested render props pyramid ("callback hell") without composition.

---

### Q66. What are compound components?

**Short definition:** Components that work together sharing implicit state via context — e.g., `<Tabs>`, `<TabList>`, `<Tab>`, `<TabPanel>`.

**Answer:** Components that work together sharing implicit state via context — e.g., `<Tabs>`, `<TabList>`, `<Tab>`, `<TabPanel>`.

**Follow-up:** Example in popular libraries?

**Common mistake:** Tight coupling without documenting required child structure.

---

### Q67. What is prop drilling and solutions?

**Short definition:** Passing props through many intermediate layers.

**Answer:** Passing props through many intermediate layers. Solutions: Context, component composition (children), state libraries (Zustand, Redux), or colocate state.

**Follow-up:** When is prop drilling acceptable?

**Common mistake:** Jumping to Redux for two-level prop pass.

---

### Q68. Compare Context, Redux, Zustand, and Jotai briefly.

**Short definition:** - **Context:** Built-in, good for low-frequency global data; can cause wide re-renders.

**Answer:** - **Context:** Built-in, good for low-frequency global data; can cause wide re-renders.
- **Redux:** Predictable global store, middleware, devtools; boilerplate ( reduced with RTK).
- **Zustand:** Minimal API, external store, selective subscriptions.
- **Jotai/Recoil:** Atomic fine-grained state models.

**Follow-up:** When is local state enough?

**Common mistake:** Choosing Redux for all apps regardless of complexity.

---

## React Router

---

### Q69. What is client-side routing in React?

**Short definition:** React Router updates UI based on URL without full page reload using History API (`pushState`/`popstate`).

**Answer:** React Router updates UI based on URL without full page reload using History API (`pushState`/`popstate`). Maps routes to components.

```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/users/:id" element={<User />} />
</Routes>
```

**Follow-up:** Difference between BrowserRouter and HashRouter?

**Common mistake:** Not handling 404/fallback route.

---

### Q70. What are route parameters and search params?

**Short definition:** Dynamic segments (`:id`) via `useParams()`.

**Answer:** Dynamic segments (`:id`) via `useParams()`. Query strings via `useSearchParams()` — e.g., `/users?page=2`.

```jsx
const { id } = useParams();
const [search] = useSearchParams();
const page = search.get('page');
```

**Follow-up:** How to validate param types?

**Common mistake:** Assuming params are numbers — they are always strings from URL.

---

### Q71. What is nested routing?

**Short definition:** Child routes render inside parent `<Outlet />` — layouts persist while inner content swaps.

**Answer:** Child routes render inside parent `<Outlet />` — layouts persist while inner content swaps.

```jsx
<Route path="/dashboard" element={<DashboardLayout />}>
  <Route path="settings" element={<Settings />} />
</Route>
```

**Follow-up:** Relative vs absolute route paths?

**Common mistake:** Forgetting `<Outlet />` so child never appears.

---

### Q72. What are protected routes?

**Short definition:** Wrapper route/component checks auth; redirects to login if unauthorized before rendering children.

**Answer:** Wrapper route/component checks auth; redirects to login if unauthorized before rendering children.

```jsx
function ProtectedRoute({ children }) {
  const user = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
```

**Follow-up:** Where to store redirect return URL?

**Common mistake:** Client-only guard with no server/API authorization.

---

### Q73. What is data loading with React Router v6.4+?

**Short definition:** Route loaders fetch data before render; actions handle mutations.

**Answer:** Route loaders fetch data before render; actions handle mutations. Integrates with `<Form>`, defer, and error boundaries per route.

**Follow-up:** Compare with fetching in `useEffect` on navigation.

**Common mistake:** Waterfall loaders without parallelizing independent data.

---

## Error Boundaries

---

### Q74. What is an Error Boundary? [must-know]

**Short definition:** Class component (no hook equivalent yet) implementing `static getDerivedStateFromError` and/or `componentDidCatch` to catch render/lifecycle errors in...

**Answer:** Class component (no hook equivalent yet) implementing `static getDerivedStateFromError` and/or `componentDidCatch` to catch render/lifecycle errors in children and show fallback UI.

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { log(error, info); }
  render() {
    return this.state.hasError ? <Fallback /> : this.props.children;
  }
}
```

**Follow-up:** What errors are NOT caught?

**Common mistake:** Expecting error boundaries to catch event handler or async errors.

---

### Q75. What errors do Error Boundaries not catch?

**Short definition:** Event handler errors, async code (setTimeout, promises), server-side rendering, errors in boundary itself.

**Answer:** Event handler errors, async code (setTimeout, promises), server-side rendering, errors in boundary itself. Use try/catch in handlers and `.catch` on promises.

**Follow-up:** How to handle async fetch errors?

**Common mistake:** Wrapping entire app in one boundary with no granular recovery.

---

### Q76. How do libraries like `react-error-boundary` help?

**Short definition:** Provides reusable boundary component, reset keys, fallback render props, and `onError` logging — less boilerplate than custom class.

**Answer:** Provides reusable boundary component, reset keys, fallback render props, and `onError` logging — less boilerplate than custom class.

**Follow-up:** Pattern for retry after error?

**Common mistake:** Not logging `componentStack` from error info in production monitoring.

---

## TypeScript with React

---

### Q77. How do you type functional component props?

**Short definition:** Define interface/type and apply to props parameter.

**Answer:** Define interface/type and apply to props parameter.

```tsx
type ButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

function Button({ label, onClick, disabled = false }: ButtonProps) {
  return <button disabled={disabled} onClick={onClick}>{label}</button>;
}
```

**Follow-up:** `React.FC` vs plain function — modern guidance?

**Common mistake:** Using `React.FC` implicitly expecting `children` when not declared.

---

### Q78. How do you type `useState` and events?

**Short definition:** TypeScript often infers state.

**Answer:** TypeScript often infers state. Explicit: `useState<User | null>(null)`. Events: `ChangeEvent<HTMLInputElement>`, `FormEvent`, `MouseEvent`.

```tsx
const [text, setText] = useState('');
const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setText(e.target.value);
};
```

**Follow-up:** Typing generic `useReducer`?

**Common mistake:** Using `any` for all events losing type safety.

---

### Q79. How do you type `useRef` for DOM vs mutable values?

**Short definition:** - DOM: `useRef<HTMLInputElement>(null)` — check null before use.

**Answer:** - DOM: `useRef<HTMLInputElement>(null)` — check null before use.
- Mutable box: `useRef<number>(0)` or `useRef<ReturnType<typeof setTimeout>>()`.

**Follow-up:** Why `useRef(null)` needs union with null?

**Common mistake:** Assigning ref to wrong element type causing TS errors.

---

### Q80. How do you type Context?

**Short definition:** Create context with `null` or default and narrow in hook, or assert non-null in provider-only hook.

**Answer:** Create context with `null` or default and narrow in hook, or assert non-null in provider-only hook.

```tsx
const UserContext = createContext<User | null>(null);
function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser outside provider');
  return ctx;
}
```

**Follow-up:** Typing dispatch for reducer context?

**Common mistake:** Default `{} as User` hiding missing provider bugs.

---

### Q81. How do you type generic reusable components?

**Short definition:** Use generics on props for polymorphic lists/tables.

**Answer:** Use generics on props for polymorphic lists/tables.

```tsx
type ListProps<T> = { items: T[]; renderItem: (item: T) => ReactNode };
function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map(item => <li key={String(item)}>{renderItem(item)}</li>)}</ul>;
}
```

**Follow-up:** What is `ComponentPropsWithoutRef<'button'>`?

**Common mistake:** Over-constraining generics where `T extends { id: string }` would suffice.

---

## Infosys-Reported Topics

---

### Q82. Explain the grid/matrix concept in React lists (Infosys). [infosys]

**Short definition:** Infosys interviews often describe rendering 2D data (matrix/grid) as nested lists — outer `map` for rows, inner `map` for columns.

**Answer:** Infosys interviews often describe rendering 2D data (matrix/grid) as nested lists — outer `map` for rows, inner `map` for columns. Each cell needs stable composite key (`row-col` or id). State updates on one cell should immutably update only that row/col slice.

```jsx
function Grid({ matrix, onChange }) {
  return matrix.map((row, r) => (
    <div key={r} className="row">
      {row.map((cell, c) => (
        <input
          key={`${r}-${c}`}
          value={cell}
          onChange={e => onChange(r, c, e.target.value)}
        />
      ))}
    </div>
  ));
}
```

**Follow-up:** How to optimize re-renders when one cell changes?

**Common mistake:** Mutating `matrix[r][c]` directly instead of copying row/array.

---

### Q83. What is React batching and how did React 18 change it? [infosys] [must-know]

**Short definition:** Batching groups multiple state updates into one re-render for performance.

**Answer:** Batching groups multiple state updates into one re-render for performance. React 18 automatic batching applies inside promises, timeouts, and native handlers — not only React event handlers.

```jsx
// React 18: both setState batched → one render
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
}, 1000);
```

**Follow-up:** What is `flushSync`?

**Common mistake:** Assuming each `setState` in async code always triggers separate render in React 18.

---

### Q84. What is the difference between automatic and legacy batching? [infosys]

**Short definition:** Legacy: batched only in React synthetic event handlers.

**Answer:** Legacy: batched only in React synthetic event handlers. Automatic (React 18+): batched in more contexts via `createRoot`. Use `flushSync(() => setState())` when DOM must update immediately before next line.

**Follow-up:** Does batching apply to hooks and class setState equally?

**Common mistake:** Using `flushSync` everywhere defeating batching benefits.

---

### Q85. Controlled vs uncontrolled — Infosys favorite comparison. [infosys] [must-know]

**Short definition:** | | Controlled | Uncontrolled | |---|------------|--------------| | Source of truth | React state | DOM | | Value prop | `value` + `onChange` |...

**Answer:** | | Controlled | Uncontrolled |
|---|------------|--------------|
| Source of truth | React state | DOM |
| Value prop | `value` + `onChange` | `defaultValue`, read ref |
| Validation | Easy on each keystroke | Harder, on submit |
| Reset | Set state | Ref/manipulate DOM |.

**Follow-up:** Which is preferred for dynamic validation UI?

**Common mistake:** Saying uncontrolled is "always simpler" — controlled scales better for complex forms.

---

### Q86. How would you implement a searchable/filterable grid table (Infosys scenario)? [infosys]

**Short definition:** Store full dataset in state; derive filtered rows with `useMemo` from search term; render table with keyed rows; optional pagination/virtualization for...

**Answer:** Store full dataset in state; derive filtered rows with `useMemo` from search term; render table with keyed rows; optional pagination/virtualization for large data; debounce or `useDeferredValue` on search input.

```jsx
const filtered = useMemo(
  () => rows.filter(r => r.name.includes(query)),
  [rows, query]
);
```

**Follow-up:** Time complexity if filter runs every keystroke on 10k rows?

**Common mistake:** Filtering inside render without memoization on large datasets.

---

### Q87. Explain reconciliation when grid rows reorder (Infosys). [infosys]

**Short definition:** Without stable keys, React reuses wrong DOM nodes causing input focus/value bugs.

**Answer:** Without stable keys, React reuses wrong DOM nodes causing input focus/value bugs. With row IDs as keys, React moves nodes correctly. Changing row identity (new key) remounts row components.

**Follow-up:** Impact on component local state in cells?

**Common mistake:** Using row index as key after sort/filter operations.

---

### Q88. What is `flushSync` and when is it needed? [infosys]

**Short definition:** `flushSync` from `react-dom` forces synchronous DOM update before continuing — rare cases: measuring DOM immediately after state change, third-party lib...

**Answer:** `flushSync` from `react-dom` forces synchronous DOM update before continuing — rare cases: measuring DOM immediately after state change, third-party lib integration needing updated DOM.

```jsx
import { flushSync } from 'react-dom';
flushSync(() => setExpanded(true));
const height = ref.current.offsetHeight;
```

**Follow-up:** Performance cost?

**Common mistake:** Using `flushSync` to fix architectural issues instead of `useLayoutEffect`.

---

### Q89. How does React handle synthetic events (Infosys legacy topic)? [infosys]

**Short definition:** React wraps native events in SyntheticEvent for cross-browser normalization and pooling (older versions).

**Answer:** React wraps native events in SyntheticEvent for cross-browser normalization and pooling (older versions). Events delegate at root for performance. `e.persist()` was needed pre-17 for async access (largely obsolete).

**Follow-up:** React 17+ event delegation change?

**Common mistake:** Assuming `e.target` always equals current element in bubbling handlers without checking.

---

### Q90. Write a custom hook `useDebounce` — common Infosys coding ask. [infosys]

**Short definition:** ```jsx function useDebounce(value, delay = 300) { const [debounced, setDebounced] = useState(value); useEffect(() => { const id = setTimeout(() =>...

**Answer:** ```jsx
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}.
```

**Follow-up:** Compare debounce vs throttle vs `useDeferredValue`.

**Common mistake:** Not clearing timeout on cleanup causing stale updates.

---

### Q91. Implement toggle with minimal re-renders — Infosys practical. [infosys]

**Short definition:** Colocate toggle state in smallest component; if list items toggle independently, state per item or normalized map `{ [id]: boolean }` with functional updates.

**Answer:** Colocate toggle state in smallest component; if list items toggle independently, state per item or normalized map `{ [id]: boolean }` with functional updates.

```jsx
const [open, setOpen] = useState(false);
<button onClick={() => setOpen(o => !o)}>{open ? 'Close' : 'Open'}</button>
```

**Follow-up:** If 100 toggles in list, one state object vs separate components?

**Common mistake:** Lifting all toggles to parent causing full list re-render on each click.

---

### Q92. What is lifting state vs Context for theme toggle (Infosys scenario)?

**Short definition:** Single app theme: Context or CSS variables with one provider.

**Answer:** Single app theme: Context or CSS variables with one provider. Local widget expand/collapse: keep state local — no need for global store.

**Follow-up:** How to avoid re-rendering entire tree on theme change?

**Common mistake:** Putting unrelated fast-changing state in same context as theme.

---

### Q93. Explain `key`, `ref`, and `id` differences (Infosys fundamentals). [must-know]

**Short definition:** - **key:** Reconciliation identity among siblings; not passed to component/DOM.

**Answer:** - **key:** Reconciliation identity among siblings; not passed to component/DOM.
- **ref:** Direct handle to DOM or instance; mutable, no re-render.
- **id:** HTML attribute for labels/accessibility/DOM queries; must be unique in document.

**Follow-up:** Can two components use same `useId` prefix safely?

**Common mistake:** Using `id` as list key when duplicates possible across pages.

---

### Q94. What happens during React commit when updating one grid cell? [infosys]

**Short definition:** State update schedules render → render phase diffs virtual tree → commit phase updates that input's DOM property if changed → passive effects scheduled.

**Answer:** State update schedules render → render phase diffs virtual tree → commit phase updates that input's DOM property if changed → passive effects scheduled. Siblings with same type/keys may skip DOM writes if props unchanged (especially with memo).

**Follow-up:** Does React update entire table DOM?

**Common mistake:** Believing React always repaints full grid on any cell edit.

---

### Q95. Infosys: difference between `useEffect([])` and `useLayoutEffect([])` mount timing?

**Short definition:** Both run after first paint path differs: layout effect runs before browser paint, synchronous — user won't see intermediate wrong layout.

**Answer:** Both run after first paint path differs: layout effect runs before browser paint, synchronous — user won't see intermediate wrong layout. Empty-deps effect runs after paint — may flash wrong size then correct.

**Follow-up:** Measuring grid column widths on mount — which hook?

**Common mistake:** Choosing wrong hook causing visible layout jump in data grid.

---

## React 19 & Modern Features

---

### Q96. What is new in React 19? [must-know]

**Short definition:** React 19 introduces Actions for async transitions with pending states, `useActionState` for form submissions, `useOptimistic` for instant UI feedback, and...

**Answer:** React 19 introduces Actions for async transitions with pending states, `useActionState` for form submissions, `useOptimistic` for instant UI feedback, and `useFormStatus` for child components reading form submission state. Function components can receive `ref` as a regular prop without `forwardRef`. Document metadata and stylesheet support improve SSR. Server Components and Server Actions integrate deeper with frameworks like Next.js. The release focuses on making async UI — forms, mutations, streaming — first-class with less boilerplate than manual loading flags everywhere.

**Follow-up:** Is React 19 a breaking upgrade?

**Common mistake:** Assuming all React 19 features work without a supporting framework — Server Actions need server runtime.

---

### Q97. What are React Actions? [must-know]

**Short definition:** An Action is an async function used with `<form action={submitAction}>` or `useTransition` that React tracks as a transition.

**Answer:** An Action is an async function used with `<form action={submitAction}>` or `useTransition` that React tracks as a transition. React sets pending state while the action runs and resets on completion. Errors can propagate to error boundaries or be handled in the action. Actions replace much manual `isSubmitting` state in forms. They work with Server Actions in Next.js where the function runs on the server. Client Actions use the same API for consistent mental model across client and server mutations.

**Follow-up:** Actions vs useEffect for submit?

```jsx
async function createTodo(formData) {
  'use server';
  await db.todos.create(formData);
}

<form action={createTodo}>
  <input name="title" />
  <SubmitButton />
</form>
```

---

### Q98. Explain `useActionState` (formerly useFormState). [must-know]

**Short definition:** `const [state, formAction, isPending] = useActionState(action, initialState)`.

**Answer:** `const [state, formAction, isPending] = useActionState(action, initialState)`. The action receives `(previousState, formData)` and returns new state — useful for validation errors, success messages, or field-level feedback. `isPending` indicates action in progress. Replaces boilerplate of reading FormData manually and syncing error state. Works with progressive enhancement when paired with server actions. Interview tip: mention it replaces multiple useState calls for form result handling.

**Follow-up:** Difference from useReducer?

---

### Q99. What is `useOptimistic`? [must-know]

**Short definition:** `const [optimisticList, addOptimistic] = useOptimistic(list, (current, newItem) => [...current, newItem])`.

**Answer:** `const [optimisticList, addOptimistic] = useOptimistic(list, (current, newItem) => [...current, newItem])`. Display optimistic state immediately; React reverts to real state when the async action completes or fails. Ideal for likes, comments, todo adds — user sees instant feedback. Pairs with Actions in React 19. Unlike manual optimistic state, React coordinates rollback with transition lifecycle. Mention alongside Redux optimistic updates — same UX goal, different layer.

**Follow-up:** useOptimistic vs RTK Query optimistic update?

```jsx
const [optimisticMessages, addOptimistic] = useOptimistic(messages,
  (state, newMsg) => [...state, { ...newMsg, sending: true }]
);
```

---

### Q100. What is `useFormStatus`? [must-know]

**Short definition:** Must be called from a component rendered inside `<form>`.

**Answer:** Must be called from a component rendered inside `<form>`. Returns `{ pending, data, method, action }`. Enables submit button components that disable while parent form action runs — `<SubmitButton />` reads pending without receiving isLoading prop. Works with Server Actions and client actions. Solves prop drilling for deeply nested form UI. Only reflects nearest parent form status.

**Follow-up:** Can useFormStatus read validation errors?

```jsx
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>;
}
```

---

### Q101. React 19 ref as prop — what changed?

**Short definition:** Previously, passing ref through function components required `forwardRef`.

**Answer:** Previously, passing ref through function components required `forwardRef`. React 19 allows `function Input({ ref, ...props })` with ref on DOM element directly. Reduces boilerplate for design system components. `forwardRef` still works for backward compatibility. Custom components can expose refs to inner DOM or use imperative handle patterns. Mention migration: existing forwardRef components continue working.

**Follow-up:** When still use useImperativeHandle?

---

### Q102. What are React Server Components (RSC)? [must-know]

**Short definition:** RSC run only on server — not in browser bundle.

**Answer:** RSC run only on server — not in browser bundle. They can async await database or API directly in component body. Zero client JavaScript for server components themselves. Client Components marked with `"use client"` handle interactivity. Composition: server parent imports client child, passing serializable props. Enables smaller bundles and faster initial load. Next.js App Router is primary adoption path. Cannot use hooks or browser APIs in Server Components.

**Follow-up:** RSC vs SSR?

**Common mistake:** Marking entire app "use client" defeating RSC benefits.

---

### Q103. What is the `use()` hook in React 19?

**Short definition:** `const data = use(fetchPromise)` suspends component until promise fulfills — works inside Client Components with Suspense boundary.

**Answer:** `const data = use(fetchPromise)` suspends component until promise fulfills — works inside Client Components with Suspense boundary. Can also read context conditionally unlike useContext rules. Enables cleaner async data consumption than effect plus useState patterns. Primarily used with frameworks and streaming SSR. Interview: contrast with useEffect fetch — use() integrates with Suspense, effect does not suspend render.

**Follow-up:** use() vs React Query?

---

## Fiber Deep Dive

---

### Q104. What is a Fiber node structurally? [must-know]

**Short definition:** Each Fiber holds `type`, `props`, `stateNode` (DOM link), `return` (parent), `child`, `sibling` pointers forming a linked tree traversal structure.

**Answer:** Each Fiber holds `type`, `props`, `stateNode` (DOM link), `return` (parent), `child`, `sibling` pointers forming a linked tree traversal structure. Also tracks `alternate` (double buffer), `effectTag`, hooks list, and lanes for priority. This linked list representation allows pausing traversal mid-tree — unlike recursive stack-only reconciliation. Work loop processes fibers incrementally. Understanding fibers explains why React can interrupt rendering.

**Follow-up:** Fiber vs virtual DOM element?

---

### Q105. What is double buffering in React Fiber?

**Short definition:** `current` tree reflects what's on screen.

**Answer:** `current` tree reflects what's on screen. `workInProgress` tree is built during render phase from updates. On commit, pointers swap — workInProgress becomes current. Failed or abandoned renders discard workInProgress without touching DOM. Enables concurrent features — start render, pause for urgent update, resume or throw away stale work. Similar to graphics double buffering — user never sees half-updated inconsistent tree.

**Follow-up:** What happens to WIP tree on interruption?

---

### Q106. What are lanes in React scheduling?

**Short definition:** React 18+ assigns each update a lane.

**Answer:** React 18+ assigns each update a lane. Higher priority lanes (user input, sync) interrupt lower (transitions, idle). Multiple updates can batch if same lane. `startTransition` marks updates as transition lane — interruptible. Helps keep input responsive during heavy re-renders. Internal detail but explains concurrent behavior in interviews. Not directly exposed API — felt via useTransition and useDeferredValue.

**Follow-up:** How lanes relate to batching?

---

### Q107. Walk through Fiber reconciliation for a list update. [must-know]

**Short definition:** When parent re-renders with new child array, React iterates new children alongside old fiber siblings.

**Answer:** When parent re-renders with new child array, React iterates new children alongside old fiber siblings. Same key and type — reuse fiber, update props, mark Update effect. Different type — delete old subtree, create new. New key — Placement effect for mount. Missing key — Deletion effect. Keys enable O(n) list diff instead of naive full rebuild. This is why index keys break on reorder — wrong fiber reuse causes state bugs.

**Follow-up:** What is lastPlacedIndex?

---

### Q108. What is the work loop in React?

**Short definition:** `workLoopConcurrent` or sync variant calls `performUnitOfWork` on next fiber, traversing child/sibling/return links.

**Answer:** `workLoopConcurrent` or sync variant calls `performUnitOfWork` on next fiber, traversing child/sibling/return links. Concurrent mode checks `shouldYield()` against frame deadline — pauses and schedules continuation. Sync mode runs to completion. Completed work collects effect list flushed in commit phase. Connects Fiber architecture to time slicing — not magic threads, cooperative scheduling on main thread.

**Follow-up:** Scheduler package role?

---

## Infosys & Practical Scenarios

---

### Q109. Infosys: implement sortable table columns. [infosys]

**Short definition:** Store `sortKey` and `sortDir` in state.

**Answer:** Store `sortKey` and `sortDir` in state. Click header toggles direction or switches key. `useMemo` sorts filtered rows immutably. Use stable row IDs as keys — never index after sort. Optionally show sort indicator aria-sort on headers. For large data, sort on server with query params. Infosys often asks this after filterable grid — combine search plus sort in derived data pipeline.

**Follow-up:** Stable sort for equal values?

```jsx
const sorted = useMemo(() => {
  const copy = [...filtered];
  copy.sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });
  return copy;
}, [filtered, sortKey, sortDir]);
```

---

### Q110. Infosys: select-all checkbox in a table. [infosys]

**Short definition:** State: `Set` or `{ [id]: true }` of selected IDs.

**Answer:** State: `Set` or `{ [id]: true }` of selected IDs. Header checked when all visible rows selected; indeterminate when some. Click header toggles all visible IDs. Row click toggles one ID functionally. Derive counts for bulk actions bar. Immutable Set updates: `new Set(selected)` add/delete. Test edge case: select all then filter — clarify UX spec in interview.

**Follow-up:** Performance with 10k rows?

---

### Q111. Infosys: modal form add/edit pattern. [infosys]

**Short definition:** State: `{ open, mode, editingId, formData }`.

**Answer:** State: `{ open, mode, editingId, formData }`. Add opens empty form; edit copies row into formData. Submit dispatches create or update to state or API. Close resets form to prevent stale data on reopen. Focus first input on open via ref plus useLayoutEffect. Trap focus in modal for a11y. Common Infosys machine coding combined with table CRUD.

**Follow-up:** Controlled modal vs portal?

---

### Q112. Infosys: tabs component without library. [infosys]

**Short definition:** State `activeTab` index or string key.

**Answer:** State `activeTab` index or string key. Tab buttons set active; only matching panel renders or all render with hidden attribute. Use roles: tablist, tab, tabpanel. Arrow keys navigate tabs for a11y bonus. Compound component pattern with context scales better. Infosys tests component design and state colocation — keep tab state in Tabs parent, not global Redux.

**Follow-up:** Lazy load tab panel content?

---

### Q113. Infosys: pagination client-side vs server-side. [infosys]

**Short definition:** Client: `page`, `pageSize`, slice sorted array with useMemo, render prev/next controls.

**Answer:** Client: `page`, `pageSize`, slice sorted array with useMemo, render prev/next controls. Server: pass page to API, display total from response metadata. Disable next on last page. Reset page to 1 when search filter changes — common bug. Infosys may ask time complexity: client O(n) per filter; server O(pageSize) transfer. Choose based on dataset size.

**Follow-up:** URL sync for page number?

---

### Q114. What is `activity` / Offscreen API in modern React?

**Short definition:** `<Activity mode={visible ? 'visible' : 'hidden'}>` (evolving API) deprioritizes hidden subtrees while preserving state — unlike conditional unmount.

**Answer:** `<Activity mode={visible ? 'visible' : 'hidden'}>` (evolving API) deprioritizes hidden subtrees while preserving state — unlike conditional unmount. Useful for tabs, multi-step wizards, router stacks. Related to `useDeferredValue` philosophy — don't throw away expensive UI. Check current React docs for stable API name in your version. Concept matters for interviews discussing kept-alive views.

**Follow-up:** vs display:none?

---

### Q115. React 19: Document metadata and resource preloading.

**Short definition:** Render `<title>`, `<meta>`, `<link rel="stylesheet">` in components — React hoists to document head during SSR and client render.

**Answer:** Render `<title>`, `<meta>`, `<link rel="stylesheet">` in components — React hoists to document head during SSR and client render. Reduces react-helmet dependency for simple cases. Preconnect and preload hints colocate with routes. Works in Server Components for SEO-critical pages. Interview: mention alongside Next.js Metadata API for App Router apps.

**Follow-up:** vs react-helmet-async?

---

### Q116. What is View Transitions API with React?

**Short definition:** `document.startViewTransition(() => setState(...))` captures old and new snapshots for CSS animation.

**Answer:** `document.startViewTransition(() => setState(...))` captures old and new snapshots for CSS animation. React experimental APIs wrap updates for SPA page transitions. Progressive enhancement — fallback instant update without API support. Useful for card-to-detail morph animations. Know conceptually for frontend system design; API still stabilizing.

**Follow-up:** Performance cost?

---

### Q117. Infosys: prevent unnecessary context re-renders. [infosys]

**Short definition:** Split AuthContext and ThemeContext instead of one mega context.

**Answer:** Split AuthContext and ThemeContext instead of one mega context. Memoize provider value: `useMemo(() => ({ user, login }), [user, login])`. For high-frequency updates, use external store (Zustand) or context selector libraries. Move state down — don't put form typing in global context. Infosys asks when you'd use Context vs Redux — tie answer to re-render scope.

**Follow-up:** use-context-selector library?

---

### Q118. What is re-render bailout at Fiber level?

**Short definition:** `React.memo` bails at component level.

**Answer:** `React.memo` bails at component level. Internal bailout when fiber props unchanged and no state update scheduled. Context change forces bailout failure for all consumers. Understanding bailouts explains profiler "Did not render" entries. memo plus stable props plus colocated state equals performance recipe. Fiber can skip descending into child if parent bails early enough.

**Follow-up:** Does bailout skip child hooks?

---

### Q119. Infosys: implement star rating component. [infosys]

**Short definition:** Controlled: `value` and `onChange` props.

**Answer:** Controlled: `value` and `onChange` props. Map 1-5 to buttons with aria-label "Rate N stars". Hover preview optional local state. Read-only mode for display. Half stars optional advanced. Keep star state local unless form submission needs it. Tests: click third star calls onChange(3). Simple component showing controlled pattern Infosys loves.

**Follow-up:** Accessible star rating pattern?

---

### Q120. React interview sound bite — full stack answer. [must-know]

**Short definition:** "React is declarative UI with one-way data flow.

**Answer:** "React is declarative UI with one-way data flow. Components re-render when state, props, or context change. Fiber enables concurrent rendering — render phase interruptible, commit phase synchronous. I use hooks for state and effects, memo and virtualization for performance, Context or Redux for shared state, and React 19 Actions for async forms. Keys stabilize lists; Error Boundaries catch render errors. I test behavior with RTL, not implementation." Draw render-commit loop if whiteboard available. Tailor depth to interviewer follow-ups.

**Follow-up:** Where does React fit in Next.js architecture?

---

**Total questions: 120**
