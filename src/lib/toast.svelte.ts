export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
	id: number;
	kind: ToastKind;
	message: string;
}

const DEFAULT_TIMEOUT = 4000;

/**
 * Module-singleton toast store (Svelte 5 runes). One instance is shared by
 * every consumer of the package, so `toast.success(...)` from anywhere shows
 * in the single <Toaster /> mounted at the app root.
 */
class ToastStore {
	items = $state<Toast[]>([]);
	#seq = 0;

	push(kind: ToastKind, message: string, timeout = DEFAULT_TIMEOUT): number {
		const id = ++this.#seq;
		this.items.push({ id, kind, message });
		if (timeout > 0 && typeof window !== 'undefined') {
			setTimeout(() => this.dismiss(id), timeout);
		}
		return id;
	}

	dismiss(id: number): void {
		const i = this.items.findIndex((t) => t.id === id);
		if (i !== -1) this.items.splice(i, 1);
	}

	clear(): void {
		this.items = [];
	}
}

export const toasts = new ToastStore();

export const toast = {
	success: (message: string, timeout?: number) => toasts.push('success', message, timeout),
	error: (message: string, timeout?: number) => toasts.push('error', message, timeout),
	info: (message: string, timeout?: number) => toasts.push('info', message, timeout)
};
