/**
 * Data for the landing-page Hub field (`Hub.svelte`): the tile order and the
 * per-component variant pools the tiles cycle through. Extracted here so a test
 * can prove the tiles only reference real components and that every component is
 * shown at least once. Content/colour changes only — lengths are kept similar so
 * cycling never shifts a tile's fixed-size box.
 */

/** Gradient stand-in src for the Image tile (same ratio → no layout shift). */
export const grad = (a: string, b: string): string =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><defs>` +
      `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/>` +
      `<stop offset="1" stop-color="${b}"/></linearGradient></defs>` +
      `<rect width="320" height="180" fill="url(#g)"/></svg>`,
  );

/** Per-component variant pools (keyed by component slug). */
export const V: Record<string, Record<string, unknown>[]> = {
  button: [
    { variant: 'primary', t: 'deploy' }, { variant: 'secondary', t: 'cancel' },
    { variant: 'danger', t: 'delete' }, { variant: 'ghost', t: 'retry' },
    { variant: 'primary', t: 'ship it' }, { variant: 'secondary', t: 'preview' },
  ],
  badge: [
    { tone: 'up', t: 'up', dot: true }, { tone: 'down', t: 'down' },
    { tone: 'info', t: 'sync' }, { tone: 'deg', t: 'degraded' },
    { tone: 'neutral', t: 'idle' }, { tone: 'up', t: 'live', dot: true },
  ],
  input: [
    { label: 'email', val: 'admin@hub.home' }, { label: 'query', val: 'status:up' },
    { label: 'search', val: 'movies' }, { label: 'host', val: 'hub.home' },
  ],
  'metric-tile': [
    { val: '142', d: '12%', dir: 'up' }, { val: '87', d: '4%', dir: 'down' },
    { val: '1.2k', d: '30%', dir: 'up' }, { val: '63', d: '2%', dir: 'down' },
    { val: '214', d: '8%', dir: 'up' },
  ],
  sparkline: [
    { data: [3, 7, 4, 9, 6, 11, 8] }, { data: [8, 5, 9, 4, 7, 3, 6] },
    { data: [2, 4, 6, 8, 10, 12, 9] }, { data: [11, 6, 9, 5, 8, 4, 7] },
    { data: [5, 5, 6, 7, 6, 8, 9] },
  ],
  'service-card': [
    { status: 'up', lat: '4ms' }, { status: 'deg', lat: '120ms' },
    { status: 'down', lat: '—' }, { status: 'up', lat: '9ms' },
  ],
  'segmented-control': [{ val: 'list' }, { val: 'grid' }, { val: 'map' }],
  menu: [{ t: 'Actions' }, { t: 'Options' }, { t: 'More' }, { t: 'Manage' }],
  card: [
    { title: 'Services', meta: '6 of 7 healthy' }, { title: 'Cluster', meta: 'all green' },
    { title: 'Storage', meta: '82% used' }, { title: 'Network', meta: '12 ms p50' },
  ],
  link: [{ t: 'about' }, { t: 'docs' }, { t: 'changelog' }, { t: 'get started' }],
  accordion: [{ open: 'overview' }, { open: 'usage' }],
  'empty-state': [
    // EmptyState renders `icon` verbatim as a glyph (not an Icon name), so use real glyphs.
    { title: 'No services', msg: 'Add one to start', icon: '∅' },
    { title: 'All clear', msg: 'Nothing to review', icon: '✓' },
    { title: 'No logs', msg: 'Waiting for activity', icon: '⋯' },
  ],
  icon: [
    { names: ['activity', 'settings', 'check', 'user', 'grid'] },
    { names: ['database', 'logs', 'terminal', 'film', 'note'] },
    { names: ['book', 'target', 'wallet', 'cup', 'external'] },
    { names: ['grid', 'user', 'activity', 'logs', 'settings'] },
  ],
  image: [
    { src: grad('#66ef73', '#1e1e1e') }, { src: grad('#9aa4ff', '#100f10') },
    { src: grad('#e0c36a', '#1e1e1e') }, { src: grad('#66d9ef', '#100f10') },
  ],
  sidebar: [{ active: 'hub' }, { active: 'logs' }, { active: 'auth' }],
  topbar: [{ active: 'overview' }, { active: 'logs' }, { active: 'services' }],
  'bottom-nav': [{ active: 'home' }, { active: 'data' }, { active: 'activity' }, { active: 'account' }],
  toaster: [
    { k: 'ok', g: '✓', t: 'saved!' }, { k: 'info', g: 'i', t: 'syncing…' },
    { k: 'err', g: '✕', t: 'retrying' }, { k: 'ok', g: '✓', t: 'deployed' },
  ],
  'log-stream': [], // self-animating via `demo`; no prop cycling needed
};

/** Every component slug — each appears at least once when the pool is large enough. */
export const ALL_SLUGS: string[] = [
  'button', 'badge', 'input', 'segmented-control', 'card', 'accordion',
  'metric-tile', 'sparkline', 'service-card', 'log-stream', 'menu', 'link',
  'image', 'icon', 'empty-state', 'toaster', 'sidebar', 'topbar', 'bottom-nav',
];

/**
 * Build a randomized pool of `n` tile slugs that fills the field: every component
 * appears at least once (when `n >= ALL_SLUGS.length`), the remainder are random
 * repeats, and the whole thing is shuffled so nothing clusters. Uses `Math.random`,
 * so call it once on the client — the Hub is client-only, so there's no SSR mismatch.
 */
export function buildTilePool(n: number): string[] {
  const out = [...ALL_SLUGS];
  while (out.length < n) out.push(ALL_SLUGS[Math.floor(Math.random() * ALL_SLUGS.length)]);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.slice(0, Math.max(0, n));
}

/** Prop-cycle cadence bounds (ms). */
export const CYCLE_MIN = 500;
export const CYCLE_MAX = 2000;

/** Full-bleed chrome tiles fill their cell rather than centering. */
export const BLEED = new Set(['sidebar', 'topbar', 'bottom-nav', 'log-stream']);
