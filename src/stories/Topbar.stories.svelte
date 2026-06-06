<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Topbar from '$lib/components/Topbar.svelte';

  const { Story } = defineMeta({
    title: 'Components/Topbar',
    component: Topbar,
    tags: ['autodocs'],
    // `render` points at the shared `template` snippet below. Topbar is a
    // controlled component (parent owns `active`); each story sets its own
    // active tab and onTab forwards to the Storybook actions panel.
    render: template,
    argTypes: {
      tabs: {
        control: 'object',
        description: 'Ordered list of tab name strings rendered in the nav strip.',
      },
      active: {
        control: 'text',
        description: 'Name of the currently highlighted tab.',
      },
      user: {
        control: 'text',
        description: 'User label shown on the right side of the topbar.',
      },
      onTab: {
        action: 'onTab',
        description: 'Callback fired with the tab name when a tab is clicked.',
      },
    },
    args: {
      tabs: ['overview', 'services', 'logs', 'shell'],
      active: 'overview',
      user: 'rafael@hub.home',
      onTab: () => {},
    },
  });
</script>

{#snippet template(args: Record<string, unknown>)}
  <Topbar
    tabs={args.tabs as string[]}
    active={args.active as string}
    user={args.user as string}
    onTab={args.onTab as (tab: string) => void}
  />
{/snippet}

<Story name="Default" args={{ active: 'overview' }} />

<Story name="Services Active" args={{ active: 'services' }} />

<Story name="Logs Active" args={{ active: 'logs' }} />
