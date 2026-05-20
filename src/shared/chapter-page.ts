import { html, render, type TemplateResult } from 'lit-html';
import type { Chapter } from '../core/chapters/chapter.model';
import { SECTIONS } from '../core/chapters/chapter.model';
import { findChapterNeighbors } from '../core/chapters/chapter-registry';
import { codeBlock } from './code-block';
import { mountPlayground } from './playground';
import { mountChapterTasks } from './chapter-tasks';

function sectionLabel(key: string): string {
  return SECTIONS.find((s) => s.key === key)?.label ?? key;
}

export function renderChapterPage(root: HTMLElement, chapter: Chapter): void {
  const { prev, next } = findChapterNeighbors(chapter.slug);

  const playgroundHosts: Array<{ host: HTMLElement; spec: Chapter['playgrounds'][number] }> = [];
  let tasksHost: HTMLElement | null = null;

  const template: TemplateResult = html`
    <article class="chapter">
      <header class="chapter__head">
        <a class="chapter__breadcrumb" href="#/">All chapters</a>
        <span class="chapter__section">${sectionLabel(chapter.section)}</span>
        <h1 class="chapter__title">${chapter.title}</h1>
        <p class="chapter__tagline">${chapter.tagline}</p>
      </header>

      <section class="chapter__summary">
        <p>${chapter.summary}</p>
      </section>

      <section class="chapter__block">
        <h2 class="chapter__h2">Key points</h2>
        <ul class="chapter__keypoints">
          ${chapter.keyPoints.map((p) => html`<li>${p}</li>`)}
        </ul>
      </section>

      <section class="chapter__block">
        <h2 class="chapter__h2">Syntax reference</h2>
        ${chapter.snippets.map((s) => codeBlock(s))}
      </section>

      <section class="chapter__block">
        <h2 class="chapter__h2">Playground${chapter.playgrounds.length > 1 ? 's' : ''}</h2>
        ${chapter.playgrounds.map((spec) => {
          const host = document.createElement('div');
          playgroundHosts.push({ host, spec });
          return host;
        })}
      </section>

      ${chapter.tasks && chapter.tasks.length > 0
        ? html`
            <section class="chapter__block">
              <h2 class="chapter__h2">Tasks</h2>
              ${(() => {
                tasksHost = document.createElement('div');
                return tasksHost;
              })()}
            </section>
          `
        : ''}

      ${chapter.pointers && chapter.pointers.length > 0
        ? html`
            <section class="chapter__block">
              <h2 class="chapter__h2">Explore further</h2>
              <ul class="chapter__pointers">
                ${chapter.pointers.map((p) => html`<li><strong>${p.label}</strong>${p.note ? html` — ${p.note}` : ''}</li>`)}
              </ul>
            </section>
          `
        : ''}

      ${chapter.redFlags && chapter.redFlags.length > 0
        ? html`
            <section class="chapter__block chapter__block--flags">
              <h2 class="chapter__h2">Red flags</h2>
              <ul class="chapter__flags">
                ${chapter.redFlags.map((f) => html`<li>${f}</li>`)}
              </ul>
            </section>
          `
        : ''}

      <section class="chapter__block">
        <h2 class="chapter__h2">References</h2>
        <ul class="chapter__refs">
          ${chapter.references.map((r) => html`<li><a href=${r.url} target="_blank" rel="noopener">${r.label}</a></li>`)}
        </ul>
      </section>

      <nav class="chapter__nav">
        ${prev
          ? html`<a class="chapter__nav-link chapter__nav-link--prev" href="#/chapter/${prev.slug}">← ${prev.title}</a>`
          : html`<span></span>`}
        ${next
          ? html`<a class="chapter__nav-link chapter__nav-link--next" href="#/chapter/${next.slug}">${next.title} →</a>`
          : html`<span></span>`}
      </nav>
    </article>
  `;

  render(template, root);

  // After rendering, mount the interactive subtrees into their placeholder hosts.
  for (const { host, spec } of playgroundHosts) {
    mountPlayground(host, spec);
  }
  if (tasksHost && chapter.tasks) {
    mountChapterTasks(tasksHost, chapter.tasks);
  }
}
