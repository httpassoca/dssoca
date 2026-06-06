<script lang="ts">
  interface Props {
    data: number[]
    color?: string
  }
  let { data, color = 'var(--ss-primary)' }: Props = $props()

  const max = $derived(Math.max(...data, 1))
</script>

<div class="ss-spark">
  {#each data as v}
    <i style="height:{Math.max(8, (v / max) * 100)}%;background:{color}"></i>
  {/each}
</div>

<style lang="scss">
  .ss-spark {
    display: flex; align-items: flex-end; gap: 1px; height: 18px;
    i { width: 3px; background: var(--ss-primary); opacity: .85; }
  }
</style>
