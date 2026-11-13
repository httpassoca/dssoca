import { type ComponentDoc, SIZE_PROP } from './types'

export const serviceCard: ComponentDoc = {
  name: 'ServiceCard',
  slug: 'service-card',
  htmlExample: {
    props: {
      name: 'api',
      host: '10.0.0.2',
      status: 'up',
      latency: '12ms',
      spark: [3, 5, 4, 8, 6, 9, 7],
    },
    behaviour: 'css',
  },
  tagline: 'Service status row with latency + sparkline.',
  description:
    'A service tile showing name, host, status tone, latency, and a sparkline. Static by default; given an `href` or `onclick` it becomes clickable through one stretched overlay control (a real `<a>` or `<button>`) with a visible focus ring. Supports `loading` skeletons and a `disabled` inert state, an optional relative "last checked" footer, and an extra metadata snippet.',
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
    {
      name: 'status',
      type: "'up' | 'deg' | 'down' | 'maint'",
      default: "'up'",
      desc: 'Status tone (also folded into the accessible name).',
    },
    { name: 'latency', type: 'string', default: "''", desc: 'Latency text (e.g. "4ms").' },
    {
      name: 'spark',
      type: 'number[]',
      default: '[]',
      desc: 'Sparkline series. Empty renders the sparkline\'s "No data" state.',
    },
    {
      name: 'href',
      type: 'string',
      desc: 'Makes the card a link: a stretched overlay <a> that navigates here.',
    },
    {
      name: 'onclick',
      type: '() => void',
      desc: 'Makes the card a button: a stretched overlay <button> (runs as the link click handler when href is set).',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      desc: 'Render skeleton placeholders and mark aria-busy; suppresses interaction.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      desc: 'Inert variant: aria-disabled, no focus/pointer, ignores href and onclick.',
    },
    {
      name: 'updatedAt',
      type: 'Date | string',
      desc: '"Last checked" instant; rendered as relative time in a <time datetime> footer.',
    },
    {
      name: 'meta',
      type: 'Snippet',
      desc: 'Optional extra metadata rows (version, IP, tags…) below the head. Controls in it stay outside the card link/button.',
    },
    SIZE_PROP,
  ],
  notes:
    'Interactive only with `href` (stretched overlay `<a>`) or `onclick` (overlay `<button>`, native Enter/Space); without either the card is a static `role="group"` with no tab stop and no "▸ open" cue. The accessible name is the visible name + status (`aria-labelledby`); host, latency, `meta`, the sparkline summary and the "last checked" time form its description (`aria-describedby`). The overlay is a sibling of the content, never a wrapper, so links or buttons in `meta` sit above it and stay separately focusable. `spark` defaults to `[]`, which renders the sparkline\'s "No data" state rather than an invented trend.',
}
