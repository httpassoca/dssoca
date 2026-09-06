/**
 * Tiny document-level event delegation (DS-0148). Every vanilla behaviour listens once on
 * `document` and resolves its target with `closest()`, so markup injected after load keeps
 * working without a MutationObserver.
 */

type Listener<K extends keyof DocumentEventMap> = (
  target: HTMLElement,
  e: DocumentEventMap[K],
) => void

export function on<K extends keyof DocumentEventMap>(
  type: K,
  selector: string,
  handler: Listener<K>,
  options?: AddEventListenerOptions,
): void {
  document.addEventListener(
    type,
    (e) => {
      const t = e.target
      if (!(t instanceof Element)) return
      const target = t.closest<HTMLElement>(selector)
      if (target) handler(target, e as DocumentEventMap[K])
    },
    options,
  )
}

/** Dispatch a bubbling `ss:*` CustomEvent so consumer code can react to a behaviour. */
export function emit<T>(el: Element, name: `ss:${string}`, detail: T): void {
  el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }))
}

/** Wrap-around modulo for roving focus. */
export function wrap(i: number, n: number): number {
  return ((i % n) + n) % n
}

/** All matching descendants as a real array. */
export function all<E extends Element = HTMLElement>(root: ParentNode, selector: string): E[] {
  return Array.from(root.querySelectorAll<E>(selector))
}

/** Resolve an `aria-controls` / `#id` reference, preferring the nearest root. */
export function byId(id: string | null): HTMLElement | null {
  if (!id) return null
  return document.getElementById(id.startsWith('#') ? id.slice(1) : id)
}
