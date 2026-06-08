import { describe, it, expect } from 'vitest';
import { highlight, langClass } from '../src/lib/highlight';

describe('highlight', () => {
  it('emits Prism token spans for a known language', () => {
    const out = highlight("import { Button } from 'dssoca'", 'ts');
    expect(out).toContain('class="token');
    expect(out).toContain('keyword');
  });

  it('highlights svelte fences', () => {
    const out = highlight('<Button variant="primary">go</Button>', 'svelte');
    expect(out).toContain('class="token');
  });

  it('falls back to escaped, untokenised text for unknown languages', () => {
    const out = highlight('a < b && c > d', 'made-up-lang');
    expect(out).not.toContain('class="token');
    expect(out).toContain('&lt;');
    expect(out).toContain('&gt;');
    expect(out).toContain('&amp;');
  });

  it('resolves language aliases for the class name', () => {
    expect(langClass('ts')).toBe('typescript');
    expect(langClass('js')).toBe('javascript');
    expect(langClass('sh')).toBe('bash');
    expect(langClass('svelte')).toBe('svelte');
    expect(langClass(undefined)).toBe('none');
  });
});
