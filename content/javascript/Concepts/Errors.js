// 1. Error object
// Runtime exceptions are Error (or a subclass): name, message, stack,
// and (ES2022) cause. You can throw any value — don't; you lose the stack.

const err = new Error("boom");
err.name; // "Error"
err.message; // "boom"
err.stack; // engine-specific frames

// 2. ReferenceError
// The binding does not exist, or it is still in the TDZ (let / const / class).
// Different from a declared variable whose value is undefined.

// console.log(missing); // missing is not defined
// console.log(x); // Cannot access 'x' before initialization
let x = 5;
typeof missing; // "undefined" — typeof is safe for undeclared names

// 3. TypeError
// Wrong type: call a non-function, read null/undefined, assign to const
// or a frozen object (throws in strict / modules).

// null.f(); // Cannot read properties of null
// (5).toUpperCase(); // not a function
const n = 1;
// n = 2; // Assignment to constant variable
Object.freeze({ a: 1 }).a = 2; // TypeError in strict; ignored in sloppy

// 4. SyntaxError
// The parser never built a program. You cannot catch it in the same file.
// You can catch it from JSON.parse, eval, or new Function.

// if (true { }  // Unexpected token '{'
try {
  JSON.parse("{");
} catch (e) {
  e instanceof SyntaxError; // true
}

// 5. RangeError
// A number or length is outside the allowed range. Deep recursion is
// "Maximum call stack size exceeded" (V8). Firefox may use InternalError.

// new Array(-1);
// (10).toPrecision(500);
function recurse(k) {
  return recurse(k + 1);
}

// 6. URIError
// decodeURI / encodeURI throw on malformed sequences.
// An EvalError exists for history; engines almost never throw it now.

decodeURIComponent("a%"); // URI malformed

// 7. throw
// throw expr; exits the current function. Prefer new SomeError(msg)
// so callers can use instanceof and still have a stack.

function parseAge(raw) {
  const age = Number(raw);
  if (Number.isNaN(age)) throw new TypeError("age must be numeric");
  if (age < 0) throw new RangeError("age must be >= 0");
  return age;
}
parseAge("21"); // 21

// 8. try / catch / finally
// finally always runs (success, throw, or return). A return in finally
// wins over try. Optional catch binding: catch { } (ES2019).

function read() {
  try {
    return parseAge("no");
  } catch (e) {
    console.log(e.message);
    return 0;
  } finally {
    console.log("cleanup");
  }
}
read(); // logs message, then "cleanup", returns 0

// 9. Rethrow
// Handle what you know; rethrow the rest. No catch-if syntax — use if + throw.

try {
  parseAge(-1);
} catch (e) {
  if (e instanceof RangeError) console.log("bad range");
  else throw e;
}

// 10. Async errors
// try/catch around setTimeout only wraps scheduling, not the callback.
// await inside try/catch (or .catch). throw in async rejects the promise.

try {
  setTimeout(() => {
    throw new Error("late"); // not caught here
  }, 0);
} catch (e) {
  // never runs — the throw is inside the timer
}

async function load() {
  try {
    await Promise.reject(new Error("network"));
  } catch (e) {
    console.log(e.message); // "network"
  }
}

// 11. Custom errors
// Extend Error, call super(message), set this.name. Keep instanceof working.

class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}
try {
  throw new ValidationError("email required", "email");
} catch (e) {
  e instanceof ValidationError; // true
  e instanceof Error; // true
}

// 12. Error.cause
// Second argument { cause } (ES2022) wraps a lower-level error.
// DevTools shows the chain; read it later as err.cause.

try {
  JSON.parse("{");
} catch (e) {
  throw new Error("invalid config", { cause: e });
}

// 13. AggregateError
// One error that holds several. Promise.any rejects with this when
// every promise rejects. errors is the array of reasons.

Promise.any([Promise.reject("a"), Promise.reject("b")]).catch((e) => {
  e instanceof AggregateError; // true
  e.errors; // ["a", "b"]
});
new AggregateError([new Error("x")], "batch failed").errors.length; // 1
