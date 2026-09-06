# Bajaj Finserv Direct — Next.js Developer Interview Prep

## Profile

**Name:** Sawata Gore  
**Location:** Pune, Maharashtra  
**Experience:** ~3 years professional (Sep 2023 – Present)  
**Designation:** ReactJS Developer — Frontend Lead responsibilities (official payslip title: ReactJS Developer)  
**Employers:** Learnasyougo (Sep 2023 – Jul 2024) → DTSkill Services (Jul 2024 – Present) — same promoters, continuous career  
**Leadership:** Lead 6–8 frontend developers across concurrent projects; architecture, sprint planning, code reviews  
**Recognition:** Employee of the Month ×2 at DTSkill  

**Target Role:** Bajaj Finserv Direct — Next.js Developer (3–6 YOE band)  
**Focus:** Next.js 16 App Router, SSR/SSG/ISR, auth, RBAC, React Query, performance, Git/CI/CD  
**Stack:** Next.js 16, React 19, TypeScript, TanStack Query, Axios, Tailwind CSS v4, shadcn/ui, REST APIs  

**Key Projects:**

- **Asset360Hub** — Next.js 16 enterprise IT asset management; primary frontend owner; 16+ RBAC modules  
- **TimeLens** — TechM workforce platform; WebSockets; 6 role dashboards; primary contributor  
- **GenE** — In-house AI platform; SSE streaming; custom agent UI integration  

**Interview Style:** Technical depth on Next.js + React, practical scenarios, MCQs, coding, project deep-dives

---

## Self Introduction

### Q1. Tell me about yourself. [must-know] [bajaj]

**Short definition:** A concise professional intro tailored to the Bajaj Next.js Developer role.

**Answer:** Hi, I'm Sawata Gore, a ReactJS Developer with around three years of experience, based in Pune. My official title is ReactJS Developer at DTSkill Services, but I handle Frontend Lead responsibilities — architecture, sprint planning, and code reviews across multiple projects where I lead about six to eight frontend developers in total. Most of my recent work is Next.js production apps: Asset360Hub, where I'm the primary frontend owner on a Next.js 16 enterprise asset platform with RBAC, React Query, and SSO auth, and TimeLens, a workforce time-tracking platform with real-time WebSocket dashboards and six role-based views. I also integrated SSE streaming UIs on our in-house AI platform GenE. I'm comfortable with App Router, Server and Client Components, JWT refresh flows, RBAC, and performance work — I reduced initial bundle size by about thirty-five percent on one project using profiling and code splitting. I'm looking at Bajaj Finserv Direct because I want to apply this Next.js experience to challenging financial products at scale.

**Follow-up:** Walk me through your strongest Next.js project. — **Asset360Hub**: App Router route groups, React Query data layer, Axios refresh queue, custom DataTable with server pagination, Google/Microsoft SSO, 16+ RBAC-gated modules.

---

## JavaScript Fundamentals

### Q2. What is the difference between var, let, and const? [bajaj]

**Short definition:** Three declaration keywords with different scoping and reassignment rules.

**Answer:** `var` is function-scoped, can be redeclared and reassigned, and is hoisted with undefined. `let` and `const` are block-scoped. `let` can be reassigned but not redeclared in the same scope. `const` cannot be reassigned though object properties can mutate. In modern JavaScript I prefer `const` by default and use `let` only when the value must change.

**Follow-up:** Why avoid var? — Function scope and hoisting cause subtle bugs in loops and conditionals.

---

### Q3. What is hoisting? [bajaj]

**Short definition:** JavaScript processes declarations before executing code in a scope.

**Answer:** Function declarations can be called before their definition line. `var` declarations are hoisted and initialized as undefined. `let` and `const` are hoisted but remain in the Temporal Dead Zone until their declaration line is reached — accessing them before that throws ReferenceError. Understanding hoisting prevents common interview output questions.

**Follow-up:** Are arrow functions hoisted? — No, they're const assignments and behave like let/const TDZ.

---

### Q4. What is a closure? [bajaj]

**Short definition:** A function that remembers variables from its outer lexical scope after the outer function returns.

**Answer:** Closures happen when an inner function references variables from an enclosing function. They enable private state, factory functions, and patterns like debounce and module patterns. Closures are fundamental to understanding React hooks and stale closure bugs in useEffect.

```javascript
function counter() {
  let count = 0;
  return () => ++count;
}
const increment = counter();
increment(); // 1
increment(); // 2
```

**Follow-up:** Closure memory leak example? — Holding closures in global arrays keeps outer variables alive unnecessarily.

---

### Q5. What is the JavaScript event loop? [bajaj]

**Short definition:** Single-threaded JS manages sync code on the call stack and async callbacks via queues.

**Answer:** Synchronous code runs on the call stack. Async operations (timers, fetch) are handled by the browser/runtime and their callbacks enter task queues. The event loop pushes queued work to the stack when it's free. Promise callbacks use the microtask queue, processed before macrotasks like setTimeout.

**Follow-up:** Predict output: log A, setTimeout B, Promise C, log D? — A, D, C, B.

---

### Q6. Promise vs async/await? [bajaj]

**Short definition:** Promises represent async results; async/await is syntactic sugar for cleaner Promise chains.

**Answer:** A Promise has pending, fulfilled, and rejected states, chained with then/catch/finally. Async/await lets you write asynchronous code that reads synchronously with try/catch for errors. I use async/await in API service layers and Server Components for readability, falling back to Promise.all for parallel requests.

**Follow-up:** Can async function return non-Promise? — Yes, it's automatically wrapped in a resolved Promise.

---

### Q7. Promise.all vs Promise.allSettled? [bajaj]

**Short definition:** Parallel execution with fail-fast vs wait-for-all behavior.

**Answer:** `Promise.all` resolves when all succeed and rejects immediately on first failure — use when all results are required. `Promise.allSettled` waits for every promise and returns status of each — use when partial success is acceptable, like loading independent dashboard widgets.

**Follow-up:** Promise.race? — Resolves/rejects with the first settled promise.

---

### Q8. map vs filter vs reduce vs forEach? [bajaj]

**Short definition:** Four core array methods with different return values and purposes.

**Answer:** `map` transforms each element and returns a new array. `filter` returns elements matching a condition. `reduce` accumulates to a single value — sum, object grouping, flattening. `forEach` executes side effects with no return value. Choose based on whether you need a transformed output or just iteration.

**Follow-up:** Can reduce replace map and filter? — Yes, but dedicated methods are clearer.

---

### Q9. Shallow copy vs deep copy? [bajaj]

**Short definition:** Top-level duplication vs full nested cloning.

**Answer:** Spread syntax and Object.assign create shallow copies — nested objects share references. Deep copy creates independent nested data via structuredClone or JSON parse/stringify for plain JSON-safe objects. In React state updates, shallow copy at each mutated level is usually sufficient and preferred.

**Follow-up:** structuredClone limitations? — Cannot clone functions, symbols, or DOM nodes.

