<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    label?: string
    id?: string
    name?: string
    /** Bindable ISO date string (`yyyy-mm-dd`). */
    value?: string
    /** Earliest selectable date (ISO `yyyy-mm-dd`); forwarded to the native input. */
    min?: string
    /** Latest selectable date (ISO `yyyy-mm-dd`); forwarded to the native input. */
    max?: string
    required?: boolean
    disabled?: boolean
    /** Native readonly — value visible but not editable; rendered muted. */
    readonly?: boolean
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Marks the field invalid for assistive tech (aria-invalid). */
    invalid?: boolean
    /** id(s) of element(s) describing the field (aria-describedby) — e.g. hint/error text. */
    describedby?: string
    /** Supplementary helper text rendered under the input. */
    hint?: string
    /** Error text rendered under the input; its presence implies aria-invalid and is announced to AT. */
    error?: string
    onchange?: (e: Event & { currentTarget: HTMLInputElement }) => void
    oninput?: (e: Event & { currentTarget: HTMLInputElement }) => void
    /** Any remaining native input attributes / event handlers are forwarded. */
    [key: string]: unknown
  }
  let {
    label,
    id,
    name,
    value = $bindable(''),
    min,
    max,
    required = false,
    disabled = false,
    readonly = false,
    size,
    invalid,
    describedby,
    hint,
    error,
    onchange,
    oninput,
    ...rest
  }: Props = $props()

  // Guarantee a label↔input association even when no `id` is passed.
  const uid = $props.id()
  const inputId = $derived(id ?? uid)
  const hintId = $derived(`${inputId}-hint`)
  const errorId = $derived(`${inputId}-error`)

  // error wins, then hint, then any caller-supplied describedby — order matters for AT.
  const describedBy = $derived(
    [error ? errorId : null, hint ? hintId : null, describedby].filter(Boolean).join(' ') ||
      undefined,
  )
  const isInvalid = $derived(invalid || Boolean(error) || undefined)
  const resolvedSize = $derived(resolveComponentSize('DateField', size))
</script>

<div class="ss-datefield" data-size-variant={resolvedSize} class:invalid={isInvalid} class:disabled>
  {#if label}
    <label class="lbl" for={inputId}>
      {label}
      {#if required}<span class="req" aria-hidden="true">*</span>{/if}
    </label>
  {/if}

  <div class="control">
    <input
      class="field"
      type="date"
      id={inputId}
      {name}
      bind:value
      {min}
      {max}
      {required}
      {disabled}
      {readonly}
      aria-invalid={isInvalid}
      aria-describedby={describedBy}
      {onchange}
      {oninput}
      {...rest}
    />
  </div>

  {#if error}<span class="msg error" id={errorId} role="alert">{error}</span>{/if}
  {#if hint}<span class="msg hint" id={hintId}>{hint}</span>{/if}
</div>

<style lang="scss">
  .ss-datefield {
    // Mirrors Input's .ss-field micro-gap (DS-0068): 6px sits between the
    // spacing-scale steps and no --ss-gap-* token matches at md, so it stays a
    // deliberate fixed micro-gap.
    display: flex;
    flex-direction: column;
    gap: 6px;

    .lbl {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      color: var(--ss-fg-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      .req {
        color: var(--ss-red);
        margin-left: 2px;
      }
    }

    // The border/focus ring lives on the wrapper so it hugs the whole field.
    .control {
      display: flex;
      align-items: center;
      gap: var(--ss-gap-sm);
      background: transparent;
      color: var(--ss-fg);
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

    &.invalid .control {
      border-color: var(--ss-red);
      &:focus-within {
        border-color: var(--ss-red);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--ss-danger) 22%, transparent);
      }
    }

    &.disabled .control {
      border-color: var(--ss-line);
    }

    .msg {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      letter-spacing: 0.02em;
      &.hint {
        color: var(--ss-fg-faint);
      }
      &.error {
        color: var(--ss-red);
      }
    }
  }

  .field {
    font-family: var(--ss-font-body);
    font-size: var(--ss-input-font);
    background: transparent;
    color: var(--ss-fg);
    border: none;
    padding: var(--ss-input-py) 0;
    width: 100%;
    min-width: 0;
    transition: color var(--ss-dur-fast) var(--ss-ease);

    &:focus {
      outline: none;
    }
    &[readonly] {
      color: var(--ss-fg-muted);
      cursor: default;
    }
    &:disabled {
      color: var(--ss-fg-faint);
      cursor: not-allowed;
      -webkit-text-fill-color: var(--ss-fg-faint);
    }

    // The native calendar picker glyph ships dark; invert + soften it so it
    // reads on the dark theme without clashing with the field chrome.
    &::-webkit-calendar-picker-indicator {
      filter: var(--ss-datefield-indicator-filter, invert(0.7));
      opacity: var(--ss-datefield-indicator-opacity, 0.7);
      cursor: pointer;
      transition: opacity var(--ss-dur-fast) var(--ss-ease);
    }
    &:hover::-webkit-calendar-picker-indicator {
      opacity: 1;
    }
    &:disabled::-webkit-calendar-picker-indicator {
      cursor: not-allowed;
      opacity: 0.35;
    }
  }
</style>
