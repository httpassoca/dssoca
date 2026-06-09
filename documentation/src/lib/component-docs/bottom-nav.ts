import { type ComponentDoc, SIZE_PROP } from './types';

export const bottomNav: ComponentDoc = {
  name: 'BottomNav',
  slug: 'bottom-nav',
  tagline: 'Fixed, thumb-reachable bottom tab bar.',
  description:
    'A fixed, bottom-anchored row of equal-width icon+label tabs for mobile/compact app shells: a blurred, elevated `<nav>` + `<ul>/<li>` list with an active highlight, optional per-tab count badges, and safe-area inset padding. Tabs can be real links (`href`) or selection buttons. Ported from a mobile bottom-nav pattern.',
  storyId: 'components-bottomnav--default',
  usage: `<script>
  import { BottomNav } from 'dssoca';

  let active = $state('home');
  const items = [
    { id: 'home',     label: 'Home',     icon: 'grid' },
    { id: 'services', label: 'Services', icon: 'flex' },
    { id: 'activity', label: 'Activity', icon: 'activity', badge: 3 },
    { id: 'account',  label: 'Account',  icon: 'user' },
  ];
</script>

<BottomNav {items} {active} onSelect={(id) => (active = id)} />`,
  props: [
    { name: 'items', type: 'BottomNavItem[]', desc: 'Tabs ({ id, label, icon, href?, badge? }) rendered left → right in equal-width columns; has a built-in default.' },
    { name: 'active', type: 'string', desc: 'Id of the active tab; highlighted and marked `aria-current="page"`.' },
    { name: 'onSelect', type: '(id: string) => void', desc: 'Fired with the tab id on activation (also fires for `href` tabs as an SPA fallback).' },
    { name: 'ariaLabel', type: 'string', default: "'Primary'", desc: 'Accessible name for the wrapping `<nav>` landmark.' },
    SIZE_PROP,
  ],
  notes:
    'Exports the `BottomNavItem` type from `dssoca`. Fixed to the viewport bottom with a blurred/elevated background; the bar height derives from `--ss-bottom-nav-h` (tracks `--ss-shell-top-h`) so it rescales with the size axis. Each tab is a ≥44px hit target (WCAG 2.5.8) and reserves `env(safe-area-inset-bottom)`. A tab renders as `<a href>` when `href` is set, otherwise a `<button>`; count `badge`s fold into the tab\'s accessible name.',
};
