<script lang="ts">
  import Badge from '$lib/components/Badge.svelte'
  import type { Size } from '$lib/config.js'

  interface Props {
    tone?: 'brand' | 'neutral' | 'positive' | 'caution' | 'critical' | 'info'
    size?: Size
    text?: string
    /** Omit the child snippet to render a dot-only / count-only badge. */
    noLabel?: boolean
    dot?: boolean
    count?: number
    max?: number
    live?: boolean
    label?: string
  }
  let {
    tone = 'neutral',
    size,
    text = 'label',
    noLabel = false,
    dot,
    count,
    max,
    live,
    label,
  }: Props = $props()
</script>

{#if noLabel}
  <Badge {tone} {size} {dot} {count} {max} {live} {label} />
{:else}
  <Badge {tone} {size} {dot} {count} {max} {live} {label}>{text}</Badge>
{/if}
