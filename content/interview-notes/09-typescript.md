# TypeScript Interview Notes

A practical Q&A guide for TypeScript interviews — from fundamentals and the type system to generics, utility types, React/Next.js integration, and tsconfig. Answers are spoken and interview-ready; code examples show real patterns, not memorization.

---

## Fundamentals

### Q1. What is TypeScript and how does it differ from JavaScript? [must-know]

**Short definition:** TypeScript is a typed superset of JavaScript that compiles to plain JS.

**Answer:** TypeScript adds static types, interfaces, generics, and compile-time checks on top of JavaScript syntax you already know. At runtime there is no TypeScript — the compiler strips types and emits standard JavaScript that browsers and Node execute. The main wins are catching bugs before runtime, better IDE autocomplete, safer refactors in large codebases, and self-documenting APIs. Teams can adopt it gradually with `allowJs` and migrate file by file.

```ts
let age: number = 25;
// After tsc → let age = 25;
```

**Follow-up:** Can you run TypeScript directly in the browser without compiling?

**Common mistake:** Thinking TypeScript performs runtime type validation — it does not unless you add a library like Zod.

---

### Q2. What are the main advantages of using TypeScript?

**Short definition:** Earlier bug detection, better tooling, and safer scaling for teams.

**Answer:** TypeScript catches type errors at compile time instead of in production. Types act as inline documentation for functions, props, and API contracts. IDEs use types for go-to-definition, rename, and autocomplete. Large refactors become safer because the compiler flags every broken call site. It also supports gradual adoption — you can mix `.js` and `.ts` files while migrating.

```ts
function greet(name: string): string {
  return `Hello, ${name}`;
}
greet(42); // Compile error — catches before deploy
```

**Follow-up:** When might TypeScript slow a team down?

**Common mistake:** Assuming types replace tests — you still need unit and integration tests.

---

### Q3. Is TypeScript compiled or interpreted?

**Short definition:** TypeScript is compiled; the output JavaScript is what runs.

**Answer:** The TypeScript compiler (`tsc`) or a bundler plugin (esbuild, swc, Babel) transforms `.ts` files into `.js`. Node and browsers never execute TypeScript natively. Type-checking can run separately from emit — many projects use `tsc --noEmit` in CI while the bundler handles fast transpilation. This separation means you can typecheck strictly without slowing dev builds.

```bash
npx tsc              # typecheck + emit JS
npx tsc --noEmit     # typecheck only
npx tsx src/index.ts # run TS directly in Node (transpiles on the fly)
```

**Follow-up:** What is the difference between transpilation and type-checking?

---

### Q4. What is type inference? [must-know]

**Short definition:** TypeScript deduces types automatically when you omit annotations.

**Answer:** When you initialize a variable or return a value, TypeScript often infers the type without an explicit annotation. Best practice is to annotate public APIs — function parameters, exported types, component props — and let locals infer when the initializer makes the type obvious. Over-annotating adds noise; under-annotating on public boundaries hides intent from teammates and the compiler.

```ts
const count = 10;                    // inferred: number
const user = { name: "Madhan" };     // inferred: { name: string }
function add(a: number, b: number) {
  return a + b;                      // inferred return: number
}
```

**Follow-up:** When does inference fail and force you to annotate?

**Common mistake:** Annotating every local variable when `const x = "hello"` already gives you `string`.

---

### Q5. What is structural typing (duck typing)?

**Short definition:** Types are compatible if their shape matches, not their name.

**Answer:** TypeScript uses structural typing: two types with the same properties are assignable even if declared separately. This differs from nominal systems like Java or C# where type identity matters. It makes JavaScript interop natural but can surprise you when unrelated interfaces share the same shape and become interchangeable.

```ts
interface A { x: number }
interface B { x: number }
const a: A = { x: 1 };
const b: B = a; // OK — same structure
```

**Follow-up:** How do you prevent accidental structural compatibility?

---

### Q6. What is the difference between `any` and `unknown`? [must-know]

**Short definition:** `any` disables checking; `unknown` forces you to narrow before use.

**Answer:** `any` turns off the type checker for that value — you can call any method or assign it anywhere, and errors slip to runtime. `unknown` is the type-safe top type: you must narrow with `typeof`, `instanceof`, or a type guard before using it. Use `unknown` for API JSON, user input, and any untrusted external data. Reserve `any` as a temporary migration escape hatch, not everyday code.

```ts
function handle(input: unknown) {
  if (typeof input === "string") {
    console.log(input.toUpperCase()); // safe after narrowing
  }
}
```

**Follow-up:** What is `never` and how does it relate to exhaustive checks?

**Common mistake:** Using `any` to silence errors instead of fixing the underlying type.

---

### Q7. Does TypeScript exist at runtime? Can you check an interface with `typeof`?

**Short definition:** Types are erased at compile time — no runtime TypeScript type system.

**Answer:** After compilation, all type annotations, interfaces, and type aliases disappear. JavaScript `typeof` only works for primitives and functions at runtime — it cannot detect custom interfaces or generics. If you need runtime validation, use libraries like Zod, Yup, or io-ts, or write manual checks. This is why "parse then trust" at API boundaries is a common pattern.

```ts
interface User { id: number; name: string }
const user: User = { id: 1, name: "A" };
typeof user; // "object" — not "User"
```

**Follow-up:** How do you validate API responses at runtime with TypeScript?

---

### Q8. What are the primitive and special types in TypeScript? [must-know]

**Short definition:** Primitives plus `any`, `unknown`, `never`, and `void`.

