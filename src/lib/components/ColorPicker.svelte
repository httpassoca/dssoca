<script module lang="ts">
  // Default preset palette — the on-brand token colours expressed as real hex so
  // they round-trip through the native `<input type="color">` and the hex text
  // input (both of which only understand `#rrggbb`, not CSS custom properties).
  // Sourced from src/styles/_tokens.scss: --ss-primary, --ss-blue, --ss-purple,
  // --ss-cyan, --ss-yellow, --ss-lime.
  export const DEFAULT_PRESETS: string[] = [
    '#66ef73', // --ss-primary
    '#9aa4ff', // --ss-blue
    '#b98cff', // --ss-purple
    '#66d9ef', // --ss-cyan
    '#e0c36a', // --ss-yellow
    '#a6e22e', // --ss-lime
  ]

  /** Six-digit hex, with or without a leading `#`. */
  const HEX_RE = /^#?[0-9a-fA-F]{6}$/

  /** Normalise a typed/pasted hex to canonical `#rrggbb` lowercase, or null if invalid. */
  export function normalizeHex(input: string): string | null {
    const trimmed = input.trim()
    if (!HEX_RE.test(trimmed)) return null
    const body = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed
    return `#${body.toLowerCase()}`
  }
</script>

<script lang="ts">
  // ─────────────────────────────────────────────────────────────────────────
  // ColorPicker — DS-0107. A form control for choosing a colour. Three inputs
  // kept in sync with the bound `value`: a row of preset swatch buttons, a
  // native `<input type="color">` for freeform picking, and a monospace hex
  // text input for typing/pasting. House rules: zero radius, `--ss-*` tokens,
  // scoped SCSS, Svelte 5 runes, WCAG 2.2 AA. Invalid typed hex is ignored
  // (the bound value is left untouched) rather than crashing.
  // ─────────────────────────────────────────────────────────────────────────
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    /** Selected colour as a hex string, e.g. `#66ef73` (bindable). */
    value?: string
    /** Field label (uses the labelled-field chrome shared with Input). */
    label?: string
    /** Preset swatch colours to quick-pick from. */
    presets?: string[]
    /** Id for the hex text input (label association uses it). */
    id?: string
    /** Form field name (mirrored onto the hex + native inputs). */
    name?: string
    /** Disable all three controls. */
    disabled?: boolean
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Fired whenever the value changes (swatch, native picker, or hex input). */
    onChange?: (value: string) => void
  }

  let {
    value = $bindable(''),
    label,
    presets = DEFAULT_PRESETS,
    id,
    name,
    disabled = false,
    size,
    onChange,
  }: Props = $props()

  // Stable per-instance id so the visible label wires to the hex text input.
  const uid = $props.id()
  const fieldId = $derived(id ?? uid)
  const resolvedSize = $derived(resolveComponentSize('ColorPicker', size))

  // The native colour input demands a valid `#rrggbb`; fall back to the first
  // preset (or black) when `value` is empty/invalid so it never renders broken.
  const nativeValue = $derived(normalizeHex(value) ?? normalizeHex(presets[0] ?? '') ?? '#000000')

  // Local text mirror so a user can type a partial/invalid hex without it being
  // clobbered; the bound `value` only updates once the text is a valid hex.
  let hexText = $state('')
  $effect(() => {
    // Keep the text box in sync when `value` changes from outside (swatch /
    // native picker), unless the user is mid-edit on an equivalent value.
    const canonical = normalizeHex(value)
    if (canonical && normalizeHex(hexText) !== canonical) hexText = canonical
    else if (!canonical && value === '') hexText = ''
  })

  function commit(next: string) {
    value = next
    onChange?.(next)
  }

  function pickPreset(color: string) {
    if (disabled) return
    const canonical = normalizeHex(color) ?? color
    commit(canonical)
  }

  function onNativeInput(e: Event & { currentTarget: HTMLInputElement }) {
    commit(e.currentTarget.value)
  }

  function onHexInput(e: Event & { currentTarget: HTMLInputElement }) {
    hexText = e.currentTarget.value
    const canonical = normalizeHex(hexText)
    // Ignore invalid hex for the bound value (don't crash, don't clobber).
    if (canonical) commit(canonical)
  }

  function isSelected(color: string): boolean {
    const a = normalizeHex(color)
    const b = normalizeHex(value)
    return a != null && a === b
  }
</script>

