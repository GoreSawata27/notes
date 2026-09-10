# TypeScript Learning Notes

A progressive, hands-on guide to TypeScript — from how types relate to JavaScript through structural typing, generics, tooling, React TSX patterns, runtime validation, and Next.js App Router typing. Each lesson builds on the last. Read the takeaway first, study the explanation and code, then try the exercise in a small `.ts` file, a Vite + React + TS project, or a Next.js app.

---

## Fundamentals

### Lesson 1. TypeScript vs JavaScript: what you gain and what stays the same

**Takeaway:** TypeScript is a typed superset of JavaScript. All valid JS is valid TS at the syntax level, but TS adds a static type layer that is erased at compile time — your runtime is still JavaScript.

**Explain:** JavaScript is dynamically typed: a variable's type is determined when code runs. TypeScript adds **static types** checked before execution. The compiler (`tsc`) or your bundler (Vite, esbuild, SWC) strips type annotations and outputs plain `.js`. You get earlier feedback in the editor, safer refactors, and self-documenting APIs — without changing how the engine executes your logic.

```ts
// JavaScript — no compile-time safety
function greet(name) {
  return "Hello, " + name.toUpperCase();
}
greet(42); // Runtime error: name.toUpperCase is not a function

// TypeScript — same runtime, caught at compile time
function greetSafe(name: string): string {
  return `Hello, ${name.toUpperCase()}`;
}
// greetSafe(42); // Error: Argument of type 'number' is not assignable to parameter of type 'string'
```

TS does **not** make JS faster by itself. It prevents entire classes of bugs (wrong argument types, typos on object keys, null access) before users hit them. You can adopt TS incrementally: rename `.js` to `.ts`, fix errors file by file, or use `// @ts-check` in JSDoc-typed JS.

**Tip:** Treat types as documentation that the compiler enforces. When a function signature says `(userId: string) => Promise<User>`, callers know exactly what to pass and what to expect back.

