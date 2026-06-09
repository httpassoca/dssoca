import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { axe } from 'vitest-axe';
import Image from '$lib/components/Image.svelte';

// jsdom never loads images or fires real load/error events; we drive the
// component's load/error state by dispatching them on the <img> directly.
const axeOpts = {
	rules: {
		region: { enabled: false },
		'landmark-one-main': { enabled: false },
		'page-has-heading-one': { enabled: false },
		'color-contrast': { enabled: false }
	}
};

const SRC = 'https://example.com/photo.jpg';

describe('Image', () => {
	it('renders a figure with the .ss-image root and a semantic <img> with alt', () => {
		const { container } = render(Image, { src: SRC, alt: 'A scenic photo' });
		const fig = container.querySelector('figure.ss-image');
		expect(fig).not.toBeNull();
		const img = container.querySelector('img.img') as HTMLImageElement;
		expect(img).not.toBeNull();
		expect(img.getAttribute('src')).toBe(SRC);
		expect(img).toHaveAttribute('alt', 'A scenic photo');
	});

	it('lazy-loads and async-decodes by default', () => {
		const { container } = render(Image, { src: SRC, alt: 'x' });
		const img = container.querySelector('img.img')!;
		expect(img).toHaveAttribute('loading', 'lazy');
		expect(img).toHaveAttribute('decoding', 'async');
		expect(img).not.toHaveAttribute('fetchpriority');
	});

	it('switches to eager/high priority when eager=true', () => {
		const { container } = render(Image, { src: SRC, alt: 'x', eager: true });
		const img = container.querySelector('img.img')!;
		expect(img).toHaveAttribute('loading', 'eager');
		expect(img).toHaveAttribute('decoding', 'auto');
		expect(img).toHaveAttribute('fetchpriority', 'high');
	});

	describe('responsive sources', () => {
		it('renders a <picture> with each source (srcset/media/type/sizes)', () => {
			const { container } = render(Image, {
				src: SRC,
				alt: 'x',
				sources: [
					{ srcset: '/a.avif', type: 'image/avif' },
					{ srcset: '/b.webp 1x, /b@2x.webp 2x', media: '(min-width: 600px)', sizes: '50vw' }
				]
			});
			const srcs = container.querySelectorAll('figure picture source');
			expect(srcs).toHaveLength(2);
			expect(srcs[0]).toHaveAttribute('srcset', '/a.avif');
			expect(srcs[0]).toHaveAttribute('type', 'image/avif');
			expect(srcs[1]).toHaveAttribute('media', '(min-width: 600px)');
			expect(srcs[1]).toHaveAttribute('sizes', '50vw');
		});

		it('passes srcset + sizes through to the fallback <img>', () => {
			const { container } = render(Image, {
				src: SRC,
				alt: 'x',
				srcset: '/s-480.jpg 480w, /s-960.jpg 960w',
				sizes: '(max-width: 600px) 100vw, 600px'
			});
			const img = container.querySelector('img.img')!;
			expect(img).toHaveAttribute('srcset', '/s-480.jpg 480w, /s-960.jpg 960w');
			expect(img).toHaveAttribute('sizes', '(max-width: 600px) 100vw, 600px');
		});
	});

	describe('aspect-ratio box (no layout shift)', () => {
		it('reserves space from an explicit ratio', () => {
			const { container } = render(Image, { src: SRC, alt: 'x', ratio: 16 / 9 });
			const fig = container.querySelector('.ss-image')!;
			expect(fig).toHaveClass('has-ratio');
			const frame = container.querySelector('.frame') as HTMLElement;
			// jsdom normalises the value (e.g. "1.777… / 1"); compare numerically.
			expect(parseFloat(frame.style.aspectRatio)).toBeCloseTo(16 / 9, 5);
		});

		it('derives the ratio from width/height when no explicit ratio', () => {
			const { container } = render(Image, { src: SRC, alt: 'x', width: 800, height: 400 });
			const frame = container.querySelector('.frame') as HTMLElement;
			expect(parseFloat(frame.style.aspectRatio)).toBeCloseTo(2, 5);
			const img = container.querySelector('img.img')!;
			expect(img).toHaveAttribute('width', '800');
			expect(img).toHaveAttribute('height', '400');
		});

		it('reserves no box when neither ratio nor both dims are given', () => {
			const { container } = render(Image, { src: SRC, alt: 'x' });
			expect(container.querySelector('.ss-image')).not.toHaveClass('has-ratio');
			expect((container.querySelector('.frame') as HTMLElement).style.aspectRatio).toBe('');
		});
	});

	describe('loading skeleton + state', () => {
		it('shows the skeleton while loading and marks the frame aria-busy', () => {
			const { container } = render(Image, { src: SRC, alt: 'x', ratio: 1 });
			expect(container.querySelector('.skeleton')).not.toBeNull();
			expect(container.querySelector('.frame')).toHaveAttribute('aria-busy', 'true');
			expect(container.querySelector('.ss-image')).toHaveClass('is-loading');
		});

		it('removes the skeleton once the image loads', async () => {
			const { container } = render(Image, { src: SRC, alt: 'x', ratio: 1 });
			await fireEvent.load(container.querySelector('img.img')!);
			expect(container.querySelector('.skeleton')).toBeNull();
			expect(container.querySelector('.frame')).toHaveAttribute('aria-busy', 'false');
			expect(container.querySelector('.ss-image')).not.toHaveClass('is-loading');
		});

		it('renders the error fallback (role=img, labelled) when the image errors', async () => {
			const { container } = render(Image, { src: SRC, alt: 'broken pic' });
			await fireEvent.error(container.querySelector('img.img')!);
			const fig = container.querySelector('.ss-image')!;
			expect(fig).toHaveClass('is-error');
			const fallback = container.querySelector('.fallback')!;
			expect(fallback).toHaveAttribute('role', 'img');
			expect(fallback).toHaveAttribute('aria-label', 'broken pic');
			// the broken <img> is gone
			expect(container.querySelector('img.img')).toBeNull();
		});
	});

	describe('lightbox', () => {
		it('is a plain (non-interactive) image by default', () => {
			const { container } = render(Image, { src: SRC, alt: 'x' });
			expect(container.querySelector('button.trigger')).toBeNull();
		});

		it('wraps the image in a trigger button when lightbox=true', () => {
			const { container } = render(Image, { src: SRC, alt: 'sunset', lightbox: true });
			const trigger = container.querySelector('button.trigger')!;
			expect(trigger).not.toBeNull();
			expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
			expect(trigger).toHaveAttribute('aria-label', 'View image: sunset');
		});

		it('does not offer a lightbox after a load error', async () => {
			const { container } = render(Image, { src: SRC, alt: 'x', lightbox: true });
			await fireEvent.error(container.querySelector('img.img')!);
			expect(container.querySelector('button.trigger')).toBeNull();
		});

		it('opens a modal dialog on click and focuses the close button', async () => {
			const { container } = render(Image, { src: SRC, alt: 'sunset', lightbox: true });
			await fireEvent.click(container.querySelector('button.trigger')!);
			const dialog = document.querySelector('.ss-image-lightbox')!;
			expect(dialog).not.toBeNull();
			expect(dialog).toHaveAttribute('role', 'dialog');
			expect(dialog).toHaveAttribute('aria-modal', 'true');
			expect(dialog).toHaveAttribute('aria-label', 'Image: sunset');
			expect(document.activeElement).toBe(dialog.querySelector('button.close'));
		});

		it('closes on Esc and restores focus to the trigger', async () => {
			const { container } = render(Image, { src: SRC, alt: 'x', lightbox: true });
			const trigger = container.querySelector('button.trigger') as HTMLButtonElement;
			await fireEvent.click(trigger);
			const dialog = document.querySelector('.ss-image-lightbox')!;
			await fireEvent.keyDown(dialog, { key: 'Escape' });
			expect(document.querySelector('.ss-image-lightbox')).toBeNull();
			expect(document.activeElement).toBe(trigger);
		});

		it('closes when the backdrop is clicked', async () => {
			const { container } = render(Image, { src: SRC, alt: 'x', lightbox: true });
			await fireEvent.click(container.querySelector('button.trigger')!);
			await fireEvent.click(document.querySelector('.ss-image-lightbox .backdrop')!);
			expect(document.querySelector('.ss-image-lightbox')).toBeNull();
		});
	});

	describe('caption', () => {
		it('renders a <figcaption> when caption is given', () => {
			const { container } = render(Image, { src: SRC, alt: 'x', caption: 'On the trail' });
			expect(container.querySelector('figcaption')).toHaveTextContent('On the trail');
		});
		it('omits the figcaption when no caption', () => {
			const { container } = render(Image, { src: SRC, alt: 'x' });
			expect(container.querySelector('figcaption')).toBeNull();
		});
	});

	describe('size axis', () => {
		it('applies an explicit size on the root', () => {
			const { container } = render(Image, { src: SRC, alt: 'x', size: 'lg' });
			expect(container.querySelector('.ss-image')).toHaveAttribute('data-size-variant', 'lg');
		});
		it('inherits (no attribute) when size is unset', () => {
			const { container } = render(Image, { src: SRC, alt: 'x' });
			expect(container.querySelector('.ss-image')).not.toHaveAttribute('data-size-variant');
		});
	});

	describe('a11y (axe)', () => {
		it('has no violations in the default state', async () => {
			const { container } = render(Image, { src: SRC, alt: 'A descriptive photo', ratio: 16 / 9 });
			expect(await axe(container, axeOpts)).toHaveNoViolations();
		});

		it('has no violations with a lightbox trigger', async () => {
			const { container } = render(Image, {
				src: SRC,
				alt: 'A descriptive photo',
				lightbox: true
			});
			expect(await axe(container, axeOpts)).toHaveNoViolations();
		});

		it('has no violations in the error state', async () => {
			const { container } = render(Image, { src: SRC, alt: 'A descriptive photo' });
			await fireEvent.error(container.querySelector('img.img')!);
			expect(await axe(container, axeOpts)).toHaveNoViolations();
		});
	});
});