<div class="ss-color-picker" data-size-variant={resolvedSize} class:disabled>
  {#if label}
    <label class="lbl" for={fieldId}>{label}</label>
  {/if}

  {#if presets.length}
    <div class="swatches" role="group" aria-label="Preset colours">
      {#each presets as preset (preset)}
        <button
          type="button"
          class="swatch"
          class:selected={isSelected(preset)}
          style="--sw: {preset}"
          aria-label={preset}
          aria-pressed={isSelected(preset)}
          {disabled}
          onclick={() => pickPreset(preset)}
        ></button>
      {/each}
    </div>
  {/if}

  <div class="control">
    <input
      class="native"
      type="color"
      value={nativeValue}
      {name}
      aria-label="Colour picker"
      {disabled}
      oninput={onNativeInput}
    />
    <input
      class="hex"
      id={fieldId}
      type="text"
      inputmode="text"
      spellcheck="false"
      autocomplete="off"
      maxlength="7"
      placeholder="#000000"
      value={hexText}
      {name}
      aria-label={label ? undefined : 'Hex colour'}
      {disabled}
      oninput={onHexInput}
    />
  </div>
</div>

<style lang="scss">
  .ss-color-picker {
    display: flex;
    flex-direction: column;
    // 6px label↔control gap mirrors Input (sits between --ss-s-1/--ss-s-2).
    gap: 6px;
    font-family: var(--ss-font-body);
    color: var(--ss-fg);

    .lbl {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      color: var(--ss-fg-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .swatches {
      display: flex;
      flex-wrap: wrap;
      gap: var(--ss-gap-sm);
    }

    .swatch {
      // House rule: square swatch, zero radius.
      box-sizing: border-box;
      width: var(--ss-swatch, 1.5rem);
      height: var(--ss-swatch, 1.5rem);
      padding: 0;
      border-radius: 0;
      border: 1px solid var(--ss-line);
      background: var(--sw);
      cursor: pointer;
      transition:
        border-color var(--ss-dur-fast) var(--ss-ease),
        box-shadow var(--ss-dur-fast) var(--ss-ease);

      &:not(:disabled):hover {
        border-color: var(--ss-line-strong);
      }

      &.selected {
        // Clear selected outline drawn off the brand foreground.
        border-color: var(--ss-fg);
        box-shadow: 0 0 0 2px var(--ss-primary);
      }

      &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px var(--ss-primary-soft);
      }

      &.selected:focus-visible {
        box-shadow:
          0 0 0 2px var(--ss-primary),
          0 0 0 4px var(--ss-primary-soft);
      }
    }

    .control {
      display: flex;
      align-items: center;
      gap: var(--ss-gap-sm);
      border: 1px solid var(--ss-line);
      padding: 0 var(--ss-input-px);
      transition:
        border-color var(--ss-dur-fast) var(--ss-ease),
        box-shadow var(--ss-dur-fast) var(--ss-ease);

      &:focus-within {
        border-color: var(--ss-primary);
        box-shadow: 0 0 0 3px var(--ss-primary-soft);
      }
    }

    .native {
      // Strip the browser chrome around the colour well; keep it square.
      flex: none;
      box-sizing: border-box;
      width: var(--ss-swatch, 1.5rem);
      height: var(--ss-swatch, 1.5rem);
      padding: 0;
      border: 1px solid var(--ss-line);
      border-radius: 0;
      background: transparent;
      cursor: pointer;

      &::-webkit-color-swatch-wrapper {
        padding: 0;
      }
      &::-webkit-color-swatch {
        border: none;
        border-radius: 0;
      }
      &::-moz-color-swatch {
        border: none;
        border-radius: 0;
      }
      &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px var(--ss-primary-soft);
      }
    }

    .hex {
      flex: 1 1 auto;
      min-width: 0;
      font-family: var(--ss-font-mono);
      font-size: var(--ss-input-font);
      background: transparent;
      color: var(--ss-fg);
      border: none;
      padding: var(--ss-input-py) 0;

      &:focus {
        outline: none;
      }
      &::placeholder {
        color: var(--ss-fg-faint);
      }
    }

    &.disabled {
      .lbl {
        color: var(--ss-fg-faint);
      }
      .control {
        border-color: var(--ss-line);
      }
      .swatch:disabled,
      .native:disabled,
      .hex:disabled {
        cursor: not-allowed;
        opacity: 0.45;
      }
      .hex:disabled {
        color: var(--ss-fg-faint);
        -webkit-text-fill-color: var(--ss-fg-faint);
        opacity: 1;
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ss-color-picker .swatch,
    .ss-color-picker .control {
      transition: none;
    }
  }
</style>
