/* 

Hoisting is JavaScript’s default behavior of moving declarations to the top of their 
scope before execution.

*/
/*

| Declaration Type | Hoisted? | Initialized?  | Can Use Before Decl? |
| ---------------- | -------- | ------------- | -------------------- |
| `var`            | ✅ Yes    | ✅ `undefined` | ⚠️ Yes (undefined)   |
| `let`            | ✅ Yes    | ❌ No          | ❌ No (TDZ)           |
| `const`          | ✅ Yes    | ❌ No          | ❌ No (TDZ)           |
| Function Decl.   | ✅ Yes    | ✅ Yes         | ✅ Yes                |
| Function Expr.   | Depends  | Depends       | ❌ Usually No         |
| Arrow Function   | Depends  | Depends       | ❌ No                 |
| Class            | ✅ Yes    | ❌ No          | ❌ No (TDZ)           |

*/

// 1. Variable Hoisting
// var
// Hoisted to the top of its function or global scope - Initialized with undefined

console.log(a); // undefined
var a = 10;

// How JavaScript sees it internally:

var a;
console.log(a);
a = 10;

// No error, but value is undefined

// let and const

// Hoisted, but not initialized
// Exist in the Temporal Dead Zone (TDZ) until declaration is reached

console.log(b); // ❌ ReferenceError
let b = 20;

console.log(c); // ❌ ReferenceError
const c = 30;

// 📌 TDZ = time between entering scope and actual declaration

// ------------------------------------------------------------------------------------------

// 2. Function Hoisting

// Function Declarations - Fully hoisted (both name and body)

sayHello(); //  works

function sayHello() {
  console.log("Hello!");
}

// Function Expressions -Hoisting depends on how they are declared

// With var

sayHi(); // ❌ TypeError: sayHi is not a function

var sayHi = function () {
  console.log("Hi");
};

/*
Why?

var sayHi;      // hoisted as undefined
sayHi();        // undefined()
sayHi = function() {};

With let / const
sayHey(); // ❌ ReferenceError

const sayHey = function () {
  console.log("Hey");
};

*/

// Arrow Functions - Arrow functions behave like function expressions.

hello(); //  ReferenceError

const hello = () => {
  console.log("Hello");
};

// 3. Class Hoisting - Classes are hoisted but not initialized (like let / const).

const user = new User(); //  ReferenceError

class User {
  constructor(name) {
    this.name = name;
  }
}

/************************************************************
 * ARROW FUNCTION vs FUNCTION DECLARATION
 * All examples and definitions in one file
 ************************************************************/

/************************************************************
 * 1. FUNCTION DECLARATION
 *
 * - Fully hoisted (can be used before definition)
 * - Has its own `this`
 * - Has its own `arguments` object
 * - Can be used as a constructor (with `new`)
 ************************************************************/

sayHello2(); // ✅ Works because function declarations are hoisted

function sayHello2() {
  console.log("Hello from function declaration");
}

/************************************************************
 * 2. ARROW FUNCTION
 *
 * - NOT hoisted like function declarations
 * - Does NOT have its own `this`
 * - Does NOT have `arguments`
 * - Cannot be used as a constructor
 * - Shorter syntax
 ************************************************************/

// greet(); // ❌ ReferenceError (cannot access before initialization)

const greet = () => {
  console.log("Hello from arrow function");
};

greet(); // ✅ Works after declaration

/************************************************************
 * 3. THIS BEHAVIOR (MOST IMPORTANT DIFFERENCE)
 ************************************************************/

// Function Declaration → `this` is dynamic
const user1 = {
  name: "Alice",
  greet: function () {
    console.log("Function this:", this.name);
  },
};

user1.greet(); // ✅ Alice

// Arrow Function → `this` is lexical (inherits from parent scope)
const user2 = {
  name: "Bob",
  greet: () => {
    console.log("Arrow this:", this.name);
  },
};

user2.greet(); // ❌ undefined (arrow has no own `this`)

