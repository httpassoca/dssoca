/**
 * Spark — page-local interactivity for the swipe deck.
 *
 * The deck is five static profile cards in the DOM; only the front one is visible (the rest
 * carry `hidden`). Skip / super like / like advance the deck; every third like opens the
 * "It's a match!" modal instead. Arrow keys mirror the buttons. Modals, icons, toasts, the
 * settings switch and segmented control come from vanilla.js — this file only reacts to them.
 */
import { openModal, toast } from '../vendor/vanilla/index.js'
import { setAxes, getAxes } from '../assets/axes.js'

const profiles = [...document.querySelectorAll('.dating-profile')]
const posEl = document.getElementById('dating-pos')
const totalEl = document.getElementById('dating-total')
const matchDialog = document.getElementById('dating-match')
const matchName = document.getElementById('dating-match-name')
const matchAvatar = document.getElementById('dating-match-avatar')
const likesTab = document.querySelector('.ss-bottom-nav [data-tab="Likes"]')

let index = 0
let likes = 0
let likesCount = Number(likesTab?.querySelector('.badge')?.textContent) || 0

totalEl.textContent = String(profiles.length)

function current() {
  return profiles[index]
}

function show(i) {
  index = (i + profiles.length) % profiles.length
  profiles.forEach((card, n) => {
    card.hidden = n !== index
  })
  posEl.textContent = String(index + 1)
}

function advance() {
  show(index + 1)
}

function bumpLikesBadge() {
  if (!likesTab) return
  likesCount += 1
  likesTab.querySelector('.badge').textContent = String(likesCount)
  likesTab.setAttribute('aria-label', `Likes, ${likesCount}`)
}

function openMatch(card) {
  const name = card.dataset.name
  matchName.textContent = name
  matchAvatar.setAttribute('aria-label', name)
  matchAvatar.querySelector('.initials').textContent = card.dataset.initials
  matchAvatar.style.setProperty('--ss-avatar-bg', card.dataset.color)
  openModal(matchDialog)
}

const actions = {
  skip() {
    advance()
  },
  super() {
    const card = current()
    toast.info(`Super like sent to ${card.dataset.name}`)
    bumpLikesBadge()
    advance()
  },
  like() {
    const card = current()
    likes += 1
    bumpLikesBadge()
    if (likes % 3 === 0) openMatch(card)
    advance()
  },
}

for (const btn of document.querySelectorAll('.dating-act')) {
  btn.addEventListener('click', () => actions[btn.dataset.action]())
}

// Arrow keys mirror the buttons — unless a dialog owns the page.
const KEYS = { ArrowLeft: 'skip', ArrowRight: 'like', ArrowUp: 'super' }
document.addEventListener('keydown', (e) => {
  const action = KEYS[e.key]
  if (!action || e.altKey || e.ctrlKey || e.metaKey) return
  if (document.querySelector('dialog[open]')) return
  e.preventDefault()
  actions[action]()
})

// Match modal: "Send a message" is the only affirmative exit.
matchDialog.addEventListener('click', (e) => {
  if (e.target.closest('[data-action="message"]')) {
    toast.success(`Message to ${matchName.textContent} — opening chat`)
  }
})

// Bottom nav: only Discover exists in this preview.
for (const tab of document.querySelectorAll('.ss-bottom-nav .tab:not(.active)')) {
  tab.addEventListener('click', () => toast.info(`${tab.dataset.tab} is not part of this preview`))
}

// Settings: reflect the gallery axes, then push changes back through setAxes().
const themeSwitch = document.getElementById('dating-theme')
const themeTrack = document.getElementById('dating-theme-track')
const sizeGroup = document.getElementById('dating-size')

function syncSettings() {
  const { theme, size } = getAxes()
  const light = theme === 'light'
  themeTrack.setAttribute('aria-checked', String(light))
  themeTrack.classList.toggle('on', light)
  for (const seg of sizeGroup.querySelectorAll('.segment')) {
    const on = seg.dataset.value === size
    seg.classList.toggle('selected', on)
    seg.setAttribute('aria-checked', String(on))
    seg.tabIndex = on ? 0 : -1
  }
}

syncSettings()
themeSwitch.addEventListener('ss:change', (e) => {
  setAxes({ theme: e.detail.checked ? 'light' : 'dark' })
})
sizeGroup.addEventListener('ss:change', (e) => {
  setAxes({ size: e.detail.value })
})

show(0)
