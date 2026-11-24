import { describe, it, expect } from 'vitest'
import {
  FOLLOW_SLACK,
  LOG_LEVELS,
  filterLogLines,
  logCopyText,
  logEmptyMessage,
  logFollowsTail,
  logLineVisible,
  toggleLogLevel,
  type LogStreamLevel,
  type LogStreamLine,
} from '$lib/core/log-stream'

// DS-0197 — the LogStream decisions: filtering, the level chips, follow-tail and COPY.

const all = new Set<LogStreamLevel>(LOG_LEVELS)
const lines: LogStreamLine[] = [
  { t: '12:00:01', lvl: 'info', svc: '[hub]', msg: 'session refresh' },
  { t: '12:00:02', lvl: 'warn', svc: '[caddy]', msg: 'tls renewing' },
  { lvl: 'err', msg: 'EADDRINUSE :3004' },
  { t: '12:00:04', lvl: 'ok', svc: '[hub]', msg: 'GET /api — 8ms' },
]

describe('core/log-stream — levels', () => {
  it('lists the four levels in chip order', () => {
    expect(LOG_LEVELS).toEqual(['info', 'warn', 'err', 'ok'])
  })

  it('a chip press turns its level off, and on again', () => {
    const off = toggleLogLevel(all, 'warn')
    expect([...off]).toEqual(['info', 'err', 'ok'])
    expect(toggleLogLevel(off, 'warn').has('warn')).toBe(true)
  })

  it('returns a new set and leaves the input alone', () => {
    const next = toggleLogLevel(all, 'err')
    expect(next).not.toBe(all)
    expect(all.has('err')).toBe(true)
  })

  it('can turn every level off', () => {
    let levels: ReadonlySet<LogStreamLevel> = all
    for (const lvl of LOG_LEVELS) levels = toggleLogLevel(levels, lvl)
    expect(levels.size).toBe(0)
  })
})

describe('core/log-stream — filtering', () => {
  it('shows everything with all levels on and no text', () => {
    expect(filterLogLines(lines, { levels: all, query: '' })).toEqual(lines)
  })

  it('hides the lines whose level chip is off', () => {
    const levels = new Set<LogStreamLevel>(['err', 'ok'])
    expect(filterLogLines(lines, { levels, query: '' }).map((l) => l.lvl)).toEqual(['err', 'ok'])
    expect(filterLogLines(lines, { levels: new Set(), query: '' })).toEqual([])
  })

  it('matches the text case-insensitively against time, level, service and message', () => {
    const find = (query: string) => filterLogLines(lines, { levels: all, query }).map((l) => l.msg)
    expect(find('TLS')).toEqual(['tls renewing'])
    expect(find('[hub]')).toEqual(['session refresh', 'GET /api — 8ms'])
    expect(find('12:00:02')).toEqual(['tls renewing'])
    expect(find('warn')).toEqual(['tls renewing'])
    expect(find('eaddrinuse')).toEqual(['EADDRINUSE :3004'])
    expect(find('nothing like this')).toEqual([])
  })

  it('whitespace-only text filters nothing', () => {
    expect(filterLogLines(lines, { levels: all, query: '   ' })).toEqual(lines)
  })

  it('matches the text as typed, spaces included', () => {
    expect(logLineVisible(lines[0], { levels: all, query: 'session refresh' })).toBe(true)
    expect(logLineVisible(lines[0], { levels: all, query: 'session  refresh' })).toBe(false)
    // The fields are joined with single spaces, so a query can span two of them.
    expect(logLineVisible(lines[0], { levels: all, query: 'info [hub]' })).toBe(true)
  })

  it('applies the level chips and the text together', () => {
    const levels = new Set<LogStreamLevel>(['info'])
    expect(filterLogLines(lines, { levels, query: 'hub' }).map((l) => l.msg)).toEqual([
      'session refresh',
    ])
  })

  it('copes with a line that has no timestamp or service', () => {
    expect(logLineVisible(lines[2], { levels: all, query: 'err' })).toBe(true)
    expect(logLineVisible(lines[2], { levels: all, query: 'undefined' })).toBe(false)
  })
})

describe('core/log-stream — follow-tail', () => {
  const at = (scrollTop: number) => ({ scrollHeight: 1000, clientHeight: 200, scrollTop })

  it('follows while the view is at the bottom, with some slack', () => {
    expect(FOLLOW_SLACK).toBe(24)
    expect(logFollowsTail(at(800))).toBe(true)
    expect(logFollowsTail(at(776))).toBe(true)
  })

  it('stops following once the reader scrolls up past the slack', () => {
    expect(logFollowsTail(at(775))).toBe(false)
    expect(logFollowsTail(at(0))).toBe(false)
  })

  it('follows when the content does not overflow', () => {
    expect(logFollowsTail({ scrollHeight: 120, clientHeight: 200, scrollTop: 0 })).toBe(true)
  })
})

describe('core/log-stream — copy and empty state', () => {
  it('copies one "time LEVEL service message" row per line', () => {
    expect(logCopyText(lines.slice(0, 2))).toBe(
      '12:00:01 INFO [hub] session refresh\n12:00:02 WARN [caddy] tls renewing',
    )
  })

  it('trims the row when the timestamp is missing, keeping the inner spacing', () => {
    expect(logCopyText([lines[2]])).toBe('ERR  EADDRINUSE :3004')
    expect(logCopyText([])).toBe('')
  })

  it('tells an empty stream from a filtered-out one', () => {
    expect(logEmptyMessage(0)).toBe('Waiting for output…')
    expect(logEmptyMessage(5)).toBe('No lines match the current filters.')
  })
})
