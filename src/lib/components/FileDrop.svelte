<script lang="ts">
  import { tick } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    /** Field label, doubles as part of the drop zone's accessible name. */
    label?: string
    /** Native accept filter (e.g. 'application/json,.json'); also enforced on drop. */
    accept?: string
    /** Allow selecting/dropping more than one file. Default false. */
    multiple?: boolean
    /** Disables pointer + keyboard activation and mutes the chrome. */
    disabled?: boolean
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Supplementary helper text rendered under the zone. */
    hint?: string
    /** Error text rendered under the zone; announced to AT via role="alert". */
    error?: string
    /** Selected files. Bindable. */
    files?: File[]
    /** Fired with the resolved file list whenever the selection changes. */
    onfiles?: (files: File[]) => void
    /**
     * Fired with the files a selection/drop discarded (wrong type for `accept`,
     * or extras when `multiple` is false). Rejections are also announced
     * through a polite live region.
     */
    onreject?: (files: File[]) => void
  }
  let {
    label,
    accept,
    multiple = false,
    disabled = false,
    size,
    hint,
    error,
    files = $bindable([]),
    onfiles,
    onreject,
  }: Props = $props()

  const uid = $props.id()
  const inputId = `${uid}-input`
  const labelId = `${uid}-label`
  const titleId = `${uid}-title`
  const hintId = `${uid}-hint`
  const errorId = `${uid}-error`

  const describedBy = $derived(
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined,
  )
  const resolvedSize = $derived(resolveComponentSize('FileDrop', size))

  // The zone is named by its visible text (label + "Drop files here") so the
  // accessible name matches what speech-input users see (WCAG 2.5.3). The hint
  // stays in aria-describedby only, so it isn't read twice.
  const labelledBy = $derived(label ? `${labelId} ${titleId}` : titleId)

  let rootEl = $state<HTMLDivElement>()
  let zoneEl = $state<HTMLDivElement>()
  let inputEl = $state<HTMLInputElement>()
  let dragging = $state(false)
  // Polite live region text; the region is always mounted so updates announce.
  let status = $state('')

  /** Human-readable byte size (1 KB = 1024 B). */
  function humanSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    const units = ['KB', 'MB', 'GB', 'TB']
    let v = bytes / 1024
    let i = 0
    while (v >= 1024 && i < units.length - 1) {
      v /= 1024
      i++
    }
    return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`
  }

  /** Does a file satisfy the `accept` filter? Empty accept matches everything. */
  function matchesAccept(file: File): boolean {
    if (!accept) return true
    const name = file.name.toLowerCase()
    const type = file.type.toLowerCase()
    return accept
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .some((token) => {
        if (token.startsWith('.')) return name.endsWith(token)
        if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1))
        return type === token
      })
  }

  /** Set the live-region text, clearing first so a repeat message re-announces. */
  async function announce(message: string) {
    status = ''
    if (!message) return
    await tick()
    status = message
  }

  /** Apply accept/multiple, update state, notify (and report rejections). */
  function applyFiles(list: File[]) {
    if (disabled) return
    const reasons: string[] = []
    const rejected: File[] = []
    let next: File[] = []
    for (const file of list) {
      if (!matchesAccept(file)) {
        rejected.push(file)
        reasons.push(`${file.name} (file type not accepted)`)
      } else if (!multiple && next.length) {
        rejected.push(file)
        reasons.push(`${file.name} (only one file allowed)`)
      } else {
        next.push(file)
      }
    }
    files = next
    onfiles?.(next)
    if (rejected.length) onreject?.(rejected)
    void announce(rejected.length ? `Not added: ${reasons.join(', ')}.` : '')
  }

  function openPicker() {
    if (disabled) return
    inputEl?.click()
  }

  function onKeydown(e: KeyboardEvent) {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openPicker()
    }
  }

  function onChange(e: Event & { currentTarget: HTMLInputElement }) {
    applyFiles(Array.from(e.currentTarget.files ?? []))
  }

  function onDragOver(e: DragEvent) {
    if (disabled) return
    e.preventDefault()
    dragging = true
  }

  function onDragLeave(e: DragEvent) {
    if (disabled) return
    e.preventDefault()
    dragging = false
  }

  function onDrop(e: DragEvent) {
    if (disabled) return
    e.preventDefault()
    dragging = false
    applyFiles(Array.from(e.dataTransfer?.files ?? []))
  }

  async function removeAt(index: number) {
    if (disabled) return
    const next = files.filter((_, i) => i !== index)
    files = next
    onfiles?.(next)
    // The focused button just unmounted: land on the next remove button, else
    // the previous one, else the zone (WCAG 2.4.3).
    await tick()
    const buttons = rootEl?.querySelectorAll<HTMLButtonElement>('.files .remove') ?? []
    ;(buttons[index] ?? buttons[index - 1] ?? zoneEl)?.focus()
  }

  async function clear() {
    if (disabled) return
    files = []
    if (inputEl) inputEl.value = ''
    onfiles?.([])
    await tick()
    zoneEl?.focus()
  }
</script>

<div
  bind:this={rootEl}
  class="ss-filedrop"
  data-size-variant={resolvedSize}
  class:invalid={!!error}
  class:disabled
>
  {#if label}
    <span class="lbl" id={labelId}>{label}</span>
  {/if}

  <input
    bind:this={inputEl}
    class="native"
    id={inputId}
    type="file"
    {accept}
    {multiple}
    {disabled}
    tabindex="-1"
    aria-hidden="true"
    onchange={onChange}
  />
  <div
    bind:this={zoneEl}
    class="zone"
    class:dragging
    role="button"
    tabindex={disabled ? -1 : 0}
    aria-labelledby={labelledBy}
    aria-disabled={disabled || undefined}
    aria-describedby={describedBy}
    onclick={openPicker}
    onkeydown={onKeydown}
    ondragover={onDragOver}
    ondragenter={onDragOver}
    ondragleave={onDragLeave}
    ondrop={onDrop}
  >
    <span class="prompt">
      <span class="title" id={titleId}>Drop files here</span>
      <span class="sub">or click to browse</span>
    </span>
  </div>

  {#if files.length}
    <ul class="files">
      {#each files as file, i (file.name + i)}
        <li class="file">
          <span class="name">{file.name}</span>
          <span class="bytes">{humanSize(file.size)}</span>
          <button
            type="button"
            class="remove"
            aria-label={`Remove ${file.name}`}
            {disabled}
            onclick={() => removeAt(i)}>×</button
          >
        </li>
      {/each}
    </ul>
    <button type="button" class="clear" {disabled} onclick={clear}>Clear</button>
  {/if}

  {#if error}<span class="msg error" id={errorId} role="alert">{error}</span>{/if}
  {#if hint}<span class="msg hint" id={hintId}>{hint}</span>{/if}
  <span class="sr-only" role="status" aria-live="polite">{status}</span>
</div>

<style lang="scss">
  .ss-filedrop {
    display: flex;
    flex-direction: column;
    // 6px micro-gap matches the Input/Textarea field chrome (DS-0068): between
    // --ss-s-1 (4px) and --ss-s-2 (8px), kept as a deliberate fixed value.
    gap: 6px;

    .lbl {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      color: var(--ss-fg-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .zone {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      min-height: var(--ss-filedrop-min-h, 96px);
      padding: var(--ss-filedrop-py, var(--ss-s-4, 16px)) var(--ss-filedrop-px, var(--ss-s-3, 12px));
      background: transparent;
      color: var(--ss-fg);
      border: 1px dashed var(--ss-line);
      cursor: pointer;
      transition:
        border-color var(--ss-dur-fast) var(--ss-ease),
        background var(--ss-dur-fast) var(--ss-ease);

      &:focus-visible {
        outline: 2px solid var(--ss-primary);
        outline-offset: 2px;
      }

      &.dragging {
        border-color: var(--ss-primary);
        background: var(--ss-primary-soft);
      }
    }

    // Visually-hidden native input; activated programmatically via the zone.
    .native {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
      border: 0;
    }

    // Visually-hidden polite live region announcing rejected files.
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
      border: 0;
    }

    .prompt {
      display: flex;
      flex-direction: column;
      gap: var(--ss-gap-sm, 4px);
      pointer-events: none;
      .title {
        font-family: var(--ss-font-body);
        font-size: var(--ss-input-font);
        color: var(--ss-fg);
      }
      .sub {
        font-family: var(--ss-font-mono);
        font-size: var(--ss-ui-xs);
        color: var(--ss-fg-faint);
      }
    }

    .files {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      // Tight extra-small step (DS-0124) so the selected-files list reads as one
      // compact group. The per-file inner row (.file) keeps --ss-gap-sm — it
      // separates name/size/remove and reads better with the larger step.
      gap: var(--ss-gap-xs);
    }

    .file {
      display: flex;
      align-items: center;
      gap: var(--ss-gap-sm, 4px);
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      color: var(--ss-fg);
      border: 1px solid var(--ss-line);
      padding: var(--ss-filedrop-file-py, 4px) var(--ss-filedrop-file-px, 8px);

      .name {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .bytes {
        flex: none;
        color: var(--ss-fg-faint);
      }
      .remove {
        flex: none;
      }
    }

    // Hit area grown to the WCAG 2.5.8 floor (24×24 CSS px); the glyph/text
    // stays its size and is centred inside.
    .remove,
    .clear {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-inline-size: 24px;
      min-block-size: 24px;
      font-family: var(--ss-font-body);
      background: transparent;
      border: none;
      color: var(--ss-fg-faint);
      padding: 0;
      cursor: pointer;
      line-height: 1;
      transition: color var(--ss-dur-fast) var(--ss-ease);
      &:hover {
        color: var(--ss-fg);
      }
      &:focus-visible {
        outline: 2px solid var(--ss-primary);
        outline-offset: 2px;
        color: var(--ss-fg);
      }
    }

    .clear {
      align-self: flex-start;
      padding-inline: var(--ss-s-1, 4px);
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      text-transform: uppercase;
      letter-spacing: 0.08em;
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

    &.invalid .zone {
      border-color: var(--ss-red);
      &:focus-visible {
        outline-color: var(--ss-red);
      }
    }

    &.disabled {
      .zone {
        cursor: not-allowed;
        color: var(--ss-fg-faint);
        border-color: var(--ss-line);
        .title {
          color: var(--ss-fg-faint);
        }
      }
      .remove,
      .clear {
        cursor: not-allowed;
        color: var(--ss-fg-faint);
      }
    }
  }
</style>
