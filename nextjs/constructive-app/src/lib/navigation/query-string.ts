/**
 * query-string.ts — small URL query-param helpers shared by the auth surface.
 *
 * (Previously these lived in the now-removed invite page. They are generic
 * query-string utilities — the auth sign-in / sign-up links use them to carry
 * query params, e.g. a prefilled `email`, across navigation.)
 */

/** Well-known query parameter keys used across the auth surface. */
export const AUTH_QUERY_PARAMS = {
	EMAIL: 'email',
	REDIRECT: 'redirect',
} as const;

/**
 * Build a query string from a URLSearchParams object.
 * @returns a string with a leading '?' or an empty string when there are none.
 */
export function buildQueryString(searchParams: URLSearchParams | null): string {
	if (!searchParams) return '';
	const params = new URLSearchParams();
	searchParams.forEach((value, key) => {
		params.set(key, value);
	});
	return params.toString() ? `?${params.toString()}` : '';
}
