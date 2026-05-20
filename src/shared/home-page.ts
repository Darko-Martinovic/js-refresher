import { html, render, type TemplateResult } from 'lit-html';
import { CHAPTERS, chaptersInSection } from '../core/chapters/chapter-registry';
import { SECTIONS, type Chapter } from '../core/chapters/chapter.model';

interface State {
  query: string;
}

export class HomePageController {
  private state: State = { query: '' };
  private root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
    this.draw();
  }

  private filteredBySection(): Array<{ key: string; label: string; description: string; chapters: Chapter[] }> {
    const q = this.state.query.trim().toLowerCase();
    return SECTIONS.map((s) => {
      const list = chaptersInSection(s.key).filter((c) => {
        if (!q) return true;
        return (
          c.title.toLowerCase().includes(q) ||
          c.tagline.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.keyPoints.some((p) => p.toLowerCase().includes(q))
        );
      });
      return { key: s.key, label: s.label, description: s.description, chapters: list };
    });
  }

  private template(): TemplateResult {
    const sections = this.filteredBySection();
    const total = CHAPTERS.length;
    const visible = sections.reduce((acc, s) => acc + s.chapters.length, 0);
    return html`
      <section class="hero">
        <div class="hero__inner">
          <span class="hero__eyebrow">JavaScript refresher</span>
          <h1 class="hero__title">Every concept from variables to the event loop, runnable.</h1>
          <p class="hero__tagline">
            30 chapters · ${total} concepts · mutable playgrounds · self-validating coding tasks · sandboxed in a Web Worker.
          </p>
          <div class="hero__search">
            <input
              type="search"
              placeholder="Search chapters, key points…"
              spellcheck="false"
              autocomplete="off"
              .value=${this.state.query}
              @input=${(e: Event) => {
                this.state.query = (e.target as HTMLInputElement).value;
                this.draw();
              }}
            />
            <span class="hero__search-count">
              ${visible} of ${total} chapters
            </span>
          </div>
        </div>
      </section>

      ${sections.map((sec) => sec.chapters.length === 0 ? '' : html`
        <section class="section">
          <header class="section__head">
            <h2 class="section__title">${sec.label}</h2>
            <p class="section__desc">${sec.description}</p>
          </header>
          <div class="section__grid">
            ${sec.chapters.map((c) => html`
              <a class="card" href="#/chapter/${c.slug}">
                <h3 class="card__title">${c.title}</h3>
                <p class="card__tagline">${c.tagline}</p>
                <div class="card__meta">
                  ${c.playgrounds.length} playground${c.playgrounds.length === 1 ? '' : 's'} ·
                  ${(c.tasks?.length ?? 0)} task${(c.tasks?.length ?? 0) === 1 ? '' : 's'}
                </div>
              </a>
            `)}
          </div>
        </section>
      `)}
    `;
  }

  private draw(): void {
    render(this.template(), this.root);
  }
}

export function renderHomePage(root: HTMLElement): void {
  new HomePageController(root);
}
