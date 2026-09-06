# Infosys ReactJS Developer — Interview Prep

## Profile

**Name:** Sawata Gore  
**Location:** Pune, Maharashtra  
**Experience:** ~3 years professional (Sep 2023 – Present)  
**Designation:** ReactJS Developer — Frontend Lead responsibilities (official payslip title: ReactJS Developer)  
**Employers:** Learnasyougo (Sep 2023 – Jul 2024) → DTSkill Services (Jul 2024 – Present) — same promoters, continuous career  
**Leadership:** Lead 6–8 frontend developers across concurrent projects; architecture, sprint planning, code reviews  
**Recognition:** Employee of the Month ×2 at DTSkill  
**Stack:** React 18/19, TypeScript, Redux Toolkit, TanStack Query, REST APIs, HTML/CSS, Git  

**Key Projects:**

- **Asset360Hub** — Next.js 16 enterprise IT asset management; primary frontend owner; 16+ RBAC modules  
- **TimeLens** — TechM workforce time-tracking; WebSockets; 6 role dashboards; primary contributor  
- **TRIEC** — Mentoring intake portal (React SPA); OTP auth; multi-step forms; Vite migration  
- **GenE** — In-house AI platform; SSE streaming; custom agent UI integration  

**Interview:** Infosys ReactJS Developer · Pune · Sep 5, 2026 · Screening shortlisted  
**Rounds:** Technical (~60 min) → Managerial (~30–45 min) → HR (~20 min)  
**Difficulty:** Easy to medium — interviewers focus on how you think, clean code, and fundamentals

**15 Must-Know Topics (study first):**

- Build n×n React Grid Matrix with dynamic state
- Implement debounce from scratch
- `setState` / `useState` called 4 times — batching behavior
- useEffect + dependency array pitfalls + cleanup
- Closures in JavaScript
- Event bubbling vs capturing vs delegation
- interface vs type in TypeScript
- Redux unidirectional data flow
- How to optimize a Redux / React app
- Controlled vs uncontrolled components
- Higher-Order Component — what and why
- Promise syntax + async/await error handling
- Semantic HTML + basic a11y
- devDependencies vs dependencies
- Scenario: last-minute UAT change from client

---

## Self Introduction

### Q1. Tell me about yourself. [must-know]

**Short definition:** A 2-minute professional intro covering who you are, what you do, and why this role.

**Answer:** Hi, I'm Sawata Gore, a ReactJS Developer based in Pune with around three years of professional experience. I started at Learnasyougo and continued with the same team at DTSkill Services — so it's one continuous career path, not two separate jobs stacked together. My official designation is ReactJS Developer, but I take Frontend Lead responsibilities: architecture decisions, sprint planning, and code reviews across multiple concurrent projects where I lead roughly six to eight frontend developers in total. I've built production apps like Asset360Hub — a Next.js enterprise asset platform where I'm the primary frontend owner — TimeLens, a real-time workforce dashboard with WebSockets, TRIEC, a React SPA intake portal, and GenE, our in-house AI platform with streaming chat UIs. I work daily with React, TypeScript, Redux Toolkit, and React Query. I'm excited about the Infosys ReactJS Developer role in Pune because it matches my stack, offers enterprise-scale delivery, and lets me grow on large React modernization projects while staying in Pune.

**Follow-up:** Walk me through one project in detail. — **Asset360Hub** for Next.js/React enterprise depth, or **TRIEC** for pure React SPA (Redux, OTP, multi-step forms, Vite migration).

---

## JavaScript Fundamentals & Live Coding

### Q2. What are closures in JavaScript? [must-know] [infosys]

**Short definition:** A function that retains access to variables from its outer lexical scope after the outer function has finished.

**Answer:** A closure is created when an inner function references variables from its enclosing function. Even after the outer function returns, the inner function still has access to those variables because they remain in memory. Closures enable private state, factory functions, and patterns like debounce and module patterns. They're one of the most commonly tested JavaScript concepts at Infosys because they appear in live coding and follow-up questions about memory. Understanding closures also helps explain stale state bugs in React hooks.

```javascript
function createCounter() {
  let count = 0;
  return () => ++count;
}
const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
```

**Follow-up:** How are closures related to garbage collection? — Variables referenced by a reachable closure stay in memory; holding closures in global arrays can prevent GC.

---

### Q3. Implement debounce from scratch. [must-know] [infosys]

**Short definition:** Delay function execution until the user stops triggering an event for a specified wait period.

**Answer:** Debounce resets a timer on every trigger and only calls the function after the wait period passes with no new triggers. It's ideal for search inputs, resize handlers, and form validation where you want to reduce API calls or expensive computations. At Infosys this is a frequent live-coding task — write it without libraries. The key is storing the timer ID in the closure scope and clearing it before setting a new timeout.

```javascript
function debounce(fn, delay) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
}
const handleSearch = debounce((query) => fetchResults(query), 300);
```

**Follow-up:** What if multiple buttons share the same debounced function? — They share one timer; create separate debounced instances per handler for independent behavior.

---

### Q4. Implement throttle from scratch. [infosys]

**Short definition:** Ensure a function runs at most once every `limit` milliseconds.

**Answer:** Throttle uses a flag or timestamp to block repeated calls within a time window. Unlike debounce, throttle guarantees execution at a regular interval during continuous events. Use it for scroll, mousemove, or button spam prevention where you need periodic updates rather than waiting for activity to stop. The implementation sets a lock after execution and releases it after the limit period.

```javascript
function throttle(fn, limit) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
```

**Follow-up:** Debounce vs throttle — when to use each? — Debounce for search/wait-until-idle; throttle for scroll/resize/rate-limited updates.

---

### Q5. Event bubbling, capturing, and delegation. [must-know] [infosys]

**Short definition:** Three phases of DOM event propagation and a pattern for efficient event handling.

**Answer:** Capturing travels from window down to the target; bubbling travels from target back up to window. By default, listeners run in the bubbling phase. Event delegation attaches one listener on a parent and uses `event.target` to handle child events — efficient for dynamic lists. Infosys often asks about all three phases and may follow up with double-click implementation.

```javascript
document.getElementById("list").addEventListener("click", (e) => {
  if (e.target.matches("li")) console.log("Clicked:", e.target.textContent);
});
```

**Follow-up:** How to implement double-click? — Use native `dblclick` or track click count with a 300ms reset timer.

---

### Q6. Arrow functions vs normal functions. [infosys]

