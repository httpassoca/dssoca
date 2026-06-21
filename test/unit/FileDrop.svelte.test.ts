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
    expect(z.getAttribute('aria-label')).toContain('Upload report')
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
