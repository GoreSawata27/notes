/************************************************************
 * JAVASCRIPT RUNTIME DEMO
 *
 * Concepts covered:
 * - Call Stack
 * - Synchronous code
 * - Promises (Microtask Queue)
 * - setTimeout (Macrotask / Callback Queue)
 * - Event Loop
 ************************************************************/

console.log("1. Script start");

/************************************************************
 * SYNC CODE (CALL STACK)
 * Runs immediately, line by line
 ************************************************************/
function syncFunction() {
  console.log("2. Inside sync function");
}

syncFunction();

/************************************************************
 * PROMISE (MICROTASK QUEUE)
 * Microtasks run AFTER sync code
 * but BEFORE macrotasks
 ************************************************************/
Promise.resolve().then(() => {
  console.log("4. Promise resolved (microtask)");
});

/************************************************************
 * SETTIMEOUT (MACROTASK QUEUE)
 * Runs AFTER microtasks
 ************************************************************/
setTimeout(() => {
  console.log("6. setTimeout callback (macrotask)");
}, 0);

/************************************************************
 * COMPLEX NESTED EXAMPLE
 ************************************************************/
setTimeout(() => {
  console.log("7. setTimeout start");

  Promise.resolve().then(() => {
    console.log("8. Promise inside setTimeout");
  });

  console.log("9. setTimeout end");
}, 0);

/************************************************************
 * MORE PROMISES
 ************************************************************/
Promise.resolve().then(() => {
  console.log("5. Second promise");
});

/************************************************************
 * FINAL SYNC CODE
 ************************************************************/
console.log("3. Script end");

/************************************************************
 * EXPECTED OUTPUT ORDER:
 *
 * 1. Script start
 * 2. Inside sync function
 * 3. Script end
 * 4. promise
 * 5. Promise resolved (microtask)
 * 6. setTimeout callback (macrotask)
 * 7. setTimeout start
 * 9. setTimeout end
 * 8. Promise inside setTimeout
 *
 ************************************************************/

/************************************************************
 * RUNTIME EXPLANATION (MENTAL MODEL)
 *
 * 1. Execute all SYNC code (Call Stack)
 * 2. Execute all MICROTASKS (Promises)
 * 3. Execute ONE MACROTASK (setTimeout)
 * 4. After each macrotask, clear microtasks again
 * 5. Repeat (Event Loop)
 ************************************************************/
