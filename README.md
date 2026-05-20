# JavaScript Refresher

A sibling to the [Angular](../../Angular/angular-refresher) and [React](../../React/react-refresher) refreshers. It walks through every JavaScript concept on the L4/Tech-Lead interview guide — 30 chapters across 6 sections, each with a summary, key points, syntax snippets, a **runnable playground**, and **3 coding tasks + 1 theoretical task**.

The defining difference from the framework refreshers: **JavaScript is the topic**, so demos are not framework components — they're mutable code playgrounds and self-validating coding tasks, executed in a sandboxed Web Worker with async support, console capture, and a 3-second timeout.

## Stack

| Layer        | Choice                                                              |
| ------------ | ------------------------------------------------------------------- |
| App shell    | Vanilla TypeScript (strict) + [lit-html](https://lit.dev) templates |
| Tooling      | [Vite](https://vite.dev) (esbuild + Rollup)                         |
| Routing      | Tiny hash router (`src/router.ts`)                                  |
| Highlighting | [highlight.js](https://highlightjs.org)                             |
| Sandbox      | Web Worker (via `?worker&inline`) — async-aware, console capture    |
| Tests        | Manual via Vite dev server (no test runner)                         |

The app shell uses lit-html templates + small controller classes that own state and re-render on change. No framework dependency at the chapter content layer.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve dist/
```

## Project shape

```
src/
  main.ts                      # entry: shell + drawer + router wire-up
  router.ts                    # hash router
  theme.ts                     # light/dark, localStorage-backed
  styles.css                   # CSS-variable theme + components
  sandbox/
    runner.ts                  # main-thread API for the worker
    sandbox-worker.ts          # the worker source (Vite ?worker&inline)
  core/
    chapters/
      chapter.model.ts         # Chapter / Snippet / Playground / Task types
      chapter-registry.ts      # All 30 chapters' static content
      chapter-tasks-data.ts    # All ~120 tasks (3 coding + 1 theoretical per chapter)
  shared/
    code-block.ts              # read-only highlighted snippet
    playground.ts              # editable Monaco-less playground
    chapter-tasks.ts           # the four-validator task UI
    chapter-page.ts            # one chapter's full template
    home-page.ts               # search + grouped section grid
    not-found-page.ts
```

## Sandbox runner

The runner ports the Angular refresher's `code-runner.ts` and extends it:

1. **Async support** — the user's code is wrapped in an async IIFE inside the worker, so `await` works inside both the user code and the test case's `call` expression. The runner awaits the call expression's result if it's a thenable.
2. **Console capture** — `console.log/warn/error` are stubbed to push into a buffer. Each task case can assert an `expectedLogs` sequence; the playground always shows captured logs alongside the return value.
3. **3-second timeout** — `worker.terminate()` on timeout keeps the tab responsive even when the user code is an infinite loop.

Comparison happens inside the worker — non-cloneable actuals (Symbols, functions) never need to cross the postMessage boundary. Only formatted strings (and a pass/fail flag) come back.

## Authoring chapters

To add a new chapter:

1. Add an entry to `CHAPTERS_RAW` in `src/core/chapters/chapter-registry.ts`.
2. Add the chapter's tasks in `src/core/chapters/chapter-tasks-data.ts` keyed by slug.
3. The chapter is rendered automatically — registry → router → page.

### Task validator kinds

```ts
type TaskValidator =
  | { kind: 'predict'; options: string[]; correct: number; explanation: string }
  | { kind: 'input'; accept: string[]; explanation: string }
  | { kind: 'self-check'; explanation: string }
  | { kind: 'code'; starter: string; cases: CodeCase[]; explanation: string };
```

A `code` case is `{ call: string; expected: unknown; expectedLogs?: string[]; label?: string }`. The runner evaluates the user code, then evaluates `call`, awaits the result if thenable, deepEqual-compares against `expected`, and (if provided) compares the captured console output against `expectedLogs`.

## Mix of tasks

Per the L4 guide structure: **~85 coding + ~10 theoretical tasks** total. Coding is the predominant validator — JavaScript is a language refresher, the user wants reps. `predict` is reserved for concepts where writing code does not apply (committee names, hoisting truths, long-task thresholds, etc.).

## Acceptance criteria

- [x] `npm run build` succeeds, no TS errors
- [x] `npm run dev` boots, all chapters render
- [x] Playground runs synchronous and async code; captures console output; times out on infinite loops
- [x] Tasks of all four kinds validate
- [x] Dark mode toggles, persists across reloads
- [x] 30 chapters, 6 sections

## Sister apps

- [angular-refresher](../../Angular/angular-refresher) — Angular 21 deep dive
- [react-refresher](../../React/react-refresher) — React 19 + Vite refresher

Same design tokens, same registry-driven architecture.
