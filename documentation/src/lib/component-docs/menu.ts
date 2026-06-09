import { type ComponentDoc, SIZE_PROP } from './types';

// SCAFFOLD STUB (DS-0043) — fleshed out by the Menu implementation (DS-0050).
export const menu: ComponentDoc = {
  name: 'Menu',
  slug: 'menu',
  tagline: 'Dropdown menu — trigger + floating list of actions.',
  description:
    'A trigger that opens a floating panel of selectable items, with click-outside / Esc dismissal and full keyboard navigation. Generalises the theme/language/overflow menus.',
  storyId: 'components-menu--default',
  usage: `<script>
  import { Menu } from 'dssoca';
</script>

<Menu items={[{ id: 'a', label: 'Action' }]}>Open</Menu>`,
  props: [
    { name: 'items', type: 'MenuItem[]', default: '[]', desc: 'Selectable rows: { id, label, icon?, disabled?, selected?, onSelect? }.' },
    SIZE_PROP,
  ],
  notes: 'Implementation tracked in agile DS-0050.',
};
