import { type ComponentDoc, SIZE_PROP } from './types'

export const avatar: ComponentDoc = {
  name: 'Avatar',
  slug: 'avatar',
  tagline: 'Square initials- or image-based identity tile.',
  description:
    'A compact square tile (zero radius — house rule) representing a person or entity. Pass a `src` to render an image; it falls back to initials if the image fails to load. Initials are the first letters of up to the first two words of `name`, uppercased, on a deterministic colour derived from a hash of the name — the same name always reads the same. The tile carries `role="img"` + `aria-label={name}` so the name is exposed once to assistive tech.',
  storyId: 'components-avatar--default',
  usage: `<script>
  import { Avatar } from 'dssoca';
</script>

<Avatar name="Ada Lovelace" />
<Avatar name="Ada Lovelace" src="/avatars/ada.png" />
<Avatar name="Grace Hopper" size="lg" />`,
  props: [
    {
      name: 'name',
      type: 'string',
      desc: 'Required. Drives the initials, the deterministic colour, and the accessible name.',
    },
    {
      name: 'src',
      type: 'string',
      desc: 'Optional image URL; rendered as an <img> that falls back to initials on load error.',
    },
    {
      name: 'alt',
      type: 'string',
      default: 'name',
      desc: 'Image alt text; defaults to `name`.',
    },
    SIZE_PROP,
  ],
  notes:
    'Always a square (never a circle). The visual initials are aria-hidden; the root tile carries role="img" + aria-label so the name is announced exactly once. Colour comes from CHART_PALETTE — [accent, blue, magenta, cyan, yellow, green], shared with the chart family — via a stable string hash.',
}
