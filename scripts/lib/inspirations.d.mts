/** Type surface of `inspirations.mjs` for the vitest guard (`test/unit/inspirations.test.ts`). */
export const INSPIRATIONS_DIR: string
export const OUT_DIR: string
export const DIST_DIR: string
export const VENDOR: string
export const STATIC_FONTS_DIR: string
export function relocateFontUrls(css: string): string
export function listInspirations(root?: string): string[]
export function vendorFiles(dist?: string): string[]
