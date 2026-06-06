<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ServiceCard from '$lib/components/ServiceCard.svelte';

  const { Story } = defineMeta({
    title: 'Components/ServiceCard',
    component: ServiceCard,
    tags: ['autodocs'],
    argTypes: {
      name: {
        control: 'text',
        description: 'Service name displayed as the card title.',
      },
      host: {
        control: 'text',
        description: 'Hostname or address shown below the name.',
      },
      status: {
        control: { type: 'inline-radio' },
        options: ['up', 'deg', 'down'],
        description: 'Service health status; drives Badge tone and sparkline color.',
      },
      latency: {
        control: 'text',
        description: 'Latency string displayed in the status row (e.g. "4ms" or "—").',
      },
      spark: {
        control: 'object',
        description: 'Sparkline data points array.',
      },
    },
    args: {
      name: 'movies-api',
      host: 'movies.home',
      status: 'up',
      latency: '4ms',
      spark: [4, 8, 6, 10, 7, 12, 9, 14, 11, 16, 13, 10, 12],
      onclick: () => {},
    },
  });
</script>

<Story name="Up" args={{ name: 'movies-api', host: 'movies.home', status: 'up', latency: '4ms' }} />

<Story name="Degraded" args={{ name: 'notes-api', host: 'notes.home', status: 'deg', latency: '320ms', spark: [14, 10, 12, 8, 6, 4, 7, 5, 3, 6, 4, 2, 5] }} />

<Story name="Down" args={{ name: 'tasks-api', host: 'tasks.home', status: 'down', latency: '—', spark: [10, 8, 6, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0] }} />

<Story name="No Latency" args={{ name: 'caddy', host: ':80 :443', status: 'up', latency: '' }} />
