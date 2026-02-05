/**
 * Glide Data Grid Theme System matching globals.css
 *
 * Converts OKLCH values from globals.css to hex colors for the data grid theme.
 * This ensures the data grid matches the app's neutral gray color palette.
 */

import { useEffect, useMemo, useState } from 'react';
import type { Theme } from '@glideapps/glide-data-grid';
import { useTheme } from 'next-themes';

const lightThemeBase: Partial<Theme> = {
	accentColor: '#00a2ff', // oklch(0.688 0.1754 245.6151) - primary
	accentFg: '#FFFFFF',
	accentLight: 'rgba(99, 102, 241, 0.12)',

	textDark: '#525252', // oklch(0.3211 0 0) - foreground
	textMedium: '#737373', // Slightly lighter gray
	textLight: '#a3a3a3', // Even lighter gray
	textBubble: '#525252',

	bgIconHeader: '#737373',
	fgIconHeader: '#FFFFFF',
	textHeader: '#525252',
	textHeaderSelected: '#FFFFFF',

	bgCell: '#ffffff', // oklch(1 0 0) - background (pure white)
	bgCellMedium: '#f7f7f7', // oklch(0.967 0.001 286.375) - muted (very light gray)
	bgHeader: '#f7f7f7', // oklch(0.967 0.001 286.375) - muted
	bgHeaderHasFocus: '#e5e5e5', // oklch(0.92 0.004 286.32) - border color
	bgHeaderHovered: '#e5e5e5',

	bgBubble: '#f7f7f7',
	bgBubbleSelected: '#FFFFFF',

	bgSearchResult: '#fef3c7', // Keep amber for search results

	borderColor: 'rgba(229, 229, 229, 0.8)', // oklch(0.92 0.004 286.32) - border
	drilldownBorder: 'rgba(99, 102, 241, 0.3)',

	linkColor: '#00a2ff',

	headerFontStyle: '600 13px',
	baseFontStyle: '13px',
	fontFamily:
		'Inter, Roboto, -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Ubuntu, noto, arial, sans-serif',
};

/**
 * Dark theme matching globals.css OKLCH values
 * Based on your design system: oklch(0.21 0.006 285.885) backgrounds
 */
const darkThemeBase: Partial<Theme> = {
	accentColor: '#00a2ff',
	accentFg: '#FFFFFF',
	accentLight: 'rgba(99, 102, 241, 0.15)',

	textDark: '#fafafa', // oklch(0.985 0 0) - foreground (near white)
	textMedium: '#a3a3a3', // Lighter gray for dark theme
	textLight: '#737373', // Medium gray
	textBubble: '#fafafa',

	bgIconHeader: '#a3a3a3',
	fgIconHeader: '#353538',
	textHeader: '#fafafa',
	textHeaderSelected: '#FFFFFF',

	bgCell: '#18181B',
	bgCellMedium: '#313134', // oklch(0.20 0.006 285.97) - muted (darker gray)
	bgHeader: '#3e3e41', // oklch(0.244 0.006 285.97) - muted
	bgHeaderHasFocus: '#4a4a4e', // oklch(0.29 0.009 285.83) - border color
	bgHeaderHovered: '#4a4a4e',

	bgBubble: '#3e3e41',
	bgBubbleSelected: '#4a4a4e',

	bgSearchResult: '#92400e', // Darker amber for search results

	borderColor: 'rgba(74, 74, 78, 0.8)', // oklch(0.29 0.009 285.83) - border
	drilldownBorder: 'rgba(99, 102, 241, 0.4)',

	linkColor: '#00a2ff',

	headerFontStyle: '600 13px',
	baseFontStyle: '13px',
	fontFamily:
		'Inter, Roboto, -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Ubuntu, noto, arial, sans-serif',
};

/**
 * Create theme based on current mode (light/dark)
 */
function createThemeForMode(isDark: boolean): Partial<Theme> {
	return isDark ? darkThemeBase : lightThemeBase;
}

interface DataGridThemeResult {
	theme: Partial<Theme>;
	rowMarkerTheme: Partial<Theme>;
}

/**
 * Hook to get reactive Glide Data Grid theme with proper light/dark mode support
 * Uses hardcoded hex colors that match our design system
 */
export function useDataGridTheme(): DataGridThemeResult {
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [isDark, setIsDark] = useState(false);

	// Ensure we're mounted to avoid hydration mismatches
	useEffect(() => {
		setMounted(true);
	}, []);

	// Update theme data when theme changes
	useEffect(() => {
		if (!mounted) return;

		const updateThemeData = () => {
			// Detect dark mode by checking if 'dark' class is present on document element
			const darkMode = document.documentElement.classList.contains('dark');
			setIsDark(darkMode);
		};

		// Initial update
		updateThemeData();

		// Listen for theme changes via MutationObserver on document class changes
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
					// Small delay to ensure CSS has been applied
					setTimeout(updateThemeData, 10);
				}
			});
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		});

		return () => observer.disconnect();
	}, [mounted, resolvedTheme]);

	return useMemo(() => {
		const baseTheme = mounted ? createThemeForMode(isDark) : lightThemeBase;

		// Row marker theme - match header hover to eliminate visual gap
		// when hovering the first column header adjacent to the row marker
		const rowMarkerTheme: Partial<Theme> = {
			...baseTheme,
			// Use the same hover color for consistent appearance
			bgHeader: baseTheme.bgHeaderHovered,
			bgHeaderHasFocus: baseTheme.bgHeaderHovered,
			bgHeaderHovered: baseTheme.bgHeaderHovered,
		};

		return {
			theme: baseTheme,
			rowMarkerTheme,
		};
	}, [mounted, isDark]);
}
