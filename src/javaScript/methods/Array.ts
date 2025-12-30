// The at() method returns the element at a given index. Negative indexes count from the end.
const arr = [10, 20, 30, 40];
console.log(arr.at(1)); // 20
console.log(arr.at(-1)); // 40

// The concat() method merges arrays into a new array without modifying originals.
const a1 = [1, 2],
  a2 = [3, 4];
console.log(a1.concat(a2)); // [1, 2, 3, 4]

// The copyWithin() method copies part of the array to another location in the same array.
const arr1 = [1, 2, 3, 4, 5];
console.log(arr1.copyWithin(0, 3)); // [4, 5, 3, 4, 5]

// The entries() method returns an iterator with [index, value] pairs.
for (const [i, v] of ["a", "b"].entries()) {
  console.log(i, v); // 0 "a", 1 "b"
}

// The every() method tests if all elements pass the provided test (returns boolean).
console.log([2, 4, 6].every((n) => n % 2 === 0)); // true

// The fill() method replaces elements with a static value from start to end.
const arr2 = [1, 2, 3, 4];
console.log(arr2.fill(0, 1, 3)); // [1, 0, 0, 4]

// The filter() method creates a new array with elements that pass the test.
console.log([10, 20, 30].filter((n) => n > 15)); // [20, 30]

// The find() method returns the first element that satisfies the condition.
console.log([5, 12, 8].find((n) => n > 10)); // 12

// The findIndex() method returns the index of the first element satisfying the test.
console.log([5, 12, 8].findIndex((n) => n > 10)); // 1

// The findLast() method returns the last element that satisfies the condition.
// console.log([5, 12, 8].findLast((n) => n > 10)); // 12

// The findLastIndex() method returns the index of the last element satisfying the test.
// console.log([5, 12, 50].findLastIndex((n) => n > 10)); // 2

// The flat() method flattens nested arrays into a new array up to given depth.
console.log([1, [2, [3]]].flat(2)); // [1, 2, 3]

// The flatMap() method maps each element and flattens the result into a new array.
console.log([1, 2, 3].flatMap((n) => [n, n * 2])); // [1, 2, 2, 4, 3, 6]

// The forEach() method executes a function once per array element.
[1, 2, 3].forEach((n) => console.log(n * 2)); // 2, 4, 6

// The includes() method checks if an array contains a value.
console.log([1, 2, 3].includes(2)); // true

// The indexOf() method returns the first index of a value, or -1 if not found.
console.log(["a", "b", "a"].indexOf("a")); // 0

// The lastIndexOf() method returns the last index of a value, or -1 if not found.
console.log(["a", "b", "a"].lastIndexOf("a")); // 2

// The join() method joins all elements into a string with a separator.
console.log(["a", "b", "c"].join("-")); // "a-b-c"

// The keys() method returns an iterator of indexes (keys).
console.log([...["a", "b"].keys()]); // [0, 1]

// The map() method creates a new array with results of applying a function.
console.log([1, 2, 3].map((n) => n * 2)); // [2, 4, 6]

// The pop() method removes the last element and returns it.
const arr3 = [1, 2, 3];
console.log(arr3.pop()); // 3
console.log(arr3); // [1, 2]

// The push() method adds elements to the end and returns the new length.
const arr4 = [1];
console.log(arr4.push(2, 3)); // 3
console.log(arr4); // [1, 2, 3]

// The reduce() method reduces array to a single value by accumulator.
console.log([1, 2, 3].reduce((acc, val) => acc + val, 0)); // 6

// The reduceRight() method works like reduce but from right-to-left.
console.log(["a", "b", "c"].reduceRight((acc, val) => acc + val)); // "cba"

// The reverse() method reverses array in place.
const arr5 = [1, 2, 3];
arr5.reverse();
console.log(arr5); // [3, 2, 1]

// The shift() method removes the first element and returns it.
const arr6 = [1, 2, 3];
console.log(arr6.shift()); // 1
console.log(arr6); // [2, 3]

// The unshift() method adds elements at the beginning and returns new length.
console.log(arr6.unshift(0)); // 3
console.log(arr6); // [0, 2, 3]

// The slice() method returns a shallow copy of part of an array.<- don't changes original array
console.log([1, 2, 3, 4].slice(1, 3)); // [2, 3]

// The splice() method changes contents by removing/replacing/adding. <- changes original array
const arr7 = ["a", "b", "c", "d"];
arr7.splice(1, 2, "x"); // splice(start, how many items to remove, with what to change?)
console.log(arr7); // ["a", "x", "d"]

// The some() method tests if any element passes the provided test.
console.log([1, 2, 3].some((n) => n > 2)); // true

// The sort() method sorts array in place (default: as strings).
const arr8 = [40, 1, 5];
arr8.sort((a, b) => a - b);
console.log(arr8); // [1, 5, 40]

// The toLocaleString() method returns localized string of array contents.
console.log([1000, new Date("2020-01-01")].toLocaleString("en-US"));
// "1,000, 1/1/2020, 12:00:00 AM"

// The toString() method returns a string of array elements (like join with comma).
console.log([1, 2, 3].toString()); // "1,2,3"

// The values() method returns an iterator of values.
for (const v of ["a", "b"].values()) {
  console.log(v); // "a", "b"
}

// The Array.isArray() (static method) checks if a value is an array.
console.log(Array.isArray([1, 2])); // true
console.log(Array.isArray("hi")); // false

// The Array.from() (static method) creates an array from iterable or array-like.
console.log(Array.from("123")); // ["1", "2", "3"]

// The Array.of() (static method) creates an array from arguments.
console.log(Array.of(1, 2, 3)); // [1, 2, 3]

//

// Multidimensional Arrays in JavaScript
// Definition

// A multidimensional array is an array that contains other arrays as its elements.

const arr22 = [
  [1, 2, 3],
  [4, 5, 6],
];

console.log(arr22[0][1]); // output: 2
