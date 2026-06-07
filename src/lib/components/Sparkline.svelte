<script lang="ts">
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    data: number[]
    color?: string
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
  }
  let { data, color = 'var(--ss-primary)', size }: Props = $props()

  const max = $derived(Math.max(...data, 1))
</script>

<div class="ss-spark" data-size-variant={resolveComponentSize('Sparkline', size)}>
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
