<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import MetricTile from '$lib/components/MetricTile.svelte'
  import Sparkline from '$lib/components/Sparkline.svelte'

  const { Story } = defineMeta({
    title: 'Components/MetricTile',
    component: MetricTile,
    tags: ['autodocs'],
    // `render` points at the shared `template` snippet below so the optional
    // `chart` snippet slot can be toggled via the story-only `withChart` boolean.
    render: template,
    argTypes: {
      label: {
        control: 'text',
        description: 'Metric label shown above the value.',
      },
      value: {
        control: 'text',
        description: 'Primary numeric or text value.',
      },
      prefix: {
        control: 'text',
        description: 'Leading unit (e.g. $ / €); rendered faint like the suffix.',
      },
      suffix: {
        control: 'text',
        description: 'Optional unit appended to the value (e.g. ms, G, d).',
      },
      delta: {
        control: 'text',
        description: 'Optional change indicator text. Omit for no delta row.',
      },
      dir: {
        control: { type: 'inline-radio' },
        options: ['up', 'down'],
        description: 'Arrow direction of the delta.',
      },
      trend: {
        control: { type: 'inline-radio' },
        options: ['positive', 'negative', 'neutral'],
        description:
          'Good/bad colour for the delta, decoupled from `dir` (a rising error rate is negative). Defaults: up=positive, down=negative.',
      },
      deltaLabel: {
        control: 'text',
        description: 'Comparison-period label rendered faint after the delta ("vs prev 7d").',
      },
      emphasis: {
        control: 'boolean',
        description: 'Render the delta as a soft sentiment chip (non-colour redundancy).',
      },
      loading: {
        control: 'boolean',
        description: 'Skeleton state: hides the real value behind aria-hidden bars.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
      withChart: {
        control: 'boolean',
        description: 'Story-only: drop a demo <Sparkline> into the `chart` snippet slot.',
      },
    },
    args: {
      label: 'req/min',
      value: '142',
      prefix: undefined,
      suffix: undefined,
      delta: undefined,
      dir: 'up',
      trend: undefined,
      deltaLabel: undefined,
      emphasis: false,
      loading: false,
      withChart: false,
    },
  })
</script>

{#snippet chartDemo()}
  <Sparkline data={[12, 18, 14, 22, 28, 24, 34, 40]} trend="auto" label="req/min, last 8 samples" />
{/snippet}

{#snippet template(args: Record<string, unknown>)}
  <MetricTile
    label={args.label as string}
    value={args.value as string | number}
    prefix={(args.prefix as string) || undefined}
    suffix={(args.suffix as string) || undefined}
    delta={(args.delta as string) || undefined}
    dir={args.dir as 'up' | 'down'}
    trend={args.trend as 'positive' | 'negative' | 'neutral' | undefined}
    deltaLabel={(args.deltaLabel as string) || undefined}
    emphasis={args.emphasis as boolean}
    loading={args.loading as boolean}
    size={args.size as 'sm' | 'md' | 'lg' | undefined}
    chart={args.withChart ? chartDemo : undefined}
  />
{/snippet}

<!-- Delta up — positive change -->
<Story name="Delta Up" args={{ label: 'req/min', value: '142', delta: '↑12%', dir: 'up' }} />

<!-- Delta down — negative change -->
<Story
  name="Delta Down"
  args={{ label: 'mem', value: '3.8', suffix: 'G', delta: '↑0.2G', dir: 'down' }}
/>

<!-- With suffix, no delta -->
<Story name="Suffix No Delta" args={{ label: 'uptime', value: '14', suffix: 'd' }} />

<!-- Suffix + up delta -->
<Story
  name="Suffix With Delta Up"
  args={{ label: 'p95', value: '48', suffix: 'ms', delta: '−6ms', dir: 'up' }}
/>

<!-- Fractional value + suffix + descriptive delta -->
<Story
  name="Descriptive Delta"
  args={{ label: 'services', value: '6', suffix: '/7', delta: 'all healthy', dir: 'up' }}
/>

<!-- No delta, no suffix — bare value -->
<Story name="Bare Value" args={{ label: 'active users', value: '31' }} />

<!-- Leading currency unit -->
<Story
  name="Prefix (currency)"
  args={{
    label: 'monthly cost',
    value: '12.40',
    prefix: '$',
    delta: '↓$1.10',
    dir: 'down',
    trend: 'positive',
  }}
/>

<!-- Rising error rate: arrow up but sentiment negative -->
<Story
  name="Trend Decoupled"
  args={{
    label: 'error rate',
    value: '2.4',
    suffix: '%',
    delta: '↑0.8%',
    dir: 'up',
    trend: 'negative',
    deltaLabel: 'vs prev 7d',
    emphasis: true,
  }}
/>

<!-- Skeleton/loading state -->
<Story name="Loading" args={{ label: 'req/min', value: '142', loading: true }} />

<!-- Sparkline dropped into the chart snippet slot -->
<Story
  name="With Chart"
  args={{ label: 'req/min', value: '142', delta: '↑12%', dir: 'up', withChart: true }}
/>
