import { describe, it, expect } from 'vitest'
import {
  searchBackdropPress,
  searchClosePress,
  searchFilter,
  searchFirstActive,
  searchFlat,
  searchFold,
  searchGroups,
  searchHover,
  searchInputAttrs,
  searchInputKey,
  searchItemPress,
  searchOptionAttrs,
  searchShortcut,
  searchStatus,
  searchValidActive,
  type SearchPaletteState,
} from '$lib/core/search-palette'

const ITEMS = [
  { id: 'home', label: 'Home', href: '/', group: 'Pages' },
  { id: 'tokens', label: 'Tokens', group: 'Pages', keywords: ['colors', 'São'] },
  { id: 'theme', label: 'Toggle theme' },
  { id: 'post', label: 'Release 0.12', group: 'Posts' },
  { id: 'quit', label: 'Quit' },
]

describe('core/search-palette — results', () => {
  it('folds case and diacritics', () => {
    expect(searchFold('São PAULO')).toBe('sao paulo')
  })

  it('a blank query keeps every item', () => {
    expect(searchFilter(ITEMS, '')).toEqual(ITEMS)
    expect(searchFilter(ITEMS, '   ')).toEqual(ITEMS)
  })

  it('matches label and keywords as a folded substring', () => {
    const ids = (q: string) => searchFilter(ITEMS, q).map((i) => i.id)
    expect(ids('TOK')).toEqual(['tokens'])
    expect(ids(' sao ')).toEqual(['tokens'])
    expect(ids('colors')).toEqual(['tokens'])
    expect(ids('t')).toEqual(['tokens', 'theme', 'quit'])
    expect(ids('zzz')).toEqual([])
  })

  it('groups in first-appearance order, ungrouped first, with flat indexes', () => {
    const groups = searchGroups(ITEMS)
    expect(groups.map((g) => g.label)).toEqual([null, 'Pages', 'Posts'])
    expect(groups.map((g) => g.entries.map((e) => [e.item.id, e.index]))).toEqual([
      [
        ['theme', 0],
        ['quit', 1],
      ],
      [
        ['home', 2],
        ['tokens', 3],
      ],
      [['post', 4]],
    ])
    expect(searchFlat(groups).map((i) => i.id)).toEqual(['theme', 'quit', 'home', 'tokens', 'post'])
  })

  it('no items, no groups', () => {
    expect(searchGroups([])).toEqual([])
    expect(searchFlat([])).toEqual([])
  })

  it('status is silent until a query is typed, then counts or reports no results', () => {
    const text = (n: number) => `${n} found`
    expect(searchStatus('', 3, text, 'Nothing')).toBe('')
    expect(searchStatus('  ', 3, text, 'Nothing')).toBe('')
    expect(searchStatus('a', 3, text, 'Nothing')).toBe('3 found')
    expect(searchStatus('a', 0, text, 'Nothing')).toBe('Nothing')
  })
})

// Five options: 0 disabled, 2 a link, 4 disabled.
const state = (active = 1, open = true): SearchPaletteState => ({
  open,
  active,
  items: [{ disabled: true }, {}, { href: '/x' }, {}, { disabled: true }],
})
const empty: SearchPaletteState = { open: true, active: 0, items: [] }
const allDisabled: SearchPaletteState = {
  open: true,
  active: 0,
  items: [{ disabled: true }, { disabled: true }],
}

describe('core/search-palette — active option', () => {
  it('starts on the first selectable option, 0 when there is none', () => {
    expect(searchFirstActive(state())).toBe(1)
    expect(searchFirstActive(empty)).toBe(0)
    expect(searchFirstActive(allDisabled)).toBe(0)
  })

  it('keeps a valid active index, repairs an out-of-range or disabled one', () => {
    expect(searchValidActive(state(3))).toBe(3)
    expect(searchValidActive(state(0))).toBe(1)
    expect(searchValidActive(state(9))).toBe(1)
    expect(searchValidActive(empty)).toBe(0)
  })

  it('hover activates enabled options only', () => {
    expect(searchHover(state(), 3)).toBe(3)
    expect(searchHover(state(), 0)).toBeNull()
    expect(searchHover(state(), 12)).toBeNull()
  })
})