**Short definition:** Two function syntaxes with different `this` binding and hoisting behavior.

**Answer:** Normal functions have dynamic `this` determined by the caller; arrow functions inherit `this` lexically from the enclosing scope. Arrow functions cannot be used as constructors, lack the `arguments` object, and are not hoisted like function declarations. In React class components `this` binding mattered; in functional components arrow functions in callbacks avoid binding issues but shouldn't be used as object methods when you need dynamic `this`.

```javascript
const obj = {
  name: "Test",
  regular: function () { return this.name; },
  arrow: () => this?.name, // `this` is NOT obj
};
```

**Follow-up:** Can arrow functions be used as React event handlers? — Yes, commonly; they create new references each render unless wrapped in useCallback.

---

### Q7. What are Promises? Write the syntax. [must-know] [infosys]

**Short definition:** An object representing the eventual completion or failure of an asynchronous operation.

**Answer:** Promises have three states: pending, fulfilled, and rejected. They chain with `.then()`, `.catch()`, and `.finally()`. Async/await is syntactic sugar on top of Promises with cleaner try/catch error handling. At Infosys you should be able to write both styles and explain error propagation. Always handle rejections to avoid unhandled promise errors in production.

```javascript
async function load() {
  try {
    const data = await fetchData();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
```

**Follow-up:** Promise.all vs Promise.allSettled? — `all` fails fast on first rejection; `allSettled` waits for all and returns each status.

---

### Q8. Explain call, apply, and bind.

**Short definition:** Three methods to explicitly set the `this` context of a function.

**Answer:** `call` invokes immediately with comma-separated arguments. `apply` invokes immediately with an array of arguments. `bind` returns a new function with bound `this` without invoking it. These are foundational for understanding how JavaScript handles context and are occasionally tested in mid-level interviews. In modern React you encounter them less directly but they explain how callbacks and partial application work.

```javascript
function greet(greeting) { return `${greeting}, ${this.name}`; }
const user = { name: "Sawata" };
greet.call(user, "Hello"); // "Hello, Sawata"
```

**Follow-up:** When would you use bind in React? — Legacy class components for event handlers: `this.handleClick = this.handleClick.bind(this)`.

---

### Q9. What is currying?

**Short definition:** Transforming a multi-argument function into a sequence of single-argument functions.

**Answer:** Currying enables partial application — fixing some arguments and returning a function for the rest. It's useful for creating specialized functions from generic ones, like `multiplyBy(2)` returning a doubler. While not daily React work, it demonstrates functional programming understanding that Infosys interviewers appreciate in JS rounds.

```javascript
const add = (a) => (b) => (c) => a + b + c;
const multiplyBy = (n) => (x) => x * n;
const double = multiplyBy(2);
```

**Follow-up:** Currying vs partial application? — Currying always returns unary functions; partial application fixes any number of args at once.

---

### Q10. Explain the JavaScript event loop. [infosys]

**Short definition:** The mechanism that manages synchronous execution, async callbacks, and queue processing in single-threaded JavaScript.

**Answer:** JavaScript runs synchronous code on the call stack. Async operations (setTimeout, fetch) go to Web APIs; their callbacks enter macrotask or microtask queues. The event loop pushes queued work to the stack when the stack is empty. Microtasks (Promises) run before macrotasks (setTimeout). This ordering explains common output prediction questions.

```javascript
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");
// Output: 1, 4, 3, 2
```

**Follow-up:** What is the microtask queue? — Promise callbacks, queueMicrotask, MutationObserver — processed entirely before next macrotask.

---

### Q11. Difference between let, var, and const.

**Short definition:** Three variable declaration keywords with different scoping and reassignment rules.

**Answer:** `var` is function-scoped, hoisted with undefined initialization, and can be redeclared. `let` is block-scoped, hoisted but in the Temporal Dead Zone until declared, and cannot be redeclared in the same scope. `const` is block-scoped, must be initialized, and cannot be reassigned — though object contents can still mutate. Modern code prefers `const` by default and `let` when reassignment is needed.

**Follow-up:** What is the Temporal Dead Zone? — The period between scope entry and declaration where let/const cannot be accessed.

---

### Q12. What is hoisting?

**Short definition:** JavaScript's behavior of moving declarations to the top of their scope during compilation.

**Answer:** Function declarations and `var` are hoisted and can be referenced before their line (var as undefined). `let` and `const` are hoisted but not initialized — accessing them before declaration throws a ReferenceError. Understanding hoisting prevents bugs with function order and explains why `var` in loops caused classic closure issues.

**Follow-up:** Are class declarations hoisted? — Yes, but like let/const they're in TDZ until the declaration line.

---

### Q13. What is the DOM tree? [infosys]

**Short definition:** A tree-like in-memory representation of HTML that JavaScript can traverse and mutate.

**Answer:** The DOM represents documents as nodes — elements, text, attributes — organized hierarchically. JavaScript can query, create, and modify nodes to update the page dynamically. React builds a Virtual DOM, diffs it against the previous tree, and applies minimal updates to the real DOM. Infosys may connect DOM knowledge to event delegation and accessibility.

**Follow-up:** Virtual DOM vs Real DOM? — Virtual DOM is a lightweight JS representation; reconciliation minimizes expensive real DOM operations.

---

### Q14. Remove elements from first array present in second array. [infosys]

**Short definition:** A common Infosys live-coding problem using filter and Set for O(n) lookup.

**Answer:** Convert the removal array to a Set for O(1) lookups, then filter the source array keeping only items not in the Set. This is cleaner and faster than nested loops. Mention time complexity O(n + m) and that Set handles duplicates in the removal list automatically.

```javascript
function removeFromSource(source, toRemove) {
  const removeSet = new Set(toRemove);
  return source.filter((item) => !removeSet.has(item));
}
removeFromSource([1, 2, 3, 4, 5], [2, 4]); // [1, 3, 5]
```

**Follow-up:** How to preserve order? — Filter preserves source order naturally.

---

### Q15. Shallow copy vs deep copy.

**Short definition:** Duplicating data at the top level only vs cloning all nested levels.

**Answer:** Shallow copy (`[...arr]`, `{...obj}`) duplicates top-level references — nested objects still share memory. Deep copy clones all levels independently. Use `structuredClone()` for plain data or JSON parse/stringify for simple JSON-safe objects. In React state updates, shallow copies at each level you mutate are usually sufficient and preferred for performance.

**Follow-up:** Why does React care about immutability? — Shallow comparison in reconciliation detects changes; mutating state in place skips re-renders.

