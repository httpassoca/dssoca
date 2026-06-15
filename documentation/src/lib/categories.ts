/**
 * Component categories — single source of truth for the components overview
 * page (`/components`). Each component belongs to exactly one category; the
 * `categories.test.ts` invariant keeps this in lock-step with `COMPONENTS`.
 */
import { COMPONENTS } from './docs.config'
import type { ComponentDoc } from './docs.config'

export interface Category {
  id: string
  label: string
  /** Component slugs in this category, in display order. */
  slugs: string[]
}

export const CATEGORIES: Category[] = [
  {
    id: 'forms',
    label: 'Forms & controls',
    slugs: [
      'button',
      'input',
      'textarea',
      'segmented-control',
      'select',
      'date-field',
      'number-field',
      'file-drop',
      'switch',
    ],
  },
  {
    id: 'navigation',
    label: 'Navigation',
    slugs: ['sidebar', 'topbar', 'bottom-nav', 'menu', 'link', 'pagination'],
  },
  { id: 'layout', label: 'Layout', slugs: ['card', 'accordion', 'container', 'heading'] },
  {
    id: 'data',
    label: 'Data display',
    slugs: ['badge', 'metric-tile', 'service-card', 'sparkline', 'log-stream', 'table', 'chart'],
  },
  {
    id: 'feedback',
    label: 'Feedback',
    slugs: ['toaster', 'empty-state', 'spinner', 'modal', 'tooltip'],
  },
  { id: 'media', label: 'Media', slugs: ['icon', 'image', 'avatar'] },
]

export interface CategorizedComponents {
  category: Category
  components: ComponentDoc[]
}

/** Resolve each category's slugs to their `ComponentDoc`s, preserving order. */
export function componentsByCategory(): CategorizedComponents[] {
  return CATEGORIES.map((category) => ({
    category,
    components: category.slugs
      .map((slug) => COMPONENTS.find((c) => c.slug === slug))
      .filter((c): c is ComponentDoc => Boolean(c)),
  }))
}