---

### Q10. What is debouncing? [bajaj]

**Short definition:** Delay function execution until the user stops triggering for a specified time.

**Answer:** Debouncing waits until activity pauses — ideal for search inputs where you wait 300–500ms after the last keystroke before calling the API. This reduces unnecessary network requests and server load. Implement with setTimeout cleared on each trigger, or use a useDebounce hook in React.

```javascript
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
```

**Follow-up:** Debounce vs throttle? — Debounce waits for pause; throttle limits execution rate during continuous events.

---

### Q11. What is throttling? [bajaj]

**Short definition:** Limit how often a function can execute during continuous events.

**Answer:** Throttle guarantees execution at most once per interval — useful for scroll, resize, and mousemove handlers. Unlike debounce, it fires periodically during activity rather than waiting for silence. Choose throttle when you need regular updates, debounce when you need final value only.

**Follow-up:** Throttle implementation approaches? — Flag-based lock or timestamp comparison.

---

### Q12. == vs ===? [bajaj]

**Short definition:** Loose equality with coercion vs strict type-and-value equality.

**Answer:** `==` coerces types before comparing, leading to surprising results. `===` checks both type and value without coercion. I always use strict equality because it's predictable and aligns with TypeScript's type-safe comparisons. Exceptions like `null == undefined` are not worth the mental overhead.

**Follow-up:** Object.is vs ===? — Object.is distinguishes +0/-0 and NaN equality.

---

### Q13. Predict the output — event loop order. [bajaj]

**Short definition:** Classic microtask vs macrotask ordering interview question.

**Answer:** Synchronous code runs first printing A and D. Promise `.then` callbacks are microtasks running before macrotasks, so C prints before B. Understanding this order is essential for debugging async React effects and API timing issues.

```javascript
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
// A, D, C, B
```

**Follow-up:** Where does async/await fit? — await continuation is a microtask.

---

### Q14. Reverse a string — coding. [bajaj]

**Short definition:** Basic string manipulation with O(n) time complexity.

**Answer:** Split the string into characters, reverse the array, and join back together. Time complexity is O(n) because we traverse the string once. For Unicode-aware reversal, use `[...str].reverse().join('')` or Intl.Segmenter for grapheme clusters.

```javascript
function reverseString(str) {
  return str.split("").reverse().join("");
}
```

**Follow-up:** Space complexity? — O(n) for the array copy.

---

### Q15. Remove duplicates from an array. [bajaj]

**Short definition:** Use Set for O(n) average deduplication.

**Answer:** Convert the array to a Set which stores unique values, then spread back to an array. Average time complexity is O(n). For objects, dedupe by a specific key using Map or reduce pattern.

```javascript
function removeDuplicates(arr) {
  return [...new Set(arr)];
}
```

**Follow-up:** Preserve order? — Set insertion order is preserved in modern JS.

---

### Q16. Group users by role. [bajaj]

**Short definition:** reduce pattern for grouping array items by a property.

**Answer:** Use reduce to build an object where keys are role names and values are arrays of users. Initialize with empty object, check if key exists, push user to the array. This pattern appears frequently in data transformation for dashboards and reports.

```javascript
function groupByRole(users) {
  return users.reduce((acc, user) => {
    if (!acc[user.role]) acc[user.role] = [];
    acc[user.role].push(user);
    return acc;
  }, {});
}
```

**Follow-up:** Time complexity? — O(n) single pass through users.

---

## React Deep Dive

### Q17. What is React? [bajaj]

**Short definition:** A JavaScript library for building user interfaces with reusable components.

**Answer:** React uses a declarative model — you describe what the UI should look like for a given state and React handles DOM updates efficiently via the Virtual DOM. Components are reusable, composable building blocks. The one-way data flow makes applications predictable and debuggable.

**Follow-up:** Library vs framework? — React is a library; Next.js is the framework built on React.

---

### Q18. What is the Virtual DOM? [bajaj]

**Short definition:** In-memory representation of UI used for efficient diffing and updates.

**Answer:** When state or props change, React builds a new Virtual DOM tree, compares it with the previous one through reconciliation, and applies minimal changes to the real DOM. This batching of updates is faster than manipulating the DOM directly for every change.

**Follow-up:** Does re-render always mean DOM update? — No; React may bail out if Virtual DOM diff shows no changes.

---

### Q19. What causes a React component to re-render? [bajaj]

**Short definition:** State changes, parent re-renders, prop changes, or context updates.

**Answer:** A component re-renders when its own state changes via setState/useState, when its parent re-renders (unless memoized), when props change, or when consumed context value changes. Re-render is the render phase — the commit phase may skip DOM updates if nothing changed.

**Follow-up:** How to find unnecessary re-renders? — React DevTools Profiler highlights render counts and durations.

---

### Q20. Props vs State? [bajaj]

**Short definition:** Read-only parent inputs vs mutable component-owned data.

**Answer:** Props are passed from parent to child and should be treated as immutable by the child. State is managed within the component or via state management and triggers UI updates when changed. Server state (API data) is often managed separately via React Query rather than local useState.

**Follow-up:** Can props be objects mutated by child? — Technically yes but violates one-way data flow; always treat as read-only.

---

### Q21. Explain useEffect. [bajaj]

**Short definition:** Hook for synchronizing components with external systems after render.

**Answer:** useEffect runs after paint and handles API calls, subscriptions, timers, and browser API integration. The dependency array controls when it re-runs: none = every render, empty = mount only, deps = when deps change. Always return cleanup for subscriptions, intervals, and abort controllers to prevent memory leaks.

```javascript
useEffect(() => {
  const id = setInterval(fetchData, 5000);
  return () => clearInterval(id);
}, []);
```

**Follow-up:** useEffect vs useLayoutEffect? — useLayoutEffect runs synchronously after DOM mutations, before paint.

---

### Q22. useEffect dependency array behavior? [bajaj]

**Short definition:** Controls when effects re-run — every render, mount only, or on dep changes.

**Answer:** No array means effect runs after every render. Empty array `[]` runs once after initial mount (Strict Mode double-invokes in dev). With dependencies, effect runs when any dep changes by reference or value. Unstable object/function deps cause infinite loops — stabilize with useMemo/useCallback or move inside effect.

**Follow-up:** ESLint exhaustive-deps rule? — Warns about missing dependencies; fix deps, don't disable blindly.

---

### Q23. useMemo vs useCallback? [bajaj]

**Short definition:** useMemo memoizes a value; useCallback memoizes a function reference.

**Answer:** useMemo caches expensive computation results until deps change. useCallback caches function identity so memoized children don't re-render from new function references. Memory trick: useMemo → value, useCallback → function. Profile before applying — not every component needs memoization.

**Follow-up:** Empty deps on useCallback? — Function created once on mount; captures initial closure values.

---

### Q24. What is React.memo? [bajaj]

**Short definition:** Higher-order component that skips re-render if props are shallowly equal.

