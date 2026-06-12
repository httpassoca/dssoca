<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Sidebar, { type SideGroup } from '$lib/components/Sidebar.svelte'

  const DEFAULT_GROUPS: SideGroup[] = [
    {
      section: 'platform',
      items: [
        { id: 'hub', label: 'Hub', icon: 'grid', status: 'up' },
        { id: 'auth', label: 'Auth', icon: 'user', status: 'up' },
        { id: 'caddy', label: 'Caddy', icon: 'settings', status: 'up' },
      ],
    },
    {
      section: 'services',
      items: [
        { id: 'movies', label: 'Movies', icon: 'film', status: 'up' },
        { id: 'notes', label: 'Notes', icon: 'note', status: 'up' },
        { id: 'tasks', label: 'Tasks', icon: 'check', status: 'up' },
      ],
    },
  ]

  const DEGRADED_GROUPS: SideGroup[] = [
    {
      section: 'platform',
      items: [
        { id: 'hub', label: 'Hub', icon: 'grid', status: 'up' },
        { id: 'auth', label: 'Auth', icon: 'user', status: 'deg' },
        { id: 'caddy', label: 'Caddy', icon: 'settings', status: 'down' },
      ],
    },
    {
      section: 'services',
      items: [
        { id: 'movies', label: 'Movies', icon: 'film', status: 'up' },
        { id: 'notes', label: 'Notes', icon: 'note', status: 'deg' },
        { id: 'tasks', label: 'Tasks', icon: 'check', status: 'up' },
      ],
    },
  ]

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
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
      collapsed: {
        control: 'boolean',
        description: 'Collapse to an icon-only rail; labels/section text are hidden.',
      },
      onSelect: {
        action: 'onSelect',
        description: 'Callback fired with the item id when a nav item is clicked.',
      },
      onToggleCollapsed: {
        action: 'onToggleCollapsed',
        description: 'Fired when the built-in collapse toggle is pressed.',
      },
    },
    args: {
      active: 'hub',
      groups: DEFAULT_GROUPS,
      collapsed: false,
      onSelect: () => {},
      onToggleCollapsed: () => {},
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  <Sidebar
    active={args.active as string}
    groups={args.groups as SideGroup[]}
    size={args.size as 'sm' | 'md' | 'lg' | undefined}
    collapsed={args.collapsed as boolean}
    onSelect={args.onSelect as (id: string) => void}
    onToggleCollapsed={args.onToggleCollapsed as (collapsed: boolean) => void}
  />
{/snippet}

<Story name="Default" args={{ active: 'hub', groups: DEFAULT_GROUPS }} />

<Story name="Services Active" args={{ active: 'movies', groups: DEFAULT_GROUPS }} />

<Story name="With Status Variants" args={{ active: 'hub', groups: DEGRADED_GROUPS }} />

<!-- Icon-only rail: labels/section text hidden; accessible names persist -->
<Story name="Collapsed" args={{ active: 'hub', groups: DEFAULT_GROUPS, collapsed: true }} />

<!-- Explicit token size override, independent of the global size axis -->
<Story name="Compact (sm)" args={{ active: 'hub', groups: DEFAULT_GROUPS, size: 'sm' }} />
