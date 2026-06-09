import { type ComponentDoc, SIZE_PROP } from './types';

export const topbar: ComponentDoc = {
    name: 'Topbar',
    slug: 'topbar',
    tagline: 'App-shell top bar with tabs.',
    description:
      'The application top bar: brand, a roving-tabindex tab strip, right-aligned stats, and a user control. Adds a skip link, a command-menu hook (⌘/Ctrl+K), custom brand/user snippets, and an optional sticky position. Uses header/nav landmarks and keyboard tab navigation.',
    storyId: 'components-topbar--default',
    usage: `<script>
  import { Topbar } from 'dssoca';
  let active = $state('overview');
</script>

<Topbar
  {active}
  tabs={['overview', 'services', 'logs']}
  onTab={(t) => (active = t)}
  onCommand={() => openPalette()}
  stats={[{ key: 'cpu', value: '62%', title: 'cpu' }]}
/>`,
    props: [
      { name: 'active', type: 'string', default: "'overview'", desc: 'Active tab id.' },
      { name: 'tabs', type: 'string[]', desc: 'Tab labels (has a built-in default set).' },
      { name: 'user', type: 'string', desc: 'Current user label.' },
      { name: 'onTab', type: '(tab: string) => void', desc: 'Tab-change handler.' },
      { name: 'onCommand', type: '() => void', desc: 'Fired when the command menu is opened (chip click or ⌘/Ctrl+K).' },
      { name: 'onUser', type: '() => void', desc: 'Fired when the user chip is activated (when no `userMenu` snippet given).' },
      { name: 'userMenu', type: 'Snippet', desc: 'Custom user/avatar control on the right; overrides the default user button.' },
      { name: 'brand', type: 'Snippet', desc: 'Custom brand mark + name; defaults to the built-in logo.' },
      { name: 'stats', type: '{ key; value; title? }[]', desc: 'Right-aligned stat segments; defaults to built-in homelab stats.' },
      { name: 'skipTarget', type: 'string', default: "'#main'", desc: 'Anchor the skip link jumps to.' },
      { name: 'sticky', type: 'boolean', default: 'true', desc: 'Stick the header to the top of the viewport.' },
      SIZE_PROP,
    ],
  };
