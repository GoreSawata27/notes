# Jest & React Testing Library Learning Notes

A hands-on guide to testing React applications the way users experience them. You will learn the testing pyramid, Jest matchers and mocks, React Testing Library queries, user-event, async patterns, MSW for network mocking, hook and form testing, Next.js specifics, and CI habits that keep suites fast and trustworthy. Each lesson follows the same rhythm: read the takeaway, study the explanation and code, apply the tip, then complete the exercise.

---

## Testing pyramid & philosophy

### Lesson 1. The testing pyramid and where frontend tests live

**Takeaway:** Most confidence comes from many fast unit tests, fewer integration tests, and a handful of end-to-end tests. React Testing Library sits in the integration layer — it renders real components and asserts on DOM output, not implementation details.

**Explain:** The **testing pyramid** (Mike Cohn) recommends a wide base of cheap, fast tests and a narrow top of slow, expensive tests:

```
        /\
       /E2E\        ← few (Playwright, Cypress)
      /------\
     / Integr \     ← moderate (RTL + Jest)
    /----------\
   /    Unit     \  ← many (pure functions, hooks, utils)
  /----------------\
```

**Unit tests** verify one function or hook in isolation. **Integration tests** render a component tree with providers, fire events, and check visible results. **E2E tests** drive a real browser against a deployed or local app.

For React, RTL is integration-first: you import a component, render it with `render()`, interact like a user, and assert what appears on screen. You do not test that `setState` was called or that a child received a specific prop unless that prop drives user-visible behavior.

```javascript
// utils/formatPrice.test.js — unit test (pure function)
import { formatPrice } from "./formatPrice";

test("formats cents as USD currency", () => {
  expect(formatPrice(1999)).toBe("$19.99");
});

// ProductCard.test.jsx — integration test (RTL)
import { render, screen } from "@testing-library/react";
import { ProductCard } from "./ProductCard";

test("shows formatted price to the shopper", () => {
  render(<ProductCard name="Mug" priceCents={1999} />);
  expect(screen.getByText("$19.99")).toBeInTheDocument();
});
```

**Tip:** When deciding test type, ask: "If this breaks, would a user notice?" If yes, prefer RTL. If the logic is invisible (date math, validation schema), unit-test the pure function and keep the component test thin.

**Try it:** List five behaviors in a shopping cart feature (add item, update quantity, remove, show subtotal, empty state). Classify each as unit, integration, or E2E and write one sentence explaining why.

---

### Lesson 2. Test behavior, not implementation

**Takeaway:** Assert on outcomes users can see or hear — text, roles, ARIA states, URLs — not on internal state, private methods, or component instance details. Tests tied to implementation break during harmless refactors.

**Explain:** Implementation-detail tests fail when you rename a state variable, extract a custom hook, or swap `useState` for `useReducer` even though the UI behaves identically. **Behavior tests** survive refactors because they describe the contract from the user's perspective.

```tsx
// ❌ Implementation detail — brittle
import { render } from "@testing-library/react";
import Counter from "./Counter";

test("increments count state", () => {
  const { container } = render(<Counter />);
  const instance = container.firstChild as any;
  // reaching into internals or enzyme-style state
  expect(instance._reactInternals?.memoizedState?.count).toBe(0);
});

// ✅ Behavior — resilient
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Counter from "./Counter";

test("shows updated count after user clicks increment", async () => {
  const user = userEvent.setup();
  render(<Counter initial={0} />);

  expect(screen.getByRole("status")).toHaveTextContent("0");

  await user.click(screen.getByRole("button", { name: /increment/i }));

  expect(screen.getByRole("status")).toHaveTextContent("1");
});
```

The RTL guiding principle (Kent C. Dodds): *"The more your tests resemble the way your software is used, the more confidence they can give you."*

**Tip:** If you cannot write the assertion without knowing component internals, improve accessibility (labels, roles) so queries like `getByRole` work — that helps both tests and real users.

**Try it:** Take a component you wrote recently. Write one bad test that inspects props or state directly, then rewrite it using only `screen` queries and user-visible assertions.

---

### Lesson 3. Arrange, Act, Assert (AAA) and test naming

**Takeaway:** Structure every test in three phases — set up data and render (Arrange), perform the user action (Act), verify the outcome (Assert). Name tests as specifications: *what* is being tested, *under which condition*, and *expected result*.

**Explain:** Consistent structure makes failures easy to scan. Jest's `test` (alias `it`) blocks map naturally to AAA:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "./LoginForm";

