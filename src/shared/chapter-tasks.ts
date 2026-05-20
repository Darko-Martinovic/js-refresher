import { html, render, type TemplateResult } from 'lit-html';
import type { Task } from '../core/chapters/chapter.model';
import { runCode, type RunResult } from '../sandbox/runner';

type Answer = string | number | boolean | null;

interface TaskState {
  answer: Answer;
  code: string | null;
  result: RunResult | null;
  running: boolean;
  submitted: boolean;
  hintOpen: boolean;
}

const EMPTY: TaskState = {
  answer: null,
  code: null,
  result: null,
  running: false,
  submitted: false,
  hintOpen: false,
};

export class ChapterTasksController {
  private states: Record<number, TaskState> = {};
  private root: HTMLElement;
  private tasks: Task[];

  constructor(root: HTMLElement, tasks: Task[]) {
    this.root = root;
    this.tasks = tasks;
    this.draw();
  }

  private stateOf(i: number): TaskState {
    return this.states[i] ?? EMPTY;
  }

  private codeOf(i: number): string {
    const t = this.tasks[i];
    if (!t || t.validator.kind !== 'code') return '';
    const s = this.stateOf(i);
    return s.code ?? t.validator.starter;
  }

  private patch(i: number, patch: Partial<TaskState>): void {
    this.states = { ...this.states, [i]: { ...this.stateOf(i), ...patch } };
    this.draw();
  }

  private setAnswer(i: number, v: Answer): void {
    this.patch(i, { answer: v, submitted: false });
  }

  private setCode(i: number, code: string): void {
    this.patch(i, { code, submitted: false, result: null });
  }

  private toggleHint(i: number): void {
    this.patch(i, { hintOpen: !this.stateOf(i).hintOpen });
  }

  private submit(i: number): void {
    this.patch(i, { submitted: true });
  }

  private reset(i: number): void {
    const t = this.tasks[i];
    const starter = t && t.validator.kind === 'code' ? t.validator.starter : null;
    this.patch(i, { answer: null, code: starter, result: null, submitted: false });
  }

  private resetCode(i: number): void {
    const t = this.tasks[i];
    if (!t || t.validator.kind !== 'code') return;
    this.patch(i, { code: t.validator.starter, result: null, submitted: false });
  }

  private async runTests(i: number): Promise<void> {
    const t = this.tasks[i];
    if (!t || t.validator.kind !== 'code') return;
    const code = this.codeOf(i);
    this.patch(i, { running: true, result: null, submitted: false });
    const result = await runCode(code, t.validator.cases);
    this.patch(i, { running: false, result, submitted: true });
  }

  private isSubmitted(i: number): boolean {
    return this.stateOf(i).submitted;
  }

  private isRunning(i: number): boolean {
    return this.stateOf(i).running;
  }

  private canSubmit(i: number): boolean {
    const s = this.stateOf(i);
    const task = this.tasks[i];
    if (!task) return false;
    switch (task.validator.kind) {
      case 'predict':
        return typeof s.answer === 'number';
      case 'input':
        return typeof s.answer === 'string' && s.answer.trim().length > 0;
      case 'self-check':
        return s.answer === true;
      case 'code':
        return !s.running && this.codeOf(i).trim().length > 0;
    }
  }

  private isCorrect(i: number): boolean {
    const s = this.stateOf(i);
    const task = this.tasks[i];
    if (!task || !s.submitted) return false;
    switch (task.validator.kind) {
      case 'predict':
        return s.answer === task.validator.correct;
      case 'input': {
        if (typeof s.answer !== 'string') return false;
        const a = s.answer.trim().toLowerCase();
        return task.validator.accept.some((acc) => acc.trim().toLowerCase() === a);
      }
      case 'self-check':
        return s.answer === true;
      case 'code':
        return !!s.result && !s.result.fatal && s.result.passed === s.result.total;
    }
  }

  private isWrong(i: number): boolean {
    return this.isSubmitted(i) && !this.isCorrect(i);
  }

  private onCodeKeydown(i: number, e: KeyboardEvent): void {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const ta = e.target as HTMLTextAreaElement;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const v = ta.value;
    const indent = '  ';
    ta.value = v.substring(0, start) + indent + v.substring(end);
    ta.selectionStart = ta.selectionEnd = start + indent.length;
    this.setCode(i, ta.value);
  }

  private completedCount(): number {
    return this.tasks.filter((_, i) => this.isCorrect(i)).length;
  }