**Try it:** Create a `math.ts` file with a function that adds two numbers. Intentionally pass a string and observe the red squiggle. Fix the call site, run `tsc math.ts` (or your bundler's typecheck script), and confirm zero errors.

---

### Lesson 2. The compile model: `.ts`, `.tsx`, emit, and type-only imports

**Takeaway:** TypeScript compiles to JavaScript via `tsc` or a bundler pipeline. `.tsx` files allow JSX. Types exist only at compile time — use `import type` when you only need types so bundlers can erase them cleanly.

**Explain:** A typical workflow: you write `.ts`/`.tsx`, a tool type-checks, then emits `.js` (or your bundler bundles directly from TS source). **Declaration files** (`.d.ts`) describe types for JS libraries without source. **Type-only imports** never appear in output:

```ts
// values.ts
export const API_URL = "https://api.example.com";
export type User = { id: string; name: string };

// app.ts
import { API_URL, type User } from "./values";

const user: User = { id: "1", name: "Ada" };
console.log(API_URL, user.name);
// Emitted JS: import { API_URL } from "./values"; — User import erased
```

The compiler performs **structural** checking (Lesson 5) on every assignment and call. **Strict mode** (Lesson 13) tightens rules globally. Editor integration (VS Code, Cursor) uses the same language service as `tsc`, so squiggles match CI.

**Tip:** Run `tsc --noEmit` in CI (Lesson 14) to type-check without writing files. Pair it with your test runner so types and behavior both gate merges.

**Try it:** Add a `tsconfig.json` with `"compilerOptions": { "target": "ES2022", "module": "ESNext", "strict": true }`. Compile a small module with a type-only import and inspect the emitted `.js` to confirm types disappeared.

---

### Lesson 3. Primitives, literals, and everyday type annotations

**Takeaway:** Start with explicit annotations on function boundaries; let TypeScript infer locals. Use literal types when a value must be one specific string or number, not any string or number.

**Explain:** Core primitives mirror JavaScript: `string`, `number`, `boolean`, `bigint`, `symbol`, plus `null` and `undefined`. Arrays: `string[]` or `Array<string>`. Tuples fix length and position: `[string, number]`.

```ts
let count = 0; // inferred: number
const label = "draft"; // inferred: "draft" (literal), not string

function formatPrice(amount: number, currency: "USD" | "EUR"): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
}

type Status = "idle" | "loading" | "success" | "error"; // union of literals

function setStatus(s: Status) {
  console.log(s);
}
// setStatus("pending"); // Error — not in the union
```

**Object types** inline or via `interface`/`type` (Lesson 5–6). **`readonly`** prevents reassignment of properties. **`as const`** on objects/arrays freezes literals for inference:

```ts
const config = { theme: "dark", retries: 3 } as const;
// config.theme is "dark", not string; config.retries is 3, not number
```

**Tip:** Annotate public API surfaces (exports, hook return types, server action params). Let inference handle temporary variables inside function bodies — over-annotating adds noise without safety.

**Try it:** Model a `Priority` type as `"low" | "medium" | "high"`. Write `badgeColor(p: Priority): string` with a exhaustive `switch`. Add a new priority without updating the switch and see TS flag the missing case when you enable `noImplicitReturns` / exhaustive checks.

---

### Lesson 4. `any`, `unknown`, and `never`: escape hatches and safe boundaries

**Takeaway:** Avoid `any` — it disables checking. Prefer `unknown` for untrusted values and narrow before use. Use `never` for values that cannot exist and for exhaustive control flow.

**Explain:** **`any`** is an off switch: assign anything to it, call anything on it, return it anywhere. It infects surrounding code through assignment.

```ts
let data: any = fetchSomething();
data.foo.bar(); // No error — but may crash at runtime
```

**`unknown`** is the type-safe top type: you must narrow before operating.

```ts
function parseJson(raw: string): unknown {
  return JSON.parse(raw);
}

const value = parseJson('{"id":1}');
// value.id; // Error — 'value' is of type 'unknown'

if (typeof value === "object" && value !== null && "id" in value) {
  const id = (value as { id: number }).id;
  console.log(id);
}
```

**`never`** means no value. Functions that always throw or infinite-loop return `never`. In `switch`, assigning to `never` catches unhandled cases:

```ts
type Shape = { kind: "circle"; r: number } | { kind: "square"; side: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.r ** 2;
    case "square":
      return s.side ** 2;
    default:
      const _exhaustive: never = s;
      return _exhaustive;
  }
}
```

**Tip:** When migrating JS, use `unknown` at module boundaries (JSON, `window`, third-party callbacks) instead of `any`. Reach for `any` only as a temporary bridge with a `// TODO: type this` comment.

**Try it:** Write `function assertIsString(x: unknown): asserts x is string` and use it after `parseJson`. Refactor a function returning `any` to return `unknown` and fix all call sites with proper guards.

---

## Structural typing

### Lesson 5. Interfaces: describing object shapes and extending them

**Takeaway:** TypeScript uses **structural typing**: if an object has the required properties with compatible types, it matches — regardless of nominal names. Interfaces describe object shapes and can be extended or merged.

**Explain:** An interface lists required and optional properties, readonly fields, and call signatures:

```ts
interface User {
  readonly id: string;
  name: string;
  email?: string;
}

interface Admin extends User {
  role: "admin";
  permissions: string[];
}

function displayName(u: User): string {
  return u.name;
}

const admin: Admin = {
  id: "a1",
  name: "Sam",
  role: "admin",
  permissions: ["users:write"],
};

displayName(admin); // OK — Admin is structurally a User
```

**Declaration merging** lets you augment interfaces (common in library typings):

```ts
interface Window {
  myAppVersion?: string;
}
```

Interfaces excel at object-oriented extension chains and React component props. They cannot express every union trick (Lesson 6), but for public object contracts they read clearly.

**Tip:** Prefer `interface` for object shapes you might extend (component props, entity models). Use `implements` in classes to enforce a contract at compile time.

**Try it:** Define `BaseEntity { id: string; createdAt: Date }`, extend it with `Post { title: string; body: string }`, and write `function summarize(post: Post): string`. Pass a plain object literal and confirm structural assignability works without `new`.

---

### Lesson 6. Type aliases: unions, intersections, and when to pick `type` over `interface`

**Takeaway:** `type` aliases can name primitives, unions, intersections, tuples, and mapped types. Use `type` for unions and computed shapes; use `interface` for extendable object contracts.

**Explain:** Type aliases create a name for any type expression:

```ts
type ID = string | number;
type Point = { x: number; y: number };
type Vector = Point & { z: number }; // intersection: all of Point + z

type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };
```

**Intersections** combine types — properties must satisfy all members. Conflicting property types intersect to `never` unless one is a subtype:

```ts
type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged;

const p: Person = { name: "Lee", age: 30 };
```

**Unions** express "one of" — critical for UI state (Lesson 22):

```ts
type Theme = "light" | "dark";
type Config = { theme: Theme } | { theme: Theme; highContrast: true };
```

You cannot merge type aliases, but you can compose them with utilities (Lesson 11–12). For function types, both work: `type Handler = (e: Event) => void` vs `interface Handler { (e: Event): void }`.

**Tip:** If you need a discriminant field (`kind`, `status`, `type`), a **type alias union** is usually clearer than a class hierarchy.

**Try it:** Model an API response as `Success<T>` | `Failure` with a shared discriminant `status: "ok" | "error"`. Write a function that returns different shapes and a consumer that branches on `status`.

---

### Lesson 7. Unions, intersections, and optional chaining in practice

**Takeaway:** Unions represent alternatives; intersections combine requirements. Use optional chaining (`?.`) and nullish coalescing (`??`) with strict null checks for safe access without sacrificing type precision.

**Explain:** Narrowing (Lesson 8) unlocks unions. Until then, only **common** properties are accessible:

```ts
type Cat = { kind: "cat"; meow: () => void };
type Dog = { kind: "dog"; bark: () => void };
type Pet = Cat | Dog;

function describe(pet: Pet): string {
  if (pet.kind === "cat") {
    pet.meow();
    return "cat";
  }
  pet.bark();
  return "dog";
}
```

Intersections stack modifiers — useful with utility types:

```ts
type Timestamped = { createdAt: Date; updatedAt: Date };
type Post = { title: string; body: string } & Timestamped;
```

With **`strictNullChecks`**, `undefined` and `null` are not assignable unless the type allows them:

```ts
interface Profile {
  avatarUrl?: string; // string | undefined
}

function avatar(p: Profile): string {
  return p.avatarUrl ?? "/default.png";
}

// Optional chaining short-circuits on null/undefined
const len = p.avatarUrl?.length; // number | undefined
```

**Tip:** Avoid `| null` everywhere — model "missing" with optional properties or explicit `Option<T>` unions when absence carries meaning.

**Try it:** Build a `Contact` type with optional `phone` and `email`. Write `getPrimaryReach(c: Contact): string` using `??` and ensure TS errors if you access `.trim()` without narrowing.

---

### Lesson 8. Narrowing: typeof, in, instanceof, and discriminated unions

**Takeaway:** **Type narrowing** refines a union to a specific member through control-flow analysis. Discriminated unions (shared literal field) give the best ergonomics for branching logic.

**Explain:** Common narrowing guards:

```ts
function pad(value: string | number): string {
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  return value.padStart(8, " ");
}

function move(pet: Cat | Dog) {
  if ("meow" in pet) {
    pet.meow();
  } else {
    pet.bark();
  }
}

if (err instanceof Error) {
  console.error(err.message);
}
```

**User-defined type predicates** document narrowing:

```ts
function isCat(pet: Pet): pet is Cat {
  return pet.kind === "cat";
}
```

**Discriminated unions** pair a literal `kind`/`type`/`status` with unique payloads:

```ts
type RemoteData<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

function render<T>(state: RemoteData<T>): string {
  switch (state.status) {
    case "idle":
      return "Start";
    case "loading":
      return "…";
    case "success":
      return String(state.data); // `data` exists here
    case "error":
      return state.message;
  }
}
```

**Tip:** When a `switch` on a discriminant stops narrowing, add `default: const _x: never = x` to force compile errors when you add a new variant.

**Try it:** Refactor a component prop `state: "loading" | "ready"` plus separate optional `data` into a discriminated union. Confirm TS prevents reading `data` when `status` is `"loading"`.

---

## Generics & utilities

### Lesson 9. Generic functions and components: parameters for types

**Takeaway:** Generics let you write reusable code that preserves type relationships — `identity<string>(x)` returns `string`, not a widened `unknown` or `any`.

**Explain:** Declare type parameters in angle brackets:

```ts
function identity<T>(value: T): T {
  return value;
}

const a = identity("hello"); // string
const b = identity(42); // number

function first<T>(items: T[]): T | undefined {
  return items[0];
}

const head = first([1, 2, 3]); // number | undefined
```

Multiple parameters relate types:

```ts
function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}

function mapValues<T, U>(obj: Record<string, T>, fn: (v: T) => U): Record<string, U> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v)]));
}
```

Defaults and inference from arguments reduce noise:

```ts
function createStore<TState extends object = { count: number }>(initial: TState) {
  let state = initial;
  return {
    get: () => state,
    set: (next: TState) => {
      state = next;
    },
  };
}
```

**Tip:** If you find yourself writing `as` casts inside a generic function, add constraints (Lesson 10) or rethink the type parameter bounds.

**Try it:** Implement `pluck<T, K extends keyof T>(items: T[], key: K): T[K][]`. Call it on an array of `{ id: number; name: string }` with `"name"` and confirm the return type is `string[]`.

---

### Lesson 10. Generic constraints: `extends`, keyof, and typed object keys

**Takeaway:** Constrain generics with `extends` so only valid type arguments compile. Combine `keyof T` with indexed access `T[K]` for type-safe property reads and updates.

**Explain:** Constraints limit what can be substituted:

```ts
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

longest("hi", "hello"); // OK — strings have length
// longest(1, 2); // Error — number has no .length
```

**`keyof`** produces a union of keys; indexed access reads property types:

```ts
interface Product {
  id: string;
  price: number;
  title: string;
}

function getField<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const price = getField({ id: "1", price: 9.99, title: "Mug" }, "price"); // number
```

Constraints enable safe mutations:

```ts
function updateField<T, K extends keyof T>(obj: T, key: K, value: T[K]): T {
  return { ...obj, [key]: value };
}
```

For React, constraints power generic list components (Lesson 21). For APIs, they ensure record keys align with value types (Lesson 11).

**Tip:** When a generic "doesn't infer well," pass explicit type arguments at the call site: `fetchJson<User>("/api/me")`.

**Try it:** Write `groupBy<T, K extends keyof T>(items: T[], key: K): Record<string, T[]>` with a constraint that `T[K]` is `string | number | boolean` (use `extends string | number | boolean` on a second type param if needed).

---

### Lesson 11. Utility types: Partial, Pick, Omit, and Record

**Takeaway:** Built-in utility types transform existing types without duplication. They are the vocabulary for PATCH endpoints, form drafts, DTOs, and config slices.

**Explain:** Common utilities:

```ts
interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

type UserPatch = Partial<User>; // all optional — PATCH body
type UserPublic = Pick<User, "id" | "name">; // subset for API responses
type UserCreate = Omit<User, "id">; // everything except id
type RoleMap = Record<User["role"], string>; // { user: string; admin: string }
```

**`Required<T>`** makes optional properties required. **`Readonly<T>`** freezes properties. **`Exclude` / `Extract`** filter union members:

```ts
type AdminOnly = Extract<User["role"], "admin">; // "admin"
type NonAdmin = Exclude<User["role"], "admin">; // "user"
```

Compose utilities for real patterns:

```ts
type UpdateUser = Partial<Omit<User, "id">> & Pick<User, "id">;
// must include id; other fields optional
```

**Tip:** Reach for utilities before copying interface fields manually — when `User` changes, derived types update automatically.

**Try it:** From a `Article` interface, derive `ArticlePreview` (title + slug only), `ArticleForm` (no id/timestamps, all optional for drafts), and `ArticlesByStatus: Record<Status, Article[]>`.

---

### Lesson 12. Mapped types and template literal types

**Takeaway:** Mapped types iterate keys to produce new object types. Template literal types build string unions for event names, CSS keys, and route paths.

**Explain:** A mapped type remaps each property:

```ts
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type Nullable<T> = { [K in keyof T]: T[K] | null };

type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface User {
  name: string;
  age: number;
}
// Getters<User>: { getName: () => string; getAge: () => number }
```

**Key remapping** with `as` filters or renames keys. **`satisfies`** (Lesson 25) pairs well with mapped results.

Template literal types:

```ts
type EventName = "click" | "focus" | "blur";
type HandlerName = `on${Capitalize<EventName>}`; // "onClick" | "onFocus" | "onBlur"

type Route = `/users/${string}` | `/posts/${string}`;
```

Conditional types (brief): `T extends U ? X : Y` power advanced utilities like `ReturnType` and `Parameters`.

**Tip:** If a mapped type becomes unreadable, alias intermediate steps (`type Keys = keyof T`) and name the intent (`UserDTO`, `FormState`).

**Try it:** Given `type Flags = { darkMode: boolean; notifications: boolean }`, create `FlagHandlers` where each key `k` becomes `set${Capitalize<k>}: (value: boolean) => void` using mapped types.

---

## tsconfig & tooling

### Lesson 13. Strict compiler flags and what they enforce

**Takeaway:** Turn on `"strict": true` in `tsconfig.json`. It enables a bundle of flags — especially `strictNullChecks`, `noImplicitAny`, and `strictFunctionTypes` — that catch real bugs early.

**Explain:** A solid baseline for app development:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "isolatedModules": true
  },
  "include": ["src"]
}
```

Key flags:
- **`strictNullChecks`** — `null`/`undefined` are not assignable to `string`, etc.
- **`noImplicitAny`** — parameters/locals without types must be inferrable or annotated.
- **`noUncheckedIndexedAccess`** — `arr[i]` is `T | undefined`.
- **`verbatimModuleSyntax`** — enforces `import type` for type-only imports.

Project references split monorepos; **`composite`** and **`paths`** (Lesson 14) scale larger repos.

**Tip:** Enabling strict in a legacy codebase is incremental: fix one folder, add `"strict": true` with `"// @ts-expect-error"` only where needed, and delete suppressions as you type.

**Try it:** Enable `noUncheckedIndexedAccess` and fix indexing errors in one module by narrowing (`if (item)`) or optional chaining. Document which flag caught a bug you would have missed.

---

### Lesson 14. Path aliases, project references, and `tsc --noEmit`

**Takeaway:** Path aliases shorten imports and stabilize refactors. Run `tsc --noEmit` in CI to type-check without emitting JS. Pair with your bundler's alias config so runtime resolves match types.

**Explain:** Map logical prefixes to folders:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"]
    }
  }
}
```