describe("LoginForm", () => {
  test("shows validation error when user submits empty email", async () => {
    // Arrange
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    // Act
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    // Assert
    expect(screen.getByRole("alert")).toHaveTextContent(/email is required/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
```

Naming patterns that scale in large repos:

- `shows X when Y`
- `calls Z with payload after user does W`
- `does not render delete button when user lacks permission`

Avoid vague names like `works correctly` or `renders without crashing`. Empty render smoke tests catch almost nothing useful.

**Tip:** Keep Arrange minimal — only mock what the scenario needs. Heavy global setup hides which dependency caused a failure.

**Try it:** Refactor an existing test (or write a new one) to label AAA sections with comments, then rename the test using the `shows/calls/does not` pattern.

---

## Jest setup & matchers

### Lesson 4. Jest configuration for React and TypeScript

**Takeaway:** A typical React + TS project uses Jest with `ts-jest` or `@swc/jest`, `jest-environment-jsdom`, and a setup file that imports `@testing-library/jest-dom` for DOM-specific matchers.

**Explain:** Install the core stack:

```bash
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
# TypeScript
npm install -D @types/jest ts-jest
# or faster: @swc/jest @swc/core
```

Minimal `jest.config.ts`:

```typescript
import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    // Next.js / path aliases
    "^@/(.*)$": "<rootDir>/src/$1",
    // CSS modules and static assets
    "\\.(css|less|scss)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/__mocks__/fileMock.js",
  },
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
};

export default config;
```

`jest.setup.ts`:

```typescript
import "@testing-library/jest-dom";

// Optional: fail tests on unexpected console.error
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    originalError(...args);
    throw new Error(`console.error: ${args.join(" ")}`);
  };
});
afterAll(() => {
  console.error = originalError;
});
```

Add to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**Tip:** Match your bundler's path aliases in `moduleNameMapper` — unresolved imports are the most common first-run failure.

**Try it:** Scaffold `jest.config.ts`, `jest.setup.ts`, and run a single passing test that uses `toBeInTheDocument()`. Fix any module resolution errors until green.

---

### Lesson 5. Core matchers: equality, truthiness, and exceptions

**Takeaway:** Use `toBe` for primitives (strict equality), `toEqual` for deep object/array comparison, `toBeTruthy`/`toBeFalsy` sparingly, and `toThrow` for expected errors. Prefer specific matchers over generic ones.

**Explain:**

```javascript
// Primitives — Object.is semantics (handles NaN)
expect(2 + 2).toBe(4);
expect("hello").not.toBe("world");

// Objects & arrays — deep equality
expect({ a: 1, b: { c: 2 } }).toEqual({ a: 1, b: { c: 2 } });
expect([1, 2, 3]).toEqual([1, 2, 3]);

// Same reference vs equal value
const obj = { x: 1 };
expect(obj).toBe(obj);           // same reference — passes
expect({ x: 1 }).not.toBe(obj);  // different object — passes

// Truthiness — avoid for strings/numbers; use toBe(true) or explicit value
expect("").toBeFalsy();
expect("text").toBeTruthy();

// Exceptions
function divide(a, b) {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}

expect(() => divide(10, 0)).toThrow("Division by zero");
expect(() => divide(10, 0)).toThrow(/division by zero/i);

// Async rejection
async function fetchBad() {
  throw new Error("Network down");
}
await expect(fetchBad()).rejects.toThrow("Network down");
```

**Tip:** When a test fails with "Expected: {...} Received: {...}", check whether you need `toEqual` (value) or `toBe` (reference). For floating point, use `toBeCloseTo`.

**Try it:** Write tests for a `parseQueryString` utility covering normal input, empty string, and malformed input that throws. Use at least four different matcher types.

---

### Lesson 6. DOM matchers from jest-dom

**Takeaway:** `@testing-library/jest-dom` adds readable assertions for visibility, attributes, form state, and accessibility — `toBeInTheDocument`, `toBeVisible`, `toHaveAttribute`, `toHaveTextContent`, `toBeDisabled`, and more.

**Explain:** These matchers express intent better than manual `expect(el).not.toBeNull()` checks:

```tsx
import { render, screen } from "@testing-library/react";
import Modal from "./Modal";

test("open modal is visible and labelled for screen readers", () => {
  render(<Modal open title="Confirm delete" onClose={() => {}} />);

  const dialog = screen.getByRole("dialog", { name: /confirm delete/i });

  expect(dialog).toBeInTheDocument();
  expect(dialog).toBeVisible();
  expect(dialog).toHaveAttribute("aria-modal", "true");
  expect(dialog).toHaveTextContent(/this action cannot be undone/i);
});

test("submit button is disabled while form is invalid", () => {
  render(<SignupForm />);
  expect(screen.getByRole("button", { name: /create account/i })).toBeDisabled();
});
```

Common matchers cheat sheet:

| Matcher | Use when |
|---------|----------|
| `toBeInTheDocument()` | Element exists in DOM (may be hidden) |
| `toBeVisible()` | Element is visible to the user |
| `toHaveTextContent()` | Text matches (substring or regex) |
| `toHaveValue()` | Input/textarea/select value |
| `toHaveClass()` | CSS class present |
| `toHaveFocus()` | Element has focus |
| `toHaveAccessibleName()` | Computed accessible name |

```tsx
expect(screen.getByLabelText(/email/i)).toHaveValue("dev@example.com");
expect(screen.getByRole("checkbox", { name: /newsletter/i })).toBeChecked();
expect(screen.getByTestId("toast")).toHaveClass("toast--success");
```

**Tip:** Prefer role + name queries combined with `toHaveAccessibleName` over `toHaveTextContent` when the visible label comes from `aria-label` or associated `<label>`.

**Try it:** Render a login form with email, password, and remember-me checkbox. Assert disabled state, checked state, and error message visibility using at least five jest-dom matchers.

---

### Lesson 7. Grouping tests with describe, beforeEach, and test isolation

**Takeaway:** Use `describe` blocks to group related scenarios. Reset mocks and DOM between tests with `beforeEach`/`afterEach`. Each test must be independent — order must not matter.

**Explain:**

```tsx
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoList from "./TodoList";

describe("TodoList", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup(); // RTL auto-cleans if using @testing-library/react v13+ with jest, but explicit is fine
  });

  describe("when list is empty", () => {
    test("shows empty state message", () => {
      render(<TodoList items={[]} />);
      expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
    });
  });

  describe("when list has items", () => {
    const items = [{ id: "1", text: "Buy milk", done: false }];

    test("renders each todo text", () => {
      render(<TodoList items={items} />);
      expect(screen.getByText("Buy milk")).toBeInTheDocument();
    });

    test("marks item complete after checkbox click", async () => {
      const onToggle = jest.fn();
      render(<TodoList items={items} onToggle={onToggle} />);

      await user.click(screen.getByRole("checkbox", { name: /buy milk/i }));

      expect(onToggle).toHaveBeenCalledWith("1");
    });
  });
});
```

Jest runs each test file in its own scope. Avoid shared mutable state:

```javascript
// ❌ Leaky shared state
let counter = 0;
test("first", () => { counter += 1; expect(counter).toBe(1); });
test("second", () => { counter += 1; expect(counter).toBe(2); }); // fails if order changes

