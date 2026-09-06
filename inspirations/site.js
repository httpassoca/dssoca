/* Inspirations gallery: axis toggles + thumbnail fallbacks. */
import { getAxes, setAxes } from './assets/axes.js'
import { selectSegment } from './vendor/vanilla/index.js'

// Reflect the axes painted on <html> (query / saved) in the two segmented controls.
const axes = getAxes()
for (const group of document.querySelectorAll('.ss-segmented[data-axis]')) {
  const value = axes[group.dataset.axis]
  const segment = group.querySelector(`.segment[data-value="${value}"]`)
  if (segment) selectSegment(segment)
}

document.addEventListener('ss:change', (e) => {
  const group = e.target.closest?.('.ss-segmented[data-axis]')
  if (!group) return
  setAxes({ [group.dataset.axis]: e.detail?.value })
})

// A missing screenshot (local build without Chromium) shows the striped placeholder instead.
for (const img of document.querySelectorAll('.insp-thumb img')) {
  const missing = () => img.closest('.insp-thumb')?.classList.add('missing')
  if (img.complete && img.naturalWidth === 0) missing()
  else img.addEventListener('error', missing, { once: true })
}
