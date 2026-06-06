<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import MetricTile from '$lib/components/MetricTile.svelte';

  const { Story } = defineMeta({
    title: 'Components/MetricTile',
    component: MetricTile,
    tags: ['autodocs'],
    argTypes: {
      label: {
        control: 'text',
        description: 'Metric label shown above the value.',
      },
      value: {
        control: 'text',
        description: 'Primary numeric or text value.',
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
        description: 'Arrow direction and colour: up = positive, down = negative.',
      },
    },
    args: {
      label: 'req/min',
      value: '142',
      suffix: undefined,
      delta: undefined,
      dir: 'up',
    },
  });
</script>

<!-- Delta up — positive change -->
<Story
  name="Delta Up"
  args={{
    label: 'req/min',
    value: '142',
    delta: '↑12%',
    dir: 'up' as 'up' | 'down',
  }}
/>

<!-- Delta down — negative change -->
<Story
  name="Delta Down"
  args={{
    label: 'mem',
    value: '3.8',
    suffix: 'G',
    delta: '↑0.2G',
    dir: 'down' as 'up' | 'down',
  }}
/>

<!-- With suffix, no delta -->
<Story
  name="Suffix No Delta"
  args={{
    label: 'uptime',
    value: '14',
    suffix: 'd',
  }}
/>

<!-- Suffix + up delta -->
<Story
  name="Suffix With Delta Up"
  args={{
    label: 'p95',
    value: '48',
    suffix: 'ms',
    delta: '−6ms',
    dir: 'up' as 'up' | 'down',
  }}
/>

<!-- Fractional value + suffix + descriptive delta -->
<Story
  name="Descriptive Delta"
  args={{
    label: 'services',
    value: '6',
    suffix: '/7',
    delta: 'all healthy',
    dir: 'up' as 'up' | 'down',
  }}
/>

<!-- No delta, no suffix — bare value -->
<Story
  name="Bare Value"
  args={{
    label: 'active users',
    value: '31',
  }}
/>