**Answer:** React.memo wraps a component and compares prev/next props with shallow equality. If unchanged, React skips re-rendering that component. Useful for expensive pure components receiving stable props. Pair with useCallback for function props. Don't wrap everything — measure first.

**Follow-up:** Custom comparison function? — React.memo(Component, (prev, next) => boolean) for deep prop comparison.

---

### Q25. Context API and when to avoid it? [bajaj]

**Short definition:** Share data down the tree without prop drilling.

**Answer:** Context passes values to consumers without intermediate components passing props. Good for theme, locale, and auth user object with infrequent updates. Avoid putting frequently changing large state in one context — all consumers re-render on any change. Split contexts or use state management for high-frequency updates.

**Follow-up:** Context vs Redux? — Context for simple DI-like sharing; Redux for complex global state with middleware.

---

### Q26. What is prop drilling? [bajaj]

**Short definition:** Passing data through intermediate components that don't need it.

**Answer:** Prop drilling makes maintenance harder as components become coupled to data they don't use. Solutions include Context API, component composition, custom hooks, and Redux/Zustand for global state. In Next.js apps, server-fetched data can often be passed directly to the component that needs it, reducing drilling.

**Follow-up:** Composition pattern? — Pass `<Sidebar user={user} />` as prop/children to Layout.

---

### Q27. What are keys in React? [bajaj]

**Short definition:** Stable unique identifiers for list reconciliation.

**Answer:** Keys help React identify which items changed, were added, or removed. Use real IDs from data, not array index when list order can change. Wrong keys cause state bugs in inputs and broken animations. Keys must be unique among siblings.

**Follow-up:** Index as key when acceptable? — Static lists that never reorder or filter.

---

### Q28. Custom hooks — useDebounce example. [bajaj]

**Short definition:** Reusable functions starting with `use` that encapsulate hook logic.

**Answer:** Custom hooks extract shared behavior like debouncing, auth checks, or data fetching. useDebounce delays updating a value until the input stops changing for the configured delay. Cleanup clears the previous timer on each value change.

```javascript
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}
```

**Follow-up:** Rules of Hooks? — Only call at top level in React functions; not in loops or conditions.

---

### Q29. Redux Toolkit vs React Query? [bajaj]

**Short definition:** Client global state vs server state management — complementary tools.

**Answer:** Redux Toolkit manages client-side global state — UI preferences, selected filters, wizard steps. React Query manages server state — caching, fetching, refetching, invalidation, loading/error states. In my projects I use React Query for API data and Redux Toolkit only where global client state is genuinely needed.

**Follow-up:** Can React Query replace Redux entirely? — Often for data-heavy apps; Redux still needed for complex client UI state.

---

### Q30. Build a debounced search component. [bajaj]

**Short definition:** Practical React coding task combining input state, debounce, and API call.

**Answer:** Keep input value in local state. Debounce the value with useDebounce hook or debounce function. Trigger API call when debounced value changes via useEffect. Handle loading, error, and empty states. Cancel stale requests with AbortController if the user types quickly. In production, add React Query for caching search results.

**Follow-up:** Why not call API on every keystroke? — Excessive network load, race conditions, poor UX on slow connections.

---

### Q31. Build a Todo application — what to demonstrate. [bajaj]

**Short definition:** Classic React coding exercise testing CRUD, keys, and controlled inputs.

**Answer:** Demonstrate add, delete, toggle complete, and filter (all/active/completed). Use controlled input with useState. Update state immutably. Use stable keys from todo IDs, not index. Show functional state updates and conditional rendering. Mention you'd add persistence via localStorage or API in a real app.

**Follow-up:** Optimistic updates? — Update UI immediately, rollback on API failure.

---

### Q32. What is React Query query invalidation? [bajaj]

**Short definition:** Mark cached queries stale to trigger refetch after mutations.

**Answer:** After creating or updating data, call `queryClient.invalidateQueries({ queryKey: ['assets'] })` to mark cached data stale. React Query refetches according to its staleTime and refetchOnWindowFocus config. This keeps UI synchronized with server without manual cache management.

**Follow-up:** invalidateQueries vs setQueryData? — Invalidate triggers refetch; setQueryData updates cache directly without network call.

---

### Q33. What is a React Query mutation? [bajaj]

**Short definition:** Hook for server-side create/update/delete operations.

**Answer:** useMutation handles POST/PUT/DELETE with loading, error, and success states. On success, invalidate related queries or optimistically update cache. Example: after creating an asset, invalidate the assets list query so the table refreshes automatically.

**Follow-up:** onMutate for optimistic updates? — Update cache before request; rollback in onError.

---

### Q34. How to debug unexpected multiple re-renders? [bajaj]

**Short definition:** Systematic approach using Profiler and dependency analysis.

**Answer:** Reproduce the issue and use React DevTools Profiler to identify which component renders and why. Check state updates in parent, context changes, unstable object/function props recreated each render, and useEffect dependency loops. Fix the root cause rather than blindly adding React.memo everywhere.

**Follow-up:** Strict Mode double render? — Dev-only intentional double invoke to surface side effect bugs.

---

## Next.js Deep Dive

### Q35. What is Next.js? [bajaj]

**Short definition:** React framework with routing, rendering strategies, and production features built-in.

**Answer:** Next.js provides file-based routing, Server Components, SSR, SSG, ISR, image optimization, metadata APIs, API routes, and middleware. It structures production-ready React applications with conventions that reduce boilerplate. My recent work uses App Router with Server and Client Component separation.

**Follow-up:** Next.js vs Create React App? — Next.js is full-stack framework; CRA is client-only SPA starter (now deprecated).

---

### Q36. App Router vs Pages Router? [bajaj]

**Short definition:** New `app/` directory routing vs legacy `pages/` directory system.

**Answer:** Pages Router uses `pages/` with getServerSideProps and getStaticProps. App Router uses `app/` with React Server Components, nested layouts, loading.tsx, error.tsx, and colocated route handlers. App Router is the current standard — my projects use it exclusively for layouts, server data fetching, and reduced client JavaScript.

**Follow-up:** Can both coexist? — Yes during migration, but avoid duplicate routes for same URL.

---

### Q37. What is a Server Component? [bajaj]

**Short definition:** Component rendered on the server with reduced client JavaScript.

**Answer:** Server Components render on the server and don't send their component JavaScript to the browser like Client Components. They can fetch data directly, access server resources, and keep secrets off the client. They cannot use useState, useEffect, or browser APIs. Default in App Router unless marked `"use client"`.

**Follow-up:** Server Component keywords? — Server, data fetching, less client JS, no browser APIs, no interactive hooks.

---

### Q38. What is a Client Component? [bajaj]

**Short definition:** Component marked with `"use client"` that runs in the browser.

**Answer:** Client Components handle interactivity — state, events, effects, browser APIs. They're included in the client JavaScript bundle. Mark with `"use client"` at the top of the file. Keep Client Components as leaf nodes — push server rendering as high as possible in the tree.

