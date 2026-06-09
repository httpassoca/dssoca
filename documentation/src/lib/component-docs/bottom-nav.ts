import { type ComponentDoc, SIZE_PROP } from './types';

// SCAFFOLD STUB (DS-0043) — fleshed out by the BottomNav implementation (DS-0054).
export const bottomNav: ComponentDoc = {
  name: 'BottomNav',
  slug: 'bottom-nav',
  tagline: 'Fixed mobile tab bar.',
  description:
    'A fixed bottom navigation bar of equal-width icon+label tabs with an active highlight and safe-area inset support — the mobile counterpart to Topbar / Sidebar.',
  storyId: 'components-bottomnav--default',
  usage: `<script>
  import { BottomNav } from 'dssoca';
</script>

<BottomNav active="home" items={[{ id: 'home', label: 'Home', icon: 'grid' }]} />`,
  props: [
    { name: 'items', type: 'BottomNavItem[]', default: '[]', desc: 'Tabs: { id, label, icon, href?, badge? }.' },
    { name: 'active', type: 'string', desc: 'Active tab id (gets aria-current="page").' },
    { name: 'onSelect', type: '(id: string) => void', desc: 'Fired when a tab is selected.' },
    SIZE_PROP,
  ],
  notes: 'Implementation tracked in agile DS-0054.',
};
