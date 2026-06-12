import { type ComponentDoc, SIZE_PROP } from './types'

export const badge: ComponentDoc = {
  name: 'Badge',
  slug: 'badge',
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
    {
      name: 'tone',
      type: "'up' | 'deg' | 'down' | 'maint' | 'info' | 'neutral'",
      default: "'info'",
      desc: 'Semantic tone; sets fill/border + dot colour. `neutral` is the baseline for non-status labels.',
    },
    SIZE_PROP,
    { name: 'dot', type: 'boolean', default: 'false', desc: 'Render the leading status dot.' },
    {
      name: 'count',
      type: 'number',
      desc: 'Numeric badge, clamped to `max`. A count of 0 renders nothing.',
    },
    {
      name: 'max',
      type: 'number',
      default: '99',
      desc: 'Cap for `count`; values above render as `${max}+`.',
    },
    {
      name: 'live',
      type: 'boolean',
      default: 'false',
      desc: 'Treat as a live status region (role="status", aria-live="polite") so AT announces changes.',
    },
    {
      name: 'label',
      type: 'string',
      desc: 'Accessible label; required for dot- / count- / label-less badges so status is not colour-only (WCAG 1.4.1). Also names the dismiss target.',
    },
    {
      name: 'ondismiss',
      type: '() => void',
      desc: 'When set, renders a trailing keyboard-focusable dismiss button.',
    },
    {
      name: 'children',
      type: 'Snippet',
      desc: 'Badge text. Optional — omit for a dot-only or count-only badge.',
    },
  ],
}
