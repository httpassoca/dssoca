/**
 * Keycap Co. — page-local interactivity for the product page.
 * Gallery thumbnails, colour swatch label, add-to-cart / wishlist toasts with a live cart
 * count, newsletter submit, and the header theme toggle. Everything else (accordion, number
 * steppers, input clear, toasts, icons) is dssoca vanilla.js.
 */
import { toast } from '../vendor/vanilla/index.js'
import { setAxes, getAxes } from '../assets/axes.js'

const $ = (sel, root = document) => root.querySelector(sel)

// ── Gallery: thumbnails swap the big image ─────────────────────────────────
const stage = $('#store-stage')
const thumbs = [...document.querySelectorAll('.store-thumb')]
const VIEW_LABELS = {
  front: 'front view',
  top: 'top-down view',
  side: 'side profile',
  keycaps: 'keycap close-up',
}

function showView(view) {
  for (const svg of stage.querySelectorAll('svg')) {
    // SVG elements have no `hidden` IDL property — toggle the attribute (styled in site.css).
    svg.toggleAttribute('hidden', svg.dataset.view !== view)
  }
  for (const btn of thumbs) btn.setAttribute('aria-pressed', String(btn.dataset.view === view))
  stage.setAttribute('aria-label', `KC-75 keyboard, ${VIEW_LABELS[view] ?? view}`)
}

for (const btn of thumbs) btn.addEventListener('click', () => showView(btn.dataset.view))

// ── Colour swatches: echo the chosen colour name in the legend ─────────────
const swatchName = $('#store-swatch-name')
for (const input of document.querySelectorAll('input[name="colour"]')) {
  input.addEventListener('change', () => {
    const label = input.closest('.store-swatch')?.querySelector('.store-sr-only:last-child')
    swatchName.textContent = `— ${(label?.textContent ?? input.value).trim().toLowerCase()}`
  })
}

// ── Cart ───────────────────────────────────────────────────────────────────
const cartBtn = $('#store-cart')
const cartCount = $('#store-cart-count .count')
let items = Number(cartCount.textContent) || 0

function setCart(n) {
  items = n
  cartCount.textContent = String(items)
  cartBtn.setAttribute('aria-label', `Cart, ${items} ${items === 1 ? 'item' : 'items'}`)
}

$('#store-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const qty = Math.min(10, Math.max(1, Number($('#store-qty').value) || 1))
  const colour = $('input[name="colour"]:checked')?.value ?? 'graphite'
  const layout = $('#store-layout').selectedOptions[0]?.textContent ?? 'ANSI'
  setCart(items + qty)
  toast.success(`added to cart — ${qty} × KC-75 ${colour}, ${layout}`)
})

$('#store-wish').addEventListener('click', () => {
  toast.info('saved to your wishlist')
})

cartBtn.addEventListener('click', () => {
  toast.info(
    items ? `${items} ${items === 1 ? 'item' : 'items'} in your cart` : 'your cart is empty',
  )
})

// ── Newsletter ─────────────────────────────────────────────────────────────
$('#store-newsletter').addEventListener('submit', (e) => {
  e.preventDefault()
  const email = $('#store-email')
  if (!email.value || !email.checkValidity()) {
    toast.error('enter a valid email address')
    email.focus()
    return
  }
  toast.success(`subscribed ${email.value}`)
  email.value = ''
})

// ── Theme toggle (persisted for the whole gallery via axes.js) ─────────────
const themeBtn = $('#store-theme')
function syncThemeLabel() {
  const { theme } = getAxes()
  themeBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`)
}
themeBtn.addEventListener('click', () => {
  setAxes({ theme: getAxes().theme === 'dark' ? 'light' : 'dark' })
  syncThemeLabel()
})
syncThemeLabel()
