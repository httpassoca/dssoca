/**
 * Documentation site config — the single source of truth for the docs nav and
 * the per-component reference pages. Mirrors *what exists today* (the 13
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
    name: 'Icon',
    slug: 'icon',
    icon: 'grid',
    tagline: 'The inline SVG icon set.',
    description:
      'A small, token-sized SVG icon set. Built-in stroke glyphs are drawn from a `name` map; register your own with `registerIcon`, or pass raw `paths` inline. Decorative by default; pass a `title` to expose an accessible name. Supports `spin`, quarter-turn `rotate`, `flip`, an `outline`/`solid` `variant`, and configurable stroke.',
    storyId: 'components-icon--gallery',
    usage: `<script>
  import { Icon, registerIcon } from 'dssoca';

  registerIcon('heart', '<path d="M12 21 4 13a5 5 0 0 1 7-7l1 1 1-1a5 5 0 0 1 7 7z"/>');
</script>

<Icon name="activity" />
<Icon name="settings" title="Settings" />
<Icon name="spinner" spin />
<Icon name="check" variant="solid" />`,
    props: [
      { name: 'name', type: 'IconName', desc: 'Required. Which glyph to render (e.g. grid, activity, terminal). Falls back to `paths` when unknown.' },
      SIZE_PROP,
      { name: 'px', type: 'number', desc: 'Explicit pixel size; overrides the size token.' },
      { name: 'paths', type: 'string', desc: 'Raw SVG inner markup escape hatch — rendered when `name` is not a known/registered glyph.' },
      { name: 'title', type: 'string', desc: 'Accessible name; rendered as a real <title> and wired via aria-labelledby (implies non-decorative).' },
      { name: 'desc', type: 'string', desc: 'Extended description; rendered as <desc> and appended to aria-labelledby.' },
      { name: 'decorative', type: 'boolean', desc: 'Force aria-hidden with no a11y name. Defaults true when no `title`, false when a `title` is present.' },
      { name: 'spin', type: 'boolean', default: 'false', desc: 'Spin the glyph (e.g. a loader). Honours prefers-reduced-motion.' },
      { name: 'rotate', type: '0 | 90 | 180 | 270', default: '0', desc: 'Quarter-turn rotation.' },
      { name: 'flip', type: "'horizontal' | 'vertical'", desc: 'Mirror the glyph.' },
      { name: 'variant', type: "'outline' | 'solid'", default: "'outline'", desc: 'Stroked (outline) or filled with currentColor (solid).' },
      { name: 'strokeWidth', type: 'number', default: '2', desc: 'Stroke weight in viewBox units.' },
      { name: 'absoluteStroke', type: 'boolean', default: 'false', desc: 'Keep `strokeWidth` optically constant across sizes (recompute from resolved px).' },
      { name: 'class', type: 'string', default: "''", desc: 'Extra class on the root svg.' },
    ],
    notes:
      'Module exports `registerIcon(name, paths)` (re-exported from `dssoca`) to register or override a glyph globally at runtime, and the `IconName` type for the built-in set.',
  },
  {
    name: 'Badge',
    slug: 'badge',
    icon: 'note',
    tagline: 'Compact status/label pill (square, of course).',
    description:
      'A small inline label with a semantic `tone` that backs the fill, border, and an optional leading `dot`. Also does numeric counts (clamped to `max`), a live status region, and an optional dismiss button. Content is optional for dot- or count-only badges.',
    storyId: 'components-badge--up',
    usage: `<script>
  import { Badge } from 'dssoca';
</script>

<Badge tone="up" dot>up</Badge>
<Badge tone="down">down</Badge>
<Badge tone="info">to_watch</Badge>
<Badge tone="neutral" count={42} label="unread" />`,
    props: [
      { name: 'tone', type: "'up' | 'deg' | 'down' | 'maint' | 'info' | 'neutral'", default: "'info'", desc: 'Semantic tone; sets fill/border + dot colour. `neutral` is the baseline for non-status labels.' },
      SIZE_PROP,
      { name: 'dot', type: 'boolean', default: 'false', desc: 'Render the leading status dot.' },
      { name: 'count', type: 'number', desc: 'Numeric badge, clamped to `max`. A count of 0 renders nothing.' },
      { name: 'max', type: 'number', default: '99', desc: 'Cap for `count`; values above render as `${max}+`.' },
      { name: 'live', type: 'boolean', default: 'false', desc: 'Treat as a live status region (role="status", aria-live="polite") so AT announces changes.' },
      { name: 'label', type: 'string', desc: 'Accessible label; required for dot- / count- / label-less badges so status is not colour-only (WCAG 1.4.1). Also names the dismiss target.' },
      { name: 'ondismiss', type: '() => void', desc: 'When set, renders a trailing keyboard-focusable dismiss button.' },
      { name: 'children', type: 'Snippet', desc: 'Badge text. Optional — omit for a dot-only or count-only badge.' },
    ],
  },
  {
    name: 'Button',
    slug: 'button',
    icon: 'check',
    tagline: 'The primary action control.',
    description:
      'Four variants — primary, secondary, ghost, danger. Square edges, token-driven padding. Supports a `loading` state (spinner, aria-busy, stays focusable), leading/trailing icon snippets, `iconOnly` and `fullWidth` layouts, a bindable element ref, and forwards any remaining native button attributes.',
    storyId: 'components-button--primary',
    usage: `<script>
  import { Button } from 'dssoca';
</script>

<Button variant="primary" onclick={() => {}}>deploy</Button>
<Button variant="secondary">cancel</Button>
<Button variant="danger" loading loadingLabel="deleting…">delete</Button>
<Button variant="ghost">forgot?</Button>`,
    props: [
      { name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'danger'", default: "'secondary'", desc: 'Visual emphasis.' },
      { name: 'type', type: "'button' | 'submit' | 'reset'", default: "'button'", desc: 'Native button type.' },
      { name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable the button.' },
      { name: 'loading', type: 'boolean', default: 'false', desc: 'Show a spinner, block clicks, set aria-busy; the button stays focusable.' },
      { name: 'loadingLabel', type: 'string', desc: 'Accessible name while loading (keeps the name stable when the label is hidden).' },
      { name: 'iconOnly', type: 'boolean', default: 'false', desc: 'Square icon-only button; `label` is required and becomes the aria-label.' },
      { name: 'label', type: 'string', desc: 'Accessible name; required for icon-only buttons.' },
      { name: 'fullWidth', type: 'boolean', default: 'false', desc: 'Stretch to fill the inline axis and centre the content.' },
      { name: 'leading', type: 'Snippet', desc: 'Icon snippet rendered before children.' },
      { name: 'trailing', type: 'Snippet', desc: 'Icon snippet rendered after children.' },
      { name: 'onclick', type: '(e: MouseEvent) => void', desc: 'Click handler (suppressed while loading/disabled).' },
      { name: 'el', type: 'HTMLButtonElement', desc: 'Bindable reference to the underlying <button>.' },
      SIZE_PROP,
      { name: 'children', type: 'Snippet', desc: 'Button label.' },
      { name: '...rest', type: 'HTMLButtonAttributes', desc: 'Any remaining native button attributes / handlers are forwarded.' },
    ],
  },
  {
    name: 'Input',
    slug: 'input',
    icon: 'note',
    tagline: 'Labelled text input with validation affordances.',
    description:
      'A text input with an optional label and auto-wired id. Supports `hint` and `error` helper text (error implies aria-invalid and is announced), prefix/suffix snippets inside the field, a `clearable` button, readonly/disabled styling, and native attribute forwarding (`autocomplete`, `inputmode`, `maxlength`, …).',
    storyId: 'components-input--with-label',
    usage: `<script>
  import { Input } from 'dssoca';
  let email = $state('');
</script>

<Input
  label="email"
  type="email"
  bind:value={email}
  placeholder="rafael@hub.home"
  hint="we never share it"
  clearable
/>`,
    props: [
      { name: 'label', type: 'string', desc: 'Visible label (associated via generated id).' },
      { name: 'value', type: 'string', default: "''", desc: 'Bindable value.' },
      { name: 'type', type: 'string', default: "'text'", desc: 'Native input type.' },
      { name: 'placeholder', type: 'string', desc: 'Placeholder text.' },
      { name: 'required', type: 'boolean', default: 'false', desc: 'Marks the field required (adds a marker).' },
      { name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable the field.' },
      { name: 'readonly', type: 'boolean', default: 'false', desc: 'Native readonly — value visible but not editable; rendered muted.' },
      { name: 'invalid', type: 'boolean', desc: 'Apply invalid styling + aria-invalid (also implied by `error`).' },
      { name: 'hint', type: 'string', desc: 'Helper text rendered under the input and wired via aria-describedby.' },
      { name: 'error', type: 'string', desc: 'Error text under the input; implies aria-invalid and is announced to AT.' },
      { name: 'describedby', type: 'string', desc: 'id(s) of additional describing element(s) (aria-describedby).' },
      { name: 'prefix', type: 'Snippet', desc: 'Decorative leading content inside the field, before the input.' },
      { name: 'suffix', type: 'Snippet', desc: 'Decorative trailing content inside the field, after the input.' },
      { name: 'clearable', type: 'boolean', default: 'false', desc: 'Renders a clear button; hidden when empty/readonly/disabled.' },
      { name: 'autocomplete', type: 'FullAutoFill', desc: 'Native autocomplete hint.' },
      { name: 'inputmode', type: "HTMLInputAttributes['inputmode']", desc: 'Native inputmode hint for on-screen keyboards.' },
      { name: 'maxlength', type: 'number', desc: 'Native maxlength.' },
      { name: 'oninput', type: '(e) => void', desc: 'Input handler.' },
      SIZE_PROP,
      { name: '...rest', type: 'HTMLInputAttributes', desc: 'Any remaining native input attributes / handlers are forwarded.' },
    ],
  },
  {
    name: 'Card',
    slug: 'card',
    icon: 'grid',
    tagline: 'Titled panel container.',
    description:
      'A bordered panel with an optional title (string or snippet), meta, description, and action slot, plus full-bleed `media` and a `footer` band. Becomes a link (`href`) or button (`onclick`) when interactive, with keyboard activation. `outlined` or `elevated` surface; the title renders at a configurable heading level for a correct document outline.',
    storyId: 'components-card--title-and-meta',
    usage: `<script>
  import { Card } from 'dssoca';
</script>

<Card title="Services" meta="6 of 7 healthy"
  description="last sync 2m ago" variant="elevated">
  …content…
  {#snippet footer()}view all{/snippet}
</Card>`,
    props: [
      { name: 'title', type: 'string | Snippet', desc: 'Heading text, or a Snippet for inline icons/badges in the title.' },
      { name: 'meta', type: 'string', desc: 'Secondary label rendered to the right of the title.' },
      { name: 'description', type: 'string', desc: 'Muted description rendered under the heading.' },
      { name: 'action', type: 'Snippet', desc: 'Header controls (buttons, menus) rendered to the right.' },
      { name: 'media', type: 'Snippet', desc: 'Full-bleed visual above the head (zero side padding).' },
      { name: 'footer', type: 'Snippet', desc: 'Footer band mirroring the head, rendered only when provided.' },
      { name: 'href', type: 'string', desc: 'Makes the whole card a primary link to this href.' },
      { name: 'onclick', type: '(e: MouseEvent | KeyboardEvent) => void', desc: 'Makes the whole card clickable; pairs with keyboard activation.' },
      { name: 'variant', type: "'outlined' | 'elevated'", default: "'outlined'", desc: 'Surface style (elevated uses shadow tokens).' },
      { name: 'titleLevel', type: 'number', default: '3', desc: 'Heading level (aria-level) for the title.' },
      SIZE_PROP,
      { name: 'children', type: 'Snippet', desc: 'Required. Panel body.' },
    ],
  },
  {
    name: 'Sparkline',
    slug: 'sparkline',
    icon: 'activity',
    tagline: 'Tiny inline trend chart.',
    description:
      'A compact sparkline for trends, rendered as bars, a line, or a filled area. Fix the scale with `min`/`max` to compare rows, colour by `trend` (auto derives up/down/flat → success/danger/muted), and flex it to the cell with `fluid`/`width`. Decorative by default; the auto-generated summary (or `label`) names it for assistive tech.',
    storyId: 'components-sparkline--upward-trend',
    usage: `<script>
  import { Sparkline } from 'dssoca';
</script>

<Sparkline data={[3, 7, 4, 9, 6, 11]} label="req/min, last 6h" />
<Sparkline data={[12, 9, 11, 6, 4]} trend="auto" variant="area" fluid />`,
    props: [
      { name: 'data', type: 'number[]', desc: 'Required. Series values.' },
      { name: 'variant', type: "'bars' | 'line' | 'area'", default: "'bars'", desc: 'Rendering style.' },
      { name: 'color', type: 'string', default: 'var(--ss-primary)', desc: 'Bar/line fill. Ignored when `trend` resolves to a direction.' },
      { name: 'trend', type: "'auto' | 'up' | 'down' | 'flat' | 'none'", default: "'none'", desc: 'Colour by direction; `auto` derives first-vs-last → success/danger/muted.' },
      { name: 'min', type: 'number', desc: 'Lower scale bound. Defaults to the data min — set to fix the scale across rows.' },
      { name: 'max', type: 'number', desc: 'Upper scale bound. Defaults to the data max — set to fix the scale across rows.' },
      { name: 'fluid', type: 'boolean', default: 'false', desc: 'Flex the chart to fill its container width (table-cell friendly).' },
      { name: 'width', type: 'string', desc: "Explicit CSS width (e.g. '120px', '100%'); overrides the intrinsic width." },
      { name: 'label', type: 'string', desc: 'Accessible name; overrides the auto-generated summary (sets role="img").' },
      { name: 'summary', type: 'string', desc: 'Replace the auto-generated screen-reader summary entirely.' },
      { name: 'valueFormat', type: '(v: number) => string', desc: 'Format a value for the screen-reader summary (e.g. v => v + "%").' },
      SIZE_PROP,
    ],
  },
  {
    name: 'ServiceCard',
    slug: 'service-card',
    icon: 'database',
    tagline: 'Service status row with latency + sparkline.',
    description:
      'A service tile showing name, host, status tone, latency, and a sparkline. Renders as a real `<a>` when given an `href`, supports `loading` skeletons and a `disabled` inert state, an optional relative "last checked" footer, and an extra metadata snippet. Interactive by default with a visible focus ring.',
    storyId: 'components-servicecard--up',
    usage: `<script>
  import { ServiceCard } from 'dssoca';
</script>

<ServiceCard
  name="movies-api"
  host="movies.home"
  status="up"
  latency="4ms"
  href="/services/movies-api"
  updatedAt={new Date()}
/>`,
    props: [
      { name: 'name', type: 'string', desc: 'Required. Service name.' },
      { name: 'host', type: 'string', desc: 'Required. Host string.' },
      { name: 'status', type: "'up' | 'deg' | 'down' | 'maint'", default: "'up'", desc: 'Status tone (also folded into the accessible name).' },
      { name: 'latency', type: 'string', default: "''", desc: 'Latency text (e.g. "4ms").' },
      { name: 'spark', type: 'number[]', desc: 'Sparkline series (has a built-in default).' },
      { name: 'href', type: 'string', desc: 'When set, the card renders as a real <a> and navigates here.' },
      { name: 'onclick', type: '() => void', desc: 'Click handler (for the non-link interactive card).' },
      { name: 'loading', type: 'boolean', default: 'false', desc: 'Render skeleton placeholders and mark aria-busy; suppresses interaction.' },
      { name: 'disabled', type: 'boolean', default: 'false', desc: 'Non-interactive variant: aria-disabled, no focus/pointer, no onclick.' },
      { name: 'updatedAt', type: 'Date | string', desc: '"Last checked" instant; rendered as relative time in a <time datetime> footer.' },
      { name: 'meta', type: 'Snippet', desc: 'Optional extra metadata rows (version, IP, tags…) below the head.' },
      SIZE_PROP,
    ],
  },
  {
    name: 'MetricTile',
    slug: 'metric-tile',
    icon: 'activity',
    tagline: 'Single KPI value with delta.',
    description:
      'A labelled metric with optional prefix/suffix units and a directional delta. `trend` colours the delta by sentiment independently of the arrow `dir` (a rising error rate is negative), with an optional `deltaLabel`, an emphasis chip, a `loading` skeleton, and a `chart` snippet slot for hosting a <Sparkline>.',
    storyId: 'components-metrictile--delta-up',
    usage: `<script>
  import { MetricTile, Sparkline } from 'dssoca';
</script>

<MetricTile label="req/min" value="142" delta="12%" dir="up"
  deltaLabel="vs prev 7d">
  {#snippet chart()}
    <Sparkline data={[3, 7, 4, 9, 6, 11]} trend="auto" fluid />
  {/snippet}
</MetricTile>`,
    props: [
      { name: 'label', type: 'string', desc: 'Required. Metric label.' },
      { name: 'value', type: 'string | number', desc: 'Required. The metric value.' },
      { name: 'prefix', type: 'string', desc: 'Leading unit (e.g. $ / €); rendered faint.' },
      { name: 'suffix', type: 'string', desc: 'Trailing unit/suffix; rendered faint.' },
      { name: 'delta', type: 'string', desc: 'Delta text (the arrow is added from `dir`).' },
      { name: 'dir', type: "'up' | 'down'", default: "'up'", desc: 'Arrow direction.' },
      { name: 'trend', type: "'positive' | 'negative' | 'neutral'", desc: 'Sentiment colour for the delta, decoupled from `dir`. Defaults so up reads positive / down negative.' },
      { name: 'deltaLabel', type: 'string', desc: 'Comparison-period label rendered faint after the delta ("vs prev 7d").' },
      { name: 'emphasis', type: 'boolean', default: 'false', desc: 'Render the delta as a soft sentiment chip (non-colour redundancy).' },
      { name: 'loading', type: 'boolean', default: 'false', desc: 'Skeleton/loading state: hides the real value behind aria-hidden bars.' },
      { name: 'chart', type: 'Snippet', desc: 'Slot below the delta — drop in a <Sparkline> here.' },
      SIZE_PROP,
    ],
  },
  {
    name: 'Topbar',
    slug: 'topbar',
    icon: 'grid',
    tagline: 'App-shell top bar with tabs.',
    description:
      'The application top bar: brand, a roving-tabindex tab strip, right-aligned stats, and a user control. Adds a skip link, a command-menu hook (⌘/Ctrl+K), custom brand/user snippets, and an optional sticky position. Uses header/nav landmarks and keyboard tab navigation.',
    storyId: 'components-topbar--default',
    usage: `<script>
  import { Topbar } from 'dssoca';
  let active = $state('overview');
</script>

<Topbar
  {active}
  tabs={['overview', 'services', 'logs']}
  onTab={(t) => (active = t)}
  onCommand={() => openPalette()}
  stats={[{ key: 'cpu', value: '62%', title: 'cpu' }]}
/>`,
    props: [
      { name: 'active', type: 'string', default: "'overview'", desc: 'Active tab id.' },
      { name: 'tabs', type: 'string[]', desc: 'Tab labels (has a built-in default set).' },
      { name: 'user', type: 'string', desc: 'Current user label.' },
      { name: 'onTab', type: '(tab: string) => void', desc: 'Tab-change handler.' },
      { name: 'onCommand', type: '() => void', desc: 'Fired when the command menu is opened (chip click or ⌘/Ctrl+K).' },
      { name: 'onUser', type: '() => void', desc: 'Fired when the user chip is activated (when no `userMenu` snippet given).' },
      { name: 'userMenu', type: 'Snippet', desc: 'Custom user/avatar control on the right; overrides the default user button.' },
      { name: 'brand', type: 'Snippet', desc: 'Custom brand mark + name; defaults to the built-in logo.' },
      { name: 'stats', type: '{ key; value; title? }[]', desc: 'Right-aligned stat segments; defaults to built-in homelab stats.' },
      { name: 'skipTarget', type: 'string', default: "'#main'", desc: 'Anchor the skip link jumps to.' },
      { name: 'sticky', type: 'boolean', default: 'true', desc: 'Stick the header to the top of the viewport.' },
      SIZE_PROP,
    ],
  },
  {
    name: 'Sidebar',
    slug: 'sidebar',
    icon: 'logs',
    tagline: 'App-shell navigation sidebar.',
    description:
      'The application sidebar: grouped, icon-led navigation rendered as proper `<nav>` + `<ul>/<li>`. Items can link (`href`), carry a status dot and a square `badge`, and nest one level of children with the disclosure pattern. Collapses to an icon-only rail.',
    storyId: 'components-sidebar--default',
    usage: `<script>
  import { Sidebar } from 'dssoca';
  let active = $state('hub');
  let collapsed = $state(false);
</script>

<Sidebar
  {active}
  {collapsed}
  onSelect={(id) => (active = id)}
  onToggleCollapsed={(c) => (collapsed = c)}
/>`,
    props: [
      { name: 'active', type: 'string', default: "'hub'", desc: 'Active item id.' },
      { name: 'groups', type: 'SideGroup[]', desc: 'Sections of items ({ id, label, icon, status?, href?, badge?, children? }); has a built-in default.' },
      { name: 'onSelect', type: '(id: string) => void', desc: 'Selection handler.' },
      { name: 'collapsed', type: 'boolean', default: 'false', desc: 'Collapse to an icon-only rail; labels/section text are hidden.' },
      { name: 'onToggleCollapsed', type: '(collapsed: boolean) => void', desc: 'Fired when the built-in collapse toggle is pressed.' },
      SIZE_PROP,
    ],
    notes:
      'Exports the `SideItem`, `SideGroup`, and `SideStatus` types from `dssoca`. `SideItem` gains `href`, `badge`, and one level of nested `children`.',
  },
  {
    name: 'LogStream',
    slug: 'log-stream',
    icon: 'terminal',
    tagline: 'Live, levelled log viewer.',
    description:
      'A terminal-style log viewer. Pass controlled `lines` to render exactly those, or let the built-in `demo` ticker simulate a live feed. Includes a controls toolbar (filters, search, wrap, copy, clear) you can replace, a `loading` indicator, a custom `empty` slot, and a `role="log"` region with configurable aria-live announcements.',
    storyId: 'components-logstream--multi-level',
    usage: `<script>
  import { LogStream } from 'dssoca';

  const lines = [
    { t: '12:00:01', lvl: 'info', svc: '[hub]', msg: 'session refresh' },
    { t: '12:00:02', lvl: 'err',  svc: '[tasks]', msg: 'EADDRINUSE :3004' },
  ];
</script>

<LogStream {lines} />
<LogStream demo />`,
    props: [
      { name: 'lines', type: 'LogLine[]', desc: 'Controlled lines. When provided, renders exactly these (capped to `maxLines`); demo off.' },
      { name: 'initialLines', type: "Omit<LogLine, 'id'>[]", desc: 'Seed lines for the built-in demo stream (used when `lines` is undefined).' },
      { name: 'demo', type: 'boolean', desc: 'Generate a random demo stream. Defaults true ONLY when `lines` is not supplied.' },
      { name: 'live', type: 'boolean', desc: 'Back-compat alias for `demo`.' },
      { name: 'maxLines', type: 'number', default: '30', desc: 'Max lines kept in the buffer (oldest dropped).' },
      { name: 'controls', type: 'boolean', default: 'true', desc: 'Show the controls toolbar (filters, search, wrap, copy, clear).' },
      { name: 'toolbar', type: 'Snippet', desc: 'Replace the built-in toolbar entirely.' },
      { name: 'wrap', type: 'boolean', default: 'true', desc: 'Wrap long messages (pre-wrap) vs. horizontal scroll (pre).' },
      { name: 'announce', type: "'off' | 'polite' | 'assertive'", default: "'polite'", desc: 'aria-live politeness for the log region.' },
      { name: 'ariaLabel', type: 'string', default: "'Log output'", desc: 'Accessible label for the log region.' },
      { name: 'loading', type: 'boolean', default: 'false', desc: 'Show a connecting/loading indicator.' },
      { name: 'empty', type: 'Snippet', desc: 'Custom empty state.' },
      SIZE_PROP,
    ],
    notes:
      'Exports the `LogLevel` (`info | warn | err | ok`) and `LogLine` types from `dssoca`.',
  },
  {
    name: 'Toaster',
    slug: 'toaster',
    icon: 'note',
    tagline: 'Toast notification host.',
    description:
      'Mount once near the app root; drive it imperatively with the `toast` API. The stack anchors at one of six `position`s, supports swipe-to-dismiss, pause-on-hover, an inline action button, and announces via a live region.',
    storyId: 'components-toaster--playground',
    usage: `<script>
  import { Toaster, toast } from 'dssoca';

  async function save() {
    await toast.promise(api.save(), {
      loading: 'saving…',
      success: 'saved!',
      error: (e) => \`failed: \${e.message}\`,
    });
  }
</script>

<Toaster position="bottom-right" />
<button onclick={save}>save</button>`,
    props: [
      { name: 'position', type: "'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'", default: "'top-right'", desc: 'Where the stack anchors on screen.' },
      SIZE_PROP,
    ],
    notes:
      'Imperative API (`import { toast } from \'dssoca\'`): `toast.success/error/info/loading(msg, opts?)` where `opts` is `{ timeout?, action? }` (or a bare timeout number); `action` is `{ label, onClick }` (return `false` from `onClick` to keep the toast open). `toast.promise(p, { loading, success, error })` pushes a sticky loading toast and resolves it to success/error. The underlying reactive store is `toasts`: `toasts.max` (visible-stack cap, default 3, overflow queues), `toasts.update(id, patch)`, `toasts.dismiss(id)`, `toasts.pause/resume(id)`, `toasts.clear()`. A new `loading` kind is sticky until updated/dismissed.',
  },
  {
    name: 'EmptyState',
    slug: 'empty-state',
    icon: 'book',
    tagline: 'Empty / error / no-results placeholder.',
    description:
      'A centred placeholder for empty, error, or no-results states, with a decorative glyph or `visual` snippet, a message, and primary/secondary actions plus a low-emphasis footer. `compact` and `fullWidth` density options; the title heading level is configurable (or `false` for a plain paragraph). Errors announce assertively, others politely.',
    storyId: 'components-emptystate--with-action',
    usage: `<script>
  import { EmptyState, Button } from 'dssoca';
</script>

<EmptyState title="No services yet" message="Add one to get started." icon="grid">
  {#snippet action()}
    <Button variant="primary">+ add</Button>
  {/snippet}
  {#snippet secondaryAction()}
    <Button variant="ghost">import</Button>
  {/snippet}
</EmptyState>`,
    props: [
      { name: 'variant', type: "'empty' | 'error' | 'no-results'", default: "'empty'", desc: 'Tone of the placeholder (error → role="alert").' },
      { name: 'title', type: 'string', desc: 'Required. Heading text.' },
      { name: 'message', type: 'string', desc: 'Supporting message.' },
      { name: 'icon', type: 'string', desc: 'Decorative glyph fallback when no `visual` snippet is given.' },
      { name: 'visual', type: 'Snippet', desc: 'Visual slot — drop in an <Icon>, illustration or <img> (rendered aria-hidden).' },
      { name: 'action', type: 'Snippet', desc: 'Primary action slot (e.g. a button).' },
      { name: 'secondaryAction', type: 'Snippet', desc: 'Secondary, lower-emphasis action beside the primary one.' },
      { name: 'footer', type: 'Snippet', desc: 'Low-emphasis footer (tertiary links) below everything.' },
      { name: 'headingLevel', type: 'number | false', default: '2', desc: 'Heading level (aria-level); `false` renders a plain <p> with no heading role.' },
      { name: 'compact', type: 'boolean', default: 'false', desc: 'Compact density — drops padding and shrinks the title for inline/cell use.' },
      { name: 'fullWidth', type: 'boolean', default: 'false', desc: 'Remove the centred max-width cap and span the container.' },
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
