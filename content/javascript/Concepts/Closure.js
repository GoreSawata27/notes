// 1. What a closure is
// A closure is a function plus its lexical environment: it remembers
// variables from where it was defined, even after the outer function returns.

function outer() {
  const secret = "ok";
  return function inner() {
    return secret;
  };
}
const fn = outer();
fn(); // "ok" — outer's frame is gone; inner still sees secret

// 2. Lexical environment
// Scope is decided by where the function is written, not where it is called.
// Lookup walks own env → outer env → … → global. The closure keeps that chain.

const x = "global";
function make() {
  const x = "outer";
  return function read() {
    return x;
  };
}
make()(); // "outer", not "global"

// 3. Factory functions
// Each outer call creates a fresh lexical environment.
// Returned functions from different calls do not share those locals.

function makeGreeter(hi) {
  return (name) => `${hi}, ${name}`;
}
const hello = makeGreeter("Hello");
const yo = makeGreeter("Yo");
hello("Ada"); // "Hello, Ada"
yo("Ada"); // "Yo, Ada"

// 4. Private counters
// Locals are hidden; callers only use the functions you return.
// That is encapsulation without private class fields.

function createCounter(start = 0) {
  let count = start;
  return {
    inc: () => ++count,
    value: () => count,
  };
}
const c = createCounter();
c.inc(); // 1
c.inc(); // 2
c.value(); // 2
c.count; // undefined

// 5. Stale closures in loops
// var is function-scoped: every callback shares one i (the final value).
// let creates a new binding per iteration. Classic setTimeout-in-for interview.

for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("var", i), 0); // 3, 3, 3
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log("let", j), 0); // 0, 1, 2
}
for (var k = 0; k < 3; k++) {
  setTimeout(((n) => () => console.log("bind", n))(k), 0); // 0, 1, 2
}

// 6. Stale closures in async / UI
// The function captures the binding, not a photocopy of the value.
// If this environment never updates, you see an old value (React: each
// render has its own state; a callback from render N reads render N).

let n = 1;
setTimeout(() => console.log(n), 50); // 2 — live binding
n = 2;

function staleFetch(id) {
  return () => console.log(id); // id from this call, not "latest"
}

// 7. Module pattern
// An IIFE (or ES module body) runs once, keeps privates, exports an API.

const cart = (function () {
  const items = [];
  return {
    add(item) {
      items.push(item);
    },
    total: () => items.reduce((s, it) => s + it.price, 0),
  };
})();
cart.add({ price: 10 });
cart.total(); // 10
// items stays hidden

// 8. Memory leaks
// A closure keeps its whole lexical env reachable — large objects and DOM
// nodes included. Timers, listeners, and module caches are the usual leaks.
// Dispose: clearInterval, removeEventListener, don't close over the node.

function attach(node) {
  const huge = new Array(1e6).fill(node.innerHTML);
  const onClick = () => console.log(huge.length);
  node.addEventListener("click", onClick);
  return () => node.removeEventListener("click", onClick);
}

// 9. Shared vs separate environments
// Two functions from the same outer call share bindings.
// Two outer calls → two independent environments.

function pair() {
  let n = 0;
  return { a: () => ++n, b: () => ++n };
}
const p = pair();
p.a(); // 1
p.b(); // 2 — same n
pair().a(); // 1 — new n

// 10. Practical closures
// once, memoize, and partial helpers are closures over private state.

function once(fn) {
  let done = false;
  let result;
  return function (...args) {
    if (done) return result;
    done = true;
    result = fn.apply(this, args);
    return result;
  };
}
const init = once(() => "ready");
init(); // "ready"
init(); // "ready" — fn does not run again
