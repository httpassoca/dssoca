<script lang="ts">
  import ServiceCard from '$lib/components/ServiceCard.svelte'

  interface Props {
    name?: string
    host?: string
    metaText?: string
  }
  let { name = 'movies-api', host = 'movies.home', metaText = 'v1.2.3' }: Props = $props()
</script>

<ServiceCard {name} {host}>
  {#snippet meta()}
    <div class="meta-row">{metaText}</div>
  {/snippet}
</ServiceCard>