describe('core/search-palette — input keys', () => {
  const move = (index: number) => ({ action: { type: 'move', index }, preventDefault: true })

  it('ArrowDown / ArrowUp step over disabled options and wrap', () => {
    expect(searchInputKey(state(1), 'ArrowDown')).toEqual(move(2))
    expect(searchInputKey(state(3), 'ArrowDown')).toEqual(move(1))
    expect(searchInputKey(state(3), 'ArrowUp')).toEqual(move(2))
    expect(searchInputKey(state(1), 'ArrowUp')).toEqual(move(3))
  })

  it('PageUp / PageDown jump to the first / last selectable option', () => {
    expect(searchInputKey(state(3), 'PageUp')).toEqual(move(1))
    expect(searchInputKey(state(1), 'PageDown')).toEqual(move(3))
  })

  it('with nothing selectable the active option stays; an empty list does nothing', () => {
    expect(searchInputKey(allDisabled, 'ArrowDown')).toEqual(move(0))
    expect(searchInputKey(empty, 'ArrowDown')).toEqual({ action: null, preventDefault: true })
  })

  it('Enter activates the active option: links through their anchor, the rest directly', () => {
    expect(searchInputKey(state(1), 'Enter')).toEqual({
      action: { type: 'activate', index: 1, via: 'item' },
      preventDefault: true,
    })
    expect(searchInputKey(state(2), 'Enter')).toEqual({
      action: { type: 'activate', index: 2, via: 'anchor' },
      preventDefault: true,
    })
  })

  it('Enter on a disabled or missing option is swallowed', () => {
    expect(searchInputKey(state(0), 'Enter')).toEqual({ action: null, preventDefault: true })
    expect(searchInputKey(empty, 'Enter')).toEqual({ action: null, preventDefault: true })
  })

  it('Tab is swallowed so focus stays on the input', () => {
    expect(searchInputKey(state(), 'Tab')).toEqual({ action: null, preventDefault: true })
  })

  it.each(['Home', 'End', 'Escape', 'a', ' ', 'ArrowLeft'])('%j is left to the browser', (key) => {
    expect(searchInputKey(state(), key)).toBeNull()
  })

  it('ignores every key during an IME composition', () => {
    expect(searchInputKey(state(), 'ArrowDown', true)).toBeNull()
    expect(searchInputKey(state(), 'Enter', true)).toBeNull()
  })
})

describe('core/search-palette — open / close', () => {
  it('the shortcut toggles', () => {
    expect(searchShortcut(false)).toEqual({ type: 'open', reason: 'shortcut' })
    expect(searchShortcut(true)).toEqual({ type: 'close', reason: 'shortcut' })
  })

  it('only a press on the backdrop itself closes', () => {
    expect(searchBackdropPress(state(), true)).toEqual({ type: 'close', reason: 'backdrop' })
    expect(searchBackdropPress(state(), false)).toBeNull()
    expect(searchBackdropPress(state(1, false), true)).toBeNull()
  })

  it('the close button closes', () => {
    expect(searchClosePress(state())).toEqual({ type: 'close', reason: 'close-button' })
    expect(searchClosePress(state(1, false))).toBeNull()
  })

  it('an item press selects and closes; disabled or missing items do nothing', () => {
    expect(searchItemPress(state(), 3)).toEqual({ close: { type: 'close', reason: 'select' } })
    expect(searchItemPress(state(1, false), 3)).toEqual({ close: null })
    expect(searchItemPress(state(), 0)).toBeNull()
    expect(searchItemPress(state(), 42)).toBeNull()
  })
})

describe('core/search-palette — attributes', () => {
  it('input reflects whether there are results and which is active', () => {
    expect(searchInputAttrs(3, 'opt-1')).toEqual({
      role: 'combobox',
      'aria-autocomplete': 'list',
      'aria-expanded': 'true',
      'aria-activedescendant': 'opt-1',
    })
    expect(searchInputAttrs(0, 'opt-0')).toEqual({
      role: 'combobox',
      'aria-autocomplete': 'list',
      'aria-expanded': 'false',
      'aria-activedescendant': undefined,
    })
  })

  it('options are never tab stops and carry selected / disabled as strings', () => {
    expect(searchOptionAttrs({ index: 1, active: 1 })).toEqual({
      role: 'option',
      'aria-selected': 'true',
      'aria-disabled': undefined,
      tabindex: -1,
    })
    expect(searchOptionAttrs({ index: 0, active: 1, disabled: true })).toEqual({
      role: 'option',
      'aria-selected': 'false',
      'aria-disabled': 'true',
      tabindex: -1,
    })
  })
})
