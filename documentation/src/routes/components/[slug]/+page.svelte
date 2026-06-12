<script lang="ts">
  import ComponentPage from '$lib/components/ComponentPage.svelte'
  let { data } = $props()
</script>

<svelte:head>
  <title>{data.doc.name} — dssoca</title>
  <meta name="description" content={data.doc.tagline} />
</svelte:head>

<ComponentPage doc={data.doc} />
