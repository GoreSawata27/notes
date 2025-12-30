// A variable is a named container that stores data in memory so it can be used and updated later.

// | Keyword | Scope    | Reassign | Hoisted | Use Case  |
// | ------- | -------- | -------- | ------- | --------- |
// | `var`   | Function | ✅        | Yes     | ❌ Avoid   |
// | `let`   | Block    | ✅        | No*     | ✅ Default |
// | `const` | Block    | ❌        | No*     | ✅ Default |

// | Declaration | Hoisted | Initialized |
// | ----------- | ------- | ----------- |
// | `var`       | ✅    | `undefined` |
// | `let`       | ✅       | ❌      | if access before initialization gives ReferenceError
// | `const`     | ✅       | ❌     | if access gives ReferenceError

{
  var a = "sasads";
}

console.log(a); // sasads

// var is NOT block-scoped.
// var is function-scoped.

// Execution Context - > variables

// Every time JS runs code, it creates an Execution Context:
// Execution Context Contains:
// Memory (Variable Environment)
// Code (Execution Thread)

// Types:

// Global Execution Context
// Function Execution Context

// Start Program
// ↓
// Create Global Execution Context
// ↓
// Memory Creation Phase
// ↓
// Execution Phase
// ↓
// Program End

// | Keyword | Memory Phase | Access Before Init |
// | ------- | ------------ | ------------------ |
// | `var`   | `undefined`  | ✅ allowed          |
// | `let`   | TDZ          | ❌ error            |
// | `const` | TDZ          | ❌ error            |

// JavaScript first allocates memory, then executes code line-by-line.

// *******************-**********************
// Function Execution in JavaScript

// Function execution is the process where JavaScript allocates memory for a function and
// its variables, then runs the function code when it is called.

// Concept

// JavaScript runs code in two phases:
// Memory Creation Phase – function is stored in memory
// Execution Phase – function runs when called
// Every function call creates a new execution context
// The call stack manages which function runs first
