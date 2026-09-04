/**
 * Server-side renderer for the per-component plain-HTML snippets (DS-0148).
 *
 * Runs at prerender time (from `+page.server.ts`) and in the docs test suite. It renders the
 * REAL component with `svelte/server` and cleans the output into the exact markup a plain-HTML
 * page should use with `dssoca/vanilla.css`: hydration markers and scoping hashes removed, then
 * a few vanilla-only hooks added (`data-ss-*`, empty spinner frame) — so the snippet can never
 * drift from the component. Never import this from client code.
 */
import { render } from 'svelte/server'
import { createRawSnippet, type Component } from 'svelte'
import * as lib from 'dssoca'
import type { ComponentDoc, HtmlExample } from '$lib/component-docs/types'
import { formatHtml } from '$lib/html-format'

const raw = (html: string) => createRawSnippet(() => ({ render: () => html }))

/** Strip Svelte's SSR artefacts: hydration comments, scoping hashes, empty class attributes. */
export function cleanSvelteHtml(html: string): string {
  return (
    html
      .replace(/<!--[\s\S]*?-->/g, '')
      // Drop `svelte-<hash>` classes (they may be the only class on an element).
      .replace(/ class="([^"]*)"/g, (_m, cls: string) => {
        const kept = cls.split(/\s+/).filter((c) => c && !/^svelte-[a-z0-9]+$/.test(c))
        return kept.length ? ` class="${kept.join(' ')}"` : ''
      })
      // Svelte's SSR event-capture hooks for hydration (`onload="this.__e=event"`).
      .replace(/ on[a-z]+="this\.__e=event"/g, '')
  )
}

/** Vanilla-only additions the Svelte DOM has no reason to carry. */
const FIXUPS: Record<string, (html: string, ex: HtmlExample) => string> = {
  modal: (html) =>
    `<button class="ss-btn secondary" type="button" data-ss-modal="#confirm">open</button>\n` +
    html
      .replace('<dialog', '<dialog id="confirm"')
      .replace('class="close"', 'class="close" data-ss-dismiss'),
  spinner: (html, ex) =>
    html
      .replace('class="ss-spinner"', `class="ss-spinner" data-variant="${ex.props?.variant}"`)
      .replace(/(<span class="frame"[^>]*>)[^<]*(<\/span>)/, '$1$2'),
  'segmented-control': (html, ex) => {
    const options = (ex.props?.options ?? []) as Array<{ value: string }>
    let i = 0
    return html.replace(/<button([^>]*class="segment[^>]*)>/g, (m, attrs) => {
      const v = options[i++]?.value
      return v == null ? m : `<button${attrs} data-value="${v}">`
    })
  },
  icon: (html) =>
    `<!-- with vanilla.js: --><span data-ss-icon="check" data-size="sm"></span>\n<!-- rendered: -->\n${html}`,
}

export function renderHtmlExample(doc: ComponentDoc): string {
  const ex = doc.htmlExample
  const Comp = (lib as unknown as Record<string, Component>)[doc.name]
  if (!Comp) throw new Error(`html-example: dssoca has no export named "${doc.name}"`)
  const props: Record<string, unknown> = { ...ex.props }
  if (ex.children != null) props.children = raw(ex.children)
  for (const [k, html] of Object.entries(ex.snippets ?? {})) props[k] = raw(html)
  const { body } = render(Comp, { props, idPrefix: doc.slug })
  const cleaned = cleanSvelteHtml(body)
  const fixed = FIXUPS[doc.slug]?.(cleaned, ex) ?? cleaned
  return formatHtml(fixed)
}