// ✅ Local state per test
test("increments locally", () => {
  let counter = 0;
  counter += 1;
  expect(counter).toBe(1);
});
```

**Tip:** Use `describe.each` / `test.each` for table-driven tests when the same assertion applies to many inputs.

**Try it:** Convert three similar validation tests into one `test.each` table with columns `[input, expectedError]`.

---

## Mocking modules, timers & fetch

### Lesson 8. jest.mock for modules and manual mocks

**Takeaway:** `jest.mock()` replaces a module with an auto-mock or your factory. Use `__mocks__` folders for reusable mocks. Call `jest.mock()` at the top level (hoisted) before imports that depend on the mock.

**Explain:**

```typescript
// src/lib/analytics.ts
export function trackEvent(name: string, props?: Record<string, unknown>) {
  window.analytics?.track(name, props);
}

// src/components/BuyButton.test.tsx
jest.mock("@/lib/analytics", () => ({
  trackEvent: jest.fn(),
}));

import { trackEvent } from "@/lib/analytics";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BuyButton from "./BuyButton";

test("tracks purchase click", async () => {
  const user = userEvent.setup();
  render(<BuyButton sku="ABC" />);

  await user.click(screen.getByRole("button", { name: /buy now/i }));

  expect(trackEvent).toHaveBeenCalledWith("purchase_click", { sku: "ABC" });
});
```

Partial mock — keep real exports, replace one function:

```typescript
jest.mock("@/lib/api", () => ({
  ...jest.requireActual("@/lib/api"),
  fetchProduct: jest.fn(),
}));
```

Manual mock at `src/lib/__mocks__/analytics.ts` is picked up when you call `jest.mock("@/lib/analytics")` without a factory.

Spy on a method without replacing the whole module:

```typescript
import * as api from "@/lib/api";

test("retries on failure", async () => {
  const spy = jest.spyOn(api, "fetchProduct").mockRejectedValueOnce(new Error("fail"));
  // ... exercise retry logic
  spy.mockRestore();
});
```

**Tip:** Reset mock call history in `beforeEach` with `jest.clearAllMocks()` and restore spies in `afterEach` with `mockRestore()` to prevent cross-test leakage.

**Try it:** Mock a `useRouter` hook from Next.js and assert navigation after a button click. Use a factory mock that returns `{ push: jest.fn() }`.

---

### Lesson 9. Fake timers for setTimeout, setInterval, and debounce

**Takeaway:** `jest.useFakeTimers()` replaces real timers with controllable fakes. Advance time with `jest.advanceTimersByTime(ms)` or `jest.runAllTimers()`. Always restore real timers after the test.

**Explain:**

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchInput from "./SearchInput";

jest.useFakeTimers();

afterEach(() => {
  jest.clearAllTimers();
});

test("debounces search callback by 300ms", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  const onSearch = jest.fn();

  render(<SearchInput onSearch={onSearch} debounceMs={300} />);
  const input = screen.getByRole("searchbox");

  await user.type(input, "react");

  // Typing fired onChange but debounce has not elapsed
  expect(onSearch).not.toHaveBeenCalled();

  jest.advanceTimersByTime(299);
  expect(onSearch).not.toHaveBeenCalled();

  jest.advanceTimersByTime(1);
  expect(onSearch).toHaveBeenCalledTimes(1);
  expect(onSearch).toHaveBeenCalledWith("react");
});
```

For modern `@testing-library/user-event`, pass `advanceTimers` so typing and fake timers cooperate.

Async patterns with fake timers:

```javascript
jest.useFakeTimers();

test("polls until success", async () => {
  const fetchStatus = jest
    .fn()
    .mockResolvedValueOnce({ status: "pending" })
    .mockResolvedValueOnce({ status: "done" });

  const promise = pollUntilDone(fetchStatus, { intervalMs: 1000 });

  await jest.advanceTimersByTimeAsync(1000);
  await jest.advanceTimersByTimeAsync(1000);

  await expect(promise).resolves.toEqual({ status: "done" });
});
```

**Tip:** Mixing fake timers with real `fetch` often causes hangs. Either mock `fetch` or use MSW (Lessons 19–20) alongside fake timers.

**Try it:** Test a "Resend code" button that disables for 60 seconds using fake timers. Assert the button re-enables after advancing time.

---

### Lesson 10. Mocking fetch and global APIs

**Takeaway:** Stub `global.fetch` with `jest.fn()` for simple cases. For realistic HTTP behavior, prefer MSW (covered later). Mock globals like `localStorage`, `matchMedia`, and `ResizeObserver` in setup files when components depend on them.

**Explain:** Minimal fetch mock:

```typescript
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

test("shows user name after profile load", async () => {
  (fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ name: "Ada Lovelace" }),
  });

  render(<ProfilePage userId="42" />);

  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
  expect(fetch).toHaveBeenCalledWith("/api/users/42");
});
```

`localStorage` mock:

```typescript
const store: Record<string, string> = {};

beforeEach(() => {
  jest.spyOn(Storage.prototype, "getItem").mockImplementation(
    (key) => store[key] ?? null
  );
  jest.spyOn(Storage.prototype, "setItem").mockImplementation((key, value) => {
    store[key] = value;
  });
});
```

`matchMedia` (common in responsive hooks):

```typescript
// jest.setup.ts
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
});
```

