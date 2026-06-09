import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// `pnpm docs:test` runs with cwd = documentation/, so paths are relative to it.
const read = (p: string) => readFileSync(resolve(process.cwd(), p), 'utf8');

describe('branding — no personal-name logo references', () => {
  it('chrome references the dssoca-logo, never passoca-logo', () => {
    for (const f of ['src/app.html', 'src/routes/+layout.svelte', 'src/routes/+page.svelte']) {
      expect(read(f), f).not.toContain('passoca-logo');
    }
  });

  it('the dssoca-logo.svg asset exists', () => {
    expect(() => read('static/dssoca-logo.svg')).not.toThrow();
  });
});
