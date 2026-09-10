# JavaScript Learning Notes

A progressive, hands-on guide to JavaScript — from how code runs in the engine to async patterns, DOM interaction, and reusable utilities. Each lesson builds on the last. Read the takeaway first, study the explanation and code, then try the exercise in your browser console or a small `.js` file.

---

## Runtime & execution context

### Lesson 1. How JavaScript runs: engine, runtime, and call stack

**Takeaway:** JavaScript is single-threaded. Your code runs on a call stack inside an engine (V8, SpiderMonkey); the runtime adds APIs like `setTimeout` and `fetch` that the engine does not provide on its own.

**Explain:** When you run a script, the engine parses source into an AST, compiles it (often JIT), and executes it instruction by instruction. Each function call pushes a new **execution context** (frame) onto the **call stack**. When a function returns, its frame is popped. If the stack grows without bound — for example, infinite recursion — you get `RangeError: Maximum call stack size exceeded`.

```javascript
function a() {
  console.log("a start");
  b();
  console.log("a end");
}

function b() {
  console.log("b");
}

a();
// Output order: a start → b → a end
```

The **runtime environment** (browser or Node.js) wraps the engine. The browser adds the DOM, `window`, `fetch`, and timers; Node adds `fs`, `process`, and its own event loop integration. Your JS never talks to the network or filesystem directly — it calls runtime APIs, which delegate to the OS.

**Tip:** Open DevTools → Sources → add a breakpoint and inspect the **Call Stack** panel while stepping through nested function calls. Seeing frames appear and disappear makes the model concrete.

**Try it:** Write three nested functions that log messages, call the outermost one, and sketch the stack state after each log line on paper before running the code.

---

### Lesson 2. Execution context, hoisting, and the temporal dead zone

**Takeaway:** Before any line runs, JavaScript creates a global execution context and, for each function call, a new local context. `var` declarations are hoisted and initialized as `undefined`; `let` and `const` are hoisted but sit in the temporal dead zone until their declaration line executes.

**Explain:** Each context has two phases: **creation** (allocate variables, set up scope chain, determine `this`) and **execution** (run code line by line). During creation, `var` bindings exist immediately with value `undefined`. `let`/`const` bindings exist but are inaccessible — accessing them throws `ReferenceError`.

```javascript
console.log(greet); // undefined (not ReferenceError)
var greet = "hello";

console.log(count); // ReferenceError — TDZ
let count = 0;

function demo() {
  console.log(x); // undefined
  var x = 10;

  // console.log(y); // ReferenceError
  let y = 20;
}
```

Function declarations are fully hoisted (name + body), which is why you can call `foo()` before its declaration in the same scope. Function expressions assigned to `var` follow `var` hoisting rules — only the name is hoisted, not the assignment.

**Tip:** Prefer `let` and `const` by default. Use `const` unless you need to reassign the binding. This avoids hoisting surprises and makes intent clearer.

**Try it:** Predict the output of a snippet that mixes `var`, `let`, and a function declaration before running it. Then refactor to use only `const`/`let` and confirm behavior is unchanged.

---

### Lesson 3. Scope chain and lexical (static) scope

**Takeaway:** JavaScript resolves variable names by walking outward through nested scopes at the point where a function was **written**, not where it is **called**. Inner functions retain access to outer bindings even after the outer function returns.

**Explain:** Scope is established by blocks (`{}` with `let`/`const`), functions, and modules. When the engine looks up `name`, it checks the current scope, then the parent, then the parent of that, until it reaches the global object or throws `ReferenceError`.

```javascript
const theme = "dark";

function makeButton(label) {
  const prefix = "[UI]";
  return function render() {
    return `${prefix} ${label} (${theme})`;
  };
}

const btn = makeButton("Save");
console.log(btn()); // "[UI] Save (dark)"
// `prefix`, `label`, and `theme` are still reachable via closure
```

This is **lexical scoping**: `render` closes over variables from `makeButton`'s scope and the global scope. Changing `theme` after creating `btn` affects the next call because the closure holds a live binding, not a snapshot (for `let`/`const`/`var` variables — not for primitive parameters copied at call time unless they're objects).

**Tip:** Draw scope boxes on paper: global → function → block. Arrow a variable lookup from inner to outer until you find the binding.

**Try it:** Write a counter factory `createCounter(start)` that returns `{ increment, getValue }` without using a class. Verify two counters do not share state.

---

### Lesson 4. Strict mode and global vs module scope

**Takeaway:** `'use strict'` enables stricter parsing and runtime checks. Modules and class bodies run in strict mode automatically. In sloppy mode, assigning to an undeclared variable creates a global property; in strict mode it throws.

**Explain:** Strict mode fixes silent mistakes: duplicate parameter names, octal literals, `delete` of non-configurable properties, and `this` defaulting to `undefined` in plain functions instead of the global object.

```javascript
"use strict";

function sloppy() {
  // In non-strict: creates window.leaked = 1 in browsers
  // leaked = 1; // ReferenceError in strict mode
}

function showThis() {
  console.log(this); // undefined (strict), not window
}
showThis();
```

**ES modules** (`<script type="module">` or `import` in Node) have their own top-level scope — top-level `const` is not attached to `window`. Each module is evaluated once and exports live bindings.

```javascript
// math.js
export const PI = 3.14159;
export function area(r) { return PI * r * r; }

// app.js
import { area } from "./math.js";
console.log(area(2));
```

**Tip:** Treat strict mode + modules as the modern baseline. Avoid relying on implicit globals or `this`-as-`window` behavior.

**Try it:** Create two files with ES module imports in a small Vite or native `type="module"` HTML setup. Confirm top-level variables are not on `window`.

---

## Types & coercion

### Lesson 5. Primitives vs objects: typeof and value categories

**Takeaway:** JavaScript has seven primitive types (`undefined`, `null`, `boolean`, `number`, `bigint`, `string`, `symbol`) and one object type (including arrays, functions, dates). Primitives are immutable; objects are mutable references.

**Explain:** `typeof` is quick but imperfect: `typeof null === "object"` is a long-standing bug; functions report `"function"` even though they are objects.

```javascript
typeof undefined;   // "undefined"
typeof "hi";        // "string"
typeof 42;          // "number"
typeof true;        // "boolean"
typeof Symbol();    // "symbol"
typeof 10n;         // "bigint"
typeof null;        // "object" (historical quirk)
typeof {};          // "object"
typeof [];          // "object"
typeof (() => {});  // "function"
```

Primitives are stored **by value** — copying assigns the value. Objects are stored **by reference** — copying copies the pointer, so mutating through either variable affects the same object.

```javascript
let a = { n: 1 };
let b = a;
b.n = 2;
console.log(a.n); // 2 — same object
```

**Tip:** Use `Array.isArray(x)`, `x === null`, or `Object.prototype.toString.call(x)` when you need precise type checks beyond `typeof`.

**Try it:** Write a function `describe(value)` that returns a human-readable type string distinguishing `null`, arrays, plain objects, and primitives.

---

### Lesson 6. Truthy, falsy, and explicit coercion

**Takeaway:** In boolean contexts, values coerce to `true` or `false`. Falsy values are `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, and `NaN`. Everything else is truthy — including `[]`, `{}`, and `"0"`.

**Explain:** Coercion happens in `if`, `while`, `!`, `&&`, `||`, and the ternary operator. Explicit conversion uses `Boolean()`, `!!`, `Number()`, `String()`, or `BigInt()`.

```javascript
if ("") console.log("never"); // empty string is falsy
if ("0") console.log("runs"); // non-empty string is truthy

console.log(Boolean([]));  // true
console.log(Boolean({}));  // true
console.log(Number("42")); // 42
console.log(Number(""));   // 0
console.log(String(null)); // "null"
```

**Abstract equality** (`==`) applies coercion rules (avoid in production). **Strict equality** (`===`) compares type and value without conversion.

```javascript
0 == false;   // true (coercion)
0 === false;  // false
null == undefined; // true
null === undefined; // false
```

**Tip:** Use `===` and `!==` by default. When accepting user input, coerce explicitly at boundaries (forms, APIs) rather than relying on implicit rules deep in logic.

**Try it:** Build a `toBool(input)` helper that treats `"false"`, `"0"`, and `""` as false but preserves real booleans. Write three test cases.

---

### Lesson 7. Number quirks: NaN, Infinity, and floating-point

**Takeaway:** All numbers are IEEE 754 double-precision floats. `NaN` is not equal to anything including itself; use `Number.isNaN`. Decimal math can surprise you — use rounding strategies or integers (cents) for money.

**Explain:**

```javascript
0.1 + 0.2;              // 0.30000000000000004
Number.isNaN(NaN);      // true
NaN === NaN;            // false
Number.isNaN("x");      // false — does not coerce
isNaN("x");             // true — coerces first (avoid)

