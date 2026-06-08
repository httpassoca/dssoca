<script lang="ts">
  import Badge from '$lib/components/Badge.svelte'
  import type { Size } from '$lib/config.js'

  interface Props {
    tone?: 'up' | 'deg' | 'down' | 'maint' | 'info' | 'neutral'
    size?: Size
    text?: string
    /** Omit the child snippet to render a dot-only / count-only badge. */
    noLabel?: boolean
    dot?: boolean
    count?: number
    max?: number
    live?: boolean
    label?: string
    ondismiss?: () => void
  }
  let {
    tone = 'info',
    size,
    text = 'label',
    noLabel = false,
    dot,
    count,
    max,
    live,
    label,
    ondismiss,
  }: Props = $props()
</script>

{#if noLabel}
  <Badge {tone} {size} {dot} {count} {max} {live} {label} {ondismiss} />
{:else}
  <Badge {tone} {size} {dot} {count} {max} {live} {label} {ondismiss}>{text}</Badge>
{/if}
