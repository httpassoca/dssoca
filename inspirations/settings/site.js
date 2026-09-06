/**
 * Orbit — account settings. Page-local behaviour on top of dssoca/vanilla.js: the
 * settings ⇄ sign-in view swap, toasts for the form actions, the bio counter, the
 * password reveal, the delete-account confirmation gate and the section nav state.
 */
import { toast } from '../vendor/vanilla/index.js'
import { setAxes, getAxes } from '../assets/axes.js'

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]

const app = $('#stg-app')
const login = $('#stg-login')

// ── views ──────────────────────────────────────────────────────────────────

function showLogin() {
  app.hidden = true
  login.hidden = false
  window.scrollTo({ top: 0 })
  $('#stg-login-pw')?.focus()
}

function showApp() {
  login.hidden = true
  app.hidden = false
  window.scrollTo({ top: 0 })
  $('#stg-account .trigger')?.focus()
  toast.success('welcome back')
}

$('#stg-login-form')?.addEventListener('submit', (e) => {
  e.preventDefault()
  showApp()
})

// Account menu (vanilla.js emits ss:select with the item's data-value).
$('#stg-account')?.addEventListener('ss:select', (e) => {
  switch (e.detail?.value) {
    case 'signout':
      showLogin()
      break
    case 'profile':
      location.hash = '#profile'
      break
    case 'keys':
      location.hash = '#api-keys'
      break
    case 'theme': {
      const next = getAxes().theme === 'dark' ? 'light' : 'dark'
      setAxes({ theme: next })
      toast.info(`${next} theme`)
      break
    }
  }
})

// ── password reveal (sign-in) ─────────────────────────────────────────────

for (const btn of $$('[data-stg-reveal]')) {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.getAttribute('aria-controls'))
    if (!input) return
    const reveal = input.type === 'password'
    input.type = reveal ? 'text' : 'password'
    btn.setAttribute('aria-pressed', String(reveal))
    const label = $('.label', btn)
    if (label) label.textContent = reveal ? 'hide' : 'show'
  })
}

// ── section forms: save / cancel ──────────────────────────────────────────

for (const form of $$('[data-stg-form]')) {
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    toast.success('saved')
  })
  form.addEventListener('reset', () => {
    // Native reset restores inputs; switches are ARIA-driven, so leave them alone and just say so.
    queueMicrotask(syncBioCount)
    toast.info('changes discarded')
  })
}

for (const btn of $$('[data-stg-toast]')) {
  btn.addEventListener('click', () => toast.info(btn.dataset.stgToast))
}

// ── bio character counter ─────────────────────────────────────────────────

const bio = $('#stg-bio')
const bioCount = $('[data-stg-count]')

function syncBioCount() {
  if (bio && bioCount) bioCount.textContent = String(bio.value.length)
}

bio?.addEventListener('input', syncBioCount)
syncBioCount()

// ── security: recovery codes + session revoke ─────────────────────────────

$('[data-stg-codes]')?.addEventListener('click', () => {
  toast.promise(new Promise((resolve) => setTimeout(resolve, 900)), {
    loading: 'verifying second factor…',
    success: 'recovery codes sent to your authenticator',
    error: 'could not verify',
  })
})

$('#stg-sessions')?.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-stg-revoke]')
  if (!btn) return
  const row = btn.closest('tr')
  const device = row?.querySelector('td')?.textContent?.trim() ?? 'session'
  row?.remove()
  toast.info(`revoked ${device}`)
})

// ── API keys: copy + generate ─────────────────────────────────────────────

$('#stg-keys')?.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-stg-copy]')
  if (!btn) return
  try {
    await navigator.clipboard?.writeText(btn.dataset.stgCopy)
    toast.success('key copied')
  } catch {
    toast.error('clipboard blocked — copy it by hand')
  }
})

$('[data-stg-generate]')?.addEventListener('click', () => {
  const name = $('#stg-key-name')?.value.trim() || 'untitled'
  const days = $('#stg-key-days')?.value || '90'
  const scope = $('#stg-key-scope')?.value || 'read'
  toast.success(`${name} (${scope}) created — expires in ${days} days`)
})

// ── danger zone: type-to-confirm gate ─────────────────────────────────────

const confirmInput = $('#stg-delete-confirm')
const deleteBtn = $('[data-stg-delete]')
const deleteDialog = $('#stg-delete-modal')

confirmInput?.addEventListener('input', () => {
  if (deleteBtn) deleteBtn.disabled = confirmInput.value !== 'inesv'
})

deleteDialog?.addEventListener('close', () => {
  if (confirmInput) confirmInput.value = ''
  if (deleteBtn) deleteBtn.disabled = true
})

deleteBtn?.addEventListener('click', () => {
  deleteDialog?.close()
  toast.error('deletion scheduled — you have 14 days to undo', 8000)
})

// ── section nav: keep aria-current in sync across the rail and the strip ──

function markActive(id) {
  for (const link of $$('[data-stg-nav]')) {
    const on = link.dataset.stgNav === id
    link.classList.toggle('active', on && link.classList.contains('item'))
    if (on) link.setAttribute('aria-current', 'page')
    else link.removeAttribute('aria-current')
  }
}

window.addEventListener('hashchange', () => {
  const id = location.hash.slice(1)
  if (id && $(`#${CSS.escape(id)}.stg-section`)) markActive(id)
})

if (location.hash.length > 1) {
  const id = location.hash.slice(1)
  if ($(`#${CSS.escape(id)}.stg-section`)) markActive(id)
}
