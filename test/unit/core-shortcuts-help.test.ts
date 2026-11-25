import { describe, it, expect, vi } from 'vitest'
import {
  SHORTCUTS_FALLBACK_GROUP,
  shortcutsHelpGroups,
  shortcutsHelpRecordKey,
  shortcutsHelpRecordPress,
} from '$lib/core/shortcuts-help'

const ITEMS = [
  { id: 'help' },
  { id: 'save', group: 'Editor' },
  { id: 'go', group: 'Navigation' },
  { id: 'undo', group: 'Editor' },
  { id: 'misc', group: 'General' },
]
const shape = (groups: { name: string; items: { id: string }[] }[]) =>
  groups.map((g) => [g.name, g.items.map((i) => i.id)])

describe('core/shortcuts-help — groups', () => {
  it('the fallback group is "General"', () => {
    expect(SHORTCUTS_FALLBACK_GROUP).toBe('General')
  })

  it('buckets in first-appearance order with General (and ungrouped) last', () => {
    expect(shape(shortcutsHelpGroups(ITEMS))).toEqual([
      ['Editor', ['save', 'undo']],
      ['Navigation', ['go']],
      ['General', ['help', 'misc']],
    ])
  })

  it('groupOrder lists its groups first; the rest keep the default order', () => {
    expect(shape(shortcutsHelpGroups(ITEMS, ['Navigation'])).map(([n]) => n)).toEqual([
      'Navigation',
      'Editor',
      'General',
    ])
    expect(shape(shortcutsHelpGroups(ITEMS, ['General', 'Navigation'])).map(([n]) => n)).toEqual([
      'General',
      'Navigation',
      'Editor',
    ])
  })

  it('unknown names in groupOrder are ignored, an empty order changes nothing', () => {
    expect(shape(shortcutsHelpGroups(ITEMS, ['Nope', 'Navigation'])).map(([n]) => n)).toEqual([
      'Navigation',
      'Editor',
      'General',
    ])
    expect(shortcutsHelpGroups(ITEMS, [])).toEqual(shortcutsHelpGroups(ITEMS))
  })

  it('no shortcuts, no groups', () => {
    expect(shortcutsHelpGroups([])).toEqual([])
  })
})

describe('core/shortcuts-help — recording', () => {
  it('the row button starts recording, or cancels the row already recording', () => {
    expect(shortcutsHelpRecordPress(null, 'save')).toEqual({ type: 'start', id: 'save' })
    expect(shortcutsHelpRecordPress('undo', 'save')).toEqual({ type: 'start', id: 'save' })
    expect(shortcutsHelpRecordPress('save', 'save')).toEqual({ type: 'cancel' })
  })

  it('a modifier-only press waits, without judging anything', () => {
    const verdict = vi.fn(() => 'ok' as const)
    expect(shortcutsHelpRecordKey(null, verdict)).toEqual({ type: 'wait' })
    expect(verdict).not.toHaveBeenCalled()
  })

  it('bare Escape cancels, without judging anything', () => {
    const verdict = vi.fn(() => 'ok' as const)
    expect(shortcutsHelpRecordKey('escape', verdict)).toEqual({ type: 'cancel' })
    expect(verdict).not.toHaveBeenCalled()
  })

  it('a usable combo is bound', () => {
    expect(shortcutsHelpRecordKey('ctrl+shift+s', () => 'ok')).toEqual({
      type: 'remap',
      combo: 'ctrl+shift+s',
    })
  })

  it('a chorded Escape is a candidate like any other combo', () => {
    expect(shortcutsHelpRecordKey('shift+escape', () => 'ok').type).toBe('remap')
  })

  it.each(['reserved', 'invalid'] as const)(
    'a %s combo is rejected, recording stays live',
    (why) => {
      expect(shortcutsHelpRecordKey('ctrl+w', () => why)).toEqual({
        type: 'reject',
        why,
        combo: 'ctrl+w',
      })
    },
  )
})
