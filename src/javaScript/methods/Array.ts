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

// The slice() method returns a shallow copy of part of an array.
console.log([1, 2, 3, 4].slice(1, 3)); // [2, 3]

// The splice() method changes contents by removing/replacing/adding.
const arr7 = ["a", "b", "c", "d"];
arr7.splice(1, 2, "x");
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

// OLD ***********************************************************************************************

// Array is a collection of items of the same variable type that are stored at contiguous memory locations.
const arr = [0, 1, 2, 3, 4, 5, 6, 7, 89, 9, 12, 2, 43, 55, 67, 89];

//  The at() method of Array instances takes an integer value and returns the item at that index,
// allowing for positive and negative integers. Negative integers count back from the last item in the array.
console.log(arr.at(8));
console.log(arr.at(-2));

// The concat() method of Array instances is used to merge two or more arrays.
// This method does not change the existing arrays, but instead returns a new array.
const array1 = ["a", "b", "c"];
const array2 = ["d", "e", "f"];
const array3 = array1.concat(array2);

console.log(array3); // Expected output: Array ["a", "b", "c", "d", "e", "f"]

// The every() method of Array instances tests whether all elements
// in the array pass the test implemented by the provided function.
// It returns a Boolean value.

const isBelowThreshold = (currentValue: number) => currentValue < 40;

const array11 = [1, 30, 39, 29, 10, 13];

console.log(array11.every(isBelowThreshold)); // Expected output: true

// The filter() method of Array instances creates a shallow copy of a portion of a given array,
// filtered down to just the elements from the given array that pass the test implemented by the provided function.

const words = ["spray", "elite", "exuberant", "destruction", "present"];

const result = words.filter((word) => word.length > 6);

console.log(result); // Expected output: Array ["exuberant", "destruction", "present"]

// The find() method of Array instances returns the first element in the provided array that satisfies
// the provided testing function. If no values satisfy the testing function, undefined is returned.

const array10 = [5, 12, 8, 130, 44];

const found = array10.find((element) => element > 10);

console.log(found); // Expected output: 12

// The findIndex() method of Array instances returns the index of the first element in an array
// that satisfies the provided testing function. If no elements satisfy the testing function, -1 is returned.

const array12 = [5, 12, 8, 130, 44];

console.log(array12.findIndex((num) => num === 130)); // Expected output: 3

// The flat() method of Array instances creates a new array with
// all sub-array elements concatenated into it recursively up to the specified depth.

const arr2 = [0, 1, [2, [3, [4, 5]]]];

console.log(arr2.flat()); // expected output: Array [0, 1, 2, Array [3, Array [4, 5]]]
console.log(arr2.flat(2)); // expected output: Array [0, 1, 2, 3, Array [4, 5]]
console.log(arr2.flat(Infinity)); // expected output: Array [0, 1, 2, 3, 4, 5]

// The forEach() method of Array instances executes a provided function once for each array element.

const array13 = [1, 2, 3, 4, 5];
array13.forEach((element) => console.log(element * 2));

// The includes() method of Array instances determines whether an array includes a
// certain value among its entries, returning true or false as appropriate.

const array0 = [1, 2, 3];
console.log(array0.includes(2)); // Expected output: true

// The indexOf() method of Array instances returns the first index at which a given
// element can be found in the array, or -1 if it is not present.

const beasts = ["ant", "bison", "camel", "duck", "bison"];

console.log(beasts.indexOf("bison")); // Expected output: 1
// Start from index 2
console.log(beasts.indexOf("bison", 2)); // Expected output: 4
console.log(beasts.indexOf("giraffe")); // Expected output: -1

// The join() method of Array instances creates and returns a new string by concatenating all
// of the elements in this array, separated by commas or a specified separator string.
// If the array has only one item, then that item will be returned without using the separator.

const elements = ["Fire", "Air", "Water"];

console.log(elements.join()); // Expected output: "Fire,Air,Water"
console.log(elements.join("")); // Expected output: "FireAirWater"
console.log(elements.join("-")); // Expected output: "Fire-Air-Water"

