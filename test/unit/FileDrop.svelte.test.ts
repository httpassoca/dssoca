import { describe, it, expect, vi, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, fireEvent } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import FileDrop from '$lib/components/FileDrop.svelte'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

const jsonFile = () => new File(['{}'], 'data.json', { type: 'application/json' })

afterEach(() => {
  vi.restoreAllMocks()
})

const zone = (c: HTMLElement) => c.querySelector<HTMLElement>('.ss-filedrop .zone')!
const input = (c: HTMLElement) =>
  c.querySelector<HTMLInputElement>('.ss-filedrop input[type="file"]')!

describe('FileDrop — rendering', () => {
  it('renders the label and the drop instructions', () => {
    const { container, getByText } = render(FileDrop, { label: 'Attachments' })
    expect(container.querySelector('.ss-filedrop .lbl')).toHaveTextContent('Attachments')
    expect(getByText('Drop files here')).toBeInTheDocument()
    expect(getByText('or click to browse')).toBeInTheDocument()
  })

  it('renders a hidden file input wired with accept and multiple', () => {
    const { container } = render(FileDrop, { accept: 'application/json', multiple: true })
    const el = input(container)
    expect(el).toHaveAttribute('type', 'file')
    expect(el).toHaveAttribute('accept', 'application/json')
    expect(el).toHaveAttribute('multiple')
  })

  it('exposes the zone as a focusable button with an accessible name', () => {
    const { container } = render(FileDrop, { label: 'Upload report' })
    const z = zone(container)
    expect(z).toHaveAttribute('role', 'button')
    expect(z).toHaveAttribute('tabindex', '0')
    expect(z).toHaveAccessibleName('Upload report Drop files here')
  })
})

describe('FileDrop — accessible name (Front-End Checklist, DS-0173)', () => {
  it('names the zone from its visible text via aria-labelledby (no aria-label)', () => {
    const { container } = render(FileDrop, { label: 'Attachments' })
    const z = zone(container)
    expect(z).not.toHaveAttribute('aria-label')
    const ids = z.getAttribute('aria-labelledby')!.split(' ')
    expect(ids).toHaveLength(2)
    expect(container.querySelector(`#${CSS.escape(ids[0])}`)).toHaveTextContent('Attachments')
    expect(container.querySelector(`#${CSS.escape(ids[1])}`)).toHaveTextContent('Drop files here')
    expect(z).toHaveAccessibleName('Attachments Drop files here')
  })

  it('falls back to the visible title when there is no label', () => {
    const { container } = render(FileDrop)
    expect(zone(container)).toHaveAccessibleName('Drop files here')
  })

  it('keeps the hint out of the name (description only)', () => {
    const { container } = render(FileDrop, { label: 'Avatar', hint: 'PNG only' })
    const z = zone(container)
    expect(z).toHaveAccessibleName('Avatar Drop files here')
    expect(z).toHaveAccessibleDescription('PNG only')
  })
})

describe('FileDrop — rejected files are reported (DS-0173)', () => {
  it('calls onreject with files the accept filter discards and announces them', async () => {
    const onreject = vi.fn()
    const { container } = render(FileDrop, { onreject, accept: 'application/json', multiple: true })
    const live = container.querySelector('.ss-filedrop [aria-live="polite"]')!
    expect(live).toBeInTheDocument()
    expect(live).toHaveTextContent('')
    const txt = new File(['x'], 'x.txt', { type: 'text/plain' })
    await fireEvent.drop(zone(container), { dataTransfer: { files: [jsonFile(), txt] } })
    expect(onreject).toHaveBeenCalledWith([txt])
    await vi.waitFor(() => expect(live).toHaveTextContent('x.txt (file type not accepted)'))
  })

  it('reports extras dropped when not multiple', async () => {
    const onreject = vi.fn()
    const { container } = render(FileDrop, { onreject })
    const a = new File(['a'], 'a.txt', { type: 'text/plain' })
    const b = new File(['b'], 'b.txt', { type: 'text/plain' })
    await fireEvent.drop(zone(container), { dataTransfer: { files: [a, b] } })
    expect(onreject).toHaveBeenCalledWith([b])
    const live = container.querySelector('.ss-filedrop [aria-live="polite"]')!
    await vi.waitFor(() => expect(live).toHaveTextContent('b.txt (only one file allowed)'))
  })

  it('does not call onreject when nothing is discarded', async () => {
    const onreject = vi.fn()
    const { container } = render(FileDrop, { onreject })
    await fireEvent.drop(zone(container), { dataTransfer: { files: [jsonFile()] } })
    expect(onreject).not.toHaveBeenCalled()
  })
})

