<script lang="ts">
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import AccentControls from '$lib/components/theme-builder/AccentControls.svelte'
  import CorrectorPanel from '$lib/components/theme-builder/CorrectorPanel.svelte'
  import ExportPanel from '$lib/components/theme-builder/ExportPanel.svelte'
  import PreviewPane from '$lib/components/theme-builder/PreviewPane.svelte'
  import SlotEditor from '$lib/components/theme-builder/SlotEditor.svelte'
  import SlotGrid from '$lib/components/theme-builder/SlotGrid.svelte'
  import { runChecks } from '$lib/theme-builder/checks'
  import { resolvePalette } from '$lib/theme-builder/derive'
  import {
    SLOTS,
    SLOT_TO_CSS_VAR,
    type Check,
    type PaletteSlot,
    type SlotOverrides,
  } from '$lib/theme-builder/types'
  import { DEFAULT_SEED } from '../../../../scripts/lib/palette.mjs'

  // ---- builder state (derivation is pure TS → deterministic SSR/prerender) ----
  let accent = $state(DEFAULT_SEED)
  let tint = $state(35) // percent
  let neutral = $state(100) // percent → neutralChroma 0..1
  let previewTheme = $state<'dark' | 'light'>('dark')
  let overrides = $state<SlotOverrides>({})
  let selectedSlot = $state<PaletteSlot | null>(null)
  let applyToPage = $state(false)

  const options = $derived({ accent, tint: tint / 100, neutralChroma: neutral / 100 })
  const palette = $derived(resolvePalette(options, overrides))
  const checks = $derived(runChecks(palette))

  // ---- overrides ----
  function setOverride(theme: 'dark' | 'light', slot: PaletteSlot, hex: string) {
    overrides = { ...overrides, [theme]: { ...(overrides[theme] ?? {}), [slot]: hex } }
  }
  function clearOverride(theme: 'dark' | 'light', slot: PaletteSlot) {
    const { [slot]: _removed, ...rest } = overrides[theme] ?? {}
    overrides = { ...overrides, [theme]: rest }
  }
  function pickPreset(hex: string) {
    accent = hex
    overrides = {} // fresh start — stale manual edits would mask the new seed
    selectedSlot = null
  }

  // ---- corrector ----
  function applyFix(check: Check) {
    if (check.fixSlot && check.fixedHex) setOverride(check.theme, check.fixSlot, check.fixedHex)
  }
  function fixEverything() {
    // Fixes can interact (e.g. moving the accent changes label-on-accent), so
    // loop apply→re-check until stable, capped at 10 rounds.
    let next: SlotOverrides = {
      dark: { ...(overrides.dark ?? {}) },
      light: { ...(overrides.light ?? {}) },
    }
    for (let round = 0; round < 10; round++) {
      const fixable = runChecks(resolvePalette(options, next)).filter(
        (c) => !c.ok && c.fixSlot && c.fixedHex,
      )
      if (fixable.length === 0) break
      for (const c of fixable) {
        next = { ...next, [c.theme]: { ...(next[c.theme] ?? {}), [c.fixSlot!]: c.fixedHex! } }
      }
    }
    overrides = next
  }

  // ---- "Try it on this page": paint the SITE's current theme with the built
  // palette by writing the 19 slot props on <html>. The site's own theme
  // toggle keeps working — a MutationObserver (same pattern as TokenGallery)
  // re-reads data-theme and the $effect re-applies the matching slot set.
  let siteTheme = $state<'dark' | 'light'>('dark')

  function clearPageVars() {
    for (const slot of SLOTS) document.documentElement.style.removeProperty(SLOT_TO_CSS_VAR[slot])
  }

  onMount(() => {
    const el = document.documentElement
    const read = () => (siteTheme = el.getAttribute('data-theme') === 'light' ? 'light' : 'dark')
    read()
    const obs = new MutationObserver(read)
    obs.observe(el, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      obs.disconnect()
      clearPageVars()
    }
  })

  $effect(() => {
    if (!browser) return
    if (applyToPage) {
      const slots = palette[siteTheme]
      for (const slot of SLOTS) {
        document.documentElement.style.setProperty(SLOT_TO_CSS_VAR[slot], slots[slot])
      }
    } else {
      clearPageVars()
    }
  })
</script>

<svelte:head>
  <title>Theme Builder — dssoca</title>
</svelte:head>

<div class="page">
  <header>
    <h1>Theme Builder</h1>
    <p>
      Pick an accent and the mono rules derive both 16-slot terminal themes — neutrals fully in the
      seed's hue, the six ANSI hues leaning toward it, every text slot solved for
      <strong>WCAG AA</strong>. Preview real dssoca components, hand-tune any slot, fix what the
      corrector flags, then export the palette as
      <code>applyDesignConfig</code> code or a CSS override block.
    </p>
  </header>

  <AccentControls
    bind:accent
    bind:tint
    bind:neutral
    bind:previewTheme
    bind:applyToPage
    onPreset={pickPreset}
  />

  <div class="columns">
    <div class="col">
      <section>
        <h2>slots</h2>
        <SlotGrid
          theme={palette[previewTheme]}
          overrides={overrides[previewTheme] ?? {}}
          selected={selectedSlot}
          onSelect={(slot) => (selectedSlot = selectedSlot === slot ? null : slot)}
        />
      </section>
      {#if selectedSlot}
        <SlotEditor
          slot={selectedSlot}
          theme={previewTheme}
          value={palette[previewTheme][selectedSlot]}
          overridden={(overrides[previewTheme] ?? {})[selectedSlot] !== undefined}
          onChange={(hex) => setOverride(previewTheme, selectedSlot!, hex)}
          onReset={() => clearOverride(previewTheme, selectedSlot!)}
          onDone={() => (selectedSlot = null)}
        />
      {/if}
      <CorrectorPanel {checks} onFix={applyFix} onFixAll={fixEverything} />
    </div>

    <div class="col">
      <PreviewPane {palette} {previewTheme} />
      <ExportPanel {palette} {accent} tint={tint / 100} />
    </div>
  </div>
</div>

<style lang="scss">
  .page {
    max-width: 72rem;
    display: flex;
    flex-direction: column;
    gap: var(--ss-block-gap);
  }
  header {
    h1 {
      font-family: var(--ss-font-display);
      font-size: var(--ss-size-h1);
      color: var(--ss-fg-shine);
      margin: 0 0 var(--ss-s-3);
    }
    p {
      font-family: var(--ss-font-body);
      font-size: var(--ss-size-sm);
      line-height: var(--ss-leading);
      color: var(--ss-fg-muted);
      margin: 0;

      code {
        font-family: var(--ss-font-mono);
        color: var(--ss-lime);
      }
      strong {
        color: var(--ss-fg-shine);
      }
    }
  }
  .columns {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: var(--ss-block-gap);
    align-items: start;
  }
  .col {
    display: flex;
    flex-direction: column;
    gap: var(--ss-block-gap);
    min-width: 0;
  }
  section h2 {
    font-family: var(--ss-font-subhead);
    font-size: var(--ss-size-h3);
    color: var(--ss-fg-shine);
    text-transform: lowercase;
    margin: 0 0 var(--ss-s-3);
  }
  @media (max-width: 1080px) {
    .columns {
      grid-template-columns: 1fr;
    }
  }
</style>
