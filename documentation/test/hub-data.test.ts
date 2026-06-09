import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ALL_SLUGS, buildTilePool, V, BLEED, PICSUM, CYCLE_MIN, CYCLE_MAX } from '../src/lib/hub-data';
import { COMPONENTS } from '../src/lib/docs.config';

const slugs = new Set(COMPONENTS.map((c) => c.slug));
const read = (p: string) => readFileSync(resolve(process.cwd(), p), 'utf8');

describe('HubTile.svelte — cycling + a11y + motion contract', () => {
  const src = read('src/lib/components/HubTile.svelte');

  it('each tile owns an independent random cycler (not the parent measure)', () => {
    // a local $state variant index advanced by a self-rescheduling timeout
    expect(src).toMatch(/let vi\s*=\s*\$state\(0\)/);
    expect(src).toMatch(/setTimeout\(tick,\s*delay\(\)\)/);
    expect(src).toMatch(/CYCLE_MIN\s*\+\s*Math\.random\(\)/);
  });

  it('crossfades each value change (the "alive" transition)', () => {
    expect(src).toContain('{#key vi}');
    expect(src).toMatch(/in:fade=/);
    expect(src).toMatch(/out:fade=/);
  });

  it('freezes the cycler + crossfade under reduced motion', () => {
    expect(src).toMatch(/if\s*\(reduced\s*\|\|\s*pool\.length\s*<\s*2\)\s*return/);
    expect(src).toMatch(/reduced\s*\?\s*0\s*:\s*240/); // crossfade duration → 0 under reduce
    expect(src).toMatch(/\{#if reduced\}<LogStream lines=/); // log tile static under reduce
  });

  it('marks the component wrapper inert (focusables out of tab order/a11y tree)', () => {
    expect(src).toMatch(/class="inner"\s+inert/);
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

  it('image tiles use random internet images (Picsum)', () => {
    for (const variant of V.image) expect(String(variant.src)).toContain('picsum.photos');
    expect(PICSUM('x')).toBe('https://picsum.photos/seed/x/480/300');
  });

  it('BLEED entries are real component slugs', () => {
    for (const s of BLEED) expect(slugs.has(s), s).toBe(true);
  });

  it('cycle cadence is the requested 0.5–2s window', () => {
    expect(CYCLE_MIN).toBe(500);
    expect(CYCLE_MAX).toBe(2000);
  });
});
