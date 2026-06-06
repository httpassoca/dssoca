<script lang="ts">
  import EmptyState from '$lib/components/EmptyState.svelte'

  interface Props {
    variant?: 'empty' | 'error'
    title: string
    message?: string
    icon?: string
    withAction?: boolean
  }
  let { variant, title, message, icon, withAction = false }: Props = $props()
</script>

{#if withAction}
  <EmptyState {variant} {title} {message} {icon}>
    {#snippet action()}
      <button class="empty-action">retry</button>
    {/snippet}
  </EmptyState>
{:else}
  <EmptyState {variant} {title} {message} {icon} />
{/if}