**Tip:** When mocking fetch, always return a Response-shaped object (`ok`, `status`, `json()`) so production parsing code paths execute realistically.

**Try it:** Mock fetch to return 404, then assert your component shows an error alert with a retry button. Mock a successful retry on the second call.

---

## RTL philosophy & queries

### Lesson 11. The RTL query priority: role, label, text, test id

**Takeaway:** Query elements the way assistive technology and users find them. Priority order: `getByRole` → `getByLabelText` → `getByPlaceholderText` → `getByText` → `getByDisplayValue` → `getByAltText` → `getByTitle` → last resort `getByTestId`.

**Explain:** RTL exports three variants for each query:

| Prefix | Behavior |
|--------|----------|
| `getBy*` | Returns element or throws — use for assertions |
| `queryBy*` | Returns `null` if missing — use to assert absence |
| `findBy*` | Returns Promise — use for async appearance |

```tsx
import { render, screen } from "@testing-library/react";
import CheckoutForm from "./CheckoutForm";

test("accessible queries locate form controls", () => {
  render(<CheckoutForm />);

  // Best — role + accessible name
  expect(screen.getByRole("heading", { name: /checkout/i })).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: /card number/i })).toBeInTheDocument();

  // Label association (also resolves to textbox role)
  expect(screen.getByLabelText(/expiry date/i)).toBeInTheDocument();

  // Placeholder — weaker, no visible label
  expect(screen.getByPlaceholderText(/mm\/yy/i)).toBeInTheDocument();

  // Visible text
  expect(screen.getByText(/order total: \$49/i)).toBeInTheDocument();

  // Last resort — implementation hook for dynamic lists
  expect(screen.getByTestId("order-summary")).toBeInTheDocument();
});

test("assert element is not rendered", () => {
  render(<CheckoutForm showCoupon={false} />);
  expect(screen.queryByLabelText(/coupon code/i)).not.toBeInTheDocument();
});
```

