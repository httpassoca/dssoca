/**
 * dssoca design axes for the Inspirations pages — shared by every example site.
 *
 * Applies the colour theme (`data-theme`: dark | light) and size (`data-size-variant`:
 * sm | md | lg) to <html>, in this order of precedence: `?theme=&size=` query params, then the
 * choice saved by the gallery (localStorage), then whatever the markup already carries. Runs
 * synchronously on import so a page opened from the gallery paints with the chosen axes.
 * Plain ES module, no dependencies; `setAxes()` is the one export (used by toggles).
 */
const KEY = 'dssoca-inspirations-axes'
const THEMES = ['dark', 'light']
const SIZES = ['sm', 'md', 'lg']
const root = document.documentElement

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') ?? {}
  } catch {
    return {}
  }
}

/** Set one or both axes on <html> and remember them for the other pages. */
export function setAxes({ theme, size } = {}) {
  const next = { ...read() }
  if (THEMES.includes(theme)) next.theme = theme
  if (SIZES.includes(size)) next.size = size
  if (next.theme) root.setAttribute('data-theme', next.theme)
  if (next.size) root.setAttribute('data-size-variant', next.size)
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* private mode / storage disabled — the attributes are still applied */
  }
  return getAxes()
}

/** The axes currently painted on <html>. */
export function getAxes() {
  return {
    theme: root.getAttribute('data-theme') ?? 'dark',
    size: root.getAttribute('data-size-variant') ?? 'md',
  }
}

const params = new URLSearchParams(location.search)
const saved = read()
const theme = params.get('theme') ?? saved.theme
const size = params.get('size') ?? saved.size
if (THEMES.includes(theme)) root.setAttribute('data-theme', theme)
if (SIZES.includes(size)) root.setAttribute('data-size-variant', size)