describe('FileDrop — focus after remove / clear (DS-0173)', () => {
  const three = () => ['a', 'b', 'c'].map((n) => new File([n], `${n}.txt`, { type: 'text/plain' }))
  const removes = (c: HTMLElement) =>
    Array.from(c.querySelectorAll<HTMLButtonElement>('.ss-filedrop .remove'))

  it('moves focus to the next remove button', async () => {
    const { container } = render(FileDrop, { multiple: true, files: three() })
    const btn = removes(container)[1]
    btn.focus()
    await fireEvent.click(btn)
    await vi.waitFor(() => expect(document.activeElement).toBe(removes(container)[1]))
    expect(document.activeElement).toHaveAccessibleName('Remove c.txt')
  })

  it('moves focus to the previous remove button when the last one is removed', async () => {
    const { container } = render(FileDrop, { multiple: true, files: three() })
    const btn = removes(container)[2]
    btn.focus()
    await fireEvent.click(btn)
    await vi.waitFor(() => expect(document.activeElement).toHaveAccessibleName('Remove b.txt'))
  })

  it('moves focus to the zone when the list becomes empty', async () => {
    const { container } = render(FileDrop, { files: [jsonFile()] })
    const btn = removes(container)[0]
    btn.focus()
    await fireEvent.click(btn)
    await vi.waitFor(() => expect(document.activeElement).toBe(zone(container)))
  })

  it('moves focus to the zone after Clear', async () => {
    const { container, getByText } = render(FileDrop, { multiple: true, files: three() })
    const btn = getByText('Clear')
    btn.focus()
    await fireEvent.click(btn)
    await vi.waitFor(() => expect(document.activeElement).toBe(zone(container)))
  })
})

describe('FileDrop — touch targets (DS-0173)', () => {
  const src = readFileSync(resolve(process.cwd(), 'src/lib/components/FileDrop.svelte'), 'utf8')
  it('.remove and .clear have a 24×24 minimum hit area', () => {
    expect(src).toMatch(/\.remove,\s*\.clear\s*\{[^}]*min-inline-size:\s*24px/)
    expect(src).toMatch(/\.remove,\s*\.clear\s*\{[^}]*min-block-size:\s*24px/)
  })
})

describe('FileDrop — activation', () => {
  it('triggers the picker on Enter', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {})
    const { container } = render(FileDrop)
    await fireEvent.keyDown(zone(container), { key: 'Enter' })
    expect(click).toHaveBeenCalledTimes(1)
  })

  it('triggers the picker on Space', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {})
    const { container } = render(FileDrop)
    await fireEvent.keyDown(zone(container), { key: ' ' })
    expect(click).toHaveBeenCalledTimes(1)
  })

  it('triggers the picker on click', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {})
    const { container } = render(FileDrop)
    await fireEvent.click(zone(container))
    expect(click).toHaveBeenCalledTimes(1)
  })
})

describe('FileDrop — selection', () => {
  it('change sets files, calls onfiles, and shows the name', async () => {
    const onfiles = vi.fn()
    const { container, getByText } = render(FileDrop, { onfiles })
    const file = jsonFile()
    const el = input(container)
    Object.defineProperty(el, 'files', { value: [file], configurable: true })
    await fireEvent.change(el)
    expect(onfiles).toHaveBeenCalledTimes(1)
    expect(onfiles.mock.calls[0][0]).toEqual([file])
    expect(getByText('data.json')).toBeInTheDocument()
  })

  it('drop sets the files', async () => {
    const onfiles = vi.fn()
    const { container, getByText } = render(FileDrop, { onfiles })
    const file = jsonFile()
    await fireEvent.drop(zone(container), { dataTransfer: { files: [file] } })
    expect(onfiles).toHaveBeenCalledWith([file])
    expect(getByText('data.json')).toBeInTheDocument()
  })

  it('drops only the first file when not multiple', async () => {
    const onfiles = vi.fn()
    const { container } = render(FileDrop, { onfiles, multiple: false })
    const a = new File(['a'], 'a.txt', { type: 'text/plain' })
    const b = new File(['b'], 'b.txt', { type: 'text/plain' })
    await fireEvent.drop(zone(container), { dataTransfer: { files: [a, b] } })
    expect(onfiles).toHaveBeenCalledWith([a])
  })

  it('filters dropped files by the accept filter', async () => {
    const onfiles = vi.fn()
    const { container } = render(FileDrop, { onfiles, accept: 'application/json', multiple: true })
    const json = jsonFile()
    const txt = new File(['x'], 'x.txt', { type: 'text/plain' })
    await fireEvent.drop(zone(container), { dataTransfer: { files: [json, txt] } })
    expect(onfiles).toHaveBeenCalledWith([json])
  })
})

