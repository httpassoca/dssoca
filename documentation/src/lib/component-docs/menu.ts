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

  // Custom leading visuals: a theme picker with color swatches,
  // a language picker with emoji flags.
  const themes = [
    { id: 'dark', label: 'Dark', swatch: '#0a0a0a', selected: true },
    { id: 'lime', label: 'Lime', swatch: '#bef264', selected: false },
  ];
  const langs = [
    { id: 'en', label: 'English', emoji: '🇬🇧', selected: true },
    { id: 'pt', label: 'Português', emoji: '🇧🇷', selected: false },
  ];
</script>

<Menu {items} bind:open align="end" label="Actions">
  Actions
</Menu>

<Menu items={themes} label="Theme">Theme</Menu>
<Menu items={langs} label="Language">Language</Menu>`,
  props: [
    { name: 'items', type: 'MenuItem[]', default: '[]', desc: 'Rows in the panel. Each: { id, label, icon?, leading?, swatch?, emoji?, disabled?, selected?, onSelect? }. A defined `selected` on any item switches the menu to a selection (radio) group. Leading visual per item: `leading` (a Svelte 5 Snippet for arbitrary markup), `swatch` (any CSS color, rendered as a token-sized square color chip — zero radius), or `emoji` (a text glyph, e.g. a flag); precedence when several are set is leading → swatch → emoji → icon. All leading visuals share the `--ss-icon` footprint so mixed menus align, and are aria-hidden (the label carries the semantics).' },
    { name: 'open', type: 'boolean', default: 'false', desc: 'Bindable open state. Omit `bind:` for an uncontrolled menu the trigger toggles itself.' },
    { name: 'onSelect', type: '(id: string) => void', desc: "Fired when a row is activated, with its `id` (after the item's own `onSelect`)." },
    { name: 'align', type: "'start' | 'end'", default: "'start'", desc: 'Horizontal edge the panel aligns to relative to the trigger.' },
    { name: 'side', type: "'bottom' | 'top'", default: "'bottom'", desc: 'Vertical side the panel opens toward.' },
    { name: 'label', type: 'string', desc: 'Accessible name for the panel (`role="menu"`).' },
    { name: 'children', type: 'Snippet', desc: 'Trigger content rendered inside the toggle button.' },
    SIZE_PROP,
  ],
  notes:
    'Trigger exposes aria-haspopup="menu" + aria-expanded/aria-controls; the panel is role="menu" with role="menuitem" (or menuitemradio + aria-checked when selectable). Keyboard: ArrowDown/ArrowUp open from the trigger; ArrowUp/Down/Home/End rove focus (skipping disabled rows), Enter/Space activate, Esc closes and returns focus to the trigger. Closes on item select, outside pointerdown, and Esc. Per-item leading visuals (`leading` snippet / `swatch` color chip / `emoji`) are decorative (aria-hidden) — the row\'s accessible name is always its `label`. WCAG 2.2 AA.',
};
