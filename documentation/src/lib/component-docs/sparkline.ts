import { type ComponentDoc, SIZE_PROP } from './types';

export const sparkline: ComponentDoc = {
    name: 'Sparkline',
    slug: 'sparkline',
    tagline: 'Tiny inline trend chart.',
    description:
      'A compact sparkline for trends, rendered as bars, a line, or a filled area. Fix the scale with `min`/`max` to compare rows, colour by `trend` (auto derives up/down/flat → success/danger/muted), and flex it to the cell with `fluid`/`width`. Decorative by default; the auto-generated summary (or `label`) names it for assistive tech.',
    storyId: 'components-sparkline--upward-trend',
    usage: `<script>
  import { Sparkline } from 'dssoca';
</script>

<Sparkline data={[3, 7, 4, 9, 6, 11]} label="req/min, last 6h" />
<Sparkline data={[12, 9, 11, 6, 4]} trend="auto" variant="area" fluid />`,
    props: [
      { name: 'data', type: 'number[]', desc: 'Required. Series values.' },
      { name: 'variant', type: "'bars' | 'line' | 'area'", default: "'bars'", desc: 'Rendering style.' },
      { name: 'color', type: 'string', default: 'var(--ss-primary)', desc: 'Bar/line fill. Ignored when `trend` resolves to a direction.' },
      { name: 'trend', type: "'auto' | 'up' | 'down' | 'flat' | 'none'", default: "'none'", desc: 'Colour by direction; `auto` derives first-vs-last → success/danger/muted.' },
      { name: 'min', type: 'number', desc: 'Lower scale bound. Defaults to the data min — set to fix the scale across rows.' },
      { name: 'max', type: 'number', desc: 'Upper scale bound. Defaults to the data max — set to fix the scale across rows.' },
      { name: 'fluid', type: 'boolean', default: 'false', desc: 'Flex the chart to fill its container width (table-cell friendly).' },
      { name: 'width', type: 'string', desc: "Explicit CSS width (e.g. '120px', '100%'); overrides the intrinsic width." },
      { name: 'label', type: 'string', desc: 'Accessible name; overrides the auto-generated summary (sets role="img").' },
      { name: 'summary', type: 'string', desc: 'Replace the auto-generated screen-reader summary entirely.' },
      { name: 'valueFormat', type: '(v: number) => string', desc: 'Format a value for the screen-reader summary (e.g. v => v + "%").' },
      SIZE_PROP,
    ],
  };
