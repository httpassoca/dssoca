<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Sparkline from '$lib/components/Sparkline.svelte'

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
        description:
          'Bar/line fill color. Defaults to var(--ss-primary). Overridden when trend resolves a direction.',
      },
      variant: {
        control: 'inline-radio',
        options: ['bars', 'line', 'area'],
        description: 'Rendering style.',
      },
      trend: {
        control: 'inline-radio',
        options: ['none', 'auto', 'up', 'down', 'flat'],
        description: 'Colour by direction; auto derives from first-vs-last.',
      },
      fluid: {
        control: 'boolean',
        description: 'Flex to fill the container width.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
      label: {
        control: 'text',
        description:
          'Accessible label; overrides the auto-generated summary as the accessible name.',
      },
      min: {
        control: 'number',
        description: 'Lower bound of the scale (defaults to the data min).',
      },
      max: {
        control: 'number',
        description: 'Upper bound of the scale (defaults to the data max).',
      },
      width: {
        control: 'text',
        description: "Explicit CSS width (e.g. '120px', '100%'); overrides the intrinsic width.",
      },
    },
    args: {
      data: [10, 20, 15, 30, 25, 40, 35],
      color: 'var(--ss-primary)',
    },
  })
</script>

<Story name="Upward Trend" args={{ data: [5, 10, 15, 22, 30, 38, 50, 65, 80, 95] }} />

<Story name="Downward Trend" args={{ data: [95, 80, 70, 60, 48, 38, 28, 18, 10, 5] }} />

<Story name="Volatile" args={{ data: [40, 90, 20, 75, 10, 60, 30, 85, 15, 70] }} />

<Story name="Flat" args={{ data: [50, 52, 48, 51, 49, 50, 53, 47, 50, 51] }} />

<Story
  name="Custom Color"
  args={{ data: [5, 10, 15, 22, 30, 38, 50, 65, 80, 95], color: 'var(--ss-accent)' }}
/>

<Story
  name="Trend Auto (rising)"
  args={{ data: [5, 10, 15, 22, 30, 38, 50, 65, 80, 95], trend: 'auto' }}
/>

<Story
  name="Trend Auto (falling)"
  args={{ data: [95, 80, 70, 60, 48, 38, 28, 18, 10, 5], trend: 'auto' }}
/>

<Story
  name="Line"
  args={{ data: [5, 10, 15, 22, 30, 38, 50, 65, 80, 95], variant: 'line', trend: 'auto' }}
/>

<Story
  name="Area"
  args={{ data: [5, 10, 15, 22, 30, 38, 50, 65, 80, 95], variant: 'area', trend: 'auto' }}
/>

<Story
  name="Near-flat (min-normalised)"
  args={{ data: [48, 50, 52, 49, 51, 50, 53, 47, 50, 51] }}
/>

<Story
  name="Fluid"
  args={{
    data: [40, 90, 20, 75, 10, 60, 30, 85, 15, 70],
    fluid: true,
    variant: 'area',
    trend: 'auto',
  }}
/>

<Story name="Empty" args={{ data: [] }} />

<Story name="Single point" args={{ data: [42] }} />

<!-- Explicit token size override, independent of the global size axis -->
<Story
  name="Large (lg)"
  args={{ data: [5, 10, 15, 22, 30, 38, 50, 65, 80, 95], size: 'lg', trend: 'auto' }}
/>
