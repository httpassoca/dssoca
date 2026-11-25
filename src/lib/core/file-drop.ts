/**
 * FileDrop core (DS-0197) — what a key on the zone does, which files a selection keeps
 * (`accept` + `multiple`), what the rejection announcement says, and where focus lands after a
 * removal. Pure functions over plain data: FileDrop.svelte holds the files and applies the
 * result. No DOM, no Svelte (a `File` is only ever read as `{ name, type, size }`).
 */

/** Why the selection changed; passed to `onfiles`. */
export type FileDropReason = 'select' | 'drop' | 'remove' | 'clear'

export interface FileDropChangeDetails {
  reason: FileDropReason
}

/** The parts of a `File` the core reads. */
export interface FileDropFile {
  name: string
  type: string
  size?: number
}

// --- activation -----------------------------------------------------------------

export interface FileDropZoneState {
  disabled: boolean
}

export type FileDropAction = { type: 'browse' }

/** A key the zone handles: its action, and whether the browser default must be cancelled. */
export interface FileDropKeyResult {
  action: FileDropAction | null
  preventDefault: boolean
}

/** The zone was clicked: open the native picker, unless disabled. */
export function fileDropPress(state: FileDropZoneState): FileDropAction | null {
  return state.disabled ? null : { type: 'browse' }
}

/** A key on the zone. `null` = not a zone key (or the zone is disabled), let it through. */
export function fileDropKey(state: FileDropZoneState, key: string): FileDropKeyResult | null {
  if (state.disabled) return null
  switch (key) {
    case 'Enter':
    case ' ':
      return { action: fileDropPress(state), preventDefault: true }
    default:
      return null
  }
}

/**
 * A drag moved over (`over`), left (`leave`) or dropped on (`drop`) the zone: the next
 * `dragging` flag. `null` when disabled — the event is not ours and must not be cancelled.
 */
export function fileDropDrag(
  state: FileDropZoneState,
  event: 'over' | 'leave' | 'drop',
): boolean | null {
  if (state.disabled) return null
  return event === 'over'
}

// --- validation -----------------------------------------------------------------

/** Does a file satisfy the `accept` filter? An empty filter matches everything. */
export function fileDropMatchesAccept(file: FileDropFile, accept?: string | null): boolean {
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

/** Why a file was discarded: wrong type for `accept`, or an extra when not `multiple`. */
export type FileDropRejectReason = 'type' | 'count'

export interface FileDropRejection<F extends FileDropFile> {
  file: F
  reason: FileDropRejectReason
}

export interface FileDropSelection<F extends FileDropFile> {
  /** The files kept, in the order given. */
  accepted: F[]
  rejected: FileDropRejection<F>[]
  /** Live-region text for the rejections; `''` when nothing was discarded. */
  announcement: string
}

export interface FileDropRules {
  accept?: string | null
  multiple?: boolean
}

const REJECT_TEXT: Record<FileDropRejectReason, string> = {
  type: 'file type not accepted',
  count: 'only one file allowed',
}

/** Apply `accept` and `multiple` to a picked or dropped list. The type check comes first. */
export function fileDropSelect<F extends FileDropFile>(
  list: readonly F[],
  rules: FileDropRules = {},
): FileDropSelection<F> {
  const accepted: F[] = []
  const rejected: FileDropRejection<F>[] = []
  for (const file of list) {
    if (!fileDropMatchesAccept(file, rules.accept)) rejected.push({ file, reason: 'type' })
    else if (!rules.multiple && accepted.length) rejected.push({ file, reason: 'count' })
    else accepted.push(file)
  }
  const reasons = rejected.map(({ file, reason }) => `${file.name} (${REJECT_TEXT[reason]})`)
  return {
    accepted,
    rejected,
    announcement: reasons.length ? `Not added: ${reasons.join(', ')}.` : '',
  }
}

// --- removal --------------------------------------------------------------------

export interface FileDropRemoval<F> {
  files: F[]
  /**
   * Where focus goes once the pressed remove button is gone: the remove button now at that
   * index (the next file, else the previous one), or the `zone` when the list is empty.
   */
  focus: number | 'zone'
}

/** Remove the file at `index`. */
export function fileDropRemove<F>(files: readonly F[], index: number): FileDropRemoval<F> {
  const next = files.filter((_, i) => i !== index)
  const focus = index < next.length ? index : next.length ? next.length - 1 : 'zone'
  return { files: next, focus }
}

// --- presentation ---------------------------------------------------------------

/** Human-readable byte size (1 KB = 1024 B). */
export function fileDropSize(bytes: number): string {
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

// Strings, not booleans, so the attributes read the same wherever they are written.
export function fileDropZoneAttrs(state: FileDropZoneState) {
  return {
    role: 'button',
    tabindex: state.disabled ? -1 : 0,
    'aria-disabled': state.disabled ? 'true' : undefined,
  } as const
}
