/**
 * `dssoca/vanilla.js` (DS-0148) — small, dependency-free behaviours for the plain-HTML
 * consumption path. Importing this module wires every behaviour once via document-level event
 * delegation (so markup added later just works) and runs `mount()` when the DOM is ready.
 *
 *   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/dssoca@0.17/dist/theme.css">
 *   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/dssoca@0.17/dist/vanilla.css">
 *   <script type="module" src="https://cdn.jsdelivr.net/npm/dssoca@0.17/dist/vanilla/index.js"></script>
 *
 * Call `mount(root)` after injecting HTML that contains `[data-ss-icon]` placeholders or
 * autosizing textareas. Nothing here imports Svelte or a `.svelte` module.
 */
import { installModal } from './modal.js'
import { installAccordion } from './accordion.js'
import { installMenu } from './menu.js'
import { installTooltip } from './tooltip.js'
import { installSwitch } from './switch.js'
import { installSegmented } from './segmented.js'
import { installFields, mountFields } from './fields.js'
import { hydrateIcons } from './icons.js'

export { toast, toasts } from './toast.js'
export type {
  Toast,
  ToastKind,
  ToastOptions,
  ToastPatch,
  ToastAction,
  PromiseMessages,
} from './toast.js'
export { iconSvg, hydrateIcons, type IconOptions } from './icons.js'
export { registerIcon, type IconName } from '../icons.js'
export { openModal, closeModal } from './modal.js'
export { toggleAccordion } from './accordion.js'
export { openMenu, closeMenu } from './menu.js'
export { showTooltip, hideTooltip } from './tooltip.js'
export { toggleSwitch } from './switch.js'
export { selectSegment } from './segmented.js'
export { clearInput, nudgeNumber, autosize } from './fields.js'
export {
  applyDesignConfig,
  designAttributes,
  getDesignConfig,
  paletteToCss,
  type DesignConfig,
  type ColorTheme,
  type Size,
} from '../config.js'

/** Hydrate icon placeholders and initialise setup-type behaviours under `root`. */
export function mount(root: ParentNode = document): void {
  hydrateIcons(root)
  mountFields(root)
}

const FLAG = '__dssocaVanilla'

/** Register every delegated behaviour once per document. Safe to call repeatedly. */
export function install(): void {
  if (typeof document === 'undefined') return
  const doc = document as Document & { [FLAG]?: boolean }
  if (doc[FLAG]) return
  doc[FLAG] = true
  installModal()
  installAccordion()
  installMenu()
  installTooltip()
  installSwitch()
  installSegmented()
  installFields()
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => mount(), { once: true })
  } else {
    mount()
  }
}

install()