Use [Testing Playground](https://testing-playground.com/) or `screen.logTestingPlaygroundURL()` after `render()` to discover recommended queries.

**Tip:** If you reach for `getByTestId` first, ask whether adding a `<label>` or `aria-label` would improve production accessibility.

**Try it:** Render a settings panel with toggle, select, and link. Locate each element using the highest-priority query possible and document why you chose it.

---

### Lesson 12. getByRole deep dive: name, hidden, and multiple matches

**Takeaway:** `getByRole(role, { name, hidden })` is the most powerful query. `name` matches accessible name (label text, `aria-label`, alt text). Use `hidden: true` only when testing off-screen or `aria-hidden` content intentionally.

**Explain:**

```tsx
<nav aria-label="Main">
  <a href="/">Home</a>
  <a href="/docs">Docs</a>
</nav>
<button aria-label="Close dialog">×</button>
<ul role="list">
  <li>Item</li>
</ul>
```

```tsx
test("roles and names", () => {
  render(<App />);

  expect(screen.getByRole("navigation", { name: /main/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute("href", "/");
  expect(screen.getByRole("button", { name: /close dialog/i })).toBeInTheDocument();
  expect(screen.getByRole("list")).toBeInTheDocument();
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
});
```

When multiple elements match, `getByRole` throws. Options:

```tsx
// Specific name
screen.getByRole("button", { name: /save draft/i });

// getAll + index (prefer narrowing by name first)
const buttons = screen.getAllByRole("button");
expect(buttons).toHaveLength(2);

// within() to scope
import { within } from "@testing-library/react";
const dialog = screen.getByRole("dialog");
expect(within(dialog).getByRole("button", { name: /confirm/i })).toBeEnabled();
```

Common roles: `button`, `link`, `textbox`, `checkbox`, `radio`, `combobox`, `dialog`, `alert`, `status`, `progressbar`, `tab`, `tabpanel`.

**Tip:** Implicit roles matter — `<button>` is `button`, `<a href>` is `link`, `<input type="checkbox">` is `checkbox`. A `<div onClick>` has no role unless you add `role="button"` and keyboard support.

**Try it:** Build a tab interface with three tabs. Use `getByRole("tab")`, `getByRole("tabpanel")`, and keyboard navigation assertions.

---

### Lesson 13. Custom renders and provider wrappers

**Takeaway:** Wrap components in shared providers (Router, Theme, Redux, QueryClient) via a custom `render` helper. Pass `wrapper` option or extend RTL's `render` once in `test-utils.tsx`.

**Explain:**

```tsx
// test-utils.tsx
import { ReactElement, ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/context/ThemeContext";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

type Props = { children: ReactNode };

function AllProviders({ children }: Props) {
  const client = createTestQueryClient();
  return (
    <QueryClientProvider client={client}>
      <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
    </QueryClientProvider>
  );
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from "@testing-library/react";
export { customRender as render };
```

Usage in tests — import `render` from `./test-utils`, not `@testing-library/react`:

```tsx
import { render, screen } from "@/test-utils";
import UserProfile from "./UserProfile";

test("loads profile with react-query", async () => {
  render(<UserProfile userId="1" />);
  expect(await screen.findByText(/ada lovelace/i)).toBeInTheDocument();
});
```

Per-test override:

```tsx
render(<Modal />, {
  wrapper: ({ children }) => <AuthProvider user={adminUser}>{children}</AuthProvider>,
});
```

**Tip:** Disable query retries in tests (`retry: false`) so failures surface immediately instead of timing out.

**Try it:** Create `test-utils.tsx` for your stack (at minimum a Router wrapper). Migrate one test file to use it.

---

### Lesson 14. Debugging failing queries and using screen.debug

**Takeaway:** When a query fails, print the DOM with `screen.debug()`, log suggested queries with `screen.logTestingPlaygroundURL()`, and check for async timing issues before weakening the query.

**Explain:**

```tsx
test("debug workflow", async () => {
  render(<Dashboard />);

  // Prints formatted DOM to console (optionally pass an element to limit output)
  screen.debug(undefined, 100000);

  // Opens Testing Playground with current DOM
  screen.logTestingPlaygroundURL();

  // Common failure: element exists but name mismatch
  // ❌ fails if accessible name is "Settings menu" not "Settings"
  // screen.getByRole("button", { name: /settings/i }); // might still pass with regex

  // Common failure: async — use findBy
  const heading = await screen.findByRole("heading", { name: /dashboard/i });
  expect(heading).toBeVisible();
});
```

Typical error messages:

- **Unable to find role** — wrong role, missing accessible name, or element not rendered yet.
- **Found multiple elements** — narrow with `name`, `within`, or `getAllBy`.
- **Not wrapped in act(...)** — state update after async; use `waitFor` or `findBy`.

```tsx
import { waitFor } from "@testing-library/react";

await waitFor(() => {
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

**Tip:** Pass a max length to `debug()` — large DOM dumps slow CI logs. Debug one subtree: `screen.debug(within(container).getByRole("form"))`.

**Try it:** Intentionally break a query (wrong role). Read the error, fix using `debug()` output, and document what misled you.

---

## user-event

### Lesson 15. userEvent.setup() and realistic interactions

**Takeaway:** `@testing-library/user-event` simulates pointer, keyboard, and clipboard behavior more faithfully than `fireEvent`. Always call `const user = userEvent.setup()` and `await user.click()` / `await user.type()` — events are async.

**Explain:**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommentBox from "./CommentBox";

test("submits comment on Enter with meta key", async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();

  render(<CommentBox onSubmit={onSubmit} />);
  const field = screen.getByRole("textbox", { name: /comment/i });

  await user.type(field, "Great post!");
  await user.keyboard("{Meta>}{Enter}{/Meta}");

  expect(onSubmit).toHaveBeenCalledWith("Great post!");
});

test("selects option from dropdown", async () => {
  const user = userEvent.setup();
  render(<CountrySelect />);

  await user.selectOptions(
    screen.getByRole("combobox", { name: /country/i }),
    "IN"
  );

  expect(screen.getByRole("combobox")).toHaveValue("IN");
});

test("uploads file", async () => {
  const user = userEvent.setup();
  const file = new File(["hello"], "hello.png", { type: "image/png" });

  render(<AvatarUpload />);
  const input = screen.getByLabelText(/upload avatar/i);

  await user.upload(input, file);

  expect(await screen.findByAltText(/preview/i)).toBeInTheDocument();
});
```

`fireEvent` vs `userEvent`:

```tsx
import { fireEvent } from "@testing-library/react";

// fireEvent — dispatches single synthetic event (low-level escape hatch)
fireEvent.change(input, { target: { value: "x" } });

// userEvent — full interaction sequence (focus, keydown, input, keyup, blur)
await user.type(input, "x");
```

**Tip:** Default to `userEvent`. Reach for `fireEvent` only when simulating unsupported edge cases or third-party libraries that bypass normal input events.

**Try it:** Test a password field with show/hide toggle using `user.click`, and assert `type` switches between `password` and `text`.

---

### Lesson 16. Keyboard navigation, pointer hover, and special keys

**Takeaway:** user-event supports `tab`, `keyboard`, `hover`, and `pointer` APIs for accessibility-critical flows — modals, menus, comboboxes, and trap focus behavior.

**Explain:**

```tsx
test("modal traps focus and closes on Escape", async () => {
  const user = userEvent.setup();
  const onClose = jest.fn();

  render(<ConfirmModal open onClose={onClose} />);

  const cancel = screen.getByRole("button", { name: /cancel/i });
  const confirm = screen.getByRole("button", { name: /confirm/i });

  expect(cancel).toHaveFocus();

  await user.tab();
  expect(confirm).toHaveFocus();

  await user.tab();
  expect(cancel).toHaveFocus(); // focus trapped

  await user.keyboard("{Escape}");
  expect(onClose).toHaveBeenCalledTimes(1);
});

test("opens submenu on hover when configured", async () => {
  const user = userEvent.setup();
  render(<NavMenu />);

  const products = screen.getByRole("button", { name: /products/i });
  await user.hover(products);

  expect(await screen.findByRole("menu")).toBeVisible();
  expect(screen.getByRole("menuitem", { name: /widgets/i })).toBeInTheDocument();
});

test("clears input with ctrl+a and backspace", async () => {
  const user = userEvent.setup();
  render(<SearchBar defaultValue="old query" />);

  const input = screen.getByRole("searchbox");
  await user.click(input);
  await user.keyboard("{Control>}a{/Control}{Backspace}");

  expect(input).toHaveValue("");
});
```

Special character syntax reference:

```tsx
await user.keyboard("{Shift>}{Tab}{/Shift}"); // Shift+Tab
await user.keyboard("[ArrowDown][ArrowDown][Enter]");
await user.clear(input); // dedicated clear helper
```

**Tip:** For components using `@headlessui/react` or Radix, combine role queries with realistic keyboard sequences — these libraries often bind to `keydown`, not `click` alone.

**Try it:** Test a combobox: type to filter, arrow down to highlight, Enter to select. Assert the input shows the chosen value.

---

## Async & waitFor

### Lesson 17. findBy queries and waiting for elements

**Takeaway:** Use `findBy*` (alias for `waitFor` + `getBy*`) when elements appear after fetch, animation, or state transition. Default timeout is 1000ms; extend with `{ timeout: 3000 }` for slow operations.

**Explain:**

```tsx
import { render, screen } from "@testing-library/react";
import PostsList from "./PostsList";

test("renders posts after fetch resolves", async () => {
  render(<PostsList />);

  // Loading state — synchronous
  expect(screen.getByRole("status")).toHaveTextContent(/loading/i);

  // Async appearance — MUST await findBy
  expect(await screen.findByRole("heading", { name: /posts/i })).toBeInTheDocument();
  expect(screen.getByText(/first post title/i)).toBeInTheDocument();

  // Loading gone
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

`findBy` vs manual `waitFor`:

```tsx
// Equivalent patterns
const el = await screen.findByText(/saved/i);
await waitFor(() => expect(screen.getByText(/saved/i)).toBeInTheDocument());

// waitFor when asserting non-existence after delay
await waitFor(() => {
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
```

Multiple async elements:

```tsx
const [title, author] = await Promise.all([
  screen.findByRole("heading", { level: 1 }),
  screen.findByText(/by/i),
]);
```

**Tip:** If `findBy` times out, the element never appeared or your mock never resolved — check network mocks before increasing timeout.

**Try it:** Render a component that fetches data on mount. Mock a 500ms delay and assert loading → success transition with `findBy`.

---

### Lesson 18. waitFor, waitForElementToBeRemoved, and act warnings

**Takeaway:** `waitFor` retries a callback until it passes or times out — use for complex multi-assertion async conditions. `waitForElementToBeRemoved` waits for spinners and toasts to leave. Fix `act` warnings by awaiting RTL async APIs instead of raw state updates.

**Explain:**

```tsx
import { render, screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SaveButton from "./SaveButton";

test("shows saving state then success toast", async () => {
  const user = userEvent.setup();
  render(<SaveButton />);

  await user.click(screen.getByRole("button", { name: /save/i }));

  expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();

  await waitFor(() => {
    expect(screen.getByRole("button", { name: /save/i })).toBeEnabled();
    expect(screen.getByRole("status")).toHaveTextContent(/saved successfully/i);
  });
});

test("spinner removed after load", async () => {
  render(<SlowChart />);

  const spinner = screen.getByRole("progressbar");
  await waitForElementToBeRemoved(spinner);

  expect(screen.getByRole("img", { name: /chart/i })).toBeVisible();
});
```

Custom `waitFor` options:

```tsx
await waitFor(
  () => expect(mockFn).toHaveBeenCalledWith({ id: 1 }),
  { timeout: 2000, interval: 50 }
);
```

`act` warning usually means:

```tsx
// ❌ state update outside RTL await
setTimeout(() => setOpen(true), 0);
expect(screen.getByRole("dialog")).toBeInTheDocument(); // act warning

// ✅ await findBy or waitFor
expect(await screen.findByRole("dialog")).toBeInTheDocument();
```

**Tip:** One `waitFor` should assert one logical outcome. Multiple unrelated waits in one test often indicate the test is doing too much — split it.

**Try it:** Test a delete flow: click delete → confirm dialog → API call → item removed from list and toast disappears. Use both `waitFor` and `waitForElementToBeRemoved`.

---

## MSW integration

### Lesson 19. MSW setup: handlers, server, and test lifecycle

**Takeaway:** Mock Service Worker intercepts HTTP at the network layer with realistic request/response cycles. Define handlers in `mocks/handlers.ts`, start `setupServer` in Node tests, and reset handlers between tests.

**Explain:**

```bash
npm install -D msw
npx msw init public/ --save
```

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/users/:id", ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: "Grace Hopper",
    });
  }),

  http.post("/api/users", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: "99", ...body }, { status: 201 });
  }),
];
```

```typescript
// mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

```typescript
// jest.setup.ts
import { server } from "./mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Test usage — no fetch mock needed:

```tsx
import { render, screen } from "@testing-library/react";
import UserCard from "./UserCard";

test("displays user from API", async () => {
  render(<UserCard userId="7" />);
  expect(await screen.findByText("Grace Hopper")).toBeInTheDocument();
});
```

**Tip:** Set `onUnhandledRequest: "error"` during development to catch missing handlers. Use `"warn"` temporarily when migrating a large suite.

**Try it:** Add MSW to a project, define GET `/api/todos`, and render a list component that consumes it without mocking `fetch` directly.

---

### Lesson 20. MSW overrides: per-test handlers, errors, and delays

**Takeaway:** Override global handlers with `server.use()` inside a test to simulate errors, empty lists, or slow responses. Compose realistic edge cases without duplicating fetch mocks.

**Explain:**

```tsx
import { http, HttpResponse, delay } from "msw";
import { server } from "@/mocks/server";

test("shows empty state when API returns no todos", async () => {
  server.use(
    http.get("/api/todos", () => HttpResponse.json([]))
  );

  render(<TodoPage />);
  expect(await screen.findByText(/no todos yet/i)).toBeInTheDocument();
});

test("shows error banner on 500", async () => {
  server.use(
    http.get("/api/todos", () =>
      HttpResponse.json({ message: "Server error" }, { status: 500 })
    )
  );

  render(<TodoPage />);
  expect(await screen.findByRole("alert")).toHaveTextContent(/something went wrong/i);
});

test("shows loading skeleton until delayed response", async () => {
  server.use(
    http.get("/api/todos", async () => {
      await delay(500);
      return HttpResponse.json([{ id: "1", text: "Late todo" }]);
    })
  );

  render(<TodoPage />);
  expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  expect(await screen.findByText("Late todo")).toBeInTheDocument();
});
```

GraphQL with MSW:

```typescript
import { graphql, HttpResponse } from "msw";

server.use(
  graphql.query("GetUser", () => {
    return HttpResponse.json({
      data: { user: { id: "1", name: "Test User" } },
    });
  })
);
```

**Tip:** Keep happy-path handlers in `handlers.ts` and override only the deviation in each test — readers see defaults vs scenario at a glance.

**Try it:** Write three tests for the same page: success list, empty list, and 401 unauthorized redirect — each using `server.use()`.

---

## Testing hooks & forms

### Lesson 21. Testing custom hooks with renderHook

**Takeaway:** `@testing-library/react`'s `renderHook` runs hooks inside a test component. Use `result.current` for values and `act()` or `await act()` when triggering updates. Wrap with providers via `wrapper` option.

**Explain:**

```tsx
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCounter } from "./useCounter";

test("increments counter", () => {
  const { result } = renderHook(() => useCounter(0));

  expect(result.current.count).toBe(0);

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
```

Hook with async side effect:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUser } from "./useUser";

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

test("useUser returns data", async () => {
  const { result } = renderHook(() => useUser("1"), { wrapper: createWrapper() });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.name).toBe("Grace Hopper");
});
```

Testing hook that depends on router:

```tsx
import { MemoryRouter } from "react-router-dom";
import { useQueryParam } from "./useQueryParam";

test("reads tab query param", () => {
  const { result } = renderHook(() => useQueryParam("tab"), {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={["/?tab=settings"]}>{children}</MemoryRouter>
    ),
  });

  expect(result.current).toBe("settings");
});
```

**Tip:** If a hook is hard to test in isolation, extract pure logic into functions and unit-test those — keep `renderHook` for wiring and effects.

**Try it:** Test a `useDebouncedValue` hook: update input value, advance fake timers, assert debounced output changes once.

---

### Lesson 22. Form testing: validation, submission, and error messages

**Takeaway:** Interact with forms through labels and roles. Assert validation messages via `role="alert"` or live regions. Verify submit handlers receive correct payloads and buttons disable during pending state.

**Explain:**

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupForm from "./SignupForm";

test("client validation prevents submit with weak password", async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();

  render(<SignupForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText(/email/i), "dev@example.com");
  await user.type(screen.getByLabelText(/^password$/i), "123");
  await user.click(screen.getByRole("button", { name: /sign up/i }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    /password must be at least 8 characters/i
  );
  expect(onSubmit).not.toHaveBeenCalled();
});

test("successful submit sends normalized payload", async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn().mockResolvedValue(undefined);

  render(<SignupForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText(/email/i), "  Dev@Example.COM  ");
  await user.type(screen.getByLabelText(/^password$/i), "securepass1");
  await user.click(screen.getByRole("checkbox", { name: /terms/i }));
  await user.click(screen.getByRole("button", { name: /sign up/i }));

  await waitFor(() =>
    expect(onSubmit).toHaveBeenCalledWith({
      email: "dev@example.com",
      password: "securepass1",
      acceptedTerms: true,
    })
  );
});

test("submit button disabled while request pending", async () => {
  const user = userEvent.setup();
  let resolveSubmit!: () => void;
  const onSubmit = jest.fn(
    () => new Promise<void>((r) => { resolveSubmit = r; })
  );

  render(<SignupForm onSubmit={onSubmit} />);
  await user.type(screen.getByLabelText(/email/i), "a@b.com");
  await user.type(screen.getByLabelText(/^password$/i), "longenough");
  await user.click(screen.getByRole("button", { name: /sign up/i }));

  expect(screen.getByRole("button", { name: /creating account/i })).toBeDisabled();

  resolveSubmit();
  await waitFor(() =>
    expect(screen.getByRole("button", { name: /sign up/i })).toBeEnabled()
  );
});
```

Server-side field errors:

```tsx
server.use(
  http.post("/api/signup", () =>
    HttpResponse.json({ fieldErrors: { email: "Already registered" } }, { status: 422 })
  )
);

// assert inline error linked to input
expect(screen.getByLabelText(/email/i)).toHaveAccessibleDescription(/already registered/i);
```

**Tip:** Use `/^password$/i` regex anchors when both "Password" and "Confirm password" labels exist — avoids ambiguous matches.

**Try it:** Test a multi-step form (step 1 → Next → step 2 → Submit). Assert you cannot advance with invalid fields and final payload is correct.

---

## Next.js component & route testing

### Lesson 23. Testing Next.js client components, Link, and useRouter

**Takeaway:** Test client components with standard RTL. Mock `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`) and wrap with `MemoryRouter` only when not using App Router mocks. Test `next/link` behavior via accessible links, not implementation.

