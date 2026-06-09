import { type ComponentDoc, SIZE_PROP } from './types';

export const metricTile: ComponentDoc = {
    name: 'MetricTile',
    slug: 'metric-tile',
    tagline: 'Single KPI value with delta.',
    description:
      'A labelled metric with optional prefix/suffix units and a directional delta. `trend` colours the delta by sentiment independently of the arrow `dir` (a rising error rate is negative), with an optional `deltaLabel`, an emphasis chip, a `loading` skeleton, and a `chart` snippet slot for hosting a <Sparkline>.',
    storyId: 'components-metrictile--delta-up',
    usage: `<script>
  import { MetricTile, Sparkline } from 'dssoca';
</script>

<MetricTile label="req/min" value="142" delta="12%" dir="up"
  deltaLabel="vs prev 7d">
  {#snippet chart()}
    <Sparkline data={[3, 7, 4, 9, 6, 11]} trend="auto" fluid />
  {/snippet}
</MetricTile>`,
    props: [
      { name: 'label', type: 'string', desc: 'Required. Metric label.' },
      { name: 'value', type: 'string | number', desc: 'Required. The metric value.' },
      { name: 'prefix', type: 'string', desc: 'Leading unit (e.g. $ / €); rendered faint.' },
      { name: 'suffix', type: 'string', desc: 'Trailing unit/suffix; rendered faint.' },
      { name: 'delta', type: 'string', desc: 'Delta text (the arrow is added from `dir`).' },
      { name: 'dir', type: "'up' | 'down'", default: "'up'", desc: 'Arrow direction.' },
      { name: 'trend', type: "'positive' | 'negative' | 'neutral'", desc: 'Sentiment colour for the delta, decoupled from `dir`. Defaults so up reads positive / down negative.' },
      { name: 'deltaLabel', type: 'string', desc: 'Comparison-period label rendered faint after the delta ("vs prev 7d").' },
      { name: 'emphasis', type: 'boolean', default: 'false', desc: 'Render the delta as a soft sentiment chip (non-colour redundancy).' },
      { name: 'loading', type: 'boolean', default: 'false', desc: 'Skeleton/loading state: hides the real value behind aria-hidden bars.' },
      { name: 'chart', type: 'Snippet', desc: 'Slot below the delta — drop in a <Sparkline> here.' },
      SIZE_PROP,
    ],
  };
