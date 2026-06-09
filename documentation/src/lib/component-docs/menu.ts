import { type ComponentDoc, SIZE_PROP } from './types';

export const menu: ComponentDoc = {
  name: 'Menu',
  slug: 'menu',
  tagline: 'Dropdown menu — trigger + floating list of actions.',
  description:
    'A trigger button that opens a floating panel of selectable items, with click-outside / Esc dismissal and full roving-focus keyboard navigation. Generalises the hand-rolled theme/language/overflow menus into one token-driven primitive (zero radius, --ss-shadow-pop). When any item carries a `selected` flag the rows become `menuitemradio` with a check marker; otherwise they are plain `menuitem` action rows.',
  storyId: 'components-menu--default',
  usage: `<script>
  import { Menu } from 'dssoca';

  let open = $state(false);
  const items = [
    { id: 'edit', label: 'Edit', icon: 'note' },
    { id: 'dup', label: 'Duplicate', icon: 'grid' },
    { id: 'delete', label: 'Delete', icon: 'logs', onSelect: (id) => remove(id) },
  ];
</script>

<Menu {items} bind:open align="end" label="Actions">
  Actions
</Menu>`,
  props: [
    { name: 'items', type: 'MenuItem[]', default: '[]', desc: 'Rows in the panel. Each: { id, label, icon?, disabled?, selected?, onSelect? }. A defined `selected` on any item switches the menu to a selection (radio) group.' },
    { name: 'open', type: 'boolean', default: 'false', desc: 'Bindable open state. Omit `bind:` for an uncontrolled menu the trigger toggles itself.' },
    { name: 'onSelect', type: '(id: string) => void', desc: "Fired when a row is activated, with its `id` (after the item's own `onSelect`)." },
    { name: 'align', type: "'start' | 'end'", default: "'start'", desc: 'Horizontal edge the panel aligns to relative to the trigger.' },
    { name: 'side', type: "'bottom' | 'top'", default: "'bottom'", desc: 'Vertical side the panel opens toward.' },
    { name: 'label', type: 'string', desc: 'Accessible name for the panel (`role="menu"`).' },
    { name: 'children', type: 'Snippet', desc: 'Trigger content rendered inside the toggle button.' },
    SIZE_PROP,
  ],
  notes:
    'Trigger exposes aria-haspopup="menu" + aria-expanded/aria-controls; the panel is role="menu" with role="menuitem" (or menuitemradio + aria-checked when selectable). Keyboard: ArrowDown/ArrowUp open from the trigger; ArrowUp/Down/Home/End rove focus (skipping disabled rows), Enter/Space activate, Esc closes and returns focus to the trigger. Closes on item select, outside pointerdown, and Esc. WCAG 2.2 AA.',
};