**Follow-up:** Can Server Component import Client Component? — Yes; Client Component becomes a client boundary.

---

### Q39. Why shouldn't everything be a Client Component? [bajaj]

**Short definition:** Client Components increase JavaScript bundle and lose server rendering benefits.

**Answer:** Making everything client-side sends unnecessary JavaScript to the browser, hurting performance metrics like LCP and TTI. Server Components reduce bundle size by keeping static and data-fetching logic on the server. Default to Server Components and add `"use client"` only where interactivity is required.

**Follow-up:** How to decide? — Needs useState/onClick/useEffect/browser API? → Client. Otherwise → Server.

---

### Q40. Can a Client Component use server-only code? [bajaj]

**Short definition:** No — server logic must stay on the server side of the boundary.

**Answer:** Client Components cannot import server-only modules or use server APIs directly. Pass fetched data as props from Server Components, or call Route Handlers / Server Actions from the client via fetch. This boundary protects secrets and reduces client bundle size.

**Follow-up:** What is server-only package? — npm package that throws if imported in client bundle.

---

### Q41. What is a layout in App Router? [bajaj]

**Short definition:** Shared UI wrapper that persists across navigation within a route segment.

**Answer:** layout.tsx wraps child pages and preserves state across route changes — sidebars, nav bars, and providers stay mounted. Layouts can nest — root layout for html/body, dashboard layout for sidebar. Unlike pages, layouts don't remount on navigation within their segment.

**Follow-up:** layout vs template? — template.tsx remounts on navigation, resetting state; layout persists.

---

### Q42. What are route groups? [bajaj]

**Short definition:** Parenthesized folders organizing routes without affecting the URL.

**Answer:** Folders like `(admin)` and `(marketing)` group routes for shared layouts without adding to the URL path. Useful for separate layout boundaries — admin with sidebar vs marketing with header — while keeping clean URLs like `/dashboard` not `/admin/dashboard`.

**Follow-up:** Example structure? — `app/(admin)/dashboard/page.tsx` → URL is `/dashboard`.

---

### Q43. loading.tsx and error.tsx? [bajaj]

**Short definition:** File conventions for Suspense loading UI and error boundaries per route segment.

**Answer:** loading.tsx automatically wraps the segment in Suspense showing skeleton/spinner during data fetch. error.tsx is an error boundary catching errors in that segment with reset capability. They enable granular loading and error states without manual Suspense wiring in every page.

**Follow-up:** error.tsx must be Client Component? — Yes, error boundaries require client-side interactivity for reset.

---

### Q44. Explain SSR, SSG, ISR, and CSR. [bajaj]

**Short definition:** Four rendering strategies with different build/request timing tradeoffs.

**Answer:** SSR renders on each request — fresh, request-specific data. SSG generates at build time — fast, static. ISR combines static generation with periodic revalidation for fresh content without per-request rendering. CSR renders entirely in the browser — good for authenticated dashboards where SEO isn't critical.

```text
SSR = request time | SSG = build time | ISR = static + revalidation | CSR = browser
```

**Follow-up:** When ISR over SSR? — Content changes periodically but not every request; want CDN performance.

---

### Q45. When would you use SSR vs SSG vs ISR vs CSR? [bajaj]

**Short definition:** Choose rendering strategy based on data freshness, SEO, and interactivity needs.

**Answer:** SSR for personalized or real-time pages like user dashboard landing. SSG for marketing, docs, and rarely changing content. ISR for product catalogs or news updating every few minutes. CSR for highly interactive authenticated apps like internal admin panels. Bajaj fintech apps often mix SSR/ISR for public pages and CSR patterns for logged-in dashboards.

**Follow-up:** Next.js default for fetch in Server Components? — Cached (SSG-like); override with cache: 'no-store' for SSR.

---

### Q46. How do you fetch data in a Server Component? [bajaj]

**Short definition:** Direct async/await fetch on the server without client-side useEffect.

**Answer:** Server Components can be async functions that await fetch or database calls directly. Data never passes through a client-side loading waterfall for the initial render. Configure caching with fetch options: `{ cache: 'force-cache' }` for static, `{ cache: 'no-store' }` for dynamic, `{ next: { revalidate: 60 } }` for ISR.

**Follow-up:** Can you use axios in Server Components? — Yes on server; prefer fetch for built-in caching integration.

---

### Q47. How do you fetch data in a Client Component? [bajaj]

**Short definition:** useEffect/fetch or TanStack Query for client-side data management.

**Answer:** Client Components use fetch, axios, or TanStack Query for data needing interactivity, polling, or client cache. I prefer React Query for enterprise apps — it handles caching, loading, error states, refetching, and invalidation. Avoid raw useEffect + useState for complex server state.

**Follow-up:** Initial data from server? — Pass Server Component fetched data as props, hydrate React Query with initialData.

---

### Q48. What is Next.js Middleware? [bajaj]

**Short definition:** Code running before a request completes — for auth, redirects, and headers.

**Answer:** middleware.ts runs at the edge before routes render. Common uses: check auth token/cookie, redirect unauthenticated users to login, rewrite URLs, set security headers. Matcher config limits which paths middleware runs on. Essential for protecting routes in fintech applications.

```typescript
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  if (!token) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}
export const config = { matcher: ["/dashboard/:path*"] };
```

**Follow-up:** Middleware vs Server Component auth check? — Middleware blocks request early; Server Component can render conditional UI.

---

### Q49. Authentication vs Authorization? [bajaj]

**Short definition:** Identity verification vs permission checking.

**Answer:** Authentication answers "Who are you?" — login with credentials, receive tokens. Authorization answers "What can you do?" — role and permission checks for features and routes. Both are critical in Bajaj fintech apps. Frontend handles UX gating; backend must always enforce authorization as the security boundary.

**Follow-up:** Where to store tokens? — httpOnly cookies (preferred) or memory; avoid localStorage for XSS-sensitive apps.

---

### Q50. Access token and refresh token flow. [bajaj]

**Short definition:** Short-lived access token for API calls; refresh token to obtain new access tokens.

**Answer:** User logs in and receives both tokens. Frontend attaches access token to API requests. When API returns 401, Axios interceptor calls refresh endpoint, gets new access token, retries original request. If refresh fails, clear session and redirect to login. This avoids forcing re-login on every short access token expiry.

**Follow-up:** Race condition on multiple 401s? — Queue pending requests during single refresh call.

---

### Q51. What is RBAC? [bajaj]

**Short definition:** Role-Based Access Control — permissions tied to user roles.

**Answer:** Users are assigned roles like admin, manager, or employee. Permissions map to roles controlling navigation, routes, and feature access. I implement RBAC by reading roles from auth context, filtering nav items, protecting routes with guards, and hiding unauthorized actions. Backend must enforce permissions — frontend checks are UX only.

**Follow-up:** RBAC vs ABAC? — RBAC is role-based; ABAC evaluates attributes/policies per request.

---