---

### Q16. What are polyfills and why do they matter? [infosys]

**Short definition:** Code that implements modern features on browsers lacking native support.

**Answer:** Polyfills like `core-js` add `Array.prototype.includes`, `Promise`, or `fetch` to older browsers. They let you write modern JavaScript while maintaining cross-browser compatibility. Build tools often inject polyfills based on browserslist config. Mention you check Can I Use and target supported browser matrix from the project.

**Follow-up:** Polyfill vs transpilation? — Babel transpiles syntax (arrow functions → function); polyfills add missing runtime APIs.

---

### Q17. == vs ===

**Short definition:** Loose equality with type coercion vs strict equality without coercion.

**Answer:** `===` compares value and type without coercion — always prefer it. `==` coerces types before comparing, leading to surprising results like `"5" == 5` being true and `null == undefined` being true. Strict equality makes code predictable and is the standard in TypeScript and modern JavaScript codebases.

**Follow-up:** What about Object.is()? — Like === but distinguishes +0/-0 and treats NaN as equal to NaN.

---

### Q18. What are higher-order functions?

**Short definition:** Functions that take other functions as arguments or return functions.

**Answer:** Array methods like `map`, `filter`, and `reduce` are built-in higher-order functions. Custom examples include debounce, throttle, and currying. They enable functional composition and reusable abstractions. In React, HOCs follow the same pattern at the component level.

```javascript
const evens = [1, 2, 3, 4].filter((n) => n % 2 === 0);
const sum = [1, 2, 3].reduce((acc, n) => acc + n, 0);
```

**Follow-up:** map vs forEach? — map returns a new array; forEach is for side effects and returns undefined.

---

### Q19. Build an n×n React Grid Matrix with dynamic state. [must-know] [infosys]

**Short definition:** The top Infosys live-coding task — a toggleable grid whose size changes dynamically.

**Answer:** Store grid size and a flat boolean array for cell states. When size changes, reset the cells array to `size × size`. Toggle cells with immutable updates using the functional setter pattern. Use CSS Grid with `gridTemplateColumns: repeat(n, 40px)` driven by state. Add `aria-pressed` for accessibility. This task tests state management, dynamic rendering, and clean React patterns.

```typescript
const [size, setSize] = useState(3);
const [cells, setCells] = useState<boolean[]>(() => Array(9).fill(false));

const toggle = (index: number) => {
  setCells((prev) => {
    const next = [...prev];
    next[index] = !next[index];
    return next;
  });
};
```

**Follow-up:** What happens if you use index as key when size changes? — React may reuse wrong DOM nodes; resetting the entire array on size change avoids this.

---

### Q20. Build a Counter with increment, decrement, and initial value. [infosys]

**Short definition:** A basic React state exercise testing controlled input and functional updates.

**Answer:** Use separate state for the initial value input and the current count. Apply initial value on button click with validation. Increment and decrement must use functional updates `(c) => c + 1` to avoid stale closure bugs. This is a warm-up coding task that leads into batching questions.

```typescript
const [count, setCount] = useState(0);
<button onClick={() => setCount((c) => c + 1)}>+</button>
<button onClick={() => setCount((c) => c - 1)}>-</button>
```

**Follow-up:** Why functional updates? — They always receive the latest state, especially important when multiple updates batch together.

---

### Q21. Write a custom useFetch hook. [infosys]

**Short definition:** Extract reusable data-fetching logic with loading, error, and cleanup.

**Answer:** Encapsulate fetch logic in a custom hook returning `{ data, loading, error }`. Use AbortController in useEffect cleanup to cancel in-flight requests on unmount or URL change. Handle non-OK HTTP responses explicitly. This demonstrates hooks mastery beyond basic useState/useEffect.

```typescript
export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(setData)
      .catch((err) => { if (err.name !== "AbortError") setError(err.message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}
```

**Follow-up:** Why AbortController? — Prevents state updates on unmounted components and race conditions when URL changes quickly.

---

## React & TypeScript

### Q22. interface vs type in TypeScript. [must-know] [infosys]

**Short definition:** Two ways to define object shapes and aliases with different capabilities.

**Answer:** Interfaces support declaration merging and `extends` for inheritance. Types support unions, intersections, and primitive aliases. Both work for React props; interfaces are the common convention for component props, while types excel at union states like `"idle" | "loading" | "error"`. At Infosys this is a must-know comparison — give examples of both.

```typescript
interface User { id: number; name: string; email?: string; }
type Status = "idle" | "loading" | "success" | "error";
type ApiResponse<T> = { data: T } | { error: string };
```

**Follow-up:** When to use Omit/Pick? — Omit hides sensitive fields in API responses; Pick creates preview DTOs for list views.

---

### Q23. When to use `any` vs `unknown`? [infosys]

**Short definition:** `any` disables type checking; `unknown` requires narrowing before use.

**Answer:** Avoid `any` in production — it defeats TypeScript's purpose and hides bugs. Use `unknown` for values from external sources (API responses, JSON.parse) and narrow with typeof, instanceof, or type guards before accessing properties. This is the type-safe alternative when you genuinely don't know the shape at compile time.

```typescript
function process(value: unknown) {
  if (typeof value === "string") console.log(value.toUpperCase());
}
```

**Follow-up:** What is a type guard? — A function returning `value is Type` that narrows the type in conditional blocks.

---

### Q24. Explain generics with a React example.

**Short definition:** Type parameters that make components and functions reusable while staying type-safe.

**Answer:** Generics let you write one component that works with any option type while preserving type information. A generic Select component accepts `T[]` options and typed onChange callbacks. Without generics you'd use `any` and lose autocomplete and compile-time checks.

```typescript
interface SelectProps<T> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  getLabel: (item: T) => string;
}
function Select<T>({ options, value, onChange, getLabel }: SelectProps<T>) { /* ... */ }
```

**Follow-up:** Generic constraints? — `<T extends { id: number }>` limits T to types with an id field.

---

### Q25. Utility types: Pick, Omit, Partial. [infosys]

**Short definition:** Built-in TypeScript helpers to derive new types from existing ones.

**Answer:** `Pick<User, "id" | "name">` selects specific fields. `Omit<User, "password">` excludes fields — common for API responses. `Partial<User>` makes all fields optional — useful for update forms. These reduce duplication and keep types in sync with a single source interface.

