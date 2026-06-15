<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import BumpChart from '$lib/components/BumpChart.svelte'

  // Four players' finishing ranks across the four games of one Friday — ranks cross.
  const stages = ['G1', 'G2', 'G3', 'G4']
  const players = [
    { label: 'Ana', ranks: [1, 2, 1, 1], color: 'var(--ss-primary)' },
    { label: 'Bruno', ranks: [2, 1, 3, 2], color: 'var(--ss-blue)' },
    { label: 'Caio', ranks: [3, 4, 2, 3], color: 'var(--ss-purple)' },
    { label: 'Duda', ranks: [4, 3, 4, 4], color: 'var(--ss-cyan)' },
  ]

  const { Story } = defineMeta({
    title: 'Components/BumpChart',
    component: BumpChart,
    tags: ['autodocs'],
    argTypes: {
      series: { control: 'object', description: 'One series per competitor: { label, ranks, color? }.' },
      stages: { control: 'object', description: 'Ordered x-axis category labels.' },
      showLabels: { control: 'boolean', description: 'Draw each series label at its last node.' },
      height: { control: 'number', description: 'Intrinsic drawing height in px.' },
      width: { control: 'number', description: 'Intrinsic drawing width in px.' },
      fluid: { control: 'boolean', description: 'Stretch to the container width via the viewBox.' },
      tooltip: { control: 'boolean', description: 'Reveal a tooltip on hover/focus of a node.' },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
    },
    args: { series: players, stages },
  })
</script>

<Story name="Default" args={{ series: players, stages }} />

<Story name="Without labels" args={{ series: players, stages, showLabels: false }} />

<Story name="Empty" args={{ series: [], stages: [] }} />

<Story name="Large (lg)" args={{ series: players, stages, size: 'lg' }} />
