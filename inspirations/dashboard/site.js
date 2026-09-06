/**
 * Nimbus Ops — page-local interactivity on top of dssoca's vanilla behaviours.
 * Menus, icons and toasts come from `vendor/vanilla/index.js`; this module only wires the
 * static Table (sorting), the static LogStream (level chips, text filter, copy), the page-head
 * menu actions, and the footer theme toggle.
 */
import { toast } from '../vendor/vanilla/index.js'
import { setAxes, getAxes } from '../assets/axes.js'

// ---- Table sorting ------------------------------------------------------------------------
const table = document.getElementById('ops-deploys')
if (table) {
  const heads = [...table.querySelectorAll('thead th')]
  const body = table.tBodies[0]
  const cellValue = (row, i) => {
    const td = row.cells[i]
    return td?.dataset.sort ?? td?.textContent.trim() ?? ''
  }
  const paint = (active, dir) => {
    for (const th of heads) {
      if (!th.hasAttribute('aria-sort')) continue
      const isActive = th === active
      th.setAttribute('aria-sort', isActive ? (dir === 'asc' ? 'ascending' : 'descending') : 'none')
      const ind = th.querySelector('.indicator')
      if (ind) ind.textContent = isActive ? (dir === 'asc' ? '↑' : '↓') : '↕'
    }
  }
  for (const th of heads) {
    const btn = th.querySelector('button.sort')
    if (!btn) continue
    btn.addEventListener('click', () => {
      const i = heads.indexOf(th)
      const numeric = th.classList.contains('numeric')
      const dir = th.getAttribute('aria-sort') === 'ascending' ? 'desc' : 'asc'
      const sign = dir === 'asc' ? 1 : -1
      const rows = [...body.rows]
      rows.sort((a, b) => {
        const av = cellValue(a, i)
        const bv = cellValue(b, i)
        return (numeric ? Number(av) - Number(bv) : av.localeCompare(bv)) * sign
      })
      body.append(...rows)
      paint(th, dir)
    })
  }
}

// ---- Log stream: level chips, text filter, copy -------------------------------------------
const logs = document.getElementById('ops-logs')
if (logs) {
  const lines = [...logs.querySelectorAll('.ln')]
  const chips = [...logs.querySelectorAll('.filters .chip')]
  const search = logs.querySelector('.search')
  const wrapChip = logs.querySelector('[data-ops="wrap"]')
  const copyChip = logs.querySelector('[data-ops="copy"]')
  const scroll = logs.querySelector('.scroll')

  const levelOf = (ln) => ln.querySelector('.lvl')?.textContent.trim().toLowerCase() ?? ''
  const apply = () => {
    const on = new Set(
      chips
        .filter((c) => c.getAttribute('aria-pressed') === 'true')
        .map((c) => c.textContent.trim().toLowerCase()),
    )
    const q = (search?.value ?? '').trim().toLowerCase()
    for (const ln of lines) {
      const show = on.has(levelOf(ln)) && (!q || ln.textContent.toLowerCase().includes(q))
      ln.style.display = show ? '' : 'none'
    }
  }
  for (const chip of chips) {
    chip.addEventListener('click', () => {
      chip.setAttribute(
        'aria-pressed',
        chip.getAttribute('aria-pressed') === 'true' ? 'false' : 'true',
      )
      apply()
    })
  }
  search?.addEventListener('input', apply)
  wrapChip?.addEventListener('click', () => {
    const on = wrapChip.getAttribute('aria-pressed') !== 'true'
    wrapChip.setAttribute('aria-pressed', String(on))
    scroll?.classList.toggle('nowrap', !on)
  })
  copyChip?.addEventListener('click', async () => {
    const text = lines
      .filter((ln) => ln.style.display !== 'none')
      .map((ln) => ln.textContent.replace(/\s+/g, ' ').trim())
      .join('\n')
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`Copied ${lines.filter((ln) => ln.style.display !== 'none').length} lines`)
    } catch {
      toast.error('Clipboard unavailable')
    }
  })
}

// ---- Page-head actions menu ------------------------------------------------------------------
document.getElementById('ops-actions')?.addEventListener('ss:select', (e) => {
  const value = e.detail?.value
  if (value === 'export') {
    toast.promise(new Promise((r) => setTimeout(r, 1400)), {
      loading: 'Exporting last 24h as CSV…',
      success: 'Export ready — overview-24h.csv',
      error: 'Export failed',
    })
  } else if (value === 'share') {
    toast.success('Share link copied')
  } else if (value === 'refresh') {
    toast.info('Metrics refreshed')
  }
})

// ---- Footer theme toggle ---------------------------------------------------------------------
const themeBtn = document.getElementById('ops-theme')
const paintTheme = () => {
  if (!themeBtn) return
  const { theme } = getAxes()
  themeBtn.querySelector('.label').textContent = `theme: ${theme}`
  themeBtn.setAttribute('aria-pressed', String(theme === 'light'))
}
themeBtn?.addEventListener('click', () => {
  setAxes({ theme: getAxes().theme === 'dark' ? 'light' : 'dark' })
  paintTheme()
})
paintTheme()
