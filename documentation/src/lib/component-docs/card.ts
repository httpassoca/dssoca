import { type ComponentDoc, SIZE_PROP } from './types'

export const card: ComponentDoc = {
  name: 'Card',
  slug: 'card',
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
    {
      name: 'title',
      type: 'string | Snippet',
      desc: 'Heading text, or a Snippet for inline icons/badges in the title.',
    },
    { name: 'meta', type: 'string', desc: 'Secondary label rendered to the right of the title.' },
    { name: 'description', type: 'string', desc: 'Muted description rendered under the heading.' },
    {
      name: 'action',
      type: 'Snippet',
      desc: 'Header controls (buttons, menus) rendered to the right.',
    },
    {
      name: 'media',
      type: 'Snippet',
      desc: 'Full-bleed visual above the head (zero side padding).',
    },
    {
      name: 'footer',
      type: 'Snippet',
      desc: 'Footer band mirroring the head, rendered only when provided. Typically holds an action row (e.g. a secondary `ghost` + primary `Button`); the band is a `space-between` flex row, so wrap multiple actions in a single element to group (and left-align) them.',
    },
    { name: 'href', type: 'string', desc: 'Makes the whole card a primary link to this href.' },
    {
      name: 'onclick',
      type: '(e: MouseEvent | KeyboardEvent) => void',
      desc: 'Makes the whole card clickable; pairs with keyboard activation.',
    },
    {
      name: 'variant',
      type: "'outlined' | 'elevated'",
      default: "'outlined'",
      desc: 'Surface style (elevated uses shadow tokens).',
    },
    {
      name: 'titleLevel',
      type: 'number',
      default: '3',
      desc: 'Heading level (aria-level) for the title.',
    },
    SIZE_PROP,
    { name: 'children', type: 'Snippet', desc: 'Required. Panel body.' },
  ],
}
