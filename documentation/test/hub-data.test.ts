import { describe, it, expect } from 'vitest';
import { TILES, V, BLEED, grad } from '../src/lib/hub-data';
import { COMPONENTS } from '../src/lib/docs.config';

const slugs = new Set(COMPONENTS.map((c) => c.slug));

describe('hub-data (landing field)', () => {
  it('every tile references a real component slug', () => {
    for (const slug of TILES) expect(slugs.has(slug), slug).toBe(true);
  });

  it('every variant-pool key is a real component slug', () => {
    for (const key of Object.keys(V)) expect(slugs.has(key), key).toBe(true);
  });

  it('shows every component at least once', () => {
    const shown = new Set(TILES);
    for (const c of COMPONENTS) expect(shown.has(c.slug), c.slug).toBe(true);
  });

  it('BLEED entries are real component slugs', () => {
    for (const s of BLEED) expect(slugs.has(s), s).toBe(true);
  });

  it('grad() builds a valid inline svg data URI', () => {
    const u = grad('#000000', '#ffffff');
    expect(u.startsWith('data:image/svg+xml')).toBe(true);
    expect(decodeURIComponent(u)).toContain('<svg');
  });
});
