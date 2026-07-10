import { type ComponentDoc, SIZE_PROP } from './types'

export const badge: ComponentDoc = {
  name: 'Badge',
  slug: 'badge',
  tagline: 'Compact status/label pill (square, of course).',
  description:
    'A small, non-interactive inline label with a semantic `tone` that backs the fill, border, foreground, and an optional leading `dot`. Also does numeric counts (clamped to `max`) and a live status region. Content is optional for dot- or count-only badges. Need a removable chip? That is a Tag/Chip concern, not a Badge.',
  storyId: 'components-badge--brand',
  usage: `<script>
  import { Badge } from 'dssoca';
</script>

<Badge tone="positive" dot>up</Badge>
<Badge tone="critical">down</Badge>
<Badge tone="info">to_watch</Badge>
<Badge count={42} label="unread" />`,
  props: [
    {
      name: 'tone',
      type: "'brand' | 'neutral' | 'positive' | 'caution' | 'critical' | 'info'",
      default: "'neutral'",
      desc: 'Semantic tone; sets fill/border/foreground + dot colour. `neutral` is the baseline for non-status labels.',
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
      desc: 'Accessible label; required for dot- / count- / label-less badges so status is not colour-only (WCAG 1.4.1).',
    },
    {
      name: 'children',
      type: 'Snippet',
      desc: 'Badge text. Optional — omit for a dot-only or count-only badge.',
    },
  ],
}
