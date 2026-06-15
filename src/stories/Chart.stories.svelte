<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Chart from '$lib/components/Chart.svelte'

  const lineSeries = [
    {
      label: 'Requests',
      data: [
        { x: 0, y: 120 },
        { x: 1, y: 180 },
        { x: 2, y: 150 },
        { x: 3, y: 230 },
        { x: 4, y: 200 },
        { x: 5, y: 280 },
      ],
    },
    {
      label: 'Errors',
      data: [
        { x: 0, y: 12 },
        { x: 1, y: 22 },
        { x: 2, y: 9 },
        { x: 3, y: 31 },
        { x: 4, y: 18 },
        { x: 5, y: 14 },
      ],
    },
  ]

  const barSeries = [
    {
      label: 'API',
      data: [
        { x: 'Mon', y: 30 },
        { x: 'Tue', y: 55 },
        { x: 'Wed', y: 40 },
        { x: 'Thu', y: 70 },
      ],
    },
    {
      label: 'Web',
      data: [
        { x: 'Mon', y: 45 },
        { x: 'Tue', y: 35 },
        { x: 'Wed', y: 60 },
        { x: 'Thu', y: 50 },
      ],
    },
  ]

  const timeSeries = [
    {
      label: 'Latency (ms)',
      data: [
        { x: new Date('2026-06-01'), y: 80 },
        { x: new Date('2026-06-02'), y: 120 },
        { x: new Date('2026-06-03'), y: 95 },
        { x: new Date('2026-06-04'), y: 140 },
        { x: new Date('2026-06-05'), y: 110 },
      ],
    },
  ]

  const { Story } = defineMeta({
    title: 'Components/Chart',
    component: Chart,
    tags: ['autodocs'],
    argTypes: {
      series: {
        control: 'object',
        description: 'Array of series; each has a label, data points, and an optional color.',
      },
      variant: {
        control: 'inline-radio',
        options: ['line', 'area', 'bar'],
        description: 'Rendering style. `bar` draws grouped bars per x-category.',
      },
      xType: {
        control: 'inline-radio',
        options: ['linear', 'time', 'band'],
        description: 'X scale kind; auto-detected when unset.',
      },
      height: {
        control: 'number',
        description: 'Intrinsic drawing height in px.',
      },
      width: {
        control: 'number',
        description: 'Intrinsic drawing width in px.',
      },
      fluid: {
        control: 'boolean',
        description: 'Stretch the chart to the container width via the viewBox.',
      },
      legend: {
        control: 'boolean',
        description: 'Show the series legend.',
      },
      tooltip: {
        control: 'boolean',
        description: 'Reveal a tooltip on hover/focus of a datum.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
    },
    args: {
      series: lineSeries,
      variant: 'line',
    },
  })
</script>

<Story name="Default" args={{ series: lineSeries }} />

<Story name="Area" args={{ series: lineSeries, variant: 'area' }} />

<Story name="Grouped Bars" args={{ series: barSeries, variant: 'bar' }} />

<Story name="Single Series" args={{ series: [lineSeries[0]] }} />

<Story name="Time axis" args={{ series: timeSeries, variant: 'area' }} />

<Story name="Empty" args={{ series: [] }} />

<!-- Explicit token size override, independent of the global size axis -->
<Story name="Large (lg)" args={{ series: lineSeries, size: 'lg' }} />
