import { describe, it, expect } from 'vitest'
import {
  fileDropDrag,
  fileDropKey,
  fileDropMatchesAccept,
  fileDropPress,
  fileDropRemove,
  fileDropSelect,
  fileDropSize,
  fileDropZoneAttrs,
} from '$lib/core/file-drop'

const f = (name: string, type = '') => ({ name, type })
const json = f('data.json', 'application/json')
const png = f('Photo.PNG', 'image/png')
const txt = f('notes.txt', 'text/plain')

describe('core/file-drop — activation', () => {
  it('a press opens the picker, unless disabled', () => {
    expect(fileDropPress({ disabled: false })).toEqual({ type: 'browse' })
    expect(fileDropPress({ disabled: true })).toBeNull()
  })

  it('Enter and Space open the picker and cancel the default (no page scroll)', () => {
    for (const key of ['Enter', ' ']) {
      expect(fileDropKey({ disabled: false }, key)).toEqual({
        action: { type: 'browse' },
        preventDefault: true,
      })
    }
  })

  it('lets every other key through', () => {
    for (const key of ['Tab', 'Escape', 'ArrowDown', 'a', 'Spacebar']) {
      expect(fileDropKey({ disabled: false }, key)).toBeNull()
    }
  })

  it('a disabled zone handles no key at all', () => {
    expect(fileDropKey({ disabled: true }, 'Enter')).toBeNull()
    expect(fileDropKey({ disabled: true }, ' ')).toBeNull()
  })

  it('tracks the drag: over sets dragging, leave and drop clear it', () => {
    expect(fileDropDrag({ disabled: false }, 'over')).toBe(true)
    expect(fileDropDrag({ disabled: false }, 'leave')).toBe(false)
    expect(fileDropDrag({ disabled: false }, 'drop')).toBe(false)
  })

  it('a disabled zone ignores drags (null = do not cancel the event)', () => {
    expect(fileDropDrag({ disabled: true }, 'over')).toBeNull()
    expect(fileDropDrag({ disabled: true }, 'drop')).toBeNull()
  })

  it('reflects the state as role=button + string attributes', () => {
    expect(fileDropZoneAttrs({ disabled: false })).toEqual({
      role: 'button',
      tabindex: 0,
      'aria-disabled': undefined,
    })
    expect(fileDropZoneAttrs({ disabled: true })).toEqual({
      role: 'button',
      tabindex: -1,
      'aria-disabled': 'true',
    })
  })
})

describe('core/file-drop — accept filter', () => {
  it('an empty filter matches everything', () => {
    expect(fileDropMatchesAccept(txt)).toBe(true)
    expect(fileDropMatchesAccept(txt, '')).toBe(true)
    expect(fileDropMatchesAccept(txt, null)).toBe(true)
  })

  it('matches an exact MIME type', () => {
    expect(fileDropMatchesAccept(json, 'application/json')).toBe(true)
    expect(fileDropMatchesAccept(txt, 'application/json')).toBe(false)
  })

  it('matches a MIME wildcard', () => {
    expect(fileDropMatchesAccept(png, 'image/*')).toBe(true)
    expect(fileDropMatchesAccept(json, 'image/*')).toBe(false)
    // The slash is part of the prefix: `image/*` is not "anything starting with image".
    expect(fileDropMatchesAccept(f('x', 'imagery/png'), 'image/*')).toBe(false)
  })

  it('matches an extension, case-insensitively', () => {
    expect(fileDropMatchesAccept(png, '.png')).toBe(true)
    expect(fileDropMatchesAccept(json, '.JSON')).toBe(true)
    expect(fileDropMatchesAccept(txt, '.json')).toBe(false)
    // A file with no MIME type can still match by extension.
    expect(fileDropMatchesAccept(f('conf.json'), 'application/json,.json')).toBe(true)
  })

  it('accepts a comma list with stray spaces and empty tokens', () => {
    const accept = ' application/json , .txt ,, '
    expect(fileDropMatchesAccept(json, accept)).toBe(true)
    expect(fileDropMatchesAccept(txt, accept)).toBe(true)
    expect(fileDropMatchesAccept(png, accept)).toBe(false)
  })

  it('a filter of only separators matches nothing', () => {
    expect(fileDropMatchesAccept(txt, ' , ')).toBe(false)
  })
})

describe('core/file-drop — selection', () => {
  it('keeps every file when multiple and unfiltered', () => {
    const out = fileDropSelect([json, png, txt], { multiple: true })
    expect(out.accepted).toEqual([json, png, txt])
    expect(out.rejected).toEqual([])
    expect(out.announcement).toBe('')
  })

  it('keeps only the first file when not multiple', () => {
    const out = fileDropSelect([json, png, txt])
    expect(out.accepted).toEqual([json])
    expect(out.rejected).toEqual([
      { file: png, reason: 'count' },
      { file: txt, reason: 'count' },
    ])
    expect(out.announcement).toBe(
      'Not added: Photo.PNG (only one file allowed), notes.txt (only one file allowed).',
    )
  })

  it('discards files the accept filter refuses', () => {
    const out = fileDropSelect([json, txt], { accept: 'application/json', multiple: true })
    expect(out.accepted).toEqual([json])
    expect(out.rejected).toEqual([{ file: txt, reason: 'type' }])
    expect(out.announcement).toBe('Not added: notes.txt (file type not accepted).')
  })

  it('checks the type first: a refused file does not use up the single slot', () => {
    const out = fileDropSelect([txt, json, png], { accept: 'application/json,image/*' })
    expect(out.accepted).toEqual([json])
    expect(out.rejected).toEqual([
      { file: txt, reason: 'type' },
      { file: png, reason: 'count' },
    ])
  })

  it('an empty list is an empty selection', () => {
    expect(fileDropSelect([], { accept: '.json' })).toEqual({
      accepted: [],
      rejected: [],
      announcement: '',
    })
  })

  it('returns the same objects it was given (File identity is kept)', () => {
    const out = fileDropSelect([json], { multiple: true })
    expect(out.accepted[0]).toBe(json)
  })
})

describe('core/file-drop — removal', () => {
  const files = ['a', 'b', 'c']

  it('removes the file at the index without mutating the list', () => {
    expect(fileDropRemove(files, 1).files).toEqual(['a', 'c'])
    expect(files).toEqual(['a', 'b', 'c'])
  })

  it('focus lands on the next file, which now sits at the same index', () => {
    expect(fileDropRemove(files, 0).focus).toBe(0)
    expect(fileDropRemove(files, 1).focus).toBe(1)
  })

  it('removing the last file focuses the previous one', () => {
    expect(fileDropRemove(files, 2)).toEqual({ files: ['a', 'b'], focus: 1 })
  })

  it('removing the only file sends focus to the zone', () => {
    expect(fileDropRemove(['a'], 0)).toEqual({ files: [], focus: 'zone' })
  })
})

describe('core/file-drop — size text', () => {
  it.each([
    [0, '0 B'],
    [1023, '1023 B'],
    [1024, '1.0 KB'],
    [1536, '1.5 KB'],
    [10 * 1024, '10 KB'],
    [5 * 1024 * 1024, '5.0 MB'],
    [1024 ** 3 * 20, '20 GB'],
    [1024 ** 4 * 3, '3.0 TB'],
    [1024 ** 5 * 2, '2048 TB'],
  ])('%d bytes → %s', (bytes, text) => {
    expect(fileDropSize(bytes)).toBe(text)
  })
})
