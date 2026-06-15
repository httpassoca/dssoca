<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import BoxPlot from '$lib/components/BoxPlot.svelte'

  // Per-player score distributions — a short box = consistent scorer.
  const players = [
    {
      label: 'Ana',
      values: [20000, 21000, 19500, 22000, 20500, 23000, 21500, 20800],
      color: 'var(--ss-primary)',
    },
    {
      label: 'Bruno',
      values: [15000, 18000, 12000, 22000, 9000, 25000, 14000, 27000],
      color: 'var(--ss-blue)',
    },
    {
      label: 'Caio',
      values: [17000, 17500, 16800, 18200, 17000, 16500, 17300, 17100],
      color: 'var(--ss-purple)',
    },
    {
      label: 'Duda',
      values: [11000, 13000, 9500, 12500, 10000, 14000, 8000, 15000],
      color: 'var(--ss-cyan)',
    },
  ]

  const { Story } = defineMeta({
    title: 'Components/BoxPlot',
    component: BoxPlot,
    tags: ['autodocs'],
    argTypes: {
      groups: {
        control: 'object',
        description: 'One box per group: { label, values, color? }.',
      },
      showPoints: { control: 'boolean', description: 'Overlay every value as a jittered dot.' },
      yLabel: { control: 'text', description: 'Y axis caption.' },
      yDomain: { control: 'object', description: 'Force the y domain; defaults to the padded data extent.' },
      height: { control: 'number', description: 'Intrinsic drawing height in px.' },
      width: { control: 'number', description: 'Intrinsic drawing width in px.' },
      fluid: { control: 'boolean', description: 'Stretch to the container width via the viewBox.' },
      tooltip: { control: 'boolean', description: 'Reveal a tooltip on hover/focus of a box.' },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
    },
    args: { groups: players },
  })
</script>

<Story name="Default" args={{ groups: players, yLabel: 'Score' }} />

<Story name="Without points" args={{ groups: players, yLabel: 'Score', showPoints: false }} />

<Story name="Empty" args={{ groups: [] }} />

<Story name="Large (lg)" args={{ groups: players, yLabel: 'Score', size: 'lg' }} />
