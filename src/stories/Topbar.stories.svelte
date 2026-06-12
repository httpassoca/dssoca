<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Topbar, { type TopbarTab, type TopbarServices } from '$lib/components/Topbar.svelte';

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
        description:
          'Ordered tab strip: plain strings (id = label) or `{ id, label?, href? }` objects — `href` tabs render as real links.',
      },
      active: {
        control: 'text',
        description: 'Id of the currently highlighted tab.',
      },
      user: {
        control: 'text',
        description: 'User label shown on the right side of the topbar.',
      },
      services: {
        control: 'object',
        description:
          'Services status segment: true (built-in 6/7), `{ up, total }`, or false to hide.',
      },
      clock: {
        control: 'boolean',
        description: 'Show the live clock segment.',
      },
      onTab: {
        action: 'onTab',
        description: 'Callback fired with the tab id when a tab is clicked.',
      },
      onCommand: {
        action: 'onCommand',
        description:
          'Fired when the command menu opens (⌘K chip or Cmd/Ctrl+K). The chip only renders when this is provided.',
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
      user: 'admin@hub.home',
      services: true,
      clock: true,
      sticky: true,
      onTab: () => {},
      onCommand: () => {},
      onUser: () => {},
    },
  });
</script>

{#snippet template(args: Record<string, unknown>)}
  <Topbar
    tabs={args.tabs as Array<string | TopbarTab>}
    active={args.active as string}
    user={args.user as string}
    services={args.services as boolean | TopbarServices}
    clock={args.clock as boolean}
    stats={args.stats as { key: string; value: string; title?: string }[] | undefined}
    sticky={args.sticky as boolean}
    onTab={args.onTab as (tab: string) => void}
    onCommand={args.onCommand as (() => void) | undefined}
    onUser={args.onUser as () => void}
  />
{/snippet}

<Story name="Default" args={{ active: 'overview' }} />

<Story name="Services Active" args={{ active: 'services' }} />

<Story name="Logs Active" args={{ active: 'logs' }} />

<Story name="Non-sticky" args={{ active: 'overview', sticky: false }} />

<!-- DS-0080: object tabs with href render as real <a href> links; the active
     tab is matched by id (label stays free to localize). -->
<Story
  name="Link Tabs"
  args={{
    active: 'work',
    tabs: [
      { id: 'home', label: 'Home', href: '#home' },
      { id: 'work', label: 'Work', href: '#work' },
      { id: 'about', label: 'About', href: '#about' },
    ],
  }}
/>

<!-- DS-0081: chrome opt-out — no services dot, no clock, no stats; the ⌘K
     chip disappears by itself because no onCommand handler is passed. -->
<Story
  name="Minimal (no chrome)"
  args={{
    active: 'work',
    user: 'gui@passoca.dev',
    services: false,
    clock: false,
    stats: [],
    onCommand: undefined,
    tabs: [
      { id: 'home', label: 'Home', href: '#home' },
      { id: 'work', label: 'Work', href: '#work' },
    ],
  }}
/>

<!-- DS-0081: real service numbers instead of the built-in 6/7 demo data. -->
<Story name="Custom Services Count" args={{ active: 'overview', services: { up: 2, total: 3 } }} />

<!-- DS-0082: with many tabs the strip shrinks and scrolls horizontally
     instead of overflowing the bar; stats hide ≤720px, the strip hides
     ≤520px (pair with BottomNav on mobile). Resize the viewport to see it. -->
<Story
  name="Many Tabs (responsive strip)"
  args={{
    active: 'metrics',
    tabs: [
      'overview', 'services', 'logs', 'shell', 'metrics',
      'alerts', 'backups', 'network', 'storage', 'settings',
    ],
  }}
/>
