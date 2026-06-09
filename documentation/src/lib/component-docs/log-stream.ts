import { type ComponentDoc, SIZE_PROP } from './types';

export const logStream: ComponentDoc = {
    name: 'LogStream',
    slug: 'log-stream',
    tagline: 'Live, levelled log viewer.',
    description:
      'A terminal-style log viewer. Pass controlled `lines` to render exactly those, or let the built-in `demo` ticker simulate a live feed. Includes a controls toolbar (filters, search, wrap, copy, clear) you can replace, a `loading` indicator, a custom `empty` slot, and a `role="log"` region with configurable aria-live announcements.',
    storyId: 'components-logstream--multi-level',
    usage: `<script>
  import { LogStream } from 'dssoca';

  const lines = [
    { t: '12:00:01', lvl: 'info', svc: '[hub]', msg: 'session refresh' },
    { t: '12:00:02', lvl: 'err',  svc: '[tasks]', msg: 'EADDRINUSE :3004' },
  ];
</script>

<LogStream {lines} />
<LogStream demo />`,
    props: [
      { name: 'lines', type: 'LogLine[]', desc: 'Controlled lines. When provided, renders exactly these (capped to `maxLines`); demo off.' },
      { name: 'initialLines', type: "Omit<LogLine, 'id'>[]", desc: 'Seed lines for the built-in demo stream (used when `lines` is undefined).' },
      { name: 'demo', type: 'boolean', desc: 'Generate a random demo stream. Defaults true ONLY when `lines` is not supplied.' },
      { name: 'live', type: 'boolean', desc: 'Back-compat alias for `demo`.' },
      { name: 'maxLines', type: 'number', default: '30', desc: 'Max lines kept in the buffer (oldest dropped).' },
      { name: 'controls', type: 'boolean', default: 'true', desc: 'Show the controls toolbar (filters, search, wrap, copy, clear).' },
      { name: 'toolbar', type: 'Snippet', desc: 'Replace the built-in toolbar entirely.' },
      { name: 'wrap', type: 'boolean', default: 'true', desc: 'Wrap long messages (pre-wrap) vs. horizontal scroll (pre).' },
      { name: 'announce', type: "'off' | 'polite' | 'assertive'", default: "'polite'", desc: 'aria-live politeness for the log region.' },
      { name: 'ariaLabel', type: 'string', default: "'Log output'", desc: 'Accessible label for the log region.' },
      { name: 'loading', type: 'boolean', default: 'false', desc: 'Show a connecting/loading indicator.' },
      { name: 'empty', type: 'Snippet', desc: 'Custom empty state.' },
      SIZE_PROP,
    ],
    notes:
      'Exports the `LogLevel` (`info | warn | err | ok`) and `LogLine` types from `dssoca`.',
  };
