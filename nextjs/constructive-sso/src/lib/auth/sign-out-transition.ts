/**
 * The in-memory sign-out transition.
 *
 * `useLogout` flips the auth store to unauthenticated before it hands the
 * browser to the gateway's sign-in page. The app's auth-reactive redirects
 * must not act on that intermediate state: the home page's login-loop guard
 * would race that navigation with its own `/login` trip, and the route guards
 * would replace the current route with `/` while the browser is already leaving.
 *
 * This is module state, not React state: the flag has to be visible to the
 * hook and to every guard in the same render, before React can paint the
 * signed-out state. A full page load is what resets it, and the sign-out
 * navigation is exactly that; a page restored from the back-forward cache is
 * not a load, so `pageshow` retires the flag there too.
 */
let signingOut = false;

if (typeof window !== 'undefined') {
	window.addEventListener('pageshow', (event) => {
		if (event.persisted) signingOut = false;
	});
}

/** Mark the current document as leaving for the gateway's sign-in page. */
export function beginSignOut(): void {
	signingOut = true;
}

/** Whether the current document is in the sign-out handoff. */
export function isSigningOut(): boolean {
	return signingOut;
}