**Answer:** Primitives are `string`, `number`, `boolean`, `null`, `undefined`, `bigint`, and `symbol`. Special types include `any` (escape hatch), `unknown` (safe top type), `never` (impossible values), and `void` (no useful return). Arrays, tuples, objects, enums, and functions are structural types built from these foundations. Knowing when to use each special type is a frequent interview topic.

```ts
let name: string = "Madhan";
let active: boolean = true;
let missing: undefined = undefined;
let empty: null = null;
```

**Follow-up:** What is the difference between `null` and `undefined` in strict mode?

---

### Q9. What is the difference between an array and a tuple?

**Short definition:** Arrays are variable-length; tuples are fixed-length with position-specific types.

**Answer:** An array type like `number[]` allows any length with the same element type. A tuple like `[string, number]` has a fixed length and each index has a specific type — useful for pairs, coordinates, or React's `useState` return. Tuples can include optional and rest elements. Use tuples when position and length matter; use arrays for homogeneous collections.

```ts
const nums: number[] = [1, 2, 3];
const pair: [string, number] = ["age", 25];
const rgb: [number, number, number] = [255, 0, 128];
```

**Follow-up:** How does `useState` relate to tuple typing?

---

### Q10. What are literal types?

**Short definition:** A type narrowed to one exact value, like `"light"` or `42`.

**Answer:** Literal types restrict a value to a single specific string, number, or boolean. They are often combined into unions to model finite sets of options — themes, HTTP methods, status codes. Literal inference works with `as const` to preserve narrow types instead of widening to `string` or `number`.

```ts
type Theme = "light" | "dark";
type HttpOk = 200;
const routes = ["home", "about"] as const; // readonly ["home", "about"]
```

**Follow-up:** What does `as const` do to an object?

---

### Q11. What is the difference between union and intersection types?

**Short definition:** Union is "or"; intersection is "and."

**Answer:** A union `A | B` means the value is either A or B — you must narrow before accessing members exclusive to one side. An intersection `A & B` means the value satisfies both — commonly used to combine object shapes. Unions model alternatives; intersections merge properties. Discriminated unions are a powerful pattern built on unions with a shared literal tag.

```ts
type Id = string | number;
type Admin = User & { role: "admin" };
```

**Follow-up:** What happens when two intersected types have conflicting property types?

---

### Q12. What are ambient declarations and `.d.ts` files?

**Short definition:** Type-only files that describe JavaScript without changing runtime code.

**Answer:** Declaration files (`.d.ts`) tell TypeScript about types for untyped JavaScript libraries, globals, or modules. You use `declare module`, `declare const`, or `declare global` to augment the type environment. The `@types/* packages on DefinitelyTyped provide community typings for npm packages. Your app code stays in `.ts`; declarations add types without emitting JS.

```ts
declare module "my-legacy-lib" {
  export function doSomething(x: string): void;
}
declare const APP_VERSION: string;
```

**Follow-up:** How do you write types for a library that has no `@types` package?

---

## Types vs Interfaces

### Q13. What is the difference between `type` and `interface`? [must-know]

**Short definition:** Both describe shapes; `type` is more flexible, `interface` supports merging.

**Answer:** This is the most frequently asked TypeScript question. Both can describe object shapes for props, API models, and classes. Use `interface` for object contracts — especially React props and extendable APIs — because it supports declaration merging and reads naturally with `extends`. Use `type` for unions, primitives, tuples, mapped types, and conditional types. Consistency in a codebase matters more than dogma.

```ts
interface User { id: number; name: string }
type Status = "loading" | "success" | "error";
type Id = string | number;
```

**Follow-up:** Can you extend a `type` alias?

**Common mistake:** Debating endlessly — pick a team convention and apply it consistently.

---

### Q14. What is declaration merging?

**Short definition:** Multiple `interface` declarations with the same name combine into one.

**Answer:** TypeScript merges duplicate interface declarations into a single type with all members. This is useful for extending third-party types — for example adding `user` to Express's `Request`. Type aliases cannot merge — duplicate names cause a compile error. Module augmentation uses merging to extend library types without forking packages.

```ts
interface User { name: string }
interface User { age: number }
// User = { name: string; age: number }
```

**Follow-up:** How is this used with Express `Request`?

---

### Q15. How do you extend types vs interfaces?

**Short definition:** Interfaces use `extends`; types use intersection `&`.

**Answer:** Interfaces extend other interfaces with the `extends` keyword, producing a clear inheritance chain. Type aliases combine shapes with intersection: `type Employee = Person & { role: string }`. Both achieve similar results for object shapes. Interfaces can extend multiple interfaces; types can intersect many types. For deep hierarchies, prefer composition over long extension chains.

```ts
interface Person { name: string }
interface Employee extends Person { role: string }
type EmployeeAlt = Person & { role: string };
```

**Follow-up:** Can an interface extend a type alias?

---

### Q16. Optional properties (`?`) vs `undefined` — what's the difference? [must-know]

**Short definition:** `?` means the key may be absent; `T | undefined` means the key is present but value may be undefined.

**Answer:** With `name?: string`, the property can be missing entirely or explicitly `undefined` in most configs. With `name: string | undefined`, the key must exist but the value can be undefined. With `exactOptionalPropertyTypes: true` in tsconfig, TypeScript distinguishes missing vs undefined strictly. This matters for APIs where "not sent" differs from "sent as null/undefined."

```ts
type A = { name?: string };
type B = { name: string | undefined };
const a: A = {};           // OK
const b: B = {};           // Error — name required
const b2: B = { name: undefined }; // OK
```

**Follow-up:** When would you enable `exactOptionalPropertyTypes`?

---

### Q17. What is the difference between `const` and `readonly`?

**Short definition:** `const` is a JS binding; `readonly` is a TS property modifier.

**Answer:** JavaScript `const` prevents reassigning the variable binding — but object contents can still mutate. TypeScript `readonly` on a property prevents writing to that property after initialization. `as const` on a value gives deep readonly literal inference. Use `readonly` for immutable object shapes; use `const` for variables that should not be reassigned.

```ts
const user = { name: "A" };
user.name = "B"; // OK — object is mutable

