import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import LogStream from '$lib/components/LogStream.svelte';
import type { LogLine } from '$lib/components/LogStream.svelte';

const sample: LogLine[] = [
	{ t: '12:00:01', lvl: 'info', svc: '[movies-api]', msg: 'GET /movies — 4ms' },
	{ t: '12:00:02', lvl: 'err', svc: '[tasks-api]', msg: 'EADDRINUSE :3004' }
];

describe('LogStream — legacy (demo / initialLines)', () => {
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
			initialLines: [{ t: '00:00:00', lvl: 'warn', svc: '[caddy]', msg: 'tls renew' }]
		});
		const ln = container.querySelector('.ln')!;
		expect(ln.querySelector('.lvl')).toHaveTextContent('WARN');
		expect(ln.querySelector('.lvl')).toHaveClass('warn');
		expect(ln.querySelector('.svc')).toHaveTextContent('[caddy]');
		expect(ln).toHaveTextContent('tls renew');
	});

	it('renders the default template lines when no props given (live off)', () => {
		const { container } = render(LogStream, { live: false });
		// 8 built-in TEMPLATES
		expect(container.querySelectorAll('.ln')).toHaveLength(8);
		expect(container.textContent).toContain('[movies-api]');
	});

	it('stamps each seeded line with a time string when none supplied', () => {
		const { container } = render(LogStream, {
			live: false,
			initialLines: [{ t: '', lvl: 'ok', svc: '[hub]', msg: 'session' }]
		});
		// timeAgo() fills .t with hh:mm:ss when the seed line has no time
		expect(container.querySelector('.ln .t')?.textContent).toMatch(/^\d{2}:\d{2}:\d{2}$/);
	});
});

describe('LogStream — controlled lines', () => {
	it('renders exactly the controlled lines and turns the demo off', () => {
		const { container } = render(LogStream, { lines: sample });
		expect(container.querySelectorAll('.ln')).toHaveLength(2);
		expect(container.textContent).toContain('GET /movies — 4ms');
	});

	it('caps the buffer to maxLines (keeps the newest)', () => {
		const many: LogLine[] = Array.from({ length: 10 }, (_, i) => ({
			id: i,
			lvl: 'info',
			msg: `line ${i}`
		}));
		const { container } = render(LogStream, { lines: many, maxLines: 3 });
		expect(container.querySelectorAll('.ln')).toHaveLength(3);
		expect(container.textContent).toContain('line 9');
		expect(container.textContent).not.toContain('line 6');
	});
});

describe('LogStream — a11y / live region', () => {
	it('exposes role=log with a label and aria-live', () => {
		const { container } = render(LogStream, { lines: sample, ariaLabel: 'Server logs', announce: 'assertive' });
		const region = container.querySelector('[role="log"]')!;
		expect(region).toHaveAttribute('aria-label', 'Server logs');
		expect(region).toHaveAttribute('aria-live', 'assertive');
	});

	it('defaults aria-label and polite announce', () => {
		const { container } = render(LogStream, { lines: sample });
		const region = container.querySelector('[role="log"]')!;
		expect(region).toHaveAttribute('aria-label', 'Log output');
		expect(region).toHaveAttribute('aria-live', 'polite');
	});
});

describe('LogStream — empty + loading', () => {
	it('shows an empty state when there are no lines', () => {
		const { container } = render(LogStream, { lines: [] });
		expect(container.querySelectorAll('.ln')).toHaveLength(0);
		expect(container.querySelector('.ss-empty')).toBeTruthy();
		expect(container.textContent).toContain('No log lines');
	});

	it('marks the region busy and shows a connecting indicator when loading', () => {
		const { container } = render(LogStream, { lines: [], loading: true });
		expect(container.querySelector('[role="log"]')).toHaveAttribute('aria-busy', 'true');
		expect(container.querySelector('.status')).toBeTruthy();
	});
});

describe('LogStream — toolbar', () => {
	it('renders per-level filter toggles with aria-pressed', () => {
		const { container } = render(LogStream, { lines: sample });
		const chips = container.querySelectorAll('.filters .chip');
		expect(chips).toHaveLength(4);
		chips.forEach((c) => expect(c).toHaveAttribute('aria-pressed', 'true'));
	});

	it('filters out a level when its toggle is pressed off', async () => {
		const { container, getByRole } = render(LogStream, { lines: sample });
		expect(container.querySelectorAll('.ln')).toHaveLength(2);
		await fireEvent.click(getByRole('button', { name: 'ERR' }));
		expect(container.querySelectorAll('.ln')).toHaveLength(1);
		expect(container.textContent).not.toContain('EADDRINUSE');
	});

	it('filters by substring search', async () => {
		const { container, getByLabelText } = render(LogStream, { lines: sample });
		await fireEvent.input(getByLabelText('Filter log text'), { target: { value: 'EADDR' } });
		expect(container.querySelectorAll('.ln')).toHaveLength(1);
		expect(container.textContent).toContain('EADDRINUSE');
	});

	it('toggles line wrapping', async () => {
		const { container, getByRole } = render(LogStream, { lines: sample });
		const scroll = container.querySelector('.scroll')!;
		expect(scroll).not.toHaveClass('nowrap');
		await fireEvent.click(getByRole('button', { name: 'WRAP' }));
		expect(scroll).toHaveClass('nowrap');
	});

	it('copies visible lines to the clipboard', async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		const { getByRole } = render(LogStream, { lines: sample });
		await fireEvent.click(getByRole('button', { name: 'COPY' }));
		expect(writeText).toHaveBeenCalledOnce();
		expect(writeText.mock.calls[0][0]).toContain('EADDRINUSE');
	});

	it('hides CLEAR in controlled mode and can be turned off entirely', () => {
		const controlled = render(LogStream, { lines: sample });
		expect(controlled.queryByRole('button', { name: 'CLEAR' })).toBeNull();

		const noBar = render(LogStream, { lines: sample, controls: false });
		expect(noBar.container.querySelector('.bar')).toBeNull();
	});
});

describe('LogStream — uses the code surface token', () => {
	it('roots on .ss-logs and renders the scroll region', () => {
		const { container } = render(LogStream, { lines: sample });
		const root = container.querySelector('.ss-logs')!;
		expect(root).toBeTruthy();
		expect(root.querySelector('.scroll[role="log"]')).toBeTruthy();
	});
});