Number.MAX_SAFE_INTEGER; // 9007199254740991
9007199254740992 === 9007199254740992 + 1; // true — precision lost
```

`parseInt("42px", 10)` parses leading digits; `Number("42px")` yields `NaN`. Always pass radix `10` to `parseInt` unless you intentionally parse octal/hex.

**Tip:** For currency, store amounts as integer cents or use a decimal library. For comparisons, consider `Number.EPSILON` or `Math.abs(a - b) < epsilon` for floats.

**Try it:** Write `roundMoney(n)` that rounds a dollar float to two decimal places reliably. Test with `0.1 + 0.2` and `1.005`.

---

### Lesson 8. Equality deep dive: SameValue and object identity

**Takeaway:** `===` uses SameValue equality for primitives. Objects are equal only if they are the **same reference**. To compare structure, you must compare properties (shallow or deep) or serialize — never `===` alone.

**Explain:**

```javascript
const a = { x: 1 };
const b = { x: 1 };
const c = a;

a === b; // false — different objects
a === c; // true — same reference

Object.is(NaN, NaN);     // true (SameValue)
Object.is(+0, -0);       // false
+0 === -0;               // true (=== treats them equal)
```

Shallow compare checks top-level keys:

```javascript
function shallowEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  return keys1.every((key) => Object.is(obj1[key], obj2[key]));
}
```

**Tip:** React's dependency arrays and memoization rely on reference equality for objects. Create new object references only when data actually changes.

**Try it:** Implement `shallowEqual` and verify it returns `true` for `{ a: 1, b: [2] }` vs a copy with the **same array reference** but `false` when the nested array is cloned.

---

## Functions & closures

### Lesson 9. Function declarations, expressions, and arrow functions

**Takeaway:** Declarations are hoisted and named; expressions bind a function to a variable; arrow functions lexically capture `this` and cannot be used as constructors. Choose based on hoisting needs, `this` behavior, and readability.

**Explain:**

```javascript
// Declaration — hoisted
log("hi");
function log(msg) { console.log(msg); }

// Expression
const multiply = function (a, b) { return a * b; };

// Arrow — concise, lexical this
const nums = [1, 2, 3];
const doubled = nums.map((n) => n * 2);

const counter = {
  count: 0,
  inc() {
    setTimeout(() => {
      this.count++; // `this` is counter (lexical from inc)
    }, 0);
  },
};
```

Arrows have no `arguments` object (use rest `...args`). They cannot be `new`ed. For object methods that need dynamic `this`, use shorthand method syntax (`inc() {}`), not arrows.

**Tip:** Use arrows for callbacks and short expressions; use declarations for top-level named utilities; use method shorthand inside objects and classes.

**Try it:** Refactor a `setTimeout` callback that incorrectly uses `this` with a regular function into an arrow inside a method and confirm `this.count` increments.

---

### Lesson 10. Parameters: defaults, rest, and spread

**Takeaway:** Default parameters apply when the argument is `undefined`. Rest collects remaining arguments into an array; spread expands iterables into individual elements. Both are essential for flexible APIs.

**Explain:**

```javascript
function greet(name = "Guest", punctuation = "!") {
  return `Hello, ${name}${punctuation}`;
}
greet(undefined, "?"); // "Hello, Guest?"

function sum(...nums) {
  return nums.reduce((total, n) => total + n, 0);
}
sum(1, 2, 3); // 6

const defaults = { theme: "light", lang: "en" };
const user = { lang: "fr" };
const config = { ...defaults, ...user, theme: "dark" };
// { theme: "dark", lang: "fr" } — later keys win
```

Rest must be the last formal parameter. Spread works on arrays, strings, and any iterable in array literals, object literals (shallow clone/merge), and function calls.

**Tip:** Use rest instead of `arguments` in modern code — it's real array-like and works in arrow functions.

**Try it:** Write `clamp(value, min, max)` with default `min = 0`, `max = 100`, then a wrapper `clampPositive(...values)` that clamps each argument using spread.

---

### Lesson 11. Closures: private state and factory functions

**Takeaway:** A closure is a function plus the lexical environment it was created in. Closures enable data privacy, partial application, and callbacks that remember context — the backbone of many JS patterns.

**Explain:**

```javascript
function createWallet(initial) {
  let balance = initial; // private to the closure

  return {
    deposit(amount) {
      balance += amount;
      return balance;
    },
    withdraw(amount) {
      if (amount > balance) throw new Error("Insufficient funds");
      balance -= amount;
      return balance;
    },
    getBalance() {
      return balance;
    },
  };
}

const wallet = createWallet(100);
wallet.deposit(50);   // 150
wallet.withdraw(30);  // 120
// wallet.balance — undefined; not exposed
```

Closures in loops were historically tricky with `var`:

```javascript
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 0, 1, 2 — new binding per iteration
}
```

**Tip:** Closures retain references, not copies, to outer variables (unless you copy primitives into a new `let` in each iteration). Watch memory: long-lived callbacks closing over large objects can prevent garbage collection.

**Try it:** Implement a `once(fn)` function that runs `fn` only on the first call and returns the same result thereafter.

---

### Lesson 12. Higher-order functions: map, filter, reduce

**Takeaway:** Functions are first-class values — they can be passed as arguments and returned. `map`, `filter`, and `reduce` express data transformations declaratively and chain cleanly.

**Explain:**

```javascript
const products = [
  { name: "Pen", price: 1.5, qty: 10 },
  { name: "Notebook", price: 4, qty: 3 },
  { name: "Stapler", price: 8, qty: 1 },
];

const inventoryValue = products
  .filter((p) => p.qty > 0)
  .map((p) => ({ ...p, total: p.price * p.qty }))
  .reduce((sum, p) => sum + p.total, 0);

console.log(inventoryValue); // 34.5
```

`reduce` is the most general — it can implement map and filter. Always provide an initial accumulator when the type matters (numbers, objects, arrays).

```javascript
const words = ["apple", "banana", "apricot"];
const byLetter = words.reduce((acc, word) => {
  const letter = word[0];
  acc[letter] = (acc[letter] ?? 0) + 1;
  return acc;
}, {});
// { a: 2, b: 1 }
```

**Tip:** Prefer these over manual `for` loops when transforming collections — intent is clearer. For very hot paths or early `break`, a `for...of` loop may still be appropriate.

**Try it:** Given an array of transaction `{ type: "credit"|"debit", amount }`, compute net balance using a single `reduce`.

---

### Lesson 13. IIFE, recursion, and call stack discipline

**Takeaway:** An IIFE (Immediately Invoked Function Expression) runs once to create a private scope. Recursion solves problems by self-similar subproblems but must have a base case and progress toward it to avoid stack overflow.

**Explain:**

```javascript
// IIFE — avoid polluting global scope (less needed with modules)
const app = (function () {
  const secret = "hidden";
  return { getSecret: () => secret };
})();

function factorial(n) {
  if (n <= 1) return 1; // base case
  return n * factorial(n - 1);
}
factorial(5); // 120
```

Tail call optimization is not guaranteed in all JS engines; deep recursion may fail. Convert to iteration when depth is unbounded:

```javascript
function factorialIter(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}
```

**Tip:** For tree/graph walks, consider an explicit stack (iterative DFS) or queue (BFS) instead of naive recursion on large structures.

**Try it:** Write recursive and iterative versions of `sumNested(array)` where arrays may contain numbers or nested arrays, e.g. `[1, [2, [3]], 4]` → `10`.

---

## this & prototypes

### Lesson 14. The four rules of `this` binding

**Takeaway:** `this` is determined by **how** a function is called, not where it is defined — except arrow functions, which inherit `this` lexically. Rules: default binding, implicit (method), explicit (`call`/`apply`/`bind`), and `new` binding.

**Explain:**

```javascript
function show() {
  console.log(this);
}
show(); // default: undefined (strict) or global

const user = {
  name: "Ada",
  greet() {
    console.log(this.name);
  },
};
user.greet(); // implicit: user

const greetFn = user.greet;
greetFn(); // default binding — lost context!

show.call({ id: 1 }); // explicit binding

function Person(name) {
  this.name = name;
}
const p = new Person("Lin"); // new: fresh object as this
```

`bind` returns a new function with permanently bound `this`:

```javascript
const boundGreet = user.greet.bind(user);
boundGreet(); // "Ada"
```

**Tip:** Extracting methods (`const fn = obj.method`) loses implicit binding — use `bind`, wrap in arrow inside the method, or call as `obj.method()`.

**Try it:** Create an object with two methods that call each other via `this`. Break it by destructuring one method, then fix with `bind`.

---

### Lesson 15. Prototype chain and object creation patterns

**Takeaway:** Objects delegate property lookups to their `[[Prototype]]` (exposed as `__proto__` or via `Object.getPrototypeOf`). Functions have a `prototype` property used when invoked with `new`. Classes are syntactic sugar over prototypes.

**Explain:**

```javascript
const animal = {
  speak() {
    return `${this.name} makes a sound`;
  },
};

const dog = Object.create(animal);
dog.name = "Rex";
dog.speak(); // "Rex makes a sound"

function Person(name) {
  this.name = name;
}
Person.prototype.greet = function () {
  return `Hi, I'm ${this.name}`;
};

