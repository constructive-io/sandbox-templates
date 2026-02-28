/**
 * Centralized branding configuration.
 *
 * Template users: edit this single file to customize all branding across the app.
 * All logo paths are relative to the /public directory.
 */

export interface LegalLink {
	label: string;
	href: string;
}

export interface BrandingConfig {
	/** Full company/app name shown when space allows */
	name: string;
	/** Tagline shown below the brand name (e.g. "powered by Constructive") */
	tagline: string;

	/** Logo mark (icon) — used in collapsed sidebar, watermarks, auth screens */
	logo: string;
	/** Full wordmark — used in expanded sidebar */
	wordmark: string;
	/** Optional dark-mode override for logo (null = use logo with currentColor) */
	logoDark: string | null;
	/** Optional dark-mode override for wordmark (null = use wordmark with currentColor) */
	wordmarkDark: string | null;

	/** Company name shown in legal footer */
	companyName: string;
	/** Legal links shown in auth footer */
	legalLinks: LegalLink[];

	/** Home path for brand logo links */
	homePath: string;
}

export const branding: BrandingConfig = {
	name: 'Airpage',
	tagline: 'powered by Constructive',

	logo: '/logo.svg',
	wordmark: '/wordmark.svg',
	logoDark: null,
	wordmarkDark: null,

	companyName: 'Airpage',
	legalLinks: [
		{ label: 'Disclaimer', href: 'https://airpage.com/legal/disclaimer' },
		{ label: 'Privacy Policy', href: 'https://airpage.com/legal/privacy-policy' },
	],

	homePath: '/',
};
