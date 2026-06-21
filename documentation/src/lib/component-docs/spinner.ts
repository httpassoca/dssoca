import { type ComponentDoc, SIZE_PROP } from './types'

export const spinner: ComponentDoc = {
  name: 'Spinner',
  slug: 'spinner',
  tagline: 'Text-frame loading indicator with squared cli-spinners glyphs.',
  description:
    'A standalone loading indicator that animates monospace text frames — ten squared/blocky glyph sequences embedded from cli-spinners (MIT) — instead of a drawn arc, so it matches the DS’s zero-radius terminal look. Announced via `role="status"` with a visually-hidden (or visible) label; the glyph itself is `aria-hidden`. Under `prefers-reduced-motion` a static first frame renders with no cycling.',
  storyId: 'components-spinner--default',
  usage: `<script>
  import { Spinner } from 'dssoca';
</script>

<Spinner />
<Spinner variant="squareCorners" size="lg" />
<Spinner variant="pipe" label="Fetching services…" showLabel />`,
  props: [
    {
      name: 'variant',
      type: "'boxBounce2' | 'boxBounce' | 'squareCorners' | 'toggle2' | 'toggle3' | 'toggle4' | 'pipe' | 'line' | 'growVertical' | 'growHorizontal'",
      default: "config 'spinnerVariant' (boxBounce2)",
      desc: 'Which cli-spinners frame set to animate. When unset, falls back to the configured global `spinnerVariant` (precedence: prop > config > default); an explicit value always wins.',
    },
    {
      name: 'label',
      type: 'string',
      default: "'Loading'",
      desc: 'Accessible name announced via role="status".',
    },
    {
      name: 'showLabel',
      type: 'boolean',
      default: 'false',
      desc: 'Render the label visibly next to the glyph (announced either way).',
    },
    { name: 'speed', type: 'number', desc: "Override the variant's frame interval (ms)." },
    SIZE_PROP,
    {
      name: '...rest',
      type: 'HTMLAttributes',
      desc: 'Any remaining native attributes are forwarded to the root span.',
    },
  ],
  notes:
    "Frames and intervals come from sindresorhus/cli-spinners (MIT), embedded at build time — no runtime fetch or dependency. The glyph renders in `--ss-font-mono` at `--ss-spinner-font` (rescales across sm/md/lg) and is colored by `--ss-spinner-color`, which defaults to `--ss-primary`; the frame box reserves `1ch` so swaps never shift layout. `SPINNER_VARIANTS` / `SPINNER_VARIANT_NAMES` are exported for tooling. **Global default (DS-0108):** set the house spinner once via `applyDesignConfig({ spinnerVariant: 'pipe' })` (or the `spinner` axis in `dssocaConfig`); every Spinner with no `variant` prop then uses it. Unlike `theme`/`size`, `spinnerVariant` is a default-prop axis — not a CSS `data-*` attribute — and resolves through `resolveSpinnerVariant`.",
}