type User = { readonly name: string };
const u: User = { name: "A" };
// u.name = "B"; // Error
```

**Follow-up:** What does `Readonly<T>` utility type do?

---

### Q18. When should you use enums vs string literal unions?

**Short definition:** Prefer literal unions; use enums when you need runtime objects.

**Answer:** String literal unions like `type Status = "idle" | "loading"` are erasable, tree-shakeable, and narrow cleanly in switches. Enums generate runtime JavaScript objects (unless `const enum`) and support reverse mapping for numeric enums. Many modern React/TS teams prefer unions for simplicity. Use enums when you need a runtime object, numeric protocol values, or shared constants across many files.

```ts
enum Direction { Up, Down }        // emits runtime code
type Dir = "up" | "down";          // preferred for most UI state
```

**Follow-up:** What is a `const enum` and when is it inlined?

**Common mistake:** Using numeric enums everywhere when a union would be simpler.

---

### Q19. What is the difference between `interface` and abstract class?

**Short definition:** Interface is a contract; abstract class can hold shared implementation.

**Answer:** An interface defines only the shape — no fields, no implementation, no constructor. Classes can implement multiple interfaces. An abstract class can have concrete methods, protected fields, and a constructor — but only single inheritance. Prefer interfaces for pure contracts and dependency injection. Use abstract classes when several subclasses share real base behavior and state.

```ts
interface Animal { speak(): void }

abstract class AnimalBase {
  abstract speak(): void;
  move() { console.log("moving"); }
}
```

**Follow-up:** Can you implement an interface and extend a class?

---

### Q20. How do you type function signatures — type alias vs interface?

**Short definition:** Both work; `type` is more common for function shapes.

**Answer:** You can write function types as a type alias: `type MathOp = (a: number, b: number) => number`. Interfaces can also describe call signatures with a `()` block. Type aliases are idiomatic for callbacks, event handlers, and higher-order functions. For object shapes that are also callable, an interface with a call signature works well.

```ts
type MathOp = (a: number, b: number) => number;

interface Logger {
  (msg: string): void;
  level: "info" | "error";
}
```

**Follow-up:** How do function overloads differ from a union parameter?

---

### Q21. What are access modifiers on class members?

**Short definition:** `public`, `private`, and `protected` control visibility.

**Answer:** `public` is the default — accessible everywhere. `private` restricts access to the declaring class (compile-time check in TS). `protected` allows the class and subclasses. `readonly` prevents reassignment after init. TypeScript also supports ES `#private` fields for true runtime privacy. Mention both TS `private` and JS `#field` in senior interviews.

```ts
class User {
  constructor(
    public name: string,
    private password: string,
    protected id: number,
    readonly createdAt = new Date()
  ) {}
}
```

**Follow-up:** What is the difference between TS `private` and `#private`?

---

### Q22. Composition vs inheritance — which do you prefer?

**Short definition:** Favor composition (has-a) over deep inheritance (is-a).

**Answer:** Inheritance models an "is-a" relationship and can lead to brittle, deep hierarchies that are hard to change. Composition models "has-a" by combining small, reusable pieces — hooks, utility functions, and wrapper components. Most modern TypeScript and React codebases prefer composition because it is more flexible and testable. Use inheritance sparingly for genuine shared base behavior.

```ts
// Composition: small focused pieces
type CanFly = { fly(): void };
type CanSwim = { swim(): void };
type Duck = CanFly & CanSwim & { quack(): void };
```

**Follow-up:** How does this apply to React HOCs vs custom hooks?

---

## Generics

### Q23. What are generics and why use them? [must-know]

**Short definition:** Type parameters that make reusable code preserve specific types.

**Answer:** Generics let you write functions, classes, and interfaces that work with many types while keeping the relationship between input and output. Instead of `any`, a generic `T` flows through so `identity(42)` returns `number` and `identity("hi")` returns `string`. They appear everywhere: `Array<T>`, `Promise<T>`, React hooks, API clients, and form libraries. Generics are essential for type-safe reusable abstractions.

```ts
function identity<T>(value: T): T {
  return value;
}
const n = identity(42);    // number
const s = identity("hi");    // string
```

**Follow-up:** What happens if you omit the generic and pass no type argument?

**Common mistake:** Defaulting to `any` instead of a generic when the type should flow through.

---

### Q24. What are generic constraints (`extends`)? [must-know]

**Short definition:** Limits on a type parameter so you can safely access specific properties.

**Answer:** A constraint like `T extends { length: number }` tells TypeScript that `T` must have a `length` property, so you can call `.length` inside the function. Constraints can reference other type parameters, extend keyof results, or bound to specific interfaces. Without constraints, generic `T` is unknown and you cannot access arbitrary properties.

```ts
function getLength<T extends { length: number }>(value: T): number {
  return value.length;
}
getLength("hello"); // OK
getLength(42);      // Error — number has no length
```

