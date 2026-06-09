import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CATEGORIES, componentsByCategory } from '../src/lib/categories';
import { COMPONENTS } from '../src/lib/docs.config';

describe('components overview — a11y contract', () => {
  // The previews render real, focusable controls; the whole card is the link.
  // `inert` must keep them out of the tab order + a11y tree (jsdom/axe can't
  // run here, so lock the contract at the source).
  it('marks the preview stage inert', () => {
    const src = readFileSync(
      resolve(process.cwd(), 'src/routes/components/+page.svelte'),
      'utf8',
    );
    expect(src).toMatch(/class="stage"[^>]*\binert\b/);
  });
});

describe('component categories', () => {
  it('covers every component exactly once', () => {
    const categorised = CATEGORIES.flatMap((c) => c.slugs).sort();
    const all = COMPONENTS.map((c) => c.slug).sort();
    expect(categorised).toEqual(all);
    // no slug appears in two categories
    expect(new Set(categorised).size).toBe(categorised.length);
  });

  it('every category slug resolves to a real component', () => {
    const known = new Set(COMPONENTS.map((c) => c.slug));
    for (const cat of CATEGORIES) {
      for (const slug of cat.slugs) expect(known.has(slug), `${cat.id} → ${slug}`).toBe(true);
    }
  });

  it('componentsByCategory() resolves docs in order, losing none', () => {
    const grouped = componentsByCategory();
    expect(grouped.map((g) => g.category.id)).toEqual(CATEGORIES.map((c) => c.id));
    const total = grouped.reduce((n, g) => n + g.components.length, 0);
    expect(total).toBe(COMPONENTS.length);
    for (const g of grouped) {
      expect(g.components.map((c) => c.slug)).toEqual(g.category.slugs);
    }
  });
});
