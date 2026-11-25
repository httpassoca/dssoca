/**
 * LogStream core (DS-0197) — the viewer's decisions: which lines pass the level chips and the
 * text filter, what a chip press does, when the view follows the tail, and what COPY copies.
 * Pure functions; LogStream.svelte holds the state and measures the scroller. No DOM, no Svelte.
 */

/** A log severity level. */
export type LogStreamLevel = 'info' | 'warn' | 'err' | 'ok'

/** The fields of a log line the decisions read (structurally the component's `LogLine`). */
export interface LogStreamLine {
  /** Timestamp string, rendered verbatim. */
  t?: string
  lvl: LogStreamLevel
  /** Service / source tag. */
  svc?: string
  msg: string
}

/** Every level, in the order the filter chips show them. */
export const LOG_LEVELS: readonly LogStreamLevel[] = Object.freeze(['info', 'warn', 'err', 'ok'])

export interface LogStreamFilter {
  /** Levels whose chip is on. */
  levels: ReadonlySet<LogStreamLevel>
  /** The text filter as typed; blank matches everything. */
  query: string
}

/**
 * Whether a line is shown: its level chip is on, and the text filter (case-insensitive) occurs
 * somewhere in its timestamp, level, service or message. Whitespace-only text filters nothing;
 * otherwise the text is matched as typed, spaces included.
 */
export function logLineVisible(line: LogStreamLine, filter: LogStreamFilter): boolean {
  if (!filter.levels.has(line.lvl)) return false
  if (!filter.query.trim()) return true
  const hay = `${line.t ?? ''} ${line.lvl} ${line.svc ?? ''} ${line.msg}`.toLowerCase()
  return hay.includes(filter.query.toLowerCase())
}

/** The lines that pass {@link logLineVisible}, in order. */
export function filterLogLines<T extends LogStreamLine>(
  lines: readonly T[],
  filter: LogStreamFilter,
): T[] {
  return lines.filter((line) => logLineVisible(line, filter))
}

/** A level chip was pressed: the next set of active levels (a new set; the input is untouched). */
export function toggleLogLevel(
  levels: ReadonlySet<LogStreamLevel>,
  level: LogStreamLevel,
): Set<LogStreamLevel> {
  const next = new Set(levels)
  if (!next.delete(level)) next.add(level)
  return next
}

/** How close to the bottom, in px, still counts as "at the bottom". */
export const FOLLOW_SLACK = 24

/** The scroller's measurements, as read from the element by the caller. */
export interface LogStreamScroll {
  scrollHeight: number
  scrollTop: number
  clientHeight: number
}

/**
 * Whether the view follows the tail after a scroll: yes while it sits within
 * {@link FOLLOW_SLACK} of the bottom, no once the reader has scrolled up to look at something.
 */
export function logFollowsTail(scroll: LogStreamScroll): boolean {
  return scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight <= FOLLOW_SLACK
}

/** What COPY puts on the clipboard: one `time LEVEL service message` row per line. */
export function logCopyText(lines: readonly LogStreamLine[]): string {
  return lines
    .map((l) => `${l.t ?? ''} ${l.lvl.toUpperCase()} ${l.svc ?? ''} ${l.msg}`.trim())
    .join('\n')
}

/** The empty-state message: nothing has arrived yet, or the filters hide everything there is. */
export function logEmptyMessage(totalLines: number): string {
  return totalLines ? 'No lines match the current filters.' : 'Waiting for output…'
}
