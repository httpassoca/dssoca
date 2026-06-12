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
    // badges). `dismissible` is a story-only boolean toggling `ondismiss`.
    render: template,
    parameters: {
      a11y: { test: 'error' },
    },
    argTypes: {
      tone: {
        control: { type: 'inline-radio' },
        options: ['up', 'deg', 'down', 'maint', 'info', 'neutral'],
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
        description:
          'Accessible label — required for dot-only / count-only badges (WCAG 1.4.1); also names the dismiss target.',
      },
      text: {
        control: 'text',
        description:
          'Story-only: visible text (rendered as the badge child snippet). Clear it for a dot/count-only badge.',
      },
      dismissible: {
        control: 'boolean',
        description: 'Story-only: render the trailing dismiss button by providing `ondismiss`.',
      },
      ondismiss: { action: 'ondismiss', description: 'Fired when the dismiss button is pressed.' },
    },
    args: {
      tone: 'info',
      dot: false,
      max: 99,
      live: false,
      label: '',
      text: 'to_watch',
      dismissible: false,
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  {#if args.text}
    <Badge
      tone={args.tone as 'up' | 'deg' | 'down' | 'maint' | 'info' | 'neutral'}
      size={args.size as 'sm' | 'md' | 'lg' | undefined}
      dot={args.dot as boolean}
      count={args.count as number | undefined}
      max={args.max as number}
      live={args.live as boolean}
      label={(args.label as string) || undefined}
      ondismiss={args.dismissible ? (args.ondismiss as () => void) : undefined}
    >
      {args.text}
    </Badge>
  {:else}
    <!-- No children at all: exercises the dot-only / count-only paths -->
    <Badge
      tone={args.tone as 'up' | 'deg' | 'down' | 'maint' | 'info' | 'neutral'}
      size={args.size as 'sm' | 'md' | 'lg' | undefined}
      dot={args.dot as boolean}
      count={args.count as number | undefined}
      max={args.max as number}
      live={args.live as boolean}
      label={(args.label as string) || undefined}
      ondismiss={args.dismissible ? (args.ondismiss as () => void) : undefined}
    />
  {/if}
{/snippet}

<Story name="Up" args={{ tone: 'up', text: 'up' }} />

<Story name="Degraded" args={{ tone: 'deg', text: 'degraded' }} />

<Story name="Down" args={{ tone: 'down', text: 'down' }} />

<Story name="Info" args={{ tone: 'info', text: 'to_watch' }} />

<Story name="Neutral" args={{ tone: 'neutral', text: 'archived' }} />

<!-- Leading status dot, opt-in per badge -->
<Story name="WithDot" args={{ tone: 'up', text: 'production', dot: true }} />

<!-- Dot-only badge: no visible text, so `label` carries the accessible name -->
<Story name="DotOnly" args={{ tone: 'deg', text: '', dot: true, label: 'auth degraded' }} />

<!-- Numeric badge clamped to `max` -->
<Story
  name="Count"
  args={{ tone: 'info', text: '', count: 120, max: 99, label: 'unread messages' }}
/>

<!-- Live status region: role="status" + aria-live announces tone/text changes -->
<Story name="Live" args={{ tone: 'up', text: 'online', dot: true, live: true }} />

<!-- Trailing keyboard-focusable dismiss button -->
<Story
  name="Dismissible"
  args={{ tone: 'neutral', text: 'filter: webdev', dismissible: true, label: 'filter webdev' }}
/>
