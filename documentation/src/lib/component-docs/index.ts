/** Assembles the per-component docs into the COMPONENTS list (original order). */
import type { ComponentDoc } from './types'
import { icon } from './icon'
import { badge } from './badge'
import { button } from './button'
import { input } from './input'
import { card } from './card'
import { sparkline } from './sparkline'
import { serviceCard } from './service-card'
import { metricTile } from './metric-tile'
import { topbar } from './topbar'
import { sidebar } from './sidebar'
import { logStream } from './log-stream'
import { toaster } from './toaster'
import { emptyState } from './empty-state'
// New components ported from the source website (DS-0043).
import { menu } from './menu'
import { accordion } from './accordion'
import { link } from './link'
import { segmentedControl } from './segmented-control'
import { bottomNav } from './bottom-nav'
import { image } from './image'
// DS-0079 — adoption-gap components.
import { heading } from './heading'
import { container } from './container'
import { textarea } from './textarea'
import { spinner } from './spinner'
// geossoca component gaps (DS-0090).
import { chart } from './chart'
import { table } from './table'
import { select } from './select'
import { modal } from './modal'
import { dateField } from './date-field'
import { fileDrop } from './file-drop'
import { numberField } from './number-field'

export type { PropDoc, ComponentDoc } from './types'

export const COMPONENTS: ComponentDoc[] = [
  icon,
  badge,
  button,
  input,
  card,
  sparkline,
  serviceCard,
  metricTile,
  topbar,
  sidebar,
  logStream,
  toaster,
  emptyState,
  // DS-0043 — website-derived components.
  menu,
  accordion,
  link,
  segmentedControl,
  bottomNav,
  image,
  // DS-0079 — adoption-gap components.
  heading,
  container,
  textarea,
  spinner,
  // DS-0090 — geossoca component gaps.
  chart,
  table,
  select,
  modal,
  dateField,
  fileDrop,
  numberField,
]
