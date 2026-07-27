// ===============================
// JavaScript Loops – All Types
// ===============================

// A loop is used to run the same code repeatedly until a condition is met

// --------------------------------
// 1. for loop
// Used when number of iterations is known
// --------------------------------
for (let i = 1; i <= 5; i++) {
  console.log(i); // output: 1 2 3 4 5
}

// --------------------------------
// 2. while loop
// Checks condition first, then runs code
// Used when iterations depend on condition
// --------------------------------
let w = 1;
while (w <= 5) {
  console.log(w); // output: 1 2 3 4 5
  w++;
}

// --------------------------------
// 3. do...while loop
// Runs code at least once, then checks condition
// --------------------------------
let d = 1;
do {
  console.log(d); // output: 1 2 3 4 5
  d++;
} while (d <= 5);

// --------------------------------
// 4. for...in loop
// Used to loop over object keys (indexes or properties)
// --------------------------------
const obj = { name: "Alice", age: 25 };

for (let key in obj) {
  console.log(key, obj[key]);
  // output: name Alice
  //         age 25
}

// --------------------------------
// 5. for...of loop
// Used to loop over iterable values (arrays, strings)
// --------------------------------
const arr = [10, 20, 30];

for (let value of arr) {
  console.log(value); // output: 10 20 30
}

// --------------------------------
// 6. forEach loop (Array method)
// Used to loop through array elements
// Cannot break or continue
// --------------------------------
arr.forEach((item) => {
  console.log(item); // output: 10 20 30
});

// --------------------------------
// 7. break statement
// Stops the loop completely
// --------------------------------
for (let i = 1; i <= 5; i++) {
  if (i === 3) break;
  console.log(i); // output: 1 2
}

// --------------------------------
// 8. continue statement
// Skips current iteration
// --------------------------------
for (let i = 1; i <= 5; i++) {
  if (i === 3) continue;
  console.log(i); // output: 1 2 4 5
}

// ===============================
// Summary (In Comments)
// ===============================

// for       -> known number of iterations
// while     -> condition-based loop
// do...while-> runs at least once
// for...in  -> object keys
// for...of  -> iterable values
// forEach   -> array iteration method
// break     -> exit loop
// continue  -> skip iteration