const ada = new Person("Ada");
ada.greet(); // uses Person.prototype
```

Class syntax:

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    return `Hi, I'm ${this.name}`;
  }
}
```

Methods on the prototype are shared; own properties live on the instance. `hasOwnProperty` checks own keys only; `in` checks the full chain.

**Tip:** Prefer `class` for readability today, but understand prototypes for debugging (`instanceof`, library code, and interview questions).

**Try it:** Build the same `Counter` with (a) a factory + closures, (b) constructor + prototype, and (c) `class`. List trade-offs for each.

---

### Lesson 16. Inheritance, `super`, and composition over inheritance

**Takeaway:** Prototypal inheritance links child prototypes to parent prototypes. `extends` and `super` wire this up in classes. Favor **composition** (has-a) when behavior mixing is simpler than deep inheritance trees.

**Explain:**

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} speaks`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // must call before using `this`
    this.breed = breed;
  }
  speak() {
    return `${super.speak()} — woof! (${this.breed})`;
  }
}

const d = new Dog("Rex", "Lab");
d.speak();
```

Composition example:

```javascript
const canFly = {
  fly() { return `${this.name} flies`; },
};

function createBird(name) {
  return Object.assign({ name }, canFly);
}
```

**Tip:** Deep inheritance hierarchies become fragile. Mix small behaviors (objects/functions) into factories or classes instead of stacking `extends` many levels.

**Try it:** Model `Employee` and `Manager` where `Manager` has a list of reports. Use composition (`reports` array + delegate methods) rather than Manager extending Employee unless shared state truly warrants it.

---

## ES6+: destructuring, modules, iterators

### Lesson 17. Destructuring and shorthand object syntax

**Takeaway:** Destructuring unpacks arrays and objects into variables. Combined with default values and rest patterns, it makes function parameters and API responses concise to work with.

**Explain:**

```javascript
const [first, second, ...rest] = [10, 20, 30, 40];
// first 10, second 20, rest [30, 40]

const { name, age = 18, ...others } = { name: "Sam", city: "NYC" };
// name "Sam", age 18, others { city: "NYC" }

function printUser({ name, role = "guest" }) {
  console.log(`${name} (${role})`);
}

const x = 1, y = 2;
const point = { x, y }; // shorthand property
```

Swap without a temp variable:

```javascript
let a = 1, b = 2;
[a, b] = [b, a];
```

Nested destructuring works but keep it readable — extract in steps for deeply nested API JSON.

**Tip:** In function signatures, destructure options objects with defaults instead of positional parameters when there are many optional settings.

**Try it:** Write `normalizeUser(raw)` that destructures `{ data: { id, attributes: { email, name } } }` with defaults and returns a flat `{ id, email, name }`.

---

### Lesson 18. ES modules: import, export, and live bindings

**Takeaway:** ES modules are statically analyzable, run in strict mode, and support named exports, default exports, and re-exports. Imported bindings are live — if the exporting module updates a `let`, importers see the new value.

**Explain:**

```javascript
// logger.js
export const levels = ["info", "warn", "error"];
export function log(level, msg) {
  console.log(`[${level}] ${msg}`);
}
export default function createLogger(prefix) {
  return (msg) => log("info", `${prefix}: ${msg}`);
}

// app.js
import createLogger, { log, levels } from "./logger.js";
import * as Logger from "./logger.js"; // namespace object

const info = createLogger("APP");
info("started");
```

Dynamic import returns a promise — useful for code splitting:

```javascript
const module = await import("./heavy-chart.js");
module.renderChart(data);
```

**Tip:** Prefer named exports for utilities (better tree-shaking and explicit APIs). Reserve default export for the primary thing a file provides.

**Try it:** Split a tiny app into three modules: `constants.js`, `math.js`, and `main.js`. Use both named and default exports and verify live binding by exporting a counter incremented from one file and read from another.

---

### Lesson 19. Iterators, iterables, and for...of

**Takeaway:** An **iterable** implements `Symbol.iterator` returning an iterator. An **iterator** has `next()` returning `{ value, done }`. `for...of`, spread, and destructuring consume iterables.

**Explain:**

```javascript
const range = {
  from: 1,
  to: 3,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        if (current <= last) {
          return { value: current++, done: false };
        }
        return { done: true };
      },
    };
  },
};

for (const n of range) console.log(n); // 1, 2, 3
console.log([...range]); // [1, 2, 3]
```

Built-in iterables: arrays, strings, maps, sets, and `arguments`. Plain objects are not iterable unless you define `Symbol.iterator`.

Generators (`function*`) are a concise way to create iterators:

```javascript
function* ids() {
  let id = 1;
  while (true) yield id++;
}
const gen = ids();
gen.next(); // { value: 1, done: false }
```

**Tip:** Custom iterables make collection-like objects feel native. Generators shine for lazy sequences and paginated data streams.

**Try it:** Implement an iterable `LinkedList` class that supports `for...of` over its values without exposing internal nodes publicly.

---

### Lesson 20. Symbols, Map, Set, and structured data choices

**Takeaway:** `Symbol` creates unique property keys — useful for meta-data and avoiding name clashes. `Map` and `Set` provide better semantics than plain objects/arrays for keyed collections and uniqueness, especially with non-string keys.

**Explain:**

```javascript
const ID = Symbol("id");
const user = { name: "Lee", [ID]: 42 };
Object.keys(user); // ["name"] — symbols omitted

const map = new Map();
map.set({ k: 1 }, "metadata"); // object keys OK
map.get({ k: 1 }); // undefined — different object reference

const set = new Set([1, 2, 2, 3]);
[...set]; // [1, 2, 3]

// WeakMap keys must be objects — useful for private caches tied to object lifetime
const cache = new WeakMap();
function expensive(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const result = Object.keys(obj).length;
  cache.set(obj, result);
  return result;
}
```

**Tip:** Use `Map` when keys are unknown strings or you need frequent add/delete with size tracking. Use plain objects for JSON-serializable records with fixed shape.

**Try it:** Deduplicate an array of user objects by `id` using a `Map`, preserving first occurrence order.

---

## Async: promises, async/await, event loop

### Lesson 21. Synchronous vs asynchronous code and the event loop

**Takeaway:** JavaScript runs one call stack thread. Async work is delegated to the runtime (timers, network, I/O). When async work completes, callbacks join **task queues**; the **event loop** picks them when the stack is empty.

**Explain:**

```javascript
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

console.log("4");
// Order: 1, 4, 3, 2
```

Microtasks (promise callbacks, `queueMicrotask`) run before the next macrotask (timers, I/O). That is why `3` prints before `2` even though both are "async."

The loop in plain language:

1. Run synchronous code until the stack clears.
2. Drain all microtasks.
3. Take one macrotask (e.g. timer callback).
4. Repeat.

**Tip:** Long synchronous loops block rendering and input. Break heavy work into chunks (`requestAnimationFrame`, `setTimeout(0)`, or Web Workers).

**Try it:** Predict output for a snippet mixing `setTimeout`, promises, and synchronous logs. Verify in Node and the browser — order should match for this example.

---

### Lesson 22. Callbacks, callback hell, and error-first conventions

**Takeaway:** Callbacks are functions passed to run later. Node popularized error-first callbacks `(err, data) => {}`. Deep nesting ("callback hell") hurts readability — promises and async/await improve structure, but callbacks remain at the runtime boundary.

**Explain:**

```javascript
function fetchUser(id, callback) {
  setTimeout(() => {
    if (id <= 0) return callback(new Error("Invalid id"));
    callback(null, { id, name: "User" + id });
  }, 100);
}

fetchUser(1, (err, user) => {
  if (err) return console.error(err);
  fetchUser(user.id + 1, (err2, user2) => {
    if (err2) return console.error(err2);
    console.log(user, user2);
  });
});
```

Promises flatten nesting:

```javascript
function fetchUserAsync(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id <= 0) reject(new Error("Invalid id"));
      else resolve({ id, name: "User" + id });
    }, 100);
  });
}

fetchUserAsync(1)
  .then((user) => fetchUserAsync(user.id + 1))
  .then(console.log)
  .catch(console.error);
```

**Tip:** When wrapping callback APIs, promisify once (`util.promisify` in Node or a small helper) and use async/await everywhere else.

**Try it:** Wrap a fake `readFile(path, cb)` callback API in a `readFileAsync` promise and load two files sequentially with async/await.

---

### Lesson 23. Promises: states, chaining, and combinators

**Takeaway:** A promise is pending, fulfilled, or rejected — transitioning once. `.then` handles fulfillment, `.catch` handles rejection, `.finally` runs either way. `Promise.all`, `race`, `allSettled`, and `any` coordinate multiple async operations.

**Explain:**

```javascript
const p = new Promise((resolve, reject) => {
  resolve(42);
});

p.then((value) => value * 2)
 .then((value) => {
   throw new Error("oops");
 })
 .catch((err) => {
   console.error(err.message);
   return "recovered";
 })
 .finally(() => console.log("cleanup"));
```

Combinators:

```javascript
const a = Promise.resolve(1);
const b = Promise.resolve(2);