```typescript
type PublicUser = Omit<User, "password">;
type UserUpdate = Partial<Omit<User, "id">>;
type UserPreview = Pick<User, "id" | "name">;
```

**Follow-up:** How is Omit useful in React? — Extend native HTML props while excluding conflicting ones: `Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick">`.

---

### Q26. How do you type React component props and events?

**Short definition:** Use typed interfaces for props and React's built-in event types for handlers.

**Answer:** Define a props interface with required and optional fields using `?`. Use `React.ReactNode` for children. Type events with `React.ChangeEvent<HTMLInputElement>`, `React.FormEvent<HTMLFormElement>`, and `React.MouseEvent<HTMLButtonElement>`. TypeScript catches missing props and wrong event usage at compile time.

```typescript
type ButtonProps = {
  label: string;
  variant?: "primary" | "secondary";
  onClick: () => void;
};
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value);
```

**Follow-up:** React.FC vs plain function — prefer plain functions with explicit props type; React.FC adds implicit children.

---

### Q27. What is React and its advantages?

**Short definition:** A JavaScript library for building UIs with a component-based, declarative model.

**Answer:** React uses components as reusable building blocks and JSX for readable UI code. The Virtual DOM enables efficient updates through reconciliation. One-way data flow makes state predictable. The ecosystem includes routing, state management, and testing tools. React's declarative model means you describe what the UI should look like for a given state, and React handles DOM updates.

**Follow-up:** React vs Angular? — React is a library (flexible, JSX); Angular is a full framework (opinionated, TypeScript-first, built-in DI).

---

### Q28. Props vs State.

**Short definition:** Read-only inputs from parent vs mutable internal component data.

**Answer:** Props flow down from parent to child and must not be modified by the child. State is owned by the component and changes via setState/useState trigger re-renders. Lifting state up means moving shared state to the nearest common ancestor. Understanding this distinction is fundamental for every React interview question about data flow.

**Follow-up:** Can you modify props? — No; if you need a local copy, initialize state from props once or use a key to reset.

---

### Q29. Explain useState and useEffect. [must-know] [infosys]

**Short definition:** The two most essential hooks for local state and side effects.

**Answer:** `useState` adds local state to functional components; the setter triggers re-renders. `useEffect` runs side effects after render — API calls, subscriptions, DOM updates — with an optional cleanup function and dependency array. Map useEffect to lifecycle: empty deps = mount, deps = update, cleanup = unmount. Missing deps cause stale closures; extra deps cause infinite loops.

```typescript
useEffect(() => {
  document.title = `Count: ${count}`;
  return () => { /* cleanup */ };
}, [count]);
```

**Follow-up:** What runs first — render or effect? — Render completes first; effects run after paint (useLayoutEffect runs before paint).

---

### Q30. setState(count+1) called 4 times — what happens? [must-know] [infosys]

**Short definition:** React 18 automatic batching means four direct updates using stale value only increment once.

**Answer:** In React 18+, all four `setCount(count + 1)` calls batch into one re-render. Each reads the same stale `count`, so the result is +1, not +4. Use the functional updater `setCount(c => c + 1)` four times to get +4. This is one of the top Infosys React questions — explain batching clearly.

```typescript
// Wrong — only +1
setCount(count + 1); setCount(count + 1); setCount(count + 1); setCount(count + 1);
// Correct — +4
setCount((c) => c + 1); setCount((c) => c + 1); setCount((c) => c + 1); setCount((c) => c + 1);
```

**Follow-up:** Does batching apply outside React events? — Yes in React 18 (setTimeout, promises) via automatic batching.

---

### Q31. Controlled vs uncontrolled components. [must-know]

**Short definition:** React state drives the input value vs the DOM holds the value via refs.

**Answer:** Controlled components use `value={state}` and `onChange` — React is the single source of truth. Uncontrolled components use refs to read DOM values directly. Prefer controlled for validation, dynamic UI, and form libraries. Uncontrolled suits simple forms or integrating non-React widgets. Infosys expects you to explain both with a quick example.

```typescript
// Controlled
<input value={name} onChange={(e) => setName(e.target.value)} />
// Uncontrolled
const ref = useRef<HTMLInputElement>(null);
<input ref={ref} defaultValue="hello" />
```

**Follow-up:** defaultValue vs value? — defaultValue sets initial uncontrolled value; value makes it controlled and requires onChange.

---

### Q32. What are React keys and why do they matter?

**Short definition:** Stable identifiers helping React match list items across re-renders.

**Answer:** Keys help reconciliation identify which items changed, were added, or removed. Use stable unique IDs from data — not array index when the list can reorder, insert, or delete. Wrong keys cause incorrect DOM reuse, lost input state, and animation bugs. Keys must be unique among siblings, not globally.

**Follow-up:** Can key be index? — Acceptable for static lists that never reorder; avoid for dynamic lists.

---

### Q33. Explain useMemo and useCallback.

**Short definition:** Hooks that memoize computed values and function references respectively.

**Answer:** `useMemo` caches a computed result until dependencies change — use for expensive calculations. `useCallback` caches a function reference — use when passing callbacks to memoized children. Don't apply everywhere; premature optimization adds complexity. Profile first, then memoize bottlenecks.

```typescript
const sorted = useMemo(() => expensiveSort(items), [items]);
const handleClick = useCallback(() => doSomething(id), [id]);
```

**Follow-up:** useMemo vs React.memo? — useMemo memoizes a value inside a component; React.memo memoizes the entire component render.

---

### Q34. What is React Router? How to handle 404? [infosys]

**Short definition:** Client-side routing library for SPAs with nested routes and catch-all handling.

**Answer:** React Router maps URL paths to components without full page reloads. Use `BrowserRouter`, `Routes`, and `Route` for path matching. The catch-all route `path="*"` renders a NotFound component for unmatched URLs. Protected routes wrap components with auth checks or use loader patterns in React Router v6.4+.

```typescript
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

**Follow-up:** BrowserRouter vs HashRouter? — BrowserRouter uses clean URLs; HashRouter uses `#` for static hosting without server config.

---

### Q35. What are Higher-Order Components (HOC)? [must-know] [infosys]

**Short definition:** A function that takes a component and returns an enhanced component with added behavior.

**Answer:** HOCs wrap components to inject props, auth checks, or logging without modifying the original. Example: `withAuth(Dashboard)` redirects unauthenticated users. Advantages include reusability and separation of concerns. Modern React prefers custom hooks over HOCs for similar patterns, but Infosys still asks about HOCs explicitly.

