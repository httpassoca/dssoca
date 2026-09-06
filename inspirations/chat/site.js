/**
 * Relay — page-local interactivity for the chat inspiration.
 *
 * - Composer: Enter sends (Shift+Enter inserts a newline); the message joins the previous group
 *   when the current user wrote it, otherwise it starts a new Avatar + name + time group.
 * - Channel menu: `ss:select` from the dssoca Menu behaviour → a toast per action.
 * - Theme toggle via the gallery's shared axes module.
 * - Mobile: the channel sidebar slides in from the header toggle (Escape / selection closes it).
 */
import { mount, toast } from '../vendor/vanilla/index.js'
import { getAxes, setAxes } from '../assets/axes.js'

const ME = { name: 'Jules Marchetti', initials: 'JM', color: 'var(--ss-cyan)' }

const shell = document.getElementById('relay')
const log = document.getElementById('relay-log')
const list = document.getElementById('relay-messages')
const form = document.getElementById('relay-composer')
const draft = document.getElementById('relay-draft')

// ── Composer ───────────────────────────────────────────────────────────────

function nowStamp() {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}T${hh}:${mm}`
  return { text: `${hh}:${mm}`, iso }
}

function messageParagraph(text) {
  const p = document.createElement('p')
  p.className = 'relay-msg relay-live'
  p.textContent = text
  return p
}

function newGroup(text) {
  const { text: stamp, iso } = nowStamp()
  const li = document.createElement('li')
  li.className = 'relay-group'
  li.dataset.author = ME.name
  li.innerHTML = `
    <span class="ss-avatar" role="img" aria-label="${ME.name}" style="--ss-avatar-bg: ${ME.color};">
      <span class="initials" aria-hidden="true">${ME.initials}</span>
    </span>
    <div class="relay-group-body">
      <div class="relay-group-head">
        <span class="relay-author">${ME.name}</span>
        <span class="ss-badge neutral" data-size-variant="sm">you</span>
        <time datetime="${iso}">${stamp}</time>
      </div>
    </div>`
  li.querySelector('.relay-group-body').append(messageParagraph(text))
  return li
}

function send() {
  const text = draft.value.trim()
  if (!text) return
  const last = list.lastElementChild
  if (last?.classList.contains('relay-group') && last.dataset.author === ME.name) {
    last.querySelector('.relay-group-body').append(messageParagraph(text))
  } else {
    const group = newGroup(text)
    list.append(group)
    mount(group) // hydrates any icon placeholders / fields the new markup carries
  }
  draft.value = ''
  draft.style.height = ''
  draft.dispatchEvent(new Event('input', { bubbles: true })) // re-run autosize + clear buttons
  draft.focus()
  log.scrollTop = log.scrollHeight
}

draft.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault()
    send()
  }
})

form.addEventListener('submit', (e) => {
  e.preventDefault()
  send()
})

// ── Channel actions menu ───────────────────────────────────────────────────

const ACTIONS = {
  pin: () => toast.success('Pinned #general to the top of the list'),
  mute: () => toast.info('Muted #general for 1 hour'),
  leave: () => toast.error('You cannot leave the default channel'),
}

document.getElementById('relay-chan-menu')?.addEventListener('ss:select', (e) => {
  ACTIONS[e.detail?.value]?.()
})

// ── Theme toggle ───────────────────────────────────────────────────────────

document.getElementById('relay-theme')?.addEventListener('click', () => {
  setAxes({ theme: getAxes().theme === 'dark' ? 'light' : 'dark' })
})

// ── Mobile channel drawer ──────────────────────────────────────────────────

const navToggle = document.getElementById('relay-nav-toggle')

function setChannelsOpen(open) {
  shell.classList.toggle('channels-open', open)
  navToggle.setAttribute('aria-expanded', String(open))
  navToggle.setAttribute('aria-label', open ? 'Hide channels' : 'Show channels')
}

navToggle?.addEventListener('click', () => {
  setChannelsOpen(!shell.classList.contains('channels-open'))
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && shell.classList.contains('channels-open')) setChannelsOpen(false)
})

document.querySelectorAll('#relay-channels .ss-side .item').forEach((item) => {
  item.addEventListener('click', () => {
    if (shell.classList.contains('channels-open')) setChannelsOpen(false)
  })
})

// Open on the "new messages" divider, like a real client returning to a channel.
const divider = list.querySelector('.relay-divider')
if (divider) log.scrollTop = Math.max(0, divider.offsetTop - log.clientHeight * 0.45)