Promise.all([a, b]);        // [1, 2] — fails fast if one rejects
Promise.allSettled([a, b]); // [{status:"fulfilled",...}, ...]
Promise.race([a, b]);       // first settled
Promise.any([Promise.reject(1), b]); // first fulfilled
```

`.then` returns a new promise, enabling chains. Returning a value wraps it; returning a promise adopts its fate.

**Tip:** Always return promises from `.then` handlers when starting async work — forgetting `return` breaks chains silently.

**Try it:** Fetch three fake delays with `Promise.allSettled`, then log which succeeded and which failed without try/catch around the whole batch.

---

### Lesson 24. async/await and structured concurrency

**Takeaway:** `async` functions always return a promise. `await` pauses within an async function until a promise settles, writing async code that reads synchronously. Use `try/catch` for errors and `Promise.all` for parallel independent work.

**Explain:**

```javascript
async function loadDashboard(userId) {
  try {
    const user = await fetchUserAsync(userId);
    const [posts, notifications] = await Promise.all([
      fetchPostsAsync(user.id),
      fetchNotificationsAsync(user.id),
    ]);
    return { user, posts, notifications };
  } catch (err) {
    console.error("Dashboard failed:", err.message);
    throw err;
  }
}
```

Sequential vs parallel:

```javascript
// Sequential — slower
const a = await step1();
const b = await step2();

// Parallel — independent steps
const [a2, b2] = await Promise.all([step1(), step2()]);
```

Top-level await works in modules:

```javascript
// config.js
export const settings = await fetch("/api/settings").then((r) => r.json());
```

**Tip:** Await inside loops runs sequentially. Use `Promise.all(items.map(async ...))` when operations are independent.

**Try it:** Write `retry(fn, times)` that awaits an async function and retries on failure up to `times`, with a 200ms delay between attempts.

---

### Lesson 25. Microtasks, macrotasks, and async debugging

**Takeaway:** Understanding queue ordering explains subtle bugs: DOM updates, promise chains, and `setTimeout(0)` interleaving. Async debugging means reading stack traces, logging with labels, and breaking on uncaught promise rejections.

**Explain:**

```javascript
async function a() {
  console.log("a start");
  await null; // yields to microtask queue
  console.log("a end");
}

console.log("sync");
a();
console.log("sync end");

// sync → a start → sync end → a end
```

`await` schedules continuation as a microtask. Nested async functions add layers but still respect microtask draining before timers.

Debugging tips:

```javascript
// Label logs
console.log("[fetchUser]", userId);

// Break on uncaught exceptions in DevTools
// Sources → pause on uncaught exceptions

// Unhandled rejection
process.on("unhandledRejection", console.error); // Node
window.addEventListener("unhandledrejection", (e) => {
  console.error(e.reason);
});
```

**Tip:** If UI doesn't update when expected, check whether you're mutating state before an async gap and reading stale closure values — log right before and after `await`.

**Try it:** Create a function that logs three steps using `await Promise.resolve()` between each and diagram which logs are sync vs microtask.

---

## DOM & events

### Lesson 26. Selecting and updating the DOM

**Takeaway:** The DOM is a tree of nodes representing HTML. Use `querySelector` / `querySelectorAll` for selection, `textContent` / `innerHTML` (carefully) for content, and `classList` / `dataset` for attributes and state.

**Explain:**

```javascript
const app = document.querySelector("#app");
const items = document.querySelectorAll(".item");

app.textContent = "Hello"; // safe — no HTML parsing
// app.innerHTML = userInput; // risky — XSS if unsanitized

const btn = document.createElement("button");
btn.textContent = "Click me";
btn.classList.add("primary");
btn.dataset.action = "save";
app.append(btn);

items.forEach((el) => {
  el.classList.toggle("active", el.dataset.id === "1");
});
```

Prefer `document.createElement` and `append` over concatenating HTML strings for dynamic UI. When you must parse HTML, sanitize untrusted input.

**Tip:** Cache DOM references outside hot loops, but don't over-cache — if the DOM is recreated, stale references point nowhere.

**Try it:** Build a tiny todo list renderer: given `{ id, text, done }[]`, clear `#list` and render `<li>` elements with a done class toggle — no framework.

---

### Lesson 27. Events: bubbling, delegation, and preventDefault

**Takeaway:** Events flow from target → ancestors (bubble phase) unless stopped. **Event delegation** attaches one listener on a parent and uses `event.target` to handle children — ideal for dynamic lists. `preventDefault` stops default browser behavior; `stopPropagation` stops further propagation.

**Explain:**

```javascript
const list = document.querySelector("#list");

list.addEventListener("click", (event) => {
  const item = event.target.closest("[data-id]");
  if (!item || !list.contains(item)) return;

  const id = item.dataset.id;
  console.log("Clicked item", id);
});

const form = document.querySelector("#form");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  console.log(Object.fromEntries(data));
});
```

Use `{ capture: true }` for capture phase (root → target). `{ once: true }` auto-removes after one fire. Passive listeners improve scroll performance when you won't call `preventDefault`.

**Tip:** Delegate from stable ancestors (`document`, `#app`) for lists that re-render. Compare `event.target` (deepest element) vs `event.currentTarget` (element with listener).

**Try it:** Render a button list dynamically. One delegated click handler on `#toolbar` should log which button was pressed even after buttons are replaced.

---

### Lesson 28. Timers, requestAnimationFrame, and browser APIs

**Takeaway:** `setTimeout` and `setInterval` schedule macrotasks. `requestAnimationFrame` syncs work to display refreshes (~60fps) — best for animations. Modern browsers expose rich APIs: `fetch`, `localStorage`, `IntersectionObserver`, and more.

**Explain:**

```javascript
// Debounced resize handler pattern
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    console.log("layout recalc", window.innerWidth);
  }, 150);
});

// Animation
let start;
function frame(timestamp) {
  if (!start) start = timestamp;
  const progress = Math.min((timestamp - start) / 1000, 1);
  box.style.transform = `translateX(${progress * 200}px)`;
  if (progress < 1) requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Storage
localStorage.setItem("theme", "dark");
localStorage.getItem("theme");
```

`fetch` returns a promise for HTTP:

```javascript
const res = await fetch("/api/users");
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const users = await res.json();
```

**Tip:** Prefer `rAF` over `setInterval` for visual updates — it pauses in background tabs and aligns with paint.

**Try it:** Animate a div moving across the screen with `requestAnimationFrame`, stopping after 2 seconds. Log frame count.

---

## Errors & debugging

### Lesson 29. Throwing, catching, and custom errors

**Takeaway:** Use `throw` to signal exceptional conditions. `try/catch/finally` handles errors locally; uncaught errors propagate until they crash the thread or trigger global handlers. Custom error classes add `name` and context for clearer debugging.

**Explain:**

```javascript
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

function parseAge(input) {
  const age = Number(input);
  if (Number.isNaN(age)) throw new ValidationError("age", "Must be a number");
  if (age < 0 || age > 130) throw new ValidationError("age", "Out of range");
  return age;
}

try {
  parseAge("abc");
} catch (err) {
  if (err instanceof ValidationError) {
    console.error(`Invalid ${err.field}: ${err.message}`);
  } else {
    throw err; // rethrow unknown errors
  }
} finally {
  console.log("attempt finished");
}
```

Distinguish **operational** errors (expected, handle gracefully) from **programmer** errors (bugs — fix code). Don't catch everything and swallow silently.

**Tip:** When rethrowing, preserve the original error as `cause` (ES2022): `throw new Error("Failed to save", { cause: err })`.

**Try it:** Build `assert(condition, message)` that throws an `AssertionError` subclass. Use it in a small validator for email format.

---

### Lesson 30. Debugging workflow: breakpoints, logging, and DevTools

**Takeaway:** Effective debugging combines reproducible steps, strategic `console` methods, breakpoints, and network inspection — not random `console.log` everywhere.

**Explain:**

```javascript
const user = { id: 1, roles: ["admin"] };

console.log("user", user);
console.table(user.roles.map((r) => ({ role: r })));
console.time("fetch");
await fetch("/api/data");
console.timeEnd("fetch");

console.assert(user.id > 0, "user id must be positive");

// Conditional breakpoint in DevTools: right-click line number → add condition
// e.g. id === 42
```

Workflow:

1. Reproduce reliably with minimal input.
2. Form a hypothesis (wrong value, timing, scope).
3. Inspect with breakpoint or targeted log.
4. Fix and add a regression test or guard.

Network tab shows fetch status, payload, and timing. Sources tab shows async stack traces for promises when supported.

**Tip:** Use `debugger;` statement to pause when DevTools is open — faster than hunting line numbers during active investigation.

**Try it:** Take a buggy function that returns `NaN` for some inputs. Find the bad path using one conditional breakpoint and document the fix in a comment.

---

## Practical patterns: debounce, deep clone, curry

### Lesson 31. Debounce and throttle

**Takeaway:** **Debounce** delays execution until input stops for a wait period — ideal for search-as-you-type. **Throttle** runs at most once per interval — ideal for scroll/resize handlers. Both reduce expensive work.

**Explain:**

```javascript
function debounce(fn, wait) {
  let timerId;
  return function debounced(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), wait);
  };
}

function throttle(fn, limit) {
  let inThrottle = false;
  return function throttled(...args) {
    if (inThrottle) return;
    fn.apply(this, args);
    inThrottle = true;
    setTimeout(() => { inThrottle = false; }, limit);
  };
}

const onSearch = debounce((query) => {
  console.log("API search:", query);
}, 300);

const onScroll = throttle(() => {
  console.log("scroll position", window.scrollY);
}, 200);
```

Debounce trailing edge (above) fires after typing pauses. Leading-edge debounce fires immediately then waits — useful for button double-submit guards.

