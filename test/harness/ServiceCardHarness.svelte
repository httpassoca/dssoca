<script lang="ts">
  import ServiceCard from '$lib/components/ServiceCard.svelte'

  interface Props {
    name?: string
    host?: string
    metaText?: string
    /** Put a link inside `meta` and make the card a button (DS-0192 nesting check). */
    withLink?: boolean
  }
  let {
    name = 'movies-api',
    host = 'movies.home',
    metaText = 'v1.2.3',
    withLink = false,
  }: Props = $props()
</script>

<ServiceCard {name} {host} onclick={withLink ? () => {} : undefined}>
  {#snippet meta()}
    <div class="meta-row">{metaText}</div>
    {#if withLink}<a href="#logs">logs</a>{/if}
  {/snippet}
</ServiceCard>