**Follow-up:** How do you constrain `T` to be a key of an object?

---

### Q25. What are default generic type parameters?

**Short definition:** Fallback types when the caller does not supply a type argument.

**Answer:** You can give generics defaults so callers do not always pass explicit type arguments. This is common in API wrappers where the default is `unknown` until the consumer specifies the data shape. Defaults improve ergonomics without losing type safety when needed.

```ts
interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
}
const res: ApiResponse = { data: {}, success: true };       // T = unknown
const userRes: ApiResponse<User> = { data: user, success: true };
```

**Follow-up:** Can a default generic reference another type parameter?

---

### Q26. Generic functions vs generic interfaces vs generic classes?

**Short definition:** Generics work at function, interface, and class level.

**Answer:** Generic functions like `identity<T>` preserve input/output types. Generic interfaces model reusable containers — `Repository<T>`, `ApiResponse<T>`. Generic classes like `class Box<T>` hold typed values with methods that respect `T`. In React, generic components use `function List<T>(props: ListProps<T>)`. The pattern is the same: a type parameter declared once and used throughout.

```ts
interface Repository<T> {
  find(id: string): Promise<T | null>;
  save(item: T): Promise<T>;
}

class Box<T> {
  constructor(public value: T) {}
}
```

**Follow-up:** How do you type a generic React `Select` component?

---

### Q27. How do you type a generic React Select component?

**Short definition:** Props interface parameterized by `T` for options and callbacks.

**Answer:** A generic select accepts `options: T[]`, a `value: T`, and callbacks that receive `T`. The `getLabel` function maps each item to a display string without losing type information. This pattern keeps the component reusable for users, products, or any entity type while preserving compile-time safety.

```tsx
interface SelectProps<T> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  getLabel: (item: T) => string;
}

function Select<T>({ options, value, onChange, getLabel }: SelectProps<T>) {
  return (
    <select
      value={getLabel(value)}
      onChange={(e) => {
        const selected = options.find((o) => getLabel(o) === e.target.value);
        if (selected) onChange(selected);
      }}
    >
      {options.map((o, i) => (
        <option key={i} value={getLabel(o)}>{getLabel(o)}</option>
      ))}
    </select>
  );
}
```

**Follow-up:** Why not type options as `unknown[]`?

---

### Q28. What is `keyof T` with generics?

**Short definition:** `keyof` produces a union of property names, useful for type-safe property access.

**Answer:** `keyof User` gives `"id" | "name" | "email"`. Combined with generics, you can write `function getProperty<T, K extends keyof T>(obj: T, key: K): T[K]` — the return type matches the property type. This pattern powers type-safe getters, form field bindings, and pick utilities.

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const name = getProperty(user, "name"); // string
```

**Follow-up:** How does this relate to the `Pick` utility type?

---

### Q29. What are generic utility patterns with `Promise` and `async`?

**Short definition:** Async functions return `Promise<T>`; generics preserve the resolved type.

**Answer:** An async function that fetches a user should return `Promise<User>`, not `Promise<any>`. Generic API clients wrap fetch with `get<T>(url): Promise<T>`. Use `Awaited<T>` utility to unwrap nested promises in type definitions. Always type the success path so callers get autocomplete on the resolved value.

```ts
async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json();
}
```

**Follow-up:** How do you handle typed errors in async generics?

---

### Q30. What is a generic constraint with multiple type parameters?

**Short definition:** Multiple generics can relate to each other via constraints.

**Answer:** Functions like `map` use two type parameters: `T` for input array elements and `U` for output. Constraints can link them — for example `K extends keyof T` ties a key to an object type. Naming matters: prefer `TData`, `TError`, `TKey` over bare `T`, `U`, `V` in complex signatures for readability.

```ts
function mapArr<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn);
}
const lengths = mapArr(["a", "bb"], (s) => s.length); // number[]
```

**Follow-up:** What is variance and when does it matter for generics?

---

### Q31. What are function overloads?

**Short definition:** Multiple call signatures for one function implementation.

**Answer:** Overloads declare several input/output combinations; a single implementation handles all cases. Useful when return type depends on input in ways one signature cannot express — like `document.getElementById` returning different elements. The implementation signature must be compatible with all overloads. Prefer unions and generics when overloads become too complex.

```ts
function parse(input: string): object;
function parse(input: string, reviver: (key: string, value: unknown) => unknown): object;
function parse(input: string, reviver?: (key: string, value: unknown) => unknown) {
  return JSON.parse(input, reviver);
}
```

**Follow-up:** When would you choose overloads over a discriminated union parameter?

---

### Q32. What is the difference between `void` and `never`?

**Short definition:** `void` means no return value; `never` means the function never returns normally.

**Answer:** A `void` function may complete without returning anything useful — like `console.log`. A `never` function always throws or loops forever — it never returns. `never` also appears in exhaustive switch checks: if a case is missing, the remaining variable is not assignable to `never`. Understanding both is important for correct function signatures and control-flow analysis.

```ts
function log(msg: string): void {
  console.log(msg);
}

function fail(msg: string): never {
  throw new Error(msg);
}
```

**Follow-up:** How does `never` interact with union narrowing?

---

## Utility Types

### Q33. Explain `Partial`, `Required`, `Readonly`, `Pick`, and `Omit` [must-know]

**Short definition:** Built-in helpers to transform object types without duplication.

**Answer:** `Partial<T>` makes all properties optional — ideal for PATCH updates. `Required<T>` makes all properties required. `Readonly<T>` makes all properties readonly. `Pick<T, K>` keeps only specified keys. `Omit<T, K>` removes specified keys — common for create DTOs without `id`. These utilities reduce duplicated interface definitions and keep types in sync with a single source of truth.

```ts
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

