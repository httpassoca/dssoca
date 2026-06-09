import { type ComponentDoc, SIZE_PROP } from './types';

export const serviceCard: ComponentDoc = {
    name: 'ServiceCard',
    slug: 'service-card',
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
  };
