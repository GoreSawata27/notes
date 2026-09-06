# Jest & React Testing Library Interview Notes

Jest, RTL query priority, user-event, async testing, mocking, MSW CRUD test plans, Next.js testing, hooks, coverage, and interview scenarios.

---

## Jest & RTL Fundamentals

### Q1. What is Jest? [must-know]

**Short definition:** Jest is a JavaScript test runner providing structure, assertions, mocking, and coverage.

**Answer:** Jest is a test runner originally from Meta, widely used in React projects. It provides test structure with `describe` and `it`, assertions via `expect` and matchers, mocking with `jest.fn` and `jest.mock`, snapshot testing, code coverage reports, and parallel test execution. Create React App includes it by default. You configure it in `jest.config.js` or `package.json`. Jest runs in Node with jsdom for DOM simulation. It is the default choice when your bundler is Webpack-based or you need maximum ecosystem compatibility.

**Follow-up:** Jest vs Vitest?

---

### Q2. Jest vs Vitest — when to use which? [must-know]

**Short definition:** Jest is mature and CRA-default; Vitest is Vite-native and faster for Vite projects.

**Answer:** Jest has the largest ecosystem, extensive documentation, and works out of the box with Create React App and many enterprise setups. It can be slower on very large suites due to transform overhead. Vitest is built for Vite, offers faster HMR for tests, Jest-compatible API, and better native ESM support. Choose Vitest for new Vite or Next.js projects prioritizing speed. Choose Jest for existing CRA or Webpack codebases or when team familiarity matters. Migration between them is relatively straightforward because APIs align.

**Follow-up:** Can you migrate Jest to Vitest easily?

---

### Q3. What is React Testing Library (RTL)? [must-know]

**Short definition:** RTL is a testing library that queries the DOM the way users and assistive technology do.

**Answer:** React Testing Library provides utilities to render components and query the resulting DOM by roles, labels, and text. It encourages tests that resemble real user behavior rather than testing implementation details like internal state or private methods. Philosophy: "the more your tests resemble the way your software is used, the more confidence they can give you." It works with any test runner — Jest or Vitest. You import `render`, `screen`, and query functions from `@testing-library/react`.

**Follow-up:** RTL vs Enzyme?

---

### Q4. RTL vs Enzyme? [must-know]

**Short definition:** Enzyme tests implementation details; RTL tests observable user-facing behavior.

**Answer:** Enzyme allowed shallow rendering, accessing component instance, state, and props directly — tests broke easily on refactors that did not change behavior. RTL queries rendered output accessible to users — aligns with accessibility best practices. Enzyme is poorly maintained for React 18 and does not support concurrent features well. RTL is the industry standard in 2024+. If you encounter Enzyme in legacy codebases, plan migration when touching those components. New projects should use RTL exclusively.

**Follow-up:** Can you test state directly in RTL?

---

### Q5. What is the RTL query priority? [must-know]

**Short definition:** Prefer queries in order: role, label, placeholder, text, then testId as last resort.

**Answer:** Query priority reflects how users and assistive technology find elements. **getByRole** is most preferred — buttons, headings, textboxes. Then **getByLabelText** for form fields, **getByPlaceholderText**, **getByText**, **getByDisplayValue**, **getByAltText**, **getByTitle**, and finally **getByTestId** when nothing else works. Role queries also enforce accessible naming — if you cannot find a button by role, your component may have an accessibility gap. This priority is both a testing and a11y audit tool.

**Follow-up:** When is getByTestId acceptable?

---

### Q6. When should you use `getByTestId`? [must-know]

**Short definition:** Use `data-testid` only when semantic queries cannot identify the element.

**Answer:** Last resort for dynamic charts, third-party widgets without ARIA, drag handles, or non-semantic containers. Add `data-testid` sparingly — overuse means your UI lacks accessible names. Prefer upgrading components with proper roles and labels so tests and screen readers benefit together. `data-testid` is not visible to users but is stable when text content changes frequently. Configure `testIdAttribute` if your team uses a different attribute name.

**Follow-up:** data-testid vs id attribute?

---

### Q7. Difference between `getBy`, `queryBy`, and `findBy`? [must-know]

**Short definition:** getBy throws if missing; queryBy returns null; findBy waits asynchronously.

**Answer:** **getBy** is synchronous and throws if the element is not found — use when the element should exist immediately after render. **queryBy** is synchronous and returns `null` if not found — use to assert absence: `expect(queryByText('Error')).not.toBeInTheDocument()`. **findBy** returns a promise and waits up to 1000ms default for appearance — use after async fetch or animation. Prefix with `All` variants for multiple matches. Choosing the wrong variant causes flaky tests or false passes.

**Follow-up:** `waitFor` vs `findBy`?

---

### Q8. `waitFor` vs `findBy`? [must-know]

**Short definition:** `findBy` is sugar for waiting on one element; `waitFor` handles multiple assertions or custom conditions.

**Answer:** `findByRole('button')` equals `waitFor(() => getByRole('button'))`. Use `findBy` for single element appearance after async work. Use `waitFor` when asserting multiple conditions, checking callback invocation, or waiting for non-DOM state. Both retry until timeout — default 1000ms, configurable globally. Increase timeout for slow CI environments. Always `await findBy` — forgetting await is a top cause of flaky tests.

**Follow-up:** Default timeout configuration?

---

### Q9. What is `@testing-library/user-event`? [must-know]