**Explain:**

```tsx
// __mocks__/next/navigation.ts (manual mock)
export const useRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
}));

export const usePathname = jest.fn(() => "/");
export const useSearchParams = jest.fn(() => new URLSearchParams());
```

```tsx
import { useRouter } from "next/navigation";
import { render, screen } from "@/test-utils";
import userEvent from "@testing-library/user-event";
import ProductLink from "./ProductLink";

jest.mock("next/navigation");

test("navigates to product detail on click", async () => {
  const push = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push });

  const user = userEvent.setup();
  render(<ProductLink slug="wireless-mouse" />);

  const link = screen.getByRole("link", { name: /wireless mouse/i });
  expect(link).toHaveAttribute("href", "/products/wireless-mouse");

  await user.click(link);
  expect(push).toHaveBeenCalledWith("/products/wireless-mouse");
});
```

Components using `next/image` — mock in Jest:

```javascript
// jest.setup.ts
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));
```

Server Components that fetch data are often tested indirectly via integration/E2E; extract data logic into testable functions or test the client boundary component that receives props.

**Tip:** Colocate `__mocks__/next/navigation.ts` so `jest.mock("next/navigation")` picks it up automatically without a factory in every file.

**Try it:** Mock `useSearchParams` to return `?q=jest`, render a search results header, and assert it displays the query term.

