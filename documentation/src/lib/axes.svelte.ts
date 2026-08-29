/**
 * The two design axes (color theme, size variant) as shared reactive state so
 * the topbar buttons, the search-palette actions and the global shortcuts
 * (DS-0147) all drive the same source of truth — via the real dssoca API
 * (`applyDesignConfig`), exactly like a consuming app would.
 */
import { applyDesignConfig, dssocaConfig, type ColorTheme, type Size } from 'dssoca'

const themes = dssocaConfig.theme.values as readonly ColorTheme[]
const sizes = dssocaConfig.size.values as readonly Size[]

let theme = $state<ColorTheme>(dssocaConfig.theme.default)
let size = $state<Size>(dssocaConfig.size.default)

export const axes = {
  get theme() {
    return theme
  },
  get size() {
    return size
  },
  /** Read the current attributes off `<html>` (client only; call once on mount). */
  sync() {
    const el = document.documentElement
    theme = (el.getAttribute('data-theme') as ColorTheme) ?? theme
    size = (el.getAttribute('data-size-variant') as Size) ?? size
  },
  nextTheme() {
    theme = themes[(themes.indexOf(theme) + 1) % themes.length]
    applyDesignConfig({ theme })
  },
  nextSize() {
    size = sizes[(sizes.indexOf(size) + 1) % sizes.length]
    applyDesignConfig({ sizeVariant: size })
  },
}