```typescript
function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function Authenticated(props: P) {
    const isLoggedIn = Boolean(localStorage.getItem("token"));
    if (!isLoggedIn) return <p>Please log in</p>;
    return <Component {...props} />;
  };
}
```

**Follow-up:** HOC vs custom hook? — Hooks are simpler, avoid wrapper hell, and don't affect component tree DevTools display.

---

### Q36. React.lazy and Suspense. [infosys]

**Short definition:** Code-splitting API that loads components on demand with a loading fallback.

**Answer:** `React.lazy(() => import('./Dashboard'))` creates a dynamically imported component. Wrap it in `<Suspense fallback={<Spinner />}>` to show loading UI while the chunk downloads. This reduces initial bundle size and improves Time to Interactive. Route-based splitting is the most common pattern.

```typescript
const Dashboard = React.lazy(() => import("./Dashboard"));
<Suspense fallback={<Spinner />}><Dashboard /></Suspense>
```

**Follow-up:** Can Suspense wrap multiple lazy components? — Yes; one Suspense boundary shows fallback until all nested lazy components resolve.

---

### Q37. Error Boundaries.

**Short definition:** Components that catch JavaScript errors in child tree and show fallback UI.

**Answer:** Error boundaries must be class components (or use react-error-boundary library). They catch render errors in children via `getDerivedStateFromError` and log via `componentDidCatch`. They do NOT catch event handler errors, async errors, or SSR errors. Place them around route segments or feature modules.

**Follow-up:** How to handle errors in event handlers? — try/catch inside the handler; error boundaries won't catch them.

---

### Q38. Presentation vs Container components. [infosys]

**Short definition:** Dumb UI components vs smart components handling logic and data fetching.

**Answer:** Presentation components receive data via props and render UI — no API calls or business logic. Container components manage state, fetch data, and pass results down. This separation improves testability and reusability. Modern React often replaces strict container/presentational split with custom hooks + thin components.

**Follow-up:** Is this pattern still recommended? — The hook pattern achieves the same separation with less boilerplate.

---

### Q39. How to prevent unnecessary re-renders?

**Short definition:** Techniques to reduce wasted render cycles and improve performance.

**Answer:** Use React.memo for pure components, useCallback/useMemo for stable references, split state so unrelated components don't re-render, avoid inline object/function props, and use Redux selectors with memoization (reselect). Profile with React DevTools before optimizing — don't memoize everything by default.

**Follow-up:** Does Context cause re-renders? — Yes, all consumers re-render when context value changes; split contexts or use selectors.

---

### Q40. Semantic HTML and basic accessibility. [must-know] [infosys]

**Short definition:** Meaningful HTML elements and practices for inclusive, SEO-friendly UIs.

**Answer:** Use `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>` instead of div soup. Add alt text to images, keyboard navigation support, ARIA labels where semantic HTML isn't enough, and sufficient color contrast (WCAG AA). Test with Lighthouse accessibility audit and keyboard-only navigation.

**Follow-up:** What are void elements? [infosys] — Self-closing tags with no children: `<br>`, `<img>`, `<input>`, `<meta>`, `<link>`, `<hr>`.

---

### Q41. Create a React datalist autocomplete. [infosys]

**Short definition:** HTML5 datalist integrated with a controlled React input.

**Answer:** Use a controlled input with `list="id"` pointing to a `<datalist>` containing `<option>` elements. The user can type freely or pick from suggestions. Simple, accessible, and a known Infosys coding/UI task.

```typescript
<input list="fruits" value={fruit} onChange={(e) => setFruit(e.target.value)} />
<datalist id="fruits">
  {FRUITS.map((item) => <option key={item} value={item} />)}
</datalist>
```

**Follow-up:** datalist vs custom autocomplete? — datalist is native and lightweight; custom gives full styling and async search control.

---

### Q42. HTTP methods — GET, POST, PUT, PATCH, DELETE. [infosys]

**Short definition:** REST verbs for CRUD operations with different idempotency characteristics.

**Answer:** GET reads data and is safe/idempotent. POST creates resources and is not idempotent. PUT replaces an entire resource; PATCH partially updates. DELETE removes a resource. Know which to use when integrating APIs in React apps and mention idempotency for retry logic.

**Follow-up:** POST vs PUT for updates? — PUT replaces whole resource at known URI; PATCH sends partial changes.

---

### Q43. devDependencies vs dependencies. [must-know] [infosys]

**Short definition:** Runtime packages vs development/build-only packages in package.json.

**Answer:** `dependencies` are required at runtime in production — react, axios, redux. `devDependencies` are only needed for development and build — typescript, eslint, jest, webpack. Installing a build tool as a dependency bloats production bundles if not tree-shaken properly. CI installs both; production deploy may use `npm ci --omit=dev`.

**Follow-up:** What do ^ and ~ mean in versions? [infosys] — `^1.2.3` allows minor/patch updates; `~1.2.3` allows patch only.

---

### Q44. What is type inference in TypeScript? [infosys]

**Short definition:** TypeScript automatically deduces types when you omit explicit annotations.

**Answer:** Variables initialized with literals get inferred types — `"hello"` becomes string. Function return types are inferred from return statements. Inference reduces boilerplate while maintaining safety. Explicit annotations are still needed for function parameters and complex public APIs.

```typescript
let name = "Sawata";     // string
const nums = [1, 2, 3];  // number[]
function add(a: number, b: number) { return a + b; } // return: number
```

**Follow-up:** When to add explicit return types? — Public library APIs, complex functions, and when inference produces overly wide types.

---

## Redux

### Q45. Explain Redux data flow. [must-know] [infosys]

**Short definition:** Unidirectional cycle: dispatch action → reducer → new state → UI update.

**Answer:** Components dispatch plain action objects describing what happened. Reducers are pure functions that take current state and action, returning new immutable state. The store holds state and notifies subscribers. Connected components re-render when selected state slices change. This predictability is why Redux is popular in enterprise Infosys projects.

```
UI → dispatch(action) → reducer → new state → UI updates
```

**Follow-up:** Can reducers have side effects? — No; side effects belong in middleware (thunk, saga) or RTK createAsyncThunk.

---

### Q46. What is Redux? When to use vs avoid? [infosys]

**Short definition:** Predictable global state container — use for complex shared state, avoid for simple apps.

**Answer:** Use Redux when many components share state, state logic is complex, you need middleware for async flows, or time-travel debugging helps. Avoid it when local state and Context suffice — small apps don't need the boilerplate. Redux Toolkit is the modern standard, reducing ceremony with createSlice and Immer.