---

### Lesson 24. Testing Server Actions, route handlers, and async RSC boundaries

**Takeaway:** Unit-test Server Actions and route handlers as async functions with mocked `cookies`, `headers`, and database layers. For UI that invokes Server Actions, assert pending UI and revalidation outcomes on the client wrapper.

**Explain:** Server Action as a plain function test:

```typescript
// app/actions/createTodo.test.ts
import { createTodo } from "./createTodo";
import { db } from "@/lib/db";

jest.mock("@/lib/db", () => ({
  db: { todo: { create: jest.fn() } },
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

import { revalidatePath } from "next/cache";

test("createTodo inserts and revalidates list path", async () => {
  (db.todo.create as jest.Mock).mockResolvedValue({ id: "1", text: "Buy milk" });

  const formData = new FormData();
  formData.set("text", "Buy milk");

  await createTodo(formData);

  expect(db.todo.create).toHaveBeenCalledWith({ data: { text: "Buy milk" } });
  expect(revalidatePath).toHaveBeenCalledWith("/todos");
});
```

Route handler test:

```typescript
// app/api/health/route.test.ts
import { GET } from "./route";

test("GET /api/health returns ok", async () => {
  const response = await GET();
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body).toEqual({ status: "ok" });
});
```

Client form calling a Server Action:

