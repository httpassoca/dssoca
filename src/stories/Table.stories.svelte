<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Table from '$lib/components/Table.svelte'
  import type { TableColumn } from '$lib/components/Table.svelte'

  const people: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'role', label: 'Role' },
    { key: 'commits', label: 'Commits', numeric: true, sortable: true },
  ]

  const peopleRows = [
    { name: 'Ada Lovelace', role: 'Engineer', commits: 142 },
    { name: 'Alan Turing', role: 'Architect', commits: 87 },
    { name: 'Grace Hopper', role: 'Compiler', commits: 213 },
    { name: 'Linus Torvalds', role: 'Maintainer', commits: 56 },
  ]

  const financialCols: TableColumn[] = [
    { key: 'ticker', label: 'Ticker' },
    {
      key: 'price',
      label: 'Price',
      numeric: true,
      sortable: true,
      format: (v) => `$${v.toFixed(2)}`,
    },
    {
      key: 'change',
      label: 'Change',
      numeric: true,
      sortable: true,
      format: (v) => `${v > 0 ? '+' : ''}${v}%`,
    },
  ]

  const financialRows = [
    { ticker: 'ACME', price: 128.4, change: 2.1 },
    { ticker: 'GLOB', price: 56.92, change: -0.8 },
    { ticker: 'NODE', price: 311.05, change: 5.4 },
  ]

  const { Story } = defineMeta({
    title: 'Components/Table',
    component: Table,
    tags: ['autodocs'],
    argTypes: {
      columns: {
        control: 'object',
        description: 'Column definitions (key, label, align, sortable, numeric, format, cell).',
      },
      rows: {
        control: 'object',
        description: 'Row data; each row is an object keyed by column `key`.',
      },
      sort: {
        control: 'object',
        description: 'Active sort ({ key, dir }); bindable and toggled by sortable headers.',
      },
      caption: {
        control: 'text',
        description: 'Optional table caption rendered subtly above the grid.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
    },
    args: {
      columns: people,
      rows: peopleRows,
    },
  })
</script>

<Story name="Default" />

<Story name="Sortable" args={{ sort: { key: 'commits', dir: 'desc' } }} />

<Story
  name="Numeric columns"
  args={{ columns: financialCols, rows: financialRows, caption: 'Watchlist' }}
/>

<Story name="Custom cell snippet" args={{ columns: people }}>
  {#snippet template(args)}
    <Table
      {...args}
      columns={[
        { key: 'name', label: 'Name', sortable: true },
        { key: 'role', label: 'Role' },
        {
          key: 'commits',
          label: 'Commits',
          numeric: true,
          sortable: true,
          cell: commitCell,
        },
      ]}
    />
  {/snippet}
</Story>

{#snippet commitCell(row: { commits: number })}
  <strong>{row.commits}</strong> commits
{/snippet}

<Story name="Empty" args={{ rows: [] }} />

<Story name="Large (lg)" args={{ size: 'lg' }} />
