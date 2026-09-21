/**
 * Open-redirect guard for `next` / `returnTo` / `redirect` targets.
 *
 * A safe value is a site-local path: it starts with a single `/` and carries
 * no backslash and no ASCII control characters. Control characters matter
 * because the URL parser strips some of them (tab, CR, LF) before parsing,
 * so a value like `/%09/evil.org` resolves to `//evil.org` — an off-origin
 * redirect even though the raw text looks like a local path.
 */

/** Backslash or any ASCII control character (C0 + DEL). */
const UNSAFE_CHARS = /[\\\u0000-\u001f\u007f]/;

/** Whether `value` is a local path safe to navigate or redirect to. */
export function isLocalPath(value: string): boolean {
	return value.startsWith('/') && !value.startsWith('//') && !UNSAFE_CHARS.test(value);
}

/** `value` when it is a local path, `/` otherwise. */
export function toLocalPath(value: string | null): string {
	return value && isLocalPath(value) ? value : '/';
}
