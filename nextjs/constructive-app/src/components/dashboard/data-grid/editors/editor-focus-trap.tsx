import React, { useCallback, useEffect, useRef } from 'react';

interface EditorFocusTrapProps {
	children: React.ReactNode;
	onEscape?: () => void;
	onKeyDown?: (e: React.KeyboardEvent) => void;
	className?: string;
}

const FOCUSABLE_SELECTOR = [
	'button:not([disabled])',
	'input:not([disabled])',
	'textarea:not([disabled])',
	'select:not([disabled])',
	'a[href]',
	'[tabindex]:not([tabindex="-1"])',
].join(', ');

export function EditorFocusTrap({ children, onEscape, onKeyDown, className }: EditorFocusTrapProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const previousActiveElement = useRef<Element | null>(null);

	// Store the previously focused element and auto-focus first element
	useEffect(() => {
		previousActiveElement.current = document.activeElement;

		// Small delay to ensure the DOM is ready
		const timeoutId = setTimeout(() => {
			if (!containerRef.current) return;

			const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
			if (focusableElements.length > 0) {
				focusableElements[0].focus();
			} else {
				// If no focusable elements, focus the container itself
				containerRef.current.focus();
			}
		}, 10);

		return () => {
			clearTimeout(timeoutId);
			// Restore focus to previous element when unmounting
			if (previousActiveElement.current instanceof HTMLElement) {
				previousActiveElement.current.focus();
			}
		};
	}, []);

	// Handle Tab key for focus trapping
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				e.stopPropagation();
				onEscape?.();
				return;
			}

			if (e.key !== 'Tab') return;

			const container = containerRef.current;
			if (!container) return;

			const focusableElements = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
			if (focusableElements.length === 0) return;

			const firstElement = focusableElements[0];
			const lastElement = focusableElements[focusableElements.length - 1];
			const activeElement = document.activeElement;

			if (e.shiftKey) {
				// Shift+Tab: going backwards
				if (activeElement === firstElement) {
					e.preventDefault();
					lastElement.focus();
				}
			} else {
				// Tab: going forwards
				if (activeElement === lastElement) {
					e.preventDefault();
					firstElement.focus();
				}
			}

			onKeyDown?.(e);
		},
		[onEscape, onKeyDown],
	);

	return (
		<div
			ref={containerRef}
			className={className}
			onKeyDown={handleKeyDown}
			tabIndex={-1}
			role="dialog"
			aria-modal="true"
		>
			{children}
		</div>
	);
}