Vite mirrors aliases:

```ts
// vite.config.ts
import path from "node:path";
export default {
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
};
```

Now imports are stable:

```ts
import { Button } from "@/components/ui/Button";
```

**`tsc --noEmit`** validates types only — ideal for CI:

```bash
npx tsc --noEmit -p tsconfig.json
```

**Project references** link packages:

```json
// packages/ui/tsconfig.json
{ "compilerOptions": { "composite": true, "outDir": "dist" }, "include": ["src"] }
// tsconfig.json root
{ "references": [{ "path": "./packages/ui" }] }
```

**Tip:** Keep one source of truth for paths — duplicate alias config in Jest/Vitest if tests import via `@/`.

**Try it:** Add `@/` pointing to `src/`, move one deep relative import to the alias, run `tsc --noEmit`, and fix any paths your bundler still needs configured.

---

## React + TSX

### Lesson 15. `React.FC` vs plain functions: how to type components

**Takeaway:** Prefer plain function components with an explicit props type. Avoid `React.FC` for new code — it historically implied `children` and can obscure generic component patterns.

**Explain:** The modern, idiomatic pattern:

```tsx
type GreetingProps = {
  name: string;
  excited?: boolean;
};

export function Greeting({ name, excited = false }: GreetingProps) {
  return (
    <h1>{excited ? `${name}!` : name}</h1>
  );
}
```

