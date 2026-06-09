/** Assembles the per-component docs into the COMPONENTS list (original order). */
import type { ComponentDoc } from './types';
import { icon } from './icon';
import { badge } from './badge';
import { button } from './button';
import { input } from './input';
import { card } from './card';
import { sparkline } from './sparkline';
import { serviceCard } from './service-card';
import { metricTile } from './metric-tile';
import { topbar } from './topbar';
import { sidebar } from './sidebar';
import { logStream } from './log-stream';
import { toaster } from './toaster';
import { emptyState } from './empty-state';

export type { PropDoc, ComponentDoc } from './types';

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
];
