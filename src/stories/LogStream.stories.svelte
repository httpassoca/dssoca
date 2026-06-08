<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LogStream from '$lib/components/LogStream.svelte';
  import type { LogLine } from '$lib/components/LogStream.svelte';

  const multiLevelLines: LogLine[] = [
    { t: '12:00:01', lvl: 'info', svc: '[hub]',        msg: 'session refresh — user=rafael' },
    { t: '12:00:03', lvl: 'ok',   svc: '[movies-api]', msg: 'GET /movies?status=to_watch — 3 rows · 4ms' },
    { t: '12:00:06', lvl: 'warn', svc: '[caddy]',      msg: 'tls internal renewing hub.home' },
    { t: '12:00:09', lvl: 'err',  svc: '[tasks-api]',  msg: 'EADDRINUSE :3004 — retrying in 2s' },
    { t: '12:00:12', lvl: 'ok',   svc: '[meals-api]',  msg: 'POST /meals — created id=m_a4f1 · 6ms' },
    { t: '12:00:15', lvl: 'info', svc: '[notes-api]',  msg: 'slow query · 182ms · SELECT * FROM notes' },
    { t: '12:00:18', lvl: 'ok',   svc: '[hub]',        msg: 'GET /api/auth/session — 8ms' },
    { t: '12:00:21', lvl: 'info', svc: '[movies-api]', msg: 'drizzle migrated 0002 · runtime 12ms' },
  ];

  const infoOnlyLines: LogLine[] = [
    { t: '09:14:01', lvl: 'info', svc: '[hub]',        msg: 'starting server on :3000' },
    { t: '09:14:02', lvl: 'info', svc: '[hub]',        msg: 'connected to database · dsn=postgres://…' },
    { t: '09:14:03', lvl: 'info', svc: '[movies-api]', msg: 'drizzle migrated 0001 · runtime 8ms' },
    { t: '09:14:05', lvl: 'info', svc: '[meals-api]',  msg: 'listening on :3003' },
  ];

  const { Story } = defineMeta({
    title: 'Components/LogStream',
    component: LogStream,
    tags: ['autodocs'],
    argTypes: {
      lines: {
        control: 'object',
        description: 'Controlled lines. When provided, the demo ticker is off.',
      },
      demo: {
        control: 'boolean',
        description: 'Generate a random demo stream (only when `lines` is undefined).',
      },
      controls: { control: 'boolean', description: 'Show the controls toolbar.' },
      wrap: { control: 'boolean', description: 'Wrap long messages vs. horizontal scroll.' },
      loading: { control: 'boolean', description: 'Show a connecting indicator.' },
      maxLines: { control: 'number', description: 'Buffer cap (oldest dropped).' },
      announce: {
        control: 'select',
        options: ['off', 'polite', 'assertive'],
        description: 'aria-live politeness.',
      },
    },
    args: {
      lines: multiLevelLines,
    },
  });
</script>

<!-- Mixed log levels: info, ok, warn, err — controlled -->
<Story name="MultiLevel" args={{ lines: multiLevelLines }} />

<!-- Info-only lines — clean startup sequence -->
<Story name="InfoOnly" args={{ lines: infoOnlyLines }} />

<!-- Empty stream — renders the empty state -->
<Story name="Empty" args={{ lines: [] }} />

<!-- Loading / connecting -->
<Story name="Loading" args={{ lines: [], loading: true }} />

<!-- Live demo — random lines appended every 1.8 s from internal TEMPLATES -->
<Story name="Live" args={{ lines: undefined, demo: true }} />
