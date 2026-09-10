// 1. What is currying
// Currying turns f(a, b, c) into f(a)(b)(c): a chain of unary functions.
// Each call returns a new function that closes over args collected so far.
// Same result as the original, different calling shape. Named after Haskell Curry.

function add(a, b, c) {
  return a + b + c;
}
const curriedAdd = (a) => (b) => (c) => a + b + c;

add(1, 2, 3); // 6
curriedAdd(1)(2)(3); // 6
const add1 = curriedAdd(1);
add1(2)(3); // 6 — reuse the partially filled function

// 2. Manual curry
// Nested functions are the interview-friendly form. The innermost function
// does the real work; outer levels only capture arguments via closure.

function volume(l) {
  return function (w) {
    return function (h) {
      return l * w * h;
    };
  };
}
volume(2)(3)(4); // 24
const base = volume(2)(3);
base(4); // 24
base(10); // 60

// 3. Generic curry helper
// Collect args until args.length >= fn.length, then call the original.
// Extra args in one call still count (not strictly unary).
// Pitfall: rest params and defaults make fn.length lie.

function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...next) => curried.apply(this, args.concat(next));
  };
}
function multiply(a, b, c) {
  return a * b * c;
}
const curriedMul = curry(multiply);
curriedMul(2)(3)(4); // 24
curriedMul(2, 3)(4); // 24
curriedMul(2)(3, 4); // 24

// 4. Curry vs partial application
// Curry: keep returning a function until every formal parameter is filled.
// Partial: pre-fill some args now, accept the rest later — not necessarily one-at-a-time.
// Function.prototype.bind is partial application, not currying.

function greet(hi, name, end) {
  return `${hi}, ${name}${end}`;
}
const sayHello = greet.bind(null, "Hello"); // still needs name + end
sayHello("Ada", "!"); // "Hello, Ada!"

const curryGreet = (hi) => (name) => (end) => `${hi}, ${name}${end}`;
curryGreet("Hi")("Ada")("."); // one argument per call

// 5. Placeholders
// A hole (_) lets you fix a later argument first (Ramda: R.__, lodash/fp: _).
// Incoming values fill holes left-to-right, then append leftover args.

const _ = Symbol("_");

function mergeArgs(prev, next) {
  const extra = [...next];
  const merged = prev.map((a) => (a === _ && extra.length ? extra.shift() : a));
  return merged.concat(extra);
}

function curryHole(fn) {
  const gather = (...args) => {
    const slot = args.slice(0, fn.length);
    if (slot.length >= fn.length && !slot.includes(_)) return fn(...slot);
    return (...more) => gather(...mergeArgs(args, more));
  };
  return gather;
}
const divide = (a, b) => a / b;
const half = curryHole(divide)(_, 2);
half(10); // 5
curryHole(divide)(10)(2); // 5

// 6. Real use cases
// Specialized callbacks, config-first APIs, and reusable mappers.
// Curry once, pass the unary result to map / filter / addEventListener.

const map = (fn) => (xs) => xs.map(fn);
const get = (key) => (obj) => obj[key];
const names = map(get("name"));
names([{ name: "Ada" }, { name: "Lin" }]); // ["Ada", "Lin"]

const logAt = (level) => (msg) => console.log(`[${level}] ${msg}`);
const error = logAt("error");
error("disk full");

const onClick = (fn) => (el) => el.addEventListener("click", fn);

// 7. compose
// compose(f, g, h)(x) runs right-to-left: f(g(h(x))).
// Works cleanly when each step is unary — which currying gives you.

const compose = (...fns) => (x) => fns.reduceRight((v, f) => f(v), x);
const double = (n) => n * 2;
const inc = (n) => n + 1;
compose(double, inc)(3); // 8  — double(inc(3))

// 8. pipe
// pipe(h, g, f)(x) runs left-to-right: f(g(h(x))).
// Same idea as compose, usually easier to read as a data pipeline.

const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
pipe(inc, double)(3); // 8  — double(inc(3))
pipe(get("name"), (s) => s.toUpperCase())({ name: "ada" }); // "ADA"

// 9. Infinite curry vs fixed arity
// Some interview puzzles use a terminator (empty call or valueOf)
// instead of fn.length. That is a running accumulator, not classic curry.

function sum(a) {
  const next = (b) => (b === undefined ? a : sum(a + b));
  next.valueOf = () => a;
  return next;
}
sum(1)(2)(3)(); // 6
+sum(1)(2)(3); // 6 via valueOf

// 10. Pitfalls
// Over-currying hides arity and hurts stack traces.
// fn.length is 0 for (...args) and skips params after the first default.
// Debugging is easier if you keep a named inner function in the helper.

function withDefault(a, b = 1) {
  return a + b;
}
withDefault.length; // 1 — curry would fire too early
function resty(...xs) {
  return xs;
}
resty.length; // 0
