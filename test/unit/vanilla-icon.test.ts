import { describe, it, expect } from 'vitest'
import { registerIcon } from '$lib/icons'
import { iconSvg, hydrateIcons } from '$lib/vanilla/index'

// DS-0176: the vanilla renderer shares the registry's light sanitiser.
describe('vanilla icons: registered markup sanitiser', () => {
  it('iconSvg drops script vectors from registered markup but keeps the glyph', () => {
    registerIcon('v-evil', '<path d="M1 1" onload="x()"/><script>x()</script>')
    const out = iconSvg('v-evil')
    expect(out).not.toMatch(/<script|onload/i)
    expect(out).toMatch(/<path d="M1 1" ?\/>/)
  })

  it('hydrateIcons renders a sanitised registered glyph', () => {
    registerIcon('v-evil2', '<circle cx="1" cy="1" r="1" onclick="x()"/><foreignObject/>')
    document.body.innerHTML = '<span data-ss-icon="v-evil2"></span>'
    hydrateIcons(document)
    const svg = document.querySelector('svg.ss-icon')!
    expect(svg.querySelector('foreignObject')).toBeNull()
    expect(svg.querySelector('circle')!.hasAttribute('onclick')).toBe(false)
  })
})
