import { html, render, type TemplateResult } from 'lit-html';
import type { Playground } from '../core/chapters/chapter.model';
import { runPlayground, type PlaygroundResult } from '../sandbox/runner';

interface State {
  code: string;
  running: boolean;
  result: PlaygroundResult | null;
}

export class PlaygroundController {
  private state: State;
  private root: HTMLElement;
  private spec: Playground;

  constructor(root: HTMLElement, spec: Playground) {
    this.root = root;
    this.spec = spec;
    this.state = { code: spec.starter, running: false, result: null };
    this.draw();
  }

  private async run(): Promise<void> {
    this.state = { ...this.state, running: true, result: null };
    this.draw();
    const result = await runPlayground(this.state.code);
    this.state = { ...this.state, running: false, result };
    this.draw();
  }

  private reset(): void {
    this.state = { code: this.spec.starter, running: false, result: null };
    this.draw();
  }

  private onInput(e: Event): void {
    this.state.code = (e.target as HTMLTextAreaElement).value;
  }

  private onKeydown(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const ta = e.target as HTMLTextAreaElement;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const v = ta.value;
    const indent = '  ';
    ta.value = v.substring(0, start) + indent + v.substring(end);
    ta.selectionStart = ta.selectionEnd = start + indent.length;
    this.state.code = ta.value;
  }

  private template(): TemplateResult {
    const { code, running, result } = this.state;
    return html`
      <section class="playground">
        <header class="playground__head">
          <div>
            <h4 class="playground__title">${this.spec.label}</h4>
            ${this.spec.description ? html`<p class="playground__desc">${this.spec.description}</p>` : ''}
          </div>
          <div class="playground__actions">
            <button type="button" class="btn btn--primary" ?disabled=${running} @click=${() => this.run()}>
              ${running ? 'Running…' : 'Run'}
            </button>
            <button type="button" class="btn" ?disabled=${running} @click=${() => this.reset()}>
              Reset
            </button>
          </div>
        </header>
        <div class="playground__editor-bar">
          <span>JavaScript</span>
          <span class="playground__hint">Tab inserts 2 spaces · runs in a sandboxed Web Worker (3s budget)</span>
        </div>
        <textarea
          class="playground__editor"
          spellcheck="false"
          autocomplete="off"
          autocapitalize="off"
          wrap="off"
          .value=${code}
          @input=${(e: Event) => this.onInput(e)}
          @keydown=${(e: KeyboardEvent) => this.onKeydown(e)}
          rows="10"
        ></textarea>
        ${this.renderResult(result)}
      </section>
    `;
  }

  private renderResult(result: PlaygroundResult | null): TemplateResult | string {
    if (!result) return '';
    if (result.error) {
      return html`
        <div class="playground__result playground__result--error">
          <div class="playground__result-head">Error</div>
          <pre class="playground__result-body">${result.error}</pre>
          ${this.renderLogs(result.logs)}
        </div>
      `;
    }
    return html`
      <div class="playground__result">
        ${result.isUndefined
          ? ''
          : html`
              <div class="playground__result-head">Returned</div>
              <pre class="playground__result-body">${result.value}</pre>
            `}
        ${this.renderLogs(result.logs)}
      </div>
    `;
  }

  private renderLogs(logs: string[]): TemplateResult | string {
    if (logs.length === 0) return '';
    return html`
      <div class="playground__result-head playground__result-head--logs">console</div>
      <pre class="playground__result-body playground__result-body--logs">${logs.join('\n')}</pre>
    `;
  }

  private draw(): void {
    render(this.template(), this.root);
  }
}

export function mountPlayground(host: HTMLElement, spec: Playground): PlaygroundController {
  return new PlaygroundController(host, spec);
}