`React.FC<GreetingProps>` adds little and once implicitly included optional `children`. Explicit return types are rarely needed — inference yields `JSX.Element`:

```tsx
export function Greeting({ name }: GreetingProps): JSX.Element {
  return <h1>{name}</h1>;
}
```

For components with **`children`**, type them explicitly (Lesson 16). For **generics**, plain functions are required (Lesson 21):

```tsx
// Cannot cleanly express with React.FC
function List<T>({ items, render }: { items: T[]; render: (item: T) => React.ReactNode }) {
  return <ul>{items.map((item, i) => <li key={i}>{render(item)}</li>)}</ul>;
}
```

**Tip:** Export props types (`export type GreetingProps`) so consumers and Storybook stories can reuse them.

**Try it:** Convert a JS component using PropTypes to a typed function component. Export the props type and use it in a parent that passes required props.

---

### Lesson 16. Props, `children`, and intrinsic element props

**Takeaway:** Define props with `type` or `interface`. Type `children` as `React.ReactNode`. Extend DOM props with `ComponentPropsWithoutRef` or `ComponentProps` for wrappers.

**Explain:** **`React.ReactNode`** accepts strings, numbers, elements, fragments, portals, booleans, null:

```tsx
type CardProps = {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function Card({ title, children, footer }: CardProps) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <div>{children}</div>
      {footer}
    </section>
  );
}
```

