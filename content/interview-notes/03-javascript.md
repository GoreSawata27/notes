# JavaScript Interview Notes

A practical Q&A guide for JavaScript interviews — from language fundamentals and runtime behavior to async patterns, DOM/events, and common machine-coding problems. Answers are concise but interview-ready; code examples illustrate behavior, not memorization.

---

## JavaScript Basics & History
### Q1. Who created JavaScript and why was it built? [must-know]

**Short definition:** Brendan Eich created JavaScript in 10 days at Netscape (1995) to add scripting to web pages in the browser.

**Answer:** Brendan Eich created JavaScript in 10 days at Netscape (1995) to add scripting to web pages in the browser. It was originally called Mocha, then LiveScript, then JavaScript — a marketing name tied to Java's popularity, though the languages are unrelated.

**Follow-up:** ECMAScript is the official specification; JavaScript is an implementation of it.

---

### Q2. What is the difference between JavaScript and ECMAScript?

**Short definition:** ECMAScript (ES) is the language **specification** maintained by TC39.

**Answer:** ECMAScript (ES) is the language **specification** maintained by TC39. JavaScript is a **concrete implementation** of that spec (V8, SpiderMonkey, JavaScriptCore). When people say "ES6 features," they mean features standardized in ECMAScript 2015.

---

### Q3. What are the main ways to include JavaScript in an HTML page?

**Short definition:** Inline `<script>` tags, external `.js` files via `<script src="...">`, and module scripts via `<script type="module">`.

**Answer:** Inline `<script>` tags, external `.js` files via `<script src="...">`, and module scripts via `<script type="module">`. Modules are deferred by default and run in strict mode with their own scope.

**Common mistake:** Placing blocking scripts in `<head>` without `defer`/`async`, which delays page rendering.

---

### Q4. What is strict mode and what does `'use strict'` change?

**Short definition:** Strict mode opts into a restricted variant of JavaScript that catches silent errors and disables unsafe features.

**Answer:** Strict mode opts into a restricted variant of JavaScript that catches silent errors and disables unsafe features. It forbids implicit globals, duplicate parameter names, and octal literals; `this` in plain functions becomes `undefined` instead of the global object.

```javascript
'use strict';
x = 10; // ReferenceError — x was never declared
```

---

### Q5. What is the difference between `var`, `let`, and `const`? [must-know]

**Short definition:** `var` is function-scoped and hoisted (initialized as `undefined`).

**Answer:** `var` is function-scoped and hoisted (initialized as `undefined`). `let` and `const` are block-scoped and live in the temporal dead zone until their declaration line runs. `const` requires initialization and prevents reassignment of the binding (not deep immutability of objects).

---

### Q6. What is the temporal dead zone (TDZ)?

**Short definition:** The period from the start of a block until a `let`/`const` declaration is evaluated, during which accessing the variable throws a `ReferenceError`.

**Answer:** The period from the start of a block until a `let`/`const` declaration is evaluated, during which accessing the variable throws a `ReferenceError`. Hoisting still occurs, but without initialization.

---

### Q7. How does JavaScript compare to other languages in typing?

**Short definition:** JavaScript is dynamically typed — variable types are determined at runtime.

**Answer:** JavaScript is dynamically typed — variable types are determined at runtime. It is also weakly typed in that implicit coercion can happen during operations (`"5" + 1` → `"51"`).

---

## Engine, Runtime & Execution

---

### Q8. What is the JavaScript engine vs the runtime environment? [must-know]

**Short definition:** The **engine** (V8, SpiderMonkey) parses, compiles, and executes JS.

**Answer:** The **engine** (V8, SpiderMonkey) parses, compiles, and executes JS. The **runtime** adds APIs beyond the language spec: in browsers that's the DOM, `fetch`, timers; in Node.js it's `fs`, `process`, etc. Your code runs on engine + host APIs together.

**Follow-up:** V8 uses Ignition (interpreter) + TurboFan (optimizing compiler) in modern versions.

---

### Q9. What happens when JavaScript code runs — parse, compile, execute?

**Short definition:** Source is parsed into an AST, then compiled (JIT: often bytecode first, hot paths optimized later), then executed on the call stack.

**Answer:** Source is parsed into an AST, then compiled (JIT: often bytecode first, hot paths optimized later), then executed on the call stack. Identifiers are resolved via scope chains; objects live on the heap.

---

### Q10. What is JIT compilation?

**Short definition:** Just-In-Time compilation means the engine interprets code first for fast startup, then profiles hot functions and recompiles them to optimized machine code.

**Answer:** Just-In-Time compilation means the engine interprets code first for fast startup, then profiles hot functions and recompiles them to optimized machine code. Deoptimization occurs if assumptions break (e.g., type changes).

---

### Q11. What is the call stack?

**Short definition:** A LIFO structure tracking active function executions.

**Answer:** A LIFO structure tracking active function executions. Each function call pushes a stack frame; returning pops it. Stack overflow happens when recursion or deep calls exceed the limit.

---

### Q12. What is the heap in JavaScript?

**Short definition:** Memory region where objects, closures, and arrays are stored.

**Answer:** Memory region where objects, closures, and arrays are stored. References (variables) on the stack point to heap allocations. Garbage collection reclaims unreachable heap objects.

---

### Q13. How does garbage collection work at a high level?

**Short definition:** Modern engines use generational GC: young objects are scanned frequently (minor GC); long-lived objects are promoted and collected less often (major GC).

**Answer:** Modern engines use generational GC: young objects are scanned frequently (minor GC); long-lived objects are promoted and collected less often (major GC). Reachability is typically determined from roots (globals, stack references).

**Common mistake:** Assuming "delete obj.prop" frees memory immediately — only unreachability triggers GC.

---

## Types, Variables & Equality

---

### Q14. What are JavaScript's primitive types? [must-know]

**Short definition:** Seven primitives: `string`, `number`, `bigint`, `boolean`, `undefined`, `symbol`, and `null`.

**Answer:** Seven primitives: `string`, `number`, `bigint`, `boolean`, `undefined`, `symbol`, and `null`. Everything else is an object (including arrays, functions, dates).

```javascript
typeof null;        // "object" — historical bug
typeof Symbol();    // "symbol"
```

---

### Q15. What is the difference between `==` and `===`? [must-know]

**Short definition:** `===` is strict equality — no coercion; types must match.

**Answer:** `===` is strict equality — no coercion; types must match. `==` performs abstract equality with coercion rules (`null == undefined` is true; `0 == false` is true). Prefer `===` unless you explicitly need coercion.

---

### Q16. How does `Object.is()` differ from `===`?

**Short definition:** `Object.is(NaN, NaN)` is `true`; `NaN === NaN` is `false`.

**Answer:** `Object.is(NaN, NaN)` is `true`; `NaN === NaN` is `false`. `Object.is(+0, -0)` is `false`; `+0 === -0` is `true`. Useful for edge cases in libraries and React's state comparison logic.

---

### Q17. What is `undefined` vs `null`?

**Short definition:** `undefined` means a variable was declared but not assigned, or a missing property/parameter.

**Answer:** `undefined` means a variable was declared but not assigned, or a missing property/parameter. `null` is an intentional absence-of-value assignment. Both are falsy, but `typeof undefined` is `"undefined"` and `typeof null` is `"object"`.

---

### Q18. What are Symbols used for?

**Short definition:** Symbols are unique, immutable primitive identifiers.

**Answer:** Symbols are unique, immutable primitive identifiers. Common uses: non-enumerable object keys, well-known symbols (`Symbol.iterator`), and avoiding property name collisions in meta-programming.

---

