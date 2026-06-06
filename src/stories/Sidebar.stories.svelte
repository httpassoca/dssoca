<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Sidebar from '$lib/components/Sidebar.svelte';

  type Status = 'up' | 'deg' | 'down';
  interface SideItem { id: string; label: string; icon: string; status?: Status }
  interface SideGroup { section: string; items: SideItem[] }

  const DEFAULT_GROUPS: SideGroup[] = [
    { section: 'platform', items: [
      { id: 'hub',   label: 'Hub',   icon: 'grid',     status: 'up' },
      { id: 'auth',  label: 'Auth',  icon: 'user',     status: 'up' },
      { id: 'caddy', label: 'Caddy', icon: 'settings', status: 'up' },
    ]},
    { section: 'services', items: [
      { id: 'movies', label: 'Movies', icon: 'film',  status: 'up' },
      { id: 'notes',  label: 'Notes',  icon: 'note',  status: 'up' },
      { id: 'tasks',  label: 'Tasks',  icon: 'check', status: 'up' },
    ]},
  ];

  const DEGRADED_GROUPS: SideGroup[] = [
    { section: 'platform', items: [
      { id: 'hub',   label: 'Hub',   icon: 'grid',     status: 'up' },
      { id: 'auth',  label: 'Auth',  icon: 'user',     status: 'deg' },
      { id: 'caddy', label: 'Caddy', icon: 'settings', status: 'down' },
    ]},
    { section: 'services', items: [
      { id: 'movies', label: 'Movies', icon: 'film',  status: 'up' },
      { id: 'notes',  label: 'Notes',  icon: 'note',  status: 'deg' },
      { id: 'tasks',  label: 'Tasks',  icon: 'check', status: 'up' },
    ]},
  ];

  const { Story } = defineMeta({
    title: 'Components/Sidebar',
    component: Sidebar,
    tags: ['autodocs'],
    // `render` points at the shared `template` snippet below. Sidebar is a
    // controlled component (parent owns `active`); each story sets its own
    // highlighted item and onSelect forwards to the Storybook actions panel.
    render: template,
    argTypes: {
      active: {
        control: 'text',
        description: 'ID of the currently highlighted nav item.',
      },
      groups: {
        control: 'object',
        description: 'Array of section groups, each containing id/label/icon/status items.',
      },
      onSelect: {
        action: 'onSelect',
        description: 'Callback fired with the item id when a nav item is clicked.',
      },
    },
    args: {
      active: 'hub',
      groups: DEFAULT_GROUPS,
      onSelect: () => {},
    },
  });
</script>

{#snippet template(args: Record<string, unknown>)}
  <Sidebar
    active={args.active as string}
    groups={args.groups as SideGroup[]}
    onSelect={args.onSelect as (id: string) => void}
  />
{/snippet}

<Story name="Default" args={{ active: 'hub', groups: DEFAULT_GROUPS }} />

<Story name="Services Active" args={{ active: 'movies', groups: DEFAULT_GROUPS }} />

<Story name="With Status Variants" args={{ active: 'hub', groups: DEGRADED_GROUPS }} />
