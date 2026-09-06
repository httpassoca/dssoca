/**
 * Signal — page-local interactivity for the social feed example.
 * Everything dssoca already does (menus, tooltips, autosize, toasts, icons) comes from
 * vanilla.js; this file only wires the feed-specific state: likes, boosts, follows, the
 * composer character count and the "load more" button.
 */
import { toast } from '../vendor/vanilla/index.js'
import { setAxes, getAxes } from '../assets/axes.js'

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]

const fmt = (n) => new Intl.NumberFormat('en', { notation: 'compact' }).format(n)

/** Read the numeric count out of a `.ss-btn .label`. */
function countOf(btn) {
  const raw = btn.dataset.count ?? btn.querySelector('.label')?.textContent ?? '0'
  return Number.parseInt(String(raw).replace(/[^\d]/g, ''), 10) || 0
}

function setCount(btn, n, noun) {
  btn.dataset.count = String(n)
  const label = btn.querySelector('.label')
  if (label) label.textContent = fmt(n)
  const verb = btn.getAttribute('aria-label')?.split(' (')[0] ?? noun
  btn.setAttribute('aria-label', `${verb} (${n} ${noun}${n === 1 ? '' : 's'})`)
}

// ---------- post actions (delegated so cloned posts work too) ----------
document.addEventListener('click', (e) => {
  const btn = e.target instanceof Element ? e.target.closest('[data-action]') : null
  if (!btn) return
  const action = btn.dataset.action
  const affix = btn.querySelector('.affix')

  if (action === 'like') {
    const liked = btn.getAttribute('aria-pressed') === 'true'
    const next = countOf(btn) + (liked ? -1 : 1)
    btn.setAttribute('aria-pressed', liked ? 'false' : 'true')
    if (affix) affix.textContent = liked ? '♡' : '♥'
    setCount(btn, next, 'like')
    return
  }

  if (action === 'boost') {
    if (btn.dataset.boosted === 'true') {
      toast.info('already boosted')
      return
    }
    btn.dataset.boosted = 'true'
    setCount(btn, countOf(btn) + 1, 'boost')
    toast.success('boosted')
    return
  }

  if (action === 'reply') {
    const compose = $('#sig-compose')
    const post = btn.closest('[data-post]')
    const handle = post?.querySelector('.sig-post-handle')?.textContent?.trim() ?? ''
    if (compose) {
      compose.value = handle ? `${handle} ` : ''
      compose.dispatchEvent(new Event('input', { bubbles: true }))
      compose.focus()
      compose.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
    return
  }

  if (action === 'share') {
    const post = btn.closest('[data-post]')
    const url = `${location.origin}${location.pathname}#${post?.id ?? ''}`
    const done = () => toast.success('link copied')
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(done, done)
    else done()
  }
})

// ---------- overflow menu (mute / block / report) ----------
document.addEventListener('ss:select', (e) => {
  const menu = e.target instanceof Element ? e.target.closest('.ss-menu') : null
  if (!menu || !menu.closest('[data-post]')) return
  const value = e.detail?.value
  if (value === 'mute') toast.info('muted @priya — you will not see their posts')
  else if (value === 'block')
    toast.error('blocked @priya', {
      action: { label: 'undo', onClick: () => toast.info('unblocked') },
    })
  else if (value === 'report') toast.success('report sent to the moderators')
})

// ---------- follow buttons ----------
for (const btn of $$('[data-follow]')) {
  btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') === 'true'
    btn.setAttribute('aria-pressed', on ? 'false' : 'true')
    btn.classList.toggle('secondary', on)
    btn.classList.toggle('ghost', !on)
    const label = btn.querySelector('.label')
    if (label) label.textContent = on ? 'follow' : 'following'
    const name = btn.getAttribute('aria-label')?.replace(/^(Follow|Unfollow) /, '') ?? ''
    btn.setAttribute('aria-label', `${on ? 'Follow' : 'Unfollow'} ${name}`)
    if (!on) toast.success(`following ${name}`)
  })
}

// ---------- composer ----------
const compose = $('#sig-compose')
const count = $('#sig-count')
const postBtn = $('#sig-post')
const MAX = 500

