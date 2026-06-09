/** Shared types + helpers for the per-component docs (one file per component). */

export interface PropDoc {
  name: string;
  type: string;
  default?: string;
  desc: string;
}

export interface ComponentDoc {
  /** Exported component name (as imported from `dssoca`). */
  name: string;
  /** URL slug under /components/. */
  slug: string;
  /** One-line summary. */
  tagline: string;
  /** Short paragraph for the page intro. */
  description: string;
  /** Storybook story id embedded as the live demo. */
  storyId: string;
  /** Minimal usage snippet (Svelte). */
  usage: string;
  /** Public props. */
  props: PropDoc[];
  /** Optional extra notes (a11y, behaviour). */
  notes?: string;
}

export const SIZE_PROP: PropDoc = {
  name: 'size',
  type: "'sm' | 'md' | 'lg'",
  desc: 'Per-instance size override; inherits the ancestor `data-size-variant` when unset.',
};
