<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Tooltip from '$lib/components/Tooltip.svelte'
  import Button from '$lib/components/Button.svelte'
  import Kbd from '$lib/components/Kbd.svelte'

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
        description:
          'Tooltip content (the accessible description of the trigger): a string, or a snippet for a small rendered template.',
      },
      rich: {
        control: 'boolean',
        description:
          'Story-only switch: render the tip from a snippet (label + code + Kbd) instead of the `text` string.',
      },
      placement: {
        control: 'inline-radio',
        options: ['top', 'bottom', 'left', 'right'],
        description: 'Preferred side the tooltip attaches to relative to the trigger.',
      },
      avoidCollisions: {
        control: 'boolean',
        description:
          'Flip/shift the tip when the preferred side has no room inside the viewport or an overflow-clipping ancestor (DS-0146).',
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
      rich: false,
      avoidCollisions: true,
    },
  })
</script>

<!-- A snippet tip (DS-0144): phrasing content only and nothing interactive — the
     tip is pointer-events: none and hidden while closed (WAI-ARIA tooltip pattern). -->
{#snippet richTip()}
  <strong>Copy path</strong>
  <code>/srv/app</code>
  <Kbd keys="mod+c" size="sm" />
{/snippet}

{#snippet template(args: Record<string, unknown>)}
  <Tooltip
    text={args.rich ? richTip : (args.text as string)}
    placement={args.placement as 'top' | 'bottom' | 'left' | 'right' | undefined}
    avoidCollisions={args.avoidCollisions as boolean | undefined}
    size={args.size as 'sm' | 'md' | 'lg' | undefined}
  >
    <Button>Hover me</Button>
  </Tooltip>
{/snippet}

<!-- Collision avoidance (DS-0146): triggers pinned to the viewport edges, each
     preferring a side with no room, plus one inside a scrolling box. Every tip
     flips inward / shifts along the edge; untick `avoidCollisions` to compare. -->
{#snippet edges(args: Record<string, unknown>)}
  {@const ac = args.avoidCollisions as boolean | undefined}
  {@const text = args.text as string}
  <div style="position: fixed; top: 8px; left: 8px">
    <Tooltip {text} placement="top" avoidCollisions={ac}><Button>top-left ↑</Button></Tooltip>
  </div>
  <div style="position: fixed; top: 8px; right: 8px">
    <Tooltip {text} placement="top" avoidCollisions={ac}><Button>top-right ↑</Button></Tooltip>
  </div>
  <div style="position: fixed; top: 50%; left: 8px; transform: translateY(-50%)">
    <Tooltip {text} placement="left" avoidCollisions={ac}><Button>← left</Button></Tooltip>
  </div>
  <div style="position: fixed; top: 50%; right: 8px; transform: translateY(-50%)">
    <Tooltip {text} placement="right" avoidCollisions={ac}><Button>right →</Button></Tooltip>
  </div>
  <div style="position: fixed; bottom: 8px; left: 50%; transform: translateX(-50%)">
    <Tooltip {text} placement="bottom" avoidCollisions={ac}><Button>bottom ↓</Button></Tooltip>
  </div>
  <div
    style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 240px; height: 120px; overflow: auto; border: 1px dashed var(--ss-line); padding: 8px 8px 160px"
  >
    <p style="margin: 0 0 4px; font: var(--ss-ui-xs) var(--ss-font-mono); color: var(--ss-fg-dim)">
      overflow: auto box — the tip stays inside it
    </p>
    <Tooltip {text} placement="top" avoidCollisions={ac}><Button>in a scroll box</Button></Tooltip>
  </div>
{/snippet}

<Story name="Default" args={{ placement: 'top' }} />

<Story name="Bottom" args={{ placement: 'bottom' }} />

<Story name="Left" args={{ placement: 'left' }} />

<Story name="Right" args={{ placement: 'right' }} />

<!-- Explicit token size override, independent of the global size axis -->
<Story name="Large (lg)" args={{ placement: 'top', size: 'lg' }} />

<!-- `text` as a snippet: a small rendered template inside the tip -->
<Story name="Rich content" args={{ placement: 'top', rich: true }} />

<!-- Collision avoidance: every trigger sits where its preferred side has no room -->
<Story name="Edge of viewport" args={{ text: 'Flips and shifts to stay visible' }}>
  {#snippet template(args: Record<string, unknown>)}
    {@render edges(args)}
  {/snippet}
</Story>
