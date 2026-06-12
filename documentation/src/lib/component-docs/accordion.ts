import { type ComponentDoc, SIZE_PROP } from './types'

export const accordion: ComponentDoc = {
  name: 'Accordion',
  slug: 'accordion',
  tagline: 'Collapsible sections with one or many open at a time.',
  description:
    'A vertically stacked set of collapsible sections. Each item is a heading-wrapped `<button>` toggle (label + optional hint + a chevron that rotates 180° on open) over an animated content `region`. Single-open by default; `multiple` lets several stay open. Works uncontrolled (`defaultValue`) or controlled (bindable `value` + `onChange`). The reveal uses the `--ss-dur` / `--ss-ease` motion tokens and collapses instantly under `prefers-reduced-motion`.',
  storyId: 'components-accordion--default',
  usage: `<script>
  import { Accordion } from 'dssoca';

  const items = [
    { id: 'shipping', label: 'Shipping' },
    { id: 'returns', label: 'Returns', hint: '30 days' },
  ];
</script>

<Accordion {items} defaultValue="shipping">
  {#snippet panel(item)}
    <p>Content for {item.label}.</p>
  {/snippet}
</Accordion>`,
  props: [
    {
      name: 'items',
      type: 'AccordionItem[]',
      desc: 'Required. Sections — each `{ id, label, hint?, disabled? }`.',
    },
    {
      name: 'panel',
      type: 'Snippet<[AccordionItem]>',
      desc: 'Required. Renders the content for each section; receives the item.',
    },
    {
      name: 'header',
      type: 'Snippet<[AccordionItem]>',
      desc: 'Optional custom header content (replaces the default label + hint).',
    },
    {
      name: 'multiple',
      type: 'boolean',
      default: 'false',
      desc: 'Allow several sections open at once; otherwise opening one closes the others.',
    },
    {
      name: 'value',
      type: 'string | string[]',
      desc: 'Controlled, bindable open state — an id (single) or list of ids (`multiple`).',
    },
    {
      name: 'defaultValue',
      type: 'string | string[]',
      desc: 'Initial open section(s) when uncontrolled.',
    },
    {
      name: 'onChange',
      type: '(value) => void',
      desc: 'Fired with the new open value whenever a section toggles.',
    },
    {
      name: 'headingLevel',
      type: '1 | 2 | 3 | 4 | 5 | 6',
      default: '3',
      desc: 'Heading level wrapping each header button (document outline).',
    },
    {
      name: 'idBase',
      type: 'string',
      desc: 'Base id used to namespace the generated header/panel ids. Defaults to a stable per-instance id (from `$props.id()`) so server- and client-rendered IDs match (SSR-safe).',
    },
    SIZE_PROP,
  ],
  notes:
    'Each header is a real `<button>` with `aria-expanded` + `aria-controls`; the panel is a `role="region"` labelled by its header (`aria-labelledby`). Enter/Space toggle; ArrowUp/ArrowDown move between headers (wrapping), Home/End jump to the first/last. Disabled sections use `aria-disabled` so they stay reachable by keyboard but do not toggle. Zero border-radius; padding/typography scale with the size axis. WCAG 2.2 AA.',
}
