const str = "Hello";

// The at() method returns the character at the given index, supports negative indices.
console.log(str.length); // 5
console.log(str.at(1)); // "e"
console.log(str.at(-1)); // "o"

// The charAt() method returns the character at a specific index.
console.log(str.charAt(0)); // "H"

// The charCodeAt() method returns the Unicode value of the character at the given index.
console.log(str.charCodeAt(0)); // 72

// The codePointAt() method returns the Unicode code point value (handles emojis, symbols too).
console.log("😊".codePointAt(0)); // 128522

// The concat() method joins two or more strings.
console.log("Hello".concat(" ", "World")); // "Hello World"

// The includes() method checks if a string contains another substring.
console.log(str.includes("Hell")); // true
console.log(str.includes("hey")); // false

// The endsWith() method checks if a string ends with the specified characters.
console.log(str.endsWith("lo")); // true
console.log(str.endsWith("He")); // false

// The startsWith() method checks if a string starts with the specified characters.
console.log(str.startsWith("He")); // true

// The indexOf() method returns the first index of a substring, or -1 if not found.
console.log(str.indexOf("l")); // 2

// The lastIndexOf() method returns the last index of a substring, or -1 if not found.
console.log(str.lastIndexOf("l")); // 3

// The match() method searches using regex and returns an array of matches or null.
console.log("cat bat mat".match(/at/g)); // ["at", "at", "at"]

// The matchAll() method returns an iterator of all regex matches.
for (const m of "test1test2".matchAll(/test\d/g)) {
  console.log(m[0]); // "test1", "test2"
}

// The padStart() method pads the string with another string at the start until length is reached.
console.log("5".padStart(3, "0")); // "005"

// The padEnd() method pads the string with another string at the end until length is reached.
console.log("5".padEnd(3, "0")); // "500"

// The repeat() method returns a new string repeating the given string.
console.log("ha".repeat(3)); // "hahaha"

// The replace() method replaces the first match with another string.
console.log("Hello World".replace("World", "JS")); // "Hello JS"

// The replaceAll() method replaces all matches of a substring or regex.
console.log("a-b-c".replaceAll("-", "|")); // "a|b|c"

// The search() method searches using regex and returns the index of the first match.
console.log("hello".search(/l/)); // 2

// The slice() method extracts part of a string and returns it.
console.log("Hello".slice(1, 4)); // "ell"

// The substring() method extracts characters between two indices (cannot use negative values).
console.log("Hello".substring(1, 4)); // "ell"

// The substr() method extracts part of a string based on start index and length (deprecated, but seen in legacy code).
console.log("Hello".substr(1, 3)); // "ell"

// The split() method splits a string into an array based on a separator.
console.log("a,b,c".split(",")); // ["a", "b", "c"]

// The toLowerCase() method converts the string to lowercase.
console.log("HELLO".toLowerCase()); // "hello"

// The toUpperCase() method converts the string to uppercase.
console.log("hello".toUpperCase()); // "HELLO"

// The trim() method removes whitespace from both ends.
console.log("   hi   ".trim()); // "hi"

// The trimStart() method removes whitespace from the beginning.
console.log("   hi".trimStart()); // "hi"

// The trimEnd() method removes whitespace from the end.
console.log("hi   ".trimEnd()); // "hi"

// The valueOf() method returns the primitive value of a String object.
console.log(new String("Hello").valueOf()); // "Hello"

// The toString() method returns the string representation of the object.
console.log((123).toString()); // "123"

// The localeCompare() method compares two strings based on locale.
// Returns -1 (smaller), 0 (equal), 1 (greater).
console.log("a".localeCompare("b")); // -1

// The normalize() method returns the Unicode Normalization Form of a string.
console.log("\u00F1".normalize("NFD")); // "ñ"

// The fromCharCode() (static on String) creates a string from UTF-16 code units.
console.log(String.fromCharCode(72, 101, 108, 108, 111)); // "Hello"

// The fromCodePoint() (static on String) creates a string from Unicode code points.
console.log(String.fromCodePoint(128522)); // "😊"

// The raw() method (static on String) is used in template literals to get raw strings.
console.log(String.raw`Hello\nWorld`); // "Hello\nWorld"