**Follow-up:** Redux vs Context? — Context for infrequent updates (theme, locale); Redux for complex, frequently changing global state.

---

### Q47. Redux Toolkit (RTK) advantages.

**Short definition:** Official Redux API that reduces boilerplate and enforces best practices.

**Answer:** `createSlice` generates actions and reducers together. Immer allows mutable-looking syntax with immutable updates. `createAsyncThunk` handles async flows. Built-in DevTools integration and sensible defaults. Always recommend RTK over legacy hand-written Redux in interviews.

```typescript
const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: { increment: (state) => { state.value += 1; } },
});
```

**Follow-up:** What is Immer? — Proxy-based library letting you write `state.value += 1` while producing immutable updates.

---

### Q48. How to optimize a Redux application? [must-know] [infosys]

**Short definition:** Normalize state, memoize selectors, narrow subscriptions, and batch updates.

**Answer:** Normalize nested data into flat entities by ID. Use `createSelector` from reselect for memoized derived data. Select only needed slices in useSelector to avoid unnecessary re-renders. Wrap connected components in React.memo. Use RTK Query for server cache. Code-split reducers in large apps. These techniques prevent the common "everything re-renders on every dispatch" problem.

**Follow-up:** What is RTK Query? — Data fetching and caching built into Redux Toolkit, replacing manual fetch + slice boilerplate.

---

### Q49. Redux middleware — thunk vs saga.

**Short definition:** Extensions to dispatch for handling async and complex side effects.

**Answer:** Redux-thunk lets action creators return async functions — simple and widely used. Redux-saga uses generator functions for complex flows — debounced search, cancellation, race conditions. Start with thunk; reach for saga when flows become hard to reason about in thunk chains.

**Follow-up:** What does middleware receive? — `{ dispatch, getState }` store methods, allowing chained dispatch and state reads.

---

### Q50. useReducer vs useState.

**Short definition:** useReducer for complex state logic; useState for simple values.

**Answer:** useReducer follows the Redux pattern locally — `(state, action) => newState`. Use it when state has multiple sub-values, next state depends on previous, or logic is complex enough to extract a reducer function. useState is simpler for independent scalar values.

**Follow-up:** Can you combine useReducer with Context? — Yes, for lightweight global state without Redux.

---

### Q51. What is prop drilling and how to solve it?

**Short definition:** Passing props through many intermediate layers to reach a deep child.

**Answer:** Prop drilling makes components aware of data they don't use, hurting maintainability. Solutions include React Context for shared data, Redux/Zustand for global state, component composition (pass children instead of props), and custom hooks that encapsulate logic. Choose based on update frequency and scope.

**Follow-up:** Composition pattern example? — `<Layout sidebar={<Sidebar user={user} />}>` instead of passing user through Layout.

---

### Q52. Context API vs Redux — when to pick which?

**Short definition:** Built-in sharing vs full state management with middleware and DevTools.

**Answer:** Context works well for theme, locale, and auth with infrequent updates. It causes all consumers to re-render on any context change. Redux scales better for complex, frequently changing state with middleware, normalized stores, and time-travel debugging. Many apps use both — Context for DI-like patterns, Redux for app state.

**Follow-up:** How to optimize Context? — Split into multiple contexts or pass state and dispatch separately.

---

## Git Basics (Top 20)

### Q53. What is Git and why use it?

**Short definition:** Distributed version control system tracking code changes across collaborators.

**Answer:** Git records snapshots of your project history, enables branching for parallel work, and supports merging changes from multiple developers. Every clone is a full backup. It's the industry standard for frontend teams including Infosys delivery projects. Understanding Git is expected even for developer roles focused on UI.

**Follow-up:** Git vs SVN? — Git is distributed (full local history); SVN is centralized with linear revision numbers.

---

### Q54. git clone vs git fork?

**Short definition:** Clone copies a repo locally; fork creates your own remote copy on the hosting platform.

**Answer:** `git clone` downloads a repository to your machine with remote tracking configured. Forking (on GitHub/GitLab) creates a personal copy under your account, then you clone your fork to contribute via pull requests. In enterprise Infosys projects you typically clone the company remote directly.

**Follow-up:** git clone --depth 1? — Shallow clone fetching only latest commit, faster for large repos.

---

### Q55. Explain git status, add, commit, push workflow.

**Short definition:** The daily cycle of checking changes, staging, committing, and sharing.

**Answer:** `git status` shows modified, staged, and untracked files. `git add` stages changes for the next commit. `git commit -m "message"` saves a snapshot locally. `git push` uploads commits to the remote. Always write meaningful commit messages describing why, not just what. Run status before and after each step to stay oriented.

**Follow-up:** git add . vs git add -p? — `.` stages everything; `-p` interactively stages hunks for granular commits.

---

### Q56. What is git diff?

**Short definition:** Shows line-by-line changes between working tree, staging area, or commits.

**Answer:** `git diff` shows unstaged changes. `git diff --staged` shows what's ready to commit. `git diff main..feature` compares branches. Use diff during code review and before committing to catch accidental changes. It's one of the most-used debugging tools in daily Git workflow.

**Follow-up:** How to diff a specific file? — `git diff path/to/file.tsx`

---

### Q57. git branch, checkout, and switch.

**Short definition:** Commands for creating, listing, and moving between branches.

**Answer:** `git branch feature/x` creates a branch. `git checkout feature/x` or `git switch feature/x` moves to it. `git switch -c feature/x` creates and switches in one step. Branch per feature or bugfix keeps main stable. Delete merged branches to keep the repo clean.

**Follow-up:** What is HEAD? — Pointer to the current commit/branch you're on.

---

### Q58. git merge vs git rebase. [infosys]

**Short definition:** Two strategies for integrating branch changes — merge commit vs replayed commits.

**Answer:** Merge creates a merge commit preserving both branch histories — safe for shared branches. Rebase replays your commits on top of the target branch creating linear history — cleaner but rewrites commit SHAs. Never rebase commits already pushed to shared branches. Infosys may ask which you prefer and why.

**Follow-up:** Merge conflict resolution? — Edit conflicted files, remove markers, `git add`, then commit or continue rebase.

---

### Q59. What is git stash?

**Short definition:** Temporarily shelve uncommitted changes to switch context cleanly.

