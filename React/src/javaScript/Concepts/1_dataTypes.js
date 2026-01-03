// JavaScript is dynamically typed and weakly typed, meaning:
// Variables don’t have fixed types.
// Types are determined at runtime.
// Implicit type coercion can occur.
// JavaScript data types are divided into Primitive and Non-Primitive (Reference) types.

// 1. Primitive Data Types
// Primitive types are immutable and stored by value.
// ex. Number , BigInt  , String , undefined , null , boolean , symbol

// 2. Non-Primitive (Reference) Types
// Stored by reference in memory.
// ex. object , array , functions

// Primitive vs Reference

// 1. Copy behavior
let a = 10;
let b = a;
b = 20; // a unchanged

let obj1 = { x: 1 };
let obj2 = obj1;
obj2.x = 2; // obj1.x also changes

// typeof Operator
typeof 42; // "number"
typeof "hi"; // "string"
typeof true; // "boolean"
typeof undefined; // "undefined"
typeof null; // "object"
typeof {}; // "object"
typeof []; // "object"
typeof function () {}; // "function"

// Memory Model Summary

// | Type      | Stored As | Mutable |
// | --------- | --------- | ------- |
// | Primitive | Value     |  No    |
// | Object    | Reference | Yes   |

// Mutable vs Immutable

// Primitives are immutable because they represent single, fixed values

// Non-primitives (objects) are mutable because they represent collections of
// values stored by reference

// ex.

"hello".toUpperCase();

// Looks like mutation — but it’s not.
// What actually happens:

// JS creates a temporary object:
new String("hello");

Calls.toUpperCase();

// Returns a new string

// Discards the object

// Original value unchanged.
