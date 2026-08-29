<script lang="ts">
  import { onMount } from 'svelte'
  import { Button } from 'dssoca'
  import { axes } from '$lib/axes.svelte'

  // The two design axes live in `$lib/axes.svelte.ts` (shared with the palette
  // actions and the shift+d / shift+s shortcuts — DS-0147); these buttons are
  // just the visible trigger. The smooth recolor/rescale on flip is a plain
  // CSS transition in +layout.svelte (docs-only) — no JS timing needed here.
  onMount(() => axes.sync())
</script>

<div class="controls">
  <Button variant="ghost" onclick={() => axes.nextTheme()}>theme: {axes.theme}</Button>
  <Button variant="ghost" onclick={() => axes.nextSize()}>size: {axes.size}</Button>
</div>

<style lang="scss">
  .controls {
    display: inline-flex;
    gap: var(--ss-s-1);
  }
</style>