**Short definition:** user-event simulates realistic user interactions with full event sequences.

**Answer:** Simulates click, type, tab, select, hover, and keyboard with proper event order — keydown, keypress, input, keyup for typing. Prefer over `fireEvent` which dispatches a single synthetic event. Setup: `const user = userEvent.setup(); await user.click(button)`. Catches bugs where missing intermediate events break real browsers but pass fireEvent tests. Default for interaction tests in modern RTL workflows. Version 14+ requires awaiting all user methods.

**Follow-up:** user-event vs fireEvent?

---

### Q10. user-event vs fireEvent? [must-know]

**Short definition:** fireEvent dispatches one event; user-event fires the full realistic interaction chain.

**Answer:** **fireEvent** is low-level — `fireEvent.click(button)` dispatches one click event. **user-event** is higher-level — simulates pointer down, focus, pointer up, click in sequence. Input typing with fireEvent may miss bugs in controlled components that depend on keyboard events. Default to user-event for user interaction tests. Use fireEvent only when simulating edge-case events user-event does not expose or for performance in large test suites.

**Follow-up:** Must user-event calls be awaited?

---

### Q11. Should user-event calls be awaited? [must-know]

**Short definition:** Yes — user-event v14+ interactions are async and must be awaited.

**Answer:** `await user.click()`, `await user.type()`, `await user.selectOptions()` — interactions may include delay, pointer events, or microtasks. Missing await causes tests to assert before state updates complete, producing flaky failures and React act warnings. Make test callbacks `async` and await every user interaction. ESLint rules can enforce this. Same applies to `findBy` and `waitFor` — always await async RTL utilities.

**Follow-up:** act() warnings with user-event?

---

### Q12. What is `act()` and when do you need it? [must-know]

**Short definition:** `act` flushes React state updates before assertions so the DOM reflects latest state.

**Answer:** React Testing Library's `render`, `fireEvent`, and user-event wrap updates in `act` automatically. Manual `act()` is rarely needed — wrap timer callbacks or external store updates that trigger React renders outside RTL helpers. Warning "not wrapped in act" means an assertion ran before React finished updating. Fix by awaiting user-event, using findBy, or wrapping the triggering code in act. Do not blanket-wrap every test in act — fix the async flow instead.

**Follow-up:** "not wrapped in act" warning fix?

---

## Async, MSW & Mocking

### Q13. How do you test async components? [must-know]

**Short definition:** Render, mock API, wait for async content with findBy or waitFor, assert outcomes.

**Answer:** Render the component that triggers fetch on mount. Mock API with MSW or jest.mock. Assert loading state first if visible — spinner or "Loading..." text. Then `await screen.findByText('Loaded content')` for success path. Always await async utilities before assertions. Test error path separately with MSW returning 500. Avoid asserting immediately after render when data is still fetching — that races the network mock.

**Follow-up:** Testing error state after failed fetch?

---

### Q14. How do you test loading and error states? [must-know]

**Short definition:** Use MSW delays for loading and error status codes for failure paths.

**Answer:** MSW v2: `http.get('/api', async () => { await delay('infinite') })` for perpetual loading, or return `HttpResponse.json({ message: 'Server error' }, { status: 500 })` for errors. Assert skeleton with `getByRole('status')` or loading text. Error message with `findByText(/error/i)`. Test that retry button works by resetting handler and clicking. Do not assert on implementation-specific class names like `.spinner` unless no accessible alternative exists.

**Follow-up:** Avoid testing implementation-specific class names?

---

### Q15. What is MSW (Mock Service Worker)? [must-know]

**Short definition:** MSW intercepts network requests at the service worker or Node level for realistic API mocking.

**Answer:** Handlers define request/response pairs for REST or GraphQL. Tests use actual fetch or axios code paths — only the network layer is mocked. Same handlers work in tests, Storybook, and browser development. More realistic than mocking fetch directly because your data layer runs unchanged. MSW v2 uses `http` and `HttpResponse` from `msw`. Node tests use `setupServer` from `msw/node`; browser uses `setupWorker`.

**Follow-up:** MSW v1 vs v2 setup difference?

---

### Q16. Basic MSW setup in Jest tests. [must-know]

**Short definition:** Define handlers, create setupServer, and manage lifecycle in beforeAll/afterEach/afterAll.

**Answer:** Define handlers: `http.get('/api/users', () => HttpResponse.json([{ id: 1, name: 'Ada' }]))`. Create `const server = setupServer(...handlers)` from `msw/node`. In setup file: `beforeAll(() => server.listen())`, `afterEach(() => server.resetHandlers())`, `afterAll(() => server.close())`. Tests hit real fetch; MSW responds. Import setup in `setupTests.ts`. On unhandled requests, configure `onUnhandledRequest: 'error'` in CI to catch missing mocks.

**Follow-up:** Override handler per test?

