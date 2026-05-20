import { html, render } from 'lit-html';

export function renderNotFoundPage(root: HTMLElement, slug?: string): void {
  render(
    html`
      <section class="notfound">
        <h1>Chapter not found</h1>
        ${slug ? html`<p>No chapter matches <code>${slug}</code>.</p>` : ''}
        <a class="btn btn--primary" href="#/">Back to all chapters</a>
      </section>
    `,
    root,
  );
}
