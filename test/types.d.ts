/**
 * Ambient test types (DS-0076).
 *
 * vitest-axe exports its `AxeMatchers` interface but does NOT augment vitest's
 * `Assertion` itself (the matcher is registered at runtime in `test/setup.ts`
 * via `expect.extend`). Without this augmentation svelte-check reports
 * "Property 'toHaveNoViolations' does not exist" in every a11y test.
 */
import type { AxeMatchers } from 'vitest-axe'

declare module 'vitest' {
  // Type parameters must mirror vitest's own `Assertion<T = any>` declaration.
  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars */
  interface Assertion<T = any> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars */
}
