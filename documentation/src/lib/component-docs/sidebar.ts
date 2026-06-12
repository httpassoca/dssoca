import { type ComponentDoc, SIZE_PROP } from './types'

export const sidebar: ComponentDoc = {
  name: 'Sidebar',
  slug: 'sidebar',
  tagline: 'App-shell navigation sidebar.',
  description:
    'The application sidebar: grouped, icon-led navigation rendered as proper `<nav>` + `<ul>/<li>`. Items can link (`href`), carry a status dot and a square `badge`, and nest one level of children with the disclosure pattern. Collapses to an icon-only rail.',
  storyId: 'components-sidebar--default',
  usage: `<script>
  import { Sidebar } from 'dssoca';
  let active = $state('hub');
  let collapsed = $state(false);
</script>

<Sidebar
  {active}
  {collapsed}
  onSelect={(id) => (active = id)}
  onToggleCollapsed={(c) => (collapsed = c)}
/>`,
  props: [
    { name: 'active', type: 'string', default: "'hub'", desc: 'Active item id.' },
    {
      name: 'groups',
      type: 'SideGroup[]',
      desc: 'Sections of items ({ id, label, icon?, status?, href?, badge?, children? }); has a built-in default.',
    },
    { name: 'onSelect', type: '(id: string) => void', desc: 'Selection handler.' },
    {
      name: 'collapsed',
      type: 'boolean',
      default: 'false',
      desc: 'Collapse to an icon-only rail; labels/section text are hidden.',
    },
    {
      name: 'onToggleCollapsed',
      type: '(collapsed: boolean) => void',
      desc: 'Fired when the built-in collapse toggle is pressed.',
    },
    SIZE_PROP,
  ],
  notes:
    'Exports the `SideItem`, `SideGroup`, and `SideStatus` types from `dssoca`. `SideItem` gains `href`, `badge`, optional `icon` (omit for a text-only item), and one level of nested `children`. The rail stretches to fill its host container’s height (`min-height: 100%`), so the border/background span the full screen or column; it still grows past the viewport when the nav is long.',
}
