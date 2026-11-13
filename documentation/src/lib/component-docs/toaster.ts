import { type ComponentDoc, SIZE_PROP } from './types'

export const toaster: ComponentDoc = {
  name: 'Toaster',
  slug: 'toaster',
  htmlExample: {
    props: { position: 'top-right' },
    behaviour: 'js',
    note: 'Optional: place this container (with its two `.live` regions) to choose the position; otherwise toast.success(…) from vanilla.js creates one, adding any missing live region. Toasts render into it and mirror their message into the live regions.',
  },
  tagline: 'Toast notification host.',
  description:
    'Mount once near the app root; drive it imperatively with the `toast` API. The stack anchors at one of six `position`s, supports swipe-to-dismiss, pause-on-hover/focus, an inline action button, and announces through two always-present live regions (polite + assertive). This page is the canonical reference for the whole toast API: every `toast.*` method and the `toasts` store.',
  storyId: 'components-toaster--playground',
  usage: `<script>
  import { Toaster, toast, toasts } from 'dssoca';

  // ── one call per kind ───────────────────────────────────────────
  // Auto-dismiss defaults: success/info 4s · error 7s · loading sticky.
  // Every method returns the toast's numeric id.
  toast.success('saved!');
  toast.info('3 services syncing…');
  toast.error('deploy failed', { timeout: 10_000 }); // or a bare number
  const id = toast.loading('uploading…'); // sticky until updated/dismissed

  // ── action button (action toasts default to sticky) ─────────────
  // Return false from onClick to keep the toast open after the click.
  toast.info('build queued', {
    action: { label: 'view', onClick: () => goto('/builds') },
  });

  // ── promise — sticky loading toast, flips on settle ─────────────
  async function save() {
    await toast.promise(api.save(), {
      loading: 'saving…',
      success: 'saved!',                       // or (value) => string
      error: (e) => \`failed: \${e.message}\`,    // or a plain string
    });
  }

  // ── the toasts store — inspect + control in flight ──────────────
  toasts.update(id, { kind: 'success', message: 'uploaded!' });
  toasts.pause(id);    // hold the auto-dismiss timer (hover does this)
  toasts.resume(id);   // let it run again
  toasts.dismiss(id);  // remove one (visible or still queued)
  toasts.clear();      // remove everything
  toasts.max = 3;      // visible-stack cap (default 3; overflow queues FIFO)
  toasts.items;        // reactive array of the visible toasts
</script>

<Toaster position="bottom-right" />
<button onclick={save}>save</button>`,
  props: [
    {
      name: 'position',
      type: "'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'",
      default: "'top-right'",
      desc: 'Where the stack anchors on screen. `left`/`right` are logical (inline start/end), so the stack mirrors under `dir="rtl"`.',
    },
    SIZE_PROP,
  ],
  notes:
    "Imperative API (`import { toast } from 'dssoca'`): `toast.success/error/info/loading(msg, opts?)` push a toast and return its id; `opts` is `{ timeout?, action? }` or a bare timeout number. Timeout defaults per kind: success/info 4000ms, error 7000ms, loading 0 (sticky); a timeout <= 0 (or non-finite) means sticky, and a toast carrying an `action` defaults to sticky so the button stays reachable. `action` is `{ label, onClick }` — return `false` from `onClick` to keep the toast open. `toast.promise(p, { loading, success, error })` pushes a sticky loading toast, updates it to success/error when `p` settles (message values may be strings or functions of the value/error), and returns the same promise for chaining. The reactive store is `toasts`: `toasts.items` (visible stack), `toasts.max` (cap, default 3 — overflow queues FIFO and is promoted on dismiss), `toasts.update(id, patch)` (patch `kind`/`message`/`timeout`/`action`; changing `kind` without `timeout` re-applies that kind's default and restarts the timer), `toasts.pause(id)`/`toasts.resume(id)` (what hover does), `toasts.dismiss(id)`, `toasts.clear()`. Exported types: `Toast`, `ToastKind`, `ToastAction`, `ToastOptions`, `ToastPatch`, `PromiseMessages`. Accessibility: the Toaster always renders two visually hidden live regions — `.live[role=status]` (polite) and `.live[role=alert]` (assertive) — and each visible toast mirrors its message into one of them (errors assertive, everything else polite; a kind change moves it), so announcements don't depend on a freshly inserted live node. Each toast is a focusable `role=group` named by its message. The timer pauses on hover or focus and resumes only once the pointer has left and focus is outside the toast. Dismissing the focused toast moves focus to a neighbouring toast, or back to where focus came from before it entered the stack. The accent bar sits on the inline-start edge.",
}
