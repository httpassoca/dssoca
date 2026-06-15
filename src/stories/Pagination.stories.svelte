<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Pagination from '$lib/components/Pagination.svelte'

  const { Story } = defineMeta({
    title: 'Components/Pagination',
    component: Pagination,
    tags: ['autodocs'],
    render: template,
    parameters: {
      // Landmark + button semantics — keep the a11y addon strict.
      a11y: { test: 'error' },
    },
    argTypes: {
      page: { control: 'number', description: 'Current page, 1-based (bindable).' },
      total: { control: 'number', description: 'Total item count (with pageSize).' },
      pageCount: {
        control: 'number',
        description: 'Explicit page count; overrides total/pageSize.',
      },
      pageSize: { control: 'number', description: 'Items per page when deriving from total.' },
      siblingCount: {
        control: 'number',
        description: 'Page buttons shown either side of current.',
      },
      disabled: { control: 'boolean', description: 'Disable the whole control.' },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
      onchange: { action: 'onchange', description: 'Fired when the page changes.' },
    },
    args: {
      page: 1,
      pageCount: 5,
      siblingCount: 1,
      disabled: false,
      onchange: () => {},
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  <Pagination
    page={args.page as number}
    total={args.total as number | undefined}
    pageCount={args.pageCount as number | undefined}
    pageSize={args.pageSize as number | undefined}
    siblingCount={args.siblingCount as number | undefined}
    disabled={args.disabled as boolean}
    size={args.size as 'sm' | 'md' | 'lg' | undefined}
    onchange={args.onchange as (page: number) => void}
  />
{/snippet}

<Story name="Default" args={{ page: 2, pageCount: 5 }} />

<Story name="Many pages (ellipsis)" args={{ page: 10, pageCount: 20, siblingCount: 1 }} />

<Story name="First page" args={{ page: 1, pageCount: 8 }} />

<Story name="Last page" args={{ page: 8, pageCount: 8 }} />

<Story name="Large" args={{ page: 3, pageCount: 7, size: 'lg' }} />
