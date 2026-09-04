import { error } from '@sveltejs/kit'
import { COMPONENTS, getComponent } from '$lib/docs.config'
import { renderHtmlExample } from '$lib/server/html-example'
import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = true

// Enumerate every component slug so adapter-static prerenders one page each.
export const entries: EntryGenerator = () => COMPONENTS.map((c) => ({ slug: c.slug }))

// A *server* load (DS-0148): the plain-HTML snippet is produced by rendering the real
// component with `svelte/server`, which must never reach the client bundle. Prerendering
// bakes the result into the page data, so client-side navigation keeps working.
export const load: PageServerLoad = ({ params }) => {
  const doc = getComponent(params.slug)
  if (!doc) error(404, `Unknown component: ${params.slug}`)
  return { doc, html: renderHtmlExample(doc) }
}
