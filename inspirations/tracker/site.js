/**
 * Reelog — page-local interactivity on top of dssoca's vanilla behaviours.
 * vanilla.js already drives the SegmentedControls (ss:change), the Modal openers/closers, the
 * Input clear button, the NumberField steppers and the toasts; this module wires the list:
 * status filter, search, sort (select + table headers), the grid/table view swap, the rate
 * dialog's save, the pagination state and the theme toggle.
 */
import { setAxes, getAxes } from '../assets/axes.js'
import { toast } from '../vendor/vanilla/index.js'

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]

const TOTAL = 148
const grid = $('#rl-grid')
const tableWrap = $('#rl-table')
const tbody = $('#rl-table tbody')
const emptyWrap = $('#rl-empty')
const count = $('#rl-count')
const sortSelect = $('#rl-sort')
const search = $('#rl-q')

const state = { status: 'all', q: '', sort: 'added', dir: 'desc' }

// ── filter + sort ─────────────────────────────────────────────────────────

const DEFAULT_DIR = { title: 'asc', score: 'desc', added: 'desc', progress: 'desc' }
const collator = new Intl.Collator('en', { sensitivity: 'base' })

function matches(el) {
  const status = state.status === 'all' || el.dataset.status === state.status
  const q = state.q.trim().toLowerCase()
  return status && (!q || el.dataset.title.toLowerCase().includes(q))
}

function compare(a, b) {
  const key = state.sort
  const sign = state.dir === 'asc' ? 1 : -1
  if (key === 'title') return sign * collator.compare(a.dataset.title, b.dataset.title)
  if (key === 'added') return sign * a.dataset.added.localeCompare(b.dataset.added)
  // numeric keys; unrated entries sink to the bottom whatever the direction
  const av = a.dataset[key] === '' ? null : Number(a.dataset[key])
  const bv = b.dataset[key] === '' ? null : Number(b.dataset[key])
  if (av === null && bv === null) return collator.compare(a.dataset.title, b.dataset.title)
  if (av === null) return 1
  if (bv === null) return -1
  return sign * (av - bv)
}

function applyTo(container, selector) {
  const items = $$(selector, container)
  let shown = 0
  for (const el of items) {
    const on = matches(el)
    el.hidden = !on
    if (on) shown++
  }
  for (const el of items.slice().sort(compare)) container.appendChild(el)
  return shown
}

function apply() {
  const shown = applyTo(grid, '.ss-card')
  applyTo(tbody, '.row')
  emptyWrap.hidden = shown > 0
  count.textContent =
    shown === 0
      ? 'no titles match'
      : `showing ${shown} of ${state.status === 'all' && !state.q ? TOTAL : shown} titles`
  syncTableHeaders()
}

function syncTableHeaders() {
  for (const th of $$('#rl-table th[aria-sort]')) {
    const btn = $('.sort', th)
    const active = btn?.dataset.sort === state.sort
    th.setAttribute(
      'aria-sort',
      active ? (state.dir === 'asc' ? 'ascending' : 'descending') : 'none',
    )
    const ind = $('.indicator', th)
    if (ind) ind.textContent = active ? (state.dir === 'asc' ? '↑' : '↓') : '↕'
  }
  if ([...sortSelect.options].some((o) => o.value === state.sort)) sortSelect.value = state.sort
}

// ── toolbar wiring ────────────────────────────────────────────────────────

$('#rl-status').addEventListener('ss:change', (e) => {
  state.status = e.detail.value
  apply()
})

search.addEventListener('input', () => {
  state.q = search.value
  apply()
})

sortSelect.addEventListener('change', () => {
  state.sort = sortSelect.value
  state.dir = DEFAULT_DIR[state.sort]
  apply()
})

for (const btn of $$('#rl-table .sort')) {
  btn.addEventListener('click', () => {
    const key = btn.dataset.sort
    state.dir = state.sort === key ? (state.dir === 'asc' ? 'desc' : 'asc') : DEFAULT_DIR[key]
    state.sort = key
    apply()
  })
}

$('#rl-view').addEventListener('ss:change', (e) => {
  const table = e.detail.value === 'table'
  tableWrap.hidden = !table
  grid.hidden = table
})

