// 1. First-class functions
// Functions are values: assign, pass, return, store on objects or in arrays.
// A higher-order function takes or returns a function (map, then, onClick).

function greet(name) {
  return `Hello ${name}`;
}
const alsoGreet = greet;
const printName = (fn) => fn("gore");
printName(alsoGreet); // "Hello gore"

// 2. Function declarations
// function name() {} is hoisted — callable before its line.
// Own this, arguments, and .prototype. Can be new'd. Name is required.

add(2, 3); // 5
function add(a, b) {
  return a + b;
}
typeof add; // "function"

// 3. Function expressions
// const fn = function () {} is not hoisted as a function (var → undefined,
// let/const → TDZ). A name after function is local — good for recursion.

// square(3); // TDZ if const
const square = function (n) {
  return n * n;
};
const fact = function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
};
fact(4); // 24
// factorial(4); // ReferenceError

// 4. Arrow functions
// Lexical this / arguments / new.target. No .prototype; cannot be new'd.
// Expression body ⇒ implicit return. Objects need parens: () => ({})
// No yield. Best for inline callbacks you own.

const sum = (a, b) => a + b;
const makeUser = (name) => ({ name });
// const bad = () => { name: "Ada" }; // labeled block, not an object
// new sum(); // TypeError: not a constructor

// 5. Hoisting differences
// Declaration: whole body hoisted.
// var fn = function: undefined until assigned. let/const / arrow: TDZ.
// In modules, a function declaration inside a block is block-scoped.

console.log(typeof decl); // "function"
console.log(typeof expr); // "undefined" (var)
function decl() {}
var expr = function () {};
{
  function inner() {}
}
// inner(); // ReferenceError in modules

// 6. arguments vs rest
// arguments: array-like, not an array; only on non-arrows.
// Rest (...args) is a real array and works in arrows — prefer it.
// Arrows have no own arguments; they see the enclosing function's.

function oldSum() {
  return Array.from(arguments).reduce((a, b) => a + b, 0);
}
const newSum = (...args) => args.reduce((a, b) => a + b, 0);
oldSum(1, 2, 3); // 6
newSum(1, 2, 3); // 6
function wrapper() {
  const inner = () => arguments[0];
  return inner();
}
wrapper("hi"); // "hi"

// 7. Default parameters
// Evaluated at call time, left to right, only when the arg is undefined
// (null and 0 are kept). Later defaults may read earlier params.

function page(n = 1, size = 10, end = n * size) {
  return { n, size, end };
}
page(); // { n: 1, size: 10, end: 10 }
page(undefined, 20); // n is 1
page(null); // n is null — not replaced

// 8. this by function kind
// Declaration / expression: this comes from the call site.
// Arrow: this from the enclosing scope; call/apply/bind cannot change it.
// Object method shorthand is a regular function (lost if extracted).

const obj = {
  id: 1,
  regular() {
    return this.id;
  },
  nested() {
    return (() => this.id)();
  },
};
obj.regular(); // 1
obj.nested(); // 1
const loose = obj.regular;
// loose(); // TypeError in strict — this is undefined

// 9. IIFE
// Immediately Invoked Function Expression: private scope, run at once.
// Historic module pattern; still useful for one-shot setup.

const token = (() => JSON.parse("{}"))();
(function (g) {
  g.__boot = true;
})(globalThis);

// 10. Callbacks
// A function passed in to be invoked later. The callee decides when.
// Use a named function if you need removeEventListener or a clear stack.

function fetchData(cb) {
  setTimeout(() => cb(null, { ok: true }), 100);
}
function onDone(err, data) {
  console.log(err || data);
}
fetchData(onDone);

// 11. new vs arrows
// Regular functions: new makes an object, sets [[Prototype]] to fn.prototype,
// returns that object unless you return another object. Arrows cannot construct.

function User(name) {
  this.name = name;
}
new User("Ada") instanceof User; // true
// new ((name) => ({ name }))(); // TypeError

// 12. name and length
// fn.name comes from the variable (or "bound name" after bind).
// fn.length counts parameters before the first default or rest.

const named = function demo(a, b = 1, ...rest) {};
named.name; // "demo"
named.length; // 1
named.bind(null).name; // "bound demo"
