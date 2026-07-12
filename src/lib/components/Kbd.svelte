<script lang="ts">
  // ─────────────────────────────────────────────────────────────────────────
  // Kbd (DS-0137). Display-only key-cap chip: renders a combo from the
  // shortcut grammar (DS-0136) in house style. Registers nothing — pair the
  // real binding with `shortcuts.add()` / `shortcut()` and put
  // `ariaKeyshortcuts()` on the owning control.
  //
  // Markup follows MDN's nested-<kbd> convention: one outer <kbd> for the
  // whole combo, one inner <kbd> per key, aria-hidden '+' separators between
  // keys and a muted "or" between comma-alternatives.
  // ─────────────────────────────────────────────────────────────────────────
  import type { Snippet } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'
  import {
    detectPlatform,
    formatShortcutParts,
    type ShortcutFormat,
    type ShortcutPlatform,
  } from '../shortcuts.svelte.js'

  interface Props {
    /**
     * Combo string in the shortcut grammar (`'mod+k'`, `'?, mod+/'`).
     * `mod` renders as ⌘/Command on Apple platforms and Ctrl elsewhere.
     * Malformed input throws (same parser as registration).
     */
    keys?: string
    /**
     * `'glyph'` (default): ⌘⇧⌥ + arrow/enter glyphs on Apple, words elsewhere.
     * `'label'`: always full words. Glyph roots carry a full-word `aria-label`
     * (⌘ and ↵ read poorly in assistive tech).
     */
    format?: ShortcutFormat
    /**
     * Override platform auto-detection. Defaults to `'other'` on the server
     * and the first client render, corrected in an effect (no hydration
     * mismatch); SSR apps can pass it explicitly for a stable first paint.
     */
    platform?: ShortcutPlatform
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Raw-content escape hatch for keys the grammar can't express (`<Kbd>F12</Kbd>` sequences, chords…). Ignored when `keys` is set. */
    children?: Snippet
  }

  let { keys, format = 'glyph', platform, size, children }: Props = $props()

  // Hydration posture: 'other' on the server AND the first client render,
  // corrected in an effect so server and client first paints agree. An
  // explicit `platform` prop wins and skips the correction.
  let detected = $state<ShortcutPlatform>('other')
  $effect(() => {
    if (platform === undefined) detected = detectPlatform()
  })
  const plat = $derived(platform ?? detected)

  // One keycap-string array per comma-alternative.
  const groups = $derived(keys ? formatShortcutParts(keys, { format, platform: plat }) : [])
  // Apple glyphs concatenate (⌘K, the macOS convention) — no '+' separators.
  const plus = $derived(!(format === 'glyph' && plat === 'apple'))
  // Glyph roots carry the full-word combo; role="img" makes the aria-label
  // valid on an otherwise generic element (Badge's label-less precedent) and
  // presents the chip as one named unit instead of glyph soup.
  const ariaLabel = $derived(
    keys && format === 'glyph'
      ? formatShortcutParts(keys, { format: 'label', platform: plat })
          .map((group) => group.join(' '))
          .join(' or ')
      : undefined,
  )
</script>

<kbd
  class="ss-kbd"
  data-size-variant={resolveComponentSize('Kbd', size)}
  role={ariaLabel ? 'img' : undefined}
  aria-label={ariaLabel}
>
  {#if keys}
    {#each groups as caps, g (g)}
      {#if g > 0}<span class="or">or</span>{/if}
      {#each caps as cap, i (i)}
        {#if i > 0 && plus}<span class="sep" aria-hidden="true">+</span>{/if}
        <kbd class="key">{cap}</kbd>
      {/each}
    {/each}
  {:else if children}
    <kbd class="key">{@render children()}</kbd>
  {/if}
</kbd>

<style lang="scss">
  .ss-kbd {
    display: inline-flex;
    align-items: center;
    gap: calc(var(--ss-badge-gap) / 2);
    font-family: var(--ss-font-mono);
    font-size: var(--ss-size-xs);

    .key {
      font-family: inherit;
      font-size: inherit;
      // Badge height recipe (DS-0121): no vertical padding, line-height rules.
      line-height: 1.6;
      padding: 0 calc(var(--ss-badge-px) / 2);
      // Single characters read as square-ish caps.
      min-width: 1.8em;
      box-sizing: border-box;
      text-align: center;
      background: var(--ss-badge-neutral-bg);
      color: var(--ss-badge-neutral-fg);
      border: 1px solid var(--ss-badge-neutral-border);
      // Key-cap depth: a heavier bottom edge (zero radius, no shadow gimmicks).
      border-bottom-color: var(--ss-line-strong);
    }

    .sep,
    .or {
      color: var(--ss-fg-muted);
      flex: none;
    }

    .or {
      font-size: var(--ss-ui-xs);
      letter-spacing: 0.05em;
    }
  }
</style>
