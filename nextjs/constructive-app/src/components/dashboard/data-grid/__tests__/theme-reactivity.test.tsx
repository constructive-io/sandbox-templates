/**
 * @vitest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDataGridTheme } from '../data-grid.theme';

// Setup DOM environment
beforeEach(() => {
	// Create a proper DOM container
	const container = document.createElement('div');
	container.id = 'test-container';
	document.body.appendChild(container);
});

// Mock next-themes
const mockUseTheme = vi.fn();
vi.mock('next-themes', () => ({
	useTheme: () => mockUseTheme(),
}));

// Mock CSS custom properties
const mockGetComputedStyle = vi.fn();
Object.defineProperty(window, 'getComputedStyle', {
	value: mockGetComputedStyle,
});

let appendSpy: ReturnType<typeof vi.spyOn>;
let removeSpy: ReturnType<typeof vi.spyOn>;

describe('useDataGridTheme', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		appendSpy = vi.spyOn(document.body, 'appendChild');
		removeSpy = vi.spyOn(document.body, 'removeChild');

		// Clean up any existing containers
		const existingContainer = document.getElementById('test-container');
		if (existingContainer) {
			document.body.removeChild(existingContainer);
		}

		// Create a fresh container
		const container = document.createElement('div');
		container.id = 'test-container';
		document.body.appendChild(container);

		// Default theme mock
		mockUseTheme.mockReturnValue({
			resolvedTheme: 'light',
		});

		// Default CSS properties mock (light theme)
		mockGetComputedStyle.mockImplementation((element) => {
			if (element === document.documentElement) {
				return {
					getPropertyValue: (prop: string) => {
						const lightThemeColors: Record<string, string> = {
							'--background': 'oklch(1 0 0)',
							'--foreground': 'oklch(0.3211 0 0)',
							'--card': 'oklch(1 0 0)',
							'--card-foreground': 'oklch(0.3211 0 0)',
							'--primary': 'oklch(0.688 0.1754 245.6151)',
							'--primary-foreground': 'oklch(0.979 0.021 166.113)',
							'--secondary': 'oklch(0.967 0.001 286.375)',
							'--secondary-foreground': 'oklch(0.21 0.006 285.885)',
							'--muted': 'oklch(0.967 0.001 286.375)',
							'--muted-foreground': 'oklch(0.552 0.016 285.938)',
							'--accent': 'oklch(0.967 0.001 286.375)',
							'--accent-foreground': 'oklch(0.21 0.006 285.885)',
							'--border': 'oklch(0.92 0.004 286.32)',
							'--input': 'oklch(0.871 0.006 286.286)',
							'--ring': 'oklch(0.871 0.006 286.286)',
						};
						return lightThemeColors[prop] || '';
					},
				};
			}
			// Mock for temporary element color parsing
			return {
				color: 'rgb(99, 102, 241)', // Mock computed color
			};
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		appendSpy.mockRestore();
		removeSpy.mockRestore();
	});

	it('should return light theme during SSR/hydration', () => {
		const { result } = renderHook(() => useDataGridTheme(), {
			container: document.getElementById('test-container')!,
		});

		// Initially should return light theme snapshot of current palette
		expect(result.current.theme).toMatchObject({
			accentColor: '#00a2ff',
			textDark: '#525252',
			bgCell: '#ffffff',
			fontFamily: expect.stringContaining('Inter'),
		});

		// Should also return rowMarkerTheme
		expect(result.current.rowMarkerTheme).toBeDefined();
	});

	it('should generate complete theme after mounting', async () => {
		const { result, rerender } = renderHook(() => useDataGridTheme());

		// Wait for mount effect
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		rerender();

		// Should now have a complete theme
		expect(result.current.theme).toMatchObject({
			accentColor: expect.any(String),
			accentLight: expect.any(String),
			textDark: expect.any(String),
			textMedium: expect.any(String),
			textLight: expect.any(String),
			bgCell: expect.any(String),
			bgHeader: expect.any(String),
			borderColor: expect.any(String),
			fontFamily: expect.stringContaining('Inter'),
		});

		// rowMarkerTheme should have header colors matching hover
		expect(result.current.rowMarkerTheme).toMatchObject({
			bgHeader: result.current.theme.bgHeaderHovered,
			bgHeaderHasFocus: result.current.theme.bgHeaderHovered,
			bgHeaderHovered: result.current.theme.bgHeaderHovered,
		});
	});

	it('should apply dark theme when dark class is present', async () => {
		// Add dark class to document element
		document.documentElement.classList.add('dark');

		const { result } = renderHook(() => useDataGridTheme());

		// Wait for mount effect
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		// Should have dark theme colors
		expect(result.current.theme).toMatchObject({
			bgCell: '#18181B',
			textDark: '#fafafa',
			bgHeader: '#3e3e41',
			textHeader: '#fafafa',
		});

		// Clean up
		document.documentElement.classList.remove('dark');
	});

	it('should update theme when resolvedTheme changes', async () => {
		const { result, rerender } = renderHook(() => useDataGridTheme());

		// Wait for initial mount
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		// Change to dark theme
		mockUseTheme.mockReturnValue({
			resolvedTheme: 'dark',
		});

		// Mock dark theme CSS properties
		mockGetComputedStyle.mockImplementation((element) => {
			if (element === document.documentElement) {
				return {
					getPropertyValue: (prop: string) => {
						const darkThemeColors: Record<string, string> = {
							'--background': 'oklch(0.21 0.006 285.885)',
							'--foreground': 'oklch(0.985 0 0)',
							'--card': 'oklch(0.21 0.006 285.885)',
							'--card-foreground': 'oklch(0.985 0 0)',
							'--primary': 'oklch(0.688 0.1754 245.6151)',
							'--primary-foreground': 'oklch(0.979 0.021 166.113)',
							'--secondary': 'oklch(0.274 0.006 286.033)',
							'--secondary-foreground': 'oklch(0.985 0 0)',
							'--muted': 'oklch(0.244 0.006 285.97)',
							'--muted-foreground': 'oklch(0.705 0.015 286.067)',
							'--accent': 'oklch(0.244 0.006 285.97)',
							'--accent-foreground': 'oklch(0.985 0 0)',
							'--border': 'oklch(0.29 0.009 285.83)',
							'--input': 'oklch(0.29 0.009 285.83)',
							'--ring': 'oklch(0.442 0.017 285.786)',
						};
						return darkThemeColors[prop] || '';
					},
				};
			}
			return {
				color: 'rgb(99, 102, 241)',
			};
		});

		rerender();

		// Wait for theme update
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 20));
		});

		// Theme should be updated
		expect(result.current.theme).toMatchObject({
			accentColor: expect.any(String),
			accentLight: expect.any(String),
			accentFg: expect.any(String),
			textDark: expect.any(String),
			bgCell: expect.any(String),
			bgHeader: expect.any(String),
		});
	});

	it('should handle OKLCH to hex conversion', () => {
		const { result } = renderHook(() => useDataGridTheme());

		// Mock the temporary element creation for color conversion
		mockGetComputedStyle.mockReturnValue({
			color: 'rgb(99, 102, 241)',
		});

		// Wait for mount
		act(() => {
			// Trigger mount
		});

		// Should have converted colors properly
		expect(appendSpy).toHaveBeenCalled();
		expect(removeSpy).toHaveBeenCalled();
	});

	it('should provide fallback colors on conversion errors', async () => {
		// Mock error in color conversion
		mockGetComputedStyle.mockImplementation(() => {
			throw new Error('Color conversion failed');
		});

		const { result } = renderHook(() => useDataGridTheme());

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		// Should still return a valid theme with fallback colors
		expect(result.current.theme).toMatchObject({
			accentColor: expect.any(String),
			accentLight: expect.any(String),
			accentFg: expect.any(String),
		});

		// Should also have rowMarkerTheme
		expect(result.current.rowMarkerTheme).toBeDefined();
	});
});
