/**
 * Tabs (DS-0197) — the WAI-ARIA tabs pattern over the exact DOM Tabs.svelte renders:
 * `.ss-tabs > .list[role=tablist] > .tab[role=tab]` plus one `.panel[role=tabpanel]` per tab
 * (each tab's `aria-controls` names its panel; without it the n-th tab owns the n-th panel).
 * The behaviour itself comes from `../core/tabs.js`, shared with the Svelte component: this file
 * reads the state from the DOM, asks the core, and writes the result back — the selected tab's
 * panel is shown, the others get `hidden`. `data-activation="manual"` on the root makes the
 * arrows move focus only (Enter / Space select). Emits `ss:change` on the root with
 * `{ value, index, reason }`; `value` is the tab's `data-value` (vanilla-only attribute) or its
 * label text, `reason` is `'press'` or `'key'`.
 */
import { on, emit, all, byId, setAttrs } from './delegate.js'
import {
  tabsKey,
  tabsPress,
  tabsTabAttrs,
  tabsTabStop,
  type TabsAction,
  type TabsState,
} from '../core/tabs.js'

const TAB = '.ss-tabs > .list[role="tablist"] > .tab[role="tab"]'

interface Parts {
  root: HTMLElement
  tabs: HTMLButtonElement[]
  panels: (HTMLElement | null)[]
}

function parts(el: Element): Parts | null {
  const root = el.closest<HTMLElement>('.ss-tabs')
  if (!root) return null
  const tabs = all<HTMLButtonElement>(root, ':scope > .list > .tab[role="tab"]')
  const own = all(root, ':scope > .panel')
  const panels = tabs.map((t, i) => byId(t.getAttribute('aria-controls')) ?? own[i] ?? null)
  return { root, tabs, panels }
}

/** The list's state, read from the DOM (the DOM is the store on the plain-HTML path). */
function read({ tabs }: Parts): TabsState {
  return {
    selected: tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'),
    enabled: tabs
      .map((t, index) => (t.disabled || t.getAttribute('aria-disabled') === 'true' ? -1 : index))
      .filter((index) => index >= 0),
  }
}

/** Apply a core action to the DOM. */
function run(p: Parts, action: TabsAction | null): void {
  if (!action) return
  const tab = p.tabs[action.index]
  if (!tab) return
  if (action.type === 'select') {
    const tabStop = tabsTabStop({ ...read(p), selected: action.index })
    p.tabs.forEach((t, index) => {
      t.classList.toggle('selected', index === action.index)
      setAttrs(t, {
        ...tabsTabAttrs({ index, selected: action.index, tabStop }),
        // Authored wiring stays as it is.
        'aria-controls': t.getAttribute('aria-controls') ?? undefined,
      })
      const panel = p.panels[index]
      if (panel) panel.hidden = index !== action.index
    })
    if (action.changed) {
      const value = tab.dataset.value ?? tab.querySelector('.label')?.textContent?.trim() ?? ''
      emit(p.root, 'ss:change', { value, index: action.index, reason: action.reason })
    }
    if (!action.focus) return
  }
  tab.focus()
}

export function selectTab(tab: HTMLButtonElement): void {
  const p = parts(tab)
  if (p) run(p, tabsPress(read(p), p.tabs.indexOf(tab)))
}

export function installTabs(): void {
  on('click', TAB, (t) => selectTab(t as HTMLButtonElement))

  on('keydown', TAB, (tab, e) => {
    const p = parts(tab)
    if (!p) return
    // RTL: the list runs right-to-left, so ArrowLeft points at the NEXT tab. Read the inherited
    // computed direction at keydown time and hand it to the core.
    const rtl = getComputedStyle(tab).direction === 'rtl'
    const activation = p.root.dataset.activation === 'manual' ? 'manual' : 'auto'
    const result = tabsKey(read(p), p.tabs.indexOf(tab as HTMLButtonElement), e.key, {
      rtl,
      activation,
    })
    if (!result) return
    if (result.preventDefault) e.preventDefault()
    run(p, result.action)
  })
}
