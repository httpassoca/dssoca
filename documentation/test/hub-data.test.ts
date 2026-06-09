import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ALL_SLUGS, buildTilePool, V, BLEED, grad, CYCLE_MIN, CYCLE_MAX } from '../src/lib/hub-data';
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
  it('ALL_SLUGS is exactly the set of real components', () => {
    expect([...ALL_SLUGS].sort()).toEqual([...slugs].sort());
    expect(new Set(ALL_SLUGS).size).toBe(ALL_SLUGS.length); // no dupes
  });

  it('buildTilePool returns n real slugs and shows every component (when n is large)', () => {
    const pool = buildTilePool(64);
    expect(pool).toHaveLength(64);
    for (const slug of pool) expect(slugs.has(slug), slug).toBe(true);
    const shown = new Set(pool);
    for (const c of COMPONENTS) expect(shown.has(c.slug), c.slug).toBe(true);
  });

  it('buildTilePool respects small sizes', () => {
    expect(buildTilePool(5)).toHaveLength(5);
    expect(buildTilePool(0)).toHaveLength(0);
  });

  it('every variant-pool key is a real component slug', () => {
    for (const key of Object.keys(V)) expect(slugs.has(key), key).toBe(true);
  });

  it('BLEED entries are real component slugs', () => {
    for (const s of BLEED) expect(slugs.has(s), s).toBe(true);
  });

  it('cycle cadence is the requested 0.5–2s window', () => {
    expect(CYCLE_MIN).toBe(500);
    expect(CYCLE_MAX).toBe(2000);
  });

  it('grad() builds a valid inline svg data URI', () => {
    const u = grad('#000000', '#ffffff');
    expect(u.startsWith('data:image/svg+xml')).toBe(true);
    expect(decodeURIComponent(u)).toContain('<svg');
  });
});
