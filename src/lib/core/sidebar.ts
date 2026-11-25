/**
 * Sidebar core (DS-0197) — the decisions behind the nav rail: which item is active, whether a
 * disclosure is open, what a key on a button-like item does, what the collapse toggle reports
 * and how an item is named when the rail is icon-only. Pure functions; Sidebar.svelte holds the
 * state and applies the result. No DOM, no Svelte.
 */

export type SidebarStatus = 'up' | 'deg' | 'down'

/** The fields of a nav item the core reads. */
export interface SidebarItemLike {
  id: string
  label: string
  status?: SidebarStatus
  external?: boolean
  badge?: string | number
  children?: readonly SidebarItemLike[]
}

/** The word announced next to a status dot; empty for `up` (the quiet default). */
export const SIDEBAR_STATUS_WORD: Record<SidebarStatus, string> = {
  up: '',
  deg: 'degraded',
  down: 'down',
}

/** Whether a badge value renders at all (`0` does, an empty string does not). */
export function sidebarHasBadge(badge: string | number | undefined | null): boolean {
  return badge != null && badge !== ''
}

/**
 * The accessible name of an item in the collapsed (icon-only) rail: the label plus the
 * degraded/down status, the badge and the new-tab hint, so nothing the expanded row shows is lost.
 */
export function sidebarItemName(item: SidebarItemLike): string {
  const parts = [item.label]
  if (item.status && SIDEBAR_STATUS_WORD[item.status]) parts.push(SIDEBAR_STATUS_WORD[item.status])
  if (sidebarHasBadge(item.badge)) parts.push(`${item.badge}`)
  if (item.external) parts.push('opens in a new tab')
  return parts.join(', ')
}

export function sidebarIsActive(item: SidebarItemLike, active: string | undefined): boolean {
  return item.id === active
}

/** A parent disclosure is "active-within" when it or any of its children is active. */
export function sidebarActiveWithin(item: SidebarItemLike, active: string | undefined): boolean {
  return sidebarIsActive(item, active) || !!item.children?.some((c) => sidebarIsActive(c, active))
}

/**
 * Whether a disclosure is open. `toggled` is the user's own choice for it (`undefined` until
 * they press it): before that it follows the active item, afterwards the choice wins.
 */
export function sidebarDisclosureOpen(
  item: SidebarItemLike,
  active: string | undefined,
  toggled: boolean | undefined,
): boolean {
  return toggled ?? sidebarActiveWithin(item, active)
}

/** The disclosure button was pressed: the next value of its `toggled` choice. */
export function sidebarDisclosurePress(
  item: SidebarItemLike,
  active: string | undefined,
  toggled: boolean | undefined,
): boolean {
  return !sidebarDisclosureOpen(item, active, toggled)
}

/** The collapse toggle was pressed: the `collapsed` value to report. */
export function sidebarCollapsePress(collapsed: boolean): boolean {
  return !collapsed
}

/** A key the sidebar handles: what it does, and whether the browser default must be cancelled. */
export interface SidebarKeyResult {
  action: { type: 'select' }
  preventDefault: boolean
}

/**
 * A key on a button-like item (`role="button"`, no `href`): Enter and Space select it, like a
 * native button. `null` = not a sidebar key, let it through.
 */
export function sidebarItemKey(key: string): SidebarKeyResult | null {
  switch (key) {
    case 'Enter':
    case ' ':
      return { action: { type: 'select' }, preventDefault: true }
    default:
      return null
  }
}

// --- attributes ---------------------------------------------------------------
// Strings, not booleans, so a spread writes the same DOM everywhere.

const bool = (value: boolean): 'true' | 'false' => (value ? 'true' : 'false')

/** The collapse toggle: expanded is the opposite of collapsed. */
export function sidebarToggleAttrs(collapsed: boolean) {
  return { 'aria-expanded': bool(!collapsed) } as const
}

export function sidebarDisclosureAttrs(open: boolean, panelId: string) {
  return { 'aria-expanded': bool(open), 'aria-controls': panelId } as const
}

/** State of a link / button-like item; the name is only forced in the collapsed rail. */
export function sidebarItemAttrs(
  item: SidebarItemLike,
  active: string | undefined,
  collapsed: boolean,
) {
  const name = collapsed ? sidebarItemName(item) : undefined
  return {
    'aria-current': sidebarIsActive(item, active) ? 'page' : undefined,
    'aria-label': name,
    title: name,
  } as const
}