### Q52. Axios interceptors — how and why? [bajaj]

**Short definition:** Hooks into request/response pipeline for cross-cutting concerns.

**Answer:** Request interceptors attach auth tokens, correlation IDs, and content-type headers globally. Response interceptors handle 401 refresh flow, global error toasts, and logging. Centralizing this in one API service layer keeps components clean and ensures consistent auth behavior across the app.

**Follow-up:** Where to configure base URL? — axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL }).

---

### Q53. Why use an API service layer? [bajaj]

**Short definition:** Separate HTTP communication from UI components for maintainability.

**Answer:** Instead of axios calls scattered in components, API functions live in a dedicated layer with typed request/response models. Components call `getAssets()` not raw fetch URLs. Benefits: reuse, easier testing, consistent error handling, and single place to update when API contracts change.

**Follow-up:** Three-layer architecture? — React Query (server state) → API functions → Axios (HTTP).

---

### Q54. Next.js Metadata API and SEO. [bajaj]

**Short definition:** Built-in API for page titles, descriptions, and Open Graph tags.

**Answer:** Export metadata object or generateMetadata function from page/layout files. Supports static and dynamic metadata based on route params. Combined with SSR/SSG, Next.js delivers crawlable HTML with proper meta tags. Critical for any public-facing Bajaj product pages.

```typescript
export const metadata = {
  title: "Dashboard | Asset360Hub",
  description: "Enterprise asset management platform",
};
```

**Follow-up:** Dynamic metadata example? — generateMetadata({ params }) fetches product name for title.

---

## TypeScript MCQs

### Q55. Which hook memoizes a calculated value? [bajaj]

**Short definition:** MCQ — identify the correct memoization hook for values.

**Answer:** The correct answer is **B — useMemo**. useMemo caches the result of an expensive computation and recalculates only when dependencies change. useCallback memoizes function references, not computed values. useEffect runs side effects; useRef stores mutable values without re-render.

```
A. useCallback  B. useMemo  C. useEffect  D. useRef
Answer: B — useMemo
```

**Follow-up:** When NOT to use useMemo? — Cheap calculations where memoization overhead exceeds benefit.

---

### Q56. Which hook memoizes a function reference? [bajaj]

**Short definition:** MCQ — distinguish function memoization from value memoization.

**Answer:** The correct answer is **C — useCallback**. It returns a memoized callback that only changes when dependencies change. Essential when passing callbacks to React.memo wrapped children to prevent unnecessary re-renders.

```
A. useMemo  B. useEffect  C. useCallback  D. useState
Answer: C — useCallback
```

**Follow-up:** useCallback(fn, [])? — Stable function reference forever; watch stale closure.

---

### Q57. Which library is primarily for server state? [bajaj]

**Short definition:** MCQ — identify server vs client state management tool.

**Answer:** The correct answer is **A — React Query (TanStack Query)**. It manages API data caching, fetching, and synchronization. React Router handles routing. CSS Modules handle styling. React Hook Form handles forms.

```
A. React Query  B. React Router  C. CSS Modules  D. React Hook Form
Answer: A — React Query
```

**Follow-up:** Server state vs client state? — Server state is async, shared, can be stale; client state is sync UI state.

---

### Q58. Which strategy generates static content at build time? [bajaj]

**Short definition:** MCQ — match rendering acronym to behavior.

**Answer:** The correct answer is **B — SSG (Static Site Generation)**. Content is generated at build time and served from CDN. CSR renders in browser. SSR renders per request. WebSocket is a communication protocol.

```
A. CSR  B. SSG  C. SSR  D. WebSocket
Answer: B — SSG
```

**Follow-up:** Next.js generateStaticParams? — Pre-generates dynamic route pages at build time.

---

### Q59. Which strategy supports revalidation of static content? [bajaj]

**Short definition:** MCQ — identify incremental static regeneration.

**Answer:** The correct answer is **C — ISR (Incremental Static Regeneration)**. Static pages regenerate in background after revalidation interval. Combines CDN performance with periodic freshness without full rebuilds.

```
A. CSR  B. SSR  C. ISR  D. SPA
Answer: C — ISR
```

**Follow-up:** revalidate: 60 meaning? — Regenerate page at most once every 60 seconds on next request.

---

### Q60. What does "use client" indicate? [bajaj]

**Short definition:** MCQ — Client Component boundary directive.

**Answer:** The correct answer is **B — The module is a Client Component boundary**. Everything in that file and its imports (unless marked server-only) ships to the client bundle. It does not mean static generation, AWS, or Redux requirement.

```
A. Static generation required  B. Client Component boundary  C. Runs on AWS  D. Uses Redux
Answer: B
```

**Follow-up:** Can you add "use client" mid-file? — No; must be first line of the file (before imports).

---

### Q61. Which is required for browser-side interactivity? [bajaj]

**Short definition:** MCQ — Server vs Client Component capability.

**Answer:** The correct answer is **B — Client Component**. Server Components cannot handle onClick, useState, or useEffect. Static HTML alone isn't interactive. API routes are server-side endpoints, not UI interactivity.

```
A. Server Component  B. Client Component  C. Static HTML  D. API route
Answer: B
```

**Follow-up:** Minimal client boundary pattern? — Small "use client" button inside Server Component page.

---

### Q62. Which HTTP status indicates authentication failure? [bajaj]

**Short definition:** MCQ — identify auth-related status codes.

**Answer:** The correct answer is **C — 401 Unauthorized**. Means missing or invalid credentials. 403 Forbidden means authenticated but not permitted. 200 is success. 301 is redirect.

```
A. 200  B. 201  C. 401  D. 301
Answer: C — 401
```

**Follow-up:** 401 vs 403? — 401: not authenticated; 403: authenticated but lacks permission.

---

### Q63. Common use of Axios interceptor? [bajaj]

**Short definition:** MCQ — cross-cutting HTTP request/response logic.

**Answer:** The correct answer is **B — Intercept requests/responses for common logic**. Attach tokens, handle 401 refresh, log errors globally. Interceptors don't compile TypeScript, render React, or generate static HTML.

```
A. Compile TypeScript  B. Intercept requests/responses  C. Render React  D. Generate HTML
Answer: B
```

**Follow-up:** Request vs response interceptor order? — Request runs before send; response runs after receive.

---

### Q64. CSS system for two-dimensional layouts? [bajaj]

**Short definition:** MCQ — Grid vs Flexbox dimensionality.

**Answer:** The correct answer is **B — Grid**. CSS Grid handles rows and columns simultaneously. Flexbox is one-dimensional (row OR column). Float and inline are legacy/inline layout methods.

```
A. Flexbox  B. Grid  C. Float  D. Inline
Answer: B — Grid
```

**Follow-up:** When Flexbox over Grid? — Nav bars, card rows, single-axis alignment.

---

### Q65. interface vs type in TypeScript? [bajaj]

**Short definition:** MCQ-style conceptual question on TypeScript type definitions.

