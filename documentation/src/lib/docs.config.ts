/**
 * Documentation site config — the single source of truth for the docs nav and
 * the per-component reference pages. Mirrors *what exists today* (the 14
 * components + the two axes + tokens); no speculative/future content.
 *
 * Story IDs map to the dssoca Storybook build (title `Components/<Name>` →
 * `components-<name>--<story>`); the docs embed each one live via an iframe.
 */

/**
 * Base URL of the running/built Storybook the per-component pages embed.
 * Local default points at `storybook dev -p 6006`. Override at build time with
 * `VITE_STORYBOOK_URL` (e.g. a co-deployed `/storybook`); deploy is out of
 * scope for the local-only setup.
 */
export const STORYBOOK_URL: string =
  import.meta.env.VITE_STORYBOOK_URL ?? 'http://localhost:6006';

/** Live-story iframe URL for a given Storybook story id. */
export function storyUrl(id: string): string {
  return `${STORYBOOK_URL}/iframe.html?id=${id}&viewMode=story`;
}

/** "Open in Storybook" deep link (full Storybook UI) for a story id. */
export function storybookLink(id: string): string {
  return `${STORYBOOK_URL}/?path=/story/${id}`;
}

export interface PropDoc {
  name: string;
  type: string;
  default?: string;
  desc: string;
}

export interface ComponentDoc {
  /** Exported component name (as imported from `dssoca`). */
  name: string;
  /** URL slug under /components/. */
  slug: string;
  /** dssoca Icon name used in the nav. */
  icon: string;
  /** One-line summary. */
  tagline: string;
  /** Short paragraph for the page intro. */
  description: string;
  /** Storybook story id embedded as the live demo. */
  storyId: string;
  /** Minimal usage snippet (Svelte). */
  usage: string;
  /** Public props. */
  props: PropDoc[];
  /** Optional extra notes (a11y, behaviour). */
  notes?: string;
}

const SIZE_PROP: PropDoc = {
  name: 'size',
  type: "'sm' | 'md' | 'lg'",
  desc: 'Per-instance size override; inherits the ancestor `data-size-variant` when unset.',
};