**Tip:** Always cancel debounced timers on component unmount (call a `.cancel()` if you add one) to avoid setState on unmounted components in React.

**Try it:** Wire debounce to an `<input>` and log API calls — confirm rapid typing produces one log after pause, not one per keystroke.

---

### Lesson 32. Deep clone vs shallow copy

**Takeaway:** Shallow copy duplicates top-level properties; nested objects are still shared. Deep clone recursively copies the graph. `structuredClone` (modern) handles most cases; JSON round-trip loses types and skips functions, `undefined`, and cycles.

**Explain:**

```javascript
const original = {
  name: "Ada",
  tags: ["dev", "math"],
  meta: { active: true },
};

const shallow = { ...original };
shallow.tags.push("new");
original.tags.length; // 3 — shared array

const deep = structuredClone(original);
deep.tags.push("clone-only");
original.tags.length; // still 3

// Manual deep clone (simplified — no cycles, no Map/Set)
function deepClone(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(deepClone);
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => [k, deepClone(v)])
  );
}
```

JSON limitations:

```javascript
JSON.parse(JSON.stringify({ d: new Date(), fn: () => {} }));
// Date becomes string, fn omitted
```

**Tip:** For immutable state updates (Redux, React), shallow copy plus targeted nested copy is often enough and faster than full deep clone.

**Try it:** Compare mutating nested data after `{...obj}`, `structuredClone`, and `JSON` clone. List which fields still alias the original.

---

### Lesson 33. Currying and partial application

**Takeaway:** **Currying** transforms a function `f(a,b,c)` into `f(a)(b)(c)`. **Partial application** fixes some arguments upfront. Both create specialized functions from general ones — useful for configuration and reusable pipelines.

**Explain:**

```javascript
// Curried add
const add = (a) => (b) => a + b;
const add5 = add(5);
add5(3); // 8

function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...next) => curried.apply(this, args.concat(next));
  };
}

const multiply = (a, b, c) => a * b * c;
const curriedMultiply = curry(multiply);
curriedMultiply(2)(3)(4); // 24
curriedMultiply(2, 3)(4); // 24

// Partial application
const partial = (fn, ...fixed) => (...rest) => fn(...fixed, ...rest);
const greet = (greeting, name) => `${greeting}, ${name}`;
const sayHello = partial(greet, "Hello");
sayHello("Sam"); // "Hello, Sam"
```

**Tip:** Currying shines in functional pipelines; in everyday app code, default parameters and options objects are often clearer — use currying when you genuinely reuse specialized functions.

**Try it:** Curry a `fetchWithBase(baseUrl)(path)(options)` helper and create `fetchApi` preset with your API base URL.

---

### Lesson 34. Memoization and caching function results

**Takeaway:** Memoization stores results of expensive pure functions keyed by arguments. It trades memory for speed when the same inputs repeat — classic for recursion (Fibonacci), parsing, and derived selectors.

**Explain:**

```javascript
function memoize(fn, keyFn = (...args) => JSON.stringify(args)) {
  const cache = new Map();
  return function memoized(...args) {
    const key = keyFn(...args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const fib = memoize(function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
});

fib(50); // fast with cache
```

For single-argument primitives, a plain object or `Map` works. For multiple args or object params, define a stable `keyFn`. Clear cache when inputs change externally.

**Tip:** Memoize only **pure** functions — cached results become wrong if the function depends on hidden mutable state or time.

**Try it:** Memoize a slow `isPrime(n)` and time `isPrime(10007)` twice with `console.time`. Add cache size logging.

---

### Lesson 35. Piping, composition, and small utility design

**Takeaway:** **Compose** functions right-to-left; **pipe** left-to-right. Small, pure utilities composed together beat monolithic helpers. This closes the course by applying functions, closures, and immutability ideas to everyday code organization.

**Explain:**

```javascript
const pipe =
  (...fns) =>
  (value) =>
    fns.reduce((acc, fn) => fn(acc), value);

const trim = (s) => s.trim();
const lower = (s) => s.toLowerCase();
const slugify = (s) => s.replace(/\s+/g, "-");

const toSlug = pipe(trim, lower, slugify);
toSlug("  Hello World  "); // "hello-world"

// compose — right to left
const compose =
  (...fns) =>
  (value) =>
    fns.reduceRight((acc, fn) => fn(acc), value);

const normalizeUser = pipe(
  (raw) => ({ ...raw, name: raw.name ?? "Anonymous" }),
  (u) => ({ ...u, name: u.name.trim() }),
  (u) => ({ ...u, handle: toSlug(u.name) })
);

normalizeUser({ name: "  Ada Lovelace " });
// { name: "Ada Lovelace", handle: "ada-lovelace" }
```

Design guidelines for utilities:

- One clear responsibility per function.
- Pure when possible; isolate side effects at boundaries.
- Name for intent (`toSlug`, not `processString`).
- Test edge cases: empty input, null, large data.

**Tip:** Lodash/fp and Ramda popularized these patterns; in modern apps, a few local `pipe`/`compose` lines often suffice without importing a library.

**Try it:** Build a `processTransaction(tx)` pipeline that validates amount > 0, applies a 2% fee, rounds money, and returns a receipt object — each step a separate pure function composed with `pipe`.

---

## Dates and time

### Lesson 36. Date model

**Takeaway:** JavaScript's `Date` is a timestamp: milliseconds since the Unix epoch (1970-01-01T00:00:00.000Z), stored as UTC internally, displayed in the local timezone unless you ask otherwise.

**Explain:** `new Date()` captures "now." `new Date(ms)` wraps a number. `new Date("2026-09-08")` parses an ISO date as **UTC midnight**. `new Date("2026-09-08T12:00:00")` without a `Z` or offset is treated as **local** time. That split is the source of most "off by one day" bugs: a date-only string becomes the previous calendar day in US timezones.

```javascript
const now = new Date();
now.getTime(); // ms since epoch
Date.now(); // same, without allocating a Date

const fromIso = new Date("2026-09-08T09:46:00.000Z");
fromIso.toISOString(); // always UTC: "2026-09-08T09:46:00.000Z"
fromIso.getFullYear(); // local calendar year
fromIso.getUTCFullYear(); // UTC calendar year

// Date-only ISO is UTC midnight — may be "yesterday" locally
const dateOnly = new Date("2026-09-08");
dateOnly.toISOString(); // "2026-09-08T00:00:00.000Z"
dateOnly.getDate(); // 7 or 8 depending on local offset

// Local components (0-based month!)
const d = new Date(2026, 8, 8, 9, 46, 0); // Sep 8, 2026 09:46 local
d.getMonth(); // 8
d.getDate(); // 8
```

Getters come in pairs: `getHours` / `getUTCHours`, `getDate` / `getUTCDate`. Mixing them silently shifts the clock. `Invalid Date` is a `Date` whose `getTime()` is `NaN` — `new Date("not a date")` does not throw. Always check `Number.isNaN(date.getTime())` before formatting or doing math.

**Tip:** For calendar dates with no time (birthdays, due dates), store `"YYYY-MM-DD"` strings and parse them yourself into local midnight (`new Date(y, m - 1, day)`). Do not round-trip date-only values through `Date` + `toISOString()`.

**Try it:** Log `new Date("2026-01-01")` and `new Date(2026, 0, 1)` in your timezone. Explain why `getDate()` can differ. Write `isValidDate(value)` that returns false for `Invalid Date`.

---

### Lesson 37. Intl formatting

**Takeaway:** `Intl.DateTimeFormat`, `Intl.NumberFormat`, and `Intl.RelativeTimeFormat` format dates, money, and relative time for a locale — without rolling your own month names or currency symbols.

**Explain:** The `Date` object does not know about locales. `toLocaleString()` is a thin wrapper; constructing `Intl.DateTimeFormat` once and calling `format` is faster in loops and lets you inspect `resolvedOptions()`. Pass a BCP 47 locale (`"en-US"`, `"hi-IN"`, `"de-DE"`) and an options object for calendar fields, time zone, and hour cycle.

```javascript
const when = new Date("2026-09-08T09:46:00.000Z");

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});
dateFmt.format(when); // e.g. "8 Sept 2026, 3:16 pm"

const parts = dateFmt.formatToParts(when);
// [{ type: "day", value: "8" }, { type: "literal", value: " " }, ...]

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});
money.format(1299.5); // "₹1,299.50"

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
relative.format(-1, "day"); // "yesterday"
relative.format(2, "hour"); // "in 2 hours"
```

`formatToParts` is the escape hatch for custom UI (wrap the day in a `<strong>`, style the currency symbol separately). `Intl.NumberFormat` also handles `percent`, `unit` (`"kilometer"`), and `compact` notation (`1.2K`). Never concatenate `"$" + amount` — currency placement and grouping differ by locale.

**Tip:** Cache formatters at module scope. Creating `new Intl.DateTimeFormat` on every render is wasteful; the constructor does locale data lookup.

**Try it:** Format the same `Date` with `timeZone: "UTC"` and `timeZone: "America/Los_Angeles"`. Then format `1999.99` as USD for `"en-US"` and `"de-DE"` and compare symbol placement.

---

### Lesson 38. Arithmetic and timezones

