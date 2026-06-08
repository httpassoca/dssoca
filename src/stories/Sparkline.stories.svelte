<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Sparkline from '$lib/components/Sparkline.svelte';

  const { Story } = defineMeta({
    title: 'Components/Sparkline',
    component: Sparkline,
    tags: ['autodocs'],
    argTypes: {
      data: {
        control: 'object',
        description: 'Array of numeric values rendered as bar heights.',
      },
      color: {
        control: 'color',
        description: 'Bar fill color. Defaults to var(--ss-primary).',
      },
    },
    args: {
      data: [10, 20, 15, 30, 25, 40, 35],
      color: 'var(--ss-primary)',
    },
  });
</script>

<Story name="Upward Trend" args={{ data: [5, 10, 15, 22, 30, 38, 50, 65, 80, 95] }} />

<Story name="Downward Trend" args={{ data: [95, 80, 70, 60, 48, 38, 28, 18, 10, 5] }} />

<Story name="Volatile" args={{ data: [40, 90, 20, 75, 10, 60, 30, 85, 15, 70] }} />

<Story name="Flat" args={{ data: [50, 52, 48, 51, 49, 50, 53, 47, 50, 51] }} />

<Story name="Custom Color" args={{ data: [5, 10, 15, 22, 30, 38, 50, 65, 80, 95], color: 'var(--ss-accent)' }} />
