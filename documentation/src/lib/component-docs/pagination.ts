import { type ComponentDoc, SIZE_PROP } from './types'

export const pagination: ComponentDoc = {
  name: 'Pagination',
  slug: 'pagination',
  tagline: 'Windowed page navigator.',
  description:
    'A page navigator with Prev/Next controls and a windowed list of page numbers: it always shows the first and last page plus `siblingCount` pages around the current one, bridging hidden runs with `…`. Give it a `pageCount`, or a `total` item count with `pageSize` to derive the count. `page` is bindable (1-based); the current page is `aria-current="page"`, visually active and inert. Mono numerals, zero radius, `--ss-line` hairlines.',
  storyId: 'components-pagination--default',
  usage: `<script>
  import { Pagination } from 'dssoca'
  let page = $state(1)
</script>

<Pagination bind:page total={240} pageSize={20} onchange={(p) => load(p)} />
<Pagination bind:page pageCount={20} siblingCount={2} />`,
  props: [
    { name: 'page', type: 'number', default: '1', desc: 'Current page, 1-based (bindable).' },
    {
      name: 'total',
      type: 'number',
      desc: 'Total item count; combined with `pageSize` to derive the page count.',
    },
    {
      name: 'pageCount',
      type: 'number',
      desc: 'Explicit page count; overrides the `total`/`pageSize` computation.',
    },
    {
      name: 'pageSize',
      type: 'number',
      default: '10',
      desc: 'Items per page when deriving the count from `total`.',
    },
    {
      name: 'siblingCount',
      type: 'number',
      default: '1',
      desc: 'Page-number buttons shown on each side of the current page.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      desc: 'Disable the whole control (every button is inert).',
    },
    {
      name: 'onchange',
      type: '(page: number) => void',
      desc: 'Fired when the page changes (after `page` updates).',
    },
    SIZE_PROP,
  ],
  notes:
    'Renders a `<nav aria-label="Pagination">` of buttons. Prev is disabled on page 1, Next on the last page; the current page button carries `aria-current="page"` and never re-fires. Ellipses are decorative (`aria-hidden`).',
}
