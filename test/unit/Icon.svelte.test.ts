import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Icon, { PATHS } from '$lib/components/Icon.svelte';

describe('Icon', () => {
	it('renders an svg with a 0 0 24 24 viewBox and currentColor stroke', () => {
		const { container } = render(Icon, { name: 'grid' });
		const svg = container.querySelector('svg');
		expect(svg).not.toBeNull();
		expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
		expect(svg).toHaveAttribute('stroke', 'currentColor');
		expect(svg).toHaveAttribute('fill', 'none');
	});

	it('defaults to the --ss-icon token for width/height (inherits the active size)', () => {
		const { container } = render(Icon, { name: 'grid' });
		const svg = container.querySelector('svg')!;
		expect(svg.getAttribute('style')).toContain('width: var(--ss-icon)');
		expect(svg.getAttribute('style')).toContain('height: var(--ss-icon)');
		// no explicit size → inherits the global size, so no own data-size-variant
		expect(svg).not.toHaveAttribute('data-size-variant');
	});

	it('applies an explicit px size to width/height', () => {
		const { container } = render(Icon, { name: 'grid', px: 32 });
		const svg = container.querySelector('svg')!;
		expect(svg.getAttribute('style')).toContain('width: 32px');
		expect(svg.getAttribute('style')).toContain('height: 32px');
	});

	it('stamps data-size-variant when a token size is given', () => {
		const { container } = render(Icon, { name: 'grid', size: 'lg' });
		expect(container.querySelector('svg')).toHaveAttribute('data-size-variant', 'lg');
	});

	it('passes through a class to the svg', () => {
		const { container } = render(Icon, { name: 'grid', class: 'my-ico' });
		expect(container.querySelector('svg')).toHaveClass('my-ico');
	});

	// The inner @html path markup is the glyph identity. jsdom re-serialises
	// self-closing tags (`<path/>` -> `<path></path>`), so normalise both sides
	// by parsing PATHS through the same DOM before comparing.
	const normalise = (markup: string) => {
		const tmp = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		tmp.innerHTML = markup;
		return tmp.innerHTML;
	};

	it.each(['book', 'film', 'note', 'grid', 'user', 'check'] as const)(
		'renders the %s glyph path inside the svg',
		(name) => {
			const { container } = render(Icon, { name });
			const svg = container.querySelector('svg')!;
			expect(svg.innerHTML).toBe(normalise(PATHS[name]));
		}
	);

	it('book glyph differs from film and note glyphs', () => {
		expect(PATHS.book).not.toBe(PATHS.film);
		expect(PATHS.book).not.toBe(PATHS.note);
		expect(PATHS.film).not.toBe(PATHS.note);
	});
});
