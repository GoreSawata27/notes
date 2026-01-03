// The Object.assign() method copies properties from source objects to a target object.
const target = { a: 1 };
const source = { b: 2 };
console.log(Object.assign(target, source)); // { a: 1, b: 2 }

// The Object.create() method creates a new object with the given prototype.
const proto = { greet: () => "hi" };
const obj = Object.create(proto);
console.log(obj.greet()); // "hi"

// The Object.defineProperty() method adds/updates a property with descriptors.
const obj1 = {};
Object.defineProperty(obj1, "x", { value: 42, writable: false });
console.log(obj1.x); // 42

// The Object.defineProperties() method defines multiple properties at once.
const obj2 = {};
Object.defineProperties(obj2, {
  a: { value: 1 },
  b: { value: 2, writable: true },
});
console.log(obj2); // { a: 1, b: 2 }

// The Object.entries() method returns [key, value] pairs as an array.
console.log(Object.entries({ x: 1, y: 2 })); // [["x", 1], ["y", 2]]

// The Object.fromEntries() method creates an object from [key, value] pairs.
console.log(
  Object.fromEntries([
    ["x", 1],
    ["y", 2],
  ])
); // { x: 1, y: 2 }

// The Object.freeze() method freezes an object (no add/remove/change).
const frozen = Object.freeze({ a: 1 });
frozen.a = 2;
console.log(frozen.a); // 1

// The Object.isFrozen() method checks if object is frozen.
console.log(Object.isFrozen(frozen)); // true

// The Object.seal() method seals an object (no add/remove, but can change existing).
const sealed = Object.seal({ a: 1 });
sealed.a = 2;
console.log(sealed); // { a: 2 }

// The Object.isSealed() method checks if object is sealed.
console.log(Object.isSealed(sealed)); // true

// The Object.preventExtensions() method prevents adding new properties.
const o1 = { a: 1 };
Object.preventExtensions(o1);
o1.b = 2;
console.log(o1); // { a: 1 }

// The Object.isExtensible() method checks if new props can be added.
console.log(Object.isExtensible(o1)); // false

// The Object.getOwnPropertyDescriptor() returns descriptor of a property.
const obj3 = { x: 10 };
console.log(Object.getOwnPropertyDescriptor(obj3, "x"));
// { value: 10, writable: true, enumerable: true, configurable: true }

// The Object.getOwnPropertyDescriptors() returns descriptors of all props.
console.log(Object.getOwnPropertyDescriptors(obj3));

// The Object.getOwnPropertyNames() returns all string keys (including non-enumerable).
console.log(Object.getOwnPropertyNames({ a: 1, b: 2 })); // ["a", "b"]

// The Object.getOwnPropertySymbols() returns all symbol keys.
const sym = Symbol("id");
const obj4 = { [sym]: 123 };
console.log(Object.getOwnPropertySymbols(obj4)); // [ Symbol(id) ]

// The Object.getPrototypeOf() returns prototype of an object.
console.log(Object.getPrototypeOf([]) === Array.prototype); // true

// The Object.setPrototypeOf() sets the prototype of an object.
const animal = { eats: true };
const rabbit = {};
Object.setPrototypeOf(rabbit, animal);
console.log(rabbit.eats); // true

// The Object.hasOwn() method checks if object has a property as its own (not from prototype).
const obj5 = { a: 1 };
console.log(Object.hasOwn(obj5, "a")); // true
console.log(Object.hasOwn(obj5, "b")); // false

// The Object.keys() method returns an array of object’s own keys.
console.log(Object.keys({ a: 1, b: 2 })); // ["a", "b"]

// The Object.values() method returns an array of object’s own values.
console.log(Object.values({ a: 1, b: 2 })); // [1, 2]

// The Object.is() method compares two values (like === but handles NaN correctly).
console.log(Object.is(NaN, NaN)); // true
console.log(Object.is(0, -0)); // false

// The Object.groupBy() (ES2024) groups array elements into an object based on a function.
const arr = [1, 2, 3, 4, 5];
// console.log(Object.groupBy(arr, (n) => (n % 2 === 0 ? "even" : "odd")));
// { odd: [1, 3, 5], even: [2, 4] }

// ****************new examples******************************************************************

const obj = {
  name: "John",
  age: 30,
  city: "Pune",
};

// 1
// console.log(Object.keys(obj).length )  // 3

// 2
// for (const key in obj) {
//   console.log(key, obj[key]);
// }

//   or

// Object.keys(obj).forEach(key => {
//   console.log(key, obj[key]);
// });

// output
// name John
// age 30
// city Pune

Object.keys(obj); // ['name', 'age', 'city']
Object.values(obj); // ['John', 30, 'Pune']
Object.entries(obj); // [['name', 'John'], ['age', 30], ['city', 'Pune']]

// Check if Key Exists

// 'name' in obj; // ✅ true
// obj.hasOwnProperty('city'); // ✅ true

Object.freeze(obj);
obj.name = "Doe"; //  ignored or error in strict mode

const scores = {
  John: 90,
  Alice: 82,
  Bob: 40,
  Dave: 65,
};

const passed = Object.entries(scores)
  .filter(([name, score]) => score >= 60)
  .reduce((acc, [name, score]) => {
    acc[name] = score;
    return acc;
  }, {});

console.log(passed); // { John: 90, Alice: 82, Dave: 65 }

const Scores = {
  John: 90,
  Alice: 82,
  Bob: 40,
  Dave: 65,
};

const sum = Object.entries(Scores)
  .map(([key, val]) => val)
  .reduce((acc, val) => acc + val, 0);

console.log(sum);
