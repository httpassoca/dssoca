<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Badge from '$lib/components/Badge.svelte'

  const { Story } = defineMeta({
    title: 'Components/Badge',
    component: Badge,
    tags: ['autodocs'],
    // `render` points at the shared `template` snippet below so every story can
    // drive the badge's text via the `text` arg (Badge takes its visible text as
    // a child snippet; the `label` PROP is the accessible name for label-less
    // badges).
    render: template,
    parameters: {
      a11y: { test: 'error' },
    },
    argTypes: {
      tone: {
        control: { type: 'inline-radio' },
        options: ['brand', 'neutral', 'positive', 'caution', 'critical', 'info'],
        description: 'Semantic tone of the badge; also controls the dot color.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
      dot: {
        control: 'boolean',
        description: 'Render the leading status dot (off by default).',
      },
      count: {
        control: { type: 'number', min: 0, step: 1 },
        description: 'Numeric badge, clamped to `max`. A count of 0 renders nothing.',
      },
      max: {
        control: { type: 'number', min: 1, step: 1 },
        description: 'Cap for `count`; values above render as `${max}+`. Defaults to 99.',
      },
      live: {
        control: 'boolean',
        description: 'Treat as a live status region (role="status" + aria-live="polite").',
      },
      label: {
        control: 'text',
        description: 'Accessible label — required for dot-only / count-only badges (WCAG 1.4.1).',
      },
      text: {
        control: 'text',
        description:
          'Story-only: visible text (rendered as the badge child snippet). Clear it for a dot/count-only badge.',
      },
    },
    args: {
      tone: 'neutral',
      dot: false,
      max: 99,
      live: false,
      label: '',
      text: 'archived',
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  {#if args.text}
    <Badge
      tone={args.tone as 'brand' | 'neutral' | 'positive' | 'caution' | 'critical' | 'info'}
      size={args.size as 'sm' | 'md' | 'lg' | undefined}
      dot={args.dot as boolean}
      count={args.count as number | undefined}
      max={args.max as number}
      live={args.live as boolean}
      label={(args.label as string) || undefined}
    >
      {args.text}
    </Badge>
  {:else}
    <!-- No children at all: exercises the dot-only / count-only paths -->
    <Badge
      tone={args.tone as 'brand' | 'neutral' | 'positive' | 'caution' | 'critical' | 'info'}
      size={args.size as 'sm' | 'md' | 'lg' | undefined}
      dot={args.dot as boolean}
      count={args.count as number | undefined}
      max={args.max as number}
      live={args.live as boolean}
      label={(args.label as string) || undefined}
    />
  {/if}
{/snippet}

<Story name="Brand" args={{ tone: 'brand', text: 'new' }} />

<Story name="Neutral" args={{ tone: 'neutral', text: 'archived' }} />

<Story name="Positive" args={{ tone: 'positive', text: 'up' }} />

<Story name="Caution" args={{ tone: 'caution', text: 'degraded' }} />

<Story name="Critical" args={{ tone: 'critical', text: 'down' }} />

<Story name="Info" args={{ tone: 'info', text: 'to_watch' }} />

<!-- Leading status dot, opt-in per badge -->
<Story name="WithDot" args={{ tone: 'positive', text: 'production', dot: true }} />

<!-- Dot-only badge: no visible text, so `label` carries the accessible name -->
<Story name="DotOnly" args={{ tone: 'caution', text: '', dot: true, label: 'auth degraded' }} />

<!-- Numeric badge clamped to `max` -->
<Story
  name="Count"
  args={{ tone: 'info', text: '', count: 120, max: 99, label: 'unread messages' }}
/>

<!-- Live status region: role="status" + aria-live announces tone/text changes -->
<Story name="Live" args={{ tone: 'positive', text: 'online', dot: true, live: true }} />
