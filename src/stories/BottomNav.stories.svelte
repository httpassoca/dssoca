<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BottomNav from '$lib/components/BottomNav.svelte';

  interface BottomNavItem {
    id: string;
    label: string;
    icon: string;
    href?: string;
    badge?: string | number;
  }

  const DEFAULT_ITEMS: BottomNavItem[] = [
    { id: 'home',     label: 'Home',     icon: 'grid' },
    { id: 'services', label: 'Services', icon: 'database' },
    { id: 'activity', label: 'Activity', icon: 'activity' },
    { id: 'account',  label: 'Account',  icon: 'user' },
  ];

  const BADGED_ITEMS: BottomNavItem[] = [
    { id: 'home',     label: 'Home',     icon: 'grid' },
    { id: 'inbox',    label: 'Inbox',    icon: 'note', badge: 3 },
    { id: 'activity', label: 'Activity', icon: 'activity', badge: 12 },
    { id: 'account',  label: 'Account',  icon: 'user' },
  ];

  const { Story } = defineMeta({
    title: 'Components/BottomNav',
    component: BottomNav,
    tags: ['autodocs'],
    // BottomNav is fixed to the viewport bottom; reserve space so the bar
    // doesn't overlap the Storybook docs frame.
    render: template,
    argTypes: {
      active: { control: 'text', description: 'Id of the active tab.' },
      items: { control: 'object', description: 'Tabs ({ id, label, icon, href?, badge? }).' },
      onSelect: { action: 'onSelect', description: 'Fired with the tab id on activation.' },
    },
    args: {
      active: 'home',
      items: DEFAULT_ITEMS,
      onSelect: () => {},
    },
  });
</script>

{#snippet template(args: Record<string, unknown>)}
  <div style="position: relative; min-height: 96px;">
    <BottomNav
      active={args.active as string}
      items={args.items as BottomNavItem[]}
      onSelect={args.onSelect as (id: string) => void}
    />
  </div>
{/snippet}

<Story name="Default" args={{ active: 'home', items: DEFAULT_ITEMS }} />

<Story name="Services Active" args={{ active: 'services', items: DEFAULT_ITEMS }} />

<Story name="With Badges" args={{ active: 'home', items: BADGED_ITEMS }} />
