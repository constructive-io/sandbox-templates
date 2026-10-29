// Where to go after signing in: a same-site path from `?next=`, or the dashboard.
//
// Browsers read `\` as `/` and drop tabs and newlines inside URLs, so
// `/\evil.example`, `/%5Cevil.example` and `/\t/evil.example` can all leave the
// site. A value is kept only when it has neither (raw or percent-decoded) and
// resolves to this origin.

const UNSAFE = /[\\\u0000-\u001f\u007f]/;

function decoded(value: string): string {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

export function nextPath(value: string | null | undefined, origin = globalThis.location?.origin ?? 'http://localhost'): string {
	if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
	if (UNSAFE.test(value) || UNSAFE.test(decoded(value)) || decoded(value).startsWith('//')) return '/';
	let url: URL;
	try {
		url = new URL(value, origin);
	} catch {
		return '/';
	}
	if (url.origin !== new URL(origin).origin || !url.pathname.startsWith('/')) return '/';
	return `${url.pathname}${url.search}${url.hash}`;
}
