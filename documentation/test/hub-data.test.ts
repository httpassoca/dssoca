import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { TILES, V, BLEED, grad } from '../src/lib/hub-data';
import { COMPONENTS } from '../src/lib/docs.config';

const slugs = new Set(COMPONENTS.map((c) => c.slug));

describe('Hub.svelte — a11y + motion contract', () => {
  const src = readFileSync(resolve(process.cwd(), 'src/lib/components/Hub.svelte'), 'utf8');

  it('marks the component wrapper inert (focusables out of tab order/a11y tree)', () => {
    expect(src).toMatch(/class="inner"\s+inert/);
  });

  it('freezes the LogStream tile under reduced motion (static lines, not demo)', () => {
    expect(src).toMatch(/\{#if reduced\}<LogStream lines=/);
  });

  it('drives the Accordion tile via controlled `value` so cycling actually toggles', () => {
    expect(src).toContain('<Accordion items={accItems} value={v.open}>');
    expect(src).not.toContain('defaultValue={v.open}');
  });
});

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
