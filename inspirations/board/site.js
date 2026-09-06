/**
 * Trellis board — page-local behaviour on top of dssoca/vanilla.js.
 *
 * vanilla.js already owns the Modal, Menu, Switch, SegmentedControl, Input clear button and
 * Textarea autosize; this module reacts to the `ss:*` events they emit and fills the issue
 * dialog from the card that opened it. Everything is static, in-memory demo state.
 */
import { toast } from '../vendor/vanilla/index.js'
import { getAxes, setAxes } from '../assets/axes.js'

const PEOPLE = {
  mara: { name: 'Mara Oyelaran', initials: 'MO', color: 'var(--ss-magenta)' },
  dev: { name: 'Dev Castellanos', initials: 'DC', color: 'var(--ss-blue)' },
  priya: { name: 'Priya Raman', initials: 'PR', color: 'var(--ss-cyan)' },
  tomasz: { name: 'Tomasz Nowak', initials: 'TN', color: 'var(--ss-yellow)' },
  lena: { name: 'Lena Fischer', initials: 'LF', color: 'var(--ss-green)' },
  kofi: { name: 'Kofi Mensah', initials: 'KM', color: 'var(--ss-accent)' },
}
const ME = 'priya'
const PRIORITY_TONE = { critical: 'critical', high: 'caution', medium: 'info', low: 'neutral' }

const $ = (id) => document.getElementById(id)
const board = $('board')
const state = { assignee: 'all', query: '', showDone: true }
let nextKey = 152

const fmtDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric' })

function setAvatar(el, personId) {
  const p = PEOPLE[personId] ?? PEOPLE[ME]
  el.setAttribute('aria-label', p.name)
  el.style.setProperty('--ss-avatar-bg', p.color)
  el.querySelector('.initials').textContent = p.initials
}

// ── Filtering (assignee menu + text filter + show-done switch) ─────────────

function applyFilters() {
  const q = state.query.trim().toLowerCase()
  let visible = 0
  for (const col of board.querySelectorAll('.trl-col')) {
    let n = 0
    for (const li of col.querySelectorAll('.trl-issue')) {
      const card = li.querySelector('.ss-card')
      const mine = state.assignee === 'all' || card.dataset.assignee === state.assignee
      const text = `${card.dataset.key} ${card.textContent}`.toLowerCase()
      const show = mine && (!q || text.includes(q))
      li.hidden = !show
      if (show) n++
    }
    const badge = col.querySelector('.trl-col-head .ss-badge')
    badge.querySelector('.count').textContent = String(n)
    badge.setAttribute('aria-label', `${n} ${n === 1 ? 'issue' : 'issues'}`)
    col.querySelector('.ss-empty').hidden = n > 0
    if (!(col.dataset.status === 'done' && !state.showDone)) visible += n
  }
  $('visible-count').textContent = String(visible)
}

$('assignee-menu').addEventListener('ss:select', (e) => {
  state.assignee = e.detail.value ?? 'all'
  $('assignee-value').textContent =
    state.assignee === 'all' ? 'Everyone' : PEOPLE[state.assignee].name
  applyFilters()
})

$('filter').addEventListener('input', (e) => {
  state.query = e.target.value
  applyFilters()
})

$('show-done-switch').addEventListener('ss:change', (e) => {
  state.showDone = e.detail.checked
  $('col-done-section').hidden = !state.showDone
  applyFilters()
})

// ── View switcher (SegmentedControl) ───────────────────────────────────────

$('view').addEventListener('ss:change', (e) => {
  const view = e.detail.value
  if (view === 'timeline') {
    toast.info('Timeline is not part of this demo — showing the list view')
    board.dataset.view = 'list'
    return
  }
  board.dataset.view = view
})

// ── Cards: keyboard activation + fill the issue dialog ─────────────────────

document.addEventListener('keydown', (e) => {
  const card = e.target instanceof Element && e.target.closest('.ss-card[role="button"]')
  if (!card || (e.key !== 'Enter' && e.key !== ' ')) return
  e.preventDefault()
  card.click()
})

document.addEventListener('click', (e) => {
  if (!(e.target instanceof Element)) return
  const card = e.target.closest('.ss-card[data-ss-modal="#issue"]')
  if (card) fillIssue(card)
  const adder = e.target.closest('[data-ss-modal="#new-issue"][data-status]')
  if (adder) $('ni-status').value = adder.dataset.status
})

