import { type ComponentDoc, SIZE_PROP } from './types';

export const icon: ComponentDoc = {
    name: 'Icon',
    slug: 'icon',
    tagline: 'The inline SVG icon set.',
    description:
      'A small, token-sized SVG icon set. Built-in stroke glyphs are drawn from a `name` map; register your own with `registerIcon`, or pass raw `paths` inline. Decorative by default; pass a `title` to expose an accessible name. Supports `spin`, quarter-turn `rotate`, `flip`, an `outline`/`solid` `variant`, and configurable stroke.',
    storyId: 'components-icon--gallery',
    usage: `<script>
  import { Icon, registerIcon } from 'dssoca';

  registerIcon('heart', '<path d="M12 21 4 13a5 5 0 0 1 7-7l1 1 1-1a5 5 0 0 1 7 7z"/>');
</script>

<Icon name="activity" />
<Icon name="settings" title="Settings" />
<Icon name="spinner" spin />
<Icon name="check" variant="solid" />
<Icon name="github" title="GitHub" />
<Icon name="language" />`,
    props: [
      { name: 'name', type: 'IconName', desc: 'Required. Which glyph to render (e.g. grid, activity, terminal). Falls back to `paths` when unknown.' },
      SIZE_PROP,
      { name: 'px', type: 'number', desc: 'Explicit pixel size; overrides the size token.' },
      { name: 'paths', type: 'string', desc: 'Raw SVG inner markup escape hatch — rendered when `name` is not a known/registered glyph.' },
      { name: 'title', type: 'string', desc: 'Accessible name; rendered as a real <title> and wired via aria-labelledby (implies non-decorative).' },
      { name: 'desc', type: 'string', desc: 'Extended description; rendered as <desc> and appended to aria-labelledby.' },
      { name: 'decorative', type: 'boolean', desc: 'Force aria-hidden with no a11y name. Defaults true when no `title`, false when a `title` is present.' },
      { name: 'spin', type: 'boolean', default: 'false', desc: 'Spin the glyph (e.g. a loader). Honours prefers-reduced-motion.' },
      { name: 'rotate', type: '0 | 90 | 180 | 270', default: '0', desc: 'Quarter-turn rotation.' },
      { name: 'flip', type: "'horizontal' | 'vertical'", desc: 'Mirror the glyph.' },
      { name: 'variant', type: "'outline' | 'solid'", default: "'outline'", desc: 'Stroked (outline) or filled with currentColor (solid).' },
      { name: 'strokeWidth', type: 'number', default: '2', desc: 'Stroke weight in viewBox units.' },
      { name: 'absoluteStroke', type: 'boolean', default: 'false', desc: 'Keep `strokeWidth` optically constant across sizes (recompute from resolved px).' },
      { name: 'class', type: 'string', default: "''", desc: 'Extra class on the root svg.' },
    ],
    notes:
      'Built-in glyphs: `grid`, `activity`, `database`, `logs`, `terminal`, `settings`, `user`, `arrow`, `external`, `film`, `note`, `book`, `check`, `cup`, `wallet`, `target`, `spinner`, `home`, `briefcase`, `folder`, `github`, `linkedin`, `language`, `color-swatch` (see the Gallery story). Module exports `registerIcon(name, paths)` (re-exported from `dssoca`) to register or override a glyph globally at runtime, and the `IconName` type for the built-in set.',
  };
