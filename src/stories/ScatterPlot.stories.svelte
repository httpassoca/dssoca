<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import ScatterPlot from '$lib/components/ScatterPlot.svelte'

  // Skill (avg score, y) vs consistency (x) — the "always 2nd" quadrant view.
  const players = [
    { label: 'Ana', x: 8.9, y: 7.5, size: 27, color: 'var(--ss-primary)' },
    { label: 'Bruno', x: 8.5, y: 5.7, size: 14, color: 'var(--ss-blue)' },
    { label: 'Caio', x: 7.7, y: 4.5, size: 7, color: 'var(--ss-purple)' },
    { label: 'Duda', x: 6.8, y: 2.4, size: 4, color: 'var(--ss-cyan)' },
  ]

  const plain = [
    { label: 'A', x: 12, y: 40 },
    { label: 'B', x: 28, y: 22 },
    { label: 'C', x: 18, y: 33 },
    { label: 'D', x: 35, y: 12 },
    { label: 'E', x: 22, y: 27 },
  ]

  const { Story } = defineMeta({
    title: 'Components/ScatterPlot',
    component: ScatterPlot,
    tags: ['autodocs'],
    argTypes: {
      points: {
        control: 'object',
        description: 'One dot per datum: { label, x, y, size?, color? }.',
      },
      xLabel: { control: 'text', description: 'X axis caption.' },
      yLabel: { control: 'text', description: 'Y axis caption.' },
      xRef: { control: 'number', description: 'Dashed vertical reference line (quadrants).' },
      yRef: { control: 'number', description: 'Dashed horizontal reference line (quadrants).' },
      showLabels: { control: 'boolean', description: 'Draw each point label next to its dot.' },
      height: { control: 'number', description: 'Intrinsic drawing height in px.' },
      width: { control: 'number', description: 'Intrinsic drawing width in px.' },
      fluid: { control: 'boolean', description: 'Stretch to the container width via the viewBox.' },
      tooltip: { control: 'boolean', description: 'Reveal a tooltip on hover/focus of a point.' },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
    },
    args: { points: players },
  })
</script>

<Story
  name="Quadrants"
  args={{
    points: players,
    xRef: 8,
    yRef: 5,
    xLabel: 'Consistency (mean ÷ std)',
    yLabel: 'Power rating',
    quadrantLabels: { tl: 'steady, building', tr: 'steady star', bl: 'erratic, low', br: 'spiky' },
  }}
/>

<Story
  name="Bubble size"
  args={{ points: players, xLabel: 'Consistency', yLabel: 'Power rating' }}
/>

<Story name="Plain" args={{ points: plain, showLabels: false }} />

<Story name="Empty" args={{ points: [] }} />

<Story name="Large (lg)" args={{ points: players, size: 'lg' }} />
