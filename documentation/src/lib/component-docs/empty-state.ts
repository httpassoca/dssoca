import { type ComponentDoc, SIZE_PROP } from './types'

export const emptyState: ComponentDoc = {
  name: 'EmptyState',
  slug: 'empty-state',
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
    {
      name: 'variant',
      type: "'empty' | 'error' | 'no-results'",
      default: "'empty'",
      desc: 'Tone of the placeholder (error → role="alert").',
    },
    { name: 'title', type: 'string', desc: 'Required. Heading text.' },
    { name: 'message', type: 'string', desc: 'Supporting message.' },
    {
      name: 'icon',
      type: 'string',
      desc: 'Decorative glyph fallback when no `visual` snippet is given.',
    },
    {
      name: 'visual',
      type: 'Snippet',
      desc: 'Visual slot — drop in an <Icon>, illustration or <img> (rendered aria-hidden).',
    },
    { name: 'action', type: 'Snippet', desc: 'Primary action slot (e.g. a button).' },
    {
      name: 'secondaryAction',
      type: 'Snippet',
      desc: 'Secondary, lower-emphasis action beside the primary one.',
    },
    {
      name: 'footer',
      type: 'Snippet',
      desc: 'Low-emphasis footer (tertiary links) below everything.',
    },
    {
      name: 'ariaLabel',
      type: 'string',
      desc: 'Accessible name for the live region — distinguishes multiple status/alert regions on one page. Optional; the visible `title` already provides the content.',
    },
    {
      name: 'headingLevel',
      type: 'number | false',
      default: '2',
      desc: 'Heading level (aria-level); `false` renders a plain <p> with no heading role.',
    },
    {
      name: 'compact',
      type: 'boolean',
      default: 'false',
      desc: 'Compact density — drops padding and shrinks the title for inline/cell use.',
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      default: 'false',
      desc: 'Remove the centred max-width cap and span the container.',
    },
    SIZE_PROP,
  ],
}
