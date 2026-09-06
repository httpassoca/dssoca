/**
 * Ledgerline landing — page-local interactivity on top of vanilla.js.
 *
 * - Pricing: the SegmentedControl emits `ss:change` with the segment's data-value; every
 *   element carrying `data-monthly` + `data-yearly` swaps its text to match.
 * - Theme toggle: flips `data-theme` via the gallery's shared axes helper.
 * - Demo buttons: sign-up / sales CTAs explain themselves with a toast instead of navigating.
 */
import { setAxes, getAxes } from '../assets/axes.js'
import { toast } from '../vendor/vanilla/index.js'

// ---- pricing period ---------------------------------------------------------------------
const billing = document.getElementById('ll-billing')
billing?.addEventListener('ss:change', (e) => {
  const period = e.detail?.value === 'yearly' ? 'yearly' : 'monthly'
  for (const el of document.querySelectorAll('[data-monthly][data-yearly]')) {
    el.textContent = el.dataset[period] ?? ''
  }
})

// ---- theme toggle -----------------------------------------------------------------------
const themeBtn = document.getElementById('ll-theme')
function syncThemeLabel() {
  if (!themeBtn) return
  const next = getAxes().theme === 'dark' ? 'light' : 'dark'
  themeBtn.setAttribute('aria-label', `Switch to ${next} theme`)
}
themeBtn?.addEventListener('click', () => {
  setAxes({ theme: getAxes().theme === 'dark' ? 'light' : 'dark' })
  syncThemeLabel()
})
syncThemeLabel()

// ---- demo CTAs --------------------------------------------------------------------------
for (const btn of document.querySelectorAll('[data-ll-signup]')) {
  btn.addEventListener('click', () => {
    toast.success('This is a design-system demo — no account was created.')
  })
}
for (const btn of document.querySelectorAll('[data-ll-demo]')) {
  btn.addEventListener('click', () => toast.info(btn.dataset.llDemo ?? 'Demo only'))
}
