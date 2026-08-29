/**
 * Persist the shortcut registry's overrides (remaps, per-id toggles, the
 * `characterKeys` switch) across visits — the localStorage recipe from the
 * `/keyboard` guide, applied to this site (DS-0147). Persistence is app policy,
 * not library behaviour, which is why it lives here.
 */
import { shortcuts } from 'dssoca'

export const STORAGE_KEY = 'dssoca-docs:shortcuts'

/** Restore a saved snapshot (no-op when absent or malformed). */
export function restoreShortcutOverrides(storage: Storage = localStorage): void {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw) shortcuts.applyOverrides(JSON.parse(raw))
  } catch {
    // Private mode / blocked storage / corrupt JSON — start from defaults.
  }
}

/** Write the current snapshot (call after any change; swallows storage errors). */
export function saveShortcutOverrides(storage: Storage = localStorage): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(shortcuts.getOverrides()))
  } catch {
    // Storage unavailable — overrides simply don't persist this session.
  }
}
