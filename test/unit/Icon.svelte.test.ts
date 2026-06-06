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

	it('defaults to size 16 for width/height', () => {
		const { container } = render(Icon, { name: 'grid' });
		const svg = container.querySelector('svg')!;
		expect(svg).toHaveAttribute('width', '16');
		expect(svg).toHaveAttribute('height', '16');
	});

	it('applies an explicit size to width/height', () => {
		const { container } = render(Icon, { name: 'grid', size: 32 });
		const svg = container.querySelector('svg')!;
		expect(svg).toHaveAttribute('width', '32');
		expect(svg).toHaveAttribute('height', '32');
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
