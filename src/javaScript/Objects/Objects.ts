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