Wrap native elements and forward refs:

```tsx
type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "ghost";
};

export function Button({ variant = "primary", className, ...rest }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} ${className ?? ""}`}
      {...rest}
    />
  );
}
```

**`ComponentProps<typeof SomeComponent>`** reuse another component's props. Omit with `Omit<ButtonProps, "onClick">` when overriding handlers.

**Tip:** For layout slots, prefer named props (`header`, `sidebar`) over a bag of `children` when structure matters — types document layout contracts.

**Try it:** Build a `TextField` that spreads native `<input>` props, adds `label: string`, and omits conflicting custom props. Confirm `placeholder` and `disabled` type-check through spread.

---

### Lesson 17. Event handlers and refs in TSX

**Takeaway:** Use React's exported event types — `React.ChangeEvent<HTMLInputElement>`, `React.MouseEvent<HTMLButtonElement>`, etc. Type refs with `useRef<HTMLInputElement>(null)` and narrow before DOM access.

**Explain:** Handler signatures match React's synthetic events:

```tsx
function SearchBox() {
  const [query, setQuery] = React.useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(query);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={query} onChange={handleChange} />
      <button type="submit">Search</button>
    </form>
  );
}
```

**Refs**:

```tsx
function FocusableInput() {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const focus = () => {
    inputRef.current?.focus(); // optional chaining — ref may be null
  };

  return (
    <>
      <input ref={inputRef} />
      <button type="button" onClick={focus}>Focus</button>
    </>
  );
}
```

For **callback refs**, type the element parameter. For **custom components**, use `forwardRef` with typed generics (`Lesson 21` patterns).

**Tip:** Avoid `React.SyntheticEvent` without generics — specific element types expose correct `target` fields.

**Try it:** Add a `textarea` with a "Insert template" button that sets `ref.current.value` via ref (and consider controlled vs uncontrolled tradeoffs). Type the click handler on the button explicitly.

---

### Lesson 18. `useState` and `useReducer` with precise state types

**Takeaway:** Provide generic type parameters when inference is too wide (`useState<Status>("idle")`) or when state is a union. Type `useReducer` with a discriminated action union for exhaustive reducers.

**Explain:** **`useState`** infers from initial value, but `{}` or `null` often needs help:

```tsx
type User = { id: string; name: string };

function ProfileLoader() {
  const [user, setUser] = React.useState<User | null>(null);
  const [status, setStatus] = React.useState<"idle" | "loading" | "error">("idle");

  // setUser({ id: "1" }); // Error — missing name
  return status === "loading" ? <p>Loading…</p> : user ? <p>{user.name}</p> : null;
}
```

**`useReducer`** — model actions as a union:

```tsx
type State = { count: number; step: number };

type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "setStep"; step: number }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment":
      return { ...state, count: state.count + state.step };
    case "decrement":
      return { ...state, count: state.count - state.step };
    case "setStep":
      return { ...state, step: action.step };
    case "reset":
      return { count: 0, step: 1 };
    default: {
      const _never: never = action;
      return _never;
    }
  }
}

