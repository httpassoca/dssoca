/**
 * Data for the landing-page Hub field: the per-component variant pools the tiles
 * cycle through (content/colour changes only — lengths kept similar so cycling
 * never shifts a tile's fixed-size box) plus the randomized tile pool builder.
 */
import type { IconName } from 'dssoca'

/**
 * A single tile variant. Fields are a loose superset across every component (only
 * the ones a given slug reads are set), typed so the Hub renders without `any`.
 */
export interface Variant {
  /** Button variant. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  /** Generic short text (button label, badge text, menu/link label, toaster msg). */
  t?: string
  /** Badge tone. */
  tone?: 'up' | 'down' | 'info' | 'deg' | 'neutral' | 'maint'
  dot?: boolean
  /** Input. */
  label?: string
  val?: string
  /** MetricTile. */
  d?: string
  dir?: 'up' | 'down'
  /** Sparkline series. */
  data?: number[]
  /** ServiceCard. */
  status?: 'up' | 'deg' | 'down' | 'maint'
  lat?: string
  /** Card. */
  title?: string
  meta?: string
  /** Accordion open id / Sidebar·Topbar·BottomNav active id. */
  open?: string
  active?: string
  /** EmptyState (icon is a glyph rendered verbatim). */
  msg?: string
  icon?: string
  /** Icon tile — a row of real icon names. */
  names?: IconName[]
  /** Toaster stand-in. */
  k?: 'ok' | 'info' | 'err'
  g?: string
}

/** Per-component variant pools (keyed by component slug). */
export const V: Record<string, Variant[]> = {
  button: [
    { variant: 'primary', t: 'deploy' },
    { variant: 'secondary', t: 'cancel' },
    { variant: 'danger', t: 'delete' },
    { variant: 'ghost', t: 'retry' },
    { variant: 'primary', t: 'ship it' },
    { variant: 'secondary', t: 'preview' },
    { variant: 'primary', t: 'publish' },
    { variant: 'ghost', t: 'dismiss' },
    { variant: 'danger', t: 'revoke' },
    { variant: 'secondary', t: 'export' },
  ],
  badge: [
    { tone: 'up', t: 'up', dot: true },
    { tone: 'down', t: 'down', dot: true },
    { tone: 'info', t: 'sync' },
    { tone: 'deg', t: 'degraded' },
    { tone: 'neutral', t: 'idle' },
    { tone: 'up', t: 'live', dot: true },
    { tone: 'maint', t: 'maint' },
    { tone: 'info', t: 'queued' },
    { tone: 'down', t: 'error' },
    { tone: 'up', t: 'ready' },
  ],
  input: [
    { label: 'email', val: 'admin@hub.home' },
    { label: 'query', val: 'status:up' },
    { label: 'search', val: 'movies' },
    { label: 'host', val: 'hub.home' },
    { label: 'token', val: '••••••••' },
    { label: 'tag', val: 'v0.8.1' },
    { label: 'branch', val: 'develop' },
    { label: 'port', val: '3004' },
  ],
  'metric-tile': [
    { val: '142', d: '12%', dir: 'up' },
    { val: '87', d: '4%', dir: 'down' },
    { val: '1.2k', d: '30%', dir: 'up' },
    { val: '63', d: '2%', dir: 'down' },
    { val: '214', d: '8%', dir: 'up' },
    { val: '0.4s', d: '18%', dir: 'down' },
    { val: '99.9%', d: '0.1%', dir: 'up' },
    { val: '38', d: '9%', dir: 'down' },
  ],
  sparkline: [
    { data: [3, 7, 4, 9, 6, 11, 8] },
    { data: [8, 5, 9, 4, 7, 3, 6] },
    { data: [2, 4, 6, 8, 10, 12, 9] },
    { data: [11, 6, 9, 5, 8, 4, 7] },
    { data: [5, 5, 6, 7, 6, 8, 9] },
    { data: [9, 7, 10, 6, 8, 5, 7] },
    { data: [4, 8, 3, 7, 5, 9, 6] },
    { data: [6, 9, 7, 11, 8, 12, 10] },
  ],
  'service-card': [
    { status: 'up', lat: '4ms' },
    { status: 'deg', lat: '120ms' },
    { status: 'down', lat: '—' },
    { status: 'up', lat: '9ms' },
    { status: 'maint', lat: '—' },
    { status: 'up', lat: '6ms' },
    { status: 'deg', lat: '210ms' },
    { status: 'up', lat: '12ms' },
  ],
  'segmented-control': [{ val: 'list' }, { val: 'grid' }, { val: 'map' }],
  menu: [
    { t: 'Actions' },
    { t: 'Options' },
    { t: 'More' },
    { t: 'Manage' },
    { t: 'Edit' },
    { t: 'Filter' },
    { t: 'Sort' },
    { t: 'Share' },
  ],
  card: [
    { title: 'Services', meta: '6 of 7 healthy' },
    { title: 'Cluster', meta: 'all green' },
    { title: 'Storage', meta: '82% used' },
    { title: 'Network', meta: '12 ms p50' },
    { title: 'Builds', meta: '3 running' },
    { title: 'Queue', meta: '0 pending' },
    { title: 'Backups', meta: 'last 1h ago' },
    { title: 'Certs', meta: 'renewed' },
  ],
  link: [
    { t: 'about' },
    { t: 'docs' },
    { t: 'changelog' },
    { t: 'get started' },
    { t: 'tokens' },
    { t: 'theming' },
    { t: 'github' },
    { t: 'install' },
  ],
  accordion: [{ open: 'overview' }, { open: 'usage' }],
  'empty-state': [
    // EmptyState renders `icon` verbatim as a glyph (not an Icon name) → use glyphs.
    { title: 'No services', msg: 'Add one to start', icon: '∅' },
    { title: 'All clear', msg: 'Nothing to review', icon: '✓' },
    { title: 'No logs', msg: 'Waiting for activity', icon: '⋯' },
    { title: 'Inbox zero', msg: 'You are all caught up', icon: '☼' },
    { title: 'No results', msg: 'Try a different query', icon: '⌕' },
  ],
  icon: [
    { names: ['activity', 'settings', 'check', 'user', 'grid'] },
    { names: ['database', 'logs', 'terminal', 'film', 'note'] },
    { names: ['book', 'target', 'wallet', 'cup', 'external'] },
    { names: ['grid', 'user', 'activity', 'logs', 'settings'] },
    { names: ['terminal', 'database', 'check', 'arrow', 'note'] },
    { names: ['film', 'book', 'target', 'user', 'grid'] },
  ],
  sidebar: [{ active: 'hub' }, { active: 'logs' }, { active: 'auth' }],
  topbar: [{ active: 'overview' }, { active: 'logs' }, { active: 'services' }],
  'bottom-nav': [
    { active: 'home' },
    { active: 'data' },
    { active: 'activity' },
    { active: 'account' },
  ],
  toaster: [
    { k: 'ok', g: '✓', t: 'saved!' },
    { k: 'info', g: 'i', t: 'syncing…' },
    { k: 'err', g: '✕', t: 'retrying' },
    { k: 'ok', g: '✓', t: 'deployed' },
    { k: 'info', g: 'i', t: 'queued' },
    { k: 'ok', g: '✓', t: 'published' },
    { k: 'err', g: '✕', t: 'rolled back' },
    { k: 'ok', g: '✓', t: 'all green' },
  ],
  'log-stream': [], // self-animating via `demo`; no prop cycling needed
  heading: [
    { t: 'hub_dashboard' },
    { t: 'all_systems_go' },
    { t: 'design_tokens' },
    { t: 'release_0.9.0' },
    { t: 'zero_radius' },
    { t: 'signal_green' },
  ],
  textarea: [
    { label: 'message', val: 'Markdown is fine.' },
    { label: 'notes', val: 'rotate the certs' },
    { label: 'reply', val: 'on it — eta 5m' },
    { label: 'changelog', val: 'feat: 23 components' },
    { label: 'description', val: 'token-driven, squared' },
    { label: 'feedback', val: 'ship it' },
  ],
  // spinner self-animates (frame cycling) and container is a static width
  // wrapper — neither needs a variant pool; their tiles render statically.
}

