import type { Task } from './chapter.model';

// 30 chapters × ~4 tasks (3 coding + 1 theoretical). Coding tasks ship with
// a starter the user completes. Test cases run in the sandbox worker.

export const TASKS_BY_SLUG: Record<string, Task[]> = {
  // ============================================================
  // SECTION 1 — Variables, Scope & Closures
  // ============================================================
  'var-let-const': [
    {
      prompt: 'Implement tdz(): return "caught" if reading a let before its declaration throws, otherwise return "leaked".',
      hint: 'Wrap the read in try/catch. A let in TDZ throws ReferenceError.',
      validator: {
        kind: 'code',
        starter: `function tdz() {
  // Read x before its let declaration. Catch the ReferenceError.
  // TODO
}`,
        cases: [
          { call: 'tdz()', expected: 'caught', label: 'TDZ throws → caught' },
        ],
        explanation: 'A `let` is hoisted but uninitialised — reading it before its declaration line throws ReferenceError. That gap is the Temporal Dead Zone.',
      },
    },
    {
      prompt: 'Implement blockScopeDemo(): schedule console.log(i) for i = 0..4 via setTimeout in a loop, such that the logs come out "0", "1", "2", "3", "4" in order.',
      hint: 'var creates one binding shared across iterations. let creates a fresh binding per iteration.',
      validator: {
        kind: 'code',
        starter: `function blockScopeDemo() {
  // TODO: schedule console.log(String(i)) for i = 0..4 so each fires with its own i.
}`,
        cases: [
          {
            call: 'blockScopeDemo()',
            expected: undefined,
            expectedLogs: ['0', '1', '2', '3', '4'],
            label: 'logs 0..4 in order',
          },
        ],
        explanation: 'Use `for (let i = 0; i < 5; i++)` — let creates a new binding per iteration so each closure captures its own i.',
      },
    },
    {
      prompt: 'Implement hoistedReturn(): return both `typeof a` (before the var declaration of a) and `typeof b` (when reading b before its let declaration inside try/catch). The error label for a TDZ read should be the string "ReferenceError".',
      hint: 'typeof on an undeclared/uninitialised var returns "undefined". A TDZ let read throws.',
      validator: {
        kind: 'code',
        starter: `function hoistedReturn() {
  // typeof a — a is declared with var later in this function
  // typeof b — b is declared with let later; reading before throws
  // Return ['<typeof a>', '<error name or "undefined">']
  // TODO
}`,
        cases: [
          { call: "JSON.stringify(hoistedReturn())", expected: '["undefined","ReferenceError"]', label: '[typeof a, name of TDZ error]' },
        ],
        explanation: 'var hoists with undefined → typeof is "undefined". let hoists into TDZ → reading throws ReferenceError, even via typeof.',
      },
    },
    {
      prompt: 'Which scope does a var declaration leak to?',
      validator: {
        kind: 'predict',
        options: ['Block scope', 'Function scope', 'Module scope', 'Global scope'],
        correct: 1,
        explanation: 'var is function-scoped — it ignores `{}` blocks and lives until the end of the enclosing function (or globally if declared at top level).',
      },
    },
  ],

  hoisting: [
    {
      prompt: 'Implement fnVsExpr(): show that a function declaration is callable before its line, but a function expression assigned via var is not. Return a 2-tuple [declarationWorks, expressionWorks] of booleans.',
      hint: 'Try-catch around each call. The function declaration is fully hoisted; the var expression hoists only the binding (undefined).',
      validator: {
        kind: 'code',
        starter: `function fnVsExpr() {
  // Call declared() before its declaration — should work.
  // Call expr() before its assignment — should throw (expr is undefined).
  // Return [declarationWorks, expressionWorks]
  // TODO
}`,
        cases: [
          { call: 'JSON.stringify(fnVsExpr())', expected: '[true,false]', label: '[declared works, expression works]' },
        ],
        explanation: '`function name() {}` is hoisted with body. `var name = function () {}` hoists `name` as undefined; calling undefined throws TypeError.',
      },
    },
    {
      prompt: 'Implement classicForBug(): given that pushing arrow callbacks inside a `var i` loop captures the SAME i, refactor so each callback returns its own iteration index. Return the array of those values.',
      hint: 'Switch to `let`, or wrap each iteration in an IIFE that captures the current i.',
      validator: {
        kind: 'code',
        starter: `function classicForBug() {
  const fns = [];
  for (var i = 0; i < 5; i++) {
    fns.push(() => i);
  }
  return fns.map((f) => f());
}`,
        cases: [
          { call: 'JSON.stringify(classicForBug())', expected: '[0,1,2,3,4]', label: 'each closure sees its own i' },
        ],
        explanation: 'Change `var i` to `let i` — let creates a fresh binding each iteration so each arrow closes over its own copy.',
      },
    },
    {
      prompt: 'Implement classDeclTDZ(): show that a class declaration is in TDZ until its line. Return "caught" if reading the class before its declaration throws, otherwise "leaked".',
      hint: 'class declarations behave like let — hoisted but uninitialised.',
      validator: {
        kind: 'code',
        starter: `function classDeclTDZ() {
  // Reference \`C\` before its declaration line, in a try/catch.
  // TODO
  class C {}
}`,
        cases: [
          { call: 'classDeclTDZ()', expected: 'caught', label: 'class is TDZ-hoisted' },
        ],
        explanation: 'class declarations are hoisted into TDZ — touching them before the declaration line throws ReferenceError.',
      },
    },
    {
      prompt: 'Which of these is hoisted with its initializer (i.e., usable above its source line)?',
      validator: {
        kind: 'predict',
        options: ['var', 'let', 'const', 'function declaration'],
        correct: 3,
        explanation: 'Only function declarations are fully hoisted with their bodies. var hoists with undefined (not usable as a function). let/const live in TDZ.',
      },
    },
  ],

  'lexical-scope': [
    {
      prompt: 'Implement makeAdder(x): return a function y => x + y. The returned function must close over x.',
      validator: {
        kind: 'code',
        starter: `function makeAdder(x) {
  // TODO: return a function that takes y and returns x + y.
}`,
        cases: [
          { call: 'makeAdder(2)(3)', expected: 5, label: 'adder(2)(3) = 5' },
          { call: 'makeAdder(10)(-4)', expected: 6, label: 'adder(10)(-4) = 6' },
          { call: 'makeAdder(0)(0)', expected: 0, label: 'adder(0)(0) = 0' },
        ],
        explanation: 'The inner function captures x by reference. Each call to makeAdder creates a fresh environment.',
      },
    },
    {
      prompt: 'Implement makeBank(): return { deposit, balance } sharing a single private balance variable. balance() reads it; deposit(n) adds n and returns the new balance.',
      validator: {
        kind: 'code',
        starter: `function makeBank() {
  // TODO: a private balance + two functions over it.
}`,
        cases: [
          { call: '(() => { const b = makeBank(); b.deposit(10); b.deposit(5); return b.balance(); })()', expected: 15, label: 'two deposits' },
          { call: '(() => { const b = makeBank(); return b.balance(); })()', expected: 0, label: 'starts at 0' },
          { call: '(() => { const a = makeBank(); const b = makeBank(); a.deposit(100); return b.balance(); })()', expected: 0, label: 'instances are isolated' },
        ],
        explanation: 'Two functions returned from one call share one closed-over variable. Two calls produce two independent environments.',
      },
    },
    {
      prompt: 'Implement renamingDemo(): inside a nested function, a local variable shadows the outer one. Return the inner value (so the inner shadowing wins).',
      validator: {
        kind: 'code',
        starter: `const name = 'outer';
function renamingDemo() {
  const name = 'inner';
  // TODO: return name
}`,
        cases: [
          { call: 'renamingDemo()', expected: 'inner', label: 'shadowing wins' },
        ],
        explanation: 'Lookup starts in the innermost scope. The inner `name` shadows the module-level one.',
      },
    },
    {
      prompt: 'Lexical scope means a function\'s variable resolution is determined by:',
      validator: {
        kind: 'predict',
        options: ['Where it is called from', 'Where it is declared', 'The current value of `this`', 'The prototype chain'],
        correct: 1,
        explanation: 'Lexical = static. The compiler decides scope at parse time based on where the function appears in the source, not where the call happens.',
      },
    },
  ],

  closures: [
    {
      prompt: 'Implement makeCounter(): return { inc, dec, get } sharing one private count starting at 0. Each instance must be isolated.',
      validator: {
        kind: 'code',
        starter: `function makeCounter() {
  // TODO
}`,
        cases: [
          { call: '(() => { const c = makeCounter(); c.inc(); c.inc(); c.inc(); c.dec(); return c.get(); })()', expected: 2, label: '+3 -1 = 2' },
          { call: '(() => { const a = makeCounter(); const b = makeCounter(); a.inc(); a.inc(); return b.get(); })()', expected: 0, label: 'isolation' },
        ],
        explanation: 'The three closures share one count per call to makeCounter. Each call produces its own environment.',
      },
    },
    {
      prompt: 'Implement once(fn): wrap fn so it runs only the first time. Subsequent calls return the cached value without calling fn again.',
      hint: 'Use a boolean flag and a cached value in a closure.',
      validator: {
        kind: 'code',
        starter: `function once(fn) {
  // TODO
}`,
        cases: [
          {
            call: '(() => { let n = 0; const f = once(() => ++n); return [f(), f(), f(), n]; })()',
            expected: [1, 1, 1, 1],
            label: 'returns cached value; fn only runs once',
          },
        ],
        explanation: 'Cache `called` and `result` in the closure; on subsequent calls, return the cached result without invoking fn.',
      },
    },
    {
      prompt: 'Implement curry3(fn): given a 3-arity fn, return a curried version. curry3((a,b,c) => a+b+c)(1)(2)(3) === 6.',
      hint: 'Each call returns a new function until 3 arguments are collected.',
      validator: {
        kind: 'code',
        starter: `function curry3(fn) {
  // TODO
}`,
        cases: [
          { call: 'curry3((a, b, c) => a + b + c)(1)(2)(3)', expected: 6, label: '1+2+3' },
          { call: 'curry3((a, b, c) => a * b - c)(2)(5)(1)', expected: 9, label: '2*5-1' },
        ],
        explanation: '`fn => a => b => c => fn(a, b, c)` — each arrow closes over the previously-collected args.',
      },
    },
    {
      prompt: 'A closure keeps its outer scope alive in memory for as long as the closure is reachable. True or false?',
      validator: {
        kind: 'predict',
        options: ['True', 'False'],
        correct: 0,
        explanation: 'Yes — that\'s exactly what enables shared state across calls. It\'s also a memory-leak vector: a long-lived closure pins large captured objects.',
      },
    },
  ],

  iife: [
    {
      prompt: 'Implement moduleViaIIFE(): use an IIFE to create a private store, returning { set(k, v), get(k) }. Setting and then getting must work for any key.',
      validator: {
        kind: 'code',
        starter: `const moduleViaIIFE = (function () {
  // TODO: private store, return { set, get }
})();`,
        cases: [
          { call: '(() => { moduleViaIIFE.set("a", 1); moduleViaIIFE.set("b", 2); return moduleViaIIFE.get("a") + moduleViaIIFE.get("b"); })()', expected: 3, label: 'set then get' },
          { call: 'moduleViaIIFE.get("missing")', expected: undefined, label: 'unset → undefined' },
        ],
        explanation: 'The IIFE executes once; the returned object closes over a private object that the outside world can\'t touch directly.',
      },
    },
    {
      prompt: 'Implement asyncIIFE(): use an async IIFE that resolves to "ok" after a microtask, and return that value. The function itself should return a Promise.',
      hint: '(async () => "ok")() returns a Promise.',
      validator: {
        kind: 'code',
        starter: `function asyncIIFE() {
  // TODO: return the result of an immediately-invoked async function.
}`,
        cases: [
          { call: 'asyncIIFE()', expected: 'ok', label: 'async IIFE resolves' },
        ],
        explanation: 'The async IIFE pattern was useful before top-level await — it lets you await inside a synchronous-looking block.',
      },
    },
    {
      prompt: 'Implement makeSecret(): use an IIFE that returns a function. The function returns the IIFE\'s private string "secret". Calling makeSecret() must return that function, not invoke it.',
      validator: {
        kind: 'code',
        starter: `function makeSecret() {
  // TODO: return a function (not the result of calling it)
}`,
        cases: [
          { call: 'typeof makeSecret()', expected: 'function', label: 'returns a function' },
          { call: 'makeSecret()()', expected: 'secret', label: 'invoking it yields the secret' },
        ],
        explanation: 'The IIFE provides the private scope; the returned function is the API.',
      },
    },
    {
      prompt: 'In ES modules, are IIFEs still strictly necessary for encapsulation?',
      validator: {
        kind: 'predict',
        options: ['Yes — always', 'No — each module file is already a private scope', 'Only in browsers', 'Only in Node'],
        correct: 1,
        explanation: 'Every ES module has its own scope by default. let/const + block scope cover the rest. IIFEs are mostly historical now.',
      },
    },
  ],

  // ============================================================
  // SECTION 2 — Types, Equality & Coercion
  // ============================================================
  'primitives-vs-references': [
    {
      prompt: 'Implement cloneShallow(obj): return a new object with the same enumerable own keys/values. The returned object must NOT be === to the input.',
      validator: {
        kind: 'code',
        starter: `function cloneShallow(obj) {
  // TODO
}`,
        cases: [
          { call: '(() => { const o = { a: 1, b: 2 }; const c = cloneShallow(o); return c !== o && c.a === 1 && c.b === 2; })()', expected: true, label: 'new object, same own keys' },
          { call: '(() => { const o = { nested: { x: 1 } }; const c = cloneShallow(o); return c.nested === o.nested; })()', expected: true, label: 'shallow — nested still shared' },
        ],
        explanation: '`{ ...obj }` or `Object.assign({}, obj)` — both are shallow copies. Nested object references are shared, which is the defining property of "shallow".',
      },
    },
    {
      prompt: 'Implement sharedRefBug(): call f(arr = []) twice with default param, push a value each time, return [result1, result2]. Each call must start with a fresh empty array (no shared default).',
      hint: 'Default parameter expressions are evaluated each call — unlike Python.',
      validator: {
        kind: 'code',
        starter: `function sharedRefBug() {
  function f(arr = []) {
    arr.push(1);
    return arr;
  }
  // TODO: call f() twice and return both results
}`,
        cases: [
          { call: 'JSON.stringify(sharedRefBug())', expected: '[[1],[1]]', label: 'two independent arrays' },
        ],
        explanation: 'JS evaluates default-parameter expressions on each call, so `arr = []` is a fresh array every time — no Python-style mutable-default footgun.',
      },
    },
    {
      prompt: 'Implement passByValueDemo(): show that reassigning a parameter inside a function does NOT change the caller\'s variable, even for objects. Return the caller\'s object after the function tried to reassign.',
      validator: {
        kind: 'code',
        starter: `function passByValueDemo() {
  const o = { tag: 'original' };
  function reassign(x) { x = { tag: 'fresh' }; }
  reassign(o);
  // TODO: return o.tag
}`,
        cases: [
          { call: 'passByValueDemo()', expected: 'original', label: 'reassignment is local' },
        ],
        explanation: 'JS passes a copy of the reference. The function\'s parameter is a separate variable; reassigning it doesn\'t affect the caller\'s binding (though mutation would).',
      },
    },
    {
      prompt: 'typeof null returns:',
      validator: {
        kind: 'predict',
        options: ['"null"', '"undefined"', '"object"', '"reference"'],
        correct: 2,
        explanation: 'A historical bug from the very first JS implementation, preserved for web compatibility. Use `value === null` to check.',
      },
    },
  ],

  equality: [
    {
      prompt: 'Implement looseTruthTable(): return [null == undefined, 0 == "", "0" == false, NaN == NaN, [] == false].',
      validator: {
        kind: 'code',
        starter: `function looseTruthTable() {
  // TODO: compute the five booleans directly using ==.
}`,
        cases: [
          { call: 'JSON.stringify(looseTruthTable())', expected: '[true,true,true,false,true]', label: 'classic == surprises' },
        ],
        explanation: 'null == undefined is true (special case). 0 == "" coerces "" to 0. "0" == false coerces both to 0. NaN never equals itself. [] coerces to "" which coerces to 0 which equals false.',
      },
    },
    {
      prompt: 'Implement sameValue(a, b): like ===, but returns true for sameValue(NaN, NaN). Treat +0 and -0 as equal (use === semantics for that).',
      hint: 'Handle NaN explicitly; otherwise return a === b.',
      validator: {
        kind: 'code',
        starter: `function sameValue(a, b) {
  // TODO
}`,
        cases: [
          { call: 'sameValue(NaN, NaN)', expected: true, label: 'NaN equals NaN' },
          { call: 'sameValue(1, 1)', expected: true, label: 'numbers' },
          { call: 'sameValue("a", "a")', expected: true, label: 'strings' },
          { call: 'sameValue({}, {})', expected: false, label: 'objects by identity' },
          { call: 'sameValue(0, -0)', expected: true, label: '+0 equals -0 (=== semantics)' },
        ],
        explanation: 'A === B for everything except NaN, which needs a Number.isNaN check on both sides.',
      },
    },
    {
      prompt: 'Implement objectIsDiffers(): return [Object.is(NaN, NaN), Object.is(+0, -0), Object.is(1, 1)]. This shows the two places Object.is differs from ===.',
      validator: {
        kind: 'code',
        starter: `function objectIsDiffers() {
  // TODO
}`,
        cases: [
          { call: 'JSON.stringify(objectIsDiffers())', expected: '[true,false,true]', label: 'NaN, ±0, equal numbers' },
        ],
        explanation: 'Object.is(NaN, NaN) = true (=== returns false). Object.is(+0, -0) = false (=== returns true). Everything else matches ===.',
      },
    },
    {
      prompt: 'The single defensible idiom for using == in modern code is:',
      validator: {
        kind: 'predict',
        options: [
          'value == 0 — to also match "0"',
          'value == null — to match both null AND undefined',
          'value == false — to check truthiness',
          'There is no defensible use of ==',
        ],
        correct: 1,
        explanation: '`value == null` is true for both null and undefined and false for everything else. Many style guides allow this one idiom; others ban == entirely.',
      },
    },
  ],

  nan: [
    {
      prompt: 'Implement isNaNSafe(v): return true iff v is the value NaN. Do NOT use the global isNaN — it coerces.',
      hint: 'Number.isNaN does NOT coerce. Or use v !== v (only NaN is not equal to itself).',
      validator: {
        kind: 'code',
        starter: `function isNaNSafe(v) {
  // TODO
}`,
        cases: [
          { call: 'isNaNSafe(NaN)', expected: true, label: 'NaN' },
          { call: 'isNaNSafe(123)', expected: false, label: 'number' },
          { call: 'isNaNSafe("abc")', expected: false, label: 'string (not coerced)' },
          { call: 'isNaNSafe(undefined)', expected: false, label: 'undefined' },
        ],
        explanation: 'The global isNaN coerces its argument to a number first, so isNaN("abc") is true. Number.isNaN — or the self-inequality trick — is the right check.',
      },
    },
    {
      prompt: 'Implement safeParseInt(s): return the parsed integer if valid, or null if the result would be NaN.',
      validator: {
        kind: 'code',
        starter: `function safeParseInt(s) {
  // TODO
}`,
        cases: [
          { call: 'safeParseInt("42")', expected: 42, label: 'plain integer' },
          { call: 'safeParseInt("3.7")', expected: 3, label: 'parseInt truncates' },
          { call: 'safeParseInt("abc")', expected: null, label: 'NaN → null' },
          { call: 'safeParseInt("12abc")', expected: 12, label: 'greedy parse' },
        ],
        explanation: 'parseInt returns NaN for fully-invalid input but greedily parses prefixes. Check with Number.isNaN; return null for NaN.',
      },
    },
    {
      prompt: 'Implement nanProducer(): return the result of 0/0. The result must be NaN (verifiable with Number.isNaN).',
      validator: {
        kind: 'code',
        starter: `function nanProducer() {
  // TODO: return something that satisfies Number.isNaN(...) === true
}`,
        cases: [
          { call: 'Number.isNaN(nanProducer())', expected: true, label: 'returns NaN' },
        ],
        explanation: 'Any "impossible" arithmetic — 0/0, Math.sqrt(-1), undefined + 1 — produces NaN.',
      },
    },
    {
      prompt: 'typeof NaN returns:',
      validator: {
        kind: 'predict',
        options: ['"NaN"', '"number"', '"object"', '"undefined"'],
        correct: 1,
        explanation: 'NaN is a number (IEEE 754) — a number-shaped sentinel for "not a representable result". That\'s the source of most of its weirdness.',
      },
    },
  ],

  'truthy-falsy': [
    {
      prompt: 'Implement allFalsy(): return an array containing exactly the eight primitive falsy values in this order: false, 0, -0, 0n, "", null, undefined, NaN. Don\'t include 0n if BigInt is unavailable — wrap in a try/catch.',
      validator: {
        kind: 'code',
        starter: `function allFalsy() {
  // TODO
}`,
        cases: [
          { call: '(() => { const f = allFalsy(); return f.length === 8 && f.every((v) => !v); })()', expected: true, label: 'exactly 8 falsy values' },
        ],
        explanation: 'The complete falsy list. Note: arrays and objects (including empty ones) are truthy — only primitives appear here.',
      },
    },
    {
      prompt: 'Implement defaultArg(v, fallback): return v when v is defined and not null, otherwise return fallback. Crucially, 0, "", and false must NOT trigger the fallback.',
      hint: 'The ?? operator does exactly this.',
      validator: {
        kind: 'code',
        starter: `function defaultArg(v, fallback) {
  // TODO
}`,
        cases: [
          { call: 'defaultArg(0, 99)', expected: 0, label: '0 kept' },
          { call: 'defaultArg("", "x")', expected: '', label: 'empty string kept' },
          { call: 'defaultArg(false, true)', expected: false, label: 'false kept' },
          { call: 'defaultArg(null, "fallback")', expected: 'fallback', label: 'null replaced' },
          { call: 'defaultArg(undefined, "fallback")', expected: 'fallback', label: 'undefined replaced' },
        ],
        explanation: '|| would replace 0, "", and false. ?? only replaces null/undefined — exactly the boundary we want.',
      },
    },
    {
      prompt: 'Implement filterTruthy(values): return only the truthy values, preserving order. Use Boolean as the predicate.',
      validator: {
        kind: 'code',
        starter: `function filterTruthy(values) {
  // TODO
}`,
        cases: [
          { call: 'JSON.stringify(filterTruthy([0, 1, "", "a", null, undefined, NaN, false, true]))', expected: '[1,"a",true]', label: 'falsies dropped' },
          { call: 'JSON.stringify(filterTruthy([]))', expected: '[]', label: 'empty stays empty' },
        ],
        explanation: '`arr.filter(Boolean)` — Boolean as a callable coerces to true/false using truthiness, which is what we want.',
      },
    },
    {
      prompt: 'Is `[]` (empty array) truthy or falsy?',
      validator: {
        kind: 'predict',
        options: ['Truthy', 'Falsy'],
        correct: 0,
        explanation: 'All objects are truthy, including empty arrays and empty objects. Only primitives populate the falsy list. To check emptiness, use `arr.length === 0`.',
      },
    },
  ],

  // ============================================================
  // SECTION 3 — Functions, this & Prototypes
  // ============================================================
  'function-flavors': [
    {
      prompt: 'Implement threeAdds(): return [declared, expression, arrow] — three forms of (a, b) => a + b. Verify all three return 5 for (2, 3) in the test cases.',
      validator: {
        kind: 'code',
        starter: `function threeAdds() {
  // TODO: build three functions and return them in an array.
}`,
        cases: [
          { call: 'threeAdds().every((f) => f(2, 3) === 5)', expected: true, label: 'all three agree' },
          { call: 'threeAdds().length', expected: 3, label: 'three forms' },
        ],
        explanation: 'Same behavior, different syntax. Arrow ≠ function for this binding, but for pure add() they\'re interchangeable.',
      },
    },
    {
      prompt: 'Implement arrowsNoOwnThis(): show that .call() can override `this` for a regular function but not for an arrow. Build a regular fn that returns this.tag and an arrow that returns this?.tag. Call each with .call({ tag: "set" }). Return [regular, arrow] — regular should be "set", arrow should be undefined.',
      hint: 'Arrows capture `this` lexically — .call/.apply/.bind cannot change it.',
      validator: {
        kind: 'code',
        starter: `function arrowsNoOwnThis() {
  // TODO: define a regular function and an arrow function,
  // both reading this?.tag. Call each with .call({ tag: 'set' }).
  // Return [regularResult, arrowResult].
}`,
        cases: [
          { call: 'JSON.stringify(arrowsNoOwnThis())', expected: '["set",null]', label: '.call wins for regular, loses for arrow' },
        ],
        explanation: '.call/.apply/.bind override `this` for regular functions only. Arrows have no own this — they inherit from the enclosing scope, which at the module level is undefined (strict mode).',
      },
    },
    {
      prompt: 'Implement arrowMethodTrap(obj): given an object with a regular method `getName()` returning `this.name`, build a parallel arrow-property method that captures `this` lexically (so it returns `undefined` since arrows have no own this when at the module level inside this task). Return [methodResult, arrowResult].',
      validator: {
        kind: 'code',
        starter: `function arrowMethodTrap() {
  const obj = {
    name: 'ada',
    asMethod() { return this.name; },
    asArrow: () => (typeof globalThis !== 'undefined' && globalThis.name) || undefined,
  };
  // TODO: return [obj.asMethod(), obj.asArrow()]
}`,
        cases: [
          { call: 'JSON.stringify(arrowMethodTrap())', expected: '["ada",null]', label: 'method=ada, arrow=undefined→null' },
        ],
        explanation: 'Arrow properties on object literals ignore the object as `this`. They inherit `this` from the enclosing lexical scope.',
      },
    },
    {
      prompt: 'Arrow functions can be used with new (e.g., `new (() => {})()`):',
      validator: {
        kind: 'predict',
        options: ['True', 'False'],
        correct: 1,
        explanation: 'Arrow functions are not constructable. They have no [[Construct]] internal method and no `prototype` property. `new (() => {})()` throws TypeError.',
      },
    },
  ],

  'this-binding': [
    {
      prompt: 'Implement lostBinding(): show that detaching a method from its object loses `this`. Return [boundResult, detachedResult] — boundResult should be the object\'s name; detachedResult should be the string "lost" (caught the TypeError).',
      validator: {
        kind: 'code',
        starter: `function lostBinding() {
  const obj = { name: 'ada', greet() { return this.name; } };
  const detached = obj.greet;
  // TODO: call obj.greet() and detached(); on TypeError, return 'lost'.
}`,
        cases: [
          { call: 'JSON.stringify(lostBinding())', expected: '["ada","lost"]', label: 'detachment loses this' },
        ],
        explanation: 'Implicit binding is decided at call time. detached() is a plain function call — this is undefined in strict mode, so this.name throws.',
      },
    },
    {
      prompt: 'Implement bindingFix(): write a Counter class such that passing c.inc to setTimeout still increments the instance. Use any of: bind in constructor, arrow class field, or wrap at the call site. The case calls c.inc.bind(c) — your code must keep c.count consistent.',
      hint: 'Class fields with arrow functions auto-bind `this` at construction.',
      validator: {
        kind: 'code',
        starter: `class Counter {
  count = 0;
  // TODO: make inc keep working when detached
  inc() { this.count++; }
}
function bindingFix() {
  const c = new Counter();
  const fn = c.inc;
  // Either call fn(); (with arrow class field) or call c.inc.bind(c)() etc.
  // After two safe increments, return c.count.
  // TODO
}`,
        cases: [
          { call: 'bindingFix()', expected: 2, label: 'two safe increments → count 2' },
        ],
        explanation: 'The simplest fix: `inc = () => { this.count++; }` as a class field — `this` is captured at construction.',
      },
    },
    {
      prompt: 'Implement explicitThis(): use call() to invoke a function with a manually-supplied this. The function reads this.label and returns it. Provide thisArg = { label: "manual" }.',
      validator: {
        kind: 'code',
        starter: `function explicitThis() {
  function getLabel() { return this.label; }
  // TODO: call getLabel with thisArg = { label: 'manual' }
}`,
        cases: [
          { call: 'explicitThis()', expected: 'manual', label: 'call overrides this' },
        ],
        explanation: 'fn.call(thisArg, ...args) runs fn immediately with this bound to thisArg.',
      },
    },
    {
      prompt: 'Inside a function called as a plain `fn()` (no method, no new, no bind), what is `this` in strict mode?',
      validator: {
        kind: 'predict',
        options: ['The global object', 'The function itself', 'undefined', 'null'],
        correct: 2,
        explanation: 'In strict mode (and inside modules, which are always strict), the default binding is undefined. In sloppy mode it would be the global object — that footgun is why strict mode tightened it.',
      },
    },
  ],

  'call-apply-bind': [
    {
      prompt: 'Implement myCall(fn, thisArg, ...args): call fn with `this` set to thisArg, args spread. Don\'t use Function.prototype.call internally.',
      hint: 'Attach fn temporarily as a property of thisArg, call it, then delete.',
      validator: {
        kind: 'code',
        starter: `function myCall(fn, thisArg, ...args) {
  // TODO
}`,
        cases: [
          { call: 'myCall(function () { return this.x; }, { x: 7 })', expected: 7, label: 'reads this' },
          { call: 'myCall(function (a, b) { return a + b; }, null, 2, 3)', expected: 5, label: 'spreads args' },
        ],
        explanation: 'A common interview implementation: `const key = Symbol(); thisArg[key] = fn; const r = thisArg[key](...args); delete thisArg[key]; return r;`.',
      },
    },
    {
      prompt: 'Implement myApply(fn, thisArg, argsArray): same as myCall but argsArray is an array, not rest args.',
      validator: {
        kind: 'code',
        starter: `function myApply(fn, thisArg, argsArray) {
  // TODO
}`,
        cases: [
          { call: 'myApply(function (a, b, c) { return a + b + c; }, null, [1, 2, 3])', expected: 6, label: 'array of args' },
          { call: 'myApply(function () { return this.tag; }, { tag: "ok" }, [])', expected: 'ok', label: 'reads this' },
        ],
        explanation: 'apply is identical to call except for how arguments are passed. Pre-spread, this was the way to forward dynamic argument lists.',
      },
    },
    {
      prompt: 'Implement myBind(fn, thisArg, ...partials): return a new function that, when called, invokes fn with this bound to thisArg and partials prepended to the call-site args.',
      validator: {
        kind: 'code',
        starter: `function myBind(fn, thisArg, ...partials) {
  // TODO
}`,
        cases: [
          { call: 'myBind(function () { return this.x; }, { x: 42 })()', expected: 42, label: 'binds this' },
          { call: 'myBind((a, b, c) => a + b + c, null, 1, 2)(3)', expected: 6, label: 'partial application' },
        ],
        explanation: '`function (...later) { return fn.call(thisArg, ...partials, ...later); }` — bind returns a new function, doesn\'t invoke immediately.',
      },
    },
    {
      prompt: '`bind` returns a new function. True or false?',
      validator: {
        kind: 'predict',
        options: ['True', 'False'],
        correct: 0,
        explanation: 'bind is the only one of the three that doesn\'t invoke. It produces a permanently this-bound (and optionally partially applied) new function — calling that runs the original.',
      },
    },
  ],

  prototypes: [
    {
      prompt: 'Implement Animal(name) as a constructor function with Animal.prototype.speak() returning `${name} makes a sound`. The case verifies via new Animal("Ada").speak().',
      validator: {
        kind: 'code',
        starter: `function Animal(name) {
  // TODO: set this.name = name
}
// TODO: attach speak() to Animal.prototype`,
        cases: [
          { call: 'new Animal("Ada").speak()', expected: 'Ada makes a sound', label: 'speak reads this.name' },
          { call: 'new Animal("Rex").speak()', expected: 'Rex makes a sound', label: 'reuses prototype method' },
          { call: 'new Animal("a").speak === new Animal("b").speak', expected: true, label: 'method is shared, not duplicated' },
        ],
        explanation: '`new` sets the instance\'s [[Prototype]] to Animal.prototype, so speak is found via the prototype chain — one function, all instances.',
      },
    },
    {
      prompt: 'Implement makeChain(): create constructors A and B with B.prototype linked to A.prototype, such that `new B()` is `instanceof B` AND `instanceof A`. Return [bIsB, bIsA].',
      validator: {
        kind: 'code',
        starter: `function makeChain() {
  function A() {}
  function B() {}
  // TODO: link B.prototype to A.prototype
  const b = new B();
  return [b instanceof B, b instanceof A];
}`,
        cases: [
          { call: 'JSON.stringify(makeChain())', expected: '[true,true]', label: 'instanceof walks the chain' },
        ],
        explanation: '`B.prototype = Object.create(A.prototype)` — instanceof walks the prototype chain looking for the constructor\'s prototype object.',
      },
    },
    {
      prompt: 'Implement protoLookup(): create an object via Object.create(parent) where parent has a method greet(). The child overrides nothing. Return [child.greet === parent.greet, child.greet()] — the function is shared.',
      validator: {
        kind: 'code',
        starter: `function protoLookup() {
  const parent = { greet() { return 'hi'; } };
  const child = Object.create(parent);
  // TODO
}`,
        cases: [
          { call: 'JSON.stringify(protoLookup())', expected: '[true,"hi"]', label: 'lookup follows the chain' },
        ],
        explanation: 'Object.create(parent) makes parent the new object\'s [[Prototype]]. Reading greet finds it on parent — same function reference.',
      },
    },
    {
      prompt: 'Modifying Array.prototype affects which arrays?',
      validator: {
        kind: 'predict',
        options: [
          'Only arrays created after the modification',
          'All arrays in the realm — including pre-existing ones',
          'Only arrays in the current module',
          'Nothing — Array.prototype is frozen',
        ],
        correct: 1,
        explanation: 'Prototype lookup is late-bound. Existing arrays still link to Array.prototype, so adding (or replacing) a method there changes their behavior immediately — that\'s why monkey-patching builtins is dangerous.',
      },
    },
  ],

  'classes-over-prototypes': [
    {
      prompt: 'Implement class Counter with #count = 0 and an inc() method that increments and returns the new value. The method must live on Counter.prototype (not be a per-instance field).',
      validator: {
        kind: 'code',
        starter: `class Counter {
  // TODO: private #count, inc() method
}`,
        cases: [
          { call: 'new Counter().inc()', expected: 1, label: 'increments' },
          { call: '(() => { const c = new Counter(); c.inc(); c.inc(); return c.inc(); })()', expected: 3, label: 'multiple calls' },
          { call: 'new Counter().inc === Counter.prototype.inc', expected: true, label: 'method on prototype' },
        ],
        explanation: 'Methods declared with `name() {}` syntax inside a class land on the prototype — one function shared across instances.',
      },
    },
    {
      prompt: 'Implement class Dog extends Animal where Animal has speak() returning this.name and Dog\'s bark() calls super-equivalent via this.speak() + " barks".',
      validator: {
        kind: 'code',
        starter: `class Animal {
  constructor(name) { this.name = name; }
  speak() { return this.name; }
}
class Dog extends Animal {
  // TODO: bark() returns this.speak() + ' barks'
}`,
        cases: [
          { call: 'new Dog("Rex").bark()', expected: 'Rex barks', label: 'method on subclass' },
          { call: 'new Dog("Rex") instanceof Animal', expected: true, label: 'extends sets chain' },
          { call: 'new Dog("Rex").speak()', expected: 'Rex', label: 'inherited method' },
        ],
        explanation: 'extends links Dog.prototype to Animal.prototype. Methods inherited via the chain are usable as if defined locally.',
      },
    },
    {
      prompt: 'Implement class Box that uses a class field for `value`. Build two instances and confirm the field is per-instance. Return [a.value, b.value] after a.value = 1 and b.value = 2.',
      validator: {
        kind: 'code',
        starter: `class Box {
  value = 0;
}
function fieldsAreInstance() {
  const a = new Box();
  const b = new Box();
  // TODO: a.value = 1; b.value = 2; return [a.value, b.value]
}`,
        cases: [
          { call: 'JSON.stringify(fieldsAreInstance())', expected: '[1,2]', label: 'fields are per-instance' },
        ],
        explanation: 'Class fields are assigned to each instance in the constructor (conceptually). Methods are on the prototype, fields are on the instance.',
      },
    },
    {
      prompt: 'Under the hood, ES classes are:',
      validator: {
        kind: 'predict',
        options: [
          'A wholly new runtime type, separate from prototypes',
          'Syntactic sugar over prototype-based objects',
          'Compiled to C++ classes by V8',
          'Strictly typed like Java classes',
        ],
        correct: 1,
        explanation: 'class is sugar — methods land on the prototype, `new` does the same prototype-linking dance. The added features (private fields, static blocks) are real engine machinery, but the core is still prototypes.',
      },
    },
  ],

  'getters-setters': [
    {
      prompt: 'Implement class Temperature with a celsius getter/setter where setting celsius updates an internal #c and the fahrenheit getter computes from #c. Verify round-trip: setting 100 yields fahrenheit 212.',
      validator: {
        kind: 'code',
        starter: `class Temperature {
  // TODO: #c, get celsius, set celsius, get fahrenheit
}`,
        cases: [
          { call: '(() => { const t = new Temperature(); t.celsius = 100; return t.fahrenheit; })()', expected: 212, label: '100C → 212F' },
          { call: '(() => { const t = new Temperature(); t.celsius = 0; return t.fahrenheit; })()', expected: 32, label: '0C → 32F' },
        ],
        explanation: 'celsius is the source of truth; fahrenheit is computed each read. Getters/setters look like properties at the call site.',
      },
    },
    {
      prompt: 'Implement lazyValue(fn): return an object with a getter `value` that calls fn once on first read, caches the result, and returns the cache on subsequent reads. Verify fn is called exactly once across multiple reads.',
      validator: {
        kind: 'code',
        starter: `function lazyValue(fn) {
  // TODO: return { get value() { ... } }
}`,
        cases: [
          {
            call: '(() => { let n = 0; const l = lazyValue(() => { n++; return "x"; }); return [l.value, l.value, l.value, n]; })()',
            expected: ['x', 'x', 'x', 1],
            label: 'cached after first read',
          },
        ],
        explanation: 'Track a `computed` flag in closure. On first read, call fn and store; on later reads, return the stored value.',
      },
    },
    {
      prompt: 'Implement readOnlyView(obj): return an object exposing the same own enumerable string keys as obj, but where each is a getter (read-only). Setting on the view must silently fail (or throw in strict). Verify reading and that writing doesn\'t change the source.',
      hint: 'Object.defineProperty(view, k, { get: () => obj[k], enumerable: true }).',
      validator: {
        kind: 'code',
        starter: `function readOnlyView(obj) {
  // TODO
}`,
        cases: [
          {
            call: '(() => { const src = { a: 1, b: 2 }; const v = readOnlyView(src); return v.a + v.b; })()',
            expected: 3,
            label: 'reads pass through',
          },
          {
            call: '(() => { const src = { a: 1 }; const v = readOnlyView(src); try { v.a = 99; } catch {} return src.a; })()',
            expected: 1,
            label: 'writes do not mutate source',
          },
        ],
        explanation: 'defineProperty with a getter (and no setter) creates a read-only property. Strict-mode assignment throws; sloppy is silent.',
      },
    },
    {
      prompt: 'Vue 2\'s reactivity was implemented using:',
      validator: {
        kind: 'predict',
        options: [
          'Object.defineProperty with getters/setters',
          'Proxy',
          'Decorators',
          'WeakRef',
        ],
        correct: 0,
        explanation: 'Vue 2 wrapped every property in Object.defineProperty. Vue 3 moved to Proxy, which intercepts at the object level and supports new properties added after construction.',
      },
    },
  ],

  // ============================================================
  // SECTION 4 — Async JavaScript & The Event Loop
  // ============================================================
  'event-loop': [
    {
      prompt: 'Implement microVsMacro(): synchronously schedule setTimeout(() => console.log("macro"), 0), Promise.resolve().then(() => console.log("micro")), then console.log("sync"). Expected log order: sync, micro, macro.',
      hint: 'Microtasks (Promise.then) drain before the next macrotask (setTimeout).',
      validator: {
        kind: 'code',
        starter: `function microVsMacro() {
  // TODO
}`,
        cases: [
          {
            call: 'microVsMacro()',
            expected: undefined,
            expectedLogs: ['sync', 'micro', 'macro'],
            label: 'sync → micro → macro',
          },
        ],
        explanation: 'The synchronous log runs first. The Promise.then microtask drains before the next task. setTimeout fires last as a macrotask.',
      },
    },
    {
      prompt: 'Implement awaitIsMicro(): use await on a resolved promise, then log "after-await", and synchronously after the call log "sync". Expected logs: ["sync", "after-await"].',
      hint: 'Code after await runs as a microtask — so the synchronous follow-up runs first.',
      validator: {
        kind: 'code',
        starter: `async function awaitIsMicro() {
  // TODO: await Promise.resolve(); then console.log('after-await')
}`,
        cases: [
          {
            call: '(async () => { const p = awaitIsMicro(); console.log("sync"); await p; })()',
            expected: undefined,
            expectedLogs: ['sync', 'after-await'],
            label: 'sync continuation wins',
          },
        ],
        explanation: 'await pauses the async function and resumes as a microtask. The caller\'s synchronous code after invoking the async function runs first.',
      },
    },
    {
      prompt: 'Implement queueMicrotaskOrder(): synchronously call setTimeout for "T", queueMicrotask for "M", and console.log("S"). Expected logs: ["S", "M", "T"].',
      validator: {
        kind: 'code',
        starter: `function queueMicrotaskOrder() {
  // TODO
}`,
        cases: [
          {
            call: 'queueMicrotaskOrder()',
            expected: undefined,
            expectedLogs: ['S', 'M', 'T'],
            label: 'sync, microtask, macrotask',
          },
        ],
        explanation: 'queueMicrotask scheduling a microtask is the canonical way to insert work before the next render or macrotask.',
      },
    },
    {
      prompt: 'Which of these schedules a microtask (not a macrotask)?',
      validator: {
        kind: 'predict',
        options: ['setTimeout', 'setInterval', 'Promise.then', 'requestAnimationFrame'],
        correct: 2,
        explanation: 'Promise.then, .catch, .finally, queueMicrotask and MutationObserver all enqueue microtasks. setTimeout/setInterval/I-O are macrotasks; rAF is its own render-aligned callback.',
      },
    },
  ],

  promises: [
    {
      prompt: 'Implement delayThen(value, ms): return a Promise that resolves to value after ms milliseconds.',
      validator: {
        kind: 'code',
        starter: `function delayThen(value, ms) {
  // TODO
}`,
        cases: [
          { call: 'delayThen("ok", 30)', expected: 'ok', label: 'resolves with value' },
          { call: 'delayThen(42, 10)', expected: 42, label: 'number value' },
        ],
        explanation: '`new Promise(resolve => setTimeout(() => resolve(value), ms))` — the executor runs immediately; the resolution is deferred.',
      },
    },
    {
      prompt: 'Implement chain(): given p = Promise.resolve(3), chain .then(x => x + 1).then(x => x * 2) and return the final resolved value.',
      validator: {
        kind: 'code',
        starter: `function chain() {
  // TODO: return the result of the chain
}`,
        cases: [
          { call: 'chain()', expected: 8, label: '(3+1)*2' },
        ],
        explanation: '.then returns a new promise resolved with the handler\'s return value. Chaining transforms the value step by step.',
      },
    },
    {
      prompt: 'Implement adoptInner(): return a chain where one .then returns a Promise — the outer chain adopts (waits for) the inner promise. Final value should be "deep".',
      validator: {
        kind: 'code',
        starter: `function adoptInner() {
  // TODO: a Promise.resolve('seed') chain where one .then returns Promise.resolve('deep') (resolved later via a tick).
}`,
        cases: [
          { call: 'adoptInner()', expected: 'deep', label: 'inner promise adopted' },
        ],
        explanation: 'When a .then handler returns a thenable, the outer promise waits for it. This is what enables async pipelines without callback hell.',
      },
    },
    {
      prompt: 'A Promise that has settled (fulfilled or rejected) can later change state to the other. True or false?',
      validator: {
        kind: 'predict',
        options: ['True', 'False'],
        correct: 1,
        explanation: 'Settled is permanent. Once fulfilled or rejected, the state and value are immutable. Subsequent .then handlers see that settled state.',
      },
    },
  ],

  'async-await': [
    {
      prompt: 'Implement fetchUserName(id): given a mock `db = { find: async (id) => ({ name: "u" + id }) }`, await db.find(id) and return the name.',
      validator: {
        kind: 'code',
        starter: `async function fetchUserName(id) {
  const db = { find: async (i) => ({ name: 'u' + i }) };
  // TODO
}`,
        cases: [
          { call: 'fetchUserName(1)', expected: 'u1', label: 'await + property access' },
          { call: 'fetchUserName(42)', expected: 'u42', label: 'numeric id' },
        ],
        explanation: 'await pauses the function until the promise settles. The destructured value is the resolved object.',
      },
    },
    {
      prompt: 'Implement retry(fn, attempts): try fn() up to `attempts` times. Return the first successful resolved value. If all attempts fail, throw the last error.',
      validator: {
        kind: 'code',
        starter: `async function retry(fn, attempts) {
  // TODO
}`,
        cases: [
          {
            call: '(async () => { let n = 0; return await retry(async () => { n++; if (n < 3) throw new Error("nope"); return "ok"; }, 5); })()',
            expected: 'ok',
            label: 'succeeds on 3rd try',
          },
          {
            call: '(async () => { try { return await retry(async () => { throw new Error("boom"); }, 2); } catch (e) { return e.message; } })()',
            expected: 'boom',
            label: 'all attempts fail',
          },
        ],
        explanation: 'Wrap each attempt in try/catch; on the last one, rethrow.',
      },
    },
    {
      prompt: 'Implement timeSequentialVsParallel(): given an async wait(ms), return [seqMs, parMs] where seqMs is approximately the sum of three 30ms waits and parMs is approximately one 30ms wait. (Use Math.round(t/10)*10 to normalize.)',
      hint: 'for/await is sequential; Promise.all(map) is parallel.',
      validator: {
        kind: 'code',
        starter: `async function timeSequentialVsParallel() {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  // TODO: measure both; return [Math.round(seq/10)*10, Math.round(par/10)*10]
}`,
        cases: [
          {
            call: 'timeSequentialVsParallel().then(([s, p]) => s >= 80 && s <= 120 && p <= 60)',
            expected: true,
            label: 'sequential ≈ 90, parallel ≈ 30',
          },
        ],
        explanation: 'Sequential adds each wait to the total. Parallel pays only for the longest one. The most common async perf trap.',
      },
    },
    {
      prompt: 'An async function always returns:',
      validator: {
        kind: 'predict',
        options: ['undefined', 'A Promise', 'A generator', 'The first awaited value'],
        correct: 1,
        explanation: 'The return value (or thrown error) of an async function is wrapped in a Promise — even when the body has no await.',
      },
    },
  ],

  'async-error-handling': [
    {
      prompt: 'Implement safeJSON(s): return { ok: true, value } on parse success or { ok: false, error } on failure. The error field should be the thrown Error\'s message.',
      validator: {
        kind: 'code',
        starter: `async function safeJSON(s) {
  // TODO
}`,
        cases: [
          { call: 'safeJSON("[1,2,3]")', expected: { ok: true, value: [1, 2, 3] }, label: 'valid JSON' },
          { call: '(async () => { const r = await safeJSON("not-json"); return r.ok; })()', expected: false, label: 'invalid → ok:false' },
        ],
        explanation: 'Result-style returns are great when failure is expected control flow rather than an exception. Common in functional codebases.',
      },
    },
    {
      prompt: 'Implement causeChain(): catch an inner error and rethrow with `{ cause: original }`. The outer caller catches it and returns the cause\'s message.',
      validator: {
        kind: 'code',
        starter: `async function causeChain() {
  async function deep() { throw new Error('deep-failure'); }
  // TODO: try deep(); if it throws, throw new Error('wrapped', { cause: err }).
  // Then catch the wrapped error here and return its .cause.message.
}`,
        cases: [
          { call: 'causeChain()', expected: 'deep-failure', label: 'cause preserved' },
        ],
        explanation: 'Error cause (ES2022) is the standard way to chain errors. Stack traces in modern Node and Chrome surface the cause.',
      },
    },
    {
      prompt: 'Implement awaitTrap(): take a rejected Promise without a .catch attached, and demonstrate that wrapping its await in try/catch handles the rejection. Return the caught message.',
      validator: {
        kind: 'code',
        starter: `async function awaitTrap() {
  const rejecting = Promise.reject(new Error('caught-me'));
  // TODO: await it inside try/catch and return e.message
}`,
        cases: [
          { call: 'awaitTrap()', expected: 'caught-me', label: 'await + try/catch' },
        ],
        explanation: 'A rejected promise without .catch is an "unhandled rejection" — unless you await it inside try/catch, which converts the rejection into a thrown error.',
      },
    },
    {
      prompt: 'Promise.all rejects:',
      validator: {
        kind: 'predict',
        options: [
          'When all inputs reject',
          'When the first input rejects',
          'Never — it always resolves',
          'When the LAST input rejects',
        ],
        correct: 1,
        explanation: 'Promise.all rejects with the first rejection. Other inputs keep running but their results are discarded. Use Promise.allSettled when you want all outcomes.',
      },
    },
  ],

  'promise-combinators': [
    {
      prompt: 'Implement myPromiseAll(promises): resolve with an array of resolved values, reject with the first rejection reason. Don\'t use the built-in Promise.all.',
      hint: 'Track a counter and a results array. Resolve when the counter hits length; reject on the first failure.',
      validator: {
        kind: 'code',
        starter: `function myPromiseAll(promises) {
  // TODO
}`,
        cases: [
          { call: 'myPromiseAll([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)])', expected: [1, 2, 3], label: 'all resolved' },
          {
            call: '(async () => { try { await myPromiseAll([Promise.resolve(1), Promise.reject(new Error("x"))]); return "no-reject"; } catch (e) { return e.message; } })()',
            expected: 'x',
            label: 'first rejection wins',
          },
          { call: 'myPromiseAll([])', expected: [], label: 'empty resolves to []' },
        ],
        explanation: 'A classic interview implementation. The empty-input case resolves immediately to []. Order of the output array must match input, not settle order.',
      },
    },
    {
      prompt: 'Implement myPromiseAllSettled(promises): resolve with array of { status: "fulfilled"|"rejected", value|reason }. Never rejects.',
      validator: {
        kind: 'code',
        starter: `function myPromiseAllSettled(promises) {
  // TODO
}`,
        cases: [
          {
            call: 'myPromiseAllSettled([Promise.resolve(1), Promise.reject(new Error("x"))]).then(r => r.map(x => x.status))',
            expected: ['fulfilled', 'rejected'],
            label: 'reports each status',
          },
          {
            call: 'myPromiseAllSettled([Promise.resolve(7)]).then(r => r[0].value)',
            expected: 7,
            label: 'fulfilled has .value',
          },
        ],
        explanation: 'Each input gets a .then(value => ({status: "fulfilled", value})).catch(reason => ({status: "rejected", reason})). Then Promise.all the wrapped promises.',
      },
    },
    {
      prompt: 'Implement myPromiseRace(promises): resolve or reject with whichever input settles first.',
      validator: {
        kind: 'code',
        starter: `function myPromiseRace(promises) {
  // TODO
}`,
        cases: [
          {
            call: 'myPromiseRace([new Promise((r) => setTimeout(() => r("slow"), 50)), Promise.resolve("fast")])',
            expected: 'fast',
            label: 'resolves with fastest',
          },
        ],
        explanation: '`new Promise((resolve, reject) => promises.forEach(p => p.then(resolve, reject)))` — first settle wins. Loser promises keep running but are ignored.',
      },
    },
    {
      prompt: 'Promise.any([Promise.reject("a"), Promise.reject("b")]) rejects with:',
      validator: {
        kind: 'predict',
        options: ['"a"', '"b"', 'AggregateError', 'TypeError'],
        correct: 2,
        explanation: 'When every input rejects, Promise.any produces an AggregateError whose .errors property contains the individual reasons.',
      },
    },
  ],

  generators: [
    {
      prompt: 'Implement range(start, end): a generator that yields start..end-1.',
      validator: {
        kind: 'code',
        starter: `function* range(start, end) {
  // TODO
}`,
        cases: [
          { call: '[...range(2, 5)]', expected: [2, 3, 4], label: '[2..5)' },
          { call: '[...range(0, 0)]', expected: [], label: 'empty when start===end' },
          { call: '[...range(0, 3)]', expected: [0, 1, 2], label: 'from 0' },
        ],
        explanation: 'Generators yield lazily. Spread consumes until done is true.',
      },
    },
    {
      prompt: 'Implement fib(): infinite Fibonacci generator yielding 0, 1, 1, 2, 3, 5, 8, 13, …',
      validator: {
        kind: 'code',
        starter: `function* fib() {
  // TODO
}`,
        cases: [
          {
            call: '(() => { const g = fib(); return Array.from({ length: 8 }, () => g.next().value); })()',
            expected: [0, 1, 1, 2, 3, 5, 8, 13],
            label: 'first 8',
          },
        ],
        explanation: 'Two-variable swap inside a while(true): yield a; [a,b] = [b, a+b]. Without spread, infinite generators don\'t blow up — consumers pull lazily.',
      },
    },
    {
      prompt: 'Implement take(iterable, n): yield the first n values from iterable. Itself a generator.',
      validator: {
        kind: 'code',
        starter: `function* take(iterable, n) {
  // TODO
}`,
        cases: [
          { call: '[...take([0, 1, 2, 3, 4, 5], 3)]', expected: [0, 1, 2], label: 'take 3 from an array' },
          { call: '[...take([1, 2, 3, 4], 10)]', expected: [1, 2, 3, 4], label: 'fewer than n available' },
          { call: '[...take([], 5)]', expected: [], label: 'empty source' },
        ],
        explanation: 'Use for...of + a counter; break when you\'ve yielded n. take works on any iterable — arrays, strings, generators.',
      },
    },
    {
      prompt: 'Generators implement which protocol automatically?',
      validator: {
        kind: 'predict',
        options: ['Iterable + Iterator', 'AsyncIterable only', 'Disposable', 'Comparable'],
        correct: 0,
        explanation: 'A generator function\'s return value is BOTH iterable (has [Symbol.iterator]) and an iterator (has .next/.return/.throw). That\'s why you can spread/for-of/destructure them directly.',
      },
    },
  ],

  // ============================================================
  // SECTION 5 — Modern JS & Advanced Concepts
  // ============================================================
  'esm-vs-cjs': [
    {
      prompt: 'In ES modules, `this` at module top level is:',
      validator: {
        kind: 'predict',
        options: ['globalThis', 'undefined', 'module.exports', 'The first import'],
        correct: 1,
        explanation: 'ES modules are always strict, and module-top `this` is undefined. In CJS, top-level `this` is module.exports.',
      },
    },
    {
      prompt: '`import` statements at the top of an ES module are:',
      validator: {
        kind: 'predict',
        options: ['Synchronous, dynamic', 'Asynchronous, static', 'Synchronous, static', 'Asynchronous, dynamic'],
        correct: 1,
        explanation: 'In browsers, ESM loads asynchronously. The static form (top-level import) is required for tree-shaking; dynamic import() exists as a separate feature and returns a Promise.',
      },
    },
    {
      prompt: 'Tree-shaking removes unused exports. Which module format does it require?',
      validator: {
        kind: 'predict',
        options: [
          'CommonJS — bundlers analyse require() calls',
          'ES modules — static structure lets bundlers see exports',
          'Both — bundlers normalize',
          'Neither — tree-shaking works at the function level',
        ],
        correct: 1,
        explanation: 'Tree-shaking needs to know at build time which exports are used. ESM\'s static import/export structure provides that. CJS\'s dynamic require() can be conditional or computed, so the bundler can\'t prove an export is unused.',
      },
    },
    {
      prompt: 'A live binding (vs a snapshot) means:',
      validator: {
        kind: 'predict',
        options: [
          'The importer always sees the exporter\'s current value',
          'The importer gets a frozen copy at import time',
          'The exporter cannot reassign the binding',
          'The binding is wrapped in a Proxy',
        ],
        correct: 0,
        explanation: 'ESM exports are live bindings — read at use time, not at import time. CJS exports are values at the moment of require, so later changes by the exporter aren\'t visible.',
      },
    },
  ],

  'iteration-protocol': [
    {
      prompt: 'Implement makeIterable(arr): wrap an array into a plain object that has [Symbol.iterator]() yielding each element. Verify `[...wrapped]` equals the original array.',
      validator: {
        kind: 'code',
        starter: `function makeIterable(arr) {
  // TODO: return an object (not an array) with [Symbol.iterator]() that yields each element of arr.
}`,
        cases: [
          {
            call: '(() => { const w = makeIterable([1, 2, 3]); return [...w]; })()',
            expected: [1, 2, 3],
            label: 'spread works',
          },
          {
            call: '(() => { const w = makeIterable(["a"]); return Array.isArray(w); })()',
            expected: false,
            label: 'it is an object, not an array',
          },
        ],
        explanation: 'The iteration protocol only needs [Symbol.iterator]() to return an iterator (an object with .next()). Generators make this trivial.',
      },
    },
    {
      prompt: 'Implement zip(a, b): a generator that yields pairs [a[i], b[i]] until either iterable ends.',
      validator: {
        kind: 'code',
        starter: `function* zip(a, b) {
  // TODO
}`,
        cases: [
          {
            call: '[...zip([1, 2, 3], ["a", "b", "c"])]',
            expected: [[1, 'a'], [2, 'b'], [3, 'c']],
            label: 'equal lengths',
          },
          {
            call: '[...zip([1, 2, 3, 4], ["a", "b"])]',
            expected: [[1, 'a'], [2, 'b']],
            label: 'stop at shortest',
          },
        ],
        explanation: 'Pull iterators from each input, advance with .next(), break when either reports done.',
      },
    },
    {
      prompt: 'Implement enumerate(iterable): yield [index, value] pairs for each value of iterable.',
      validator: {
        kind: 'code',
        starter: `function* enumerate(iterable) {
  // TODO
}`,
        cases: [
          { call: '[...enumerate(["a", "b", "c"])]', expected: [[0, 'a'], [1, 'b'], [2, 'c']], label: 'over an array' },
          { call: '[...enumerate("hi")]', expected: [[0, 'h'], [1, 'i']], label: 'over a string' },
        ],
        explanation: 'Strings are iterable too — char by char. Generators compose nicely with the iteration protocol.',
      },
    },
    {
      prompt: 'Plain objects (created with `{}`) are iterable with for...of by default:',
      validator: {
        kind: 'predict',
        options: ['True', 'False'],
        correct: 1,
        explanation: 'Plain objects have no [Symbol.iterator]. for...of throws. Use Object.entries, .keys, or .values to get an iterable view.',
      },
    },
  ],

  'map-set': [
    {
      prompt: 'Implement wordCounts(text): split text by whitespace, lowercase each word, return a Map of word → count.',
      validator: {
        kind: 'code',
        starter: `function wordCounts(text) {
  // TODO: return a Map
}`,
        cases: [
          {
            call: '(() => { const m = wordCounts("The quick brown fox the lazy fox"); return [m.size, m.get("the"), m.get("fox")]; })()',
            expected: [5, 2, 2],
            label: '5 unique words, "the" and "fox" twice',
          },
          {
            call: '(() => { const m = wordCounts(""); return m.size; })()',
            expected: 0,
            label: 'empty input',
          },
        ],
        explanation: 'Split, lowercase, reduce into a Map. Map.get returns undefined for missing keys; you can use `(m.get(k) ?? 0) + 1`.',
      },
    },
    {
      prompt: 'Implement dedupe(arr): return a new array with duplicates removed, preserving the order of first occurrence.',
      validator: {
        kind: 'code',
        starter: `function dedupe(arr) {
  // TODO: implement with a Set
}`,
        cases: [
          { call: 'dedupe([1, 2, 2, 3, 1, 4])', expected: [1, 2, 3, 4], label: 'first occurrence wins' },
          { call: 'dedupe(["a", "b", "a"])', expected: ['a', 'b'], label: 'strings' },
          { call: 'dedupe([])', expected: [], label: 'empty' },
        ],
        explanation: '`[...new Set(arr)]` is the one-liner. Set preserves insertion order so the first occurrence stays.',
      },
    },
    {
      prompt: 'Implement objectKeyedCache(): return a function memo(obj, computer) that caches results keyed by the object reference, using a WeakMap. Verify same-reference reads return the cached value.',
      validator: {
        kind: 'code',
        starter: `function objectKeyedCache() {
  const cache = new WeakMap();
  return function memo(obj, computer) {
    // TODO
  };
}`,
        cases: [
          {
            call: '(() => { const memo = objectKeyedCache(); const k = {}; let n = 0; const f = () => ++n; return [memo(k, f), memo(k, f), memo(k, f), n]; })()',
            expected: [1, 1, 1, 1],
            label: 'computed once per key',
          },
          {
            call: '(() => { const memo = objectKeyedCache(); let n = 0; const f = () => ++n; memo({}, f); memo({}, f); return n; })()',
            expected: 2,
            label: 'different references → different cache entries',
          },
        ],
        explanation: 'WeakMap keys are GC\'d when the key object is collected, so the cache doesn\'t leak. Object identity is the key.',
      },
    },
    {
      prompt: 'Why prefer a Set over an Array for membership checks?',
      validator: {
        kind: 'predict',
        options: [
          'Set.has is O(1); Array.includes is O(n)',
          'Set has more methods',
          'Set is JSON-serializable; arrays are not',
          'Set is older and better-tested',
        ],
        correct: 0,
        explanation: 'Set.has is constant-time; Array.includes/indexOf is linear. At scale or in hot loops, that difference dominates.',
      },
    },
  ],

  symbols: [
    {
      prompt: 'Implement symbolKey(): create an object with a Symbol-keyed property "internal" set to "hidden". Return [Object.keys(obj).length, Object.getOwnPropertySymbols(obj).length, obj[symbol]].',
      validator: {
        kind: 'code',
        starter: `function symbolKey() {
  const tag = Symbol('internal');
  const obj = { [tag]: 'hidden', visible: 'shown' };
  // TODO: return the three values
}`,
        cases: [
          { call: 'JSON.stringify(symbolKey())', expected: '[1,1,"hidden"]', label: 'one string key, one symbol key, value reads correctly' },
        ],
        explanation: 'Symbol-keyed properties are NOT in Object.keys, for...in, or JSON.stringify. They surface only via Object.getOwnPropertySymbols.',
      },
    },
    {
      prompt: 'Implement makeUniqueSymbols(): return [Symbol("a") === Symbol("a"), Symbol.for("k") === Symbol.for("k")]. The first is false (every Symbol() is unique), the second is true (Symbol.for is a registry).',
      validator: {
        kind: 'code',
        starter: `function makeUniqueSymbols() {
  // TODO
}`,
        cases: [
          { call: 'JSON.stringify(makeUniqueSymbols())', expected: '[false,true]', label: 'Symbol() unique vs Symbol.for shared' },
        ],
        explanation: 'Symbol() always creates a fresh symbol — descriptions are informational. Symbol.for(k) maintains a global registry keyed by the string.',
      },
    },
    {
      prompt: 'Implement toPrimitiveDemo(): create a class whose instances coerce to "string-form" when converted to string, and to 100 when used as a number. Return [String(obj), obj + 0].',
      validator: {
        kind: 'code',
        starter: `function toPrimitiveDemo() {
  class T {
    [Symbol.toPrimitive](hint) {
      // TODO: handle 'string' and 'number'
    }
  }
  return [String(new T()), new T() + 0];
}`,
        cases: [
          { call: 'JSON.stringify(toPrimitiveDemo())', expected: '["string-form",100]', label: 'string vs number coercion' },
        ],
        explanation: 'Symbol.toPrimitive customises how an object converts. The hint is "string", "number", or "default".',
      },
    },
    {
      prompt: 'Symbol-keyed properties appear in JSON.stringify output:',
      validator: {
        kind: 'predict',
        options: ['Yes', 'No'],
        correct: 1,
        explanation: 'JSON.stringify ignores symbol-keyed properties (and functions and undefined values). Pair Symbols with toJSON if you need them serialized.',
      },
    },
  ],

  'es2020-plus': [
    {
      prompt: 'Implement getCity(user): return user.address.city using optional chaining and nullish coalescing. If anything is missing, return "unknown".',
      validator: {
        kind: 'code',
        starter: `function getCity(user) {
  // TODO
}`,
        cases: [
          { call: 'getCity({ address: { city: "Berlin" } })', expected: 'Berlin', label: 'full path' },
          { call: 'getCity({ address: {} })', expected: 'unknown', label: 'no city' },
          { call: 'getCity({})', expected: 'unknown', label: 'no address' },
          { call: 'getCity(null)', expected: 'unknown', label: 'null root' },
          { call: 'getCity(undefined)', expected: 'unknown', label: 'undefined root' },
        ],
        explanation: '`user?.address?.city ?? "unknown"` — optional chaining shortcircuits on null/undefined; ?? supplies the default.',
      },
    },
    {
      prompt: 'Implement nullishAssign(obj, key, value): set obj[key] to value ONLY if obj[key] is currently null or undefined. Return obj.',
      hint: 'Use the ??= operator.',
      validator: {
        kind: 'code',
        starter: `function nullishAssign(obj, key, value) {
  // TODO
}`,
        cases: [
          { call: 'nullishAssign({ x: 0 }, "x", 99)', expected: { x: 0 }, label: '0 is kept' },
          { call: 'nullishAssign({}, "x", 99)', expected: { x: 99 }, label: 'undefined → set' },
          { call: 'nullishAssign({ x: null }, "x", 99)', expected: { x: 99 }, label: 'null → set' },
          { call: 'nullishAssign({ x: "" }, "x", "fallback")', expected: { x: '' }, label: '"" is kept' },
        ],
        explanation: '`obj[key] ??= value` — assigns only when the current value is null/undefined.',
      },
    },
    {
      prompt: 'Implement lastOf(arr): return the last element using Array.prototype.at(-1). Empty array returns undefined.',
      validator: {
        kind: 'code',
        starter: `function lastOf(arr) {
  // TODO
}`,
        cases: [
          { call: 'lastOf([1, 2, 3])', expected: 3, label: 'last of three' },
          { call: 'lastOf([])', expected: undefined, label: 'empty → undefined' },
          { call: 'lastOf(["only"])', expected: 'only', label: 'single element' },
        ],
        explanation: '`arr.at(-1)` is cleaner than `arr[arr.length - 1]` and handles negative indices natively.',
      },
    },
    {
      prompt: 'Object.hasOwn(o, k) replaces:',
      validator: {
        kind: 'predict',
        options: [
          'o.hasOwnProperty(k)',
          'o.constructor.hasOwn(k)',
          'k in o',
          'typeof o[k] !== "undefined"',
        ],
        correct: 0,
        explanation: 'Object.hasOwn (ES2022) is a static method — it works for objects without a prototype (Object.create(null)) and for objects whose `hasOwnProperty` was shadowed.',
      },
    },
  ],

  // ============================================================
  // SECTION 6 — Memory, Performance & Senior Judgment
  // ============================================================
  'garbage-collection': [
    {
      prompt: 'Implement nullingFreesRef(): create a large array, hold a WeakRef to it, set the outer reference to null. Return [hadRefBefore, refStillExists] — the second is whatever ref.deref() returns (may be the object or undefined depending on GC timing; this just verifies the setup).',
      validator: {
        kind: 'code',
        starter: `function nullingFreesRef() {
  let big = new Array(1000).fill(0);
  const ref = new WeakRef(big);
  const before = ref.deref() !== undefined;
  big = null;
  // TODO: return [before, ref.deref() !== undefined]
}`,
        cases: [
          { call: 'nullingFreesRef()[0]', expected: true, label: 'reference visible before nulling' },
        ],
        explanation: 'WeakRef lets you observe an object without preventing its collection. Whether the deref returns the object after nulling depends on when GC runs — non-deterministic.',
      },
    },
    {
      prompt: 'Implement makeReachable(): return an object whose property `payload` is a function that closes over a large array. The closure keeps the array alive even after the outer variable is reassigned.',
      validator: {
        kind: 'code',
        starter: `function makeReachable() {
  let arr = new Array(100).fill('x');
  const obj = { payload: () => arr.length };
  arr = null; // outer ref dropped, but closure still holds it
  // TODO: return obj
}`,
        cases: [
          { call: 'makeReachable().payload()', expected: 100, label: 'closure still sees the array' },
        ],
        explanation: 'The closure captured the binding (not the value). Reassigning `arr` after the closure was created changes what `arr` points to, but the closure already grabbed the previous binding.',
      },
    },
    {
      prompt: 'Implement countReachable(): show that a cyclic reference (a → b → a) is still collected by a mark-and-sweep GC, because neither is reachable from a root. Sanity-check: the function just creates the cycle, drops both refs, and returns "ok".',
      validator: {
        kind: 'code',
        starter: `function countReachable() {
  let a = {};
  let b = {};
  a.b = b; b.a = a;
  a = null; b = null;
  // TODO: return 'ok'
}`,
        cases: [
          { call: 'countReachable()', expected: 'ok', label: 'cycle is collectable' },
        ],
        explanation: 'Reference counting can\'t free cycles; mark-and-sweep can, because the cycle is unreachable from roots. That\'s why modern JS engines abandoned pure refcounting.',
      },
    },
    {
      prompt: 'V8\'s GC algorithm family is best described as:',
      validator: {
        kind: 'predict',
        options: [
          'Reference counting',
          'Manual malloc/free with hints',
          'Generational mark-and-sweep with concurrent and parallel passes',
          'Arena allocation only',
        ],
        correct: 2,
        explanation: 'V8\'s Orinoco GC uses generations (young/nursery, old) and runs concurrently/in parallel to avoid stop-the-world pauses for long-lived applications.',
      },
    },
  ],

  'memory-leaks': [
    {
      prompt: 'Implement class Poller with start() that registers a setInterval and stop() that clears it. Verify start then stop leaves no further callbacks firing.',
      validator: {
        kind: 'code',
        starter: `class Poller {
  // TODO: id field, start(), stop()
}
async function timerLeakTest() {
  let ticks = 0;
  const p = new Poller();
  p.start(() => ticks++);
  await new Promise((r) => setTimeout(r, 80));
  p.stop();
  const afterStop = ticks;
  await new Promise((r) => setTimeout(r, 80));
  return ticks === afterStop; // no new ticks
}`,
        cases: [
          { call: 'timerLeakTest()', expected: true, label: 'stop halts ticks' },
        ],
        explanation: 'Every setInterval needs a matching clearInterval at end of life. Forgotten intervals are a leak source in SPAs and long-lived workers.',
      },
    },
    {
      prompt: 'Implement detached(node): hold a reference to a node in a "wrapper" object. Then write a release() method that nulls the reference. Verify that after release(), wrapper.node === null.',
      validator: {
        kind: 'code',
        starter: `function detached() {
  const node = { tag: 'fake-dom' };
  const wrapper = {
    node,
    release() {
      // TODO
    },
  };
  wrapper.release();
  return wrapper.node;
}`,
        cases: [
          { call: 'detached()', expected: null, label: 'release nulls the reference' },
        ],
        explanation: 'Detached DOM (real-world) is the same pattern: a JS object holds a reference to a node that was removed from the document. Nulling the reference frees both.',
      },
    },
    {
      prompt: 'Implement makeListenerCleanup(): use AbortController to register a "listener" (just a counter increment) on a fake EventTarget, then abort the signal and verify no further events fire.',
      validator: {
        kind: 'code',
        starter: `function makeListenerCleanup() {
  const target = new EventTarget();
  const ctrl = new AbortController();
  let fired = 0;
  // TODO: addEventListener('ping', () => fired++, { signal: ctrl.signal })
  target.dispatchEvent(new Event('ping'));
  const beforeAbort = fired;
  ctrl.abort();
  target.dispatchEvent(new Event('ping'));
  return [beforeAbort, fired];
}`,
        cases: [
          { call: 'JSON.stringify(makeListenerCleanup())', expected: '[1,1]', label: 'one fires before abort, none after' },
        ],
        explanation: 'AbortController gives a single signal you can pass to many listeners (fetch, addEventListener) and abort them all at once — way cleaner than tracking individual remove calls.',
      },
    },
    {
      prompt: 'Which is NOT a typical JavaScript memory leak source?',
      validator: {
        kind: 'predict',
        options: [
          'Forgotten event listeners',
          'Detached DOM nodes held by JS',
          'Unbounded caches',
          'Local variables that go out of scope',
        ],
        correct: 3,
        explanation: 'Out-of-scope locals are exactly what GC frees. The other three keep references alive, which is why they leak.',
      },
    },
  ],

  'performance-pitfalls': [
    {
      prompt: 'Implement debounce(fn, ms): return a function that, when called repeatedly, only invokes fn `ms` after the last call.',
      validator: {
        kind: 'code',
        starter: `function debounce(fn, ms) {
  // TODO
}`,
        cases: [
          {
            call: '(async () => { const log = []; const d = debounce((v) => log.push(v), 30); d(1); d(2); d(3); await new Promise((r) => setTimeout(r, 60)); return log; })()',
            expected: [3],
            label: 'only the last call fires',
          },
        ],
        explanation: 'Track a timer id; clear it on each call, then set a new one. The classic "wait for the user to stop typing" pattern.',
      },
    },
    {
      prompt: 'Implement throttle(fn, ms): leading-edge throttle. The first call fires immediately; subsequent calls within `ms` are ignored.',
      validator: {
        kind: 'code',
        starter: `function throttle(fn, ms) {
  // TODO
}`,
        cases: [
          {
            call: '(async () => { const log = []; const t = throttle((v) => log.push(v), 50); t("a"); t("b"); t("c"); await new Promise((r) => setTimeout(r, 60)); t("d"); return log; })()',
            expected: ['a', 'd'],
            label: 'leading-edge, then again after the window',
          },
        ],
        explanation: 'Track the last-fire timestamp. On each call, fire if Date.now() - last >= ms.',
      },
    },
    {
      prompt: 'Implement class LRU with constructor(maxSize) and methods get(k), set(k, v). When set exceeds maxSize, evict the least-recently-used entry. Verify ordered eviction.',
      hint: 'A Map preserves insertion order. On get-hit, delete and re-set to move to "most recent".',
      validator: {
        kind: 'code',
        starter: `class LRU {
  // TODO
}`,
        cases: [
          {
            call: '(() => { const l = new LRU(2); l.set("a", 1); l.set("b", 2); l.set("c", 3); return [l.get("a"), l.get("b"), l.get("c")]; })()',
            expected: [undefined, 2, 3],
            label: 'oldest evicted on overflow',
          },
          {
            call: '(() => { const l = new LRU(2); l.set("a", 1); l.set("b", 2); l.get("a"); l.set("c", 3); return [l.get("a"), l.get("b"), l.get("c")]; })()',
            expected: [1, undefined, 3],
            label: 'get refreshes recency',
          },
        ],
        explanation: 'Map iteration is insertion-ordered. delete + re-set bumps an entry to the most-recent position; .keys().next() gives the oldest.',
      },
    },
    {
      prompt: 'A "long task" in the browser is any synchronous work lasting more than:',
      validator: {
        kind: 'predict',
        options: ['16 ms', '50 ms', '100 ms', '1 second'],
        correct: 1,
        explanation: '50 ms is the Web Vitals threshold for long tasks — they\'re what blocks input responsiveness (FID/INP). Anything beyond that is a target for splitting or offloading.',
      },
    },
  ],

  'keeping-up': [
    {
      prompt: 'The committee that maintains the JavaScript (ECMAScript) language spec is:',
      validator: {
        kind: 'predict',
        options: ['TC39', 'W3C', 'WHATWG', 'IETF'],
        correct: 0,
        explanation: 'TC39 — Technical Committee 39 of Ecma International. W3C owns the platform APIs; WHATWG owns HTML/DOM; IETF owns the network stack.',
      },
    },
    {
      prompt: 'A TC39 proposal reaches the language at which stage?',
      validator: {
        kind: 'predict',
        options: ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4'],
        correct: 3,
        explanation: 'Stage 4 means "finished and in the next edition of the standard". Stage 3 is "ready, awaiting implementations". Engines typically ship at stage 3.',
      },
    },
    {
      prompt: 'Implement iteratorHelpersPolyfill(): build map() for iterables. Given an iterable and a fn, return a new iterable that yields fn(x) for each x. Verify with [...mapIt(range(0,3), x => x * 10)] → [0, 10, 20].',
      validator: {
        kind: 'code',
        starter: `function* range(start, end) {
  for (let i = start; i < end; i++) yield i;
}
function* mapIt(iterable, fn) {
  // TODO
}`,
        cases: [
          { call: '[...mapIt(range(0, 3), (x) => x * 10)]', expected: [0, 10, 20], label: 'lazy mapping' },
        ],
        explanation: 'Iterator helpers (stage 3) give you .map/.filter/.take/.toArray on iterables themselves — no intermediate arrays. The polyfill is a generator that pulls from the source and yields the transformed value.',
      },
    },
    {
      prompt: 'Implement structuredCloneCheck(): use the built-in structuredClone to deep-copy a nested object. Verify that mutating the original\'s nested field does NOT affect the clone.',
      validator: {
        kind: 'code',
        starter: `function structuredCloneCheck() {
  const orig = { a: { b: { c: 1 } } };
  const copy = structuredClone(orig);
  orig.a.b.c = 999;
  // TODO: return copy.a.b.c
}`,
        cases: [
          { call: 'structuredCloneCheck()', expected: 1, label: 'deep clone is independent' },
        ],
        explanation: 'structuredClone is the standard deep-clone for plain data (handles Maps, Sets, Dates, RegExps, typed arrays). It doesn\'t clone functions, DOM nodes, or class prototypes.',
      },
    },
  ],
};
