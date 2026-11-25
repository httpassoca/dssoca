<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Tabs, { type TabItem } from '$lib/components/Tabs.svelte'

  const SERVICE: TabItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'logs', label: 'Logs' },
    { id: 'shell', label: 'Shell' },
  ]

  const WITH_ICONS: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: 'grid' },
    { id: 'logs', label: 'Logs', icon: 'logs' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ]

  const MANY: TabItem[] = Array.from({ length: 14 }, (_, i) => ({
    id: `svc-${i + 1}`,
    label: `service-${i + 1}`,
  }))

  const { Story } = defineMeta({
    title: 'Components/Tabs',
    component: Tabs,
    tags: ['autodocs'],
    render: template,
    parameters: {
      // Tablist semantics + roving tabindex — keep the a11y addon strict.
      a11y: { test: 'error' },
    },
    argTypes: {
      tabs: {
        control: 'object',
        description: 'The tabs, in order: { id, label, icon?, disabled? }.',
      },
      value: {
        control: 'text',
        description: 'Id of the selected tab (bindable).',
      },
      label: {
        control: 'text',
        description: 'Accessible name for the tab list (required, WCAG 2.2 AA).',
      },
      activation: {
        control: { type: 'inline-radio' },
        options: ['auto', 'manual'],
        description: 'auto: focus selects. manual: Enter / Space select.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
      onChange: {
        action: 'onChange',
        description: 'Fired when the selection changes, with the id and { reason }.',
      },
    },
    args: {
      tabs: SERVICE,
      value: 'overview',
      label: 'Service',
      activation: 'auto',
      onChange: () => {},
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  <Tabs
    tabs={args.tabs as TabItem[]}
    value={args.value as string}
    label={args.label as string}
    activation={args.activation as 'auto' | 'manual'}
    size={args.size as 'sm' | 'md' | 'lg' | undefined}
    onChange={args.onChange as (value: string) => void}
  >
    {#snippet panel(tab)}
      <p style="margin: 0">Content for {tab.label}.</p>
    {/snippet}
  </Tabs>
{/snippet}

<Story name="Default" />

<Story name="With icons" args={{ tabs: WITH_ICONS, value: 'logs' }} />

<Story
  name="With a disabled tab"
  args={{
    tabs: [
      { id: 'overview', label: 'Overview' },
      { id: 'logs', label: 'Logs', disabled: true },
      { id: 'shell', label: 'Shell' },
    ],
  }}
/>

<!-- Arrows only move focus; Enter / Space select -->
<Story name="Manual activation" args={{ activation: 'manual' }} />

<!-- The strip scrolls horizontally instead of wrapping -->
<Story name="Many tabs (scrolls)" args={{ tabs: MANY, value: 'svc-1', label: 'Services' }} />

<!-- Explicit token size override, independent of the global size axis -->
<Story name="Small" args={{ size: 'sm' }} />
