/**
 * Hand-written declarations for palette.mjs (the module stays dependency-free
 * plain JS so Node can run it directly; consumers get real types from here).
 */

export interface Oklch {
  l: number
  c: number
  h: number
}

export type ThemeMode = 'dark' | 'light'
export type SlotHexMap = Record<string, string>

export interface DerivedPalette {
  dark: SlotHexMap
  light: SlotHexMap
}

export interface DeriveOptions {
  /** Seed hex — becomes the dark accent verbatim. */
  accent: string
  /** 0..1 lean of the 6 ANSI hues toward the seed hue (default 0.35). */
  tint?: number
  /** Scale on the neutral tint strength; 0 = grayscale neutrals (default 1). */
  neutralChroma?: number
}

export function parseHex(hex: string): [number, number, number] | null
export function rgbToHex(rgb: [number, number, number] | number[]): string
export function rgbToOklch(rgb: [number, number, number] | number[]): Oklch
export function hexToOklch(hex: string): Oklch
export function clampToSrgbGamut(c: Oklch): Oklch
export function oklchToHex(c: Oklch): string
export function contrastHex(a: string, b: string): number
export function mixHueDeg(a: number, b: number, t: number): number
export function hueDistDeg(a: number, b: number): number
export function mixOklab(a: Oklch, b: Oklch, u: number): Oklch

export const SLOT_ORDER: string[]
export function slotToCssVar(slot: string): string
export const ANSI_ANCHORS: Record<string, number>
export const RED_GREEN_MIN_DEG: number
export const ADJACENT_MIN_DEG: number
export const DEFAULT_SEED: string
export const BRAND_PINS: { dark: Record<string, string>; light: Record<string, string> }

export function derivePalette(opts: DeriveOptions): DerivedPalette

export const GEN_BEGIN: string
export const GEN_END: string
export function emitTokensRegion(palette: DerivedPalette, opts?: { seed?: string }): string