### Q19. What is the difference between pass-by-value and pass-by-reference in JS?

**Short definition:** Primitives are passed by value (copied).

**Answer:** Primitives are passed by value (copied). Objects are passed by **reference value** — the reference is copied, so mutating the object inside a function affects the original. Reassigning the parameter does not change the caller's variable.

---

### Q20. How do you check if a value is an array?

**Short definition:** `Array.isArray(value)` is the reliable method.

**Answer:** `Array.isArray(value)` is the reliable method. `typeof []` returns `"object"`, and `instanceof Array` can fail across realms/iframes.

---

## Type Coercion

---

### Q21. What is implicit vs explicit coercion?

**Short definition:** Explicit: `Number("42")`, `String(42)`, `Boolean(0)`.

**Answer:** Explicit: `Number("42")`, `String(42)`, `Boolean(0)`. Implicit: happens in `==`, `+` with strings, `if (value)`, template literals. Understanding coercion prevents subtle bugs in comparisons and arithmetic.

---

### Q22. What does `"5" + 3` vs `"5" - 3` produce and why?

**Short definition:** `"5" + 3` → `"53"` because `+` prefers string concatenation if either operand is a string.

**Answer:** `"5" + 3` → `"53"` because `+` prefers string concatenation if either operand is a string. `"5" - 3` → `2` because `-` only works with numbers, so `"5"` is coerced to `5`.

---

### Q23. What is truthy and falsy in JavaScript? [must-know]

**Short definition:** Falsy values: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`.

**Answer:** Falsy values: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`. Everything else is truthy — including `[]`, `{}`, and `"0"`.

**Common mistake:** Assuming empty arrays/objects are falsy.

---

### Q24. What happens with `[] + []` and `[] + {}`?

**Short definition:** Both operands are coerced via `ToPrimitive`.

**Answer:** Both operands are coerced via `ToPrimitive`. Arrays become empty strings: `[] + []` → `""`. `{}` becomes `"[object Object]"`, so `[] + {}` → `"[object Object]"`.

---

### Q25. How does coercion work in the `==` algorithm (simplified)?

**Short definition:** If types differ, convert to numbers (except `null`/`undefined` pair).

**Answer:** If types differ, convert to numbers (except `null`/`undefined` pair). Objects become primitives via `valueOf`/`toString`. Then compare numerically or by reference for objects.

---

### Q26. What is `??` (nullish coalescing)?

**Short definition:** Returns the right side only when the left is `null` or `undefined` — not for other falsy values.

**Answer:** Returns the right side only when the left is `null` or `undefined` — not for other falsy values. `0 ?? 5` is `0`; `null ?? 5` is `5`. Often paired with optional chaining.

---

### Q27. What is optional chaining (`?.`)?

**Short definition:** Short-circuits to `undefined` if the base is `null` or `undefined` instead of throwing.

**Answer:** Short-circuits to `undefined` if the base is `null` or `undefined` instead of throwing. Works for properties, calls, and brackets: `user?.address?.zip`, `callback?.()`.

---

## Functions

---

### Q28. What are the ways to define a function in JavaScript?

**Short definition:** Function declaration (`function foo() {}`), function expression (`const foo = function() {}`), arrow function (`const foo = () => {}`), method shorthand in...

**Answer:** Function declaration (`function foo() {}`), function expression (`const foo = function() {}`), arrow function (`const foo = () => {}`), method shorthand in objects, and `Function` constructor (rarely used).

---

### Q29. What is the difference between function declarations and expressions?

**Short definition:** Declarations are fully hoisted (name and body).

**Answer:** Declarations are fully hoisted (name and body). Named function expressions hoist the name only inside the function body (in modern engines). Anonymous expressions assign to variables subject to `let`/`const` TDZ rules.

---

### Q30. What is an arrow function and how does it differ from regular functions? [must-know]

**Short definition:** Arrow functions have lexical `this`, no `arguments` object, cannot be used as constructors (`new`), and have concise syntax.

**Answer:** Arrow functions have lexical `this`, no `arguments` object, cannot be used as constructors (`new`), and have concise syntax. Ideal for callbacks; avoid when you need dynamic `this` or `arguments`.

```javascript
const obj = {
  id: 1,
  regular() { console.log(this.id); },
  arrow: () => console.log(this.id) // lexical this — often wrong in methods
};
```

---

### Q31. What is an IIFE and why use one?

