<script lang="ts">
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    label?: string
    id?: string
    name?: string
    value?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    oninput?: (e: Event & { currentTarget: HTMLTextAreaElement }) => void
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Marks the field invalid for assistive tech (aria-invalid). */
    invalid?: boolean
    /** id(s) of element(s) describing the field (aria-describedby) — e.g. hint/error text. */
    describedby?: string
    /** Supplementary helper text rendered under the textarea. */
    hint?: string
    /** Error text rendered under the textarea; its presence implies aria-invalid and is announced to AT. */
    error?: string
    /** Native readonly — value visible but not editable; rendered muted. */
    readonly?: boolean
    /** Native maxlength. */
    maxlength?: number
    /** Visible rows; acts as the minimum height (also while autosizing). */
    rows?: number
    /** Grow with content: `field-sizing: content` where supported, JS fallback elsewhere. */
    autosize?: boolean
    /** Row cap while autosizing — the field scrolls beyond it. */
    maxRows?: number
    /** Any remaining native textarea attributes / event handlers are forwarded. */
    [key: string]: unknown
  }
  let {
    label,
    id,
    name,
    value = $bindable(''),
    placeholder = '',
    required = false,
    disabled = false,
    oninput,
    size,
    invalid,
    describedby,
    hint,
    error,
    readonly = false,
    maxlength,
    rows = 3,
    autosize = false,
    maxRows = 10,
    ...rest
  }: Props = $props()

  // Guarantee a label↔textarea association even when no `id` is passed.
  const uid = $props.id()
  const fieldId = $derived(id ?? uid)
  const hintId = $derived(`${fieldId}-hint`)
  const errorId = $derived(`${fieldId}-error`)

  // error wins, then hint, then any caller-supplied describedby — order matters for AT.
  const describedBy = $derived(
    [error ? errorId : null, hint ? hintId : null, describedby].filter(Boolean).join(' ') ||
      undefined,
  )
  const isInvalid = $derived(invalid || Boolean(error) || undefined)
  // 'Textarea' is not in the ComponentName union yet (manifest is owned by the
  // integration step) — cast until dssoca.config.ts registers it.
  const resolvedSize = $derived(resolveComponentSize('Textarea', size))

  // Autosize: prefer native `field-sizing: content` (see the scoped CSS); fall
  // back to syncing the height to scrollHeight when the engine lacks it. The
  // CSS max-height (from maxRows) clamps both paths.
  let el = $state<HTMLTextAreaElement>()
  const supportsFieldSizing =
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('field-sizing', 'content')

  $effect(() => {
    void value // re-run on every value change (including programmatic ones)
    if (!autosize || supportsFieldSizing || !el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  })
</script>

<div class="ss-textarea" data-size-variant={resolvedSize} class:invalid={isInvalid} class:disabled>
  {#if label}
    <label class="lbl" for={fieldId}>
      {label}
      {#if required}<span class="req" aria-hidden="true">*</span>{/if}
    </label>
  {/if}

  <div class="control">
    <textarea
      bind:this={el}
      class="field"
      class:autosize
      id={fieldId}
      {name}
      bind:value
      {placeholder}
      {required}
      {disabled}
      {readonly}
      {maxlength}
      {rows}
      aria-invalid={isInvalid}
      aria-describedby={describedBy}
      style:max-height={autosize && maxRows
        ? `calc(${maxRows} * 1lh + 2 * var(--ss-input-py))`
        : undefined}
      {oninput}
      {...rest}
    ></textarea>
  </div>

  {#if error}<span class="msg error" id={errorId} role="alert">{error}</span>{/if}
  {#if hint}<span class="msg hint" id={hintId}>{hint}</span>{/if}
</div>

<style lang="scss">
  // Multiline twin of Input — same label / control / msg anatomy and the same
  // --ss-* field tokens, so the two sit side by side without visual drift.
  .ss-textarea {
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

    // The border/focus ring lives on the wrapper, mirroring Input's .control.
    .control {
      display: flex;
      align-items: stretch;
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
        box-shadow: 0 0 0 3px rgba(var(--ss-red-rgb), 0.22);
      }
    }

    &.disabled .control {
      border-color: var(--ss-line);
    }

    .field {
      font-family: var(--ss-font-body);
      font-size: var(--ss-input-font);
      line-height: 1.5;
      background: transparent;
      color: var(--ss-fg);
      border: none;
      padding: var(--ss-input-py) 0;
      width: 100%;
      min-width: 0;
      resize: vertical;
      transition: color var(--ss-dur-fast) var(--ss-ease);

      &:focus {
        outline: none;
      }
      &::placeholder {
        font-style: italic;
        color: var(--ss-fg-faint);
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

      // Grow with content; `rows` keeps the minimum, max-height (inline, from
      // maxRows) caps growth and the overflow takes over past the cap.
      &.autosize {
        resize: none;
        overflow-y: auto;
        @supports (field-sizing: content) {
          field-sizing: content;
        }
      }
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
</style>
