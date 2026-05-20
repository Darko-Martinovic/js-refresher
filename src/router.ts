export type Route =
  | { kind: 'home' }
  | { kind: 'chapter'; slug: string }
  | { kind: 'not-found'; slug?: string };

export function parseRoute(hash: string): Route {
  // hash is like '' | '#/' | '#/chapter/var-let-const'
  const trimmed = hash.replace(/^#/, '');
  if (trimmed === '' || trimmed === '/') return { kind: 'home' };
  const m = trimmed.match(/^\/chapter\/([A-Za-z0-9_-]+)\/?$/);
  if (m) return { kind: 'chapter', slug: m[1] };
  return { kind: 'not-found', slug: trimmed };
}

export type RouteListener = (route: Route) => void;

export function startRouter(listener: RouteListener): () => void {
  const fire = () => listener(parseRoute(window.location.hash));
  window.addEventListener('hashchange', fire);
  // Initial dispatch.
  queueMicrotask(fire);
  return () => window.removeEventListener('hashchange', fire);
}
