// The signed-in session token, kept in browser storage.
//
// The storage contract is shared with the desktop, which signs the owner in
// by writing these keys into the Preview before the page loads:
//   constructive-auth-token:admin  JSON { id, userId, accessToken, accessTokenExpiresAt },
//                                  in localStorage when remember-me is on, else sessionStorage
//   constructive-remember-me:admin "true" | "false", always in localStorage
// Storage is read on every access, so a token written before load is picked up.

export const TOKEN_STORAGE_KEY = 'constructive-auth-token:admin';
export const REMEMBER_ME_KEY = 'constructive-remember-me:admin';

export type AuthToken = {
	id: string;
	userId: string;
	accessToken: string;
	accessTokenExpiresAt: string;
};

export type StoredToken = { token: AuthToken | null; rememberMe: boolean; raw: string };

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

// Refresh a little before the server would reject the token.
const EXPIRY_SKEW_MS = 30_000;

function storages(): { local: StorageLike | null; session: StorageLike | null } {
	if (typeof window === 'undefined') return { local: null, session: null };
	try {
		return { local: window.localStorage, session: window.sessionStorage };
	} catch {
		// Storage can throw when the browser blocks it; behave as signed out.
		return { local: null, session: null };
	}
}

function parseToken(raw: string | null): AuthToken | null {
	if (!raw) return null;
	try {
		const value = JSON.parse(raw) as Partial<AuthToken>;
		if (!value?.accessToken || !value.accessTokenExpiresAt) return null;
		return {
			id: String(value.id ?? ''),
			userId: String(value.userId ?? value.id ?? ''),
			accessToken: value.accessToken,
			accessTokenExpiresAt: value.accessTokenExpiresAt,
		};
	} catch {
		return null;
	}
}

/** Parses timestamps with microsecond fractions, which `Date.parse` rejects on some engines. */
export function expiresAtMs(value: string): number {
	const trimmed = value.replace(/(\.\d{3})\d+/, '$1');
	return Date.parse(trimmed);
}

export function isExpired(token: AuthToken, now = Date.now()): boolean {
	const expires = expiresAtMs(token.accessTokenExpiresAt);
	return !Number.isFinite(expires) || now >= expires - EXPIRY_SKEW_MS;
}

const listeners = new Set<() => void>();
// setTimeout holds at most about 24.8 days; a longer wait re-arms when it fires.
const MAX_TIMER_MS = 2 ** 31 - 1;
let expiryTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * While anything listens, a timer clears the token when it expires, so the
 * session flips to signed-out and the guard sends the user to sign in, rather
 * than the app carrying on with requests that go out without a token.
 */
function scheduleExpiry() {
	if (expiryTimer !== undefined) clearTimeout(expiryTimer);
	expiryTimer = undefined;
	const { token } = TokenManager.read();
	if (!listeners.size || !token) return;
	const wait = expiresAtMs(token.accessTokenExpiresAt) - EXPIRY_SKEW_MS - Date.now();
	expiryTimer = setTimeout(
		() => {
			const current = TokenManager.read().token;
			if (current && isExpired(current)) TokenManager.clear();
			else scheduleExpiry();
		},
		Number.isFinite(wait) ? Math.min(Math.max(wait, 0), MAX_TIMER_MS) : 0,
	);
}

function notify() {
	for (const listener of listeners) listener();
	scheduleExpiry();
}

export const TokenManager = {
	read(): StoredToken {
		const { local, session } = storages();
		const rememberMe = local?.getItem(REMEMBER_ME_KEY) === 'true';
		const preferred = rememberMe ? local : session;
		const other = rememberMe ? session : local;
		const raw = preferred?.getItem(TOKEN_STORAGE_KEY) ?? other?.getItem(TOKEN_STORAGE_KEY) ?? '';
		return { token: parseToken(raw), rememberMe, raw: `${rememberMe}:${raw}` };
	},

	write(token: AuthToken, rememberMe: boolean) {
		const { local, session } = storages();
		(rememberMe ? session : local)?.removeItem(TOKEN_STORAGE_KEY);
		(rememberMe ? local : session)?.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token));
		local?.setItem(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false');
		notify();
	},

	clear() {
		const { local, session } = storages();
		local?.removeItem(TOKEN_STORAGE_KEY);
		session?.removeItem(TOKEN_STORAGE_KEY);
		local?.removeItem(REMEMBER_ME_KEY);
		notify();
	},

	/** The bearer header for a live token, or nothing. */
	authorization(): Record<string, string> {
		const { token } = TokenManager.read();
		return token && !isExpired(token) ? { Authorization: `Bearer ${token.accessToken}` } : {};
	},

	/** Fires on writes from this tab and from other tabs. */
	subscribe(listener: () => void): () => void {
		listeners.add(listener);
		scheduleExpiry();
		const onStorage = (event: StorageEvent) => {
			if (event.key !== null && event.key !== TOKEN_STORAGE_KEY && event.key !== REMEMBER_ME_KEY) return;
			listener();
			scheduleExpiry();
		};
		if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
		return () => {
			listeners.delete(listener);
			if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
			scheduleExpiry();
		};
	},
};

/** The signed-in user's id, or null. */
export function currentUserId(): string | null {
	const { token } = TokenManager.read();
	return token ? token.userId || token.id : null;
}
