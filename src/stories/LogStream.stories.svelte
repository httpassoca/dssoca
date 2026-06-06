<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LogStream from '$lib/components/LogStream.svelte';

  type LogLineInit = { t: string; lvl: string; svc: string; msg: string };

  const multiLevelLines: LogLineInit[] = [
    { t: '12:00:01', lvl: 'info', svc: '[hub]',        msg: 'session refresh — user=rafael' },
    { t: '12:00:03', lvl: 'ok',   svc: '[movies-api]', msg: 'GET /movies?status=to_watch — 3 rows · 4ms' },
    { t: '12:00:06', lvl: 'warn', svc: '[caddy]',      msg: 'tls internal renewing hub.home' },
    { t: '12:00:09', lvl: 'err',  svc: '[tasks-api]',  msg: 'EADDRINUSE :3004 — retrying in 2s' },
    { t: '12:00:12', lvl: 'ok',   svc: '[meals-api]',  msg: 'POST /meals — created id=m_a4f1 · 6ms' },
    { t: '12:00:15', lvl: 'info', svc: '[notes-api]',  msg: 'slow query · 182ms · SELECT * FROM notes' },
    { t: '12:00:18', lvl: 'ok',   svc: '[hub]',        msg: 'GET /api/auth/session — 8ms' },
    { t: '12:00:21', lvl: 'info', svc: '[movies-api]', msg: 'drizzle migrated 0002 · runtime 12ms' },
  ];

  const infoOnlyLines: LogLineInit[] = [
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
      live: {
        control: 'boolean',
        description: 'When true, new log lines are appended automatically every 1.8 s.',
      },
      initialLines: {
        control: 'object',
        description: 'Seed lines rendered on mount. Each entry needs t, lvl, svc, msg.',
      },
    },
    args: {
      live: false,
      initialLines: multiLevelLines,
    },
  });
</script>

<!-- Mixed log levels: info, ok, warn, err — live ticker disabled -->
<Story
  name="MultiLevel"
  args={{
    live: false,
    initialLines: multiLevelLines as { t: string; lvl: string; svc: string; msg: string }[],
  }}
/>

<!-- Info-only lines — clean startup sequence -->
<Story
  name="InfoOnly"
  args={{
    live: false,
    initialLines: infoOnlyLines as { t: string; lvl: string; svc: string; msg: string }[],
  }}
/>

<!-- Empty stream — no seed lines -->
<Story
  name="Empty"
  args={{
    live: false,
    initialLines: [] as { t: string; lvl: string; svc: string; msg: string }[],
  }}
/>

<!-- Live stream — new lines appended every 1.8 s from internal TEMPLATES -->
<Story
  name="Live"
  args={{
    live: true,
    initialLines: multiLevelLines as { t: string; lvl: string; svc: string; msg: string }[],
  }}
/>