function Counter() {
  const [state, dispatch] = React.useReducer(reducer, { count: 0, step: 1 });
  return (
    <button onClick={() => dispatch({ type: "increment" })}>
      {state.count}
    </button>
  );
}
```

**Tip:** Colocate `State`, `Action`, and `reducer` in one module and export them for tests.

**Try it:** Replace a boolean `isLoading` + optional `error` string pair with a discriminated union state. Update JSX to narrow before rendering error messages.

---

### Lesson 19. `useRef`, `useContext`, and avoiding implicit `any`

**Takeaway:** Type refs for DOM nodes or mutable boxes (`useRef<number>(0)`). Define context value types with `createContext` defaults or assertions, and enforce provider contracts with a custom hook.

**Explain:** **Mutable instance values** vs **DOM refs**:

```tsx
function Timer() {
  const intervalRef = React.useRef<number | undefined>(undefined);
  const ticks = React.useRef(0);

  React.useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      ticks.current += 1;
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return null;
}
```

**Context**:

```tsx
type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>("light");
  const value = React.useMemo(
    () => ({ theme, toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")) }),
    [theme],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
```

The custom hook narrows `undefined` away — consumers get a non-null value or a loud error.

**Tip:** Split context into state and dispatch contexts to reduce re-renders in large apps; type both.

**Try it:** Create `AuthContext` with `{ user: User | null; login: (u: User) => void; logout: () => void }`. Export `useAuth()` that throws outside the provider.

---

### Lesson 20. Generic components and `forwardRef` typing

**Takeaway:** Generic components preserve item types through props like `items: T[]` and `renderItem: (item: T) => React.ReactNode`. Type `forwardRef` with explicit generic parameters for reusable UI primitives.

**Explain:** A generic **Select** list:

```tsx
type SelectProps<T> = {
  items: T[];
  value: T | null;
  onChange: (value: T) => void;
  getLabel: (item: T) => string;
  getKey: (item: T) => string;
};

export function Select<T>({
  items,
  value,
  onChange,
  getLabel,
  getKey,
}: SelectProps<T>) {
  return (
    <select
      value={value ? getKey(value) : ""}
      onChange={(e) => {
        const next = items.find((item) => getKey(item) === e.target.value);
        if (next) onChange(next);
      }}
    >
      {items.map((item) => (
        <option key={getKey(item)} value={getKey(item)}>
          {getLabel(item)}
        </option>
      ))}
    </select>
  );
}

// Usage: T inferred as { id: string; name: string }
```

**`forwardRef`** for a typed button:

```tsx
type PolymorphicRef<E extends React.ElementType> =
  React.ComponentPropsWithRef<E>["ref"];

type BoxProps<E extends React.ElementType = "div"> = {
  as?: E;
} & Omit<React.ComponentPropsWithoutRef<E>, "as">;

const Box = React.forwardRef(function Box<E extends React.ElementType = "div">(
  { as, ...rest }: BoxProps<E>,
  ref: PolymorphicRef<E>,
) {
  const Component = as ?? "div";
  return <Component ref={ref} {...rest} />;
}) as <E extends React.ElementType = "div">(
  props: BoxProps<E> & { ref?: PolymorphicRef<E> },
) => React.ReactElement | null;
```

**Tip:** Start simple — a generic `List<T>` covers many cases before polymorphic `as` props.

**Try it:** Implement `DataTable<T>` with columns `{ key: keyof T; header: string; cell?: (row: T) => React.ReactNode }[]`. Render a table of typed rows without casting.

---

### Lesson 21. Form typing: controlled inputs, validation, and typed handlers

**Takeaway:** Model form state as a typed object; tie input `name` fields to `keyof` your model. Use typed change handlers and schema validation (Lesson 24) at submit boundaries.

**Explain:** Controlled form with indexed handlers:

```tsx
type SignupForm = {
  email: string;
  password: string;
  agree: boolean;
};

const initial: SignupForm = { email: "", password: "", agree: false };

function Signup() {
  const [form, setForm] = React.useState<SignupForm>(initial);

  const setField = <K extends keyof SignupForm>(key: K, value: SignupForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.agree) return;
    // POST form — types guarantee shape
    console.log(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={form.email}
        onChange={(e) => setField("email", e.target.value)}
      />
      <input
        type="password"
        value={form.password}
        onChange={(e) => setField("password", e.target.value)}
      />
      <label>
        <input
          type="checkbox"
          checked={form.agree}
          onChange={(e) => setField("agree", e.target.checked)}
        />
        I agree
      </label>
      <button type="submit">Sign up</button>
    </form>
  );
}
```

Separate **field-level errors** with `Partial<Record<keyof SignupForm, string>>`. For libraries (React Hook Form), export inferred types from schemas rather than duplicating interfaces.

**Tip:** Do not store DOM strings for numbers — parse at the edge (`Number(e.target.value)`) and store typed numbers in state.

**Try it:** Extend the form with `age: number` and a numeric input. Add a `validate(form): Partial<Record<keyof SignupForm, string>>` function and disable submit when errors exist.

---

### Lesson 22. Discriminated unions in UI: modals, async views, and exhaustiveness

**Takeaway:** Model UI modes as discriminated unions so each branch exposes only the fields it needs. Centralize rendering in exhaustive `switch`es — TypeScript prevents accessing `data` when `status` is `"loading"`.

**Explain:** Async view with a four-state union:

```tsx
type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

function UserPanel({ state }: { state: LoadState<{ name: string }> }) {
  switch (state.status) {
    case "idle":
      return <p>Press load to begin.</p>;
    case "loading":
      return <p aria-busy>Loading…</p>;
    case "success":
      return <p>Hello, {state.data.name}</p>; // `data` narrowed
    case "error":
      return <p role="alert">{state.error.message}</p>;
    default: {
      const _x: never = state;
      return _x;
    }
  }
}
```

**Modal union** — only one variant active:

```tsx
type ModalState =
  | { kind: "closed" }
  | { kind: "confirm"; message: string; onConfirm: () => void }
  | { kind: "delete"; id: string };

function ModalHost({ modal }: { modal: ModalState }) {
  if (modal.kind === "closed") return null;
  if (modal.kind === "confirm") {
    return (
      <dialog open>
        <p>{modal.message}</p>
        <button onClick={modal.onConfirm}>OK</button>
      </dialog>
    );
  }
  return (
    <dialog open>
      <p>Delete {modal.id}?</p>
    </dialog>
  );
}
```

Pair with **`useReducer`** (Lesson 18) so transitions are typed actions, not ad hoc boolean flags.

**Tip:** Name the discriminant consistently (`status`, `kind`, or `type`) across the codebase for predictable narrowing.

**Try it:** Refactor a component using `isOpen`, `mode`, and optional `payload` into a single discriminated union. Add a new modal variant and let the compiler list every place that needs updating.

---

## API & runtime safety

### Lesson 23. Typing `fetch`: generics, narrowing, and error channels

**Takeaway:** Wrap `fetch` in a typed helper that validates HTTP status and parses JSON into a generic `T`. Treat network data as `unknown` until validated — compile-time types lie if runtime data is unchecked.

**Explain:** A minimal typed client:

```ts
type HttpError = { ok: false; status: number; message: string };
type HttpSuccess<T> = { ok: true; data: T };
type HttpResult<T> = HttpSuccess<T> | HttpError;

async function fetchJson<T>(url: string, init?: RequestInit): Promise<HttpResult<T>> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      return { ok: false, status: res.status, message: await res.text() };
    }
    const data: unknown = await res.json();
    // Without runtime validation, we assert — prefer Zod in Lesson 24
    return { ok: true, data: data as T };
  } catch (err) {
    return { ok: false, status: 0, message: err instanceof Error ? err.message : "Network error" };
  }
}