  private renderInput(i: number, task: Task): TemplateResult | string {
    const s = this.stateOf(i);
    const disabled = this.isSubmitted(i);
    switch (task.validator.kind) {
      case 'predict':
        return html`
          <div class="task__options">
            ${task.validator.options.map((opt, oi) => html`
              <label class="task__option ${s.answer === oi ? 'task__option--checked' : ''}">
                <input
                  type="radio"
                  name="task-${i}"
                  .checked=${s.answer === oi}
                  ?disabled=${disabled}
                  @change=${() => this.setAnswer(i, oi)}
                />
                <span>${opt}</span>
              </label>
            `)}
          </div>
        `;
      case 'input':
        return html`
          <input
            class="task__text"
            type="text"
            placeholder="Your answer"
            spellcheck="false"
            autocomplete="off"
            .value=${typeof s.answer === 'string' ? s.answer : ''}
            ?disabled=${disabled}
            @input=${(e: Event) => this.setAnswer(i, (e.target as HTMLInputElement).value)}
            @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' && this.canSubmit(i)) this.submit(i); }}
          />
        `;
      case 'self-check':
        return html`
          <label class="task__checkbox">
            <input
              type="checkbox"
              .checked=${s.answer === true}
              ?disabled=${disabled}
              @change=${(e: Event) => this.setAnswer(i, (e.target as HTMLInputElement).checked)}
            />
            <span>I've tried this in the playground above</span>
          </label>
        `;
      case 'code': {
        const code = this.codeOf(i);
        const r = s.result;
        return html`
          <div class="task__editor-bar">
            <span>JavaScript</span>
            <span class="task__editor-hint">Tab inserts 2 spaces · runs in a sandboxed Web Worker</span>
          </div>
          <textarea
            class="task__editor"
            spellcheck="false"
            autocomplete="off"
            autocapitalize="off"
            wrap="off"
            .value=${code}
            @input=${(e: Event) => this.setCode(i, (e.target as HTMLTextAreaElement).value)}
            @keydown=${(e: KeyboardEvent) => this.onCodeKeydown(i, e)}
            rows="10"
          ></textarea>
          ${r ? this.renderCaseResults(r) : ''}
        `;
      }
    }
  }

  private renderCaseResults(r: RunResult): TemplateResult {
    if (r.fatal) {
      return html`
        <div class="task__cases">
          <div class="task__case task__case--error">
            <span class="task__case-mark">!</span>
            <span>${r.fatal}</span>
          </div>
        </div>
      `;
    }
    return html`
      <div class="task__cases">
        ${r.cases.map((c) => html`
          <div class="task__case ${c.ok ? 'task__case--pass' : 'task__case--fail'}">
            <span class="task__case-mark">${c.ok ? '✓' : '✗'}</span>
            <div class="task__case-body">
              <code class="task__case-call">${c.label || c.call}</code>
              ${c.ok
                ? ''
                : c.threw
                ? html`<small class="task__case-detail">threw: ${c.threw}</small>`
                : html`<small class="task__case-detail">
                    expected <code>${c.expected}</code>, got <code>${c.actual}</code>
                    ${c.expectedLogs && c.logsOk === false
                      ? html`<br />expected logs <code>${JSON.stringify(c.expectedLogs)}</code>, got <code>${JSON.stringify(c.logs)}</code>`
                      : ''}
                  </small>`}
            </div>
          </div>
        `)}
      </div>
    `;
  }

  private renderActions(i: number, task: Task): TemplateResult {
    if (task.validator.kind === 'code') {
      return html`
        <button class="btn btn--primary" ?disabled=${!this.canSubmit(i)} @click=${() => this.runTests(i)}>
          ${this.isRunning(i) ? 'Running…' : 'Run tests'}
        </button>
        <button class="btn" ?disabled=${this.isRunning(i)} @click=${() => this.resetCode(i)}>
          Reset to starter
        </button>
      `;
    }
    if (!this.isSubmitted(i)) {
      return html`
        <button class="btn btn--primary" ?disabled=${!this.canSubmit(i)} @click=${() => this.submit(i)}>
          Check answer
        </button>
      `;
    }
    return html`<button class="btn" @click=${() => this.reset(i)}>Try again</button>`;
  }

  private renderFeedback(i: number, task: Task): TemplateResult | string {
    if (!this.isSubmitted(i)) return '';
    const ok = this.isCorrect(i);
    const r = this.stateOf(i).result;
    let title: string;
    if (ok) {
      title = task.validator.kind === 'code' && r ? `All ${r.total} tests passed.` : 'Correct.';
    } else {
      title = task.validator.kind === 'code' && r ? `${r.passed} / ${r.total} tests passing.` : 'Not quite.';
    }
    return html`
      <div class="task__feedback ${ok ? 'task__feedback--ok' : 'task__feedback--wrong'}">
        <strong>${title}</strong>
        <span>${task.validator.explanation}</span>
      </div>
    `;
  }

  private template(): TemplateResult {
    return html`
      <div class="tasks">
        <div class="tasks__progress">
          <strong>${this.completedCount()}</strong> / ${this.tasks.length} completed
        </div>
        ${this.tasks.map((task, i) => {
          const correct = this.isCorrect(i);
          const wrong = this.isWrong(i);
          const cls = `task ${correct ? 'task--correct' : ''} ${wrong ? 'task--wrong' : ''}`;
          return html`
            <article class=${cls}>
              <header class="task__header">
                <span class="task__num">Task ${i + 1}</span>
                <span class="task__kind">${task.validator.kind}</span>
                ${task.hint
                  ? html`
                      <button class="task__hint-btn" type="button" @click=${() => this.toggleHint(i)}>
                        ${this.stateOf(i).hintOpen ? 'Hide hint' : 'Hint'}
                      </button>
                    `
                  : ''}
              </header>
              <p class="task__prompt">${task.prompt}</p>
              ${this.stateOf(i).hintOpen && task.hint ? html`<p class="task__hint">${task.hint}</p>` : ''}
              <div class="task__input">${this.renderInput(i, task)}</div>
              <div class="task__actions">${this.renderActions(i, task)}</div>
              ${this.renderFeedback(i, task)}
            </article>
          `;
        })}
      </div>
    `;
  }

  private draw(): void {
    render(this.template(), this.root);
  }
}

export function mountChapterTasks(host: HTMLElement, tasks: Task[]): ChapterTasksController {
  return new ChapterTasksController(host, tasks);
}