**Takeaway:** Add time by working in milliseconds or UTC date parts; never add `24 * 60 * 60 * 1000` to cross calendar days — DST makes some local days 23 or 25 hours long.

**Explain:** `Date` is not a duration type. `date.setDate(date.getDate() + 1)` advances the **calendar** day in local time and is the correct way to say "tomorrow." Adding 86,400,000 ms can land on the same clock time on a different UTC day, or skip/repeat an hour when DST starts or ends. For "add 90 minutes," milliseconds (or `setMinutes`) are fine because you are adding a duration, not a calendar unit.

```javascript
function addDaysLocal(date, days) {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

function addMillis(date, ms) {
  return new Date(date.getTime() + ms);
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffInDaysUTC(a, b) {
  const MS_PER_DAY = 86_400_000;
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / MS_PER_DAY);
}

// Named zone offset at a specific instant (minutes)
function offsetMinutesInZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  }).formatToParts(date);
  const tz = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const match = tz.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const mins = Number(match[3] ?? 0);
  return sign * (hours * 60 + mins);
}
```

Timezones are political, not math. `Asia/Kolkata` is IST (UTC+5:30) with no DST. `America/New_York` switches. `Intl` can format in a named zone, but `Date` getters still use the **host** timezone. There is no `date.getHours("Asia/Kolkata")` — you read parts via `Intl.DateTimeFormat` + `formatToParts`, or convert with a library. Storing instants as ISO UTC (`toISOString()`) and converting only at the edges keeps servers and clients aligned.

**Tip:** If two users in different zones must agree on a meeting, store UTC (or a timezone-aware ISO string with offset) plus the intended IANA zone name (`"Europe/Berlin"`). Display each side in their own zone.

**Try it:** On a date near a DST transition (e.g. second Sunday in March, US), add one day with `+ 86400000` and with `setDate(getDate() + 1)`. Compare `getHours()`. Write `startOfUtcDay(date)` that returns 00:00:00.000Z.

---

### Lesson 39. When to use a library

**Takeaway:** Use the platform (`Date`, `Intl`, `Temporal` when available) for display and simple math; reach for a library when you do recurring events, fiscal calendars, or serious timezone conversion.

**Explain:** Native `Date` is enough for "show this timestamp in the user's locale," "add 15 minutes," and "is this expired?" It is a poor model for "every second Tuesday," "end of month in `Asia/Kolkata`," or "parse `DD/MM/YYYY` vs `MM/DD/YYYY` from user input." Libraries (Luxon, date-fns + `date-fns-tz`, Temporal polyfills) give immutable types, explicit zones, and duration objects. Moment.js is in maintenance mode — do not start new work on it.

```javascript
// Platform-first: expiry check, no library
function isExpired(isoUtc, now = Date.now()) {
  const t = Date.parse(isoUtc);
  if (Number.isNaN(t)) throw new TypeError("Invalid ISO date");
  return t <= now;
}

// Platform-first: format in a known zone
function formatInZone(isoUtc, timeZone, locale = "en-IN") {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "short",
    timeZone,
  }).format(new Date(isoUtc));
}

// Library territory (conceptual — Temporal / Luxon-shaped)
// ZonedDateTime.from({ year: 2026, month: 3, day: 8, hour: 2, timeZone: "America/New_York" })
//   .plus({ days: 1 })  // DST-safe calendar arithmetic
//   .toISO()

const nativeEnough = {
  store: "ISO-8601 UTC strings or epoch ms",
  display: "Intl.DateTimeFormat + IANA timeZone",
  simpleMath: "setDate / getTime offsets",
};

const reachForALibrary = {
  parse: "ambiguous locale date strings",
  recurrence: "RRULE, business days, holidays",
  zones: "convert wall time in zone A to zone B",
  calendars: "Hijri, fiscal quarters, weeks that start Saturday",
};
```

`Temporal` (stage 4 in the language, shipping gradually) splits **instant**, **plain date**, **plain time**, and **zoned date-time** so you cannot accidentally mix them. Until it is everywhere, a thin helper module plus `Intl` beats pulling 200 KB of date code for a blog timestamp. Measure: if your bugs are timezone-related and recurring, the library pays for itself; if you only format `createdAt`, stay native.

**Tip:** Never `JSON.parse` a date string back into `new Date` inside a recursive walker without a schema. APIs should send ISO strings; the client parses at the boundary once.

**Try it:** List three date operations in an app you know. Mark each "native" or "library" using the table above. Implement the native ones; stub the library ones with a comment describing the API you would call.

---

## Storage and persistence

### Lesson 40. localStorage, sessionStorage, and cookies

**Takeaway:** `localStorage` persists per origin until cleared; `sessionStorage` lasts for the tab; cookies are sent on matching HTTP requests and are the only one of the three the server can read automatically.

**Explain:** All three are **origin-scoped** (`https://app.example.com` cannot read `https://other.example.com`). `localStorage` and `sessionStorage` are synchronous string maps (~5 MB typical). They never go to the network. Cookies are small (`4 KB` each), included on requests when `Path` / `Domain` / `SameSite` match, and can be `HttpOnly` so JavaScript cannot read them — which is what you want for session cookies.

```javascript
localStorage.setItem("theme", "dark");
localStorage.getItem("theme"); // "dark"
localStorage.removeItem("theme");

sessionStorage.setItem("draft", JSON.stringify({ title: "Untitled" }));
const draft = JSON.parse(sessionStorage.getItem("draft") ?? "null");

function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// Cookie the server can set as HttpOnly; JS-visible cookies look like:
document.cookie; // "a=1; b=2" — no HttpOnly cookies here
document.cookie = "sidebar=collapsed; Max-Age=31536000; Path=/; SameSite=Lax";
```

`setItem` throws `QuotaExceededError` when the origin is full — wrap writes in `try/catch`. Storage events fire in **other** tabs of the same origin when `localStorage` changes, not in the tab that wrote. `sessionStorage` is copied when you duplicate a tab in some browsers, but a new tab opened via URL has empty session storage. Do not store secrets, tokens with long life, or large JSON blobs in `localStorage` (XSS can read it; see lesson 50).

**Tip:** `SameSite=Lax` is a sensible default for cookies the site needs on top-level navigations. Use `SameSite=Strict` for extra CSRF resistance; `SameSite=None; Secure` only for cross-site embeds over HTTPS.

**Try it:** Save a theme preference in `localStorage` and read it on load. Save a form draft in `sessionStorage`. Confirm the draft vanishes in a new tab but the theme does not. Inspect `document.cookie` vs Application → Cookies in DevTools.

---

### Lesson 41. IndexedDB and quotas

**Takeaway:** IndexedDB is the browser's structured, async database for large data (files, caches, offline apps). Storage is quota-limited per origin and can be evicted under pressure unless you persist it.

**Explain:** Unlike `localStorage`, IndexedDB is asynchronous, can store `Blob`s / `ArrayBuffer`s / structured clones, and supports indexes and transactions. You open a database with a version; `onupgradeneeded` is the only place to create object stores. Reads and writes happen inside transactions (`readonly` or `readwrite`). Wrapping IDB in promises (or using a small helper like `idb`) is standard because the raw API is event-based.

```javascript
function openNotesDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("notes-app", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("notes")) {
        const store = db.createObjectStore("notes", { keyPath: "id" });
        store.createIndex("byUpdated", "updatedAt");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putNote(note) {
  const db = await openNotesDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("notes", "readwrite");
    tx.objectStore("notes").put(note);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function estimateStorage() {
  if (!navigator.storage?.estimate) return null;
  const { usage, quota } = await navigator.storage.estimate();
  return { usage, quota, pct: usage / quota };
}

async function tryPersist() {
  if (!navigator.storage?.persist) return false;
  return navigator.storage.persist(); // may prompt; not guaranteed
}
```

Quota is not a fixed 5 MB. Browsers grant a fraction of disk (often large) but may evict **best-effort** data when space is tight. `navigator.storage.persist()` asks the browser to treat the origin as persistent (user permission / engagement heuristics). Cache Storage (service workers) and IndexedDB share the same bucket. Always handle `QuotaExceededError` and design for "data may disappear" unless you also sync to a server.

**Tip:** Do not put IndexedDB writes on the critical path of a click without UI feedback. Transactions can take time; show a saving state. For a few KB of settings, `localStorage` is simpler.

**Try it:** Open a database, `put` three notes, query the `byUpdated` index. Call `navigator.storage.estimate()` and log usage vs quota. Optionally request `persist()` and read `navigator.storage.persisted()`.

---

## Network and HTTP

### Lesson 42. fetch and AbortController

**Takeaway:** `fetch` returns a promise for a `Response`; you must check `response.ok` yourself. `AbortController` cancels the request when the user navigates away, types a new query, or a timeout fires.

**Explain:** `fetch(url)` resolves on an HTTP response, including 404 and 500 — those are not network failures. A thrown error means the request did not complete (offline, CORS blocked, aborted). Read the body once (`response.json()`, `response.text()`, `response.blob()`). Pass `signal` from `AbortController` so `fetch` rejects with `AbortError` when you call `abort()`. Aborting in-flight work is how you avoid race conditions: the slow old search must not overwrite the new one.

