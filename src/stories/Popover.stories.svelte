<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Popover from '$lib/components/Popover.svelte'
  import Button from '$lib/components/Button.svelte'
  import Switch from '$lib/components/Switch.svelte'

  const { Story } = defineMeta({
    title: 'Components/Popover',
    component: Popover,
    tags: ['autodocs'],
    render: template,
    parameters: {
      a11y: { test: 'error' },
    },
    argTypes: {
      open: {
        control: 'boolean',
        description: 'Open state (bindable).',
      },
      side: {
        control: { type: 'inline-radio' },
        options: ['bottom', 'top'],
        description: 'Vertical side the panel opens toward.',
      },
      align: {
        control: { type: 'inline-radio' },
        options: ['start', 'end'],
        description: 'Horizontal edge the panel aligns to.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
      label: {
        control: 'text',
        description:
          'Accessible label for the panel (role="dialog"); falls back to the trigger text.',
      },
      onOpenChange: {
        action: 'onOpenChange',
        description: 'Fired when the popover opens or closes itself, with { reason }.',
      },
    },
    args: {
      open: false,
      side: 'bottom',
      align: 'start',
      label: 'Filters',
      onOpenChange: () => {},
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  <!-- Room for the panel on either side of the trigger. -->
  <div style="display: flex; justify-content: center; padding: 140px 0;">
    <Popover
      open={args.open as boolean}
      side={args.side as 'bottom' | 'top'}
      align={args.align as 'start' | 'end'}
      size={args.size as 'sm' | 'md' | 'lg' | undefined}
      label={args.label as string}
      onOpenChange={args.onOpenChange as (open: boolean) => void}
    >
      {#snippet trigger()}{args.label}{/snippet}
      <div style="display: grid; gap: var(--ss-s-3);">
        <Switch label="Only failing" />
        <Switch label="Include archived" />
        <Button variant="secondary">Apply</Button>
      </div>
    </Popover>
  </div>
{/snippet}

<Story name="Default" />

<Story name="Open" args={{ open: true }} />

<Story name="Top, aligned end" args={{ open: true, side: 'top', align: 'end' }} />

<!-- Explicit token size override, independent of the global size axis -->
<Story name="Small" args={{ open: true, size: 'sm' }} />