```javascript
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('/api/users', () => HttpResponse.json([{ id: 1, name: 'Ada' }]))
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

### Q17. How do you override MSW handlers per test?

**Short definition:** `server.use()` adds runtime handler overrides reset after each test.

**Answer:** In a test: `server.use(http.get('/api/users', () => HttpResponse.json([])))` returns empty list for that test only. `server.resetHandlers()` in afterEach restores defaults. Enables edge cases — empty list, 404, slow response, validation errors — without changing global handlers. For one-off errors, override only the failing endpoint. Document default handlers in `handlers.ts` and override locally for exceptional cases.

**Follow-up:** MSW with GraphQL?

---

### Q18. MSW CRUD test plan: users resource. [must-know]

**Short definition:** Test list, create, update, delete flows with handlers mirroring REST endpoints and UI assertions.

**Answer:** Plan tests per user journey, not per component in isolation. **List:** GET returns users, assert table rows by role. **Create:** POST handler appends to in-memory array, fill form, submit, assert new row appears. **Update:** PUT/PATCH changes name, assert updated text. **Delete:** DELETE removes item, assert row gone. Use shared in-memory store in handlers for consistency across tests. Reset store in beforeEach. Test validation errors with 400 responses. This plan mirrors Infosys integration test expectations.

**Follow-up:** Shared mutable store vs stateless handlers?

```javascript
let users = [{ id: 1, name: 'Ada' }];

