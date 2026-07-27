// Key Regex Building Blocks

// 1. Character Classes

// \d → digit (0–9)
// \w → word char (a-zA-Z0-9_)
// \s → whitespace
// . → any character except newline
// [...] → match any listed chars

// ------> [aeiou] → matches any vowel

console.log(/[aeiou]/.test("cat")); // true

// 2. Quantifiers

// + → 1 or more
// * → 0 or more
// ? → 0 or 1 (optional)
// {n} → exactly n times
// {n,} → at least n times
// {n,m} → between n and m times
console.log(/\d{2}/.test("ab12cd")); // true (2 digits)

// 3. Anchors

// ^ → start of string
// $ → end of string

console.log(/^hello/.test("hello world")); // true
console.log(/world$/.test("hello world")); // true

// 4. Groups & Alternation

// (abc) → group
// | → OR

console.log(/cat|dog/.test("dog")); // true

// 5. Escaping

// Match special chars (. ^ $ * + ? { } [ ] | ( )), escape with \.

console.log(/\./.test("file.txt")); // true

// 1. Email
// /^[\w.-]+@[\w.-]+\.\w{2,}$/

// 2. Phone Number (basic, 10 digits)
// /^\d{10}$/

// 3. Date (YYYY-MM-DD)
// /^\d{4}-\d{2}-\d{2}$/

const str = `lorem ipsum20-02-1000 dolor 30/07/1999 sit amet 30/07/19999lorem ipsum dolor sit amet lorem ipsum dolor sit
     ametvlorem20-02-1999 ipsum dolor sit ametlorem ipsum dolor20/1999 sit ametlorem 
     ipsum dolor sit amet lorem ipsum dolor sit amet`;

console.log(/\d{2,4}[-/]\d{2}[-/]\d{2,4}/.test(str));

console.log(str.replace(/\d{2,4}[-/]\d{2}[-/]\d{2,4}/g, "Date"));

// g to replace all dates , if not g then it will replace 1st one only
