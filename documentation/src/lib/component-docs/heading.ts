import { type ComponentDoc, SIZE_PROP } from './types'

export const heading: ComponentDoc = {
  name: 'Heading',
  slug: 'heading',
  tagline: 'Display title, with the accent underline.',
  description:
    'The display/page-title recipe as a component: display font, oversized clamp() sizing, a primary accent underline behind the lower third of the text, and a background-coloured text-shadow so the glyphs cut into the highlight. The `level` prop picks the rendered `h1`…`h6` independently of the styling, `accent` toggles the underline, and `centered` centres it. Self-contained — usable without importing `theme.css` (the recipe ships in the component, not the global stylesheet).',
  storyId: 'components-heading--default',
  usage: `<script>
  import { Heading } from 'dssoca';
</script>

<Heading>hub_dashboard</Heading>
<Heading level={2} accent={false}>quiet subtitle</Heading>
<Heading centered>centered title</Heading>`,
  props: [
    {
      name: 'level',
      type: '1 | 2 | 3 | 4 | 5 | 6',
      default: '1',
      desc: 'Heading level — picks the rendered element (h1…h6); styling is level-independent.',
    },
    {
      name: 'accent',
      type: 'boolean',
      default: 'true',
      desc: 'Primary accent underline behind the text.',
    },
    { name: 'centered', type: 'boolean', default: 'false', desc: 'Center the heading.' },
    SIZE_PROP,
    { name: 'children', type: 'Snippet', desc: 'Heading text.' },
  ],
  notes:
    'Pick `level` for the document outline (one `h1` per page; don’t skip levels) and let the visual treatment stay constant — semantics and styling are decoupled on purpose. The accent underline sits behind the text (`z-index: -1`) and is purely decorative, so contrast is carried by the text colour itself (WCAG 1.4.3 holds with or without it). Sizing reads the `--ss-heading-*` tokens and rescales across sm/md/lg.',
}