const handlers = [
  http.get('/api/users', () => HttpResponse.json(users)),
  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    const user = { id: Date.now(), ...body };
    users.push(user);
    return HttpResponse.json(user, { status: 201 });
  }),
  http.delete('/api/users/:id', ({ params }) => {
    users = users.filter(u => u.id !== Number(params.id));
    return new HttpResponse(null, { status: 204 });
  }),
];
```

---

### Q19. MSW CRUD test plan: test cases checklist. [must-know]

**Short definition:** A structured checklist covers happy paths, errors, loading, empty state, and optimistic UI for CRUD.

**Answer:** **Read list:** success, empty, 500 error, loading spinner. **Create:** success adds row, validation error shows message, duplicate email shows error. **Update:** inline edit saves, cancel reverts, 404 on missing ID. **Delete:** confirm dialog, cancel keeps row, success removes row. **Auth:** 401 redirects to login. Each test gets fresh MSW state. Assert via roles and accessible names. This checklist demonstrates thorough testing approach in interviews without over-testing implementation.

**Follow-up:** How many tests per feature?

---

### Q20. What is `jest.mock`? [must-know]

**Short definition:** `jest.mock` replaces an entire module with a manual or automatic mock at import time.

**Answer:** `jest.mock('./api', () => ({ fetchUser: jest.fn() }))` replaces the module before imports execute. Auto-mock with `jest.mock('./module')` generates mock for all exports. Manual mocks live in `__mocks__/` adjacent to module or in root. Use to isolate unit under test from heavy dependencies — database clients, third-party SDKs. Mock at the boundary closest to your code under test — prefer MSW over mocking fetch when testing integration behavior.

**Follow-up:** jest.mock hoisting behavior?

---

### Q21. Explain jest.mock hoisting. [must-know]

**Short definition:** Jest hoists `jest.mock` calls to the top of the file before imports run.

**Answer:** Even if you write `jest.mock` after imports visually, Jest moves it above import statements during transformation. Ensures the mocked module is used when the import executes. Variables declared in test scope are not available in mock factory unless using `jest.doMock` which is not hoisted. Pattern: import mocked module after jest.mock, then cast: `import { fetchUser } from './api'; jest.mocked(fetchUser).mockResolvedValue(...)`.

**Follow-up:** Partial module mock?

---

### Q22. How do you partially mock a module? [must-know]

**Short definition:** Spread `jest.requireActual` and override only specific exports.

**Answer:** `jest.mock('./utils', () => ({ ...jest.requireActual('./utils'), fetchData: jest.fn() }))` keeps real implementations except mocked exports. Useful when only one function needs stubbing while others run real logic. Test the integration of real helpers with mocked network boundary. Avoid partial mocking entire app modules — tests become unclear about what is real vs fake.

**Follow-up:** jest.spyOn vs jest.mock?

---

### Q23. `jest.spyOn` vs `jest.mock`? [must-know]

**Short definition:** spyOn wraps existing methods; jest.mock replaces modules at import level.

**Answer:** **spyOn** — `jest.spyOn(console, 'error').mockImplementation(() => {})` wraps existing method, can observe calls or replace implementation temporarily. Original module intact. **jest.mock** — replaces entire module before import. Use spyOn for tracking calls on real objects, suppressing console noise, or temporarily mocking one method on a class. Use jest.mock for full dependency replacement. Restore spies in afterEach with `mockRestore()`.

**Follow-up:** Restore spies after test?

---

## Hooks, Matchers & Patterns

### Q24. How do you test custom React hooks? [must-know]

**Short definition:** Use `renderHook` to mount hooks and assert on `result.current`.

**Answer:** `const { result, rerender, unmount } = renderHook(() => useMyHook(initial))`. Assert `result.current.value` after interactions. Wrap with providers via `wrapper: ({ children }) => <Provider>{children}</Provider>`. Use `act()` from RTL when triggering state updates: `act(() => { result.current.increment() })`. Test rerender with new props: `rerender({ count: 5 })`. Prefer testing hooks via components when hook output is purely UI — renderHook for reusable logic hooks.

**Follow-up:** renderHook vs testing hook via component?

```javascript
const { result } = renderHook(() => useCounter(0));
act(() => result.current.increment());
expect(result.current.count).toBe(1);
```

---

### Q25. What matchers should you know for Jest interviews? [must-know]

**Short definition:** Core matchers compare values, mock calls, objects, errors, and DOM state.

**Answer:** `toBe` for strict equality on primitives; `toEqual` for deep object equality; `toHaveBeenCalledWith` and `toHaveBeenCalledTimes` for mocks; `toMatchObject` for partial object match; `toContain` for arrays; `toThrow` for exceptions. From jest-dom: `toBeInTheDocument()`, `toBeVisible()`, `toHaveAttribute`, `toHaveClass`, `toHaveTextContent`, `toHaveAccessibleName`. Combine matchers for precise assertions. `expect.assertions(n)` ensures async tests run all expects.

**Follow-up:** toBe vs toEqual with objects?

---

### Q26. What is `@testing-library/jest-dom`? [must-know]

**Short definition:** jest-dom adds readable DOM-specific matchers to Jest expect.

**Answer:** Import in setup file: `import '@testing-library/jest-dom'`. Matchers like `toBeInTheDocument()`, `toBeVisible()`, `toBeDisabled()`, `toHaveAccessibleName()`, `toHaveStyle()`, `toHaveValue()`. Makes assertions express user-visible intent. Without jest-dom, you compare `element !== null` manually. Vitest uses same package with `@testing-library/jest-dom/vitest` import path. Essential for every RTL project.

**Follow-up:** toBeVisible vs toBeInTheDocument?

---

### Q27. `toBeVisible` vs `toBeInTheDocument`? [must-know]

**Short definition:** inDocument means in DOM tree; visible means user can see it.

**Answer:** **toBeInTheDocument** — element exists in DOM, may be hidden via CSS or aria-hidden. **toBeVisible** — exists AND visible: not display:none, visibility:hidden, opacity:0, or zero effective size. Hidden modal content may be in document but not visible — use correct matcher for your assertion. Collapsed accordion panel might be in document but not visible. Match user perception, not just DOM presence.

**Follow-up:** Testing aria-hidden elements?

---

### Q28. What is the Arrange-Act-Assert pattern? [must-know]

**Short definition:** AAA structures tests: setup, interaction, verification.

**Answer:** **Arrange** — setup mocks, render component, seed store. **Act** — user click, form submit, timer advance. **Assert** — verify expected DOM, mock calls, or state. Keeps tests readable and scannable. One logical behavior per test — multiple related expects OK for same outcome. Name tests with behavior: `it('shows error when email is invalid')`. Interviewers look for this structure in live coding rounds.

**Follow-up:** Multiple behaviors — one test or many?

---

### Q29. One test per behavior or multiple assertions? [must-know]

**Short definition:** Prefer one behavior per test; multiple asserts OK when verifying one outcome.

**Answer:** Separate tests for login success vs login failure — clear failure diagnosis. Multiple expects fine when checking same behavior: text content AND aria attribute on same button. Avoid unrelated assertions in one test — split for maintainability. Long tests that test everything are hard to debug when they fail. Balance granularity with not over-fragmenting — "form validation" can be one describe block with many its.

**Follow-up:** Test naming conventions?

---

### Q30. Good test naming conventions? [must-know]

**Short definition:** Name tests by expected behavior under a condition, not implementation.

**Answer:** `'shows error when email is invalid'` not `'setError called'`. Pattern: `it('should [outcome] when [condition]')`. Group with `describe('LoginForm', () => ...)`. Nested describe for contexts: `describe('when user is logged out')`. Readable names serve as documentation. In CI, failed test name tells you what broke without reading assertion details.

**Follow-up:** describe nesting depth?

---

### Q31. What should you NOT test according to RTL philosophy? [must-know]

**Short definition:** Avoid testing internal state, private methods, lifecycle order, and third-party internals.

**Answer:** Do not test component state directly, private methods, exact CSS classes unless behavior-critical, React internals, or snapshot entire large trees. Test observable user outcomes — text appears, button disabled, navigation occurs. Third-party library behavior is their problem unless you integrate it. Over-specifying implementation makes tests brittle on refactor. If you rename state variable but behavior unchanged, tests should still pass.

**Follow-up:** When are snapshots appropriate?

---

### Q32. When are snapshot tests appropriate? [must-know]

**Short definition:** Snapshots suit small stable outputs; avoid large trees with noisy diffs.

**Answer:** Good for error message strings, serialized config objects, small presentational components unlikely to change. Bad for large component trees — developers blindly run `--updateSnapshot` without reading diffs. Prefer explicit assertions for behavior. Inline snapshots embed expected string in test file. If snapshot changes frequently, replace with targeted expects. Snapshots are supplementary, not primary testing strategy.

**Follow-up:** Inline snapshot?

---

## Next.js & Provider Testing

### Q33. How do you mock `next/navigation` in Next.js tests? [must-know]

**Short definition:** jest.mock next/navigation with fake router, pathname, and searchParams.

**Answer:** App Router: `jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn(), replace: jest.fn(), refresh: jest.fn(), back: jest.fn() }), usePathname: () => '/test', useSearchParams: () => new URLSearchParams('page=1'), useParams: () => ({ id: '1' }) }))`. Mock only what the component uses. Pages Router uses `next/router` with `useRouter` mock. Assert `push` called with expected path after navigation action. Update mocks when upgrading Next.js major versions.

**Follow-up:** Testing Link component behavior?

```javascript
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn() })),
  usePathname: jest.fn(() => '/dashboard'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));
