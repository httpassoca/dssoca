<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Tooltip from '$lib/components/Tooltip.svelte'
  import Button from '$lib/components/Button.svelte'

  const { Story } = defineMeta({
    title: 'Components/Tooltip',
    component: Tooltip,
    tags: ['autodocs'],
    // Shared `render: template` — the trigger snippet can't be passed via
    // `args`, so one template serves every story and forwards the args props.
    render: template,
    argTypes: {
      text: {
        control: 'text',
        description: 'Tooltip text (the accessible description of the trigger).',
      },
      placement: {
        control: 'inline-radio',
        options: ['top', 'bottom', 'left', 'right'],
        description: 'Side the tooltip attaches to relative to the trigger.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
    },
    args: {
      text: 'Restart the service',
      placement: 'top',
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  <Tooltip
    text={args.text as string}
    placement={args.placement as 'top' | 'bottom' | 'left' | 'right' | undefined}
    size={args.size as 'sm' | 'md' | 'lg' | undefined}
  >
    <Button>Hover me</Button>
  </Tooltip>
{/snippet}

<Story name="Default" args={{ placement: 'top' }} />

<Story name="Bottom" args={{ placement: 'bottom' }} />

<Story name="Left" args={{ placement: 'left' }} />

<Story name="Right" args={{ placement: 'right' }} />

<!-- Explicit token size override, independent of the global size axis -->
<Story name="Large (lg)" args={{ placement: 'top', size: 'lg' }} />
