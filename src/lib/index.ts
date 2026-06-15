export {
  type ColorTheme,
  type Size,
  type DesignConfig,
  defaultDesignConfig,
  getDesignConfig,
  designAttributes,
  applyDesignConfig,
  resolveComponentSize,
} from './config.js'

export {
  dssocaConfig,
  type DssocaConfig,
  type DesignAxis,
  type ComponentName,
  type ComponentsSize,
} from './dssoca.config.js'

export { default as Icon, registerIcon, type IconName } from './components/Icon.svelte'
export { default as Badge } from './components/Badge.svelte'
export { default as Button } from './components/Button.svelte'
export { default as Input } from './components/Input.svelte'
export { default as Card } from './components/Card.svelte'
export { default as Sparkline } from './components/Sparkline.svelte'
export { default as ServiceCard } from './components/ServiceCard.svelte'
export { default as MetricTile } from './components/MetricTile.svelte'
export { default as Topbar } from './components/Topbar.svelte'
export { type TopbarTab, type TopbarServices } from './components/Topbar.svelte'
export { default as Sidebar } from './components/Sidebar.svelte'
export { type SideItem, type SideGroup, type SideStatus } from './components/Sidebar.svelte'
export { default as LogStream, type LogLevel, type LogLine } from './components/LogStream.svelte'
export { default as Toaster } from './components/Toaster.svelte'
export { default as EmptyState } from './components/EmptyState.svelte'

// New components ported from the source website (DS-0043). Each line is the
// single, complete public surface for that component, so the per-component
// implementation PRs (DS-0050…0055) need not edit this barrel.
export { default as Menu, type MenuItem } from './components/Menu.svelte'
export { default as Accordion, type AccordionItem } from './components/Accordion.svelte'
export { default as Link } from './components/Link.svelte'
export {
  default as SegmentedControl,
  type SegmentOption,
} from './components/SegmentedControl.svelte'
export { default as BottomNav, type BottomNavItem } from './components/BottomNav.svelte'
export { default as Image, type ImageSource } from './components/Image.svelte'

// Adoption-gap components from the passoca migration (DS-0079).
export { default as Heading } from './components/Heading.svelte'
export { default as Container } from './components/Container.svelte'
export { default as Textarea } from './components/Textarea.svelte'
export {
  default as Spinner,
  SPINNER_VARIANTS,
  SPINNER_VARIANT_NAMES,
} from './components/Spinner.svelte'
export type { SpinnerVariant, SpinnerFrames } from './components/Spinner.svelte'

// geossoca component gaps (DS-0090).
export { default as Chart, type ChartSeries, type ChartPoint } from './components/Chart.svelte'
export { default as Table, type TableColumn, type TableSort } from './components/Table.svelte'
export { default as Select } from './components/Select.svelte'
export type { SelectOption, SelectOptGroup } from './components/Select.svelte'
export { default as Modal } from './components/Modal.svelte'

export {
  toast,
  toasts,
  type Toast,
  type ToastKind,
  type ToastAction,
  type ToastOptions,
  type ToastPatch,
  type PromiseMessages,
} from './toast.svelte.js'