/************************************************************
 * 4. THIS INSIDE CALLBACKS
 ************************************************************/

function TimerWithFunction() {
  this.count = 0;

  setInterval(function () {
    // ❌ `this` is not TimerWithFunction
    // console.log(this.count); // undefined
  }, 1000);
}

function TimerWithArrow() {
  this.count = 0;

  setInterval(() => {
    // ✅ arrow inherits `this` from TimerWithArrow
    this.count++;
    console.log("Arrow timer:", this.count);
  }, 1000);
}

// Uncomment to test
// new TimerWithArrow();

/************************************************************
 * 5. ARGUMENTS OBJECT
 ************************************************************/

function normalFunction() {
  console.log("Function arguments:", arguments);
}

normalFunction(1, 2, 3);

// Arrow functions do NOT have `arguments`
const arrowFunction = () => {
  // console.log(arguments); // ❌ ReferenceError
};

// Correct way with arrow function
const arrowWithRest = (...args) => {
  console.log("Arrow rest args:", args);
};

arrowWithRest(1, 2, 3);

/************************************************************
 *  WHEN TO USE WHAT (SUMMARY)
 *
 * Use FUNCTION DECLARATION when:
 * - You need hoisting
 * - You need dynamic `this`
 * - You need constructors or prototypes
 *
 * Use ARROW FUNCTION when:
 * - Writing callbacks
 * - Using array methods (map, filter, reduce)
 * - You want lexical `this`
 * - You want cleaner, shorter syntax
 ************************************************************/

// Function *----------------------------------------------------------------------------------------------*

/**************************************************
 * 1. FUNCTION DECLARATION
 **************************************************/
// function add(a, b) {
//   return a + b;
// }

/**************************************************
 * 2. FUNCTION EXPRESSION
 **************************************************/
// const add = function (a, b) {
//   return a + b;
// };

/**************************************************
 * 3. ARROW FUNCTION
 **************************************************/
// const add = (a, b) => a + b;

/**************************************************
 * 4. ANONYMOUS FUNCTION
 **************************************************/
// setTimeout(function () {
//   console.log("Anonymous function");
// }, 1000);

/**************************************************
 * 5. NAMED FUNCTION EXPRESSION
 **************************************************/
// const factorial = function fact(n) {
//   return n <= 1 ? 1 : n * fact(n - 1);
// };

/**************************************************
 * 6. IMMEDIATELY INVOKED FUNCTION EXPRESSION (IIFE)
 **************************************************/
// (function () {
//   console.log("IIFE function");
// })();

/**************************************************
 * 7. GENERATOR FUNCTION
 **************************************************/
// function* generatorExample() {
//   yield 1;
//   yield 2;
// }

/**************************************************
 * 8. ASYNC FUNCTION
 **************************************************/
// async function fetchData() {
//   const data = await fetch(url);
// }

/**************************************************
 * 9. ASYNC ARROW FUNCTION
 **************************************************/
// const fetchData = async () => {
//   const data = await fetch(url);
// };

/**************************************************
 * 10. CALLBACK FUNCTION
 **************************************************/
// function callbackExample(cb) {
//   cb();
// }

/**************************************************
 * 11. HIGHER-ORDER FUNCTION
 * A function that takes a function as a argument and returns
 * a new function as its result
 **************************************************/
// function higherOrder(fn) {
//   return function () {};
// }

/**************************************************
 * 12. CONSTRUCTOR FUNCTION
 **************************************************/
// function Person(name) {
//   this.name = name;
// }

/**************************************************
 * 13. RECURSIVE FUNCTION
 **************************************************/
// function factorial(n) {
//   return n <= 1 ? 1 : n * factorial(n - 1);
// }

/**************************************************
 * 14. METHOD (OBJECT FUNCTION)
 **************************************************/
// const obj = {
//   greet() {
//     console.log("Hello");
//   }
// };

/**************************************************
 * 15. DEFAULT PARAMETER FUNCTION
 **************************************************/
// function greet(name = "Guest") {
//   console.log(name);
// }