**Answer:** Interfaces support declaration merging and extends keyword. Types support unions, intersections, and mapped types. Both work for React props. Prefer interface for public object shapes; type for unions like `"admin" | "user"` and utility compositions. Neither is runtime — both compile away.

**Follow-up:** Declaration merging example? — Two `interface User` blocks merge fields automatically.

---

### Q66. What is `unknown` vs `any`? [bajaj]

**Short definition:** Type-safe top type vs type-checking escape hatch.

**Answer:** `any` disables type checking entirely — avoid in production. `unknown` accepts any value but requires narrowing before use — type-safe alternative for external data. Always narrow unknown with typeof, instanceof, or type guards before accessing properties.

**Follow-up:** Type predicate? — `function isUser(x: unknown): x is User { ... }`

---

### Q67. What are Pick, Omit, Partial utility types? [bajaj]

**Short definition:** Built-in TypeScript helpers for deriving types from existing interfaces.

**Answer:** Pick selects specific keys. Omit excludes keys — hide password from API responses. Partial makes all properties optional — useful for update DTOs. These reduce duplication and keep types synchronized with a single source interface.

```typescript
type PublicUser = Omit<User, "password">;
type UserUpdate = Partial<Omit<User, "id">>;
```

**Follow-up:** Required<Partial<T>>? — Makes specific optional fields required again.

---

### Q68. How to type useState with union null? [bajaj]

**Short definition:** Explicit generic for nullable state common in data fetching.

**Answer:** Use `useState<User | null>(null)` when data may not exist initially. TypeScript enforces null checks before accessing properties. Combine with discriminated union states for loading/error/success patterns instead of multiple boolean flags.

```typescript
const [user, setUser] = useState<User | null>(null);
if (user) console.log(user.name);
```

**Follow-up:** Non-null assertion operator?! — Avoid; use proper narrowing instead.

---

### Q69. Discriminated unions for fetch states? [bajaj]

**Short definition:** Union types with common literal field enabling exhaustive switch narrowing.

**Answer:** Model async UI as `{ status: 'idle' } | { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: string }`. Switch on status field — TypeScript narrows available properties in each case. Prevents impossible states like loading AND error simultaneously.

**Follow-up:** Exhaustive check with never? — default case calls assertNever for compile-time completeness.

---

## System Design Scenarios

### Q70. Dashboard with five APIs loads slowly — what do you do? [bajaj]

**Short definition:** Performance investigation scenario for data-heavy dashboard.

**Answer:** First measure — don't guess. Check Network tab for API latency, payload sizes, and sequential vs parallel requests. Parallelize independent calls with Promise.all or parallel React Query queries. Cache stable data with appropriate staleTime. Reduce payloads with field selection. Check if client rendering or large bundles also contribute. Consider Server Components to fetch on server and stream HTML.

**Follow-up:** Backend aggregation endpoint? — Single `/dashboard-summary` reduces round trips if APIs are always needed together.

---

### Q71. Component renders multiple times unexpectedly — debug steps? [bajaj]

**Short definition:** Systematic re-render debugging for production issues.

**Answer:** Reproduce and use React Profiler to see render count and duration. Check parent state changes causing cascade, context updates, unstable inline objects/functions as props, and useEffect loops updating their own dependencies. Fix root cause — don't blanket React.memo without understanding why renders happen.

**Follow-up:** React Compiler (future)? — Automatic memoization reducing manual useMemo/useCallback need.

---

### Q72. API called repeatedly after adding useEffect — root cause? [bajaj]

**Short definition:** Common infinite loop bug in data fetching effects.

**Answer:** Check dependency array first. If an object, array, or function in deps is recreated every render, the effect re-runs infinitely. If the effect updates state that's in its deps, that's a loop. Fix by stabilizing deps with useMemo/useCallback, moving object creation inside effect, or using primitive deps.

**Follow-up:** Fetch on mount only? — Empty deps `[]` but ensure URL doesn't need to react to param changes.

---

### Q73. User sees menu item they lack permission for — fix approach? [bajaj]

**Short definition:** RBAC bug scenario covering frontend UX and backend security.

**Answer:** Check how permissions load and how navigation filters items — likely stale cache or missing role check on nav render. Fix frontend to filter by current user permissions. Critically verify backend enforces the same permission on the API endpoint. Hiding menu items is UX; backend authorization is the security boundary. Add test cases for each role's visible navigation.

**Follow-up:** Permission loaded async? — Show skeleton nav until auth resolves; don't flash unauthorized items.

---

### Q74. 10,000-row table is slow — optimization strategy? [bajaj]

**Short definition:** Large dataset rendering performance scenario.

**Answer:** Never render 10,000 DOM rows at once. Use server-side pagination, virtual scrolling (react-window, AG Grid virtualization), server-side filtering/sorting. Optimize cell renderers — avoid inline functions and heavy components per cell. Check unnecessary re-renders with React.memo on row components. For Bajaj financial data tables, server pagination is usually mandatory.

**Follow-up:** AG Grid vs custom virtual list? — AG Grid for enterprise features; react-window for lighter custom tables.

---

### Q75. Design authentication for a Next.js fintech app. [bajaj]

**Short definition:** System design for secure auth in Next.js App Router.

**Answer:** Use httpOnly secure cookies for tokens to prevent XSS access. Middleware checks auth cookie on protected routes, redirecting to login if missing. Server Components read session server-side for initial render. Client Components use Axios interceptor for 401 refresh flow. RBAC from JWT claims or session API. Backend validates every request — frontend guards are UX only. Implement logout clearing cookies and CSRF protection for cookie-based auth.

**Follow-up:** NextAuth.js vs custom? — NextAuth for standard OAuth/credentials; custom for specific Bajaj SSO integration.

---

### Q76. Design API layer for enterprise Next.js app. [bajaj]

**Short definition:** Three-layer architecture for scalable API integration.

**Answer:** Layer 1: Axios instance with base URL, interceptors for auth and errors. Layer 2: Typed API functions per domain (`authApi.login`, `assetsApi.getAll`) returning typed responses. Layer 3: React Query hooks wrapping API functions with cache keys, staleTime, and invalidation. Components only call hooks — never raw axios. Enables testing each layer independently.

**Follow-up:** Error handling strategy? — Global interceptor for 401/500; local onError for form-specific messages.

---

### Q77. How would you handle real-time updates in Next.js? [bajaj]

**Short definition:** WebSocket/SSE integration architecture for live data.

**Answer:** WebSockets for bidirectional real-time — I used this on **TimeLens** for live workforce dashboards: a custom `useWebSocket` hook with exponential backoff reconnect tied to JWT lifecycle. SSE for one-way server push — I used this on **GenE** for streaming AI chat responses, progressively appending chunks in the UI. Client Components open connections in useEffect with cleanup on unmount. Asset360Hub does not use WebSockets or SSE — it's REST + React Query. For Next.js, the WebSocket server typically runs on a separate backend; the frontend connects from a Client Component.

