<script lang="ts">
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    data: number[]
    color?: string
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Accessible label; when set the sparkline is exposed to AT (role="img"), else it's decorative (aria-hidden). */
    label?: string
  }
  let { data, color = 'var(--ss-primary)', size, label }: Props = $props()

  const max = $derived(Math.max(...data, 1))
</script>

<div
  class="ss-spark"
  data-size-variant={resolveComponentSize('Sparkline', size)}
  role={label ? 'img' : undefined}
  aria-label={label}
  aria-hidden={label ? undefined : 'true'}
>
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
