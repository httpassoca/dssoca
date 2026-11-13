/**
 * Server-only access to the repo-root CHANGELOG.md (DS-0196). The file is inlined at build time
 * (`?raw`), parsed once, and handed to the prerendered pages as plain data — the Markdown and the
 * parser never reach the client bundle.
 */
import raw from '../../../../CHANGELOG.md?raw'
import {
  parseChangelog,
  renderInline,
  refUrl,
  releaseId,
  type ChangeType,
  type ChangelogRelease,
} from '../changelog'
import { componentChangelog } from '../component-changelog'
import { COMPONENTS } from '../docs.config'
import type { ComponentDoc } from '../component-docs/types'

export const RELEASES: ChangelogRelease[] = parseChangelog(raw)

/** A release as the `/changelog` page renders it: inline Markdown already turned into HTML. */
export interface ReleaseView {
  version: string
  id: string
  title?: string
  date?: string
  url?: string
  intro: string[]
  sections: { heading: string; type?: ChangeType; paragraphs: string[]; items: string[] }[]
}

export function releaseViews(): ReleaseView[] {
  return RELEASES.map((r) => ({
    version: r.version,
    id: r.id,
    title: r.title,
    date: r.date,
    url: r.url,
    intro: r.intro.map(renderInline),
    sections: r.sections.map((s) => ({
      heading: s.heading,
      type: s.type,
      paragraphs: s.paragraphs.map(renderInline),
      items: s.items.map(renderInline),
    })),
  }))
}

/** One release of a component's history, ready to render. */
export interface ComponentReleaseView {
  version: string
  /** Anchor of this release on `/changelog`, when the changelog has an entry for it. */
  href?: string
  date?: string
  changes: {
    type: ChangeType
    html: string
    breaking: boolean
    refs: { label: string; url?: string }[]
  }[]
}

export function componentChangelogView(doc: ComponentDoc): ComponentReleaseView[] {
  const names = COMPONENTS.map((c) => c.name)
  const known = new Set(RELEASES.map((r) => r.id))
  return componentChangelog(doc, RELEASES, names).map((r) => {
    const id = releaseId(r.version)
    return {
      version: r.version,
      href: known.has(id) ? `/changelog/#${id}` : undefined,
      date: r.date,
      changes: r.changes.map((c) => ({
        type: c.type,
        html: renderInline(c.text),
        breaking: !!c.breaking,
        refs: (c.refs ?? []).map((label) => ({ label, url: refUrl(label) })),
      })),
    }
  })
}
