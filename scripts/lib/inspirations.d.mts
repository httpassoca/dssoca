/** Type surface of `inspirations.mjs` for the vitest guard (`test/unit/inspirations.test.ts`). */
export const INSPIRATIONS_DIR: string
export const OUT_DIR: string
export const DIST_DIR: string
export const VENDOR: string
export const STATIC_FONTS_DIR: string
export function relocateFontUrls(css: string): string
export function listInspirations(root?: string): string[]
export function vendorFiles(dist?: string): string[]

// DS-0158 — the gallery manifest and the build-time card renderer.
export interface InspirationEntry {
  slug: string
  title: string
  kind: string
  blurb: string
  components: string[]
}
export const MANIFEST_FILE: string
export const GALLERY_MARKER: string
export function loadManifest(file?: string): InspirationEntry[]
export function thumbAlt(entry: Pick<InspirationEntry, 'title'>): string
export function renderGalleryCard(entry: InspirationEntry): string
export function renderGallery(html: string, manifest: InspirationEntry[]): string