```tsx
"use client";
// TodoForm.test.tsx — mock the action module
jest.mock("@/app/actions/createTodo", () => ({
  createTodo: jest.fn(),
}));

import { createTodo } from "@/app/actions/createTodo";

test("shows optimistic item then refreshes list", async () => {
  const user = userEvent.setup();
  (createTodo as jest.Mock).mockImplementation(
    () => new Promise((r) => setTimeout(r, 100))
  );

  render(<TodoForm />);
  await user.type(screen.getByRole("textbox"), "New task");
  await user.click(screen.getByRole("button", { name: /add/i }));

  expect(screen.getByText("New task")).toBeInTheDocument(); // optimistic UI
  await waitFor(() => expect(createTodo).toHaveBeenCalled());
});
```

**Tip:** Keep Server Actions thin — validate input, call service layer, revalidate. Test business rules in the service layer with fast unit tests.

**Try it:** Write a route handler test for POST with invalid JSON (400) and valid body (201). Mock only the persistence layer.

---

## CI habits

### Lesson 25. Coverage thresholds, test splitting, and flake prevention

**Takeaway:** Enforce sensible coverage floors (not 100% worship), shard tests in CI for speed, isolate flaky async tests with proper waits, and never retry failing tests without fixing root cause.

**Explain:** Coverage config in Jest:

```typescript
// jest.config.ts excerpt
const config: Config = {
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.stories.{ts,tsx}",
    "!src/**/index.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
    "./src/lib/": {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
```

CI sharding (GitHub Actions example):

```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npm test -- --shard=${{ matrix.shard }}/4 --ci --coverage
```

Flake prevention checklist:

```typescript
// ✅ deterministic
beforeEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
  server.resetHandlers();
});

// ✅ await async UI
await screen.findByRole("button", { name: /done/i });

// ❌ arbitrary sleep
await new Promise((r) => setTimeout(r, 500));

// ❌ testing exact fetch call order across microtasks without waitFor
expect(mockA).toHaveBeenCalledBefore(mockB); // fragile
```

Quarantine policy: mark flaky tests with issue link, fix within sprint, or delete if low value. `--onlyFailures` locally speeds up fix loops.

**Tip:** Track duration per file (`jest --verbose` or CI reporters). Split files that exceed 30 seconds — often MSW setup or missing mock cleanup.

**Try it:** Add `coverageThreshold` for one critical folder. Identify your slowest test file and reduce runtime by at least 50% using fake timers or slimmer MSW handlers.

---

### Lesson 26. Pre-commit hooks, watch mode workflow, and debugging CI failures

**Takeaway:** Run related tests on save in watch mode locally; use lint-staged to run Jest only on changed files pre-commit; reproduce CI failures with `--ci --runInBand` and frozen lockfile installs.

**Explain:** Watch mode productivity:

```bash
# Run tests related to changed files
npm test -- --watch

# Filter by filename pattern
npm test -- TodoList

# Update snapshots intentionally
npm test -- -u FeatureCard
```

lint-staged + husky:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "jest --bail --findRelatedTests --passWithNoTests"
    ]
  }
}
```

Reproduce CI locally:

```bash
# CI often sets CI=true (Jest: no watch, fail on deprecated APIs)
CI=true npm test -- --ci --runInBand --coverage

# Match Node version
nvm use 20
npm ci
```

Debugging CI-only failures:

1. **Timezone/locale** — set `TZ=UTC` in CI and locally.
2. **Parallel race** — try `--runInBand` to expose shared state bugs.
3. **Unhandled MSW requests** — CI stricter logging reveals missing handlers.
4. **Snapshot drift** — OS-specific line endings; normalize with `.gitattributes`.

```typescript
// package.json scripts
{
  "test:ci": "jest --ci --coverage --runInBand",
  "test:changed": "jest --bail --findRelatedTests"
}
```

Document team conventions in `CONTRIBUTING.md`: naming, where mocks live, MSW handler rules, minimum bar before merge.

**Tip:** When CI fails only on coverage, diff the coverage report HTML — often a new file with zero tests tipped global thresholds. Add targeted tests instead of lowering bars.

**Try it:** Configure a `test:ci` script, run it locally, and write a three-item checklist your team would follow when a PR test job fails on GitHub Actions.

---