```javascript
async function getJSON(url, { signal, timeoutMs = 8_000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  if (signal) {
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request cancelled or timed out", { cause: err });
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// Cancel previous search when the query changes
let searchAbort;
async function search(query) {
  searchAbort?.abort();
  searchAbort = new AbortController();
  return getJSON(`/api/search?q=${encodeURIComponent(query)}`, {
    signal: searchAbort.signal,
  });
}
```

Default `fetch` is `GET` with `credentials: "same-origin"` in browsers (cookies for same site). For POST, set `method`, `headers`, and `body`. `keepalive: true` lets a `fetch` outlive the page (analytics on unload) with a small body limit. Streams (`res.body.getReader()`) are for large downloads you process incrementally.

**Tip:** Treat `AbortError` as a normal control-flow outcome, not a toast-worthy failure, when the user cancelled or typed again.

**Try it:** Fetch a public JSON API with a 1 ms timeout and confirm you handle abort. Then wire a search input so each keystroke aborts the previous request.

---

### Lesson 43. Retry, backoff, and FormData

**Takeaway:** Retry transient failures (network drop, 429, 503) with exponential backoff and jitter; do not retry 400 or 404. `FormData` builds `multipart/form-data` bodies for files without manual MIME boundaries.

**Explain:** A single `fetch` can fail because a load balancer was restarting. Blind `for` loops that immediately retry can stampede the server. Backoff waits `base * 2 ** attempt` milliseconds, plus random **jitter** so clients do not sync up. Honor `Retry-After` on 429 when present. Idempotent methods (`GET`, `PUT`, `DELETE`) are safer to retry than `POST` unless the server uses idempotency keys.

```javascript
function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true }
    );
  });
}

async function fetchWithRetry(url, options = {}, { retries = 3, baseMs = 300 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.status === 429 || res.status >= 500) {
        if (attempt === retries) return res;
        const retryAfter = Number(res.headers.get("Retry-After"));
        const wait = Number.isFinite(retryAfter)
          ? retryAfter * 1000
          : baseMs * 2 ** attempt + Math.random() * baseMs;
        await sleep(wait, options.signal);
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
      if (err.name === "AbortError" || attempt === retries) throw err;
      await sleep(baseMs * 2 ** attempt + Math.random() * baseMs, options.signal);
    }
  }
  throw lastError;
}

function uploadProfile(file, fields) {
  const body = new FormData();
  body.append("avatar", file, file.name);
  body.append("displayName", fields.displayName);
  return fetch("/api/profile", { method: "POST", body });
  // Do NOT set Content-Type — the browser adds the multipart boundary
}
```

`FormData` also comes from `<form>` via `new FormData(formElement)`. JSON is still the right default for APIs that do not need files. Mixing retries with non-idempotent POST can duplicate charges or comments — coordinate with the backend.

**Tip:** If you set `Content-Type: multipart/form-data` yourself, you omit the boundary and the server cannot parse the body. Let `fetch` + `FormData` set the header.

**Try it:** Write `fetchWithRetry` against a URL that returns 503 twice then 200 (use a mock or `httpstat.us`). Upload a file from an `<input type="file">` with `FormData` and log `res.status`.

---

### Lesson 44. CORS

**Takeaway:** CORS is a **browser** rule: a page on origin A may read a response from origin B only if B's headers allow it. The server opts in; the client cannot "disable CORS."

**Explain:** An origin is scheme + host + port (`https://notes.example:443`). `fetch` to a different origin is cross-origin. Simple requests (`GET`/`POST` with a few content types) go out; JavaScript can read the body only if `Access-Control-Allow-Origin` matches. Requests with custom headers, `PUT`/`DELETE`, or `Content-Type: application/json` trigger a **preflight** `OPTIONS` request. The server must answer with allow-origin, allow-methods, and allow-headers. `credentials: "include"` requires a specific origin (not `*`) and `Access-Control-Allow-Credentials: true`.

```javascript
// Cross-origin JSON with cookies (only works if the API allows this origin)
async function loadProfile(apiBase) {
  const res = await fetch(`${apiBase}/me`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// What a cooperative API must send (server-side sketch, not browser JS)
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://app.example.com",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

// Same-origin or a proxy avoids CORS in development
// next.config rewrites: /api/* → https://backend.example.com/api/*
```

A CORS error in the console is not a failed TCP connection — the response often arrived, but the browser hid it from JS. Postman and `curl` have no CORS. Fixing it means changing the **API** (or using a same-origin proxy), not adding a browser flag. `no-cors` mode gives an opaque response you cannot read — it is not a workaround for APIs.

**Tip:** In local Next.js/Vite apps, proxy `/api` to the backend so the browser sees one origin. In production, configure the real `Access-Control-Allow-Origin` list; never reflect arbitrary `Origin` headers without a allowlist.

**Try it:** From your notes app origin, `fetch` a public API that sends `Access-Control-Allow-Origin: *` (it should work). Then `fetch` a URL that does not (e.g. `https://example.com`) and read the exact DevTools error. Sketch the preflight + response headers the second server would need.

---

## Regex in practice

### Lesson 45. Groups and lookahead

**Takeaway:** Capture groups extract pieces; named groups keep them readable. Lookahead and lookbehind assert context without consuming characters — use them for passwords and delimiters, not for parsing HTML.

**Explain:** Parentheses create a **capturing** group; `(?:...)` is non-capturing. `(?<name>...)` is named. After `exec` or `match`, numbered groups are on the array; named groups live on `match.groups`. Lookahead `(?=...)` / `(?!...)` and lookbehind `(?<=...)` / `(?<!...)` succeed or fail based on what is ahead or behind, leaving the current position unchanged. That lets you say "a number not followed by `px`" or "password has a digit somewhere" without consuming the whole string twice.

```javascript
const iso = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/;
const m = iso.exec("2026-09-08");
m.groups.year; // "2026"

const price = /(?<currency>USD|INR|EUR)\s(?<amount>\d+(?:\.\d{2})?)/;
price.exec("INR 1299.00")?.groups;

// Password: 8+ chars, at least one letter and one digit (lookaheads)
const strongEnough = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
strongEnough.test("secret99"); // true

// Word not preceded by @ (not a mention)
const bareWord = /(?<!@)\b[A-Za-z]+\b/g;
"hi @ada and bob".match(bareWord); // ["hi", "and", "bob"]

const re = /(\w+)\s+(\w+)/;
re.exec("Ada Lovelace");
// [full, "Ada", "Lovelace", index, input, groups]
```

`g` (global) + `exec` in a loop advances `lastIndex`; forgetting that causes infinite loops or skipped matches. `d` flag (hasIndices) adds `indices` for highlight ranges. Flags `i`, `m`, `s` change case, `^`/`$` line behavior, and whether `.` matches newlines. Prefer `String.prototype.matchAll` for global named groups.

**Tip:** If you find yourself writing nested lookaheads to parse nested markup, stop. Use a parser or `DOMParser`. Regex is for regular languages — HTML is not one.

**Try it:** Write a named-group regex for `rgb(r, g, b)` and extract the three numbers. Add a negative lookahead so `rgba(...)` does not match. Test `"rgb(1, 2, 3)"` and `"rgba(1, 2, 3, 0.5)"`.

---

### Lesson 46. Safe validation

**Takeaway:** Regex can reject obviously bad input, but it is a poor single source of truth for email, URLs, or HTML — catastrophic backtracking and false confidence are the real risks.

**Explain:** A crafted string can make a naive regex take exponential time (**ReDoS**). Nested quantifiers like `(a+)+$` on a long string of `a`s with a failing suffix freeze the main thread. Keep patterns simple, use possessive or atomic ideas where the engine supports them, and set a length cap **before** running the regex. For email, check for `@` and a reasonable length, then let the server and a confirmation mail decide. For numbers, `Number` + range checks beat a 40-character pattern.

```javascript
function hasReDosShape(source) {
  return /(\+|\*)\{.*,.*\}/.test(source) || /(\([^)]+[+*)][^)]*){2,}/.test(source);
}

function safeTest(re, input, { maxLen = 256 } = {}) {
  if (typeof input !== "string" || input.length > maxLen) return false;
  return re.test(input);
}

const EMAIL_LOOSE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function looksLikeEmail(value) {
  return safeTest(EMAIL_LOOSE, value, { maxLen: 254 });
}

function parsePort(raw) {
  if (typeof raw !== "string" || raw.length > 5) return null;
  if (!/^\d{1,5}$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 1 && n <= 65535 ? n : null;
}

function escapeRegExp(literal) {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsWord(haystack, word) {
  const re = new RegExp(`\\b${escapeRegExp(word)}\\b`, "i");
  return safeTest(re, haystack, { maxLen: 10_000 });
}
```

When users supply the pattern (`new RegExp(userInput)`), you are handing them a CPU bomb and an injection surface. Escape literals with `escapeRegExp`. Validate on the server even if the client already did — client checks are UX, not security. Prefer denylist-light, allowlist-heavy rules (`/^[A-Za-z0-9_-]{1,32}$/` for a slug).

**Tip:** If a regex is hard to name, it is doing too much. Split "shape check" from "business rule" (unique email, disposable domain, MX record).

