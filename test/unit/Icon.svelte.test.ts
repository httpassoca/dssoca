import { describe, it, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/svelte'
import Icon, { PATHS, registerIcon, type IconName } from '$lib/components/Icon.svelte'

describe('Icon', () => {
  it('renders an svg with a 0 0 24 24 viewBox and currentColor stroke', () => {
    const { container } = render(Icon, { name: 'grid' })
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
    expect(svg).toHaveAttribute('fill', 'none')
  })

  it('defaults to the --ss-icon token for width/height (inherits the active size)', () => {
    const { container } = render(Icon, { name: 'grid' })
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('style')).toContain('width: var(--ss-icon)')
    expect(svg.getAttribute('style')).toContain('height: var(--ss-icon)')
    // no explicit size → inherits the global size, so no own data-size-variant
    expect(svg).not.toHaveAttribute('data-size-variant')
  })

  it('applies an explicit px size to width/height', () => {
    const { container } = render(Icon, { name: 'grid', px: 32 })
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('style')).toContain('width: 32px')
    expect(svg.getAttribute('style')).toContain('height: 32px')
  })

  it('stamps data-size-variant when a token size is given', () => {
    const { container } = render(Icon, { name: 'grid', size: 'lg' })
    expect(container.querySelector('svg')).toHaveAttribute('data-size-variant', 'lg')
  })

  it('passes through a class to the svg', () => {
    const { container } = render(Icon, { name: 'grid', class: 'my-ico' })
    expect(container.querySelector('svg')).toHaveClass('my-ico')
  })

  // The inner @html path markup is the glyph identity. jsdom re-serialises
  // self-closing tags (`<path/>` -> `<path></path>`), so normalise both sides
  // by parsing PATHS through the same DOM before comparing.
  const normalise = (markup: string) => {
    const tmp = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    tmp.innerHTML = markup
    return tmp.innerHTML
  }

  it.each(['book', 'film', 'note', 'grid', 'user', 'check', 'chevron'] as const)(
    'renders the %s glyph path inside the svg',
    (name) => {
      const { container } = render(Icon, { name })
      const svg = container.querySelector('svg')!
      expect(svg.innerHTML).toBe(normalise(PATHS[name]))
    },
  )

  it('chevron glyph exists, is distinct from arrow, and is vertically centred (DS-0110)', () => {
    expect(PATHS.chevron).toBeTruthy()
    expect(PATHS.chevron).not.toBe(PATHS.arrow)
    const { container } = render(Icon, { name: 'chevron' })
    expect(container.querySelector('svg')!.innerHTML).toBe(normalise(PATHS.chevron))
    // The glyph's bounding box must be vertically centred on the 24-unit viewBox
    // (y-extents symmetric about 12) so a 180deg rotation pivots about its visual
    // middle and the open/closed states don't shift (fixes the Accordion root cause).
    // The chevron is `M{x} {y} l{dx} {dy} {dx} {dy}`: an absolute moveto then a
    // relative polyline; walk the points and assert min/max y centre on 12.
    const m = PATHS.chevron.match(
      /M(-?[\d.]+)\s+(-?[\d.]+)l(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)(-?[\d.]+)/,
    )
    expect(m).not.toBeNull()
    const [, , y0, , dy1, , dy2] = m!.map(Number)
    const ys = [y0, y0 + dy1, y0 + dy1 + dy2]
    expect((Math.min(...ys) + Math.max(...ys)) / 2).toBe(12)
  })

  // ----------------------------------------------------------------
  //  DS-0087 — extended built-in glyph set (nav/social)
  // ----------------------------------------------------------------

  const NEW_GLYPHS = [
    'home',
    'briefcase',
    'folder',
    'github',
    'linkedin',
    'language',
    'color-swatch',
  ] as const

  // Compile-time: each new name is part of the IconName union.
  const _newNamesAreIconNames: IconName[] = [...NEW_GLYPHS]
  void _newNamesAreIconNames

  it.each(NEW_GLYPHS)('renders the %s glyph path inside the svg', (name) => {
    const { container } = render(Icon, { name })
    const svg = container.querySelector('svg')!
    expect(svg.innerHTML).toBe(normalise(PATHS[name]))
  })

  it('new glyphs are registered built-ins (resolvable, non-empty, distinct)', () => {
    const markups = NEW_GLYPHS.map((n) => PATHS[n])
    markups.forEach((m) => {
      expect(m).toBeTruthy()
      expect(m).toContain('<') // raw SVG inner markup
    })
    expect(new Set(markups).size).toBe(NEW_GLYPHS.length)
  })

  it('new glyphs do not warn (known names) and stay decorative by default', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    for (const name of NEW_GLYPHS) {
      const { container } = render(Icon, { name })
      expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    }
    expect(warn).not.toHaveBeenCalled()
  })

  it('book glyph differs from film and note glyphs', () => {
    expect(PATHS.book).not.toBe(PATHS.film)
    expect(PATHS.book).not.toBe(PATHS.note)
    expect(PATHS.film).not.toBe(PATHS.note)
  })

  // ----------------------------------------------------------------
  //  DS-0030 — registration, spin/rotate/flip, solid, robust a11y name
  // ----------------------------------------------------------------

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('accessible name (title → <title> + aria-labelledby)', () => {
    it('renders a real <title> and wires it via aria-labelledby (role=img)', () => {
      const { container } = render(Icon, { name: 'user', title: 'User profile' })
      const svg = container.querySelector('svg')!
      expect(svg).toHaveAttribute('role', 'img')
      const titleEl = svg.querySelector('title')!
      expect(titleEl).not.toBeNull()
      expect(titleEl.textContent).toBe('User profile')
      const labelledBy = svg.getAttribute('aria-labelledby')
      expect(labelledBy).toBe(titleEl.id)
      expect(labelledBy).toBeTruthy()
      // titled icon is exposed, not hidden
      expect(svg).not.toHaveAttribute('aria-hidden')
    })

    it('appends <desc> to aria-labelledby when provided', () => {
      const { container } = render(Icon, {
        name: 'user',
        title: 'Profile',
        desc: 'Opens the account page',
      })
      const svg = container.querySelector('svg')!
      const titleEl = svg.querySelector('title')!
      const descEl = svg.querySelector('desc')!
      expect(descEl).not.toBeNull()
      expect(descEl.textContent).toBe('Opens the account page')
      expect(svg.getAttribute('aria-labelledby')).toBe(`${titleEl.id} ${descEl.id}`)
    })

    it('is decorative (aria-hidden, no role) without a title', () => {
      const { container } = render(Icon, { name: 'grid' })
      const svg = container.querySelector('svg')!
      expect(svg).toHaveAttribute('aria-hidden', 'true')
      expect(svg).not.toHaveAttribute('role')
      expect(svg).not.toHaveAttribute('aria-labelledby')
    })

    it('explicit decorative=true hides even when a title is given', () => {
      const { container } = render(Icon, { name: 'grid', title: 'x', decorative: true })
      const svg = container.querySelector('svg')!
      expect(svg).toHaveAttribute('aria-hidden', 'true')
      expect(svg).not.toHaveAttribute('role')
      expect(svg).not.toHaveAttribute('aria-labelledby')
    })
  })

  describe('spin / rotate / flip', () => {
    it('adds the spin class when spin is set', () => {
      const { container } = render(Icon, { name: 'spinner', spin: true })
      expect(container.querySelector('svg')).toHaveClass('spin')
    })

    it('does not add spin class by default', () => {
      const { container } = render(Icon, { name: 'grid' })
      expect(container.querySelector('svg')).not.toHaveClass('spin')
    })

    it.each([90, 180, 270] as const)('stamps data-rotate=%i', (deg) => {
      const { container } = render(Icon, { name: 'arrow', rotate: deg })
      expect(container.querySelector('svg')).toHaveAttribute('data-rotate', String(deg))
    })

    it('omits data-rotate for 0 (the default)', () => {
      const { container } = render(Icon, { name: 'arrow', rotate: 0 })
      expect(container.querySelector('svg')).not.toHaveAttribute('data-rotate')
    })

    it('adds flip-h / flip-v classes', () => {
      const h = render(Icon, { name: 'arrow', flip: 'horizontal' })
      expect(h.container.querySelector('svg')).toHaveClass('flip-h')
      const v = render(Icon, { name: 'arrow', flip: 'vertical' })
      expect(v.container.querySelector('svg')).toHaveClass('flip-v')
    })
  })

  describe('variant (outline | solid)', () => {
    it('outline (default) strokes with currentColor, no fill', () => {
      const { container } = render(Icon, { name: 'check' })
      const svg = container.querySelector('svg')!
      expect(svg).toHaveAttribute('stroke', 'currentColor')
      expect(svg).toHaveAttribute('fill', 'none')
    })

    it('solid fills with currentColor and drops the stroke', () => {
      const { container } = render(Icon, { name: 'check', variant: 'solid' })
      const svg = container.querySelector('svg')!
      expect(svg).toHaveAttribute('fill', 'currentColor')
      expect(svg).toHaveAttribute('stroke', 'none')
    })
  })

  describe('stroke width', () => {
    it('defaults stroke-width to 2', () => {
      const { container } = render(Icon, { name: 'grid' })
      expect(container.querySelector('svg')).toHaveAttribute('stroke-width', '2')
    })

    it('passes an explicit strokeWidth through', () => {
      const { container } = render(Icon, { name: 'grid', strokeWidth: 1.5 })
      expect(container.querySelector('svg')).toHaveAttribute('stroke-width', '1.5')
    })

    it('absoluteStroke recomputes weight from resolved px (px=48 → 2*24/48=1)', () => {
      const { container } = render(Icon, {
        name: 'grid',
        px: 48,
        strokeWidth: 2,
        absoluteStroke: true,
      })
      expect(container.querySelector('svg')).toHaveAttribute('stroke-width', '1')
    })

    it('absoluteStroke uses the fixed-scale px for a size variant (lg=24 → 2*24/24=2)', () => {
      const { container } = render(Icon, {
        name: 'grid',
        size: 'lg',
        strokeWidth: 2,
        absoluteStroke: true,
      })
      expect(container.querySelector('svg')).toHaveAttribute('stroke-width', '2')
    })
  })

  // ----------------------------------------------------------------
  //  DS-0109 — fixed named size scale (xs 12 / sm 16 / md 20 / lg 24)
  // ----------------------------------------------------------------

  describe('named size scale (DS-0109)', () => {
    it.each([
      ['xs', '12px'],
      ['sm', '16px'],
      ['md', '20px'],
      ['lg', '24px'],
    ] as const)('size=%s pins width/height to the fixed scale (%s)', (size, px) => {
      const { container } = render(Icon, { name: 'grid', size })
      const svg = container.querySelector('svg')!
      expect(svg.getAttribute('style')).toContain(`width: ${px}`)
      expect(svg.getAttribute('style')).toContain(`height: ${px}`)
    })

    it('xs is Icon-local: pins 12px but stamps no global data-size-variant', () => {
      const { container } = render(Icon, { name: 'grid', size: 'xs' })
      const svg = container.querySelector('svg')!
      expect(svg.getAttribute('style')).toContain('width: 12px')
      expect(svg).not.toHaveAttribute('data-size-variant')
    })

    it.each([
      ['xs', 12, '4'],
      ['sm', 16, '3'],
      ['md', 20, '2.4'],
      ['lg', 24, '2'],
    ] as const)('absoluteStroke at size=%s (px=%i) → 2*24/px', (size, _px, expected) => {
      const { container } = render(Icon, {
        name: 'grid',
        size,
        strokeWidth: 2,
        absoluteStroke: true,
      })
      expect(container.querySelector('svg')).toHaveAttribute('stroke-width', expected)
    })
  })

  describe('custom registration & escape hatch', () => {
    const HEART = '<path d="M12 21 4 13a5 5 0 0 1 7-7l1 1 1-1a5 5 0 0 1 7 7z"/>'

    it('registerIcon adds a runtime glyph resolvable by name', () => {
      registerIcon('heart', HEART)
      expect(PATHS.heart).toBe(HEART)
      const { container } = render(Icon, { name: 'heart' as never })
      expect(container.querySelector('svg')!.innerHTML).toBe(normalise(HEART))
    })

    it('paths prop is a one-off escape hatch (rendered verbatim, no warning)', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const RAW = '<circle cx="12" cy="12" r="6"/>'
      const { container } = render(Icon, { name: 'totally-unknown' as never, paths: RAW })
      expect(container.querySelector('svg')!.innerHTML).toBe(normalise(RAW))
      expect(warn).not.toHaveBeenCalled()
    })
  })

  describe('unknown name', () => {
    it('console.warns and renders empty for an unresolved name', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { container } = render(Icon, { name: 'does-not-exist' as never })
      expect(warn).toHaveBeenCalledTimes(1)
      expect(String(warn.mock.calls[0][0])).toContain('does-not-exist')
      expect(container.querySelector('svg')!.innerHTML).toBe('')
    })
  })
})