type UpdateUser = Partial<Omit<User, "id">>;
type CreateUser = Omit<User, "id">;
type PublicUser = Omit<User, "password">;
type UserCard = Pick<User, "id" | "name">;
```

**Follow-up:** How is `Omit` useful in React component props?

**Common mistake:** Manually copying interfaces instead of deriving with utilities.

---

### Q34. What are `Record`, `Exclude`, `Extract`, and `NonNullable`? [must-know]

**Short definition:** Utilities for maps, union filtering, and null removal.

**Answer:** `Record<K, V>` builds an object type with keys K and values V — useful for dictionaries and flag maps. `Exclude<U, T>` removes types from a union. `Extract<U, T>` keeps only matching members. `NonNullable<T>` removes `null` and `undefined`. These are essential for refining unions and building flexible config objects.

```ts
type Flags = Record<string, boolean>;
type OnlyStrings = Extract<string | number | boolean, string>; // string
type NoNull = NonNullable<string | null | undefined>;          // string
type NoStrings = Exclude<"a" | 1 | true, string>;            // 1 | true
```

**Follow-up:** When would you use `Record` vs a plain index signature?

---

### Q35. What are `ReturnType` and `Parameters`?

**Short definition:** Extract function return type and parameter tuple from a function type.

**Answer:** `ReturnType<typeof fn>` gives the return type of a function. `Parameters<typeof fn>` gives a tuple of parameter types. Useful when wrapping functions, building mocks, or deriving types from existing code instead of duplicating signatures. Works with typeof on values to query their call signature.

```ts
function createUser(name: string, age: number) {
  return { id: 1, name, age };
}
type User = ReturnType<typeof createUser>;
type CreateUserParams = Parameters<typeof createUser>; // [string, number]
```

**Follow-up:** How does `Awaited<T>` unwrap Promise types?

---

### Q36. What is `Awaited<T>`?

**Short definition:** Recursively unwraps `Promise` layers to get the resolved type.

**Answer:** `Awaited<T>` extracts the type a Promise resolves to, handling nested promises. Useful in generic async utilities and when inferring types from async functions. Added in TypeScript 4.5 to simplify patterns that previously required conditional types with `infer`.

```ts
type A = Awaited<Promise<string>>;              // string
type B = Awaited<Promise<Promise<number>>>;     // number
type C = Awaited<string | Promise<boolean>>;    // string | boolean
```

**Follow-up:** How would you type a generic `retry` function with `Awaited`?

---

### Q37. How do utility types help with API create/update patterns?

**Short definition:** Derive DTOs from domain models using Omit and Partial.

**Answer:** Define one canonical `User` interface, then derive `CreateUser = Omit<User, "id" | "createdAt">` and `UpdateUser = Partial<Omit<User, "id">>`. This ensures create and update shapes stay aligned when the base model changes. The pattern scales to nested entities and shared packages between frontend and backend.

```ts
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

type CreateUserDto = Omit<User, "id" | "createdAt">;
type UpdateUserDto = Partial<Omit<User, "id" | "createdAt">>;
```

**Follow-up:** How do you share these types between Next.js and Express?

---

### Q38. How do you use `Pick` and `Omit` with React HTML attributes?

**Short definition:** Extend native element props while excluding or selecting specific keys.

**Answer:** React components often extend `ButtonHTMLAttributes<HTMLButtonElement>` but override specific props like `onClick`. Use `Omit` to remove conflicting keys, then intersect with your custom props. This inherits all native attributes — `disabled`, `aria-*`, `className` — without redeclaring them.

```ts
type ButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> & {
  onClick: () => void;
  variant?: "primary" | "secondary";
};
```

**Follow-up:** What is `ComponentPropsWithoutRef` and when is it used?

---

### Q39. When should you build custom utility types vs use built-ins?

**Short definition:** Use built-ins first; custom mapped types when you need domain-specific transforms.

**Answer:** Built-in utilities cover most everyday needs and are familiar to interviewers. Create custom mapped types when you need domain logic — like `Nullable<T>` that adds null to every field, or `DeepPartial<T>` for nested updates. Document custom utilities and keep them in a shared types folder. Do not reinvent `Partial` unless you need different behavior.

```ts
type Nullable<T> = { [K in keyof T]: T[K] | null };

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
```

**Follow-up:** How are built-in utilities implemented under the hood?

---

### Q40. What is the best practice for utility types in large codebases?

**Short definition:** One source of truth; derive, do not duplicate.

**Answer:** Define canonical entity types once and derive API DTOs, form values, and list previews with Pick/Omit/Partial. Avoid parallel interfaces that drift apart over time. Export utilities from a shared types package in monorepos. In code review, reject duplicated shapes that could be a one-line utility transformation.

```ts
// Single source of truth
interface Product {
  id: string;
  name: string;
  price: number;
  internalSku: string;
}

type ProductListItem = Pick<Product, "id" | "name" | "price">;
type ProductFormValues = Omit<Product, "id">;
```

**Follow-up:** How do Zod schemas relate to TypeScript utility types?

---

## Advanced Types

### Q41. Explain `keyof`, `typeof`, and indexed access types [must-know]

**Short definition:** Query operators for keys, values, and property types.

**Answer:** `keyof T` produces a union of property names. `typeof value` in type position captures the type of a value — useful for config objects. Indexed access `T[K]` gets the type of property K. Together they power type-safe getters, form bindings, and dynamic key access without losing precision.

```ts
type UserKeys = keyof User;           // "id" | "name" | "email"
type NameType = User["name"];         // string

