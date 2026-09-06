/**
 * Lettera — page-local interactivity. Everything component-level (modal, menu, segmented
 * control, textarea autosize, toasts, icons) comes from dssoca/vanilla.js; this file only
 * wires the fake mail model: selection, stars, filters, shortcuts and the search palette.
 */
import { setAxes, getAxes } from '../assets/axes.js'
import { toast } from '../vendor/vanilla/index.js'

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel))

const rows = () => $$('#rows > .mail-row')
const visibleRows = () => rows().filter((r) => !r.hidden)
const selectedRow = () => $('#rows > .mail-row.is-selected')

// ── theme toggle ────────────────────────────────────────────────────────────
const themeBtn = $('#theme-toggle')
function syncThemeLabel() {
  const next = getAxes().theme === 'dark' ? 'light' : 'dark'
  themeBtn.setAttribute('aria-label', `Switch to ${next} theme`)
}
themeBtn.addEventListener('click', () => {
  setAxes({ theme: getAxes().theme === 'dark' ? 'light' : 'dark' })
  syncThemeLabel()
})
syncThemeLabel()

// ── unread bookkeeping ──────────────────────────────────────────────────────
function syncUnread() {
  const n = rows().filter((r) => r.classList.contains('is-unread')).length
  for (const el of $$('#inbox-badge, #unread-stat, #unread-foot')) el.textContent = String(n)
}

function markRead(row) {
  row.classList.remove('is-unread')
  row.dataset.unread = 'false'
}

// ── selection (click, j/k) ──────────────────────────────────────────────────
function select(row, { focus = false } = {}) {
  if (!row) return
  for (const r of rows()) {
    const on = r === row
    r.classList.toggle('is-selected', on)
    const link = $('.mail-row-main', r)
    if (on) link.setAttribute('aria-current', 'true')
    else link.removeAttribute('aria-current')
  }
  markRead(row)
  syncUnread()
  if (focus) $('.mail-row-main', row).focus({ preventScroll: true })
  row.scrollIntoView({ block: 'nearest' })
}

function move(delta) {
  const list = visibleRows()
  if (!list.length) return
  const i = list.indexOf(selectedRow())
  const next = list[Math.min(list.length - 1, Math.max(0, i + delta))]
  select(next, { focus: true })
}

$('#rows').addEventListener('click', (e) => {
  const link = e.target.closest('.mail-row-main')
  if (!link) return
  e.preventDefault()
  select(link.closest('.mail-row'))
})

// ── stars ───────────────────────────────────────────────────────────────────
function toggleStar(row) {
  const btn = $('.mail-star', row)
  const on = btn.getAttribute('aria-pressed') !== 'true'
  btn.setAttribute('aria-pressed', String(on))
  btn.textContent = on ? '★' : '☆'
  row.dataset.starred = String(on)
  applyFilter()
}

$('#rows').addEventListener('click', (e) => {
  const btn = e.target.closest('.mail-star')
  if (btn) toggleStar(btn.closest('.mail-row'))
})

// ── select-all + toolbar actions ────────────────────────────────────────────
const selectAll = $('#select-all')
selectAll.addEventListener('change', () => {
  for (const r of visibleRows()) $('.mail-check', r).checked = selectAll.checked
})

function checkedRows() {
  const checked = visibleRows().filter((r) => $('.mail-check', r).checked)
  return checked.length ? checked : [selectedRow()].filter(Boolean)
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}

function archive() {
  const list = checkedRows()
  if (!list.length) return
  const wasSelected = list.includes(selectedRow())
  for (const r of list) r.remove()
  selectAll.checked = false
  syncUnread()
  syncCount()
  if (wasSelected) select(visibleRows()[0])
  toast.success(`archived ${plural(list.length, 'message')}`)
}

$('#act-archive').addEventListener('click', archive)

$('#act-delete').addEventListener('click', () => {
  const list = checkedRows()
  if (!list.length) return
  const wasSelected = list.includes(selectedRow())
  for (const r of list) r.remove()
  selectAll.checked = false
  syncUnread()
  syncCount()
  if (wasSelected) select(visibleRows()[0])
  toast.info(`moved ${plural(list.length, 'message')} to trash`)
})

