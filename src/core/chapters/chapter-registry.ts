import type { Chapter } from './chapter.model';
import { TASKS_BY_SLUG } from './chapter-tasks-data';

const MDN = (path: string) => `https://developer.mozilla.org/en-US/docs/${path}`;

const CHAPTERS_RAW: Omit<Chapter, 'tasks'>[] = [
  // ============================================================
  // SECTION 1 — Variables, Scope & Closures
  // ============================================================
  {
    slug: 'var-let-const',
    section: 'scope',
    title: 'var, let, const',
    tagline: 'Block scope, TDZ, and why const is the default',
    summary:
      'var is function-scoped and initialised to undefined at hoist time. let and const are block-scoped, hoisted but uninitialised — the gap between the start of the block and the declaration is the Temporal Dead Zone. const binds the reference; the value it points to is still mutable for objects.',
    keyPoints: [
      'var: function-scoped, hoisted with undefined, reassignable.',
      'let: block-scoped, hoisted into TDZ, reassignable.',
      'const: block-scoped, hoisted into TDZ, binding-immutable.',
      'const objects/arrays are still mutable (.push, property assignment).',
      'The var-in-for-loop closure bug is what motivated let.',
      'Modern style: const by default, let when reassignment is required, never var.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Scope + TDZ',
        code: `function demo() {
  console.log(a); // undefined — var is hoisted with undefined
  // console.log(b); // ReferenceError — TDZ
  var a = 1;
  let b = 2;
  const c = { count: 0 };
  c.count++; // OK — const binding, mutable contents
  // c = {}; // TypeError — assignment to const
}`,
      },
      {
        language: 'javascript',
        label: 'The closure-in-loop fix',
        code: `// var leaks one binding across iterations
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i), 0); // 3, 3, 3
// let creates a fresh binding each iteration
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i), 0); // 0, 1, 2`,
      },
    ],
    playgrounds: [
      {
        label: 'Reach into the TDZ',
        description:
          'Run as-is to see the ReferenceError. Then move the declaration above the console.log and re-run.',
        starter: `function readBeforeDeclared() {
  try {
    console.log(x);
  } catch (err) {
    console.log('threw:', err.message);
  }
  let x = 42;
}
readBeforeDeclared();`,
      },
    ],
    pointers: [
      { label: 'eslint rule: no-var', note: 'enforce the never-var rule everywhere.' },
      { label: '@typescript-eslint/prefer-const', note: 'const-by-default in TS.' },
    ],
    references: [
      { label: 'MDN — let', url: MDN('Web/JavaScript/Reference/Statements/let') },
      { label: 'MDN — const', url: MDN('Web/JavaScript/Reference/Statements/const') },
      { label: 'MDN — Temporal Dead Zone', url: MDN('Web/JavaScript/Reference/Statements/let#temporal_dead_zone_tdz') },
    ],
    redFlags: [
      'Doesn\'t know what TDZ stands for or what it does.',
      'Thinks const makes the value immutable.',
      'Still reaches for var in new code.',
    ],
  },
  {
    slug: 'hoisting',
    section: 'scope',
    title: 'Hoisting',
    tagline: 'Declarations move up; assignments stay put',
    summary:
      'The engine processes declarations before executing the body. Function declarations are fully hoisted — name + body. var is hoisted and initialised to undefined. let, const, and class are hoisted but live in the TDZ until their declaration line. Function expressions and arrows only hoist the binding, not the function.',
    keyPoints: [
      'Function declarations: callable before their source line.',
      'var: exists with undefined from the top of the function.',
      'let / const / class: exist but throw ReferenceError until the declaration line (TDZ).',
      'Function expressions: only the variable hoists; the function itself does not.',
      'Hoisting is a mental model, not a literal source rewrite.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'What is hoisted, what isn\'t',
        code: `sayHi();              // OK — function declarations are fully hoisted
function sayHi() { return 'hi'; }

console.log(typeof a); // 'undefined' — var is hoisted with undefined
var a = 1;

try { console.log(b); } catch (e) { /* ReferenceError — TDZ */ }
let b = 2;

try { greet(); } catch (e) { /* TypeError — greet is undefined */ }
var greet = function () { return 'hello'; };`,
      },
    ],
    playgrounds: [
      {
        label: 'Predict the output',
        description: 'Run, then re-order the lines and see which still work.',
        starter: `console.log(typeof declaredFn);    // 'function'
console.log(typeof expressionFn); // 'undefined'

function declaredFn() {}
var expressionFn = function () {};`,
      },
    ],
    references: [
      { label: 'MDN — Hoisting', url: MDN('Glossary/Hoisting') },
      { label: 'MDN — Function declarations', url: MDN('Web/JavaScript/Reference/Statements/function') },
    ],
    redFlags: [
      'Says "all variables move to the top".',
      'Doesn\'t know let/const are hoisted (the TDZ is the giveaway).',
    ],
  },
  {
    slug: 'lexical-scope',
    section: 'scope',
    title: 'Lexical scope',
    tagline: 'Where you write a function determines what it can see',
    summary:
      'JavaScript uses lexical (static) scope: variable lookup is determined by where a function is declared, not where it is called. The scope chain is fixed at parse time. This is why closures work and why moving a function to a different caller doesn\'t change which outer variables it sees.',
    keyPoints: [
      'Resolution: own scope → enclosing scope → … → global.',
      'Set at parse time, not runtime.',
      'Closures are a consequence of lexical scope.',
      '`this` is dynamic, not lexical (arrow functions inherit `this` lexically — the exception).',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Defined-where, called-where',
        code: `function outer() {
  const name = 'outer';
  function inner() { return name; }
  return inner;
}
const f = outer();
const name = 'global';
f(); // 'outer' — captured by where it was DEFINED`,
      },
    ],
    playgrounds: [
      {
        label: 'Move the function',
        description: 'Try moving the inner function definition outside outer() and re-running.',
        starter: `function outer() {
  const secret = 'inside';
  function inner() { return secret; }
  return inner;
}
const f = outer();
const secret = 'outside';
console.log(f()); // ?`,
      },
    ],
    references: [
      { label: 'MDN — Closures (lexical environment)', url: MDN('Web/JavaScript/Closures') },
    ],
    redFlags: [
      'Confuses lexical scope with `this`.',
      'Thinks scope is resolved at call time.',
    ],
  },
  {
    slug: 'closures',
    section: 'scope',
    title: 'Closures',
    tagline: 'Functions that carry their environment with them',
    summary:
      'A closure is a function plus the variable environment captured at its definition site. As long as the closure is reachable, that environment is kept alive — even after the outer function has returned. Closures give you privacy, state persistence, and the foundation for currying, memoization, and React-style hook state.',
    keyPoints: [
      'A closure references its outer scope by reference, not by value.',
      'Inner functions of a single outer call SHARE the same environment.',
      'Closures retain memory — leaking large captured objects is a real bug class.',
      'The classic var-in-loop bug is a closure ordering problem.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Counter factory',
        code: `function makeCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    get: () => count,
  };
}
const c = makeCounter();
c.increment(); c.increment();
c.get(); // 2`,
      },
    ],
    playgrounds: [
      {
        label: 'Two counters, one environment?',
        description: 'Confirm each counter has its own count, then change the code so two counters share one count.',
        starter: `function makeCounter() {
  let n = 0;
  return () => ++n;
}
const a = makeCounter();
const b = makeCounter();
console.log(a(), a(), b(), b()); // 1 2 1 2`,
      },
    ],
    references: [
      { label: 'MDN — Closures', url: MDN('Web/JavaScript/Closures') },
    ],
    redFlags: [
      'Recites a definition without an example.',
      'Doesn\'t know the var-in-loop bug.',
      'Can\'t connect closures to hooks or module patterns.',
    ],
  },
  {
    slug: 'iife',
    section: 'scope',
    title: 'IIFE (Immediately Invoked Function Expression)',
    tagline: 'Pre-module-era private scope',
    summary:
      'An IIFE wraps code in a function expression and immediately invokes it, creating a private scope. Pre-ES6, it was the standard way to hide variables in a script and expose a module-like API. Modern code uses ES modules and block-scoped declarations; the (async () => {})() form is still occasionally useful for running async code at the top level.',
    keyPoints: [
      '`(function () { ... })();` — define and call in one go.',
      'Used historically for the module pattern and to avoid leaking into the global scope.',
      'ES modules + let/const removed most uses; recognising the pattern remains important.',
      '`(async () => { await ... })();` runs async code in scripts without top-level await.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Classic module pattern',
        code: `const counterModule = (function () {
  let count = 0;
  return {
    inc() { count++; },
    get() { return count; },
  };
})();
counterModule.inc();
counterModule.get(); // 1`,
      },
    ],
    playgrounds: [
      {
        label: 'Rewrite an IIFE as ES-module style',
        description: 'In ES modules the file itself is the private scope. Try restructuring this IIFE as a plain block of code that exposes only what you need.',
        starter: `const M = (function () {
  let store = {};
  return {
    set: (k, v) => { store[k] = v; },
    get: (k) => store[k],
  };
})();
M.set('a', 1);
console.log(M.get('a'));`,
      },
    ],
    references: [
      { label: 'MDN — IIFE', url: MDN('Glossary/IIFE') },
    ],
    redFlags: [
      'Has never seen the pattern.',
      'Still reaches for IIFEs in new code without justification.',
    ],
  },

  // ============================================================
  // SECTION 2 — Types, Equality & Coercion
  // ============================================================
  {
    slug: 'primitives-vs-references',
    section: 'types',
    title: 'Primitives vs references',
    tagline: 'Pass-by-value, pass-by-shared-reference',
    summary:
      'Primitives (string, number, boolean, undefined, null, symbol, bigint) compare and copy by value. Reference types (objects, arrays, functions, dates, Maps, Sets) compare and pass by reference. Mutations to a passed object are visible to callers; reassignments to the parameter are not.',
    keyPoints: [
      'Seven primitive types; everything else is an object.',
      '`{} === {}` is false — reference equality.',
      'Spread / `Object.assign` are shallow.',
      '`Object.freeze` is also shallow.',
      'typeof null === "object" (historical bug).',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Mutation visible across calls',
        code: `function tag(o) { o.seen = true; }
const x = {};
tag(x);
x.seen; // true — same object

function reassign(o) { o = { fresh: true }; }
reassign(x);
x.fresh; // undefined — caller still holds the original reference`,
      },
    ],
    playgrounds: [
      {
        label: 'Shallow vs deep clone',
        description: 'Spread copies the top level. Make a deep clone with structuredClone and watch the nested object stop sharing.',
        starter: `const orig = { a: 1, nested: { b: 2 } };
const shallow = { ...orig };
shallow.nested.b = 99;
console.log(orig.nested.b); // 99 — same nested object`,
      },
    ],
    references: [
      { label: 'MDN — Data structures', url: MDN('Web/JavaScript/Data_structures') },
      { label: 'MDN — structuredClone', url: MDN('Web/API/Window/structuredClone') },
    ],
    redFlags: [
      'Doesn\'t know typeof null === "object".',
      'Thinks arrays compare by content.',
    ],
  },
  {
    slug: 'equality',
    section: 'types',
    title: '== vs === vs Object.is',
    tagline: 'When to use each, and why',
    summary:
      '=== is strict equality: same type, same value. == coerces operands before comparing — the rules are surprising enough that style guides ban it. Object.is is identical to === except for NaN (true) and ±0 (false). React uses Object.is for state comparison since v17.',
    keyPoints: [
      'Always default to ===.',
      'The one defensible == idiom: `value == null` (true for null and undefined).',
      'Object.is(NaN, NaN) === true; Object.is(+0, -0) === false.',
      'TypeScript narrows types so === is enough.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Coercion surprises',
        code: `0 == '';            // true
'1' == 1;           // true
null == undefined;  // true
[] == false;        // true
NaN == NaN;         // false (the lonely value)
[1,2,3] == '1,2,3'; // true — array coerces to string`,
      },
    ],
    playgrounds: [
      {
        label: 'Walk the truth table',
        starter: `const pairs = [
  [null, undefined],
  [0, ''],
  ['0', false],
  [NaN, NaN],
  [[], false],
];
for (const [a, b] of pairs) {
  console.log(JSON.stringify(a), '==', JSON.stringify(b), '->', a == b);
}`,
      },
    ],
    references: [
      { label: 'MDN — Equality comparisons', url: MDN('Web/JavaScript/Reference/Operators/Equality') },
      { label: 'MDN — Object.is', url: MDN('Web/JavaScript/Reference/Global_Objects/Object/is') },
    ],
    redFlags: [
      'Uses == without justification.',
      'Doesn\'t know about Object.is.',
    ],
  },
  {
    slug: 'nan',
    section: 'types',
    title: 'NaN',
    tagline: 'The number that isn\'t equal to itself',
    summary:
      'NaN is the result of impossible numeric operations. typeof NaN === "number". NaN is the only value not equal to itself, so === can\'t detect it — use Number.isNaN (not the global isNaN, which coerces). Number.isFinite is the practical "is this a usable number" check.',
    keyPoints: [
      'NaN === NaN is false; Object.is(NaN, NaN) is true.',
      'Global isNaN coerces first — broken. Use Number.isNaN.',
      'Number.isFinite excludes NaN, ±Infinity.',
      'parseFloat("123abc") === 123 (greedy parse); parseFloat("abc") === NaN.',
      'JSON.stringify(NaN) === "null".',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'NaN gotchas',
        code: `Number.isNaN(NaN);     // true
Number.isNaN('abc');   // false — strict
isNaN('abc');          // true — coerces 'abc' to NaN (broken)
[NaN].indexOf(NaN);    // -1 — uses ===
[NaN].includes(NaN);   // true — uses SameValueZero`,
      },
    ],
    playgrounds: [
      {
        label: 'Detect NaN safely',
        description: 'Replace the broken check below with one that handles 0, "" and NaN correctly.',
        starter: `function isUsableNumber(v) {
  return !isNaN(v); // BUG — 'abc' is reported usable
}
console.log(isUsableNumber('abc')); // expected: false`,
      },
    ],
    references: [
      { label: 'MDN — NaN', url: MDN('Web/JavaScript/Reference/Global_Objects/NaN') },
      { label: 'MDN — Number.isNaN', url: MDN('Web/JavaScript/Reference/Global_Objects/Number/isNaN') },
    ],
    redFlags: [
      'Uses global isNaN.',
      'Doesn\'t know NaN !== NaN.',
    ],
  },
  {
    slug: 'truthy-falsy',
    section: 'types',
    title: 'Truthy and falsy',
    tagline: 'Eight falsy values and the || footgun',
    summary:
      'Eight falsy values: false, 0, -0, 0n, "", null, undefined, NaN. Everything else is truthy (including "0", "false", [], {}). The || operator falls back on any falsy — use ?? when you only want to fall back on null/undefined.',
    keyPoints: [
      'Falsy: false · 0 · -0 · 0n · "" · null · undefined · NaN.',
      '`if (count)` mishandles 0; `if (str)` mishandles "".',
      '`value || default` falls back on 0 / "" / false. Use `??` to fall back only on null/undefined.',
      '`?.` + `??` together cover most defensive paths.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: '|| vs ??',
        code: `function greet(name) {
  // || treats '' as missing — overwrites valid empty string
  return 'hi ' + (name || 'stranger');
}
greet('');         // 'hi stranger'

function greetOk(name) {
  return 'hi ' + (name ?? 'stranger');
}
greetOk('');       // 'hi ' — keeps the empty string`,
      },
    ],
    playgrounds: [
      {
        label: 'Find all the falsies',
        starter: `const values = [false, 0, -0, 0n, '', null, undefined, NaN, '0', 'false', [], {}];
const falsies = values.filter((v) => !v);
console.log('count of falsies:', falsies.length); // expected 8`,
      },
    ],
    references: [
      { label: 'MDN — Falsy', url: MDN('Glossary/Falsy') },
      { label: 'MDN — Nullish coalescing', url: MDN('Web/JavaScript/Reference/Operators/Nullish_coalescing') },
    ],
    redFlags: [
      'Misses common falsy values.',
      'Defaults to || for fallbacks.',
    ],
  },

  // ============================================================
  // SECTION 3 — Functions, this & Prototypes
  // ============================================================
  {
    slug: 'function-flavors',
    section: 'functions',
    title: 'Function flavors',
    tagline: 'Declarations, expressions, arrows',
    summary:
      'Function declarations are fully hoisted. Function expressions only hoist the variable. Arrow functions inherit this lexically, have no arguments object, can\'t be used with new, and have no prototype. Choose declarations for top-level named utilities, arrows for callbacks, expressions when you assign a function to a variable.',
    keyPoints: [
      'Declaration: `function name() {}` — hoisted with body.',
      'Expression: `const x = function () {}` — only x hoisted.',
      'Arrow: `const x = () => {}` — no own this, arguments, prototype; not constructable.',
      'Arrow methods on classes capture `this` from the constructor scope (per-instance).',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Arrow vs method',
        code: `const obj = {
  name: 'ada',
  asMethod() { return this.name; },
  asArrow: () => (typeof this === 'undefined' ? 'no this' : this.name),
};
obj.asMethod(); // 'ada'
obj.asArrow();  // 'no this' — arrow ignores obj`,
      },
    ],
    playgrounds: [
      {
        label: 'Three ways to write add',
        starter: `function add1(a, b) { return a + b; }
const add2 = function (a, b) { return a + b; };
const add3 = (a, b) => a + b;
console.log(add1(2, 3), add2(2, 3), add3(2, 3));`,
      },
    ],
    references: [
      { label: 'MDN — Functions', url: MDN('Web/JavaScript/Reference/Functions') },
      { label: 'MDN — Arrow functions', url: MDN('Web/JavaScript/Reference/Functions/Arrow_functions') },
    ],
    redFlags: [
      'Treats arrows and named functions as interchangeable.',
      'Doesn\'t know arrows have no own this.',
    ],
  },
  {
    slug: 'this-binding',
    section: 'functions',
    title: '`this` binding',
    tagline: 'New, explicit, implicit, default — in that order',
    summary:
      '`this` is determined by how a function is called, not where it is defined. Priority: new > explicit (call/apply/bind) > implicit (method call) > default (undefined in strict, global in sloppy). Arrow functions opt out — they inherit `this` from their lexical scope.',
    keyPoints: [
      'new Foo() — this is the newly created object.',
      'fn.call(obj) / fn.apply / fn.bind — this is what you pass.',
      'obj.fn() — this is the object before the dot, decided at call time.',
      'Plain fn() — undefined in strict mode.',
      'Arrow functions ignore all four rules and inherit lexically.',
      'Detached method (`const f = obj.method; f()`) loses the binding.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'The detachment trap',
        code: `const counter = {
  count: 0,
  inc() { this.count++; return this.count; },
};
const f = counter.inc;
// f();        // TypeError in strict — this is undefined
counter.inc(); // 1 — this is counter`,
      },
    ],
    playgrounds: [
      {
        label: 'Fix the timer binding',
        description: 'setTimeout strips the implicit binding. Try bind, an arrow wrapper, and an arrow class field.',
        starter: `class Counter {
  count = 0;
  inc() { this.count++; console.log('count:', this.count); }
}
const c = new Counter();
setTimeout(c.inc, 10); // logs: undefined / throws — fix it`,
      },
    ],
    references: [
      { label: 'MDN — this', url: MDN('Web/JavaScript/Reference/Operators/this') },
    ],
    redFlags: [
      'Says "this is the calling object" as the only rule.',
      'Doesn\'t know arrow functions ignore the rules.',
    ],
  },
  {
    slug: 'call-apply-bind',
    section: 'functions',
    title: 'call, apply, bind',
    tagline: 'Three ways to pin `this`',
    summary:
      'All three set `this` for a function call. call passes arguments individually; apply takes them as an array; bind returns a new function with `this` (and optional partial arguments) permanently fixed. Modern code uses arrows and spread for most cases, but the trio is still important for reading older code and for partial application.',
    keyPoints: [
      '`fn.call(thisArg, a, b)` — invoke immediately, args spread.',
      '`fn.apply(thisArg, [a, b])` — invoke immediately, args from array.',
      '`fn.bind(thisArg, a)` — return a new function with `this` and partial args fixed.',
      'Spread (`fn(...args)`) replaces most uses of apply.',
      'bind is still useful for one-shot partial application.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Partial application via bind',
        code: `function tag(label, value) { return label + ':' + value; }
const error = tag.bind(null, 'ERROR');
error('disk full'); // 'ERROR:disk full'`,
      },
    ],
    playgrounds: [
      {
        label: 'Borrow Array.prototype.slice',
        starter: `function args() {
  return Array.prototype.slice.call(arguments);
}
console.log(args(1, 2, 3)); // [1, 2, 3]`,
      },
    ],
    references: [
      { label: 'MDN — Function.prototype.bind', url: MDN('Web/JavaScript/Reference/Global_Objects/Function/bind') },
    ],
    redFlags: [
      'Confuses call vs apply (the array thing).',
      'Doesn\'t know bind returns a new function.',
    ],
  },
  {
    slug: 'prototypes',
    section: 'functions',
    title: 'Prototypes',
    tagline: 'How JS does inheritance',
    summary:
      'Every object has a [[Prototype]] link. Property lookup walks the chain until it finds the property or reaches null. Functions have a `prototype` property used by `new` to set up the chain. Methods on the prototype are shared across instances — that\'s the memory win over per-instance arrow fields.',
    keyPoints: [
      '`Object.getPrototypeOf(obj)` reads the link.',
      '`new Foo()` sets the new object\'s [[Prototype]] to Foo.prototype.',
      'Methods on Foo.prototype are shared across all instances.',
      '`Object.create(proto)` builds an object with a given prototype, no constructor.',
      'Modifying Array.prototype affects every array in the realm — avoid.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Prototype chain walk',
        code: `function Animal(name) { this.name = name; }
Animal.prototype.speak = function () { return this.name + ' makes a sound'; };
const a = new Animal('Ada');
a.speak();                                // 'Ada makes a sound'
Object.getPrototypeOf(a) === Animal.prototype; // true`,
      },
    ],
    playgrounds: [
      {
        label: 'Build a two-level chain',
        starter: `function Animal(name) { this.name = name; }
Animal.prototype.speak = function () { return this.name + ' makes a sound'; };
function Dog(name) { Animal.call(this, name); }
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.bark = function () { return 'woof'; };
const d = new Dog('Rex');
console.log(d.speak(), d.bark(), d instanceof Animal);`,
      },
    ],
    references: [
      { label: 'MDN — Inheritance and the prototype chain', url: MDN('Web/JavaScript/Inheritance_and_the_prototype_chain') },
    ],
    redFlags: [
      'Confuses prototype with class.',
      'Has never used Object.create or Object.getPrototypeOf.',
    ],
  },
  {
    slug: 'classes-over-prototypes',
    section: 'functions',
    title: 'Classes over prototypes',
    tagline: 'Sugar with one or two real teeth',
    summary:
      'class is syntactic sugar over the prototype model. Methods land on Foo.prototype; constructor is the function body. extends sets the prototype chain correctly, super navigates it. Modern additions — # private fields, static blocks, accessor decorators — give classes some non-prototype machinery, but the core is still prototypes underneath.',
    keyPoints: [
      'class declarations are hoisted into the TDZ (like let/const).',
      'Methods sit on the prototype — shared across instances.',
      'Class fields (`x = 0`) are per-instance.',
      'Arrow-function class fields capture `this` at construction time, at the cost of one closure per instance.',
      '`#name` makes a real private field, enforced by the engine.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'class === prototype sugar',
        code: `class Counter {
  #count = 0;
  inc() { this.#count++; return this.#count; }
}
typeof Counter.prototype.inc;            // 'function'
new Counter().inc === Counter.prototype.inc; // true — shared on the prototype`,
      },
    ],
    playgrounds: [
      {
        label: 'extends, super, the chain',
        starter: `class Animal { constructor(name) { this.name = name; } speak() { return this.name; } }
class Dog extends Animal { bark() { return this.speak() + ' barks'; } }
const d = new Dog('Rex');
console.log(d.bark(), d instanceof Animal);`,
      },
    ],
    references: [
      { label: 'MDN — Classes', url: MDN('Web/JavaScript/Reference/Classes') },
      { label: 'MDN — Private class features', url: MDN('Web/JavaScript/Reference/Classes/Private_properties') },
    ],
    redFlags: [
      'Thinks classes "replaced" prototypes.',
      'Doesn\'t know class methods land on the prototype.',
    ],
  },
  {
    slug: 'getters-setters',
    section: 'functions',
    title: 'Getters and setters',
    tagline: 'Properties that run code',
    summary:
      'Getters and setters turn property access into a function call. From the caller\'s side they look like normal properties; under the hood they validate, lazily compute, log, or back onto private state. Common in framework code (Vue 2 reactivity was built on Object.defineProperty); in application code use them sparingly.',
    keyPoints: [
      '`get foo()` runs on read; `set foo(v)` runs on write.',
      'Getter-only properties are read-only (silent in sloppy, throws in strict).',
      'Avoid `set name(v) { this.name = v; }` — infinite recursion. Use a backing `#name`.',
      'Object.defineProperty gives precise descriptor control.',
      'Property access that looks free can do arbitrary work — abuse is confusing.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Computed property',
        code: `class Temperature {
  #c = 0;
  get celsius() { return this.#c; }
  set celsius(v) { if (typeof v !== 'number') throw new TypeError('number'); this.#c = v; }
  get fahrenheit() { return this.#c * 9 / 5 + 32; }
}
const t = new Temperature();
t.celsius = 100;
t.fahrenheit; // 212`,
      },
    ],
    playgrounds: [
      {
        label: 'Lazy initialization via a getter',
        starter: `function lazy(fn) {
  let computed = false, value;
  return {
    get value() {
      if (!computed) { value = fn(); computed = true; }
      return value;
    }
  };
}
let calls = 0;
const l = lazy(() => { calls++; return 'expensive'; });
console.log(l.value, l.value, 'calls:', calls);`,
      },
    ],
    references: [
      { label: 'MDN — get', url: MDN('Web/JavaScript/Reference/Functions/get') },
      { label: 'MDN — Object.defineProperty', url: MDN('Web/JavaScript/Reference/Global_Objects/Object/defineProperty') },
    ],
    redFlags: [
      'Has never used them.',
      'Doesn\'t know they\'re called as methods despite the property syntax.',
    ],
  },

  // ============================================================
  // SECTION 4 — Async JavaScript & The Event Loop
  // ============================================================
  {
    slug: 'event-loop',
    section: 'async',
    title: 'The event loop',
    tagline: 'Macrotasks, microtasks, render — in that order',
    summary:
      'JS runs one task to completion, drains the microtask queue completely, then renders, then picks the next macrotask. Promises (.then, .catch, .finally, await continuations), queueMicrotask, MutationObserver — microtasks. setTimeout, setInterval, I/O — macrotasks. setTimeout(fn, 0) is "after the current task and all microtasks".',
    keyPoints: [
      'Macrotask → drain microtasks → render → next macrotask.',
      'Promise.then chains run as one batch before the next setTimeout.',
      'A long microtask chain can starve rendering.',
      '`await` is sugar for `.then` — the continuation is a microtask.',
      'Node has phases and a `process.nextTick` queue that fires before microtasks.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Order of execution',
        code: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// Output: 1, 4, 3, 2`,
      },
    ],
    playgrounds: [
      {
        label: 'Predict, then run',
        description: 'Reorder the lines and predict before running.',
        starter: `console.log('a');
Promise.resolve().then(() => console.log('b'));
setTimeout(() => console.log('c'), 0);
queueMicrotask(() => console.log('d'));
console.log('e');`,
      },
    ],
    references: [
      { label: 'MDN — The event loop', url: MDN('Web/JavaScript/EventLoop') },
      { label: 'HTML spec — Event loops', url: 'https://html.spec.whatwg.org/multipage/webappapis.html#event-loops' },
    ],
    redFlags: [
      'Doesn\'t distinguish microtasks from macrotasks.',
      'Thinks setTimeout(fn, 0) runs immediately.',
    ],
  },
  {
    slug: 'promises',
    section: 'async',
    title: 'Promises',
    tagline: 'Pending, fulfilled, rejected — and chaining',
    summary:
      'A Promise represents the eventual result of an async operation. It starts pending, then settles once to fulfilled or rejected — immutable thereafter. .then returns a new promise, enabling chains. Forgotten returns in .then break the chain; unhandled rejections crash modern Node and fire unhandledrejection in browsers.',
    keyPoints: [
      'Three states; one transition.',
      '`.then(h)` returns a new promise; throwing inside h rejects that one.',
      'If h returns a promise, the outer promise adopts its state.',
      'Promises are eager — the executor runs immediately on construction.',
      '`AbortController` is the cancellation mechanism, not promises themselves.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Chaining and adoption',
        code: `Promise.resolve(1)
  .then((x) => x + 1)
  .then((x) => Promise.resolve(x * 2)) // adopts the inner promise
  .then((x) => x);                     // 4`,
      },
    ],
    playgrounds: [
      {
        label: 'Where does the value land?',
        starter: `const wait = (ms, v) => new Promise(r => setTimeout(() => r(v), ms));
wait(20, 'A')
  .then(v => v + 'B')
  .then(v => wait(20, v + 'C'))
  .then(console.log); // ABС? ABC?`,
      },
    ],
    references: [
      { label: 'MDN — Promise', url: MDN('Web/JavaScript/Reference/Global_Objects/Promise') },
    ],
    redFlags: [
      'Doesn\'t know .then returns a new promise.',
      'Thinks Promises are cancellable.',
    ],
  },
  {
    slug: 'async-await',
    section: 'async',
    title: 'async / await',
    tagline: 'Sugar over promises with one or two traps',
    summary:
      'An async function always returns a promise. await pauses the function until the promise settles, then resumes as a microtask. Forgetting await loses error context; awaiting in a for-loop is sequential while Promise.all(arr.map(...)) is parallel.',
    keyPoints: [
      '`async` always wraps the return in a promise.',
      '`await` waits, then resumes as a microtask.',
      'Sequential: `for (const x of arr) await f(x);` — Parallel: `await Promise.all(arr.map(f));`',
      'Top-level await works in ES modules.',
      '`.map(async fn)` returns an array of promises — wrap in Promise.all.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Sequential vs parallel',
        code: `// Sequential — total = sum of delays
for (const id of ids) await fetch(url(id));
// Parallel — total = max of delays
await Promise.all(ids.map((id) => fetch(url(id))));`,
      },
    ],
    playgrounds: [
      {
        label: 'Time the two approaches',
        starter: `const wait = (ms) => new Promise(r => setTimeout(r, ms));
async function sequential() {
  const t0 = Date.now();
  for (const ms of [50, 50, 50]) await wait(ms);
  return Date.now() - t0;
}
async function parallel() {
  const t0 = Date.now();
  await Promise.all([50, 50, 50].map(wait));
  return Date.now() - t0;
}
console.log('seq~150:', await sequential());
console.log('par~50:',  await parallel());`,
      },
    ],
    references: [
      { label: 'MDN — async function', url: MDN('Web/JavaScript/Reference/Statements/async_function') },
      { label: 'MDN — await', url: MDN('Web/JavaScript/Reference/Operators/await') },
    ],
    redFlags: [
      'Thinks async/await is "different from" promises.',
      'Doesn\'t know the sequential-vs-parallel trap.',
    ],
  },
  {
    slug: 'async-error-handling',
    section: 'async',
    title: 'Async error handling',
    tagline: 'try/catch around await, and the floating promise problem',
    summary:
      'try/catch around await is the basic pattern. Granularity is a judgment call — wrap a logical unit, not every line. Use the Error `cause` option to preserve context when re-throwing. Forgotten awaits turn into unhandled rejections; ESLint\'s no-floating-promises and TypeScript\'s strict mode help catch them.',
    keyPoints: [
      'await + try/catch is the standard.',
      '`throw new Error(msg, { cause: original })` preserves the chain.',
      'Unawaited async calls swallow errors as unhandled rejections.',
      'Promise.all rejects on the first failure — use allSettled when you want every result.',
      '`AbortController` + handling AbortError is the cancellation pattern.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Wrap and re-throw with cause',
        code: `async function loadConfig(path) {
  try {
    const json = await readFile(path);
    return JSON.parse(json);
  } catch (err) {
    throw new Error('Failed to load config: ' + path, { cause: err });
  }
}`,
      },
    ],
    playgrounds: [
      {
        label: 'Catch a rejection without await',
        starter: `function risky() { return Promise.reject(new Error('boom')); }
// Wrap in await + try/catch:
try {
  await risky();
} catch (err) {
  console.log('caught:', err.message);
}`,
      },
    ],
    references: [
      { label: 'MDN — Error cause', url: MDN('Web/JavaScript/Reference/Global_Objects/Error/Error') },
    ],
    redFlags: [
      'Wraps everything in try/catch then ignores the error.',
      'No global handler for unhandledrejection.',
    ],
  },
  {
    slug: 'promise-combinators',
    section: 'async',
    title: 'Promise combinators',
    tagline: 'all · allSettled · race · any',
    summary:
      'Four combinators with different failure semantics. Promise.all rejects on first failure, returns array of values. allSettled never rejects, returns {status, value/reason}. race resolves or rejects on whichever settles first. any resolves with the first fulfilled, rejects with AggregateError if all reject.',
    keyPoints: [
      '`all` — all must succeed; reject on first failure.',
      '`allSettled` — wait for everything, never reject.',
      '`race` — first to settle wins (success OR failure).',
      '`any` — first to fulfill wins; AggregateError if none.',
      'Combinators do NOT cancel slower promises — only ignore them.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Pick the right one',
        code: `// All endpoints must succeed
const [user, perms] = await Promise.all([fetchUser(), fetchPerms()]);

// Some may fail; we want every outcome
const results = await Promise.allSettled(urls.map(fetch));

// Timeout pattern
const v = await Promise.race([fetch(url), reject({}, 1000)]);

// Fallback endpoints
const fastest = await Promise.any([primary(), mirror()]);`,
      },
    ],
    playgrounds: [
      {
        label: 'allSettled never throws',
        starter: `const ok = Promise.resolve('A');
const bad = Promise.reject(new Error('B failed'));
const r = await Promise.allSettled([ok, bad]);
console.log(r.map(x => x.status)); // ['fulfilled', 'rejected']`,
      },
    ],
    references: [
      { label: 'MDN — Promise.all', url: MDN('Web/JavaScript/Reference/Global_Objects/Promise/all') },
      { label: 'MDN — Promise.allSettled', url: MDN('Web/JavaScript/Reference/Global_Objects/Promise/allSettled') },
      { label: 'MDN — Promise.any', url: MDN('Web/JavaScript/Reference/Global_Objects/Promise/any') },
    ],
    redFlags: [
      'Doesn\'t know Promise.allSettled.',
      'Uses Promise.all when partial failure is acceptable.',
    ],
  },
  {
    slug: 'generators',
    section: 'async',
    title: 'Generators',
    tagline: 'Pausable functions and the iteration protocol',
    summary:
      'A generator function (function*) returns an iterator. yield pauses; next() resumes. Useful for lazy / infinite sequences, custom iterables, and — historically — cooperative async (co, redux-saga). With async/await, the async-flavor use case is mostly gone; iteration and effect-as-data designs (sagas) remain.',
    keyPoints: [
      '`function*` declares a generator; `yield` pauses it.',
      'gen.next(v) resumes, passing v back as the result of the suspended yield.',
      'Generators implement [Symbol.iterator] automatically.',
      '`function*` + iteration = lazy / infinite sequences.',
      '`async function*` + `for await...of` for async iteration.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Range generator',
        code: `function* range(start, end) {
  for (let i = start; i < end; i++) yield i;
}
[...range(2, 5)]; // [2, 3, 4]`,
      },
    ],
    playgrounds: [
      {
        label: 'Infinite Fibonacci',
        starter: `function* fib() {
  let [a, b] = [0, 1];
  while (true) { yield a; [a, b] = [b, a + b]; }
}
const g = fib();
const first8 = Array.from({ length: 8 }, () => g.next().value);
console.log(first8); // [0,1,1,2,3,5,8,13]`,
      },
    ],
    references: [
      { label: 'MDN — function*', url: MDN('Web/JavaScript/Reference/Statements/function*') },
    ],
    redFlags: [
      'Hasn\'t used generators despite Redux-Saga experience.',
      'Only knows the syntax, not the use cases.',
    ],
  },

  // ============================================================
  // SECTION 5 — Modern JS & Advanced Concepts
  // ============================================================
  {
    slug: 'esm-vs-cjs',
    section: 'modern',
    title: 'ES modules vs CommonJS',
    tagline: 'Static, async, live — vs dynamic, sync, snapshot',
    summary:
      'ES modules are static (top-level imports, string literal paths) and asynchronous (in browsers). CommonJS is dynamic and synchronous. ESM imports are live bindings — you see the exporter\'s current value; CJS gives a snapshot at require time. ESM is the future; tree-shaking depends on it.',
    keyPoints: [
      'ESM: import/export, static, async-loadable, live bindings.',
      'CJS: require/module.exports, dynamic, sync, snapshot.',
      'ESM enables tree-shaking; CJS doesn\'t.',
      'Node interop pain: CJS can require ESM only via dynamic import().',
      '.mjs always ESM, .cjs always CJS; package.json `type` decides .js.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'ES module',
        code: `// counter.js
export let count = 0;
export function inc() { count++; }

// main.js
import { count, inc } from './counter.js';
console.log(count); // 0
inc();
console.log(count); // 1 — live binding reflects exporter state`,
      },
    ],
    playgrounds: [
      {
        label: 'Dynamic import',
        starter: `// Dynamic import is a Promise — works in both ESM and CJS.
const mod = await import('data:text/javascript,export const x = 42');
console.log(mod.x);`,
      },
    ],
    references: [
      { label: 'MDN — JavaScript modules', url: MDN('Web/JavaScript/Guide/Modules') },
      { label: 'Node — ECMAScript modules', url: 'https://nodejs.org/api/esm.html' },
    ],
    redFlags: [
      'Doesn\'t know one of the two.',
      'Thinks bundlers eliminate the semantic difference.',
    ],
  },
  {
    slug: 'iteration-protocol',
    section: 'modern',
    title: 'Iteration protocol',
    tagline: 'How for...of, spread, and destructuring talk to objects',
    summary:
      'An object is iterable if it has a [Symbol.iterator]() method returning an iterator — an object with .next() returning {value, done}. for...of, spread, array destructuring, Array.from, and the Set/Map constructors all use this. Plain objects are not iterable by default.',
    keyPoints: [
      'iterable: has [Symbol.iterator]().',
      'iterator: has .next() returning {value, done}.',
      'Arrays, strings, Set, Map, NodeList, generators — all iterable.',
      'Plain objects: NOT iterable. Use Object.entries / .keys / .values.',
      'Async iteration: [Symbol.asyncIterator] + for await...of.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'A custom iterable',
        code: `const range = {
  from: 1, to: 3,
  [Symbol.iterator]() {
    let cur = this.from;
    const last = this.to;
    return { next() { return cur <= last ? { value: cur++, done: false } : { value: undefined, done: true }; } };
  },
};
[...range]; // [1, 2, 3]`,
      },
    ],
    playgrounds: [
      {
        label: 'Custom iterable as object literal',
        starter: `const evens = {
  *[Symbol.iterator]() { for (let i = 0; i < 6; i += 2) yield i; },
};
console.log([...evens]); // [0, 2, 4]`,
      },
    ],
    references: [
      { label: 'MDN — Iteration protocols', url: MDN('Web/JavaScript/Reference/Iteration_protocols') },
    ],
    redFlags: [
      'Has never implemented Symbol.iterator.',
      'Doesn\'t know plain objects aren\'t iterable.',
    ],
  },
  {
    slug: 'map-set',
    section: 'modern',
    title: 'Map and Set',
    tagline: 'Right data structures for the job',
    summary:
      'Map keys can be anything (objects, functions, primitives), preserves insertion order strictly, has O(1) .size, and is directly iterable. Set deduplicates automatically and offers O(1) .has. WeakMap/WeakSet hold weak references — perfect for object-keyed metadata that should be GC\'d when the key is.',
    keyPoints: [
      'Map: any key type; insertion-ordered; O(1) size and lookup.',
      'Set: unique values; O(1) has; iterable.',
      'Plain object keys are stringified; integer-like keys reorder; prototype pollution is a risk.',
      'WeakMap / WeakSet: weak refs, no iteration, GC-friendly.',
      'JSON does NOT round-trip Maps or Sets natively.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Map keyed by objects',
        code: `const cache = new WeakMap();
function expensive(o) {
  if (cache.has(o)) return cache.get(o);
  const v = compute(o);
  cache.set(o, v);
  return v;
}`,
      },
    ],
    playgrounds: [
      {
        label: 'Dedupe via Set',
        starter: `const arr = [1, 2, 2, 3, 3, 3];
const unique = [...new Set(arr)];
console.log(unique); // [1, 2, 3]`,
      },
    ],
    references: [
      { label: 'MDN — Map', url: MDN('Web/JavaScript/Reference/Global_Objects/Map') },
      { label: 'MDN — Set', url: MDN('Web/JavaScript/Reference/Global_Objects/Set') },
      { label: 'MDN — WeakMap', url: MDN('Web/JavaScript/Reference/Global_Objects/WeakMap') },
    ],
    redFlags: [
      'Uses arrays for membership checks at scale.',
      'Hasn\'t used WeakMap.',
    ],
  },
  {
    slug: 'symbols',
    section: 'modern',
    title: 'Symbols',
    tagline: 'Unique, opaque, collision-free keys',
    summary:
      'Symbol() returns a unique primitive — even with the same description, two symbols are different. Used as object keys they don\'t collide with strings. Well-known symbols (Symbol.iterator, Symbol.toPrimitive) hook into language behavior. Symbol.for/keyFor expose a cross-realm registry.',
    keyPoints: [
      '`Symbol() === Symbol()` is false; descriptions are informational.',
      'Symbol-keyed properties are not enumerated by Object.keys, for...in, or JSON.stringify.',
      '`Object.getOwnPropertySymbols(o)` exposes them — not truly private.',
      '`Symbol.iterator`, `Symbol.asyncIterator`, `Symbol.toPrimitive` shape language behavior.',
      '`Symbol.for(key)` returns a registered symbol shared across realms.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Hook into to-string',
        code: `class Cents {
  constructor(n) { this.n = n; }
  [Symbol.toPrimitive](hint) {
    return hint === 'string' ? '$' + (this.n / 100).toFixed(2) : this.n;
  }
}
String(new Cents(199)); // '$1.99'
new Cents(50) + 25;     // 75`,
      },
    ],
    playgrounds: [
      {
        label: 'Symbol-keyed metadata',
        starter: `const TAG = Symbol('tag');
const obj = { name: 'Ada', [TAG]: 'internal' };
console.log(Object.keys(obj));                    // ['name']
console.log(Object.getOwnPropertySymbols(obj));   // [Symbol(tag)]
console.log(obj[TAG]);                            // 'internal'`,
      },
    ],
    references: [
      { label: 'MDN — Symbol', url: MDN('Web/JavaScript/Reference/Global_Objects/Symbol') },
    ],
    redFlags: [
      'Thinks Symbols are a privacy mechanism (they\'re not, fully).',
      'No idea what well-known symbols do.',
    ],
  },
  {
    slug: 'es2020-plus',
    section: 'modern',
    title: 'ES2020+ greatest hits',
    tagline: '?. , ?? , ??= , top-level await, Object.hasOwn, Error cause',
    summary:
      'A burst of small, footgun-reducing features. Optional chaining (?.), nullish coalescing (??), logical assignment (??=, ||=, &&=), top-level await, Object.hasOwn, Array.prototype.at, Error.cause. These are the day-one wins; decorators, Records & Tuples, and pattern matching are still on the runway.',
    keyPoints: [
      '`user?.address?.city` — replaces && chains.',
      '`value ?? default` — fall back only on null/undefined.',
      '`obj.x ??= 5` — set if currently null/undefined.',
      '`arr.at(-1)` — last element without arr.length math.',
      '`Object.hasOwn(o, k)` — replaces .hasOwnProperty (which fails for null-proto objects).',
      '`new Error(msg, { cause: original })` — preserve error chain.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Before / after',
        code: `// Before
const city = user && user.address && user.address.city;
const limit = config.limit !== undefined ? config.limit : 10;

// After
const city = user?.address?.city;
const limit = config.limit ?? 10;`,
      },
    ],
    playgrounds: [
      {
        label: '?. + ?? in the wild',
        starter: `const data = { user: { profile: null } };
console.log(data.user?.profile?.name ?? 'anonymous'); // 'anonymous'`,
      },
    ],
    references: [
      { label: 'MDN — Optional chaining', url: MDN('Web/JavaScript/Reference/Operators/Optional_chaining') },
      { label: 'TC39 — Finished proposals', url: 'https://github.com/tc39/proposals/blob/main/finished-proposals.md' },
    ],
    redFlags: [
      'Can\'t name any post-ES2015 features.',
      'Lists features but doesn\'t actually use them.',
    ],
  },

  // ============================================================
  // SECTION 6 — Memory, Performance & Senior Judgment
  // ============================================================
  {
    slug: 'garbage-collection',
    section: 'memory',
    title: 'Garbage collection',
    tagline: 'Mark-and-sweep, generational, mostly automatic',
    summary:
      'Modern engines use generational mark-and-sweep with concurrent and parallel passes. Objects unreachable from roots (globals, locals on the call stack, closure chains) become eligible for collection. Reference counting was abandoned long ago — it doesn\'t handle cycles.',
    keyPoints: [
      'Reachable from roots = retained.',
      'Young generation (nursery) collected often; survivors promote.',
      'Mark-and-sweep handles cycles; reference counting does not.',
      'You make memory free-able by removing references, not by explicit free.',
      'WeakRef + FinalizationRegistry exist but have subtle pitfalls.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Making something GC-eligible',
        code: `let big = new Array(1_000_000).fill(0);
// ... use big ...
big = null; // last reference dropped → eligible
// Now the engine can reclaim the array on the next GC pass.`,
      },
    ],
    playgrounds: [
      {
        label: 'WeakRef as a peek',
        starter: `let obj = { tag: 'demo' };
const ref = new WeakRef(obj);
console.log(ref.deref()?.tag); // 'demo'
obj = null;
// Not deterministic — the engine collects whenever it likes.`,
      },
    ],
    references: [
      { label: 'MDN — Memory management', url: MDN('Web/JavaScript/Memory_management') },
      { label: 'V8 — Trash talk', url: 'https://v8.dev/blog/trash-talk' },
    ],
    redFlags: [
      'Thinks JS uses reference counting.',
      'No mention of weak references.',
    ],
  },
  {
    slug: 'memory-leaks',
    section: 'memory',
    title: 'Memory leaks',
    tagline: 'Listeners, timers, caches, detached DOM, dangling promises',
    summary:
      'GC handles unreachable memory. Leaks happen when references are unintentionally retained. The usual suspects: forgotten event listeners, unkilled timers, unbounded caches, detached DOM nodes, never-settled promises, big closures, unsubscribed observers. Profile with the Memory tab; pair every addEventListener / setInterval / subscribe with explicit cleanup.',
    keyPoints: [
      'Pair addEventListener with removeEventListener (or AbortController).',
      'clearInterval / clearTimeout on unmount.',
      'Bounded caches (LRU, TTL) — never unbounded.',
      'Detached DOM still in JS = leak.',
      'WeakMap for object-keyed metadata.',
      'Profile with DevTools Memory tab — three-snapshot technique.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Listener with AbortController',
        code: `const ctrl = new AbortController();
el.addEventListener('click', onClick, { signal: ctrl.signal });
// later, in cleanup
ctrl.abort(); // removes the listener`,
      },
    ],
    playgrounds: [
      {
        label: 'Timer that leaks vs cleans',
        starter: `class Polling {
  start() { this.id = setInterval(() => console.log('tick'), 50); }
  stop()  { clearInterval(this.id); }
}
const p = new Polling();
p.start();
await new Promise(r => setTimeout(r, 120));
p.stop();
console.log('stopped');`,
      },
    ],
    references: [
      { label: 'web.dev — Find leaks', url: 'https://web.dev/articles/memory-leaks-debugging' },
    ],
    redFlags: [
      'No specific leak patterns.',
      'Thinks GC handles everything.',
    ],
  },
  {
    slug: 'performance-pitfalls',
    section: 'memory',
    title: 'Performance pitfalls',
    tagline: 'Long tasks, layout thrash, wrong data structures',
    summary:
      'The repeat offenders: layout thrashing (read/write/read/write), excessive re-renders, large bundles, long synchronous tasks (>50 ms), O(n) membership checks on hot paths, no caching, no debounce. Find them with Performance and Lighthouse — and profile before optimizing.',
    keyPoints: [
      'Long tasks (>50 ms) block input — split or offload to a Worker.',
      'Batch DOM reads, then writes — avoid layout thrashing.',
      'Set/Map beat Array.includes/indexOf at scale.',
      'Debounce on input events; throttle on scroll/resize.',
      'Bundle analyzer + tree-shaking; deep-import lodash (or use it sparingly).',
      'Profile first; intuition about bottlenecks is wrong more than half the time.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Classic debounce',
        code: `function debounce(fn, ms) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
}`,
      },
    ],
    playgrounds: [
      {
        label: 'Throttle vs debounce',
        starter: `function throttle(fn, ms) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn(...args); }
  };
}
const log = throttle((v) => console.log(v), 30);
log('a'); log('b'); log('c'); // only one will fire on this tick`,
      },
    ],
    references: [
      { label: 'web.dev — Web Vitals', url: 'https://web.dev/articles/vitals' },
      { label: 'MDN — Performance', url: MDN('Web/Performance') },
    ],
    redFlags: [
      'No tools mentioned.',
      'Jumps to micro-optimizations before profiling.',
    ],
  },
  {
    slug: 'keeping-up',
    section: 'memory',
    title: 'Keeping up with the language',
    tagline: 'TC39 stages, what to track, what to skip',
    summary:
      'TC39 manages JS evolution. Stages 0–4 — stage 3 is "almost certain", stage 4 means it shipped. Track Records & Tuples (immutable value types), Decorators (now stage 3), Temporal (the long-awaited Date replacement), Iterator helpers. Engine release notes (V8, SpiderMonkey, JavaScriptCore) and MDN compat tables are the ground truth.',
    keyPoints: [
      'TC39 — the committee that maintains the spec.',
      'Stage 3 = nearly certain; stage 4 = in the standard.',
      'Watch: Records & Tuples, Decorators, Temporal, Iterator helpers.',
      'MDN compat tables show what\'s actually shipped per engine.',
      'Maturity > novelty for production code.',
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Iterator helpers (stage 3)',
        code: `// Lazy chained transforms — no intermediate arrays.
const result = (function* () { for (let i = 0; i < 100; i++) yield i; })()
  .filter((n) => n % 2 === 0)
  .map((n) => n * n)
  .take(5)
  .toArray();
// [0, 4, 16, 36, 64]`,
      },
    ],
    playgrounds: [
      {
        label: 'Temporal placeholder (will arrive natively)',
        description: 'Until Temporal ships everywhere, Intl.DateTimeFormat is the best non-Date tool.',
        starter: `const fmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });
console.log(fmt.format(new Date()));`,
      },
    ],
    references: [
      { label: 'TC39 proposals', url: 'https://github.com/tc39/proposals' },
      { label: 'V8 blog', url: 'https://v8.dev/blog' },
      { label: 'MDN compat tables', url: MDN('Web/JavaScript') },
    ],
    redFlags: [
      'Doesn\'t know TC39 by name.',
      'Names features but doesn\'t actually use them.',
    ],
  },
];

export const CHAPTERS: Chapter[] = CHAPTERS_RAW.map((c) => ({
  ...c,
  tasks: TASKS_BY_SLUG[c.slug],
}));

export const CHAPTERS_BY_SLUG: Record<string, Chapter> = Object.fromEntries(
  CHAPTERS.map((c) => [c.slug, c]),
);

export function chaptersInSection(sectionKey: string): Chapter[] {
  return CHAPTERS.filter((c) => c.section === sectionKey);
}

export function findChapterNeighbors(slug: string): {
  prev?: Chapter;
  next?: Chapter;
} {
  const i = CHAPTERS.findIndex((c) => c.slug === slug);
  if (i === -1) return {};
  return { prev: i > 0 ? CHAPTERS[i - 1] : undefined, next: i < CHAPTERS.length - 1 ? CHAPTERS[i + 1] : undefined };
}