export const COMPONENTS: ComponentDoc[] = [
  {
    name: 'PassocaMark',
    slug: 'passoca-mark',
    icon: 'target',
    tagline: 'The animated brand mark.',
    description: 'The dssoca brand glyph. Scales with the size axis or an explicit pixel size.',
    storyId: 'components-passocamark--default',
    usage: `<script>
  import { PassocaMark } from 'dssoca';
</script>

<PassocaMark />
<PassocaMark px={48} color="var(--ss-cyan)" />`,
    props: [
      SIZE_PROP,
      { name: 'px', type: 'number', desc: 'Explicit pixel size; overrides the size axis.' },
      { name: 'color', type: 'string', default: 'var(--ss-primary)', desc: 'Mark color.' },
    ],
  },
  {
    name: 'Icon',
    slug: 'icon',
    icon: 'grid',
    tagline: 'The inline SVG icon set.',
    description:
      'A small, token-sized SVG icon set (stroke icons drawn from a fixed `name` map). Decorative by default; pass `title` to expose an accessible name.',
    storyId: 'components-icon--gallery',
    usage: `<script>
  import { Icon } from 'dssoca';
</script>

<Icon name="activity" />
<Icon name="settings" title="Settings" />`,
    props: [
      { name: 'name', type: 'IconName', desc: 'Required. Which glyph to render (e.g. grid, activity, terminal).' },
      SIZE_PROP,
      { name: 'px', type: 'number', desc: 'Explicit pixel size; overrides the size axis.' },
      { name: 'title', type: 'string', desc: 'Accessible name; when set the icon gets role="img". Omit for decorative icons (aria-hidden).' },
      { name: 'class', type: 'string', default: "''", desc: 'Extra class on the root svg.' },
    ],
  },
  {
    name: 'Badge',
    slug: 'badge',
    icon: 'note',
    tagline: 'Compact status/label pill (square, of course).',
    description: 'A small inline label with a semantic `tone` that also colours the leading dot.',
    storyId: 'components-badge--up',
    usage: `<script>
  import { Badge } from 'dssoca';
</script>

<Badge tone="up">up</Badge>
<Badge tone="down">down</Badge>
<Badge tone="info">to_watch</Badge>`,
    props: [
      { name: 'tone', type: "'up' | 'deg' | 'down' | 'info'", default: "'info'", desc: 'Semantic tone; sets colour + dot.' },
      SIZE_PROP,
      { name: 'children', type: 'Snippet', desc: 'Required. Badge content.' },
    ],
  },
  {
    name: 'Button',
    slug: 'button',
    icon: 'check',
    tagline: 'The primary action control.',
    description: 'Three variants — primary, secondary, ghost. Square edges, token-driven padding.',
    storyId: 'components-button--primary',
    usage: `<script>
  import { Button } from 'dssoca';
</script>

<Button variant="primary" onclick={() => {}}>deploy</Button>
<Button variant="secondary">cancel</Button>
<Button variant="ghost">forgot?</Button>`,
    props: [
      { name: 'variant', type: "'primary' | 'secondary' | 'ghost'", default: "'secondary'", desc: 'Visual emphasis.' },
      { name: 'type', type: "'button' | 'submit' | 'reset'", default: "'button'", desc: 'Native button type.' },
      { name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable the button.' },
      { name: 'onclick', type: '(e: MouseEvent) => void', desc: 'Click handler.' },
      SIZE_PROP,
      { name: 'children', type: 'Snippet', desc: 'Required. Button label.' },
    ],
  },
  {
    name: 'Input',
    slug: 'input',
    icon: 'note',
    tagline: 'Labelled text input with validation affordances.',
    description:
      'A text input with an optional label, auto-wired id, and `invalid` / `describedby` for accessible error messaging.',
    storyId: 'components-input--with-label',
    usage: `<script>
  import { Input } from 'dssoca';
  let email = $state('');
</script>

<Input label="email" type="email" bind:value={email}
  placeholder="rafael@hub.home" />`,
    props: [
      { name: 'label', type: 'string', desc: 'Visible label (associated via generated id).' },
      { name: 'value', type: 'string', desc: 'Bindable value.' },
      { name: 'type', type: 'string', default: "'text'", desc: 'Native input type.' },
      { name: 'placeholder', type: 'string', desc: 'Placeholder text.' },
      { name: 'required', type: 'boolean', default: 'false', desc: 'Marks the field required.' },
      { name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable the field.' },
      { name: 'invalid', type: 'boolean', default: 'false', desc: 'Apply invalid styling + aria-invalid.' },
      { name: 'describedby', type: 'string', desc: 'id of an error/hint element (aria-describedby).' },
      { name: 'oninput', type: '(e) => void', desc: 'Input handler.' },
      SIZE_PROP,
    ],
  },
  {
    name: 'Card',
    slug: 'card',
    icon: 'grid',
    tagline: 'Titled panel container.',
    description:
      'A bordered panel with an optional title, meta, and action slot. The title renders at a configurable heading level for correct document outline.',
    storyId: 'components-card--title-and-meta',
    usage: `<script>
  import { Card } from 'dssoca';
</script>

<Card title="Services" meta="6 of 7 healthy">
  …content…
</Card>`,
    props: [
      { name: 'title', type: 'string', desc: 'Panel heading text.' },
      { name: 'meta', type: 'string', desc: 'Right-aligned meta text in the header.' },
      { name: 'action', type: 'Snippet', desc: 'Header action slot (e.g. a button).' },
      { name: 'titleLevel', type: 'number', default: '3', desc: 'Heading level (h2–h6) for the title.' },
      SIZE_PROP,
      { name: 'children', type: 'Snippet', desc: 'Required. Panel body.' },
    ],
  },
  {
    name: 'Sparkline',
    slug: 'sparkline',
    icon: 'activity',
    tagline: 'Tiny inline bar chart.',
    description:
      'A compact bar sparkline for trends. Decorative by default; pass `label` to expose it to assistive tech as an image.',
    storyId: 'components-sparkline--upward-trend',
    usage: `<script>
  import { Sparkline } from 'dssoca';
</script>

<Sparkline data={[3, 7, 4, 9, 6, 11]} label="req/min, last 6h" />`,
    props: [
      { name: 'data', type: 'number[]', desc: 'Required. Series values.' },
      { name: 'color', type: 'string', default: 'var(--ss-primary)', desc: 'Bar colour.' },
      { name: 'label', type: 'string', desc: 'Accessible name; when set, role="img".' },
      SIZE_PROP,
    ],
  },
  {
    name: 'ServiceCard',
    slug: 'service-card',
    icon: 'database',
    tagline: 'Service status row with latency + sparkline.',
    description: 'A clickable service tile showing name, host, status tone, latency, and an optional sparkline.',
    storyId: 'components-servicecard--up',
    usage: `<script>
  import { ServiceCard } from 'dssoca';
</script>

<ServiceCard name="movies-api" host="movies.home"
  status="up" latency="4ms" />`,
    props: [
      { name: 'name', type: 'string', desc: 'Required. Service name.' },
      { name: 'host', type: 'string', desc: 'Required. Host string.' },
      { name: 'status', type: "'up' | 'deg' | 'down'", default: "'up'", desc: 'Status tone.' },
      { name: 'latency', type: 'string', desc: 'Latency text (e.g. "4ms").' },
      { name: 'spark', type: 'number[]', desc: 'Optional sparkline series.' },
      { name: 'onclick', type: '() => void', desc: 'Click handler.' },
      SIZE_PROP,
    ],
  },
  {
    name: 'MetricTile',
    slug: 'metric-tile',
    icon: 'activity',
    tagline: 'Single KPI value with delta.',
    description: 'A labelled metric with an optional suffix and a directional delta.',
    storyId: 'components-metrictile--delta-up',
    usage: `<script>
  import { MetricTile } from 'dssoca';
</script>

<MetricTile label="req/min" value="142" delta="↑12%" dir="up" />`,
    props: [
      { name: 'label', type: 'string', desc: 'Required. Metric label.' },
      { name: 'value', type: 'string | number', desc: 'Required. The metric value.' },
      { name: 'suffix', type: 'string', desc: 'Unit/suffix shown after the value.' },
      { name: 'delta', type: 'string', desc: 'Delta text.' },
      { name: 'dir', type: "'up' | 'down'", default: "'up'", desc: 'Delta direction (colour).' },
      SIZE_PROP,
    ],
  },
  {
    name: 'Topbar',
    slug: 'topbar',
    icon: 'grid',
    tagline: 'App-shell top bar with tabs.',
    description: 'The application top bar: brand, a set of tabs, and the active user.',
    storyId: 'components-topbar--default',
    usage: `<script>
  import { Topbar } from 'dssoca';
  let active = $state('overview');
</script>

<Topbar {active} tabs={['overview', 'services']}
  onTab={(t) => (active = t)} />`,
    props: [
      { name: 'active', type: 'string', default: "'overview'", desc: 'Active tab id.' },
      { name: 'tabs', type: 'string[]', desc: 'Tab labels.' },
      { name: 'user', type: 'string', desc: 'Current user label.' },
      { name: 'onTab', type: '(tab: string) => void', desc: 'Tab-change handler.' },
      SIZE_PROP,
    ],
  },
  {
    name: 'Sidebar',
    slug: 'sidebar',
    icon: 'logs',
    tagline: 'App-shell navigation sidebar.',
    description: 'The application sidebar: grouped, icon-led navigation items with optional status dots.',
    storyId: 'components-sidebar--default',
    usage: `<script>
  import { Sidebar } from 'dssoca';
  let active = $state('hub');
</script>

<Sidebar {active} onSelect={(id) => (active = id)} />`,
    props: [
      { name: 'active', type: 'string', default: "'hub'", desc: 'Active item id.' },
      { name: 'groups', type: 'SideGroup[]', desc: 'Sections of { id, label, icon, status } items.' },
      { name: 'onSelect', type: '(id: string) => void', desc: 'Selection handler.' },
      SIZE_PROP,
    ],
  },
  {
    name: 'LogStream',
    slug: 'log-stream',
    icon: 'terminal',
    tagline: 'Live, levelled log viewer.',
    description: 'A terminal-style log stream with levels; can simulate a live feed or render seeded lines.',
    storyId: 'components-logstream--multi-level',
    usage: `<script>
  import { LogStream } from 'dssoca';
</script>

<LogStream live={true} />`,
    props: [
      { name: 'live', type: 'boolean', default: 'true', desc: 'Simulate an incoming live feed.' },
      { name: 'initialLines', type: "Omit<LogLine, 'id'>[]", desc: 'Seed lines to render.' },
      SIZE_PROP,
    ],
  },
  {
    name: 'Toaster',
    slug: 'toaster',
    icon: 'note',
    tagline: 'Toast notification host.',
    description:
      'Mount once near the app root; drive it imperatively with the `toast` API. Toasts announce politely via a live region.',
    storyId: 'components-toaster--playground',
    usage: `<script>
  import { Toaster, toast } from 'dssoca';
</script>

<Toaster />
<button onclick={() => toast.success('Saved!')}>save</button>`,
    props: [SIZE_PROP],
    notes:
      'Pair with the imperative API: `toast.success(msg)`, `toast.error(msg)`, `toast.info(msg)` (optional timeout ms). `toasts` is the underlying reactive store.',
  },
  {
    name: 'EmptyState',
    slug: 'empty-state',
    icon: 'book',
    tagline: 'Empty / error placeholder.',
    description: 'A centered placeholder for empty or error states, with an optional icon, message, and action.',
    storyId: 'components-emptystate--with-action',
    usage: `<script>
  import { EmptyState, Button } from 'dssoca';
</script>

<EmptyState title="No services yet" message="Add one to get started." icon="grid">
  {#snippet action()}
    <Button variant="primary">+ add</Button>
  {/snippet}
</EmptyState>`,
    props: [
      { name: 'variant', type: "'empty' | 'error'", default: "'empty'", desc: 'Tone of the placeholder.' },
      { name: 'title', type: 'string', desc: 'Heading text.' },
      { name: 'message', type: 'string', desc: 'Supporting message.' },
      { name: 'icon', type: 'string', desc: 'Icon name.' },
      { name: 'action', type: 'Snippet', desc: 'Action slot (e.g. a button).' },
      { name: 'headingLevel', type: 'number', default: '2', desc: 'Heading level for the title.' },
      SIZE_PROP,
    ],
  },
];

export function getComponent(slug: string): ComponentDoc | undefined {
  return COMPONENTS.find((c) => c.slug === slug);
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
export interface NavGroup {
  section: string;
  items: NavItem[];
}

/** Left-nav structure — guide pages first, then a page per component. */
export const NAV: NavGroup[] = [
  {
    section: 'guide',
    items: [
      { label: 'Introduction', href: '/introduction', icon: 'book' },
      { label: 'Installation', href: '/installation', icon: 'terminal' },
      { label: 'Theming & config', href: '/theming', icon: 'settings' },
      { label: 'Tokens', href: '/tokens', icon: 'grid' },
    ],
  },
  {
    section: 'components',
    items: COMPONENTS.map((c) => ({
      label: c.name,
      href: `/components/${c.slug}`,
      icon: c.icon,
    })),
  },
];
