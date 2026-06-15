<script module lang="ts">
  /** A single selectable option. */
  export interface SelectOption {
    value: string
    label: string
    disabled?: boolean
  }
  /** A labelled group of options, rendered as an <optgroup>. */
  export interface SelectOptGroup {
    label: string
    options: SelectOption[]
  }
</script>

<script lang="ts">
  import type { HTMLSelectAttributes } from 'svelte/elements'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    label?: string
    id?: string
    name?: string
    value?: string
    /** Flat options, or grouped options (detected by an `options` array on the first element). */
    options?: SelectOption[] | SelectOptGroup[]
    /** Renders a disabled, hidden first option, selected while the value is empty. */
    placeholder?: string
    required?: boolean
    disabled?: boolean
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Marks the field invalid for assistive tech (aria-invalid). */
    invalid?: boolean
    /** Supplementary helper text rendered under the select. */
    hint?: string
    /** Error text rendered under the select; its presence implies aria-invalid and is announced. */
    error?: string
    /** id(s) of element(s) describing the field (aria-describedby) — e.g. hint/error text. */
    describedby?: string
    onchange?: (e: Event & { currentTarget: HTMLSelectElement }) => void
    /** Any remaining native select attributes / event handlers are forwarded. */
    [key: string]: unknown
  }
  let {
    label,
    id,
    name,
    value = $bindable(''),
    options = [],
    placeholder,
    required = false,
    disabled = false,
    size,
    invalid,
    hint,
    error,
    describedby,
    onchange,
    ...rest
  }: Props = $props()

  // Guarantee a label↔select association even when no `id` is passed.
  const uid = $props.id()
  const selectId = $derived(id ?? uid)
  const hintId = $derived(`${selectId}-hint`)
  const errorId = $derived(`${selectId}-error`)

  // error wins, then hint, then any caller-supplied describedby — order matters for AT.
  const describedBy = $derived(
    [error ? errorId : null, hint ? hintId : null, describedby].filter(Boolean).join(' ') ||
      undefined,
  )
  const isInvalid = $derived(invalid || Boolean(error) || undefined)
  const resolvedSize = $derived(resolveComponentSize('Select', size))

  // Grouped input is detected by an `options` array on the first element.
  const grouped = $derived(
    options.length > 0 && Array.isArray((options[0] as SelectOptGroup).options),
  )
  const groups = $derived(grouped ? (options as SelectOptGroup[]) : [])
  const flat = $derived(grouped ? [] : (options as SelectOption[]))
</script>

<div class="ss-select" data-size-variant={resolvedSize} class:invalid={isInvalid} class:disabled>
  {#if label}
    <label class="lbl" for={selectId}>
      {label}
      {#if required}<span class="req" aria-hidden="true">*</span>{/if}
    </label>
  {/if}

  <div class="control">
    <select
      class="select"
      id={selectId}
      {name}
      bind:value
      {required}
      {disabled}
      aria-invalid={isInvalid}
      aria-describedby={describedBy}
      {onchange}
      {...rest}
    >
      {#if placeholder}
        <option value="" disabled hidden selected={!value}>{placeholder}</option>
      {/if}
      {#if grouped}
        {#each groups as group (group.label)}
          <optgroup label={group.label}>
            {#each group.options as opt (opt.value)}
              <option value={opt.value} disabled={opt.disabled}>{opt.label}</option>
            {/each}
          </optgroup>
        {/each}
      {:else}
        {#each flat as opt (opt.value)}
          <option value={opt.value} disabled={opt.disabled}>{opt.label}</option>
        {/each}
      {/if}
    </select>
    <span class="chevron" aria-hidden="true"></span>
  </div>

  {#if error}<span class="msg error" id={errorId} role="alert">{error}</span>{/if}
  {#if hint}<span class="msg hint" id={hintId}>{hint}</span>{/if}
</div>

<style lang="scss">
  .ss-select {
    // 6px label↔control↔message gap mirrors Input (DS-0068): sits between the
    // spacing-scale steps (--ss-s-1: 4px / --ss-s-2: 8px) with no matching token.
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

    // The border/focus ring lives on the wrapper so the chevron sits inside the field.
    .control {
      position: relative;
      display: flex;
      align-items: center;
      background: transparent;
      color: var(--ss-fg);
      border: 1px solid var(--ss-line);
      padding: 0 var(--ss-input-px);
      transition:
        border-color var(--ss-dur-fast) var(--ss-ease),
        box-shadow var(--ss-dur-fast) var(--ss-ease);

      // Ring hugs the WRAPPER (border recolour + soft shadow), matching Input (DS-0068).
      &:focus-within {
        border-color: var(--ss-primary);
        box-shadow: 0 0 0 3px var(--ss-primary-soft);
      }
    }

    &.invalid .control {
      border-color: var(--ss-red);
      &:focus-within {
        border-color: var(--ss-red);
        box-shadow: 0 0 0 3px rgba(var(--ss-red-rgb), 0.22);
      }
    }

    &.disabled .control {
      border-color: var(--ss-line);
    }

    // Custom chevron drawn with a CSS triangle (no deps); sits over the native arrow.
    .chevron {
      flex: none;
      pointer-events: none;
      width: 0;
      height: 0;
      margin-left: var(--ss-gap-sm);
      border-left: var(--ss-select-chevron, 5px) solid transparent;
      border-right: var(--ss-select-chevron, 5px) solid transparent;
      border-top: var(--ss-select-chevron, 5px) solid var(--ss-fg-muted);
      transition: border-top-color var(--ss-dur-fast) var(--ss-ease);
    }

    &:not(.disabled) .control:focus-within .chevron {
      border-top-color: var(--ss-fg);
    }

    &.disabled .chevron {
      border-top-color: var(--ss-fg-faint);
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

  .select {
    appearance: none;
    -webkit-appearance: none;
    font-family: var(--ss-font-body);
    font-size: var(--ss-input-font);
    background: transparent;
    color: var(--ss-fg);
    border: none;
    padding: var(--ss-input-py) 0;
    width: 100%;
    min-width: 0;
    cursor: pointer;
    transition: color var(--ss-dur-fast) var(--ss-ease);

    &:focus {
      outline: none;
    }
    &:disabled {
      color: var(--ss-fg-faint);
      cursor: not-allowed;
      -webkit-text-fill-color: var(--ss-fg-faint);
    }
    // Native option/optgroup lists paint on the OS layer; pin a readable surface.
    option,
    optgroup {
      background: var(--ss-bg-elev);
      color: var(--ss-fg);
    }
  }
</style>
