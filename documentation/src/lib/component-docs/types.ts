/** Shared types + helpers for the per-component docs (one file per component). */

export interface PropDoc {
  name: string
  type: string
  default?: string
  desc: string
}

/**
 * Plain-HTML example (DS-0148). The docs build server-renders the real component with these
 * props and shows the resulting markup on the component page, so the snippet can never drift
 * from what the component actually emits. Everything here must be plain, serialisable data.
 */
export interface HtmlExample {
  /** Component props (no functions, no snippets). */
  props?: Record<string, unknown>
  /** Raw HTML rendered as the default `children` snippet. */
  children?: string
  /** Raw HTML for other snippet-typed props (`footer`, `panel`, …). */
  snippets?: Record<string, string>
  /** `js` when `dssoca/vanilla.js` adds behaviour to this markup; `css` when it is static. */
  behaviour: 'js' | 'css'
  /** Short note shown under the snippet (what the JS does, or what to wire yourself). */
  note?: string
}

export interface ComponentDoc {
  /** Exported component name (as imported from `dssoca`). */
  name: string
  /** URL slug under /components/. */
  slug: string
  /** One-line summary. */
  tagline: string
  /** Short paragraph for the page intro. */
  description: string
  /** Storybook story id embedded as the live demo. */
  storyId: string
  /** Minimal usage snippet (Svelte). */
  usage: string
  /** Public props. */
  props: PropDoc[]
  /** Optional extra notes (a11y, behaviour). */
  notes?: string
  /** Optional related guide page, rendered as a link under the notes. */
  guide?: { href: string; label: string }
  /** Plain-HTML example rendered at build time (see the "Plain HTML & CSS" guide). */
  htmlExample: HtmlExample
}

export const SIZE_PROP: PropDoc = {
  name: 'size',
  type: "'sm' | 'md' | 'lg'",
  desc: 'Per-instance size override; inherits the ancestor `data-size-variant` when unset.',
}
