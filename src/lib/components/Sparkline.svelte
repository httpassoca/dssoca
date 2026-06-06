<script lang="ts">
  interface Props {
    data: number[]
    color?: string
  }
  let { data, color = 'var(--hs-primary)' }: Props = $props()

  const max = $derived(Math.max(...data, 1))
</script>

<div class="hub-spark">
  {#each data as v}
    <i style="height:{Math.max(8, (v / max) * 100)}%;background:{color}"></i>
  {/each}
</div>
