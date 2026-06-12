import { type ComponentDoc, SIZE_PROP } from './types'

export const topbar: ComponentDoc = {
  name: 'Topbar',
  slug: 'topbar',
  tagline: 'App-shell top bar with tabs.',
  description:
    'The application top bar: brand, a tab strip (buttons or real links), optional right-aligned chrome (services summary, stats, ⌘K chip, live clock), and a user control. Adds a skip link, a command-menu hook (⌘/Ctrl+K), custom brand/user snippets, and an optional sticky position. Uses header/nav landmarks and keyboard tab navigation, and degrades gracefully to a plain brand + tabs bar when the built-in chrome is opted out.',
  storyId: 'components-topbar--default',
  usage: `<script>
  import { Topbar } from 'dssoca';
</script>

<!-- Link tabs: object tabs with href render real <a href> elements; the
     active tab is matched by id and carries aria-current="page". -->
<Topbar
  active="work"
  tabs={[
    { id: 'home', label: 'Home', href: '/' },
    { id: 'work', label: 'Work', href: '/work' },
    { id: 'about', label: 'About', href: '/about' }
  ]}
/>

<!-- Minimal Topbar: no services dot, no clock, no stats; the ⌘K chip is
     auto-hidden because no onCommand handler is passed. -->
<Topbar
  active="work"
  tabs={[{ id: 'work', href: '/work' }]}
  services={false}
  clock={false}
  stats={[]}
/>`,
  props: [
    { name: 'active', type: 'string', default: "'overview'", desc: 'Active tab id.' },
    {
      name: 'tabs',
      type: 'Array<string | { id; label?; href? }>',
      desc: 'Tab strip (has a built-in default set). Strings are shorthand for `{ id, label: id }`; `label` defaults to `id`; tabs with `href` render as real `<a href>` links (SSR-friendly).',
    },
    { name: 'user', type: 'string', desc: 'Current user label.' },
    {
      name: 'onTab',
      type: '(tab: string) => void',
      desc: 'Fired with the tab id on activation (also for `href` tabs, as an SPA fallback).',
    },
    {
      name: 'onCommand',
      type: '() => void',
      desc: 'Fired when the command menu is opened (chip click or ⌘/Ctrl+K). The ⌘K chip and the shortcut only exist when this is provided.',
    },
    {
      name: 'onUser',
      type: '() => void',
      desc: 'Fired when the user chip is activated (when no `userMenu` snippet given).',
    },
    {
      name: 'userMenu',
      type: 'Snippet',
      desc: 'Custom user/avatar control on the right; overrides the default user button.',
    },
    {
      name: 'brand',
      type: 'Snippet',
      desc: 'Custom brand mark + name; defaults to the built-in logo.',
    },
    {
      name: 'stats',
      type: '{ key; value; title? }[]',
      desc: 'Right-aligned stat segments; defaults to built-in homelab stats. Pass `[]` to remove.',
    },
    {
      name: 'services',
      type: 'boolean | { up: number; total: number }',
      default: 'true',
      desc: 'Services status segment: `true` keeps the built-in 6/7 demo summary, an object renders real numbers, `false` removes it.',
    },
    {
      name: 'clock',
      type: 'boolean',
      default: 'true',
      desc: 'Show the live clock segment; `false` removes it.',
    },
    {
      name: 'skipTarget',
      type: 'string',
      default: "'#main'",
      desc: 'Anchor the skip link jumps to.',
    },
    {
      name: 'sticky',
      type: 'boolean',
      default: 'true',
      desc: 'Stick the header to the top of the viewport.',
    },
    {
      name: 'ariaLabel',
      type: 'string',
      default: "'Primary'",
      desc: 'Accessible name for the tab-strip `<nav>` landmark (distinguishes it from other navs on the page).',
    },
    SIZE_PROP,
  ],
  notes:
    'Active tabs carry `aria-current="page"`. Button tabs use a roving tabindex (arrow keys move focus, Home/End jump); link tabs stay in the natural tab order so they work without JS, while still supporting the arrow keys. Responsive behavior is built in: the tab strip shrinks and scrolls horizontally instead of overflowing the bar, the optional stat segments hide below 720px, and the strip hides below 520px (pair with BottomNav for mobile navigation, or pass `tabs={[]}` to drop the strip entirely) — never target `.ss-topbar` internals from global CSS.',
}
