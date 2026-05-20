import { html, type TemplateResult } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import type { Snippet } from '../core/chapters/chapter.model';

let registered = false;
function ensureRegistered(): void {
  if (registered) return;
  hljs.registerLanguage('javascript', javascript);
  hljs.registerLanguage('typescript', typescript);
  hljs.registerLanguage('bash', bash);
  hljs.registerLanguage('json', json);
  registered = true;
}

function highlight(code: string, lang: string): string {
  ensureRegistered();
  try {
    return hljs.highlight(code, { language: lang }).value;
  } catch {
    return hljs.highlightAuto(code).value;
  }
}

export function codeBlock(snippet: Snippet): TemplateResult {
  const html5 = highlight(snippet.code, snippet.language);
  const onCopy = async (e: Event) => {
    const btn = e.currentTarget as HTMLButtonElement;
    try {
      await navigator.clipboard.writeText(snippet.code);
      const orig = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(() => { btn.textContent = orig; }, 1200);
    } catch {
      btn.textContent = 'Copy failed';
    }
  };
  return html`
    <figure class="code-block">
      <header class="code-block__bar">
        <span class="code-block__lang">${snippet.language}${snippet.label ? html` · ${snippet.label}` : ''}</span>
        <button type="button" class="code-block__copy" @click=${onCopy}>Copy</button>
      </header>
      <pre class="code-block__pre"><code class="hljs language-${snippet.language}">${unsafeHTML(html5)}</code></pre>
    </figure>
  `;
}

export function inlineCode(code: string, lang = 'javascript'): TemplateResult {
  const html5 = highlight(code, lang);
  return html`<code class="hljs hljs-inline">${unsafeHTML(html5)}</code>`;
}