```

---

### Q34. How do you test Next.js App Router Server Components?

**Short definition:** Server Components are async functions — unit test pure logic; integration test via E2E or render client children.

**Answer:** Server Components cannot use RTL render directly in jsdom — they run on server. Extract data-fetching logic into testable pure functions. Test client components that receive server-fetched props normally with RTL. For full RSC integration, use Next.js experimental test utils or Playwright E2E. Mock `fetch` or MSW when testing server action logic extracted to modules. Interview answer: separate server logic from presentation, test each layer appropriately.

**Follow-up:** Testing server actions?

---

### Q35. How do you test Next.js client components with `"use client"`?

**Short definition:** Client components test normally with RTL; mock Next.js hooks and image/link if used.

**Answer:** Import and render like any React component. Mock `next/image` to render plain `img` for simpler queries. Mock `next/link` to render `a` tag. Provide router context via mocks. If component uses dynamic imports, mock the imported module. Client components using hooks, context, and browser APIs work in jsdom with standard RTL patterns. Ensure test file does not accidentally import server-only modules.

**Follow-up:** Mock next/image?

```javascript
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} alt={props.alt} />,
}));
```

---

### Q36. Next.js testing: pages vs app router differences.

**Short definition:** Pages Router tests getServerSideProps separately; App Router mocks navigation hooks and tests client boundaries.

**Answer:** Pages Router: test `getServerSideProps` as async function with mocked req/res context. Test page component with preloaded props. App Router: no getServerSideProps — data fetching in Server Components or client hooks. Mock `useRouter`, `useSearchParams`, `useParams` from `next/navigation`. Layout tests wrap children in mocked providers. Middleware testing uses Node integration tests against exported middleware function. Know which router your project uses before the interview.

**Follow-up:** Testing middleware?

---

### Q37. How do you test components with Context? [must-know]

**Short definition:** Wrap rendered UI in the Provider with test values.

**Answer:** `render(<ThemeProvider value="dark"><Component /></ThemeProvider>)` or build custom `renderWithProviders` combining Theme, Auth, Redux, QueryClient. Reuse wrapper across test file for consistency. Override provider value per test for different scenarios. Test default context behavior when consumer renders outside provider — should throw or use default per design. Context tests prove integration, not just isolated component logic.

**Follow-up:** Default context value testing?

---

### Q38. What is a custom render utility pattern? [must-know]

**Short definition:** Centralize Provider wrapping in a reusable render function exported from test-utils.

**Answer:** `function renderWithProviders(ui, { preloadedState, ...options } = {}) { const store = setupStore(preloadedState); return render(ui, { wrapper: ({ children }) => <AllProviders store={store}>{children}</AllProviders>, ...options }); }`. Export from `test-utils.tsx` alongside re-exported RTL utilities. Override store state, query client, or router per test via options. One place to update when app providers change. Standard pattern in production React codebases.

**Follow-up:** Override store state per test?

```typescript
// test-utils.tsx
export function renderWithProviders(ui, { preloadedState } = {}) {
  const store = configureStore({ reducer: rootReducer, preloadedState });
  return render(ui, {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
}
```

---

### Q39. How do you test Redux-connected components? [must-know]

**Short definition:** Wrap in Provider with test store; assert UI, not store internals.

**Answer:** `renderWithProviders(<TodoList />, { preloadedState: { todos: [...] } })`. User events dispatch real actions through UI — assert DOM updates. Avoid asserting `store.getState()` unless testing dispatch wiring — prefer user-visible outcomes. Mock API with MSW for thunk flows. Test that clicking add todo shows new item, not that `ADD_TODO` action fired. Integration style gives higher confidence.

**Follow-up:** Mock dispatch vs real store?

---

### Q40. How do you test React Query components? [must-know]

**Short definition:** Fresh QueryClient per test, MSW for API, wrap in Provider, await loaded content.

**Answer:** Create new `QueryClient({ defaultOptions: { queries: { retry: false } } })` per test — shared client causes cache bleed. Wrap in `QueryClientProvider`. MSW for API responses. `await screen.findByText('Loaded')` for success. Seed cache with `queryClient.setQueryData(['users'], mockUsers)` for preloaded scenarios. Test invalidation by triggering mutation and asserting refetched data. Never share QueryClient between tests.

**Follow-up:** waitFor loading to finish?

---

## Timers, Coverage & Scenarios

### Q41. How do you mock timers and dates? [must-know]

**Short definition:** `jest.useFakeTimers()` controls time; `jest.setSystemTime` mocks Date.

**Answer:** `jest.useFakeTimers()` then `jest.advanceTimersByTime(1000)` or `await jest.runAllTimersAsync()`. Mock Date: `jest.setSystemTime(new Date('2024-01-01'))`. Restore with `jest.useRealTimers()` in afterEach. Combine with `act()` for timer-triggered React updates. Modern Jest supports fake timers with promises — use `runAllTimersAsync`. user-event with fake timers may need `{ advanceTimers: jest.advanceTimersByTime }` in setup.

**Follow-up:** Fake timers with user-event?

---

### Q42. What is code coverage and what do metrics mean? [must-know]

**Short definition:** Coverage measures what percentage of code executes during tests.

**Answer:** **Statements/lines** — percent of executable lines run. **Branches** — percent of if/else paths taken. **Functions** — percent of functions called. 100% coverage does not mean bug-free — you can execute code without asserting behavior. Aim for meaningful coverage on critical paths — auth, payments, data transforms. Jest: `jest --coverage` generates HTML report. Use coverage to find untested files, not as sole quality metric.

**Follow-up:** Coverage thresholds in CI?

---

### Q43. How do you set coverage thresholds in Jest? [must-know]

**Short definition:** `coverageThreshold` in jest.config fails CI when coverage drops below limits.

**Answer:** `coverageThreshold: { global: { branches: 80, functions: 80, lines: 80, statements: 80 } }`. Per-path thresholds for critical modules: `'src/utils/auth.ts': { lines: 95 }`. Configure `collectCoverageFrom` to include source globs and exclude types, stories, test utils. CI fails build if team drops below bar. Review coverage diffs in PRs — new code should include tests.

**Follow-up:** What to exclude from coverage?

---

### Q44. What files to exclude from coverage collection?

**Short definition:** Exclude types, config, stories, barrels, and generated code from coverage metrics.

**Answer:** Configure `collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/index.ts', '!src/**/*.stories.tsx']`. Focus coverage on business logic. Istanbul ignore comments `/* istanbul ignore next */` for truly unreachable defensive code — use sparingly. Excluding everything makes coverage meaningless — balance pragmatism with accountability. Test utilities may be excluded if they are thin wrappers.

**Follow-up:** Istanbul ignore comments?

---

### Q45. Interview scenario: test a login form. [must-know]

**Short definition:** Type credentials, submit, assert success navigation or error message via MSW.

**Answer:** Render login form. `await user.type(screen.getByLabelText(/email/i), 'a@b.com')`. Type password. Click submit. MSW returns success token — assert welcome message or mock router push to `/dashboard`. Separate test: invalid credentials return 401 — assert error text. Test submit disabled while loading. Test empty validation before API call. All queries by label and role — demonstrates RTL best practices in live interviews.

**Follow-up:** Validation before submit?

---

### Q46. Interview scenario: test debounced search input. [must-know]

**Short definition:** Use fake timers or waitFor; verify API called once after debounce delay.

**Answer:** Render search component with MSW tracking requests. Type query quickly — before debounce, API not called or called zero times for final term. `jest.advanceTimersByTime(300)` with fake timers. Assert fetch called once with final query string. Clear input — assert reset or empty results. Flaky causes: not awaiting user.type, real timers racing debounce, shared MSW state. Mention both fake timer and real timer strategies.

**Follow-up:** Flaky debounce test causes?

---

### Q47. Interview scenario: test infinite scroll list. [must-know]

**Short definition:** MSW paginated handlers; scroll triggers load; assert page 2 items appear without duplicates.

**Answer:** MSW returns page 1 then page 2 based on query param. Render list — assert first page items. Mock IntersectionObserver callback to simulate sentinel visible — or trigger loadMore button if exposed. `await findByText('Page 2 Item')`. Assert no duplicate fetch on re-render. Separate tests for empty, error, and end-of-list. Shows integration testing maturity in interviews.

**Follow-up:** IntersectionObserver mock?

---

### Q48. How do you mock IntersectionObserver? [must-know]

**Short definition:** Replace global IntersectionObserver with jest mock that captures observe and triggers callback.

**Answer:** In setupTests: `global.IntersectionObserver = jest.fn((cb) => ({ observe: jest.fn((el) => cb([{ isIntersecting: true, target: el }])), unobserve: jest.fn(), disconnect: jest.fn() }))`. Manually trigger callback in test to simulate element entering viewport. Required for infinite scroll and lazy load in jsdom. Without mock, components using IntersectionObserver throw or never load.

**Follow-up:** jsdom limitations?

---

### Q49. What are jsdom limitations in testing? [must-know]

**Short definition:** jsdom has no real layout, rendering, or full browser APIs.

**Answer:** No accurate layout — offsetHeight and getBoundingClientRect are stubbed or zero. No visual rendering or CSS cascade computation. Incomplete APIs: full Canvas, some ResizeObserver behavior. Good for logic, DOM interaction, and accessibility tree queries. Use Playwright or Cypress for true E2E, cross-browser, visual regression, and real network. Know when to stop at RTL and escalate to browser tests.

**Follow-up:** When to add E2E layer?

---

### Q50. Unit vs integration vs E2E testing pyramid? [must-know]

**Short definition:** Many fast unit/integration tests; fewer slow high-confidence E2E tests.

**Answer:** **Unit** — pure functions, hooks, utilities; fastest, most numerous. **Integration** — component plus providers plus mocked API via RTL and MSW; core of React testing. **E2E** — full app in real browser; few, slow, highest confidence for critical journeys. Pyramid: wide base of unit/integration, narrow top of E2E. Testing Trophy adjusts emphasis toward integration for React. Balance speed and confidence.

**Follow-up:** Testing Trophy (Kent C. Dodds)?

---

### Q51. What is the Testing Trophy? [must-know]

**Short definition:** Kent C. Dodds model emphasizing integration tests over excessive isolated unit tests.

**Answer:** Base layer: static analysis — TypeScript and ESLint catch bugs free. Large middle: integration tests — RTL plus MSW testing components with realistic dependencies. Smaller unit test slice for pure logic. Top: few E2E tests for critical paths. Fits React where components integrate heavily with context, routing, and data fetching. Avoid testing every helper in isolation while never testing them together.

**Follow-up:** Static analysis as testing layer?

---

### Q52. How do you debug failing RTL tests? [must-know]

**Short definition:** Use screen.debug, logTestingPlaygroundURL, and run single tests in isolation.

**Answer:** `screen.debug()` prints current DOM to console. `screen.logTestingPlaygroundURL()` opens interactive query builder in browser. Run one test: `jest -t "shows error"`. Increase `asyncUtilTimeout` for slow CI. Check accessible name in browser DevTools Accessibility panel when role query fails. prettyDOM limits output size for large trees. Read full error — often suggests accessible role you missed.

**Follow-up:** prettyDOM vs debug?

---

### Q53. What is `within` in RTL? [must-know]

**Short definition:** `within` scopes queries to a container element.

**Answer:** `within(dialog).getByRole('button', { name: 'Confirm' })` searches only inside dialog. Prevents matching duplicate buttons elsewhere on page. Essential for modals, table rows, list items, and card components. Get container via `getByRole('dialog')` or `getByTestId` then query within. Makes tests resilient when page has multiple similar sections.

**Follow-up:** getByRole on dialog element?

---

### Q54. How do you test accessible modals? [must-know]

**Short definition:** Query dialog role, test close behaviors, scope inner queries with within.

**Answer:** `const dialog = screen.getByRole('dialog')`. Assert `aria-labelledby` or accessible name. Test Escape closes modal. Test overlay click if supported. `within(dialog).getByRole('button', { name: 'Confirm' })`. Verify focus moves to dialog on open — optional in jsdom. Focus trap testing is limited in jsdom — note E2E for full a11y audit. Test that background content is inert if using inert attribute.

**Follow-up:** Testing focus management?

---

### Q55. How do you test form validation (React Hook Form / Formik)? [must-know]

**Short definition:** Submit invalid form, assert error messages; fix fields, assert errors clear.

**Answer:** Submit empty form — `await findByText(/email is required/i)`. Fill invalid email — assert format error. Correct fields — errors disappear on blur or submit. Async validation: MSW delay plus uniqueness check. Query by label text, not input name attribute — matches user experience. Test submit button disabled state during async validation if applicable.

**Follow-up:** Testing controlled vs uncontrolled inputs?

---

### Q56. Common Jest/RTL mistakes in interviews. [must-know]

**Short definition:** Top mistakes: testing implementation, wrong query type, missing await, shared state.

**Answer:** Testing state or props directly instead of DOM. Using getByTestId everywhere. Not awaiting user-event and findBy. Sharing QueryClient, store, or MSW mutable state between tests. Over-mocking — testing mock behavior not production code. Not resetting MSW handlers. Querying by className. Tests depending on execution order. Naming tests after functions not behavior. Mentioning these shows senior testing awareness.

**Follow-up:** test isolation with beforeEach?

---

### Q57. How do you ensure test isolation? [must-know]

**Short definition:** Reset mocks, handlers, and clients before each test; no shared mutable globals.

**Answer:** `beforeEach`: `jest.clearAllMocks()`, `server.resetHandlers()`, new QueryClient, new store. RTL auto-calls cleanup after each test unmounting components. No shared let variables mutated across tests. Run `jest --randomize` locally to detect order dependencies. Independent tests can run in parallel in CI. Isolation failures cause flaky CI that passes locally — hardest bug class in testing.

**Follow-up:** clearAllMocks vs resetAllMocks?

---

### Q58. `clearAllMocks` vs `resetAllMocks` vs `restoreAllMocks`? [must-know]

**Short definition:** clear wipes call history; reset wipes history and implementation; restore undoes spyOn.

**Answer:** **clearAllMocks** — clears call history, keeps mock implementation and return values. **resetAllMocks** — clears history plus resets mock to empty function with no return value. **restoreAllMocks** — restores original implementation for spies created with spyOn. Typical beforeEach: clearAllMocks. Use restore when spyOn replaced real method and you need original back. Know which your codebase setup file uses.

**Follow-up:** When restore needed?

---

### Q59. How do you test error boundaries? [must-know]

**Short definition:** Suppress console.error; render component that throws; assert fallback UI.

**Answer:** `jest.spyOn(console, 'error').mockImplementation(() => {})` — React logs boundary errors loudly. Render component that throws when prop flag set, wrapped in ErrorBoundary. Assert fallback message renders. Test retry/reset if boundary supports it. Event handler throws are NOT caught by boundary — separate try/catch tests. React 19 may improve testing story; testing fallback component in isolation is always valid.

**Follow-up:** Throwing in event handler vs render?

---

### Q60. What goes in `setupTests.ts`? [must-know]

**Short definition:** Global test setup: jest-dom, MSW lifecycle, browser API mocks, timeouts.

**Answer:** Import `@testing-library/jest-dom`. MSW server listen/reset/close hooks. Mock matchMedia, IntersectionObserver, ResizeObserver. Optional `jest.setTimeout(10000)` for slow CI. Configure RTL: `configure({ asyncUtilTimeout: 5000 })`. Extend expect with jest-dom matchers. Keep minimal — only truly global mocks. Feature-specific mocks belong in test files.

**Follow-up:** extendExpect from jest-dom?

---

### Q61. How do you test React Router components?

**Short definition:** Wrap in MemoryRouter or createMemoryRouter with initial entries.

**Answer:** `render(<MemoryRouter initialEntries={['/users/1']}><Routes>...</Routes></MemoryRouter>)`. Assert correct page content for route. Test navigation: click link, assert new content. `createMemoryRouter` for data router APIs with loaders. Mock navigate function to assert redirects without full navigation. Query by role on resulting page, not router internals.

**Follow-up:** Testing loader data?

```javascript
render(
  <MemoryRouter initialEntries={['/dashboard']}>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  </MemoryRouter>
);
expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
```

---

### Q62. How do you test file upload inputs?

**Short definition:** Create File object and fire change event with user-event or fireEvent.

**Answer:** `const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' })`. `await user.upload(screen.getByLabelText(/upload/i), file)`. Assert filename appears or upload mock called. MSW POST handler receives multipart if testing full flow. jsdom supports File API. Test reject wrong file type by asserting error message. Test size limit validation.

**Follow-up:** Mocking XMLHttpRequest for legacy upload?

---

### Q63. How do you test WebSocket or SSE components?

**Short definition:** Mock WebSocket class; simulate message events; assert UI updates.

**Answer:** `global.WebSocket = jest.fn(() => ({ send: jest.fn(), close: jest.fn(), addEventListener: jest.fn(), readyState: 1 }))`. Capture instance, simulate `message` event with test payload. Assert UI reflects live data. Cleanup on unmount — assert close called. True WebSocket behavior needs integration or E2E. MSW supports WebSocket mocking in newer versions for closer simulation.

**Follow-up:** MSW WebSocket handlers?

---

### Q64. How do you test accessibility with jest-axe?

**Short definition:** jest-axe runs axe-core rules against rendered DOM for a11y violations.

**Answer:** `const { container } = render(<Form />)`; `const results = await axe(container)`; `expect(results).toHaveNoViolations()`. Catches missing labels, contrast issues, invalid ARIA. Complements RTL role queries — roles enforce good practice; axe catches regressions. Not replacement for manual screen reader testing. Add to CI for critical pages. Some rules are warnings not failures — configure axe options.

**Follow-up:** False positives in jsdom?

---

### Q65. Vitest migration: key config differences from Jest.

**Short definition:** Vitest uses vite.config test section; globals and setupFiles differ slightly.

**Answer:** Enable `test: { globals: true, environment: 'jsdom', setupFiles: './setupTests.ts' }` in vite.config. Import `@testing-library/jest-dom/vitest` instead of default import. Replace `jest.fn` with `vi.fn`, `jest.mock` with `vi.mock`. MSW setup identical. Coverage via `@vitest/coverage-v8`. Faster but verify all mocks migrated — subtle hoisting differences exist. Know both if interviewing at mixed stack companies.

**Follow-up:** vi vs jest API differences?

---

### Q66. How do you test Suspense and lazy-loaded components?

**Short definition:** Wrap in Suspense with fallback; assert fallback then loaded content.

**Answer:** Mock dynamic import: `jest.mock('./Heavy', () => ({ default: () => <div>Loaded</div> }))` or use actual lazy with short delay. Wrap: `<Suspense fallback={<div>Loading...</div>}><LazyComponent /></Suspense>`. Assert loading text then `findByText('Loaded')`. Error boundary sibling for load failure. React.lazy needs mock or waitFor for real import promise resolution.

**Follow-up:** Testing load error?

---

### Q67. MSW GraphQL handler basics.

**Short definition:** MSW graphql query and mutation handlers intercept GraphQL operations by name.

**Answer:** `graphql.query('GetUsers', () => HttpResponse.json({ data: { users: [] } }))`. Mutations similar with operation name. Test Apollo or urql components with same MSW patterns as REST. Override per test with server.use. Assert UI reflects GraphQL errors when returning `{ errors: [...] }`. Colocate GraphQL handlers with REST in handlers.ts.

**Follow-up:** graphql.link for multiple schemas?

---

### Q68. How do you test i18n translated components?

**Short definition:** Wrap in I18nextProvider with test translations or mock useTranslation.

**Answer:** Initialize i18n test instance with inline resources: `{ en: { translation: { welcome: 'Hello' } } }`. Wrap render in provider. Assert `getByText('Hello')`. Alternatively mock `useTranslation: () => ({ t: (key) => key })` for key-based assertions. Test language switch if UI supports it. Ensure test translations cover keys used in component under test.

**Follow-up:** Mock vs real i18n instance?

---

### Q69. Parallel test execution and `--runInBand`.

**Short definition:** Jest runs tests in parallel by default; `--runInBand` serializes for debugging.

**Answer:** Parallel workers speed CI but expose shared state bugs. Use `--runInBand` when debugging order-dependent failures or resource limits. `--maxWorkers=4` caps parallelism. Test isolation prevents need for runInBand in healthy suites. Database integration tests sometimes require serial execution or transaction rollback per test. Know tradeoff: speed vs isolation complexity.

**Follow-up:** CI worker configuration?

---

### Q70. Interview sound bite: your testing approach. [must-know]

**Short definition:** Behavior-focused RTL tests with MSW, user-event, fresh providers, integration over implementation.

**Answer:** Say: "I test behavior with React Testing Library — query by role and label, interact with user-event, handle async with findBy and waitFor. I mock APIs at the network layer with MSW including full CRUD flows, isolate tests with fresh providers per test, and focus integration tests on critical user paths. Unit tests cover pure utilities. E2E with Playwright covers checkout and login journeys. I debug with screen.debug and avoid testing implementation details." Demonstrates senior, practical approach Infosys and product companies expect.

**Follow-up:** How testable code differs in design?

---

**Total questions: 70**
