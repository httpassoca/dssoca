/**
 * BottomNav core (DS-0197) — which element a tab is, what pressing it does, and the attributes
 * that reflect its state. Pure functions; BottomNav.svelte renders the result. No DOM, no Svelte.
 */

/** What the decisions need to know about one tab. */
export interface BottomNavTab {
  id: string
  label: string
  href?: string
  badge?: string | number
  disabled?: boolean
}

/**
 * A tab is a real link only when it has an `href` and is enabled. A disabled `href` tab is a
 * (natively disabled) button: reliably inert and out of the tab order, where a dead `<a>` would
 * need tabindex/role juggling.
 */
export function bottomNavTabElement(tab: BottomNavTab): 'a' | 'button' {
  return tab.href && !tab.disabled ? 'a' : 'button'
}

export interface BottomNavPressResult {
  /** Fire `onSelect` with the tab id. */
  select: boolean
  /** Cancel the browser default (navigation / button activation). */
  preventDefault: boolean
}

/**
 * A tab was pressed. A disabled tab is inert: nothing is selected and nothing navigates. An
 * `href` tab navigates natively and still selects (SPA fallback); a tab without one only selects.
 */
export function bottomNavPress(tab: BottomNavTab): BottomNavPressResult {
  if (tab.disabled) return { select: false, preventDefault: true }
  return { select: true, preventDefault: !tab.href }
}

export function bottomNavHasBadge(tab: BottomNavTab): boolean {
  return tab.badge != null && tab.badge !== ''
}

/** State attributes of one tab (either element). */
export function bottomNavTabAttrs(tab: BottomNavTab, active: string | undefined) {
  return {
    'aria-current': tab.id === active ? 'page' : undefined,
    // The badge is folded into the accessible name so the count is not lost to AT.
    'aria-label': bottomNavHasBadge(tab) ? `${tab.label}, ${tab.badge}` : undefined,
    'aria-disabled': tab.disabled ? 'true' : undefined,
  } as const
}
