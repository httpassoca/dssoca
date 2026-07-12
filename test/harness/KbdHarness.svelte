<script lang="ts">
  // DS-0137 — Kbd harness: forwards the props and renders optional raw text
  // as the children snippet (the escape hatch for keys the grammar can't
  // express).
  import Kbd from '$lib/components/Kbd.svelte'
  import type { ShortcutFormat, ShortcutPlatform } from '$lib/shortcuts.svelte'
  import type { Size } from '$lib/config'

  interface Props {
    keys?: string
    format?: ShortcutFormat
    platform?: ShortcutPlatform
    size?: Size
    /** Rendered as the children snippet when set. */
    text?: string
  }
  let { keys, format, platform, size, text }: Props = $props()
</script>

{#if text !== undefined}
  <Kbd {keys} {format} {platform} {size}>{text}</Kbd>
{:else}
  <Kbd {keys} {format} {platform} {size} />
{/if}