function refreshComposer() {
  if (!compose || !count || !postBtn) return
  const n = compose.value.trim().length
  count.textContent = `${n} / ${MAX}`
  count.classList.remove('neutral', 'caution', 'critical')
  count.classList.add(n > MAX ? 'critical' : n > MAX - 50 ? 'caution' : 'neutral')
  postBtn.disabled = n === 0 || n > MAX
}

compose?.addEventListener('input', refreshComposer)
refreshComposer()

postBtn?.addEventListener('click', () => {
  if (!compose) return
  const text = compose.value.trim()
  if (!text) return
  const first = $('[data-post]')
  if (first) {
    const clone = first.cloneNode(true)
    clone.id = `post-${Date.now()}`
    clone.querySelector('.sig-post-context')?.remove()
    const avatar = clone.querySelector('.ss-avatar')
    if (avatar) {
      avatar.setAttribute('aria-label', 'Mira Okafor')
      avatar.style.setProperty('--ss-avatar-bg', 'var(--ss-cyan)')
      const initials = avatar.querySelector('.initials')
      if (initials) initials.textContent = 'MO'
    }
    const name = clone.querySelector('.sig-post-name')
    if (name) name.textContent = 'Mira Okafor'
    const handle = clone.querySelector('.sig-post-handle')
    if (handle) handle.textContent = '@mira@signal.net'
    const time = clone.querySelector('.sig-post-time')
    if (time) {
      time.textContent = 'now'
      time.setAttribute('href', `#${clone.id}`)
    }
    const tip = clone.querySelector('.sig-post-head .ss-tooltip:last-of-type .tip')
    if (tip) tip.textContent = new Date().toUTCString()
    clone.querySelector('.sig-post-text').textContent = text
    for (const b of clone.querySelectorAll('[data-action]')) {
      b.removeAttribute('data-boosted')
      if (b.dataset.action === 'like') {
        b.setAttribute('aria-pressed', 'false')
        b.querySelector('.affix').textContent = '♡'
      }
      if (b.dataset.action !== 'share')
        setCount(b, 0, b.dataset.action === 'reply' ? 'reply' : b.dataset.action)
    }
    first.before(clone)
  }
  compose.value = ''
  refreshComposer()
  toast.success('posted to your followers')
})

$('#sig-compose-jump')?.addEventListener('click', () => {
  compose?.focus()
  compose?.scrollIntoView({ block: 'center', behavior: 'smooth' })
})

// ---------- load more ----------
const more = $('#sig-load-more')
more?.addEventListener('click', () => {
  if (more.classList.contains('loading')) return
  more.classList.add('loading')
  more.setAttribute('aria-busy', 'true')
  const label = more.querySelector('.label')
  if (label) label.textContent = 'fetching…'
  const affix = document.createElement('span')
  affix.className = 'affix'
  affix.setAttribute('aria-hidden', 'true')
  affix.innerHTML =
    '<span class="ss-spinner" data-variant="line" aria-hidden="true"><span class="frame" aria-hidden="true"></span></span>'
  more.prepend(affix)
  setTimeout(() => {
    affix.remove()
    more.classList.remove('loading')
    more.removeAttribute('aria-busy')
    if (label) label.textContent = 'you are all caught up'
    more.disabled = true
    toast.info('no older posts in this view')
  }, 1400)
})

// ---------- sidebar: icon-only rail on narrow desktops (the component's own contract) ----------
const side = $('.sig-left .ss-side')
const railQuery = typeof matchMedia === 'function' ? matchMedia('(max-width: 1024px)') : null
function syncRail() {
  if (!side || !railQuery) return
  if (railQuery.matches) side.setAttribute('data-collapsed', '')
  else side.removeAttribute('data-collapsed')
}
railQuery?.addEventListener('change', syncRail)
syncRail()

// ---------- theme toggle ----------
const themeBtn = $('#sig-theme')
function syncThemeLabel() {
  const { theme } = getAxes()
  themeBtn?.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`)
}
themeBtn?.addEventListener('click', () => {
  const { theme } = getAxes()
  setAxes({ theme: theme === 'dark' ? 'light' : 'dark' })
  syncThemeLabel()
})
syncThemeLabel()
