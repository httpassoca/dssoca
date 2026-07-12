<script lang="ts">
  // DS-0138 — ShortcutsHelp harness: forwards the props and renders optional
  // raw text as the children snippet (the extra-content slot below the list).
  import ShortcutsHelp from '$lib/components/ShortcutsHelp.svelte'

  interface Props {
    open?: boolean
    title?: string
    hotkey?: string | null
    groupOrder?: string[]
    editable?: boolean
    /** Rendered as the children snippet when set. */
    text?: string
  }
  let { open = $bindable(false), title, hotkey, groupOrder, editable, text }: Props = $props()
</script>

{#if text !== undefined}
  <ShortcutsHelp bind:open {title} {hotkey} {groupOrder} {editable}>{text}</ShortcutsHelp>
{:else}
  <ShortcutsHelp bind:open {title} {hotkey} {groupOrder} {editable} />
{/if}