const config = { dark: true, fontSize: 14 } as const;
type Config = typeof config;
type FontSize = Config["fontSize"];   // 14
```

**Follow-up:** How do you constrain K in `T[K]` to valid keys?

---

### Q42. What are mapped types?

**Short definition:** Types built by iterating keys: `{ [K in keyof T]: ... }`.

**Answer:** Mapped types transform each property of an existing type. `Partial`, `Readonly`, and `Record` are built-in mapped types. You can add modifiers — `+?` for optional, `-readonly` to remove readonly. Mapped types are the foundation for most custom utility types in advanced TypeScript.

```ts
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};
```

**Follow-up:** What are key remapping and `as` clauses in mapped types?

---

### Q43. What are conditional types?

**Short definition:** Type-level if/else: `T extends U ? X : Y`.

**Answer:** Conditional types select one of two types based on whether T is assignable to U. They are used heavily in library internals and utility types. When T is a naked type parameter, conditionals distribute over union members. Understanding conditionals unlocks reading complex generic library types.

```ts
type IsString<T> = T extends string ? true : false;
type A = IsString<"hello">;  // true
type B = IsString<number>;   // false
```

**Follow-up:** What are distributive conditional types?

---

### Q44. What is the `infer` keyword? [must-know]

**Short definition:** Declares a type variable inside conditional types to capture a matched part.

**Answer:** `infer` lets you extract types from complex patterns — array element types, Promise resolved values, function return types. It only works in the extends clause of a conditional type. Libraries use infer heavily to unwrap nested generics automatically.

```ts
type ElementType<T> = T extends (infer U)[] ? U : never;
type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;

type E = ElementType<string[]>;       // string
type R = UnwrapPromise<Promise<number>>; // number
```

**Follow-up:** How is `ReturnType` implemented with infer?

---

### Q45. What are template literal types?

**Short definition:** String types built from template syntax with type-level concatenation.

**Answer:** Template literal types combine string unions — useful for event names, CSS properties, route paths, and typed APIs. Combined with intrinsic string manipulation types like `Capitalize`, `Uppercase`, and `Lowercase`, they can generate handler names from event unions automatically.

```ts
type EventName = "click" | "focus";
type Handler = `on${Capitalize<EventName>}`; // "onClick" | "onFocus"

type Route = `/users/${string}` | `/posts/${string}`;
```

**Follow-up:** How are template literals used in typed CSS-in-JS?

---

### Q46. What does the `satisfies` operator do?

**Short definition:** Validates a value against a type without widening inferred literals.

**Answer:** Introduced in TypeScript 4.9, `satisfies` checks that an expression matches a type while preserving the narrow inferred type of the value. Unlike a type annotation, it does not widen `"#0d6e6e"` to `string`. Ideal for config objects, theme palettes, and route maps where you want both validation and literal precision.

```ts
const palette = {
  primary: "#0d6e6e",
  secondary: "#1a2332",
} satisfies Record<string, string>;
// palette.primary is "#0d6e6e", not string
```

**Follow-up:** When would you use `satisfies` vs `as const`?

---

### Q47. What is type narrowing and how do type guards work?

**Short definition:** Refining a wide type to a specific type inside a branch.

**Answer:** Type narrowing happens when TypeScript learns a more specific type from control flow. Built-in guards include `typeof`, `instanceof`, `in`, and equality checks. Custom type guards use a predicate return type `value is Type` so TS narrows after a true return. Narrowing is essential for union types and `unknown`.

```ts
function isAdmin(user: User): user is Admin {
  return user.role === "admin";
}

function handle(input: unknown) {
  if (typeof input === "string") {
    console.log(input.length);
  }
}
```

**Follow-up:** What is a discriminated union and why use one?

---

### Q48. What are discriminated unions and exhaustive checking with `never`? [must-know]

**Short definition:** Unions tagged with a literal field; `never` catches missing switch cases.

**Answer:** A discriminated union shares a literal property — usually `status`, `type`, or `kind` — so TypeScript narrows sibling fields when you switch on the tag. Combined with a `never` default case, the compiler errors if you forget a variant. This models async UI state safely and prevents impossible states like `isLoading` and `data` both being truthy.

```ts
type FetchState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

function assertNever(x: never): never {
  throw new Error("Unexpected: " + x);
}
```

**Follow-up:** How would you model form validation errors as a discriminated union?

**Common mistake:** Using optional booleans (`isLoading?`, `data?`, `error?`) instead of a tagged union.

---

## TypeScript with React

### Q49. How do you type React component props? [must-know]

**Short definition:** Define an interface or type for props; destructure with typed parameters.

**Answer:** Create a `Props` interface with required and optional fields, then annotate the component parameter. Use `React.ReactNode` for children. Prefer explicit prop types on exported components — inference alone hides the public API. Both `interface` and `type` work; many teams use `interface` for props by convention.

```tsx
interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