// ── rate dialog ───────────────────────────────────────────────────────────

const dialog = $('#rl-rate')
const scoreInput = $('#rl-score')
const statusSelect = $('#rl-rate-status')
const nameEl = $('#rl-rate-name')
let current = null

const SCORE_TONE = (s) =>
  s === '' ? 'neutral' : s >= 8 ? 'positive' : s >= 6 ? 'info' : 'critical'
const STATUS_TONE = {
  watching: 'brand',
  completed: 'positive',
  planned: 'neutral',
  dropped: 'caution',
}

function setBadge(badge, tone, text, dot) {
  badge.className = `ss-badge ${tone} ${badge.classList.contains('rl-score') ? 'rl-score' : 'rl-status'}`
  badge.replaceChildren()
  if (dot) {
    const d = document.createElement('span')
    d.className = 'dot'
    d.setAttribute('aria-hidden', 'true')
    badge.append(d)
  }
  badge.append(...text)
}

document.addEventListener('click', (e) => {
  const opener = e.target.closest('[data-rate]')
  if (!opener) return
  current = opener.closest('.ss-card')
  nameEl.textContent = current.dataset.title
  $('#rl-rate-title').textContent = `Rate ${current.dataset.title}`
  scoreInput.value = current.dataset.score || '7'
  scoreInput.dispatchEvent(new Event('input', { bubbles: true })) // lets vanilla sync the steppers
  statusSelect.value = current.dataset.status
})

$('#rl-rate-save').addEventListener('click', () => {
  if (!current) return
  const score =
    scoreInput.value === '' ? '' : String(Math.min(10, Math.max(1, Number(scoreInput.value))))
  const status = statusSelect.value
  const title = current.dataset.title
  const row = $$('.row', tbody).find((r) => r.dataset.title === title)

  for (const el of [current, row]) {
    if (!el) continue
    el.dataset.score = score
    el.dataset.status = status
  }
  const sr = document.createElement('span')
  sr.className = 'rl-sr-only'
  sr.textContent = 'score '
  setBadge($('.rl-score', current), SCORE_TONE(score), [sr, score || '—'])
  for (const badge of [$('.rl-status', current), row && $('.rl-status', row)]) {
    if (badge) setBadge(badge, STATUS_TONE[status], [status], status === 'watching')
  }
  if (row) $('.rl-score-cell', row).textContent = score || '—'

  dialog.close()
  toast.success('saved to your list')
  apply()
})

// ── pagination (visual state only — one page of fake data) ───────────────

const pager = $('.rl-pagination')
pager.addEventListener('click', (e) => {
  const btn = e.target.closest('.page')
  if (!btn || btn.disabled) return
  const pages = $$('.page:not(.nav-btn)', pager)
  const active = pages.findIndex((p) => p.classList.contains('active'))
  let next = active
  if (btn.classList.contains('nav-btn')) {
    next = btn.getAttribute('aria-label') === 'Next page' ? active + 1 : active - 1
  } else next = pages.indexOf(btn)
  next = Math.max(0, Math.min(pages.length - 1, next))
  pages.forEach((p, i) => {
    p.classList.toggle('active', i === next)
    if (i === next) p.setAttribute('aria-current', 'page')
    else p.removeAttribute('aria-current')
  })
  $('[aria-label="Previous page"]', pager).disabled = next === 0
  $('[aria-label="Next page"]', pager).disabled = next === pages.length - 1
  toast.info(`page ${pages[next].textContent} of 13`)
  $('.rl-list').scrollIntoView({ block: 'start', behavior: 'smooth' })
})

// ── theme toggle ──────────────────────────────────────────────────────────

const themeBtn = $('#rl-theme')
function paintThemeButton() {
  const dark = getAxes().theme === 'dark'
  themeBtn.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`)
  themeBtn.firstElementChild.textContent = dark ? '☾' : '☀'
}
themeBtn.addEventListener('click', () => {
  setAxes({ theme: getAxes().theme === 'dark' ? 'light' : 'dark' })
  paintThemeButton()
})
paintThemeButton()

apply()
