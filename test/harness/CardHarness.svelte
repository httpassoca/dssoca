<script lang="ts">
  import Card from '$lib/components/Card.svelte'

  interface Props {
    title?: string
    meta?: string
    withAction?: boolean
    body?: string
  }
  let { title, meta, withAction = false, body = 'body content' }: Props = $props()
</script>

{#if withAction}
  <Card {title} {meta}>
    {#snippet action()}
      <button class="card-action">act</button>
    {/snippet}
    {body}
  </Card>
{:else}
  <Card {title} {meta}>{body}</Card>
{/if}
