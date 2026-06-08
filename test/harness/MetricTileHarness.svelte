<script lang="ts">
  import MetricTile from '$lib/components/MetricTile.svelte'
  import Sparkline from '$lib/components/Sparkline.svelte'

  interface Props {
    label?: string
    value?: string | number
    delta?: string
    deltaLabel?: string
    data?: number[]
  }
  let {
    label = 'requests',
    value = 1024,
    delta = '12%',
    deltaLabel = 'vs prev 7d',
    data = [3, 6, 4, 8, 5, 9],
  }: Props = $props()
</script>

<MetricTile {label} {value} {delta} {deltaLabel}>
  {#snippet chart()}
    <Sparkline {data} label="6-day trend" />
  {/snippet}
</MetricTile>