// The lastIndexOf() method of Array instances returns the last index at which a given element
// can be found in the array, or -1 if it is not present.
// The array is searched backwards, starting at fromIndex.

const animals = ["Dodo", "Tiger", "Penguin", "Dodo"];

console.log(animals.lastIndexOf("Dodo")); // Expected output: 3
console.log(animals.lastIndexOf("Tiger")); // Expected output: 1

// The map() method of Array instances creates a new array populated with the results of
//  calling a provided function on every element in the calling array.

const array14 = [1, 4, 9, 16];
const map1 = array14.map((x) => x * 2);
console.log(map1); // Expected output: Array [2, 8, 18, 32]

// The pop() method of Array instances removes the last element from an array and returns that element.
// This method changes the length of the array.

const plants = ["broccoli", "cauliflower", "cabbage", "kale", "tomato"];

console.log(plants.pop()); // Expected output: "tomato"
console.log(plants); // Expected output: Array ["broccoli", "cauliflower", "cabbage", "kale"]
plants.pop();
console.log(plants); // Expected output: Array ["broccoli", "cauliflower", "cabbage"]

// The push() method of Array instances adds the specified elements to the end of an array and
// returns the new length of the array.

console.log(plants.push("New Plant"));
console.log(plants.push("New Plant 1", "New Plant 2", "New Plant 3"));

// The reduce() method of Array instances executes a user-supplied "reducer" callback function on
// each element of the array, in order, passing in the return value from the calculation on the preceding element.
// The final result of running the reducer across all elements of the array is a single value

// accumulator: The accumulated result returned in the last iteration (or the initialValue for the first iteration).
// currentValue: The current element being processed.
const numbers = [1, 2, 3, 4];

const sum = numbers.reduce((accumulator, currentValue) => {
  return accumulator + currentValue;
}, 0);

console.log(sum); // 10

// The reverse() method of Array instances reverses an array in place and returns the reference to the same array

const array16 = ["one", "two", "three"];
console.log("array1:", array16); // Expected output: "array1:" Array ["one", "two", "three"]

const reversed = array16.reverse();
console.log("reversed:", reversed); // Expected output: "reversed:" Array ["three", "two", "one"]

// The shift() method of Array instances removes the first element from an array and returns that removed element.
// This method changes the length of the array.
const array17 = [1, 2, 3];

const firstElement = array17.shift();

console.log(array17); // Expected output: Array [2, 3]
console.log(firstElement); // Expected output: 1

// The unshift() method of Array instances adds the specified elements to the beginning of an array
//  and returns the new length of the array.

array17.unshift(0, 3, 5); // [0,3,5,1,2,3] -> 6

// The slice() method of Array instances returns a shallow copy of a portion of an array into a new
// array object selected from start to end (end not included) where start and end represent the index
// of items in that array. The original array will not be modified.

const animals1 = ["ant", "bison", "camel", "duck", "elephant"];

console.log(animals1.slice(2)); // Expected output: Array ["camel", "duck", "elephant"]
console.log(animals1.slice(2, 4)); // Expected output: Array ["camel", "duck"]
console.log(animals1.slice(1, 5)); // Expected output: Array ["bison", "camel", "duck", "elephant"]
console.log(animals1.slice(-2)); // Expected output: Array ["duck", "elephant"]
console.log(animals1.slice(2, -1)); // Expected output: Array ["camel", "duck"]

// The splice() method of Array instances changes the contents of an array by removing or
// replacing existing elements and/or adding new elements in place.

// animals1.splice(start, deleteCount, item1, item2);
// start: Index to begin changing the array.
// deleteCount: How many items to remove from that index.
// item1, item2, ...: (Optional) Items to add at that index.

const fruits = ["apple", "banana", "cherry", "date"];
fruits.splice(1, 2); // Removes 2 items starting from index 1
console.log(fruits); // ["apple", "date"]

// some -> based on searched value in array it will give true or false in return

fruits.some((vals) => vals.length > 2);
