import { type ComponentDoc, SIZE_PROP } from './types';

export const toaster: ComponentDoc = {
    name: 'Toaster',
    slug: 'toaster',
    tagline: 'Toast notification host.',
    description:
      'Mount once near the app root; drive it imperatively with the `toast` API. The stack anchors at one of six `position`s, supports swipe-to-dismiss, pause-on-hover, an inline action button, and announces via a live region.',
    storyId: 'components-toaster--playground',
    usage: `<script>
  import { Toaster, toast } from 'dssoca';

  async function save() {
    await toast.promise(api.save(), {
      loading: 'saving…',
      success: 'saved!',
      error: (e) => \`failed: \${e.message}\`,
    });
  }
</script>

<Toaster position="bottom-right" />
<button onclick={save}>save</button>`,
    props: [
      { name: 'position', type: "'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'", default: "'top-right'", desc: 'Where the stack anchors on screen.' },
      SIZE_PROP,
    ],
    notes:
      'Imperative API (`import { toast } from \'dssoca\'`): `toast.success/error/info/loading(msg, opts?)` where `opts` is `{ timeout?, action? }` (or a bare timeout number); `action` is `{ label, onClick }` (return `false` from `onClick` to keep the toast open). `toast.promise(p, { loading, success, error })` pushes a sticky loading toast and resolves it to success/error. The underlying reactive store is `toasts`: `toasts.max` (visible-stack cap, default 3, overflow queues), `toasts.update(id, patch)`, `toasts.dismiss(id)`, `toasts.pause/resume(id)`, `toasts.clear()`. A new `loading` kind is sticky until updated/dismissed.',
  };
