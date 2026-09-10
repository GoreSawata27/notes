// 1. How this is decided
// this is set by the call site (how the function is invoked), not where
// it was written — except arrows, which take this from the enclosing scope.
// Five rules: default, implicit, explicit, new, lexical (arrow).

function show() {
  return this;
}
show(); // undefined in modules/strict; globalThis in sloppy scripts
const obj = { show, tag: "obj" };
obj.show(); // implicit → this === obj

// 2. this rules in detail
// Default: bare call → undefined (strict) or global object (sloppy).
// Implicit: obj.fn() → this === obj. Only the last property before () counts.
// Explicit: call / apply / bind set this yourself.
// new: this is the newly created instance.
// Arrow: this is lexical — call/apply/bind cannot change it.

const nested = { inner: { show } };
nested.inner.show(); // this === nested.inner, not nested
const detached = obj.show;
detached(); // default binding — this is NOT obj

// 3. call — invoke now, args listed
// fn.call(thisArg, a, b) runs fn immediately with this set to thisArg.
// Primitive thisArg is boxed (except in strict mode, where it stays as-is).
// Use when you already have individual arguments.

function deliver(order, time) {
  return `${this.restaurant} delivers ${order} at ${time} from ${this.location}`;
}
const mcd = { restaurant: "McDonald's", location: "MG Road" };
deliver.call(mcd, "Burger", "6:00 PM");

// 4. apply — invoke now, args as an array
// fn.apply(thisArg, [a, b]) is call with an array (or array-like).
// Classic trick: Math.max.apply(null, nums) before spread existed.
// Today: fn.call(thisArg, ...arr) or Math.max(...nums).

const dominos = { restaurant: "Domino's", location: "FC Road" };
deliver.apply(dominos, ["Pizza", "7:00 PM"]);
Math.max.apply(null, [3, 9, 1]); // 9
Math.max(...[3, 9, 1]); // 9 — modern equivalent

// 5. bind — new function, this locked
// fn.bind(thisArg, ...preset) returns a bound function. Original is unchanged.
// Later call/apply on the bound fn cannot replace this (except as a constructor).
// Extra bind args are prepended (partial application).

const subway = { restaurant: "Subway", location: "JM Road" };
const subwayDelivery = deliver.bind(subway);
subwayDelivery("Sub", "5:30 PM");
const burgerAt6 = deliver.bind(mcd, "Burger");
burgerAt6("6:00 PM");

// 6. call vs apply vs bind
// call  → run now, list arguments
// apply → run now, array of arguments
// bind  → do not run; return a function with this (and optional args) fixed
// All three accept a thisArg. None of them mutate the original function.

const ctx = { n: 2 };
function scale(x, y) {
  return (x + y) * this.n;
}
scale.call(ctx, 3, 4); // 14
scale.apply(ctx, [3, 4]); // 14
const bound = scale.bind(ctx, 3);
bound(4); // 14

// 7. Lost this on method extract
// Passing obj.method as a callback strips the implicit receiver.
// setTimeout, addEventListener, map, and React props all do this.

const counter = {
  n: 0,
  inc() {
    this.n += 1;
    return this.n;
  },
};
const loose = counter.inc;
// loose(); // TypeError — this is undefined, cannot read n
setTimeout(counter.inc, 0); // this is not counter

// 8. Bound methods as callbacks
// bind creates a stable function you can pass and later remove.
// Same bound reference is required for removeEventListener.

const incBound = counter.inc.bind(counter);
setTimeout(incBound, 0);
button.addEventListener("click", incBound);
button.removeEventListener("click", incBound); // works — same reference

const onClick = () => counter.inc(); // also fine; this inside inc is counter

// 9. bind vs arrow
// bind: creates a new exotic function; this is fixed; extra args can be preset;
//       has .prototype and can be used with new (this then ignores the bound value).
// Arrow: no own this / arguments / prototype; cannot be new'd; cheaper if you
//        only need lexical this. Prefer arrows for inline callbacks you own;
//        prefer bind when adapting an existing method or fixing arguments.

const widget = {
  id: 7,
  bound: function () {
    return this.id;
  }.bind({ id: 99 }),
  arrow: () => this,
};
widget.bound(); // 99 — bind wins over implicit obj.bound()
// widget.arrow() uses the this of the enclosing scope, not widget

// 10. Polyfill-level bind
// A faithful bind: (1) remember the original fn and preset args,
// (2) apply thisArg unless the bound fn was called with new,
// (3) copy .prototype so instances still instanceof the original,
// (4) ignore later .bind / .call thisArg (bound this is sticky).

Function.prototype.myBind = function (thisArg, ...preset) {
  const fn = this;
  function bound(...later) {
    const ctx = new.target ? this : thisArg;
    return fn.apply(ctx, preset.concat(later));
  }
  if (fn.prototype) bound.prototype = Object.create(fn.prototype);
  return bound;
};
function Person(name) {
  this.name = name;
}
const BoundPerson = Person.myBind({ ignored: true });
new BoundPerson("Ada").name; // "Ada" — new.target path
BoundPerson("Lin"); // thisArg path (sloppy: sets global name)

// 11. Strict vs sloppy thisArg
// In sloppy mode, null/undefined thisArg becomes the global object.
// In strict mode (and ES modules), it stays null/undefined.
// Objects are used as-is; primitives are boxed in sloppy functions.

function who() {
  return this;
}
who.call(null); // globalThis in sloppy; null in strict
who.call(42); // Number(42) in sloppy; 42 in strict
