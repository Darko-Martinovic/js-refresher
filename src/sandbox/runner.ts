import SandboxWorker from './sandbox-worker?worker&inline';

export interface CodeCase {
  call: string;
  expected: unknown;
  expectedLogs?: string[];
  label?: string;
}

export interface CaseResult {
  ok: boolean;
  call: string;
  label?: string;
  expected: string;
  actual: string;
  threw?: string;
  logs: string[];
  expectedLogs?: string[];
  logsOk?: boolean;
}

export interface RunResult {
  passed: number;
  total: number;
  cases: CaseResult[];
  fatal?: string;
}

export interface PlaygroundResult {
  ok: boolean;
  value: string;
  isUndefined: boolean;
  logs: string[];
  error?: string;
}

const DEFAULT_TIMEOUT = 3000;

function withWorker<T>(
  body: (worker: Worker, finish: (v: T) => void) => void,
  timeoutMs: number,
  onTimeout: () => T,
): Promise<T> {
  return new Promise((resolve) => {
    let done = false;
    const worker = new SandboxWorker();
    const finish = (v: T) => {
      if (done) return;
      done = true;
      try { worker.terminate(); } catch { /* ignore */ }
      clearTimeout(timer);
      resolve(v);
    };
    const timer = setTimeout(() => finish(onTimeout()), timeoutMs);
    worker.onerror = (e) => {
      finish(({
        ...onTimeout(),
        fatal: e.message || 'Worker error',
      } as unknown) as T);
    };
    body(worker, finish);
  });
}

export function runCode(code: string, cases: CodeCase[], timeoutMs = DEFAULT_TIMEOUT): Promise<RunResult> {
  return withWorker<RunResult>(
    (worker, finish) => {
      worker.onmessage = (e: MessageEvent<{ kind: 'cases-result'; results: CaseResult[] }>) => {
        if (e.data?.kind !== 'cases-result') return;
        const results = e.data.results;
        finish({
          passed: results.filter((r) => r.ok).length,
          total: results.length,
          cases: results,
        });
      };
      worker.postMessage({ mode: 'cases', code, cases, flushMs: 0 });
    },
    timeoutMs,
    () => ({
      passed: 0,
      total: cases.length,
      cases: cases.map((c) => ({
        ok: false,
        call: c.call,
        label: c.label,
        expected: String(c.expected),
        actual: '—',
        threw: `Timed out after ${timeoutMs}ms — possible infinite loop`,
        logs: [],
        expectedLogs: c.expectedLogs,
        logsOk: !c.expectedLogs,
      })),
      fatal: `Execution timed out after ${timeoutMs}ms.`,
    }),
  );
}

export function runPlayground(code: string, timeoutMs = DEFAULT_TIMEOUT): Promise<PlaygroundResult> {
  return withWorker<PlaygroundResult>(
    (worker, finish) => {
      worker.onmessage = (e: MessageEvent<{ kind: 'playground-result'; ok: boolean; value?: string; isUndefined?: boolean; logs: string[]; error?: string }>) => {
        if (e.data?.kind !== 'playground-result') return;
        const m = e.data;
        finish({
          ok: m.ok,
          value: m.value ?? '',
          isUndefined: m.isUndefined ?? true,
          logs: m.logs,
          error: m.error,
        });
      };
      worker.postMessage({ mode: 'playground', code, flushMs: 60 });
    },
    timeoutMs,
    () => ({
      ok: false,
      value: '',
      isUndefined: true,
      logs: [],
      error: `Timed out after ${timeoutMs}ms — possible infinite loop`,
    }),
  );
}
