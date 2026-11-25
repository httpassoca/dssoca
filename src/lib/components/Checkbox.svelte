<script lang="ts">
  // ─────────────────────────────────────────────────────────────────────────
  // Checkbox — DS-0197. A native `<input type="checkbox">` restyled as a square
  // box (house rule: zero radius), so Space, label presses, form submission and
  // the checked / unchecked / mixed semantics all come from the platform. The
  // input itself IS the box (`appearance: none`), which is why the base focus
  // ring lands on it; the check glyph and the indeterminate dash sit on top.
  // ─────────────────────────────────────────────────────────────────────────
  import Icon from './Icon.svelte'
  import { resolveComponentSize, type Size } from '../config.js'
  import { checkboxInputAttrs, checkboxToggle } from '../core/checkbox.js'

  interface Props {
    /** Checked state (bindable). */
    checked?: boolean
    /**
     * Mixed state (bindable): shown as a dash and announced as "mixed". A user
     * toggle always clears it and lands on checked.
     */
    indeterminate?: boolean
    /** Visible label next to the box; becomes the accessible name. */
    label?: string
    /**
     * Visually hide the label while keeping it as the accessible name — for
     * dense rows (table row selection) where the visible context sits elsewhere.
     */
    labelHidden?: boolean
    /** Id for the underlying input. */
    id?: string
    /** Form field name: the checkbox is submitted with its form when checked. */
    name?: string
    /** Submitted value when checked (the browser default is `on`). */
    value?: string
    /** Disable the checkbox: inert + non-toggling, not submitted. */
    disabled?: boolean
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Id of an element that further describes the checkbox (→ aria-describedby). */
    describedby?: string
    /**
     * Fired after `checked` changes, with the new value. There is no
     * `details.reason`: the native input reports a press on the box, a press on
     * the label and Space as the same event.
     */
    onchange?: (checked: boolean) => void
  }

  let {
    checked = $bindable(false),
    indeterminate = $bindable(false),
    label,
    labelHidden = false,
    id,
    name,
    value,
    disabled = false,
    size,
    describedby,
    onchange,
  }: Props = $props()

  const uid = $props.id()
  const inputId = $derived(id ?? uid)

  let input = $state<HTMLInputElement>()

  // `indeterminate` exists only as a DOM property (no HTML attribute).
  $effect(() => {
    if (input) input.indeterminate = indeterminate
  })

  // The browser has already toggled the input; the decision is still the core's
  // (shared with vanilla/checkbox.ts), so its result is written back.
  function onInputChange() {
    if (!input) return
    const next = checkboxToggle({ checked, indeterminate, disabled })
    if (next === null) {
      input.checked = checked
      input.indeterminate = indeterminate
      return
    }
    checked = next.checked
    indeterminate = next.indeterminate
    input.checked = next.checked
    onchange?.(next.checked)
  }

  const sizeAttr = $derived(resolveComponentSize('Checkbox', size))
</script>

<label
  class="ss-checkbox"
  class:has-label={label != null && !labelHidden}
  data-size-variant={sizeAttr}
>
  <span class="control">
    <input
      bind:this={input}
      id={inputId}
      class="input"
      type="checkbox"
      {name}
      {value}
      {checked}
      {disabled}
      aria-describedby={describedby}
      {...checkboxInputAttrs(indeterminate)}
      onchange={onInputChange}
    />
    <!-- Both marks are always in the DOM; the input's own state picks one in CSS. -->
    <span class="glyph" aria-hidden="true">
      <span class="check"><Icon name="check" strokeWidth={3} /></span>
      <span class="dash"></span>
    </span>
  </span>
  {#if label != null}
    <span class="label" class:sr-only={labelHidden}>{label}</span>
  {/if}
</label>

<style lang="scss">
  // Box edge: scales with the size axis through the control font. Component-scoped
  // override hook, no global token.
  $box: var(--ss-checkbox-size, calc(var(--ss-control-font) + 4px));

  .ss-checkbox {
    // Anchors the visually-hidden (absolute) label so it never escapes the row.
    position: relative;
    display: inline-flex;
    align-items: center;
    // The whole label is the pointer target: at least 24×24 without growing the box.
    min-inline-size: var(--ss-s-6);
    min-block-size: var(--ss-s-6);
    cursor: pointer;

    &.has-label {
      gap: var(--ss-checkbox-gap, var(--ss-gap-sm));
    }

    .control {
      position: relative;
      flex: 0 0 auto;
      display: inline-grid;
      inline-size: $box;
      block-size: $box;
    }

    .input {
      grid-area: 1 / 1;
      appearance: none;
      box-sizing: border-box;
      inline-size: 100%;
      block-size: 100%;
      margin: 0;
      // House rule: square box — zero radius.
      border-radius: 0;
      // --ss-fg-faint, not --ss-line: the box edge is what identifies the control,
      // so it needs ≥3:1 against the surface.
      border: 1px solid var(--ss-fg-faint);
      background: var(--ss-bg);
      cursor: inherit;
      transition:
        background var(--ss-dur-fast) var(--ss-ease),
        border-color var(--ss-dur-fast) var(--ss-ease);

      &:not(:disabled):hover {
        border-color: var(--ss-fg);
      }

      &:checked,
      &:indeterminate {
        background: var(--ss-primary);
        border-color: var(--ss-primary);
      }

      // No :focus-visible override: the input is the box, so the global base ring
      // (2px solid --ss-primary, offset 2px — _base.scss) is drawn around it.
    }

    .glyph {
      grid-area: 1 / 1;
      display: grid;
      place-items: center;
      // The marks are decoration over the input: presses fall through to it.
      pointer-events: none;
      color: var(--ss-fg-on-primary);
      // Icon sizes itself from --ss-icon; pin it to the box.
      --ss-icon: calc(#{$box} - 6px);
    }

    .check,
    .dash {
      display: none;
    }

    .dash {
      inline-size: calc(#{$box} - 8px);
      block-size: 2px;
      background: currentColor;
    }

    // State is never colour alone: a check when checked, a dash when mixed.
    .input:checked:not(:indeterminate) + .glyph .check {
      display: grid;
    }

    .input:indeterminate + .glyph .dash {
      display: block;
    }

    .label {
      font: 500 var(--ss-control-font) / 1.3 var(--ss-font-body);
      color: var(--ss-fg);
      user-select: none;

      // `labelHidden`: out of flow and clipped, still the accessible name.
      &.sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    }

    &:has(.input:disabled) {
      cursor: not-allowed;

      .control,
      .label {
        opacity: 0.45;
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ss-checkbox .input {
      transition: none;
    }
  }
</style>