$('#act-read').addEventListener('click', () => {
  const list = checkedRows()
  for (const r of list) markRead(r)
  syncUnread()
  applyFilter()
  toast.info(`marked ${plural(list.length, 'message')} as read`)
})

// ── filter (SegmentedControl emits ss:change) ───────────────────────────────
let filter = 'all'

function syncCount() {
  const n = visibleRows().length
  $('#list-count').textContent =
    filter === 'all' ? plural(n, 'message') : `${plural(n, 'message')} · ${filter}`
}

function applyFilter() {
  for (const r of rows()) {
    const show =
      filter === 'all' ||
      (filter === 'unread' && r.dataset.unread === 'true') ||
      (filter === 'starred' && r.dataset.starred === 'true')
    r.hidden = !show
  }
  syncCount()
}

$('#filter').addEventListener('ss:change', (e) => {
  filter = e.detail.value
  applyFilter()
})

// ── reading pane: reply + more menu ─────────────────────────────────────────
const replyBody = $('#reply-body')

function sendReply() {
  if (!replyBody.value.trim()) {
    toast.error('write something first')
    replyBody.focus()
    return
  }
  replyBody.value = ''
  replyBody.dispatchEvent(new Event('input', { bubbles: true }))
  toast.success('sent')
}

$('#reply-send').addEventListener('click', sendReply)
$('#reply-discard').addEventListener('click', () => {
  replyBody.value = ''
  replyBody.dispatchEvent(new Event('input', { bubbles: true }))
  toast.info('draft discarded')
})
$('#reply-attach').addEventListener('click', () => toast.info('attachments are a demo here'))
$('#act-reply').addEventListener('click', () => replyBody.focus())

replyBody.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    sendReply()
  }
})

$('#more-menu').addEventListener('ss:select', (e) => {
  const labels = {
    'reply-all': 'replying to everyone',
    forward: 'forwarding…',
    print: 'sent to printer',
    block: 'theo@northbank.coop blocked',
  }
  toast.info(labels[e.detail.value] ?? e.detail.value)
})

for (const btn of $$('.mail-attach-list [data-file]')) {
  btn.addEventListener('click', () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 900)), {
      loading: `downloading ${btn.dataset.file}…`,
      success: `${btn.dataset.file} saved`,
      error: 'download failed',
    })
  })
}

// ── compose modal (opened by vanilla.js via data-ss-modal) ──────────────────
const compose = $('#compose')
$('#compose-send').addEventListener('click', () => {
  const to = $('#compose-to').value.trim()
  if (!to) {
    toast.error('add a recipient')
    $('#compose-to').focus()
    return
  }
  $('#compose-form').reset()
  compose.close()
  toast.success('sent')
})

// ── search palette (static markup; open/close + pick) ───────────────────────
const search = $('#search')
const searchInput = $('.input', search)

function openSearch() {
  if (search.open) return
  search.showModal()
  searchInput.value = ''
  searchInput.focus()
}

$('#search-open').addEventListener('click', openSearch)
$('#search-open-mobile').addEventListener('click', openSearch)

search.addEventListener('pointerdown', (e) => {
  if (e.target === search) search.close()
})

search.addEventListener('click', (e) => {
  const row = e.target.closest('.row[role="option"]')
  if (!row) return
  search.close()
  if (row.dataset.action === 'compose') compose.showModal()
  else if (row.dataset.action === 'starred') {
    const seg = $('#filter .segment[data-value="starred"]')
    seg.click()
  } else toast.info(`opened “${$('.label', row).textContent}”`)
})

// ── global shortcuts ────────────────────────────────────────────────────────
const typing = (el) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))

document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  if (document.querySelector('dialog[open]')) return
  if (typing(e.target)) return
  switch (e.key) {
    case '/':
      e.preventDefault()
      openSearch()
      break
    case 'j':
      move(1)
      break
    case 'k':
      move(-1)
      break
    case 'e':
      archive()
      break
    case 'r':
      replyBody.focus()
      break
    case 's': {
      const row = selectedRow()
      if (row) toggleStar(row)
      break
    }
    case 'c':
      compose.showModal()
      break
  }
})

syncUnread()
syncCount()
