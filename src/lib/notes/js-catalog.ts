import type { JsCatalogEntry } from "./types";

export const JS_CONCEPTS: JsCatalogEntry[] = [
  {
    slug: "data-types",
    title: "Data Types",
    description: "Primitives, references, typeof, and copy behavior.",
    files: ["javascript/Concepts/1_dataTypes.js"],
  },
  {
    slug: "variables",
    title: "Variables",
    description: "var, let, const, and temporal dead zone basics.",
    files: ["javascript/Concepts/2_variables.js"],
  },
  {
    slug: "math",
    title: "Math",
    description: "Number helpers and Math object patterns.",
    files: ["javascript/Concepts/3_math.js"],
  },
  {
    slug: "loops",
    title: "Loops",
    description: "for, while, for...of, and iteration patterns.",
    files: ["javascript/Concepts/4_loops.js"],
  },
  {
    slug: "hoisting",
    title: "Hoisting",
    description: "How declarations are lifted before execution.",
    files: ["javascript/Concepts/5_Hoisting.js"],
  },
  {
    slug: "code-execution",
    title: "Code Execution",
    description: "Call stack, execution context, and how JS runs.",
    files: ["javascript/Concepts/6_codeExecution.js"],
  },
  {
    slug: "bom",
    title: "BOM",
    description: "Window, location, navigator, and browser APIs.",
    files: ["javascript/Concepts/7_BOM.js"],
  },
  {
    slug: "dom",
    title: "DOM",
    description: "Tree model, selection APIs, Virtual DOM, reflow vs repaint.",
    files: ["javascript/Concepts/Dom.js", "javascript/Concepts/8_DOM.js"],
    sectionTitles: ["DOM APIs", "DOM tree & rendering"],
  },
  {
    slug: "events",
    title: "Events",
    description: "Bubbling, capturing, delegation, and common handlers.",
    files: ["javascript/Concepts/9_events.js"],
  },
  {
    slug: "dates",
    title: "Dates",
    description: "Date construction, formatting, and time math.",
    files: ["javascript/Concepts/10_Dates.js"],
  },
  {
    slug: "functions",
    title: "Functions",
    description: "Declarations, expressions, arrows, and parameters.",
    files: ["javascript/Concepts/Functions.js"],
  },
  {
    slug: "closures",
    title: "Closures",
    description: "Lexical environment and functions that remember scope.",
    files: ["javascript/Concepts/Closure.js"],
  },
  {
    slug: "call-apply-bind",
    title: "Call, Apply & Bind",
    description: "Controlling this without calling the function immediately.",
    files: ["javascript/Concepts/Call_apply_bind.js"],
  },
  {
    slug: "currying",
    title: "Currying",
    description: "Partial application and one-argument-at-a-time functions.",
    files: ["javascript/Concepts/Currying.js"],
  },
  {
    slug: "promises",
    title: "Promises",
    description: "Thenables, async/await, and error handling.",
    files: ["javascript/Concepts/Promises.js"],
  },
  {
    slug: "errors",
    title: "Errors",
    description: "ReferenceError, TypeError, SyntaxError, RangeError, InternalError.",
    files: ["javascript/Concepts/Errors.js"],
  },
  {
    slug: "es6",
    title: "ES6",
    description: "Modern syntax: destructuring, spread, modules, and more.",
    files: ["javascript/Concepts/Es6.js"],
  },
  {
    slug: "regex",
    title: "Regular Expressions",
    description: "Patterns, flags, and common string matching.",
    files: ["javascript/Concepts/Regex.js"],
  },
  {
    slug: "typescript-types",
    title: "TypeScript Types",
    description: "Interfaces, unions, generics, and API response types.",
    files: ["typescript/index.ts"],
  },
];

export const JS_METHODS: JsCatalogEntry[] = [
  {
    slug: "array",
    title: "Array Methods",
    description: "map, filter, reduce, splice vs slice, and interview comparisons.",
    files: ["javascript/methods/Array.ts"],
  },
  {
    slug: "object",
    title: "Object Methods",
    description: "keys, values, entries, assign, freeze, seal, and grouping.",
    files: ["javascript/methods/Object.ts"],
  },
  {
    slug: "string",
    title: "String Methods",
    description: "slice, split, replace, pad, match, and Unicode helpers.",
    files: ["javascript/methods/String.ts"],
  },
];

export function getConcept(slug: string): JsCatalogEntry | undefined {
  return JS_CONCEPTS.find((entry) => entry.slug === slug);
}

export function getMethod(slug: string): JsCatalogEntry | undefined {
  return JS_METHODS.find((entry) => entry.slug === slug);
}
