import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import LogStream from '$lib/components/LogStream.svelte';

describe('LogStream', () => {
	it('renders one log line per seeded template (live off)', () => {
		const { container } = render(LogStream, {
			live: false,
			initialLines: [
				{ t: '', lvl: 'info', svc: '[movies-api]', msg: 'GET /movies — 4ms' },
				{ t: '', lvl: 'err', svc: '[tasks-api]', msg: 'EADDRINUSE :3004' }
			]
		});
		expect(container.querySelectorAll('.ln')).toHaveLength(2);
	});

	it('uppercases the level and renders svc + msg', () => {
		const { container } = render(LogStream, {
			live: false,
			initialLines: [{ t: '', lvl: 'warn', svc: '[caddy]', msg: 'tls renew' }]
		});
		const ln = container.querySelector('.ln')!;
		expect(ln.querySelector('.lvl')).toHaveTextContent('WARN');
		expect(ln.querySelector('.lvl')).toHaveClass('warn');
		expect(ln.querySelector('.svc')).toHaveTextContent('[caddy]');
		expect(ln).toHaveTextContent('tls renew');
	});

	it('renders the default template lines when no initialLines given (live off)', () => {
		const { container } = render(LogStream, { live: false });
		// 8 built-in TEMPLATES
		expect(container.querySelectorAll('.ln')).toHaveLength(8);
		expect(container.textContent).toContain('[movies-api]');
	});

	it('stamps each seeded line with a time string', () => {
		const { container } = render(LogStream, {
			live: false,
			initialLines: [{ t: '', lvl: 'ok', svc: '[hub]', msg: 'session' }]
		});
		// timeAgo() fills .t with hh:mm:ss
		expect(container.querySelector('.ln .t')?.textContent).toMatch(/^\d{2}:\d{2}:\d{2}$/);
	});
});
