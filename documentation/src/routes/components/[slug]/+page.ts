import { error } from '@sveltejs/kit';
import { COMPONENTS, getComponent } from '$lib/docs.config';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

// Enumerate every component slug so adapter-static prerenders one page each.
export const entries: EntryGenerator = () => COMPONENTS.map((c) => ({ slug: c.slug }));

export const load: PageLoad = ({ params }) => {
  const doc = getComponent(params.slug);
  if (!doc) error(404, `Unknown component: ${params.slug}`);
  return { doc };
};