**Short definition:** Immediately Invoked Function Expression — `(function () { ...

**Answer:** Immediately Invoked Function Expression — `(function () { ... })();` — creates a private scope, avoiding global pollution. Less common now with modules and block scope.

---

### Q32. What are default parameters?

**Short definition:** ES6 allows `function greet(name = 'Guest')`.

**Answer:** ES6 allows `function greet(name = 'Guest')`. Defaults apply when the argument is `undefined` (not when it is `null`). Later defaults can reference earlier parameters.

---

### Q33. What is rest vs spread syntax?

**Short definition:** Rest collects remaining arguments: `function sum(...nums)`.

**Answer:** Rest collects remaining arguments: `function sum(...nums)`. Spread expands iterables: `[...arr1, ...arr2]`, `{ ...obj, key: val }`. Both use `...` but in opposite directions.

---

### Q34. What is a higher-order function?

**Short definition:** A function that takes another function as an argument or returns a function.

**Answer:** A function that takes another function as an argument or returns a function. Examples: `map`, `filter`, `reduce`, middleware in Express-style patterns, and custom decorators.

---

### Q35. What is currying?

**Short definition:** Transforming a multi-argument function into a chain of single-argument functions: `const add = a => b => a + b`.

**Answer:** Transforming a multi-argument function into a chain of single-argument functions: `const add = a => b => a + b`. Useful for partial application and reusable configuration.

---

## Scope, Closures & Hoisting

---

### Q36. What is lexical scope?

**Short definition:** Scope is determined by where functions and blocks are **written**, not where they are called.

**Answer:** Scope is determined by where functions and blocks are **written**, not where they are called. Inner functions can access outer variables; the lookup walks the scope chain outward.

---

### Q37. What is a closure? [must-know] [infosys]

**Short definition:** A closure is when a function retains access to variables from its outer lexical scope even after that outer function has finished executing.

**Answer:** A closure is when a function retains access to variables from its outer lexical scope even after that outer function has finished executing. The inner function "closes over" those bindings.

```javascript
function makeCounter() {
  let count = 0;
  return () => ++count;
}
const counter = makeCounter();
counter(); // 1
counter(); // 2
```

**Follow-up:** Closures power data privacy, factories, and memoization.

**Common mistake:** Creating closures in a loop with `var` — all callbacks share one `i`. Fix with `let` or IIFE.

---

### Q38. Explain the classic loop + `setTimeout` closure problem.

**Short definition:** With `var`, one shared `i` exists; after the loop, `i === 3`.

**Answer:** With `var`, one shared `i` exists; after the loop, `i === 3`. All timeouts log 3. Fix: use `let` (block-scoped per iteration), pass `i` as a parameter, or use `forEach` with a closure.

```javascript
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 0, 1, 2
}
```

---

### Q39. What is hoisting? [must-know]

**Short definition:** Declarations are processed before execution.

**Answer:** Declarations are processed before execution. `var` and function declarations hoist to the top of their scope (var initialized as `undefined`). `let`/`const` hoist but stay in TDZ until their line runs.

---

### Q40. What gets hoisted — variables vs functions?

**Short definition:** Function declarations hoist with their full body.

**Answer:** Function declarations hoist with their full body. `var` hoists declaration only. `let`/`const` hoist but throw if accessed early. Function expressions follow variable hoisting rules of their binding.

---

### Q41. Can you give a practical use case for closures in interviews? [infosys]

**Short definition:** Module pattern, debounce/throttle implementations, React hooks (state captured per render), event handler factories, and caching/memoization where a private...

**Answer:** Module pattern, debounce/throttle implementations, React hooks (state captured per render), event handler factories, and caching/memoization where a private cache lives in the closure.

---

### Q42. What is block scope vs function scope?

**Short definition:** `let`/`const`/`class` are block-scoped (`{}`, `if`, loops).

**Answer:** `let`/`const`/`class` are block-scoped (`{}`, `if`, loops). `var` is function-scoped (or global). Blocks with `let` do not leak to outer scopes.

---

### Q43. What happens with nested closures and memory?

**Short definition:** Outer variables referenced by inner functions stay alive on the heap.

**Answer:** Outer variables referenced by inner functions stay alive on the heap. Unused closures can cause memory leaks if DOM nodes or large objects are retained — detach listeners and null references when done.

---

## Arrays & Objects

---

### Q44. How do you shallow copy vs deep copy an object? [must-know]

**Short definition:** Shallow: `{ ...obj }`, `Object.assign({}, obj)`, `[...arr]`.

**Answer:** Shallow: `{ ...obj }`, `Object.assign({}, obj)`, `[...arr]`. Deep: `structuredClone(obj)` (modern), `JSON.parse(JSON.stringify(obj)` (limited — no functions, dates, `undefined`), or libraries like lodash `cloneDeep`.

---

### Q45. What is the difference between `map`, `filter`, and `reduce`?

**Short definition:** `map` transforms each element to a new array.

**Answer:** `map` transforms each element to a new array. `filter` keeps elements matching a predicate. `reduce` accumulates to a single value (or object/array) using a reducer function.

---

### Q46. What are `Object.keys`, `values`, and `entries`?

**Short definition:** They return arrays of own enumerable string-keyed properties: keys, values, or `[key, value]` pairs.

**Answer:** They return arrays of own enumerable string-keyed properties: keys, values, or `[key, value]` pairs. They ignore symbol keys unless combined with `Object.getOwnPropertySymbols`.

---

### Q47. How does property lookup work on objects?

**Short definition:** Engine checks the object itself, then walks the prototype chain until it finds the property or reaches `null`.

**Answer:** Engine checks the object itself, then walks the prototype chain until it finds the property or reaches `null`. Assignments on own properties do not traverse the chain unless the property is an accessor on the prototype.

---

### Q48. What is `Object.freeze` vs `Object.seal`?

**Short definition:** `freeze` prevents adding, deleting, and modifying properties.

**Answer:** `freeze` prevents adding, deleting, and modifying properties. `seal` prevents adding/deleting but allows modifying existing values. Both are shallow — nested objects can still mutate.

---

### Q49. How do you safely check own properties?

**Short definition:** `Object.hasOwn(obj, 'key')` (ES2022) or `Object.prototype.hasOwnProperty.call(obj, 'key')` to avoid issues with null prototype or overridden `hasOwnProperty`.

**Answer:** `Object.hasOwn(obj, 'key')` (ES2022) or `Object.prototype.hasOwnProperty.call(obj, 'key')` to avoid issues with null prototype or overridden `hasOwnProperty`.

---

### Q50. What is destructuring assignment?

**Short definition:** Unpack values from arrays or properties from objects into variables: `const { a, b = 1 } = obj; const [first, ...rest] = arr;`.

**Answer:** Unpack values from arrays or properties from objects into variables: `const { a, b = 1 } = obj; const [first, ...rest] = arr;`. Supports renaming, defaults, and nested patterns.

---

### Q51. What is the spread operator with objects — merge gotchas?

**Short definition:** Later keys overwrite earlier ones: `{ ...a, ...b }`.

**Answer:** Later keys overwrite earlier ones: `{ ...a, ...b }`. Only enumerable own properties copy. For deep merge, implement recursion or use a utility.

---

## ES6 Collections (Map, Set, WeakMap, WeakSet)

---

### Q52. When should you use a `Map` instead of a plain object?

**Short definition:** When keys are non-strings (objects, functions), you need guaranteed insertion order with frequent add/delete, or you want `.size` without counting keys.

**Answer:** When keys are non-strings (objects, functions), you need guaranteed insertion order with frequent add/delete, or you want `.size` without counting keys. Objects are fine for static string-keyed records.

---

### Q53. What is a `Set` and common use cases?

**Short definition:** A collection of unique values (by `SameValueZero` equality).

**Answer:** A collection of unique values (by `SameValueZero` equality). Use for deduplication: `[...new Set(arr)]`, tracking visited nodes in graphs, or membership tests with O(1) average lookup.

---

### Q54. What are WeakMap and WeakSet?

**Short definition:** Keys must be objects; references are weak — if no other references exist, entries can be GC'd.

**Answer:** Keys must be objects; references are weak — if no other references exist, entries can be GC'd. Useful for private metadata on DOM nodes or caches that should not prevent collection. Not iterable; no `.size`.

---

### Q55. Can you use objects as Map keys?

**Short definition:** Yes.

**Answer:** Yes. Maps compare keys by reference, not by value. Two `{ id: 1 }` objects are different keys unless they are the same reference.

---

### Q56. What is the iteration order for Map vs Object?

**Short definition:** Map preserves insertion order for all keys.

**Answer:** Map preserves insertion order for all keys. Ordinary objects preserve insertion order for string keys (ES2015+) but have legacy quirks with integer-like keys sorting first.

---

## DOM Manipulation

---

### Q57. What is the DOM?

**Short definition:** The Document Object Model is the browser's tree representation of HTML.

**Answer:** The Document Object Model is the browser's tree representation of HTML. JavaScript can query, create, modify, and remove nodes. Each node is an object with properties and methods (`querySelector`, `appendChild`, etc.).

---

### Q58. What is the difference between `getElementById`, `querySelector`, and `querySelectorAll`?

**Short definition:** `getElementById` returns one element by id.

**Answer:** `getElementById` returns one element by id. `querySelector` returns the first match for any CSS selector. `querySelectorAll` returns a static NodeList of all matches.

---

### Q59. What is reflow vs repaint?

**Short definition:** Reflow (layout) recalculates geometry when size/position changes — expensive.

**Answer:** Reflow (layout) recalculates geometry when size/position changes — expensive. Repaint redraws pixels (color, visibility) without layout change. Batch DOM reads/writes; use `documentFragment` or virtual DOM patterns to minimize reflows.

---

### Q60. What is event delegation at the DOM level?

**Short definition:** Attach one listener on a parent; use `event.target` to handle events from children.

**Answer:** Attach one listener on a parent; use `event.target` to handle events from children. Reduces listener count and works for dynamically added elements. Covered in detail in the Events section.

---

### Q61. What is `innerHTML` vs `textContent` vs `innerText`?

**Short definition:** `innerHTML` parses HTML (XSS risk with user input).

**Answer:** `innerHTML` parses HTML (XSS risk with user input). `textContent` gets/sets raw text including hidden nodes. `innerText` respects CSS visibility and layout, triggering reflow — slower.

**Common mistake:** Injecting unsanitized user HTML into `innerHTML`.

---

### Q62. What is a DocumentFragment?

**Short definition:** A lightweight container for batching DOM inserts.

**Answer:** A lightweight container for batching DOM inserts. Append children to the fragment, then append the fragment once — triggers a single reflow instead of many.

---

## Events — Bubbling, Capture & Delegation

---

### Q63. What are the three phases of event propagation? [must-know] [infosys]

**Short definition:** (1) **Capture** — from window down to target.

**Answer:** (1) **Capture** — from window down to target. (2) **Target** — listeners on the target element. (3) **Bubble** — from target back up to window. Most handlers run in bubble phase by default.

```javascript
element.addEventListener('click', handler, true);  // capture
element.addEventListener('click', handler, false); // bubble (default)
```

---

### Q64. What does `event.stopPropagation()` do?

**Short definition:** Prevents the event from traveling to other elements in the current phase chain.

**Answer:** Prevents the event from traveling to other elements in the current phase chain. It does **not** stop other listeners on the same element unless you also use `stopImmediatePropagation()`.

---

### Q65. What is `event.preventDefault()`?

**Short definition:** Cancels the browser's default action (form submit, link navigation) if the event is cancelable.

**Answer:** Cancels the browser's default action (form submit, link navigation) if the event is cancelable. Does not stop propagation.

---

### Q66. Explain event delegation and why it is useful. [must-know] [infosys]

**Short definition:** Register a single listener on a common ancestor; identify the actual source via `event.target` (often with `closest()` for nested markup).

**Answer:** Register a single listener on a common ancestor; identify the actual source via `event.target` (often with `closest()` for nested markup). Benefits: fewer listeners, automatic support for dynamic children, simpler cleanup.

```javascript
document.getElementById('list').addEventListener('click', (e) => {
  const item = e.target.closest('li[data-id]');
  if (!item) return;
  console.log(item.dataset.id);
});
```

---

### Q67. What is the difference between `event.target` and `event.currentTarget`?

**Short definition:** `target` is the element that triggered the event (deepest clicked node).

**Answer:** `target` is the element that triggered the event (deepest clicked node). `currentTarget` is the element whose listener is currently running (often the delegated parent).

---

### Q68. What are custom events?

**Short definition:** `new CustomEvent('my-event', { detail: { id: 1 }, bubbles: true })` plus `element.dispatchEvent(evt)`.

**Answer:** `new CustomEvent('my-event', { detail: { id: 1 }, bubbles: true })` plus `element.dispatchEvent(evt)`. Useful for decoupled component communication in vanilla JS or web components.

---

### Q69. What is passive event listening?

**Short definition:** `{ passive: true }` tells the browser the listener will not call `preventDefault()`, enabling scroll optimizations.

**Answer:** `{ passive: true }` tells the browser the listener will not call `preventDefault()`, enabling scroll optimizations. Touch/wheel listeners may be passive by default in modern browsers.

---

## Event Loop, Microtasks & Macrotasks

---

### Q70. What is the event loop? [must-know]

**Short definition:** JavaScript is single-threaded.

**Answer:** JavaScript is single-threaded. The event loop continuously: (1) runs synchronous code on the call stack, (2) drains the microtask queue (promises, `queueMicrotask`), (3) takes one macrotask (timer, I/O callback), repeat. This interleaves async work without parallel threads in JS itself.

---

### Q71. What is the output order of this code? [must-know]

```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
```

**Short definition:** `1`, `4`, `3`, `2`.

**Answer:** `1`, `4`, `3`, `2`. Sync first; microtasks (promise) before the next macrotask (timeout).

---

### Q72. What is the difference between microtasks and macrotasks?

**Short definition:** Microtasks: promise callbacks, `queueMicrotask`, `MutationObserver`.

**Answer:** Microtasks: promise callbacks, `queueMicrotask`, `MutationObserver`. Macrotasks: `setTimeout`, `setInterval`, I/O, UI rendering. After each macrotask, **all** pending microtasks run to completion.

---

### Q73. Can microtasks starve the UI?

**Short definition:** Yes.

**Answer:** Yes. An infinite chain of `Promise.resolve().then(...)` keeps draining microtasks without yielding to rendering or macrotasks. Always break long async work into chunks or use `requestAnimationFrame`/`setTimeout` for breathing room.

---

### Q74. What is `queueMicrotask` used for?

**Short definition:** Schedules a callback in the microtask queue — same priority as promise `.then`.

**Answer:** Schedules a callback in the microtask queue — same priority as promise `.then`. Useful for running code after the current task but before the next macrotask, e.g., flushing internal queues.

---

### Q75. How does `setTimeout(fn, 0)` behave?

**Short definition:** Schedules `fn` as a macrotask after current sync code and all microtasks complete.

**Answer:** Schedules `fn` as a macrotask after current sync code and all microtasks complete. Minimum delay is often ~4ms in browsers (HTML spec clamping), not literally zero.

---

### Q76. What is batching of async updates similar to React setState? [must-know] [infosys]

**Short definition:** React 18 batches multiple state updates in event handlers and many async contexts into one re-render.

**Answer:** React 18 batches multiple state updates in event handlers and many async contexts into one re-render. In plain JS, you can batch DOM and logic updates by deferring work to a microtask or `requestAnimationFrame` so multiple synchronous mutations coalesce before a single paint. The pattern below mirrors how React schedules a flush after several rapid updates — useful when building vanilla widgets or design systems outside React.

```javascript
let pending = false;
let state = { count: 0 };

function scheduleUpdate() {
  if (pending) return;
  pending = true;
  queueMicrotask(() => {
    pending = false;
    render(state); // single paint after multiple increments
  });
}

function increment() {
  state = { ...state, count: state.count + 1 };
  scheduleUpdate();
}
```

**Follow-up:** `Promise.resolve().then(flush)` achieves similar microtask batching; `requestAnimationFrame` batches to the next frame for visual updates.

---

## Promises & Async/Await

---

### Q77. What is a Promise and its three states? [must-know]

**Short definition:** A Promise represents a future value.

**Answer:** A Promise represents a future value. States: **pending**, **fulfilled** (with a value), **rejected** (with a reason). Settled means fulfilled or rejected; state is immutable once settled.

---

### Q78. What is the difference between `.then()` chaining and async/await?

**Short definition:** Both compile to promise handling.

**Answer:** Both compile to promise handling. `async/await` reads synchronously and uses `try/catch` for errors. Chaining uses return values and `.catch()`. `async` functions always return a Promise.

---

### Q79. How do you handle errors in async/await?

**Short definition:** Wrap in `try/catch` around `await`, or let the returned promise reject and attach `.catch()` at the call site.

**Answer:** Wrap in `try/catch` around `await`, or let the returned promise reject and attach `.catch()` at the call site. Unhandled rejections may log or crash in strict environments.

---

### Q80. What is `Promise.all` vs `Promise.allSettled` vs `Promise.race`?

**Short definition:** `all` rejects fast if any reject; resolves with array of results.

**Answer:** `all` rejects fast if any reject; resolves with array of results. `allSettled` waits for all, never rejects — returns `{ status, value/reason }`. `race` settles with the first settled promise.

---

### Q81. What is promise chaining order?

**Short definition:** Each `.then` returns a new promise.

**Answer:** Each `.then` returns a new promise. Return values become fulfillment values; thrown errors or returned rejections propagate down the chain to the nearest `.catch`.

---

### Q82. What is the async IIFE pattern?

**Short definition:** `(async () => { await doWork(); })();` — allows top-level await-like behavior in scripts without modules, or immediate async execution in callbacks.

**Answer:** `(async () => { await doWork(); })();` — allows top-level await-like behavior in scripts without modules, or immediate async execution in callbacks.

---

### Q83. Can you await non-promise values?

**Short definition:** Yes.

**Answer:** Yes. `await 42` wraps the value in `Promise.resolve(42)`. Useful but often unnecessary in mixed code.

---

### Q84. What is a common async anti-pattern?

**Short definition:** Sequential awaits in a loop when work is independent — use `Promise.all(items.map(async item => ...))` for parallelism.

**Answer:** Sequential awaits in a loop when work is independent — use `Promise.all(items.map(async item => ...))` for parallelism. Also: forgetting to `return` a promise inside `.then`, breaking the chain.

---

## `this`, call, apply & bind

---

### Q85. How is `this` determined in JavaScript? [must-know]

**Short definition:** `this` is set at **call time**, not definition time (except arrows, which use lexical `this`):.

**Answer:** `this` is set at **call time**, not definition time (except arrows, which use lexical `this`):.

1. Default binding — non-strict: global; strict: `undefined`
2. Implicit — `obj.method()` → `obj`
3. Explicit — `call`/`apply`/`bind`
4. `new` — new empty object
5. Arrow — lexical from enclosing scope

---

### Q86. What is the difference between `call`, `apply`, and `bind`? [must-know]

**Short definition:** `call(fn, arg1, arg2)` invokes immediately with comma-separated args.

**Answer:** `call(fn, arg1, arg2)` invokes immediately with comma-separated args. `apply` takes an array of args. `bind` returns a new function with fixed `this` (and optional partial args) without invoking immediately.

```javascript
fn.call(ctx, 1, 2);
fn.apply(ctx, [1, 2]);
const bound = fn.bind(ctx, 1);
```

---

### Q87. What happens to `this` in arrow functions used as object methods?

**Short definition:** Arrow methods do not get their own `this`; they inherit from the enclosing lexical scope — often the global object or outer function, **not** the object.

**Answer:** Arrow methods do not get their own `this`; they inherit from the enclosing lexical scope — often the global object or outer function, **not** the object. Use regular methods for object literals.

---

### Q88. How does `this` work with event handlers?

**Short definition:** DOM listeners called as `element.addEventListener('click', function() {})` set `this` to the element.

**Answer:** DOM listeners called as `element.addEventListener('click', function() {})` set `this` to the element. Arrow handlers inherit lexical `this` from the surrounding scope (often not the element).

---

### Q89. What is soft binding?

**Short definition:** A pattern that tries explicit binding first but falls back to a default context if `undefined` or null is passed — useful for APIs that should tolerate...

**Answer:** A pattern that tries explicit binding first but falls back to a default context if `undefined` or null is passed — useful for APIs that should tolerate loose calls.

---

## OOP & Prototypes

---

### Q90. How does prototypal inheritance work? [must-know]

**Short definition:** Every object has an internal `[[Prototype]]` (accessed via `Object.getPrototypeOf` or `__proto__`).

**Answer:** Every object has an internal `[[Prototype]]` (accessed via `Object.getPrototypeOf` or `__proto__`). Property lookup walks the chain. Functions have a `prototype` property used when invoked with `new` — the new object's `[[Prototype]]` links to `Constructor.prototype`.

```javascript
function Person(name) { this.name = name; }
Person.prototype.greet = function () { return `Hi, ${this.name}`; };
const p = new Person('Alex');
p.greet(); // "Hi, Alex"
```

---

### Q91. What does the `new` keyword do?

**Short definition:** Creates a new object, sets its prototype to `Constructor.prototype`, binds `this` to that object, executes the constructor, and returns the object (unless...

**Answer:** Creates a new object, sets its prototype to `Constructor.prototype`, binds `this` to that object, executes the constructor, and returns the object (unless constructor returns an object explicitly).

---

### Q92. What is the difference between `__proto__` and `prototype`?

**Short definition:** `prototype` exists on **functions** — the object used as the prototype for instances.

**Answer:** `prototype` exists on **functions** — the object used as the prototype for instances. `__proto__` (legacy accessor) is on **instances** — points to their prototype object. Prefer `Object.getPrototypeOf`.

---

### Q93. What are ES6 classes — syntactic sugar?

**Short definition:** `class` provides cleaner syntax for constructor + prototype methods + `extends`/`super`.

**Answer:** `class` provides cleaner syntax for constructor + prototype methods + `extends`/`super`. Under the hood, still prototype-based; hoisting differs from function declarations (TDZ applies).

---

### Q94. What is method overriding vs shadowing?

**Short definition:** Overriding replaces a method on a subclass prototype; `super.method()` calls the parent.

**Answer:** Overriding replaces a method on a subclass prototype; `super.method()` calls the parent. Shadowing assigns an own property on an instance that hides a prototype property without changing the prototype chain.

---

### Q95. What is `instanceof` checking?

**Short definition:** Walks the prototype chain of `obj` looking for `Constructor.prototype`.

**Answer:** Walks the prototype chain of `obj` looking for `Constructor.prototype`. Can be fooled by cross-realm objects or manual prototype manipulation.

---

### Q96. How do you create objects without `class`?

**Short definition:** Object literals, `Object.create(proto)`, factory functions, and constructor functions.

**Answer:** Object literals, `Object.create(proto)`, factory functions, and constructor functions. `Object.create(null)` makes a dictionary without inherited pollution.

---

## Modules (ESM & CommonJS)

---

### Q97. What is the difference between ES modules and CommonJS?

**Short definition:** ESM (`import`/`export`) is static, hoisted, supports tree-shaking, and runs in strict mode.

**Answer:** ESM (`import`/`export`) is static, hoisted, supports tree-shaking, and runs in strict mode. CommonJS (`require`/`module.exports`) is dynamic, synchronous, and dominant in older Node code. Node now supports both with `"type": "module"`.

---

### Q98. What is live binding in ES modules?

**Short definition:** Imported bindings are live views of exported variables — if the exporter mutates `export let count = 0`, importers see updates.

**Answer:** Imported bindings are live views of exported variables — if the exporter mutates `export let count = 0`, importers see updates. Unlike CommonJS, which copies the value at require time for primitives.

---

### Q99. What is dynamic `import()`?

**Short definition:** `import('./module.js')` returns a promise — enables code splitting and conditional loading.

**Answer:** `import('./module.js')` returns a promise — enables code splitting and conditional loading. Supported in browsers and modern Node.

---

### Q100. What is the module scope?

**Short definition:** Each module has its own top-level scope — no globals unless explicitly attached to `window`/`globalThis`.

**Answer:** Each module has its own top-level scope — no globals unless explicitly attached to `window`/`globalThis`. Top-level `this` is `undefined` in ES modules.

---

## Debounce, Throttle & Polyfills

---

### Q101. What is debouncing? [must-know] [infosys]

**Short definition:** Debouncing delays execution until after a burst of events stops for a specified wait time.

**Answer:** Debouncing delays execution until after a burst of events stops for a specified wait time. Classic use: search input — fire API call only after the user pauses typing, not on every keystroke.

```javascript
function debounce(fn, wait, { leading = false, trailing = true } = {}) {
  let timerId = null;
  let lastArgs = null;
  let lastThis = null;

  function invoke() {
    timerId = null;
    if (trailing && lastArgs) fn.apply(lastThis, lastArgs);
    lastArgs = lastThis = null;
  }

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;
    const isFirst = !timerId;
    clearTimeout(timerId);
    if (leading && isFirst) fn.apply(this, args);
    timerId = setTimeout(invoke, wait);
  }

  debounced.cancel = () => {
    clearTimeout(timerId);
    timerId = lastArgs = lastThis = null;
  };
  debounced.flush = () => {
    if (timerId) { clearTimeout(timerId); invoke(); }
  };
  return debounced;
}
```

**Follow-up:** Leading-edge debounce fires immediately then suppresses until quiet period.

---

### Q102. What is throttling? [must-know]

**Short definition:** Throttling ensures a function runs at most once per time window during continuous events (scroll, resize).

**Answer:** Throttling ensures a function runs at most once per time window during continuous events (scroll, resize). Unlike debounce, it guarantees periodic execution during activity.

```javascript
function throttle(fn, wait) {
  let last = 0;
  let timerId = null;
  let lastArgs = null;
  let lastThis = null;

  function trailingInvoke() {
    last = Date.now();
    timerId = null;
    fn.apply(lastThis, lastArgs);
  }

  const throttled = function (...args) {
    const now = Date.now();
    const remaining = wait - (now - last);
    lastArgs = args;
    lastThis = this;
    if (remaining <= 0 || remaining > wait) {
      if (timerId) { clearTimeout(timerId); timerId = null; }
      last = now;
      fn.apply(this, args);
    } else if (!timerId) {
      timerId = setTimeout(trailingInvoke, remaining);
    }
  };

  throttled.cancel = () => {
    clearTimeout(timerId);
    timerId = null;
    lastArgs = lastThis = null;
  };
  return throttled;
}
```

---

### Q103. When do you choose debounce vs throttle? [infosys]

**Short definition:** Debounce for **end-of-action** work (search, form validation after typing).

**Answer:** Debounce for **end-of-action** work (search, form validation after typing). Throttle for **steady feedback** during action (scroll position indicator, infinite scroll load, resize layout updates).

---

### Q104. Implement a debounce with `cancel` method.

**Short definition:** ```javascript function debounce(fn, wait) { let timerId; function debounced(...args) { clearTimeout(timerId); timerId = setTimeout(() => fn.apply(this,...

**Answer:** ```javascript
function debounce(fn, wait) {
  let timerId;
  function debounced(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), wait);
  }
  debounced.cancel = () => clearTimeout(timerId);
  return debounced;
}.
```

---

### Q105. What is a polyfill?

**Short definition:** Code that implements a modern API on older environments, e.g., `Array.prototype.includes` shim.

**Answer:** Code that implements a modern API on older environments, e.g., `Array.prototype.includes` shim. Feature detection (`if (!Array.prototype.includes)`) avoids overwriting native implementations.

---

### Q106. Implement `Array.prototype.map` polyfill (simplified).

**Short definition:** ```javascript if (!Array.prototype.myMap) { Array.prototype.myMap = function (callback, thisArg) { if (this == null) throw new TypeError(); const arr =...

**Answer:** ```javascript
if (!Array.prototype.myMap) {
  Array.prototype.myMap = function (callback, thisArg) {
    if (this == null) throw new TypeError();
    const arr = Object(this);
    const len = arr.length >>> 0;
    const result = new Array(len);
    for (let i = 0; i < len; i++) {
      if (i in arr) result[i] = callback.call(thisArg, arr[i], i, arr);
    }
    return result;
  };
}
```

---

## Machine Coding & Practical Problems

---

### Q107. Flatten a nested array to any depth.

**Short definition:** ```javascript function flatten(arr, depth = Infinity) { return depth === 0 ? arr.slice() : arr.reduce((acc, val) => { return acc.concat(Array.isArray(val) ?...

**Answer:** ```javascript
function flatten(arr, depth = Infinity) {
  return depth === 0 ? arr.slice() : arr.reduce((acc, val) => {
    return acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val);
  }, []);
}
// Or: arr.flat(Infinity) natively.
```

---

### Q108. Implement `deepEqual` for plain objects and arrays.

**Short definition:** Compare types, handle null, recurse on keys for objects, index for arrays.

**Answer:** Compare types, handle null, recurse on keys for objects, index for arrays. Watch reference cycles with a `WeakMap` in production versions.

```javascript
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(k => deepEqual(a[k], b[k]));
}
```

---

### Q109. Implement a function to reverse words in a string.

**Short definition:** `"hello world".split(' ').reverse().join(' ')` → `"world hello"`.

**Answer:** `"hello world".split(' ').reverse().join(' ')` → `"world hello"`. For in-place char reverse with word order: trim, split, reverse array, join — O(n) time, O(n) space.

---

### Q110. Find the first non-repeating character in a string.

**Short definition:** Two passes with a frequency map, or one pass with a Map preserving insertion order:.

**Answer:** Two passes with a frequency map, or one pass with a Map preserving insertion order:.

```javascript
function firstUnique(s) {
  const freq = new Map();
  for (const ch of s) freq.set(ch, (freq.get(ch) || 0) + 1);
  for (const ch of s) if (freq.get(ch) === 1) return ch;
  return null;
}
```

---

### Q111. Implement memoization for a pure function.

**Short definition:** ```javascript function memoize(fn) { const cache = new Map(); return function (...args) { const key = JSON.stringify(args); if (cache.has(key)) return...

**Answer:** ```javascript
function memoize(fn, { resolver = (...args) => JSON.stringify(args), maxSize = Infinity } = {}) {
  const cache = new Map();
  function memoized(...args) {
    const key = resolver(...args);
    if (cache.has(key)) {
      const val = cache.get(key);
      cache.delete(key);
      cache.set(key, val);
      return val;
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    if (cache.size > maxSize) cache.delete(cache.keys().next().value);
    return result;
  }
  memoized.cache = cache;
  memoized.clear = () => cache.clear();
  return memoized;
}.
```

**Common mistake:** Using JSON.stringify for keys when args include functions or circular structures.

---

### Q112. Implement a simple pub/sub (EventEmitter).

**Short definition:** ```javascript function createEmitter() { const events = new Map(); return { on(event, fn) { if (!events.has(event)) events.set(event, new Set());...

**Answer:** ```javascript
function createEmitter() {
  const events = new Map();
  return {
    on(event, fn) {
      if (!events.has(event)) events.set(event, new Set());
      events.get(event).add(fn);
      return () => events.get(event).delete(fn);
    },
    emit(event, payload) {
      events.get(event)?.forEach(fn => fn(payload));
    }
  };
}
```

---

### Q113. Implement `Promise.all` from scratch.

**Short definition:** ```javascript function promiseAll(iterable) { return new Promise((resolve, reject) => { const arr = Array.from(iterable); if (arr.length === 0) return...

**Answer:** ```javascript
function promiseAll(iterable) {
  return new Promise((resolve, reject) => {
    const arr = Array.from(iterable);
    if (arr.length === 0) return resolve([]);
    const results = new Array(arr.length);
    let settled = 0;
    arr.forEach((p, i) => {
      Promise.resolve(p).then(
        val => {
          results[i] = val;
          if (++settled === arr.length) resolve(results);
        },
        reject
      );
    });
  });
}
```

---

### Q114. Implement LRU cache with Map.

**Short definition:** Map preserves insertion order.

**Answer:** Map preserves insertion order. On get, delete and re-insert to mark recent. On set when over capacity, delete the first key (oldest).

```javascript
class LRUCache {
  constructor(limit) {
    this.limit = limit;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return undefined;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }
  set(key, val) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, val);
    if (this.map.size > this.limit) {
      const oldest = this.map.keys().next().value;
      this.map.delete(oldest);
    }
  }
}
```

---

### Q115. Detect if two objects have deep cyclic reference equality safely.

**Short definition:** Track visited pairs in a `WeakMap` (object → object) during recursion.

**Answer:** Track visited pairs in a `WeakMap` (object → object) during recursion. If you revisit the same pair on both sides, treat as equal for that branch; if one side cycles and the other does not, return false.

---

### Q116. Implement infinite curried sum: `sum(1)(2)(3)()` → 6.

**Short definition:** ```javascript function sum(a) { const fn = (b) => (b === undefined ? a : sum(a + b)); fn.valueOf = () => a; fn.toString = () => String(a); return fn; } //...

**Answer:** ```javascript
function sum(a) {
  const fn = (b) => (b === undefined ? a : sum(a + b));
  fn.valueOf = () => a;
  fn.toString = () => String(a);
  return fn;
}
// sum(1)(2)(3) + 0  or invoke with empty call if designed: sum(1)(2)(3)().
```

**Follow-up:** Interviewers may ask for empty final call `()` returning the total — store accumulator in closure and return inner function until `()` with no args.

---

### Q117. Group an array of objects by a key.

**Short definition:** ```javascript function groupBy(arr, key) { return arr.reduce((acc, item) => { const k = item[key]; (acc[k] ??= []).push(item); return acc; }, {}); }.

**Answer:** ```javascript
function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key];
    (acc[k] ??= []).push(item);
    return acc;
  }, {});
}.
```

---

### Q118. Implement `bind` polyfill.

**Short definition:** ```javascript Function.prototype.myBind = function (ctx, ...boundArgs) { const fn = this; return function (...args) { return fn.apply(ctx, [...boundArgs,...

**Answer:** ```javascript
Function.prototype.myBind = function (ctx, ...boundArgs) {
  const fn = this;
  return function (...args) {
    return fn.apply(ctx, [...boundArgs, ...args]);
  };
};.
```

---

### Q119. Write a function to serialize and deserialize a binary tree (machine coding classic).

**Short definition:** Use BFS or DFS with null markers.

**Answer:** Use BFS or DFS with null markers. JSON array form: `[1, 2, 3, null, null, 4, 5]`. Deserialize with a queue indexing children positions `2i+1`, `2i+2` for array heap layout, or recursive preorder with iterator.

---

### Q120. Implement a rate-limited fetch queue (concurrency cap).

**Short definition:** Maintain active count and a queue; when a task finishes, dequeue the next.

**Answer:** Maintain active count and a queue; when a task finishes, dequeue the next. Caps parallel network calls — common in Infosys-style practical rounds combining promises + data structures.

```javascript
async function pooled(tasks, limit) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < tasks.length) {
      const idx = i++;
      results[idx] = await tasks[idx]();
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}
```

---

## Quick Reference — Must-Know Tags Summary

| Topic | Question # |
|-------|------------|
| JS creation / engine | Q1, Q8 |
| `let`/`const`, primitives, equality | Q5, Q14, Q15 |
| Arrow functions | Q30 |
| Closures | Q37, Q41 |
| Event loop | Q70, Q71 |
| Promises | Q77 |
| `this` / bind | Q85 |
| Prototypes | Q90 |
| Debounce / throttle / memoize | Q101–Q104, Q127–Q130 |
| Deep clone / flatten | Q107, Q125, Q129 |
| Event propagation / delegation | Q63, Q66 |
| Batching (setState-like) | Q76 |
| Modern JS (iterators, Proxy) | Q121–Q125 |

---

## Modern JavaScript Features

---

### Q122. What are iterators and `Symbol.iterator`?

**Short definition:** Arrays, strings, Maps, and Sets are iterable — work with for-of and spread.

**Answer:** Arrays, strings, Maps, and Sets are iterable — work with for-of and spread. Custom iterables implement `[Symbol.iterator]()` returning iterator object. Generators automatically create iterators. Iterators enable lazy sequences — infinite lists without allocating full array. Interview tie-in: React keys and reconciliation don't use iterators, but data pipelines often do for large datasets.

**Follow-up:** Iterable vs array-like?

```javascript
const range = {
  from: 1, to: 3,
  [Symbol.iterator]() {
    let cur = this.from;
    const last = this.to;
    return { next() { return cur <= last ? { value: cur++, done: false } : { done: true }; } };
  }
};
```

---

### Q123. What are generator functions?

**Short definition:** Call returns iterator; `yield` pauses and returns value; `next()` resumes.

**Answer:** Call returns iterator; `yield` pauses and returns value; `next()` resumes. Useful for lazy sequences, infinite streams, and coroutine-style async before async/await dominated. `yield*` delegates to another iterable. Generators power some Redux-Saga patterns. Rare in daily frontend now but appears in advanced JS interviews and polyfill implementations.

**Follow-up:** Generators vs async functions?

---

### Q124. What is `Proxy` used for?

**Short definition:** `new Proxy(target, { get(obj, prop) {...}, set(obj, prop, val) {...} })`.

**Answer:** `new Proxy(target, { get(obj, prop) {...}, set(obj, prop, val) {...} })`. Used in reactivity systems (Vue 3), Immer-like patterns, validation layers, and logging. Enables meta-programming without modifying original object. Performance overhead vs direct access — fine for state management, not hot loops. Shows deep JS knowledge in senior interviews.

**Follow-up:** Proxy vs Object.defineProperty?

---

### Q125. What is top-level await in modules?

**Short definition:** Only in ES modules — `const config = await fetchConfig(); export default config;`.

**Answer:** Only in ES modules — `const config = await fetchConfig(); export default config;`. Module importers wait until initialization completes. Useful for config loading in Node ESM and dynamic setup. Cannot use in scripts without `type="module"`. Differs from async IIFE — cleaner syntax, graph-level blocking. Node and modern browsers support it.

**Follow-up:** Circular dependency with top-level await?

---

### Q126. What is `structuredClone` and its limitations?

**Short definition:** Clones nested objects, arrays, Dates, Maps, Sets, ArrayBuffers, and cyclic references.

**Answer:** Clones nested objects, arrays, Dates, Maps, Sets, ArrayBuffers, and cyclic references. Does not clone functions, DOM nodes, or certain symbols. Preferred over JSON.parse/stringify for deep copy in modern browsers and Node 17+. Still not universal substitute for domain-specific clone logic — know what types it handles. Interview: mention after JSON.stringify limitations.

**Follow-up:** structuredClone vs lodash cloneDeep?

---

## Advanced Machine Coding

---

### Q127. Implement production-grade debounce with leading and trailing edges. [must-know] [infosys]

**Short definition:** Debounce delays execution until events stop for `wait` ms.

**Answer:** Debounce delays execution until events stop for `wait` ms. Leading edge fires immediately then suppresses until quiet. Trailing fires after pause — default for search. Production version preserves `this` and args, exposes cancel and flush. Used in resize, search autocomplete, and window scroll end detection. Infosys frequently asks to code this live — know both edges and cleanup.

**Follow-up:** debounce vs lodash debounce options?

```javascript
function debounce(fn, wait, { leading = false, trailing = true } = {}) {
  let timerId = null;
  let lastArgs = null;
  let lastThis = null;

  function invoke() {
    timerId = null;
    if (trailing && lastArgs) fn.apply(lastThis, lastArgs);
    lastArgs = lastThis = null;
  }

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;
    const isFirst = !timerId;
    clearTimeout(timerId);
    if (leading && isFirst) fn.apply(this, args);
    timerId = setTimeout(invoke, wait);
  }

  debounced.cancel = () => {
    clearTimeout(timerId);
    timerId = lastArgs = lastThis = null;
  };
  debounced.flush = () => {
    if (timerId) {
      clearTimeout(timerId);
      invoke();
    }
  };
  return debounced;
}
```

---

### Q128. Implement throttle with leading, trailing, and cancel. [must-know] [infosys]

**Short definition:** Unlike debounce, throttle guarantees periodic execution during activity — scroll handlers, mouse move tracking, infinite scroll position checks.

**Answer:** Unlike debounce, throttle guarantees periodic execution during activity — scroll handlers, mouse move tracking, infinite scroll position checks. Track last run timestamp; schedule trailing call if invoked inside window. rAF-throttle variant syncs to paint. Infosys compares debounce vs throttle — throttle for steady feedback during action, debounce for end-of-action.

**Follow-up:** throttle with requestAnimationFrame?

```javascript
function throttle(fn, wait) {
  let last = 0;
  let timerId = null;
  let lastArgs = null;
  let lastThis = null;

  function trailingInvoke() {
    last = Date.now();
    timerId = null;
    fn.apply(lastThis, lastArgs);
  }

  const throttled = function (...args) {
    const now = Date.now();
    const remaining = wait - (now - last);
    lastArgs = args;
    lastThis = this;
    if (remaining <= 0 || remaining > wait) {
      if (timerId) { clearTimeout(timerId); timerId = null; }
      last = now;
      fn.apply(this, args);
    } else if (!timerId) {
      timerId = setTimeout(trailingInvoke, remaining);
    }
  };

  throttled.cancel = () => {
    clearTimeout(timerId);
    timerId = null;
    lastArgs = lastThis = null;
  };
  return throttled;
}
```

---

### Q129. Implement flatten with depth control and iterative fallback. [must-know] [infosys]

**Short definition:** Recursive reduce is interview-clean; iterative stack handles very deep arrays without stack overflow.

**Answer:** Recursive reduce is interview-clean; iterative stack handles very deep arrays without stack overflow. Native `Array.flat(depth)` in ES2019. Edge cases: sparse arrays, non-array elements, depth 0 returns shallow copy. Infosys may ask without flat() — show both recursive and iterative. Time O(n) total elements; space O(depth) recursive.

**Follow-up:** flatMap vs map plus flat?

```javascript
function flatten(arr, depth = Infinity) {
  if (depth === 0) return arr.slice();
  const result = [];
  const stack = [{ items: arr, d: depth }];
  while (stack.length) {
    const { items, d } = stack.pop();
    for (let i = items.length - 1; i >= 0; i--) {
      const val = items[i];
      if (Array.isArray(val) && d > 0) {
        stack.push({ items: val, d: d - 1 });
      } else {
        result.unshift(val);
      }
    }
  }
  return result;
}
```

---

### Q130. Implement deepClone handling cycles, Dates, and Maps. [must-know] [infosys]

**Short definition:** JSON.stringify fails on functions, undefined, cycles, and loses Date type.

**Answer:** JSON.stringify fails on functions, undefined, cycles, and loses Date type. Production deepClone tracks visited objects in WeakMap to handle circular references. Handle Date, RegExp, Map, Set, ArrayBuffer as needed. `structuredClone` covers many cases natively — interviewers want manual version understanding. State immutability in React depends on correct copying semantics.

**Follow-up:** When is shallow copy enough?

```javascript
function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return seen.get(value);

  if (value instanceof Date) return new Date(value);
  if (value instanceof RegExp) return new RegExp(value);
  if (value instanceof Map) {
    const m = new Map();
    seen.set(value, m);
    value.forEach((v, k) => m.set(deepClone(k, seen), deepClone(v, seen)));
    return m;
  }
  if (value instanceof Set) {
    const s = new Set();
    seen.set(value, s);
    value.forEach(v => s.add(deepClone(v, seen)));
    return s;
  }
  if (Array.isArray(value)) {
    const arr = [];
    seen.set(value, arr);
    value.forEach((item, i) => { arr[i] = deepClone(item, seen); });
    return arr;
  }
  const obj = {};
  seen.set(value, obj);
  for (const key of Object.keys(value)) {
    obj[key] = deepClone(value[key], seen);
  }
  return obj;
}
```

---

### Q131. Implement memoize with JSON key, custom resolver, and cache limit. [must-know] [infosys]

**Short definition:** Basic memoize uses Map and JSON.stringify for keys — fails on functions and non-JSON values.

**Answer:** Basic memoize uses Map and JSON.stringify for keys — fails on functions and non-JSON values. Production version accepts `resolver(...args)` for custom keys and max cache size with LRU eviction. Used in expensive compute — fibonacci, API response transform, selector-like utilities. React useMemo is component-scoped memoize. Clear cache method useful for tests.

**Follow-up:** memoize vs React useMemo?

```javascript
function memoize(fn, { resolver = (...args) => JSON.stringify(args), maxSize = Infinity } = {}) {
  const cache = new Map();
  function memoized(...args) {
    const key = resolver(...args);
    if (cache.has(key)) {
      const val = cache.get(key);
      cache.delete(key);
      cache.set(key, val);
      return val;
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    if (cache.size > maxSize) {
      cache.delete(cache.keys().next().value);
    }
    return result;
  }
  memoized.cache = cache;
  memoized.clear = () => cache.clear();
  return memoized;
}
```

---

### Q132. Implement `compose` and `pipe` utilities.

**Short definition:** `compose(f, g, h)(x)` equals `f(g(h(x)))`.

**Answer:** `compose(f, g, h)(x)` equals `f(g(h(x)))`. Used in functional pipelines and Redux middleware chain conceptually. Pipe reads naturally for data transformation steps. Both validate functions and return identity for empty list. Shows functional programming fluency common in JS interviews at product companies.

**Follow-up:** compose vs Redux applyMiddleware?

```javascript
const compose = (...fns) => fns.reduce((a, b) => (...args) => a(b(...args)));
const pipe = (...fns) => fns.reduce((a, b) => (...args) => b(a(...args)));
```

---

### Q133. Implement `once` function wrapper.

**Short definition:** Subsequent calls return cached value without re-invoking.

**Answer:** Subsequent calls return cached value without re-invoking. Useful for initialization, singleton API setup, and event handlers that should fire once. Track called flag and cached result. Handle void return separately. Variant `oncePerKey` caches per argument hash for different inputs.

**Follow-up:** once vs memoize for zero-arg functions?

```javascript
function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}
```

---

### Q134. Implement async retry with exponential backoff.

**Short definition:** Loop or recursive async function tries `fn()` up to `retries` times.

**Answer:** Loop or recursive async function tries `fn()` up to `retries` times. On failure, wait `delay * 2**attempt` ms before retry. Used for flaky network, rate limits, and cloud API calls. Optionally jitter delay to avoid thundering herd. Infosys combines with Promise questions — show clean async/await version with try/catch.

**Follow-up:** When not to retry?

```javascript
async function retry(fn, { retries = 3, delay = 300 } = {}) {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < retries) await new Promise(r => setTimeout(r, delay * 2 ** i));
    }
  }
  throw lastError;
}
```

---

### Q135. Implement `Promise.race` with timeout wrapper.

**Short definition:** Pattern: `Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), ms))])`.

**Answer:** Pattern: `Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), ms))])`. Used for fetch deadlines and preventing hung UI. Clear timeout on success to avoid memory leaks in long-running apps. AbortController is modern fetch cancellation alternative. Both appear in senior frontend interviews.

**Follow-up:** AbortController vs timeout race?

```javascript
function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
```

---

### Q136. JavaScript interview sound bite — language plus runtime. [must-know]

**Short definition:** "JavaScript is single-threaded with an event loop — sync code on call stack, microtasks before macrotasks.

**Answer:** "JavaScript is single-threaded with an event loop — sync code on call stack, microtasks before macrotasks. I understand closures, prototypal inheritance, and `this` binding rules. I use strict equality, avoid coercion pitfalls, and prefer const/let. For async I use async/await with proper error handling. I can implement debounce, throttle, deepClone, and memoize for machine coding rounds. In React apps I apply batching concepts and immutable updates. I know when to reach for structuredClone, WeakMap, and optional chaining in modern codebases."

**Follow-up:** V8 optimization basics?

---

**Total questions: 135**
