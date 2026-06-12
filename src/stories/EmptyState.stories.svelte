<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import EmptyState from '$lib/components/EmptyState.svelte'
  import Button from '$lib/components/Button.svelte'

  const { Story } = defineMeta({
    title: 'Components/EmptyState',
    component: EmptyState,
    tags: ['autodocs'],
    // `render` points at the shared `template` snippet below so every story
    // can drive the optional `action` snippet via the `withAction` arg.
    render: template,
    argTypes: {
      variant: {
        control: { type: 'inline-radio' },
        options: ['empty', 'error', 'no-results'],
        description:
          'Visual tone — neutral empty state, error state (title turns red), or no-results.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
      ariaLabel: {
        control: 'text',
        description: 'Accessible name for the empty-state region.',
      },
      title: {
        control: 'text',
        description: 'Required heading shown in the empty area.',
      },
      message: {
        control: 'text',
        description: 'Optional supporting copy rendered below the title.',
      },
      icon: {
        control: 'text',
        description: 'Optional glyph (emoji or symbol) shown above the title.',
      },
      withAction: {
        control: 'boolean',
        description: 'When true, renders a "Retry" action button via the action snippet.',
      },
    },
    args: {
      variant: 'empty',
      title: 'Nothing here yet',
      message: undefined,
      icon: undefined,
      withAction: false,
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  {#if args.withAction}
    <EmptyState
      variant={args.variant as 'empty' | 'error' | 'no-results'}
      title={args.title as string}
      message={args.message as string | undefined}
      icon={args.icon as string | undefined}
      size={args.size as 'sm' | 'md' | 'lg' | undefined}
      ariaLabel={args.ariaLabel as string | undefined}
    >
      {#snippet action()}
        <Button variant="primary" onclick={() => {}}>Retry</Button>
      {/snippet}
    </EmptyState>
  {:else}
    <EmptyState
      variant={args.variant as 'empty' | 'error' | 'no-results'}
      title={args.title as string}
      message={args.message as string | undefined}
      icon={args.icon as string | undefined}
      size={args.size as 'sm' | 'md' | 'lg' | undefined}
      ariaLabel={args.ariaLabel as string | undefined}
    />
  {/if}
{/snippet}

<Story name="Default" args={{ title: 'Nothing here yet' }} />

<Story
  name="WithMessage"
  args={{
    title: 'Nothing here yet',
    message: 'Add your first service to get started.',
  }}
/>

<Story
  name="WithIcon"
  args={{
    icon: '📭',
    title: 'No results',
    message: 'Try adjusting your filters or search query.',
  }}
/>

<Story
  name="WithAction"
  args={{
    icon: '📭',
    title: 'No results',
    message: 'Try adjusting your filters or search query.',
    withAction: true,
  }}
/>

<Story
  name="Error"
  args={{
    variant: 'error',
    icon: '⚠️',
    title: 'Service unreachable',
    message: 'tasks-api is not responding. Check the container logs.',
    withAction: true,
  }}
/>

<Story
  name="ErrorMinimal"
  args={{
    variant: 'error',
    title: 'Failed to load',
  }}
/>