**Follow-up:** WebSocket vs SSE? — WebSocket: two-way; SSE: one-way server push over HTTP, simpler for streaming text like AI responses.

---

### Q78. Explain Asset360Hub architecture. [bajaj]

**Short definition:** Project deep-dive for enterprise Next.js application.

**Answer:** Asset360Hub is an enterprise IT asset management platform at DTSkill — hardware, software, licenses, intake, compliance, employee lifecycle, reports, and a super-admin area. I'm the **primary frontend owner** on a multi-contributor team, not the sole developer. Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind v4, shadcn-style UI primitives, TanStack React Query v5, and Axios with JWT refresh on 401. I bootstrapped the architecture: route groups for auth, dashboard, and super-admin, a typed `src/api/` layer, RBAC across 18 modules with `ModuleAccessGuard`, and a **custom DataTable** with server/client pagination — not AG Grid. Auth supports email/password plus Google and Microsoft SSO with token refresh queue. There's a 22-theme design system and React Query conventions documented in AGENTS.md. This project does **not** use WebSockets, SSE, or Redux — server state is React Query only.

**Follow-up:** Why React Query and not Redux? — Heavy server-side data with caching, invalidation, and polling; no need for a global Redux store on this app.

---

### Q79. Explain TimeLens real-time architecture. [bajaj]

**Short definition:** Project scenario with WebSockets and dual state management.

**Answer:** TimeLens is a workforce time-tracking platform for TechM, built with Next.js 16 App Router, React 19, and TypeScript. I'm the **primary frontend contributor** — about fifty-nine percent of repo commits over eleven months on a multi-developer team. It has 26 pages across **six RBAC roles** (admin, agent, team lead, AM, management, etc.) with client-side **`AuthGate`** route-prefix authorization — not Next.js middleware. Server state uses TanStack React Query; **UI and session state use React Context** (ten providers), not Redux Toolkit. Real-time updates use a custom **`useWebSocket`** hook with exponential backoff reconnect (1s to 30s) and JWT expiry checks via jwt-decode. Reporting uses **AG Grid** with server-side pagination and Excel export. Centralized Axios handles JWT refresh on 401 with request queuing during refresh.

**Follow-up:** WebSocket reconnection? — Exponential backoff from 1 second up to 30 seconds, with refresh-token expiry checks before reconnecting.

---

## Git & CI/CD

### Q80. What do you check during code review? [bajaj]

**Short definition:** Code review checklist for frontend pull requests.

**Answer:** I check correctness, readability, component structure, TypeScript usage, error handling, security concerns, performance implications, API handling, edge cases, and adherence to project conventions. I verify the change isn't unnecessarily complex and that tests cover critical paths. For Next.js PRs I also check Server vs Client Component boundaries.

**Follow-up:** Nitpick vs block? — Block on bugs/security; suggest on style unless it violates team standards.

---

### Q81. What is CI/CD? [bajaj]

**Short definition:** Automated pipeline for building, testing, and deploying code changes.

**Answer:** CI (Continuous Integration) runs automated steps on every push — install dependencies, lint, type-check, test, build. CD (Continuous Deployment) delivers successful builds to staging/production environments. Catches bugs early and ensures consistent deployable artifacts. Typical Next.js pipeline: eslint → tsc → jest → next build → deploy to Vercel/AWS.

**Follow-up:** CI vs CD difference? — CI validates code integrates; CD releases to environments.

---

### Q82. How do you handle a production bug? [bajaj]

**Short definition:** Incident response process for live application issues.

**Answer:** Reproduce and gather logs/errors. Identify root cause, not just symptoms. Assess impact and severity. Make the smallest safe fix with test coverage. Deploy through normal release process — even under pressure avoid skipping CI. Monitor after deploy and document root cause in post-mortem for prevention.

**Follow-up:** Rollback first? — Yes for P0 outages if rollback is faster than fix-forward.

---

### Q83. git merge vs git rebase? [bajaj]

**Short definition:** Two branch integration strategies with different history outcomes.

**Answer:** Merge creates a merge commit preserving both branch histories — safe for shared branches. Rebase replays commits on top of target for linear history — cleaner log but rewrites SHAs. Never rebase commits already pushed to shared remote branches. In Bajaj team workflows, merge PRs are standard; rebase locally before push for clean review.

**Follow-up:** git pull --rebase? — Fetch and replay local commits on top of remote changes.

---

### Q84. What is a pull request workflow? [bajaj]

**Short definition:** Standard process for contributing code through review.

**Answer:** Create feature branch from main, make commits with clear messages, push branch, open PR with description and test plan. CI runs automatically. Address review comments with follow-up commits. Squash or merge once approved and CI passes. Delete feature branch after merge. Protect main branch requiring PR approval and passing checks.

**Follow-up:** Draft PR? — Open early for feedback before marking ready for review.

---

### Q85. Conventional commits and branch naming.

**Short definition:** Standardized commit messages and branch conventions for team clarity.

**Answer:** Commits use prefixes: feat, fix, refactor, chore, docs. Branch names like `feature/auth-guard`, `fix/token-refresh`, `chore/deps-update`. Enables automated changelogs and clear git history. First commit line under 72 characters in imperative mood.

**Follow-up:** Breaking change notation? — feat! or BREAKING CHANGE footer in commit body.

---

### Q86. Environment variables in Next.js CI/CD.

**Short definition:** Managing secrets and config across environments in deployment pipelines.

**Answer:** Use `.env.local` for local secrets (never commit). CI/CD sets environment variables in pipeline config or secret manager (AWS Secrets Manager, Vercel env vars). Prefix client-exposed vars with `NEXT_PUBLIC_`. Server-only secrets (API keys, DB URLs) stay without prefix — accessible only in Server Components and Route Handlers.

**Follow-up:** env var at build vs runtime? — NEXT_PUBLIC_ inlined at build; server vars can be runtime on Node server.

---

### Q87. What runs in a typical Next.js CI pipeline? [bajaj]

**Short definition:** Standard automated checks before merge and deploy.

**Answer:** Install dependencies with lockfile (`npm ci`). Run ESLint and Prettier check. TypeScript compile (`tsc --noEmit`). Unit/integration tests (Jest/Vitest). Production build (`next build`) catching SSR and type errors. Optional: E2E tests (Playwright), bundle size check, Lighthouse CI. Deploy artifact to staging on main merge.

**Follow-up:** Build fails on lint warnings? — Configure severity; errors block, warnings may warn-only initially.

---

### Q88. git stash, cherry-pick, and hotfix workflow.

**Short definition:** Advanced Git operations for context switching and production fixes.

**Answer:** Stash saves WIP changes to switch branches urgently. Cherry-pick applies a specific commit to another branch — useful for hotfixes. Hotfix workflow: branch from production tag, fix, test, merge to main and production, tag release. Never force-push shared branches.

**Follow-up:** git revert on production? — Safe rollback creating new commit that undoes bad deploy.

---

### Q89. How to optimize Next.js build in CI? [bajaj]

