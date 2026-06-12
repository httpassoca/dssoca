<script lang="ts">
  import { onMount } from 'svelte'
  import { Button, applyDesignConfig, dssocaConfig, type ColorTheme, type Size } from 'dssoca'

  // The two design axes, driven straight from the dssoca manifest so this stays
  // correct if values are ever added. Applied to <html> via applyDesignConfig —
  // exactly how a consuming app flips the system (dogfooding the real API).
  const themes = dssocaConfig.theme.values as readonly ColorTheme[]
  const sizes = dssocaConfig.size.values as readonly Size[]

  let theme = $state<ColorTheme>(dssocaConfig.theme.default)
  let size = $state<Size>(dssocaConfig.size.default)

  onMount(() => {
    const el = document.documentElement
    theme = (el.getAttribute('data-theme') as ColorTheme) ?? theme
    size = (el.getAttribute('data-size-variant') as Size) ?? size
  })

  // The smooth recolor/rescale on flip is handled by a plain CSS transition in
  // +layout.svelte (docs-only) — no JS timing needed here.
  function nextTheme() {
    theme = themes[(themes.indexOf(theme) + 1) % themes.length]
    applyDesignConfig({ theme })
  }
  function nextSize() {
    size = sizes[(sizes.indexOf(size) + 1) % sizes.length]
    applyDesignConfig({ sizeVariant: size })
  }
</script>

<div class="controls">
  <Button variant="ghost" onclick={nextTheme}>theme: {theme}</Button>
  <Button variant="ghost" onclick={nextSize}>size: {size}</Button>
</div>

<style lang="scss">
  .controls {
    display: inline-flex;
    gap: var(--ss-s-1);
  }
</style>