interface User {
  id: string;
  name: string;
}

async function loadUser(id: string) {
  const result = await fetchJson<User>(`/api/users/${id}`);
  if (!result.ok) {
    console.error(result.message);
    return null;
  }
  return result.data;
}
```

Separate **transport errors** (4xx/5xx) from **parse errors** (invalid JSON). For mutations, type request bodies with `Omit`/`Partial` utilities (Lesson 11).

**Tip:** Colocate API types in `types/api.ts` and import from both client components and Server Actions.

**Try it:** Implement `postJson<TBody, TResponse>(url, body: TBody)` with `Content-Type: application/json`. Handle non-OK responses without throwing — return a `Result` union instead.

---

### Lesson 24. Zod schemas and inferred types: one source of truth

**Takeaway:** Define runtime schemas with Zod (or similar) and infer static types with `z.infer<typeof Schema>`. Validate at boundaries; inside the app, trust the inferred type.

**Explain:** Schema-first modeling:

```ts
import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["user", "admin"]),
});

export type User = z.infer<typeof UserSchema>;

export async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  const json: unknown = await res.json();
  return UserSchema.parse(json); // throws ZodError on mismatch
}

// Safe parse for UI error handling
const result = UserSchema.safeParse(json);
if (!result.success) {
  console.error(result.error.flatten());
} else {
  const user: User = result.data;
}
```

Compose schemas for forms and PATCH bodies:

```ts
export const UserPatchSchema = UserSchema.partial().omit({ id: true });
export type UserPatch = z.infer<typeof UserPatchSchema>;
```

In React, validate on submit and map `flatten().fieldErrors` to typed form keys.

**Tip:** Use `.transform()` for coercion (string → number) at the boundary instead of scattering parsing logic in components.

**Try it:** Create a `ProductSchema` with price as positive number and tags as `string[]`. Build a form that validates with `safeParse` and displays field errors typed as `Partial<Record<keyof Product, string>>`.

---

### Lesson 25. The `satisfies` operator: inference plus validation

**Takeaway:** `satisfies` checks that a value matches a type without widening literals to `string` or losing autocomplete. Use it for config objects, theme maps, and route tables.

**Explain:** Compare assertion vs satisfies:

```ts
type Route = `/users/${string}` | `/posts/${string}` | "/";

// as const + satisfies preserves literal keys AND checks shape
const routes = {
  home: "/",
  user: (id: string) => `/users/${id}` as `/users/${string}`,
  post: (slug: string) => `/posts/${slug}` as `/posts/${string}`,
} satisfies Record<string, Route | ((...args: never[]) => Route)>;

routes.home; // type: "/"
// routes.home = "/nope"; // Error if readonly context

type ThemeTokens = Record<"bg" | "fg" | "muted", string>;

