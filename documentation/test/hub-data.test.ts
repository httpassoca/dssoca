import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ALL_SLUGS, buildTilePool, V, BLEED, CYCLE_MIN, CYCLE_MAX } from '../src/lib/hub-data';
import { COMPONENTS } from '../src/lib/docs.config';

const slugs = new Set(COMPONENTS.map((c) => c.slug));
const read = (p: string) => readFileSync(resolve(process.cwd(), p), 'utf8');

describe('HubTile.svelte — cycling + entrance + a11y contract', () => {
  const src = read('src/lib/components/HubTile.svelte');

  it('each tile owns an independent random cycler (not the parent measure)', () => {
    expect(src).toMatch(/let vi\s*=\s*\$state\(0\)/);
    expect(src).toMatch(/setTimeout\(tick,\s*delay\(\)\)/);
    expect(src).toMatch(/CYCLE_MIN\s*\+\s*Math\.random\(\)/);
  });

  it('crossfades each value change (the "alive" transition)', () => {
    expect(src).toContain('{#key vi}');
    expect(src).toMatch(/in:fade=/);
    expect(src).toMatch(/out:fade=/);
  });

  it('fades + scales in on mount, staggered, and freezes under reduced motion', () => {
    expect(src).toMatch(/@keyframes tile-in/);
    expect(src).toMatch(/animation:\s*tile-in/);
    expect(src).toMatch(/--enter-delay/);
    expect(src).toMatch(/prefers-reduced-motion:\s*reduce[\s\S]*animation:\s*none/);
  });

  it('default tile opacity is 0.2', () => {
    expect(src).toMatch(/\.tile\s*\{[\s\S]*?opacity:\s*0\.2;/);
  });

  it('does not render the image component on the landing', () => {
    expect(src).not.toContain("slug === 'image'");
    expect(src).not.toContain('<img');
  });

  it('marks the component wrapper inert (focusables out of tab order/a11y tree)', () => {
    expect(src).toMatch(/class="inner"\s+inert/);
  });

  it('freezes the LogStream tile under reduced motion + drives Accordion by value', () => {
    expect(src).toMatch(/\{#if reduced\}<LogStream lines=/);
    expect(src).toContain('<Accordion items={accItems} value={v.open}>');
  });
});

describe('hub-data (landing field)', () => {
  it('ALL_SLUGS is every real component except image', () => {
    const expected = [...slugs].filter((s) => s !== 'image').sort();
    expect([...ALL_SLUGS].sort()).toEqual(expected);
    expect(ALL_SLUGS).not.toContain('image');
    expect(new Set(ALL_SLUGS).size).toBe(ALL_SLUGS.length); // no dupes
  });

  it('buildTilePool fills with n real slugs and shows every field component', () => {
    const pool = buildTilePool(64);
    expect(pool).toHaveLength(64);
    for (const slug of pool) expect(slugs.has(slug), slug).toBe(true);
    const shown = new Set(pool);
    for (const s of ALL_SLUGS) expect(shown.has(s), s).toBe(true);
    expect(shown.has('image')).toBe(false); // image never appears in the field
  });

  it('buildTilePool respects small sizes', () => {
    expect(buildTilePool(5)).toHaveLength(5);
    expect(buildTilePool(0)).toHaveLength(0);
  });

  it('every variant-pool key is a real component slug, with rich content pools', () => {
    // These cycle a fixed, inherently small set (an active id / a few options) or
    // self-animate; the rest are the content tiles we want lots of variety on.
    const limited = new Set([
      'log-stream', 'segmented-control', 'accordion', 'sidebar', 'topbar', 'bottom-nav',
    ]);
    for (const key of Object.keys(V)) {
      expect(slugs.has(key), key).toBe(true);
      if (!limited.has(key)) expect(V[key].length, key).toBeGreaterThanOrEqual(5);
    }
  });

  it('BLEED entries are real component slugs', () => {
    for (const s of BLEED) expect(slugs.has(s), s).toBe(true);
  });

  it('cycle cadence is the requested 0.5–2s window', () => {
    expect(CYCLE_MIN).toBe(500);
    expect(CYCLE_MAX).toBe(2000);
  });
});