function Button({ label, onClick, variant = "primary", disabled }: ButtonProps) {
  return (
    <button className={`btn-${variant}`} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

**Follow-up:** Should you use `React.FC`?

**Common mistake:** Using `React.FC` everywhere — explicit props typing is the modern preference.

---

### Q50. How do you type `useState` and `useRef`? [must-know]

**Short definition:** Infer from initial value or pass explicit generic; ref needs element type and null.

**Answer:** `useState(0)` infers `number`. For nullable state, pass an explicit union: `useState<User | null>(null)`. `useRef<HTMLInputElement>(null)` types the DOM element; access with optional chaining because `current` starts null. For mutable values that do not trigger re-renders, `useRef<number>(0)` without null is fine.

```tsx
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  inputRef.current?.focus();
}, []);
```

**Follow-up:** What is the difference between `useRef(null)` and `useRef<number>(0)`?

---

### Q51. How do you type event handlers in React? [must-know]

**Short definition:** Use React's synthetic event types parameterized by the element.

**Answer:** React exports typed events: `ChangeEvent`, `FormEvent`, `MouseEvent`, etc. Parameterize with the HTML element: `React.ChangeEvent<HTMLInputElement>`. For forms, `FormEvent<HTMLFormElement>` gives typed `preventDefault`. Avoid `any` for events — the DOM types catch typos on `target` properties.

```tsx
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
};

const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.disabled = true;
};
```

**Follow-up:** What is the difference between `target` and `currentTarget`?

---

### Q52. How do you type discriminated unions for async UI state? [must-know]

**Short definition:** Tag loading/success/error with a `status` literal field.

**Answer:** Model fetch state as a union on `status` instead of separate optional booleans. Each branch carries only the fields that make sense — you cannot read `data` while `status` is `"loading"`. Switch on `status` in render logic; TypeScript narrows automatically. This prevents impossible states and is a common Infosys interview scenario.

```tsx
type FetchState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

function UserView({ state }: { state: FetchState<User> }) {
  switch (state.status) {
    case "idle": return null;
    case "loading": return <Spinner />;
    case "success": return <Profile user={state.data} />;
    case "error": return <Error msg={state.error} />;
  }
}
```

**Follow-up:** How does React Query's status map to this pattern?

---

### Q53. How do you type `children` and render props?

**Short definition:** `React.ReactNode` for children; generics for render-prop components.

**Answer:** `children?: React.ReactNode` accepts elements, strings, numbers, fragments, and null. Use `React.ReactElement` when you need a single element child. Render props pass a function as a prop — type it explicitly. Generic list components use `ListProps<T>` with `render: (item: T) => React.ReactNode`.

```tsx
type ListProps<T> = {
  items: T[];
  render: (item: T) => React.ReactNode;
};

function List<T>({ items, render }: ListProps<T>) {
  return <ul>{items.map((item, i) => <li key={i}>{render(item)}</li>)}</ul>;
}
```

**Follow-up:** What is `PropsWithChildren`?

---

### Q54. How do you type Context and custom hooks?

**Short definition:** `createContext<T | null>` plus a hook that narrows or throws.

**Answer:** Create context with the value type and a sensible default — often `null`. Export a custom hook that reads context, throws if missing provider, and returns the non-null type. This centralizes error handling and gives consumers a clean typed API without null checks everywhere.

```tsx
const UserContext = createContext<User | null>(null);

function useUser(): User {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
```

**Follow-up:** How do you type a context whose value includes setters?

---

### Q55. How do you type custom hooks and their return values? [must-know]

**Short definition:** Explicit return types on public hooks; infer on private helpers.

**Answer:** Custom hooks are functions — type parameters and return types explicitly for hooks consumed across the app. Tuple returns benefit from `as const` or explicit tuples. Return objects with named fields are self-documenting. For complex hooks, export a dedicated return type alias.

```tsx
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount((c) => c + 1);
  return { count, increment, reset: () => setCount(initial) };
}

type UseCounterReturn = ReturnType<typeof useCounter>;
```

**Follow-up:** Can hooks be generic?

---

### Q56. What is the difference between type assertion and type guard in React?

**Short definition:** Assertion trusts the compiler; guards validate at runtime.

**Answer:** `as HTMLDivElement` tells TypeScript to trust you without a runtime check — fine for DOM APIs you control, risky for API data. Type guards use real checks — `instanceof`, `typeof`, custom predicates — and narrow safely. Prefer guards for external data; use assertions sparingly for refs and known DOM structures.

```tsx
const ref = useRef<HTMLDivElement>(null);
// Assertion — you know the ref is attached
const el = ref.current as HTMLDivElement;

// Guard — safer for unknown data
function isUser(data: unknown): data is User {
  return typeof data === "object" && data !== null && "id" in data;
}
```

**Follow-up:** What is the non-null assertion operator `!` and when is it risky?

**Common mistake:** Using `!` on optional API fields that may be missing at runtime.

---

### Q57. How do you type `useReducer` and complex state?

**Short definition:** Discriminated union for actions; generic reducer for state shape.

**Answer:** Define state and action types as interfaces or discriminated unions. The reducer signature is `(state: State, action: Action) => State`. Action unions with a `type` field enable exhaustive switches. For shared logic, export action creators with typed payloads.

```tsx
type State = { count: number };
type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "set"; payload: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment": return { count: state.count + 1 };
    case "decrement": return { count: state.count - 1 };
    case "set": return { count: action.payload };
  }
}
```

**Follow-up:** How does Redux Toolkit simplify this typing?

---

### Q58. How do you fix an API response typed as `any`?

**Short definition:** Define a type, validate at runtime, use generics for wrappers.

**Answer:** Replace `any` with an explicit interface or type for the response shape. At untrusted boundaries, parse with Zod and infer types via `z.infer<typeof Schema>`. Use `unknown` first, then narrow. Wrap fetch in a generic `ApiResponse<T>` for reusable typed clients. Never trust unchecked JSON in production.

```ts
interface UserResponse {
  id: string;
  name: string;
  email: string;
}

async function fetchUser(id: string): Promise<UserResponse> {
  const res = await fetch(`/api/users/${id}`);
  const data: unknown = await res.json();
  // validate with Zod or manual checks before returning
  return data as UserResponse; // prefer runtime validation first
}
```

**Follow-up:** How does `z.infer` connect Zod schemas to TypeScript?

---

## TypeScript with Next.js

### Q59. How do you type Next.js page and layout props (App Router)? [must-know]

**Short definition:** Use framework types for `params`, `searchParams`, and `children`.

**Answer:** In the App Router, page components receive typed props from Next.js. Dynamic routes use `params` with segment names. Search params may be `string | string[] | undefined`. Layouts accept `children: React.ReactNode`. Async server components can await `params` in Next.js 15+. Define local interfaces extending framework types for clarity.

```tsx
interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { q } = await searchParams;
  return <h1>{slug} — {q}</h1>;
}
```

**Follow-up:** How do typed routes (`next/link`) improve this?

---

### Q60. How do you type Server Components vs Client Components?

**Short definition:** Server components are async-capable; client components need `"use client"` and browser APIs.

**Answer:** Server Components run on the server — they can be async, fetch data directly, and must not use hooks or browser APIs. Client Components marked with `"use client"` support `useState`, `useEffect`, and event handlers. Type props the same way — interfaces on both — but keep server-only logic out of client bundles. Passing serializable props from server to client is required.

```tsx
// Server Component — no "use client"
async function ProductPage({ id }: { id: string }) {
  const product = await db.product.find(id);
  return <ProductDetails product={product} />;
}

// Client Component
"use client";
function AddToCart({ productId }: { productId: string }) {
  const [qty, setQty] = useState(1);
  return <button onClick={() => add(productId, qty)}>Add</button>;
}
```

**Follow-up:** What props cannot cross the server/client boundary?

---

### Q61. How do you type Route Handlers and API routes?

**Short definition:** Type `Request`, parse body with schema, return typed `Response` or `NextResponse`.

**Answer:** Route handlers receive the Web `Request` object. Parse JSON into a typed body interface or validate with Zod. Return `NextResponse.json(data)` with a typed payload. Share request/response types with the frontend from a common package to keep contracts aligned.

```ts
interface CreatePostBody {
  title: string;
  content: string;
}

export async function POST(req: Request) {
  const body = (await req.json()) as CreatePostBody;
  const post = await db.post.create(body);
  return NextResponse.json(post);
}
```

**Follow-up:** How do you type dynamic route handler params?

---

### Q62. How do you share types between frontend and backend in a Next.js monorepo?

**Short definition:** Single shared types package imported by app and API layers.

**Answer:** Put domain types — User, Product, DTOs — in `packages/types` or a `shared/` folder. Import the same interfaces in Next.js pages, Route Handlers, and external Express services. Derive create/update shapes with Omit and Partial. Avoid duplicating interfaces on both sides — drift causes subtle production bugs.

```ts
// packages/types/user.ts
export interface User {
  id: string;
  email: string;
}

export type CreateUserDto = Omit<User, "id">;
```

**Follow-up:** How do tRPC and Zod reduce duplication further?

---

## tsconfig & Strict Mode

### Q63. What does `strict` mode enable in tsconfig? [must-know]

**Short definition:** A bundle of strict type-checking flags — industry default for serious apps.

**Answer:** `"strict": true` enables `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, and `alwaysStrict`. It catches null/undefined bugs, implicit any, and unsafe function assignments early. Most production codebases enable strict from day one or migrate toward it deliberately — not disable it permanently when errors appear.

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

**Follow-up:** What does `strictNullChecks` change in everyday code?

**Common mistake:** Turning off strict to fix hundreds of errors instead of fixing incrementally.

---

### Q64. What important tsconfig options should you know?

**Short definition:** Compiler target, module resolution, paths, JSX, and stricter optional flags.

**Answer:** Know `target` and `module` for output format, `moduleResolution` for how imports resolve, `jsx` for React, `paths`/`baseUrl` for aliases, `noEmit` for typecheck-only CI, `skipLibCheck` for faster builds, `isolatedModules` for bundler compatibility, and stricter flags like `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. These shape daily development and CI behavior.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "paths": { "@/*": ["./src/*"] },
    "noEmit": true,
    "skipLibCheck": true,
    "noUncheckedIndexedAccess": true
  }
}
```

**Follow-up:** What does `isolatedModules` require from your code?

---

### Q65. What is the difference between `tsc`, `tsx`, and bundler transpilation?

**Short definition:** `tsc` typechecks and emits; bundlers transpile fast; run both in CI.

**Answer:** `tsc` is the authoritative type checker and can emit JavaScript. `tsx` and `ts-node` run TypeScript directly in Node for development convenience. Bundlers like esbuild and swc transpile quickly but often skip full type checking. Best practice: bundler for dev speed, `tsc --noEmit` in CI as the source of truth. Never assume a green dev build means types are sound.

```bash
# Development
npm run dev          # bundler — fast transpile

# CI
npx tsc --noEmit     # full typecheck, no output
```

**Follow-up:** How would you migrate a large JS codebase to TypeScript incrementally?

**Common mistake:** Relying only on bundler transpile without CI typecheck — errors ship to production.

---