describe('FileDrop — drag state', () => {
  it('adds .dragging on dragover and removes it on dragleave', async () => {
    const { container } = render(FileDrop)
    const z = zone(container)
    await fireEvent.dragOver(z)
    expect(z).toHaveClass('dragging')
    await fireEvent.dragLeave(z)
    expect(z).not.toHaveClass('dragging')
  })
})

describe('FileDrop — clear / remove', () => {
  it('clear empties the files', async () => {
    const onfiles = vi.fn()
    const { container, getByText, queryByText } = render(FileDrop, { onfiles })
    await fireEvent.drop(zone(container), { dataTransfer: { files: [jsonFile()] } })
    expect(getByText('data.json')).toBeInTheDocument()
    await fireEvent.click(getByText('Clear'))
    expect(queryByText('data.json')).toBeNull()
    expect(onfiles).toHaveBeenLastCalledWith([])
  })
})

describe('FileDrop — disabled', () => {
  it('blocks keyboard and pointer activation', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {})
    const { container } = render(FileDrop, { disabled: true })
    const z = zone(container)
    expect(z).toHaveAttribute('tabindex', '-1')
    expect(z).toHaveAttribute('aria-disabled', 'true')
    await fireEvent.click(z)
    await fireEvent.keyDown(z, { key: 'Enter' })
    expect(click).not.toHaveBeenCalled()
  })

  it('does not accept drops when disabled', async () => {
    const onfiles = vi.fn()
    const { container } = render(FileDrop, { disabled: true, onfiles })
    await fireEvent.drop(zone(container), { dataTransfer: { files: [jsonFile()] } })
    expect(onfiles).not.toHaveBeenCalled()
  })
})

describe('FileDrop — error', () => {
  it('renders the error message as an alert', () => {
    const { container } = render(FileDrop, { error: 'File too large' })
    const msg = container.querySelector('.ss-filedrop .msg.error')!
    expect(msg).toHaveAttribute('role', 'alert')
    expect(msg).toHaveTextContent('File too large')
  })
})

// jsdom does not apply Svelte's scoped <style> cascade, so the gap technique
// can't be read off the DOM — these are pure CSS/token contracts asserted at
// the source (mirrors the Button hover test). DS-0124.
describe('FileDrop — files-list gap token (DS-0124)', () => {
  const tokens = readFileSync(resolve(process.cwd(), 'src/styles/_tokens.scss'), 'utf8')
  const filedrop = readFileSync(
    resolve(process.cwd(), 'src/lib/components/FileDrop.svelte'),
    'utf8',
  )

  it('defines --ss-gap-xs in all three size tiers', () => {
    expect(tokens).toMatch(/--ss-gap-xs:\s*6px/) // md (default block)
    expect(tokens).toMatch(/--ss-gap-xs:\s*4px/) // sm
    expect(tokens).toMatch(/--ss-gap-xs:\s*8px/) // lg
    expect((tokens.match(/--ss-gap-xs:/g) ?? []).length).toBe(3)
  })

  it('ul.files uses gap: var(--ss-gap-xs)', () => {
    expect(filedrop).toMatch(/\.files\s*\{[^}]*gap:\s*var\(--ss-gap-xs\)/)
  })

  it('keeps the per-file inner row (.file) on --ss-gap-sm', () => {
    expect(filedrop).toMatch(/\.file\s*\{[^}]*gap:\s*var\(--ss-gap-sm/)
  })
})

describe('FileDrop — a11y', () => {
  it('has no axe violations (default)', async () => {
    const { container } = render(FileDrop, { label: 'Upload' })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('has no axe violations (with files + error)', async () => {
    const { container } = render(FileDrop, { label: 'Upload', error: 'Bad file' })
    await fireEvent.drop(zone(container), { dataTransfer: { files: [jsonFile()] } })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})
