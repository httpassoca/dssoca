import { type ComponentDoc, SIZE_PROP } from './types';

// SCAFFOLD STUB (DS-0043) — fleshed out by the Accordion implementation (DS-0051).
export const accordion: ComponentDoc = {
  name: 'Accordion',
  slug: 'accordion',
  tagline: 'Collapsible disclosure panels.',
  description:
    'Stacked header/body panels that expand and collapse with an animated, token-driven reveal. Supports single or multiple open panels with full keyboard and ARIA semantics.',
  storyId: 'components-accordion--default',
  usage: `<script>
  import { Accordion } from 'dssoca';
</script>

<Accordion items={[{ id: 'a', title: 'Section', open: true }]} />`,
  props: [
    { name: 'items', type: 'AccordionItem[]', default: '[]', desc: 'Panels: { id, title, open?, disabled? }.' },
    { name: 'multiple', type: 'boolean', default: 'false', desc: 'Allow more than one panel open at once.' },
    SIZE_PROP,
  ],
  notes: 'Implementation tracked in agile DS-0051.',
};