function fillIssue(card) {
  const d = card.dataset
  $('issue-key').textContent = d.key
  $('issue-name').textContent = card.querySelector('.trl-issue-title').textContent.trim()
  $('issue-desc').textContent = d.desc
  $('issue-status').value = d.status
  $('issue-priority').value = d.priority
  $('issue-due').value = d.due
  $('issue-assignee').textContent = PEOPLE[d.assignee].name
  setAvatar($('issue-avatar'), d.assignee)
  const labels = $('issue-labels')
  labels.replaceChildren()
  for (const badge of card.querySelectorAll('.trl-labels .ss-badge')) {
    labels.append(badge.cloneNode(true))
  }
  $('issue-save').dataset.key = d.key
}

$('issue-save').addEventListener('click', (e) => {
  const key = e.currentTarget.dataset.key ?? 'Issue'
  const status = $('issue-status')
  toast.success(`${key} saved · ${status.options[status.selectedIndex].text}`)
})

// ── Comments ───────────────────────────────────────────────────────────────

$('comment-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const field = $('comment')
  const text = field.value.trim()
  if (!text) {
    field.focus()
    return
  }
  const li = document.createElement('li')
  li.className = 'trl-comment'
  const avatar = document.createElement('span')
  avatar.className = 'ss-avatar'
  avatar.dataset.sizeVariant = 'sm'
  avatar.setAttribute('role', 'img')
  avatar.innerHTML = '<span class="initials" aria-hidden="true"></span>'
  setAvatar(avatar, ME)
  const body = document.createElement('div')
  body.className = 'trl-comment-text'
  const meta = document.createElement('div')
  meta.className = 'trl-comment-meta'
  const who = document.createElement('strong')
  who.textContent = PEOPLE[ME].name
  const when = document.createElement('time')
  when.dateTime = new Date().toISOString()
  when.textContent = 'just now'
  meta.append(who, when)
  const p = document.createElement('p')
  p.textContent = text
  body.append(meta, p)
  li.append(avatar, body)
  $('issue-comments').append(li)
  $('comment-count').textContent = `(${$('issue-comments').children.length})`
  field.value = ''
  field.dispatchEvent(new Event('input', { bubbles: true }))
  field.focus()
})

// ── New issue ──────────────────────────────────────────────────────────────

$('new-issue-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const key = `TRL-${nextKey++}`
  const title = $('ni-title').value.trim()
  const status = $('ni-status').value
  const priority = $('ni-priority').value
  const due = $('ni-due').value || '2026-09-20'

  const li = $('issue-template').content.firstElementChild.cloneNode(true)
  const card = li.querySelector('.ss-card')
  Object.assign(card.dataset, {
    key,
    status,
    priority,
    assignee: ME,
    due,
    desc: $('ni-desc').value.trim() || 'No description yet.',
  })
  const keyEl = card.querySelector('.title')
  const titleEl = card.querySelector('.trl-issue-title')
  keyEl.id = `${key.toLowerCase()}-key`
  keyEl.textContent = key
  titleEl.id = `${key.toLowerCase()}-title`
  titleEl.textContent = title
  card.setAttribute('aria-labelledby', `${keyEl.id} ${titleEl.id}`)
  const prio = card.querySelector('.actions .ss-badge')
  prio.classList.add(PRIORITY_TONE[priority])
  prio.textContent = priority
  setAvatar(card.querySelector('.ss-avatar'), ME)
  const time = card.querySelector('time')
  time.dateTime = due
  time.textContent = fmtDate(due)

  board.querySelector(`.trl-col[data-status="${status}"] .trl-col-list`).prepend(li)
  applyFilters()
  e.target.reset()
  $('ni-status').value = 'backlog'
  $('new-issue').close()
  toast.success(`${key} created`, {
    action: { label: 'Open', onClick: () => card.click() },
  })
})

// ── Theme toggle (gallery axes helper) ─────────────────────────────────────

const themeToggle = $('theme-toggle')
const syncTheme = () =>
  themeToggle.setAttribute('aria-pressed', String(getAxes().theme === 'light'))
themeToggle.addEventListener('click', () => {
  setAxes({ theme: getAxes().theme === 'dark' ? 'light' : 'dark' })
  syncTheme()
})
syncTheme()

applyFilters()
