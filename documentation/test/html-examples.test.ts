import { describe, it, expect } from 'vitest'
import { COMPONENTS } from '../src/lib/docs.config'
import { renderHtmlExample, cleanSvelteHtml } from '../src/lib/server/html-example'
import { formatHtml } from '../src/lib/html-format'
import { ROOT_CLASSES } from '../../scripts/lib/vanilla-css.mjs'

// Every component page carries a plain-HTML snippet produced by server-rendering the real
// component (DS-0148). These guards run the exact renderer the prerender uses.
describe('html examples', () => {
  it('every component declares an htmlExample with a behaviour', () => {
    for (const c of COMPONENTS) {
      expect(c.htmlExample, c.name).toBeDefined()
      expect(['js', 'css'], c.name).toContain(c.htmlExample.behaviour)
    }
  })

  it.each(COMPONENTS.map((c) => [c.name, c] as const))(
    '%s renders a clean snippet containing its root class',
    (_name, doc) => {
      const html = renderHtmlExample(doc)
      const roots = ROOT_CLASSES[doc.name as keyof typeof ROOT_CLASSES]
      expect(roots, `${doc.name} in ROOT_CLASSES`).toBeDefined()
      expect(html).toContain(`class="${roots[0]}`)
      expect(html).not.toMatch(/svelte-[a-z0-9]{4,}/)
      expect(html).not.toMatch(/<!--[[\]!]?-->/)
      expect(html).not.toContain('this.__e=event')
      expect(html.trim().length).toBeGreaterThan(20)
    },
  )

  it('is deterministic', () => {
    const button = COMPONENTS.find((c) => c.slug === 'button')!
    expect(renderHtmlExample(button)).toBe(renderHtmlExample(button))
  })

  it('applies the vanilla-only fixups', () => {
    const by = (slug: string) => renderHtmlExample(COMPONENTS.find((c) => c.slug === slug)!)
    expect(by('modal')).toContain('data-ss-modal="#confirm"')
    expect(by('modal')).toContain('class="close" data-ss-dismiss')
    expect(by('spinner')).toContain('data-variant="pipe"')
    expect(by('spinner')).toMatch(/<span class="frame" aria-hidden="true"><\/span>/)
    expect(by('segmented-control')).toContain('data-value="week"')
    expect(by('icon')).toContain('data-ss-icon="check"')
  })

  it('cleanSvelteHtml strips hydration markers and hashes', () => {
    expect(
      cleanSvelteHtml(
        '<!--[--><b class="x svelte-abc1">t</b><!--]--><i class="svelte-abc1"></i><img onload="this.__e=event"/>',
      ),
    ).toBe('<b class="x">t</b><i></i><img/>')
  })

  it('formatHtml indents nested elements and keeps text-only elements inline', () => {
    expect(formatHtml('<div class="a"><span>hi</span><input type="text"><p></p></div>')).toBe(
      '<div class="a">\n  <span>hi</span>\n  <input type="text">\n  <p></p>\n</div>',
    )
  })
})
