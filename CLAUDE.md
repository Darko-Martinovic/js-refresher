# CLAUDE.md — js-refresher

## What this is

The JavaScript-flavoured sibling of `angular-refresher` and `react-refresher`. 30 chapters lifted from the L4/Tech-Lead JS Interview Guide. The app shell is vanilla TypeScript + lit-html (no framework); each chapter ships syntax snippets, a mutable playground, and ~4 tasks (3 coding + 1 theoretical).

## Architecture in one paragraph

`src/core/chapters/chapter-registry.ts` is the source of truth — 30 entries with summary, key points, snippets, playgrounds, references, red flags. Tasks live separately in `chapter-tasks-data.ts` keyed by slug. The router (`src/router.ts`) is hash-based and dispatches to either `renderHomePage`, `renderChapterPage`, or `renderNotFoundPage`. Each page is a function that takes a host element and either renders an immediate lit-html template or mounts a small controller class for the interactive bits (Playground, ChapterTasks, Home search). Theming uses CSS variables on `:root[data-theme="..."]`; the toggle persists to `localStorage`.

## Sandbox runner (the load-bearing piece)

Lives in `src/sandbox/`. Two files:

- `sandbox-worker.ts` — the worker code itself. Uses `new Function('"use strict"; ...')` to evaluate user code inside an async IIFE so `await` works. Stubs `console.log/warn/error` and captures logs. Runs structural `deepEqual` (handles Map, Set, plain objects, arrays, NaN). For each task case, evaluates `code` then `call`, awaits any thenable, compares against `expected`, and optionally compares captured logs against `expectedLogs`.
- `runner.ts` — main-thread API. `runCode(code, cases)` and `runPlayground(code)`. Both spawn a fresh worker via `?worker&inline` (so the worker is bundled with the main JS, no separate file to host), set a 3 s timeout that calls `worker.terminate()` on expiry, and resolve a structured result.

The worker is single-use — we always terminate it after each invocation. That keeps `console.*` stubs from leaking between runs and bounds memory.

## JS-specific gotchas (documented as we built them)

- **Web Worker sandbox limits.** `document`, `localStorage`, the DOM are unreachable. Tasks are pure functions; the playground can use `setTimeout` / `setInterval` / `Promise` / `Map` / `Set` / `WeakMap` / `WeakRef` / `EventTarget` / `structuredClone` / `AbortController` (all available in workers).
- **`await` outside `async`.** The runner wraps user code in an async IIFE so top-level `await` works inside both tasks and playgrounds.
- **`expectedLogs` is order-sensitive.** Microtask-vs-macrotask tasks specify an exact string sequence. `formatLogArg` keeps top-level strings raw (so `console.log('sync')` produces `"sync"` in the log buffer, not `'"sync"'`), matching DevTools behaviour.
- **Object equality.** The worker's `deepEqual` walks Maps, Sets, plain objects, arrays. Tasks returning non-comparable types (functions, raw Symbols) should compare via a derived value (e.g., `typeof`, `.description`).
- **Timer-based tasks (debounce / throttle).** Tests use short real timeouts (~30–60 ms) and the worker waits via `setTimeout`. The 3 s worker timeout is the hard cap.
- **`Symbol` and `Set` in `JSON.stringify`.** Tasks that compare Symbols or Sets convert them to comparable shapes (`[...set]`, `String(sym)`). The formatter handles display.
- **Strict mode is always on inside the runner.** `new Function('"use strict"; ...')`. Plain `fn()` → `this` is `undefined` (which one task explicitly verifies).

## Adding a chapter

1. Append a chapter object to `CHAPTERS_RAW` in `chapter-registry.ts` with a unique slug + valid `section` key from `SECTIONS`.
2. Add an entry to `TASKS_BY_SLUG` in `chapter-tasks-data.ts` for that slug. Use 3 `code` + 1 `predict` (or 1 `self-check` where exploration is the point).
3. For `code` tasks: the starter should compile and define the function the cases call. Leave the body as `// TODO` so the user fills it in. Make sure your `expected` values are EXACTLY what a correct implementation returns — `deepEqual` is strict.

## Adding a task validator kind

If you need a new kind (e.g., `regex` for a pattern-matching task):

1. Extend the `TaskValidator` union in `chapter.model.ts`.
2. Add a case to `ChapterTasksController.renderInput`, `.canSubmit`, `.isCorrect`.
3. No worker changes needed unless the validator runs code in the sandbox.

## Theme & design tokens

CSS variables live at the top of `styles.css`. The light/dark sets mirror the Angular refresher's palette so the three apps feel like one family. Code blocks pull `--code-bg` and `--code-fg`; highlight.js uses the `atom-one-dark` theme on top.

## Commands

```bash
npm run dev      # Vite dev server, hot reload
npm run build    # tsc strict + Vite production build
npm run preview  # serve dist/
```

`erasableSyntaxOnly` is on (TS 6 strictness), so no `enum`s and no constructor parameter properties — we use explicit field declarations + constructor assignment.

## What this is NOT

- Not a framework. lit-html is templating, not state management.
- Not a learning platform with progress tracking — task state is in-memory per session.
- Not a test runner. Tasks self-validate; there is no Vitest/Jest setup. The L1 verification is `npm run build` (type-checks the full app) plus manual click-through.

## When something looks broken

- "Worker error" / "Timed out" — open DevTools, look for the worker's console output. The worker isn't a separate document tab, but errors from `new Function` show up in the worker's stderr in DevTools' Workers panel.
- expectedLogs mismatch — the worker uses `formatLogArg` which keeps top-level strings raw. Check that your expected logs match what `console.log` would actually output (no quotes for direct strings; structured form for objects).
- Worker doesn't terminate cleanly — the runner sets a 3 s wall clock and calls `terminate()`. If you see leaks, check `withWorker` in `runner.ts`.

## Pointers to sister apps

- `../../Angular/angular-refresher/src/app/shared/feature-tasks/code-runner.ts` — the runner this one started from.
- `../../Angular/angular-refresher/src/app/shared/feature-tasks/feature-tasks.html` — the four-validator UI we ported to lit-html.
- `../../Angular/angular-refresher/.gitattributes` — copied here to keep line endings consistent across the three repos.
