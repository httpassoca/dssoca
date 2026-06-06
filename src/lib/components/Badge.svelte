<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    tone?: 'up' | 'deg' | 'down' | 'info'
    children: Snippet
  }
  let { tone = 'info', children }: Props = $props()

  const hasDot = $derived(['up', 'deg', 'down', 'info'].includes(tone))
</script>

<span class="ss-badge {tone}">
  {#if hasDot}<span class="dot"></span>{/if}
  {@render children()}
</span>
