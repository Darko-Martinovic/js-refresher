import './styles.css';
import 'highlight.js/styles/atom-one-dark.css';
import { html, render, type TemplateResult } from 'lit-html';

import { CHAPTERS_BY_SLUG } from './core/chapters/chapter-registry';
import { SECTIONS } from './core/chapters/chapter.model';
import { chaptersInSection } from './core/chapters/chapter-registry';
import { renderChapterPage } from './shared/chapter-page';
import { renderHomePage } from './shared/home-page';
import { renderNotFoundPage } from './shared/not-found-page';
import { parseRoute, startRouter, type Route } from './router';
import { applyTheme, readTheme, toggleTheme } from './theme';

applyTheme(readTheme());

const shell = document.getElementById('app');
if (!shell) throw new Error('Missing #app root');

interface ShellState {
  route: Route;
  drawerOpen: boolean;
  theme: 'light' | 'dark';
}

const state: ShellState = {
  route: parseRoute(window.location.hash),
  drawerOpen: window.innerWidth >= 1024,
  theme: readTheme(),
};

function activeSlug(): string | null {
  return state.route.kind === 'chapter' ? state.route.slug : null;
}

function shellTemplate(): TemplateResult {
  const active = activeSlug();
  return html`
    <div class="app ${state.drawerOpen ? 'app--drawer-open' : ''}">
      <header class="app__bar">
        <button
          class="app__menu"
          type="button"
          aria-label="Toggle navigation"
          @click=${() => { state.drawerOpen = !state.drawerOpen; redraw(); }}
        >
          <span></span><span></span><span></span>
        </button>
        <a class="app__brand" href="#/">
          <span class="app__brand-mark">JS</span>
          <span class="app__brand-text">Refresher</span>
        </a>
        <span class="app__spacer"></span>
        <a class="app__link" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noopener">MDN</a>
        <a class="app__link" href="https://github.com/tc39/proposals" target="_blank" rel="noopener">TC39</a>
        <button
          class="app__theme"
          type="button"
          aria-label="Toggle theme"
          @click=${() => { state.theme = toggleTheme(); redraw(); }}
        >
          ${state.theme === 'dark' ? '☀' : '☾'}
        </button>
      </header>

      <aside class="drawer">
        <nav class="drawer__nav">
          ${SECTIONS.map((sec) => html`
            <div class="drawer__group">
              <div class="drawer__group-label">${sec.label}</div>
              <ul class="drawer__list">
                ${chaptersInSection(sec.key).map((c) => html`
                  <li>
                    <a
                      class="drawer__link ${active === c.slug ? 'drawer__link--active' : ''}"
                      href="#/chapter/${c.slug}"
                      @click=${() => { if (window.innerWidth < 1024) state.drawerOpen = false; }}
                    >${c.title}</a>
                  </li>
                `)}
              </ul>
            </div>
          `)}
        </nav>
      </aside>

      <main class="content">
        <div id="outlet"></div>
      </main>
    </div>
  `;
}

function redraw(): void {
  render(shellTemplate(), shell as HTMLElement);
  renderOutlet();
}

function renderOutlet(): void {
  const outlet = document.getElementById('outlet') as HTMLElement | null;
  if (!outlet) return;
  outlet.innerHTML = '';
  switch (state.route.kind) {
    case 'home':
      renderHomePage(outlet);
      break;
    case 'chapter': {
      const ch = CHAPTERS_BY_SLUG[state.route.slug];
      if (!ch) {
        renderNotFoundPage(outlet, state.route.slug);
      } else {
        renderChapterPage(outlet, ch);
      }
      break;
    }
    case 'not-found':
      renderNotFoundPage(outlet, state.route.slug);
      break;
  }
  outlet.scrollIntoView?.({ block: 'start' });
}

startRouter((route) => {
  state.route = route;
  // Auto-close drawer on small screens after navigation.
  if (window.innerWidth < 1024) state.drawerOpen = false;
  redraw();
});

window.addEventListener('resize', () => {
  // Open drawer by default on wide screens, closed on narrow.
  const wide = window.innerWidth >= 1024;
  if (wide !== state.drawerOpen) {
    state.drawerOpen = wide;
    redraw();
  }
});

redraw();
