import React, { useCallback, useLayoutEffect, useRef } from 'react';

type TargetRect = {
	x: number;
	y: number;
	width: number;
	height: number;
};

type Props = {
	children?: React.ReactNode;
	debugName?: string;
	marginPx?: number;
	minBelowPx?: number;
	target?: TargetRect;
};

export function OverlayViewportGuard({ children, debugName, marginPx = 12, minBelowPx = 320, target }: Props) {
	const ref = useRef<HTMLDivElement | null>(null);
	const overlayRootRef = useRef<HTMLElement | null>(null);
	const restoreRef = useRef<{ top: string; maxHeight: string } | null>(null);

	const recompute = useCallback(() => {
		const el = ref.current;
		if (!el) return;

		const overlayRoot =
			overlayRootRef.current ??
			((el.closest('.gdg-clip-region')?.parentElement as HTMLElement | null) ?? null);
		if (!overlayRoot) return;
		overlayRootRef.current = overlayRoot;

		if (!restoreRef.current) {
			restoreRef.current = {
				top: overlayRoot.style.top,
				maxHeight: overlayRoot.style.maxHeight,
			};
		}

		const viewportHeight = window.innerHeight;
		const maxHeightPx = Math.max(0, viewportHeight - marginPx * 2);

		const targetBottom = target ? target.y + target.height : overlayRoot.getBoundingClientRect().top;
		const spaceBelow = viewportHeight - targetBottom - marginPx;
		const shouldFlip = Boolean(target) && spaceBelow < minBelowPx;

		if (!shouldFlip) {
			overlayRoot.style.top = restoreRef.current?.top ?? '';
			overlayRoot.style.maxHeight = restoreRef.current?.maxHeight ?? '';
			return;
		}

		// Override Glide's default max-height which is tied to targetY (top-anchored) and can become tiny near bottom.
		overlayRoot.style.maxHeight = `${maxHeightPx}px`;

		const applyTop = () => {
			const rect = overlayRoot.getBoundingClientRect();
			const h = rect.height;
			let nextTop = targetBottom - h;
			// Clamp into viewport margins.
			nextTop = Math.max(marginPx, Math.min(nextTop, viewportHeight - marginPx - h));
			if (!Number.isFinite(nextTop)) nextTop = marginPx;
			overlayRoot.style.top = `${nextTop}px`;

			if (process.env.NODE_ENV !== 'production') {
				console.log('[data-grid][overlay-flip]', {
					debugName,
					marginPx,
					minBelowPx,
					spaceBelow,
					targetBottom,
					overlayHeight: h,
					nextTop,
					viewportHeight,
				});
			}
		};

		requestAnimationFrame(applyTop);
	}, [debugName, marginPx, minBelowPx, target]);

	useLayoutEffect(() => {
		recompute();
		const raf = requestAnimationFrame(recompute);
		const onResize = () => recompute();
		window.addEventListener('resize', onResize);

		let ro: ResizeObserver | undefined;
		if ('ResizeObserver' in window && ref.current) {
			ro = new ResizeObserver(() => recompute());
			ro.observe(ref.current);
		}

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', onResize);
			ro?.disconnect();
			const overlayRoot = overlayRootRef.current;
			if (overlayRoot && restoreRef.current) {
				overlayRoot.style.top = restoreRef.current.top;
				overlayRoot.style.maxHeight = restoreRef.current.maxHeight;
			}
		};
	}, [recompute]);

	return (
		<div ref={ref}>
			{children}
		</div>
	);
}
