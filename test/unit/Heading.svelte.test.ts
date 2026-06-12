import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { axe } from 'vitest-axe';
import Heading from '$lib/components/Heading.svelte';

const axeOpts = {
	rules: {
		region: { enabled: false },
		'landmark-one-main': { enabled: false },
		'page-has-heading-one': { enabled: false },
		'color-contrast': { enabled: false }
	}
};

const text = (s: string) => createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

describe('Heading', () => {
	it('renders its children text inside a .ss-heading', () => {
		const { container } = render(Heading, { children: text('hub_dashboard') });
		const root = container.querySelector('.ss-heading');
		expect(root).not.toBeNull();
		expect(root).toHaveTextContent('hub_dashboard');
	});

	it('renders an h1 by default', () => {
		const { container } = render(Heading, { children: text('x') });
		expect(container.querySelector('h1.ss-heading')).not.toBeNull();
	});

	it.each([1, 2, 3, 4, 5, 6] as const)('renders an h%s for level=%s', (level) => {
		const { container } = render(Heading, { level, children: text('x') });
		const root = container.querySelector('.ss-heading')!;
		expect(root.tagName).toBe(`H${level}`);
	});

	it('wraps the text in the positioning span that carries the accent underline', () => {
		const { container } = render(Heading, { children: text('x') });
		expect(container.querySelector('.ss-heading .txt')).toHaveTextContent('x');
	});

	describe('accent', () => {
		it('applies the accent class by default', () => {
			const { container } = render(Heading, { children: text('x') });
			expect(container.querySelector('.ss-heading')).toHaveClass('accent');
		});

		it('drops the accent class when accent=false', () => {
			const { container } = render(Heading, { accent: false, children: text('x') });
			expect(container.querySelector('.ss-heading')).not.toHaveClass('accent');
		});

		it('keeps the text span when the accent is off', () => {
			const { container } = render(Heading, { accent: false, children: text('x') });
			expect(container.querySelector('.ss-heading .txt')).toHaveTextContent('x');
		});
	});

	describe('centered', () => {
		it('is not centered by default', () => {
			const { container } = render(Heading, { children: text('x') });
			expect(container.querySelector('.ss-heading')).not.toHaveClass('centered');
		});

		it('applies the centered class when centered=true', () => {
			const { container } = render(Heading, { centered: true, children: text('x') });
			expect(container.querySelector('.ss-heading')).toHaveClass('centered');
		});
	});

	describe('size', () => {
		it('inherits the global size by default (no data-size-variant)', () => {
			const { container } = render(Heading, { children: text('x') });
			expect(container.querySelector('.ss-heading')).not.toHaveAttribute('data-size-variant');
		});

		it.each(['sm', 'md', 'lg'] as const)('applies the %s size prop as data-size-variant', (size) => {
			const { container } = render(Heading, { size, children: text('x') });
			expect(container.querySelector('.ss-heading')).toHaveAttribute('data-size-variant', size);
		});
	});

	describe('option combinations', () => {
		it('combines level, accent=false and centered', () => {
			const { container } = render(Heading, {
				level: 2,
				accent: false,
				centered: true,
				children: text('combo')
			});
			const root = container.querySelector('.ss-heading')!;
			expect(root.tagName).toBe('H2');
			expect(root).toHaveClass('centered');
			expect(root).not.toHaveClass('accent');
			expect(root).toHaveTextContent('combo');
		});
	});

	describe('a11y (axe)', () => {
		it('default heading has no violations', async () => {
			const { container } = render(Heading, { children: text('page title') });
			expect(await axe(container, axeOpts)).toHaveNoViolations();
		});

		it('non-h1 accentless centered heading has no violations', async () => {
			const { container } = render(Heading, {
				level: 3,
				accent: false,
				centered: true,
				children: text('section title')
			});
			expect(await axe(container, axeOpts)).toHaveNoViolations();
		});
	});
});