**Answer:** `git stash push -m "WIP feature"` saves working directory changes. `git stash pop` restores them. Useful when you need to switch branches urgently but aren't ready to commit. Stash is local — not pushed to remote by default.

**Follow-up:** git stash apply vs pop? — `apply` keeps stash entry; `pop` applies and removes it.

---

### Q60. git pull vs git fetch?

**Short definition:** Fetch downloads remote changes; pull fetches and merges into current branch.

**Answer:** `git fetch` updates remote-tracking branches without touching your working tree — safe to inspect first. `git pull` is fetch + merge (or rebase with `--rebase`). Prefer fetch + review + merge for team workflows to avoid surprise conflicts.

**Follow-up:** git pull --rebase? — Replays your local commits on top of remote instead of creating merge commit.

---

### Q61. What is git log and how to read it?

**Short definition:** Command showing commit history with authors, dates, and messages.

**Answer:** `git log --oneline --graph --all` gives a compact visual history. `git log -p file.tsx` shows commits affecting a file. `git blame file.tsx` shows who last modified each line. These help trace when bugs were introduced and understand feature evolution.

**Follow-up:** git log --author? — Filter commits by author for reviewing your own changes.

---

### Q62. What is a pull request (PR)?

**Short definition:** A request to merge your branch into another, enabling code review before integration.

**Answer:** Create a PR after pushing your feature branch. Teammates review for correctness, style, and edge cases. CI runs tests and lint. Address review comments with additional commits. Merge once approved. PRs are the standard quality gate in Infosys and most enterprise teams.

**Follow-up:** Squash merge vs merge commit? — Squash combines all commits into one clean commit on main.

---

### Q63. What is .gitignore?

**Short definition:** File listing paths Git should never track.

**Answer:** Ignore `node_modules/`, `.env`, `dist/`, IDE configs, and OS files. Prevents secrets and generated artifacts from entering version control. If something was committed before ignoring, use `git rm --cached` to untrack without deleting locally.

**Follow-up:** Can you ignore a tracked file? — Add to .gitignore then `git rm --cached filename`.

---

### Q64. git reset vs git revert?

**Short definition:** Reset moves branch pointer (can discard history); revert creates new commit undoing changes.

**Answer:** `git reset --soft HEAD~1` undoes last commit keeping changes staged. `--hard` discards changes entirely — dangerous on shared branches. `git revert` creates a new commit that negates a previous one — safe for public history. Use revert in production hotfix rollbacks on shared repos.

**Follow-up:** When is reset acceptable? — Local unpushed commits only; never on shared branches.

---

### Q65. What is git cherry-pick?

**Short definition:** Apply a specific commit from one branch onto another.

**Answer:** `git cherry-pick <commit-sha>` copies that commit's changes to your current branch. Useful for hotfixing production without merging an entire feature branch. Resolve conflicts if the patch doesn't apply cleanly.

**Follow-up:** Cherry-pick vs merge? — Cherry-pick takes one commit; merge brings entire branch history.

---

### Q66. What is git tag?

**Short definition:** Named pointer to a specific commit, typically marking releases.

**Answer:** `git tag v1.2.0` creates a lightweight tag. Annotated tags include message and signer info. Tags mark release points for deployment. `git push --tags` publishes tags to remote. Infosys release pipelines often trigger on tag push.

**Follow-up:** Tag vs branch? — Tags are fixed points; branches move forward with new commits.

---

### Q67. Explain git remote and origin.

**Short definition:** Remotes are URLs of repositories your local repo syncs with.

**Answer:** `origin` is the default remote name for the cloned repository. `git remote -v` lists fetch/push URLs. Add upstream with `git remote add upstream <url>` when working from a fork. Push to specific remote/branch with `git push origin feature/x`.

**Follow-up:** git remote prune origin? — Removes stale remote-tracking branches deleted on the server.

---

### Q68. What is a merge conflict and how to resolve it?

**Short definition:** When Git can't auto-merge overlapping changes from two branches.

**Answer:** Git marks conflicts with `<<<<<<<`, `=======`, `>>>>>>>` in affected files. Manually choose the correct code, remove markers, stage resolved files, and complete merge/rebase. Communicate with the other developer if logic conflicts. Prevention: pull frequently and keep branches short-lived.

**Follow-up:** git merge --abort? — Cancels in-progress merge returning to pre-merge state.

---

### Q69. git bisect for finding bugs.

**Short definition:** Binary search through commit history to find the commit that introduced a bug.

**Answer:** `git bisect start`, mark current as bad, mark known good commit, Git checks out middle commits for you to test. Repeat until the first bad commit is found. Invaluable for regressions where you know it worked two weeks ago but fails now.

**Follow-up:** Can bisect be automated? — `git bisect run npm test` auto-skips based on test pass/fail.

---

### Q70. Conventional commits and good commit messages.

**Short definition:** Standardized prefix format making history searchable and enabling automated changelogs.

**Answer:** Use prefixes like `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`. Write imperative mood: "Add login form" not "Added login form". First line under 72 chars; body explains why if needed. Good commits make code review and rollback easier for the whole Infosys team.

**Follow-up:** fix! vs fix? — `!` indicates breaking change in conventional commits spec.

---

### Q71. Does Webpack bundle CSS and images? [infosys]

**Short definition:** Yes — Webpack treats all assets as modules via loaders.

**Answer:** CSS uses `css-loader` + `style-loader` or MiniCssExtractPlugin for production. Images and fonts use asset modules or file-loader. Customize via `module.rules` in webpack config. Create React App and Vite abstract this, but Infosys may ask about the underlying bundler behavior.

**Follow-up:** Tree shaking? — Dead code elimination during build; requires ES modules and side-effect-free imports.

---

### Q72. Browser DevTools for debugging. [infosys]

**Short definition:** Built-in browser tools for DOM, network, performance, and memory analysis.

**Answer:** Elements tab for DOM/CSS inspection. Console for logs and errors. Network tab for API timing and payloads. Sources for breakpoints. Performance for flame charts. Memory for heap snapshots detecting leaks. Install React DevTools and Redux DevTools extensions for component and state inspection.

**Follow-up:** How to debug high memory usage in production? [infosys] — Heap snapshots, check detached DOM nodes, uncleared intervals, useEffect cleanup missing.

---

## Behavioral Scenarios

### Q73. UAT phase — client requests last-minute change. [must-know] [infosys]

**Short definition:** STAR scenario for handling urgent client changes without breaking signed-off features.