**Try it:** Time `/^(a+)+$/` against `"aaaaaaaaaaaaaaaaaaaa!"` with `console.time`. Then rewrite the check as `input.length <= 32 && /^a+$/.test(input)` and compare. Add `escapeRegExp` tests for `foo.bar` vs `fooXbar`.

---

## Browser APIs and performance

### Lesson 47. IntersectionObserver and ResizeObserver

**Takeaway:** Observe visibility and size **asynchronously** instead of binding `scroll` and `resize` to layout-thrashing reads. IntersectionObserver tells you when an element enters a box; ResizeObserver tells you when its box changes.

**Explain:** Lazy-loaded images, infinite scroll, and "start the video when visible" used to mean `getBoundingClientRect()` inside a scroll handler — forced layout every frame. `IntersectionObserver` delivers a list of entries when the target crosses a threshold of the viewport (or a custom root). `ResizeObserver` fires when the observed element's content box changes, including CSS container queries-style layouts, without listening to `window.resize` (which misses flex/grid sibling changes).

```javascript
function observeOnce(el, callback, { threshold = 0.25 } = {}) {
  const io = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        callback(entry);
        observer.unobserve(entry.target);
      }
    },
    { root: null, rootMargin: "200px 0px", threshold }
  );
  io.observe(el);
  return () => io.disconnect();
}

function onBoxChange(el, callback) {
  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const box = entry.contentBoxSize?.[0] ?? {
        inlineSize: entry.contentRect.width,
        blockSize: entry.contentRect.height,
      };
      callback({ width: box.inlineSize, height: box.blockSize, entry });
    }
  });
  ro.observe(el);
  return () => ro.disconnect();
}

const img = document.querySelector("img[data-src]");
if (img) {
  observeOnce(img, () => {
    img.src = img.dataset.src;
  });
}
```

Always `disconnect` or `unobserve` when the component unmounts — observers keep targets alive and leak. `rootMargin` grows the detection box (preload 200px before the image appears). Multiple thresholds (`[0, 0.5, 1]`) give progress for reading indicators. `contentBoxSize` is an array (multi-column); fall back to `contentRect` in older engines.

**Tip:** Do not read `getBoundingClientRect()` inside the ResizeObserver callback and then write styles that change size again — you can loop. Apply classes or update a store; let CSS finish the layout.

**Try it:** Lazy-load three images with IntersectionObserver. Attach ResizeObserver to a textarea and log width/height as the user resizes. Confirm observers stop after you call the cleanup function.

---

### Lesson 48. Web Workers and requestIdleCallback

**Takeaway:** Web Workers run JS on another thread so heavy CPU work does not freeze the UI. `requestIdleCallback` schedules leftover main-thread work for idle periods — not a substitute for workers.

**Explain:** The main thread paints, handles input, and runs most of your app. A 50 ms JSON parse or markdown compile dropped into a click handler makes the page jank. A worker is a separate global (`self`) with no DOM. You `postMessage` structured-cloneable data (or `Transferable`s like `ArrayBuffer`) and listen for results. Workers cannot touch `document`; they can use `fetch`, `IndexedDB` (in dedicated workers), and `OffscreenCanvas` where supported.

```javascript
// worker.js
self.onmessage = (event) => {
  const { id, text } = event.data;
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  self.postMessage({ id, wordCount });
};

// main.js
const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });

function countWordsOffThread(text) {
  const id = crypto.randomUUID();
  return new Promise((resolve, reject) => {
    function onMessage(event) {
      if (event.data.id !== id) return;
      worker.removeEventListener("message", onMessage);
      resolve(event.data.wordCount);
    }
    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", reject, { once: true });
    worker.postMessage({ id, text });
  });
}

function scheduleAnalytics(payload) {
  const run = (deadline) => {
    while (deadline.timeRemaining() > 0 && payload.length) {
      const item = payload.shift();
      navigator.sendBeacon?.("/analytics", JSON.stringify(item));
    }
    if (payload.length) requestIdleCallback(run, { timeout: 2000 });
  };
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(run, { timeout: 2000 });
  } else {
    setTimeout(() => run({ timeRemaining: () => 16 }), 0);
  }
}
```

`requestIdleCallback` is for **deferrable** main-thread work (prefetch, analytics, non-critical DOM). The `timeout` option forces a run so work is not starved on a busy page. Safari support has lagged — always polyfill with `setTimeout`. Do not put input handling in idle callbacks. Prefer workers for anything that can exceed a few milliseconds of CPU.

**Tip:** Cloning huge objects into a worker can cost as much as the work. Transfer `ArrayBuffer`s (`postMessage(buf, [buf])`) or share a `SharedArrayBuffer` only with a clear memory model.

**Try it:** Move a naive Fibonacci or markdown word-count to a worker and compare UI smoothness vs running it on the main thread. Queue five idle tasks with `requestIdleCallback` and log `deadline.timeRemaining()`.

---

## Security basics

### Lesson 49. XSS, sanitization, and CSP

**Takeaway:** Cross-site scripting (XSS) runs an attacker's JavaScript in your origin. Never assign untrusted strings to `innerHTML`; sanitize or use `textContent`, and lock down what can execute with Content-Security-Policy.

**Explain:** If you render `user.name` as HTML and the name is `<img src=x onerror=alert(1)>`, the handler runs as your site. Stored XSS sits in the database; reflected XSS rides on a URL parameter; DOM XSS is entirely in client-side sinks (`innerHTML`, `document.write`, `eval`, `new Function`, `href="javascript:"`). The fix is to treat all external data as text unless you have a sanitizer that allows a safe tag subset (DOMPurify or the Sanitizer API). Frameworks that default to escaping (`textContent`, React children) close the common hole — `dangerouslySetInnerHTML` opens it again.

```javascript
function renderComment(el, userText) {
  el.textContent = userText; // safe: no HTML parse
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setSafeHtml(el, untrusted) {
  el.innerHTML = escapeHtml(untrusted);
}

function unsafe(el, untrusted) {
  el.innerHTML = untrusted; // XSS if untrusted is markup
}

const cspExample = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "connect-src 'self' https://api.example.com",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");
```

CSP is an HTTP header (or `<meta>`) that tells the browser which origins may supply scripts, styles, images, and connections. `'unsafe-inline'` for scripts defeats much of XSS protection; prefer hashes or nonces. `script-src 'self'` blocks inline event handlers and surprise CDNs. CSP is defense in depth — it does not replace escaping. Also encode for the right context: HTML body, HTML attribute, JS string, and URL each need different escaping.

**Tip:** Search the codebase for `innerHTML`, `dangerouslySetInnerHTML`, and `eval`. Each hit needs a justification and a sanitizer or a rewrite to `textContent`.

**Try it:** Put `<img src=x onerror=alert(1)>` through `textContent` vs `innerHTML` on a dummy element. Draft a CSP for this notes app (`'self'` scripts, images from your origin). Confirm a blocked inline script in DevTools → Console.

---

### Lesson 50. Token storage

**Takeaway:** Access tokens in `localStorage` are stolen by any XSS. Prefer short-lived tokens in memory plus `HttpOnly`, `Secure`, `SameSite` cookies for the refresh/session — or a BFF that never exposes the raw token to JavaScript.

**Explain:** JWT or opaque session IDs prove the user to your API. Where you put them is a trade-off between XSS and CSRF. `localStorage` is trivial to read from a script tag the attacker wrote — one XSS and the token is gone. An in-memory variable dies on refresh (you re-bootstrap via a cookie). An `HttpOnly` cookie cannot be read by `document.cookie`, so XSS cannot exfiltrate it directly; you then need CSRF defenses (`SameSite`, anti-CSRF tokens, custom headers). Never put long-lived refresh tokens in `localStorage` or log them.

```javascript
let accessToken = null; // memory only — gone on reload

async function bootstrapSession() {
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include", // send HttpOnly refresh cookie
  });
  if (!res.ok) {
    accessToken = null;
    return null;
  }
  const data = await res.json();
  accessToken = data.accessToken; // short-lived, e.g. 5–15 minutes
  return accessToken;
}

async function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const res = await fetch(url, { ...options, headers, credentials: "include" });
  if (res.status !== 401) return res;
  const next = await bootstrapSession();
  if (!next) return res;
  headers.set("Authorization", `Bearer ${next}`);
  return fetch(url, { ...options, headers, credentials: "include" });
}

const cookieFlags = {
  HttpOnly: true,
  Secure: true, // HTTPS only
  SameSite: "Lax",
  Path: "/api/auth",
  MaxAge: 60 * 60 * 24 * 7,
};
```

The cookie must be `Secure` in production and scoped with `Path` / `Domain` as tightly as possible. Third-party cookies are restricted — do not design new auth on cross-site cookie sharing. For SPAs talking to a separate API, a same-origin backend-for-frontend that holds the session and proxies API calls keeps tokens off the frontend entirely. Lesson 49 is a prerequisite: cookie-based auth is only as strong as your XSS hygiene.

**Tip:** If a tutorial says "store the JWT in localStorage," treat it as a prototype, not a production pattern. Pair tokens with short expiry, rotation, and server-side revocation.

**Try it:** Sketch your app's auth: where the access token lives, where the refresh token lives, and what happens on XSS vs CSRF. Implement `apiFetch` against a mock that returns 401 once, then succeeds after `bootstrapSession`.

---
