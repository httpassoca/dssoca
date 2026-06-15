<script lang="ts">
  // ─────────────────────────────────────────────────────────────────────────
  // Switch — DS-0101. An accessible on/off toggle built on a native
  // `<button role="switch">`, so Space and Enter toggle for free. House rule:
  // zero border-radius (square track AND square thumb — no rounded pill). The
  // thumb slides on the inline axis between the two ends of the track; the
  // track fills with --ss-primary when on. Bindable `checked`, optional adjacent
  // `label` (clicking it toggles too), size-token density.
  // ─────────────────────────────────────────────────────────────────────────
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    /** On/off state (bindable). */
    checked?: boolean
    /** Visible label rendered adjacent to the track; becomes the accessible name. */
    label?: string
    /** Id for the underlying button (label `for`-style association uses it). */
    id?: string
    /** Form field name (mirrored onto a data attribute for form integration). */
    name?: string
    /** Disable the switch: inert + non-toggling. */
    disabled?: boolean
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Id of an element that further describes the switch (→ aria-describedby). */
    describedby?: string
    /** Fired after `checked` flips, with the new value. */
    onchange?: (checked: boolean) => void
  }

  let {
    checked = $bindable(false),
    label,
    id,
    name,
    disabled = false,
    size,
    describedby,
    onchange,
  }: Props = $props()

  // Stable per-instance id so the visible label can be wired to the button as
  // its accessible name (aria-labelledby). Falls back to `$props.id()` when no
  // explicit `id` is supplied (SSR-stable, replaces a random default).
  const uid = $props.id()
  const buttonId = $derived(id ?? uid)
  const labelId = $derived(`${buttonId}-label`)

  function toggle() {
    if (disabled) return
    checked = !checked
    onchange?.(checked)
  }

  const sizeAttr = $derived(resolveComponentSize('Switch', size))
</script>

<span class="ss-switch" class:has-label={label != null} data-size-variant={sizeAttr}>
  <button
    id={buttonId}
    type="button"
    role="switch"
    class="track"
    class:on={checked}
    aria-checked={checked}
    aria-labelledby={label != null ? labelId : undefined}
    aria-describedby={describedby}
    data-name={name}
    {disabled}
    onclick={toggle}
  >
    <span class="thumb" aria-hidden="true"></span>
  </button>
  {#if label != null}
    <!-- Clicking the label toggles the switch (a11y: same target as the control). -->
    <span id={labelId} class="label" onclick={toggle} role="presentation">{label}</span>
  {/if}
</span>

<style lang="scss">
  .ss-switch {
    display: inline-flex;
    align-items: center;
    gap: var(--ss-switch-gap, var(--ss-gap-sm));

    .track {
      // Track metrics are component-scoped with sane fallbacks (no global edits).
      position: relative;
      flex: 0 0 auto;
      display: inline-block;
      width: var(--ss-switch-w, 2.25rem);
      height: var(--ss-switch-h, 1.25rem);
      padding: var(--ss-switch-pad, 2px);
      // House rule: square track — zero radius, no pill.
      border-radius: 0;
      border: 1px solid var(--ss-line);
      background: var(--ss-bg-elev);
      cursor: pointer;
      box-sizing: border-box;
      transition:
        background var(--ss-dur-fast) var(--ss-ease),
        border-color var(--ss-dur-fast) var(--ss-ease);

      .thumb {
        position: absolute;
        top: var(--ss-switch-pad, 2px);
        left: var(--ss-switch-pad, 2px);
        // Square thumb sized to the track height minus padding/border.
        width: var(--ss-switch-thumb, 1rem);
        height: var(--ss-switch-thumb, 1rem);
        border-radius: 0;
        background: var(--ss-fg);
        transition: transform var(--ss-dur-fast) var(--ss-ease);
      }

      &.on {
        background: var(--ss-primary);
        border-color: var(--ss-primary);

        .thumb {
          background: var(--ss-bg);
          // Slide to the far end: track width − thumb − padding on both sides − borders.
          transform: translateX(
            calc(
              var(--ss-switch-w, 2.25rem) - var(--ss-switch-thumb, 1rem) -
                (2 * var(--ss-switch-pad, 2px)) - 2px
            )
          );
        }
      }

      &:not(:disabled):hover {
        border-color: var(--ss-line-strong);
      }

      &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px var(--ss-primary-soft);
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.45;
      }
    }

    .label {
      font: 500 var(--ss-control-font) / 1 var(--ss-font-body);
      color: var(--ss-fg);
      cursor: pointer;
      user-select: none;
    }

    &:has(.track:disabled) .label {
      cursor: not-allowed;
      opacity: 0.45;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ss-switch .track,
    .ss-switch .track .thumb {
      transition: none;
    }
  }
</style>
