/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference lib="webworker" />

// Sandbox worker. Runs user-supplied JavaScript in async mode with console
// capture and structural comparison against expected values. The comparison
// happens here so non-cloneable actuals (Symbols, functions) never need to
// cross the postMessage boundary.

type CaseOut = {
  ok: boolean;
  call: string;
  label?: string;
  expected: string;
  actual: string;
  threw?: string;
  logs: string[];
  expectedLogs?: string[];
  logsOk?: boolean;
};

type Msg =
  | { mode: 'playground'; code: string; flushMs: number }
  | { mode: 'cases'; code: string; cases: CaseSpec[]; flushMs: number };

type CaseSpec = {
  call: string;
  expected: unknown;
  expectedLogs?: string[];
  label?: string;
};

function format(v: unknown): string {
  if (v === undefined) return 'undefined';
  if (v === null) return 'null';
  if (typeof v === 'string') return JSON.stringify(v);
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'bigint') return `${String(v)}n`;
  if (typeof v === 'symbol') return v.toString();
  if (typeof v === 'function') return `[Function: ${(v as any).name || 'anonymous'}]`;
  if (v instanceof Error) return `${v.name}: ${v.message}`;
  if (v instanceof Map) {
    const entries = [...v.entries()].map(([k, val]) => `${format(k)} => ${format(val)}`);
    return `Map(${v.size}) { ${entries.join(', ')} }`;
  }
  if (v instanceof Set) {
    return `Set(${v.size}) { ${[...v].map(format).join(', ')} }`;
  }
  if (Array.isArray(v)) return `[${v.map(format).join(', ')}]`;
  if (typeof v === 'object') {
    try {
      const obj = v as Record<string, unknown>;
      const keys = Object.keys(obj);
      const parts = keys.slice(0, 12).map((k) => `${k}: ${format(obj[k])}`);
      if (keys.length > 12) parts.push('…');
      return `{ ${parts.join(', ')} }`;
    } catch {
      return String(v);
    }
  }
  return String(v);
}

// console.log('text') displays `text` (no quotes); console.log({a:1}) shows the
// structured form. We mirror that — top-level strings are raw, everything else
// goes through format().
function formatLogArg(v: unknown): string {
  if (typeof v === 'string') return v;
  return format(v);
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (typeof a !== 'object') return false;
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [k, v] of a) {
      if (!b.has(k) || !deepEqual(v, b.get(k))) return false;
    }
    return true;
  }
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    const aArr = [...a];
    const bArr = [...b];
    return aArr.every((x, i) => deepEqual(x, bArr[i]));
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((x, i) => deepEqual(x, b[i]));
  }
  const ao = a as Record<string, unknown>;
  const bo = b as Record<string, unknown>;
  const ak = Object.keys(ao).sort();
  const bk = Object.keys(bo).sort();
  if (ak.length !== bk.length) return false;
  if (ak.some((k, i) => k !== bk[i])) return false;
  return ak.every((k) => deepEqual(ao[k], bo[k]));
}

const capturedLogs: string[] = [];
const origLog = console.log.bind(console);
const origWarn = console.warn.bind(console);
const origError = console.error.bind(console);
console.log = (...args: unknown[]) => { capturedLogs.push(args.map(formatLogArg).join(' ')); };
console.warn = (...args: unknown[]) => { capturedLogs.push(args.map(formatLogArg).join(' ')); };
console.error = (...args: unknown[]) => { capturedLogs.push(args.map(formatLogArg).join(' ')); };

function resetLogs(): void { capturedLogs.length = 0; }
function snapshotLogs(): string[] { return capturedLogs.slice(); }

async function flushTicks(ms: number): Promise<void> {
  if (ms <= 0) {
    // Still flush the microtask queue.
    await Promise.resolve();
    return;
  }
  await new Promise<void>((r) => setTimeout(r, ms));
}

async function runPlayground(code: string, flushMs: number): Promise<void> {
  resetLogs();
  const wrapped = `"use strict";\nreturn (async () => {\n${code}\n})();`;
  try {
    const factory = new Function(wrapped);
    let value = factory();
    if (value && typeof value.then === 'function') value = await value;
    await flushTicks(flushMs);
    postMessage({
      kind: 'playground-result',
      ok: true,
      value: format(value),
      isUndefined: value === undefined,
      logs: snapshotLogs(),
    });
  } catch (err) {
    const e = err as Error;
    postMessage({
      kind: 'playground-result',
      ok: false,
      error: e?.message ? `${e.name || 'Error'}: ${e.message}` : String(err),
      logs: snapshotLogs(),
    });
  } finally {
    // Keep stubs in place — worker is single-use.
    void origLog;
    void origWarn;
    void origError;
  }
}

async function runCases(code: string, cases: CaseSpec[], flushMs: number): Promise<void> {
  const results: CaseOut[] = [];
  for (const c of cases) {
    resetLogs();
    const wrapped =
      `"use strict";\n` +
      `return (async () => {\n${code}\n;return await (${c.call});\n})();`;
    try {
      const factory = new Function(wrapped);
      let actual = factory();
      if (actual && typeof actual.then === 'function') actual = await actual;
      await flushTicks(c.expectedLogs ? Math.max(flushMs, 30) : flushMs);
      const logs = snapshotLogs();
      const valueOk = deepEqual(actual, c.expected);
      const logsOk = c.expectedLogs
        ? c.expectedLogs.length === logs.length && c.expectedLogs.every((s, i) => s === logs[i])
        : true;
      results.push({
        ok: valueOk && logsOk,
        call: c.call,
        label: c.label,
        expected: format(c.expected),
        actual: format(actual),
        logs,
        expectedLogs: c.expectedLogs,
        logsOk,
      });
    } catch (err) {
      const e = err as Error;
      const logs = snapshotLogs();
      const logsOk = c.expectedLogs
        ? c.expectedLogs.length === logs.length && c.expectedLogs.every((s, i) => s === logs[i])
        : false;
      results.push({
        ok: false,
        call: c.call,
        label: c.label,
        expected: format(c.expected),
        actual: '—',
        threw: e?.message ? `${e.name || 'Error'}: ${e.message}` : String(err),
        logs,
        expectedLogs: c.expectedLogs,
        logsOk,
      });
    }
  }
  postMessage({ kind: 'cases-result', results });
}

self.onmessage = (e: MessageEvent<Msg>) => {
  const msg = e.data;
  if (msg.mode === 'playground') {
    void runPlayground(msg.code, msg.flushMs);
  } else {
    void runCases(msg.code, msg.cases, msg.flushMs);
  }
};