/**
 * Components deliberately kept off the decorative landing field. `image` needs a
 * real asset (DS-0065); the DS-0090 components are either overlays (`modal`,
 * `tooltip`), data views needing real datasets (`chart`, `table`), or form
 * controls whose always-on tiles don't read as decorative — they live on their
 * docs pages only, not the landing showcase.
 */
export const LANDING_EXCLUDED = new Set<string>([
  'image',
  'chart',
  'table',
  'select',
  'modal',
  'date-field',
  'file-drop',
  'number-field',
  'tooltip',
  'avatar',
  'pagination',
  'switch',
])

/**
 * Every component slug shown in the field — every component except the
 * `LANDING_EXCLUDED` set above.
 */
export const ALL_SLUGS: string[] = [
  'button',
  'badge',
  'input',
  'segmented-control',
  'card',
  'accordion',
  'metric-tile',
  'sparkline',
  'service-card',
  'log-stream',
  'menu',
  'link',
  'icon',
  'empty-state',
  'toaster',
  'sidebar',
  'topbar',
  'bottom-nav',
  'heading',
  'container',
  'textarea',
  'spinner',
]

/**
 * Build a randomized pool of `n` tile slugs that fills the field: every component
 * appears at least once (when `n >= ALL_SLUGS.length`), the remainder are random
 * repeats, and the whole thing is shuffled so nothing clusters. Uses `Math.random`,
 * so call it once on the client — the Hub is client-only, so there's no SSR mismatch.
 */
export function buildTilePool(n: number): string[] {
  const out = [...ALL_SLUGS]
  while (out.length < n) out.push(ALL_SLUGS[Math.floor(Math.random() * ALL_SLUGS.length)])
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out.slice(0, Math.max(0, n))
}

/** Prop-cycle cadence bounds (ms). */
export const CYCLE_MIN = 500
export const CYCLE_MAX = 2000

/** Full-bleed chrome tiles fill their cell rather than centering. */
export const BLEED = new Set(['sidebar', 'topbar', 'bottom-nav', 'log-stream'])
