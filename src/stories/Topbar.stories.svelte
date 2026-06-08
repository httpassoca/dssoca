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
      onCommand: {
        action: 'onCommand',
        description: 'Fired when the command menu opens (⌘K chip or Cmd/Ctrl+K).',
      },
      onUser: {
        action: 'onUser',
        description: 'Fired when the user chip is activated.',
      },
      sticky: {
        control: 'boolean',
        description: 'When true, the header sticks to the top of the viewport.',
      },
    },
    args: {
      tabs: ['overview', 'services', 'logs', 'shell'],
      active: 'overview',
      user: 'rafael@hub.home',
      sticky: true,
      onTab: () => {},
      onCommand: () => {},
      onUser: () => {},
    },
  });
</script>

{#snippet template(args: Record<string, unknown>)}
  <Topbar
    tabs={args.tabs as string[]}
    active={args.active as string}
    user={args.user as string}
    sticky={args.sticky as boolean}
    onTab={args.onTab as (tab: string) => void}
    onCommand={args.onCommand as () => void}
    onUser={args.onUser as () => void}
  />
{/snippet}

<Story name="Default" args={{ active: 'overview' }} />

<Story name="Services Active" args={{ active: 'services' }} />

<Story name="Logs Active" args={{ active: 'logs' }} />

<Story name="Non-sticky" args={{ active: 'overview', sticky: false }} />