**Short definition:** Speed up CI pipelines for large Next.js monorepos.

**Answer:** Cache node_modules and `.next/cache` between CI runs. Use `npm ci` for deterministic installs. Parallelize lint, type-check, and test jobs. Enable Next.js build cache. Consider Turbopack for faster dev; webpack for production until stable. Only run E2E on changed routes with affected test detection.

**Follow-up:** Remote caching? — Vercel/Turborepo remote cache shares build artifacts across team CI.

---

### Q90. Deployment strategies — blue-green vs rolling.

**Short definition:** Production deployment patterns minimizing downtime and risk.

**Answer:** Blue-green maintains two identical environments — switch traffic instantly to new version, easy rollback. Rolling update replaces instances gradually — zero downtime but slower rollback. Canary releases route small traffic percentage to new version first. For fintech, staged rollout with health checks before full traffic switch is standard.

**Follow-up:** Next.js on Vercel? — Automatic preview deploys per PR; production on main merge.

---

### Q91. How do Core Web Vitals relate to your optimization work? [bajaj]

**Short definition:** User-focused performance metrics monitored in production.

**Answer:** LCP measures loading performance — optimize with SSR, image optimization, font loading. CLS measures visual stability — set image dimensions, avoid layout-shifting ads. INP measures responsiveness — reduce JavaScript, optimize event handlers. I use Lighthouse and real-user monitoring to track these in enterprise apps and prioritize fixes by impact.

**Follow-up:** next/image benefits? — Automatic optimization, lazy loading, responsive sizes, WebP conversion.

---

## Behavioral

### Q92. Why are you looking for a change? [bajaj]

**Short definition:** Positive framing of career motivation without criticizing current employer.

**Answer:** I'm looking for a role where I can continue growing technically and work on larger, challenging products. In my current role I've gained good exposure to leadership, architecture, and delivery as Frontend Lead. Now I want to bring that experience into a stronger product environment like Bajaj Finserv Direct and continue developing as a Next.js engineer on impactful fintech products.

**Follow-up:** Avoid saying? — Complaining about current company, burnout as only reason, or purely salary focus.

---

### Q93. Why Bajaj Finserv Direct? [bajaj]

**Short definition:** Company-specific motivation connecting your skills to the role.

**Answer:** The role aligns strongly with my React and Next.js experience — App Router, TypeScript, API integration, authentication, and enterprise application development. Bajaj Finserv Direct offers a larger product environment in fintech where performance, security, and reliability matter. I'm interested in building products that serve millions of users and growing within a established financial services organization.

**Follow-up:** What do you know about Bajaj Finserv Direct? — Research their digital lending, investment, and insurance products.

---

### Q94. What are your strengths? [bajaj]

**Short definition:** Highlight strengths relevant to the Next.js Developer role.

**Answer:** My strengths are frontend architecture, problem solving, API integration, and debugging complex issues. I take ownership of features end-to-end from design to deployment. I have experience leading frontend developers, conducting code reviews, and mentoring juniors. I'm comfortable working independently and collaborating with backend, product, and QA teams.

**Follow-up:** Give a concrete example? — Token refresh interceptor in Asset360Hub preventing unnecessary logouts.

---

### Q95. What is one area you are improving? [bajaj]

**Short definition:** Show self-awareness and growth mindset.

**Answer:** I'm continuously improving my depth in backend and cloud technologies. My primary strength is frontend, but understanding backend architecture, deployment pipelines, and system behavior helps me make better frontend decisions — design better APIs consumption patterns, understand caching headers, and collaborate more effectively with backend teams on auth and data contracts.

**Follow-up:** What have you done recently? — Studying Node.js Route Handlers, AWS basics, or database query patterns.

---

### Q96. Tell me about a difficult problem you solved. [bajaj]

**Short definition:** STAR format technical problem story from real project experience.

**Answer:** In an enterprise app, authentication used short-lived access tokens with refresh tokens. Users were getting logged out whenever access tokens expired during active sessions. I investigated and found the Axios interceptor wasn't queuing concurrent requests during refresh — multiple 401s triggered parallel refresh calls, invalidating tokens. I implemented a refresh queue pattern: first 401 triggers refresh, subsequent requests wait, then all retry with the new token. Failures clear session and redirect to login.

**Follow-up:** How did you test it? — Simulated token expiry, concurrent API calls, and refresh failure scenarios.

---

### Q97. How did you handle AI streaming in GenE? [bajaj]

**Short definition:** Project-specific scenario on SSE streaming implementation.

**Answer:** GenE is DTSkill's in-house AI platform with multiple custom agents — Agentic AI, SQL Agent, Network Analyzer, medical transcription, and org data pipelines. The **backend team built the agents**; my work was **API binding and UI implementation** on the frontend. For streaming chat, the backend sends responses via **Server-Sent Events**. In Client Components I opened an EventSource connection, listened for message chunks, and progressively appended text to the chat UI — including file-upload-to-chat and graph generation flows. I handled cleanup on unmount, connection drop errors, and loading states so users see responses generate in real time instead of waiting for the full payload.

**Follow-up:** SSE vs WebSocket for AI chat? — SSE is simpler for one-way server streaming; WebSocket if you need bidirectional messaging mid-stream.

---

### Q98. How do you handle conflicting priorities from product and engineering? [bajaj]

**Short definition:** Behavioral scenario on stakeholder management.

**Answer:** I clarify requirements and impact with both sides using data — effort estimate, technical risk, and user impact. Propose phased delivery: MVP now, enhancements next sprint. Document trade-offs in writing so decisions are transparent. Escalate to engineering manager only when technical risk is high or timeline is unrealistic. Focus on shared goal of delivering reliable product.

**Follow-up:** Technical debt negotiation? — Allocate fixed capacity per sprint for debt alongside features.

---

### Q99. Describe your code review philosophy. [bajaj]

**Short definition:** How you give and receive code reviews as a Frontend Lead.

**Answer:** Reviews should be educational, not gatekeeping. I ask questions rather than dictate, explain why a pattern is preferred, and link to documentation. I prioritize correctness, security, and maintainability over style preferences. When receiving feedback, I assume good intent, ask for clarification if needed, and iterate. For Next.js I specifically verify Server/Client boundaries and data fetching patterns.

**Follow-up:** How to review senior's code? — Same standards, respectful tone, focus on impact not hierarchy.

---

### Q100. What questions would you ask the interviewer? [bajaj]

**Short definition:** Thoughtful reverse-interview questions showing genuine interest.

**Answer:** I'd ask about the team's Next.js version and App Router adoption, CI/CD pipeline setup, how auth and compliance requirements affect frontend architecture, team structure and code review process, performance monitoring in production, and growth path for frontend engineers. These show I'm thinking about how I'd contribute from day one, not just landing the offer.

**Follow-up:** Red flag answers? — No code review process, entirely legacy stack with no modernization plan, unclear role boundaries.

---

**Total Questions: 100**
