/**
 * notes by Mara Quill — page-local behaviour.
 * Theme toggle (flips the colour axis via the shared axes module), the subscribe form
 * (fake submit → toast) and a static Pagination made clickable for the demo.
 */
import { setAxes, getAxes } from '../assets/axes.js'
import { toast } from '../vendor/vanilla/index.js'

// ── theme toggle ────────────────────────────────────────────────────────────
const toggle = document.getElementById('theme-toggle')
const otherTheme = () => (getAxes().theme === 'dark' ? 'light' : 'dark')
const syncToggle = () => toggle?.setAttribute('aria-label', `Switch to ${otherTheme()} theme`)
toggle?.addEventListener('click', () => {
  setAxes({ theme: otherTheme() })
  syncToggle()
})
syncToggle()

// ── subscribe form ──────────────────────────────────────────────────────────
const form = document.getElementById('subscribe-form')
const email = document.getElementById('subscribe-email')
form?.addEventListener('submit', (e) => {
  e.preventDefault()
  const value = email?.value.trim() ?? ''
  if (!value || !email?.checkValidity()) {
    toast.error('that does not look like an email address')
    email?.focus()
    return
  }
  toast.success(`subscribed — check ${value} for a confirmation`)
  form.reset()
  email?.dispatchEvent(new Event('input', { bubbles: true }))
})

// ── pagination (static markup; wire the buttons for the demo) ───────────────
const pager = document.querySelector('.blog-pagination')
if (pager) {
  const pages = [...pager.querySelectorAll('.page:not(.nav-btn)')]
  const prev = pager.querySelector('[aria-label="Previous page"]')
  const next = pager.querySelector('[aria-label="Next page"]')
  const nums = pages.map((btn) => Number(btn.textContent))
  const last = nums.at(-1) ?? 1
  let current = 1

  const render = () => {
    for (const btn of pages) {
      const n = Number(btn.textContent)
      btn.classList.toggle('active', n === current)
      if (n === current) btn.setAttribute('aria-current', 'page')
      else btn.removeAttribute('aria-current')
    }
    if (prev) prev.disabled = current === 1
    if (next) next.disabled = current === last
  }
  const go = (n) => {
    if (n < 1 || n > last || n === current) return
    current = n
    render()
    toast.info(`page ${current} of ${last} (demo)`)
  }

  for (const btn of pages) btn.addEventListener('click', () => go(Number(btn.textContent)))
  // Step to the neighbouring *listed* page (the window skips hidden runs).
  prev?.addEventListener('click', () => go(nums[nums.indexOf(current) - 1] ?? 1))
  next?.addEventListener('click', () => go(nums[nums.indexOf(current) + 1] ?? last))
}