**Answer:** **Situation:** Project in UAT, client wants urgent change before sign-off. **Task:** Deliver without breaking approved features or missing deadline. **Action:** Clarify exact requirement and impact with client/BA. Assess if config change suffices vs code change. If code: hotfix branch, minimal diff, targeted tests. Communicate timeline and trade-offs to PM. Deploy to UAT and get re-approval on affected flows only. **Result:** Change delivered with documented approval; no regression in signed-off features.

**Follow-up:** What if the change affects architecture? — Escalate to tech lead, propose phased delivery or scope negotiation.

---

### Q74. Reuse payment logic from React web in mobile app. [infosys]

**Short definition:** Architecture question about sharing business logic across platforms securely.

**Answer:** Extract payment logic into a shared backend API or shared TypeScript npm package in a monorepo. Web and mobile become thin clients calling the same payment service. Never duplicate payment logic in UI layers — PCI compliance and security require server-side handling. Frontend validates UX; backend enforces authorization and transaction integrity.

**Follow-up:** Monorepo tools? — Nx, Turborepo for shared packages with independent versioning.

---

### Q75. How would you migrate an Angular app to React? [infosys]

**Short definition:** Incremental Strangler Fig migration strategy for large enterprise apps.

**Answer:** Audit Angular modules and identify independent features. Set up React in the same repo or micro-frontend shell. Migrate leaf features first with lowest dependencies. Share the API layer; rewrite UI component by component. Use module federation or iframe for coexistence during transition. Run both in parallel with feature flags; deprecate Angular modules when React versions are stable.

**Follow-up:** Big-bang vs incremental? — Always incremental for enterprise; big-bang risks months of no delivery.

---

### Q76. Conflict with team member on technical approach.

**Short definition:** STAR behavioral question testing collaboration and professionalism.

**Answer:** Describe a specific disagreement — e.g., Redux vs Context for a feature. Explain how you listened to their perspective, proposed a proof-of-concept or data-driven comparison (bundle size, re-render count), referenced team coding standards, and aligned on a decision. Emphasize that the goal was the best solution for the project, not winning the argument. Delivered successfully together.

**Follow-up:** What if you were wrong? — Acknowledge it openly, learn from it, update the team on the better approach.

---

### Q77. Tight deadline — how do you prioritize?

**Short definition:** STAR scenario demonstrating scope management under pressure.

**Answer:** Break work into MVP vs nice-to-have with the product owner. Focus on core user flows that deliver business value. Defer non-critical polish, animations, and edge cases to a follow-up sprint. Communicate daily status and risks proactively. If scope can't shrink, flag resource or timeline concerns early rather than silently cutting quality.

**Follow-up:** How do you handle technical debt from rushed delivery? — Document debt items, schedule cleanup in next sprint, add tests around fragile areas.

---

### Q78. Production bug on Friday evening.

**Short definition:** STAR scenario for incident response and professionalism.

**Answer:** Assess severity — P0 (down) vs P1 (degraded). If rollback is possible and safe, rollback first to restore service. Reproduce the bug, identify root cause (not just symptoms), implement minimal fix with test coverage. Deploy through normal pipeline even under pressure. Write a brief post-mortem documenting cause, fix, and prevention steps. Offer to monitor over the weekend for P0 issues.

**Follow-up:** Hotfix branch workflow? — Branch from production tag, fix, test, merge to main and production, tag release.

---

### Q79. Mentoring a junior developer.

**Short definition:** STAR scenario showing leadership and knowledge sharing.

**Answer:** Assign incremental tasks starting from small bug fixes to feature ownership. Do pair programming on complex problems, explaining why not just what. Code reviews with constructive feedback and learning resources. Encourage questions and create psychological safety. Track their growth and advocate for stretch assignments when ready.

**Follow-up:** Junior keeps making same mistake? — Address pattern directly, share checklist or lint rule, pair on next occurrence.

---

### Q80. Why Infosys? Why this role?

**Short definition:** Motivation question connecting your background to Infosys Pune React opportunity.

**Answer:** Infosys offers enterprise-scale React delivery with global clients and structured career growth — exactly the environment where fundamentals and clean code matter. The Pune ReactJS Developer role aligns with my three years of React and TypeScript work, my Frontend Lead scope at DTSkill, and projects like Asset360Hub and TRIEC that mirror large modernization work. I'm already based in Pune, I've been shortlisted after screening, and I'm looking for a company known for training, delivery excellence, and long-term frontend career paths — Infosys fits that well.

**Follow-up:** HR round expectations? — Current CTC, expected CTC, notice period, reason for leaving, relocation, work mode, joining date.

---

### Q81. Walk me through the TRIEC project. [infosys]

**Short definition:** React SPA deep-dive — strong Infosys-style enterprise frontend story.

**Answer:** TRIEC is a mentor and mentee registration intake portal for The Mentoring Partnership in Canada, delivered via DTSkill. I was the primary frontend developer on the repo. It's a client-side React 18 SPA with Vite, Redux Toolkit, React Router, and axios — no TypeScript on this one. Users go through OTP email verification, optional resume upload with backend-driven auto-fill, and parallel five-step application forms for mentors and mentees. I built nested route guards with JWT in sessionStorage, axios interceptors with jwt-decode expiry checks, and a session expiry notifier for long form sessions. We migrated from Create React App to Vite 6 with route-level code splitting, and deployed via Docker, Jenkins, and Helm on AWS EKS. It's a good example of complex form UX, auth, and production delivery on a pure React stack.

**Follow-up:** Why Redux here and not React Query? — Mostly form wizard and application state across steps; server data fetched per step with axios and Redux for shared UI state.

---

### Q82. Explain your career path. [infosys]

**Short definition:** Mechanical engineering background to frontend developer — honest, brief story.

**Answer:** I completed B.Tech in Mechanical Engineering from DBATU in 2022. While finishing my degree I joined Newton School's full-time web development program for about eighteen months — that's where I built my JavaScript, React, and Node foundations; it's training, not employment. I joined Learnasyougo as ReactJS Developer in September 2023, continued with the same team when the entity moved to DTSkill in July 2024, and within about two years took on Frontend Lead responsibilities while my official title stayed ReactJS Developer. So it's roughly three years of professional frontend work plus structured training before that — Mechanical to frontend via deliberate upskilling, not a CS degree.

**Follow-up:** Why leave mechanical for frontend? — I enjoyed building interactive products more than purely mechanical design work, and the web offered faster feedback loops and clearer career growth in software.

---

**Total Questions: 82**
