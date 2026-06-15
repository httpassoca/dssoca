<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Heatmap from '$lib/components/Heatmap.svelte'

  // Head-to-head wins for a fixed group of four; the diagonal (self) is blank.
  const players = ['Ana', 'Bruno', 'Caio', 'Duda']
  const wins: (number | null)[][] = [
    [null, 5, 7, 9],
    [3, null, 6, 8],
    [2, 4, null, 5],
    [1, 2, 3, null],
  ]

  const { Story } = defineMeta({
    title: 'Components/Heatmap',
    component: Heatmap,
    tags: ['autodocs'],
    argTypes: {
      rows: { control: 'object', description: 'Row labels, top→bottom.' },
      columns: { control: 'object', description: 'Column labels, left→right.' },
      values: { control: 'object', description: 'values[r][c]; null renders a blank cell.' },
      domain: { control: 'object', description: 'Value range mapped to colour intensity.' },
      showValues: { control: 'boolean', description: 'Render the value text inside each cell.' },
      xLabel: { control: 'text', description: 'X axis caption.' },
      yLabel: { control: 'text', description: 'Y axis caption.' },
      cellSize: { control: 'number', description: 'Square cell size in px.' },
      tooltip: { control: 'boolean', description: 'Reveal a tooltip on hover/focus of a cell.' },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
    },
    args: { rows: players, columns: players, values: wins },
  })
</script>

<Story
  name="Default"
  args={{
    rows: players,
    columns: players,
    values: wins,
    xLabel: 'Opponent',
    yLabel: 'Player',
  }}
/>

<Story
  name="Without values"
  args={{ rows: players, columns: players, values: wins, showValues: false }}
/>

<Story name="Empty" args={{ rows: [], columns: [], values: [] }} />

<Story name="Large (lg)" args={{ rows: players, columns: players, values: wins, size: 'lg' }} />