const lightTheme = {
  bg: "#ffffff",
  fg: "#111111",
  muted: "#666666",
} satisfies ThemeTokens;
// lightTheme.bg is "#ffffff" (literal), not string
```

Unlike `: ThemeTokens` annotation, **`satisfies` does not widen** inferred literals. Unlike `as ThemeTokens`, it **validates excess/missing keys** at compile time.

**Tip:** Pair `satisfies` with `as const` for frozen config; use Zod when runtime validation is required (Lesson 24).

**Try it:** Define a `StatusColorMap` as `Record<"idle" | "loading" | "error", string>` and assign a `const colors = { ... } satisfies StatusColorMap`. Confirm autocomplete for keys and literal values in switch statements.

---

## Next.js patterns

### Lesson 26. Typing Server Actions: inputs, results, and `useActionState`

**Takeaway:** Mark server files with `"use server"`. Validate input with Zod, return serializable result unions (not thrown errors to the client), and type client hooks with the action's return type.

**Explain:** Server Action with typed payload and result:

```ts
// app/actions/user.ts
"use server";

import { z } from "zod";

const UpdateNameSchema = z.object({ id: z.string(), name: z.string().min(1) });

export type UpdateNameInput = z.infer<typeof UpdateNameSchema>;

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function updateName(
  _prev: ActionResult<{ name: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ name: string }>> {
  const parsed = UpdateNameSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().fieldErrors.name?.[0] ?? "Invalid" };
  }
  // await db.user.update(...)
  return { ok: true, data: { name: parsed.data.name } };
}
```

Client usage with **`useActionState`** (React 19):

```tsx
"use client";

import { useActionState } from "react";
import { updateName, type ActionResult } from "@/app/actions/user";

export function NameForm({ id, initial }: { id: string; initial: string }) {
  const [state, action, pending] = useActionState(updateName, null as ActionResult<{ name: string }> | null);

  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input name="name" defaultValue={initial} disabled={pending} />
      {state && !state.ok && <p role="alert">{state.error}</p>}
      <button type="submit" disabled={pending}>Save</button>
    </form>
  );
}
```

Keep actions **serializable** — no class instances, functions, or `Date` without conversion.

**Tip:** Export input/output types from the action module; client components import types only via `import type`.

**Try it:** Add a `deletePost(id: string)` action returning `{ ok: true } | { ok: false; error: string }`. Wire a form button with `formAction` and display typed error messages.

---

### Lesson 27. `generateMetadata` and typed SEO params

**Takeaway:** Type `generateMetadata` with `Metadata` from `next` and params as `Promise<{ slug: string }>` in Next.js 15+. Keep title/description helpers reusable and null-safe when data is missing.

**Explain:** Dynamic metadata for App Router:

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata, ResolvingMetadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

type Post = { title: string; description: string; ogImage?: string };

async function getPost(slug: string): Promise<Post | null> {
  // fetch from CMS
  return { title: "Hello", description: "World" };
}

export async function generateMetadata(
  { params }: PageProps,
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not found" };

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: post.ogImage ? [{ url: post.ogImage }] : [],
    },
  };
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return <p>Not found</p>;
  return <article><h1>{post.title}</h1></article>;
}
```

Share **`PageProps`** between `generateMetadata` and the page component to avoid param drift. Use **`metadataBase`** in root layout for absolute OG URLs.

**Tip:** When translations exist, type `locale` in params and pass it to CMS helpers inside both metadata and page.

**Try it:** Add `generateMetadata` to a dynamic route with `{ id: string }` params. Return robots `noindex` when `searchParams.preview` is set.

---

### Lesson 28. App Router page props, layouts, and parallel routes

**Takeaway:** In Next.js 15+, `params` and `searchParams` are **Promises** — await them in server components. Type shared props aliases across pages, layouts, and `generateStaticParams` for consistent routing contracts.

**Explain:** Centralize route params:

```tsx
// app/shop/[category]/[productId]/page.tsx
type ShopRouteParams = { category: string; productId: string };

type ShopPageProps = {
  params: Promise<ShopRouteParams>;
  searchParams: Promise<{ sort?: "price" | "name"; q?: string }>;
};

export async function generateStaticParams(): Promise<ShopRouteParams[]> {
  return [{ category: "mugs", productId: "1" }];
}

export default async function ShopProductPage({ params, searchParams }: ShopPageProps) {
  const { category, productId } = await params;
  const { sort = "name", q } = await searchParams;

  return (
    <main>
      <h1>
        {category} / {productId}
      </h1>
      <p>Sorted by {sort}{q ? `, query: ${q}` : ""}</p>
    </main>
  );
}
```

**Layouts** receive `children` and typed `params`:

```tsx
type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ category: string }>;
};

export default async function CategoryLayout({ children, params }: LayoutProps) {
  const { category } = await params;
  return (
    <section aria-label={category}>
      <nav>{category} nav</nav>
      {children}
    </section>
  );
}
```

**Parallel routes** add typed slots (`@modal`) as props on layouts. Keep server components async; client boundaries only where interactivity is needed.

**Tip:** Run `next typegen` (or rely on Next 15+ typed routes) to generate `PageProps` helpers from your file structure and reduce manual duplication.

**Try it:** Create a shared `types/routes.ts` with param shapes for `/users/[id]` and `/users/[id]/edit`. Use them in the page, layout, and a `Link` builder function typed to accept only valid paths.

---

*End of TypeScript Learning Notes — 28 lessons from fundamentals through Next.js App Router typing. Next steps: add Zod to a small full-stack Next app, enable `strict` + `tsc --noEmit` in CI, and refactor one JS React component folder to typed TSX using discriminated unions for async UI.*
