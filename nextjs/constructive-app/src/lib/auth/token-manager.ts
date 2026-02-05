import type { ApiToken } from '@/store/auth-slice';
import { getSchemaContext, type SchemaContext } from '@/app-config';

/**
 * Scope identifier for dashboard tokens (e.g., databaseId).
 * Schema-builder tokens are never scoped.
 */
export type TokenScope = string | null;

/**
 * Token storage keys
 * - Schema-builder: `constructive-auth-token:schema-builder`
 * - Dashboard (scoped): `constructive-auth-token:dashboard:{databaseId}`
 * - Dashboard (legacy/unscoped): `constructive-auth-token:dashboard`
 */
const TOKEN_STORAGE_KEY = (ctx: SchemaContext, scope?: TokenScope) => {
	if (ctx === 'dashboard' && scope) {
		return `constructive-auth-token:dashboard:${scope}`;
	}
	return `constructive-auth-token:${ctx}`;
};

const REMEMBER_ME_KEY = (ctx: SchemaContext, scope?: TokenScope) => {
	if (ctx === 'dashboard' && scope) {
		return `constructive-remember-me:dashboard:${scope}`;
	}
	return `constructive-remember-me:${ctx}`;
};

/**
 * Key prefix for scoped dashboard tokens (used for enumeration/cleanup)
 */
const DASHBOARD_TOKEN_PREFIX = "constructive-auth-token:";
const DASHBOARD_REMEMBER_PREFIX = "constructive-remember-me:";

/**
 * Token manager for handling token persistence
 * Uses localStorage for persistent storage (remember me) or sessionStorage for session-only
 */
export class TokenManager {
	// In-memory cache to minimize storage reads
	// For schema-builder: cache['schema-builder'] = { token, rememberMe }
	// For dashboard: cache['dashboard:{databaseId}'] = { token, rememberMe }
	private static cache: Record<string, { token: ApiToken | null; rememberMe: boolean }> = {};

	/**
	 * Generate a cache key for the given context and scope
	 */
	private static cacheKey(ctx: SchemaContext, scope?: TokenScope): string {
		if (ctx === 'dashboard' && scope) {
			return `dashboard:${scope}`;
		}
		return ctx;
	}

	// Sync between tabs via storage events
	static initStorageSync(): void {
		if (typeof window === 'undefined') return;
		if ((window as any).__constructive_token_sync__) return; // idempotent
		(window as any).__constructive_token_sync__ = true;
		window.addEventListener('storage', (e) => {
			if (!e.key) return;
			// Match current constructive keys and scoped keys
			// Unscoped: constructive-auth-token:schema-builder, constructive-auth-token:dashboard
			// Scoped: constructive-auth-token:dashboard:{databaseId}
			const unscopedMatch = e.key.match(/^constructive-(auth-token|remember-me):(schema-builder|dashboard)$/);
			const scopedMatch = e.key.match(/^constructive-(auth-token|remember-me):dashboard:(.+)$/);
			
			if (unscopedMatch) {
				const ctx = unscopedMatch[2] as SchemaContext;
				delete TokenManager.cache[ctx];
			} else if (scopedMatch) {
				const scope = scopedMatch[2];
				delete TokenManager.cache[`dashboard:${scope}`];
			}
		});
	}
	/**
	 * Helpers to obtain current context when not explicitly provided
	 */
	private static currentCtx(): SchemaContext {
		return getSchemaContext();
	}

	/**
	 * Store token with appropriate persistence based on remember me preference
	 * 
	 * @param token - The API token to store
	 * @param rememberMe - Whether to persist in localStorage (true) or sessionStorage (false)
	 * @param ctx - Schema context (dashboard or schema-builder)
	 * @param scope - Optional scope for dashboard tokens (e.g., databaseId). Ignored for schema-builder.
	 */
	static setToken(
		token: ApiToken,
		rememberMe: boolean = false,
		ctx: SchemaContext = TokenManager.currentCtx(),
		scope?: TokenScope,
	): void {
		try {
			// Schema-builder never uses scope
			const effectiveScope = ctx === 'schema-builder' ? null : scope;
			const tokenData = JSON.stringify(token);
			const storage = rememberMe ? localStorage : sessionStorage;
			const storageKey = TOKEN_STORAGE_KEY(ctx, effectiveScope);

			storage.setItem(storageKey, tokenData);

			// Store remember me preference in localStorage for consistency
			localStorage.setItem(REMEMBER_ME_KEY(ctx, effectiveScope), JSON.stringify(rememberMe));

			// Update in-memory cache
			const cacheKey = TokenManager.cacheKey(ctx, effectiveScope);
			TokenManager.cache[cacheKey] = { token, rememberMe };
		} catch {
			// Silent failure - storage might not be available
		}
	}

	/**
	 * Retrieve token from storage
	 * Checks both localStorage and sessionStorage
	 * 
	 * @param ctx - Schema context (dashboard or schema-builder)
	 * @param scope - Optional scope for dashboard tokens (e.g., databaseId). Ignored for schema-builder.
	 */
	static getToken(
		ctx: SchemaContext = TokenManager.currentCtx(),
		scope?: TokenScope,
	): { token: ApiToken | null; rememberMe: boolean } {
		try {
			// Schema-builder never uses scope
			const effectiveScope = ctx === 'schema-builder' ? null : scope;
			const cacheKey = TokenManager.cacheKey(ctx, effectiveScope);
			const storageKey = TOKEN_STORAGE_KEY(ctx, effectiveScope);

			// Fast path: return cached values if present
			const cached = TokenManager.cache[cacheKey];
			if (cached) {
				return cached;
			}

			// Check remember me preference first
			const rememberMeKey = REMEMBER_ME_KEY(ctx, effectiveScope);
			const rememberMeStr = localStorage.getItem(rememberMeKey);
			const rememberMe = rememberMeStr ? JSON.parse(rememberMeStr) : false;

			// Try to get token from appropriate storage
			const storage = rememberMe ? localStorage : sessionStorage;
			const tokenStr = storage.getItem(storageKey);

			if (!tokenStr) {
				// If not found in expected storage, try the other one
				const alternativeStorage = rememberMe ? sessionStorage : localStorage;
				const alternativeTokenStr = alternativeStorage.getItem(storageKey);

				if (alternativeTokenStr) {
					const token = JSON.parse(alternativeTokenStr) as ApiToken;
					TokenManager.cache[cacheKey] = { token, rememberMe };
					return { token, rememberMe };
				}

				return { token: null, rememberMe: false };
			}

			const token = JSON.parse(tokenStr) as ApiToken;
			const result = { token, rememberMe } as const;
			TokenManager.cache[cacheKey] = { token, rememberMe };
			return result;
		} catch {
			// Return safe defaults on parsing error
			return { token: null, rememberMe: false };
		}
	}

	/**
	 * Remove token from all storage locations
	 * 
	 * @param ctx - Schema context (dashboard or schema-builder)
	 * @param scope - Optional scope for dashboard tokens (e.g., databaseId). Ignored for schema-builder.
	 */
	static clearToken(ctx: SchemaContext = TokenManager.currentCtx(), scope?: TokenScope): void {
		try {
			// Schema-builder never uses scope
			const effectiveScope = ctx === 'schema-builder' ? null : scope;
			const cacheKey = TokenManager.cacheKey(ctx, effectiveScope);

			localStorage.removeItem(TOKEN_STORAGE_KEY(ctx, effectiveScope));
			sessionStorage.removeItem(TOKEN_STORAGE_KEY(ctx, effectiveScope));
			localStorage.removeItem(REMEMBER_ME_KEY(ctx, effectiveScope));
			delete TokenManager.cache[cacheKey];
		} catch {
			// Silent failure - continue cleanup
		}
	}

	/**
	 * Clear ALL scoped dashboard tokens.
	 * Use this when logging out of schema-builder (Tier 1) to cascade logout.
	 */
	static clearAllDashboardTokens(): void {
		try {
			// Find and remove all scoped dashboard tokens from localStorage
			const keysToRemove: string[] = [];
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key && (key.startsWith(DASHBOARD_TOKEN_PREFIX) || key.startsWith(DASHBOARD_REMEMBER_PREFIX))) {
					keysToRemove.push(key);
				}
			}
			keysToRemove.forEach((key) => localStorage.removeItem(key));

			// Find and remove from sessionStorage
			const sessionKeysToRemove: string[] = [];
			for (let i = 0; i < sessionStorage.length; i++) {
				const key = sessionStorage.key(i);
				if (key && key.startsWith(DASHBOARD_TOKEN_PREFIX)) {
					sessionKeysToRemove.push(key);
				}
			}
			sessionKeysToRemove.forEach((key) => sessionStorage.removeItem(key));
 
			// Clear all dashboard entries from cache
			Object.keys(TokenManager.cache).forEach((key) => {
				if (key === 'dashboard' || key.startsWith('dashboard:')) {
					delete TokenManager.cache[key];
				}
			});
		} catch {
			// Silent failure
		}
	}

	/**
	 * Get all stored dashboard scopes (databaseIds) that have tokens.
	 * Useful for displaying which databases the user is authenticated to.
	 */
	static getDashboardScopes(): string[] {
		const scopes: string[] = [];
		try {
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key && key.startsWith(DASHBOARD_TOKEN_PREFIX)) {
					const scope = key.slice(DASHBOARD_TOKEN_PREFIX.length);
					if (scope) scopes.push(scope);
				}
			}
			for (let i = 0; i < sessionStorage.length; i++) {
				const key = sessionStorage.key(i);
				if (key && key.startsWith(DASHBOARD_TOKEN_PREFIX)) {
					const scope = key.slice(DASHBOARD_TOKEN_PREFIX.length);
					if (scope && !scopes.includes(scope)) scopes.push(scope);
				}
			}
		} catch {
			// Silent failure
		}
		return scopes;
	}

	/**
	 * Check if token exists in storage
	 * 
	 * @param ctx - Schema context (dashboard or schema-builder)
	 * @param scope - Optional scope for dashboard tokens (e.g., databaseId). Ignored for schema-builder.
	 */
	static hasToken(ctx: SchemaContext = TokenManager.currentCtx(), scope?: TokenScope): boolean {
		try {
			// Schema-builder never uses scope
			const effectiveScope = ctx === 'schema-builder' ? null : scope;
			const hasInLocal = localStorage.getItem(TOKEN_STORAGE_KEY(ctx, effectiveScope)) !== null;
			const hasInSession = sessionStorage.getItem(TOKEN_STORAGE_KEY(ctx, effectiveScope)) !== null;
			return hasInLocal || hasInSession;
		} catch {
			// Assume no token on storage error
			return false;
		}
	}

	/**
	 * Check if token is expired
	 */
	static isTokenExpired(token: ApiToken): boolean {
		try {
			const expiresAtMs = this.parseExpiresAtMs(token.accessTokenExpiresAt);
			if (!Number.isFinite(expiresAtMs)) return true;
			const now = new Date();

			// Add 5 minute buffer before expiration
			const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
			return now.getTime() >= expiresAtMs - bufferTime;
		} catch {
			// Assume expired if we can't parse the date
			return true;
		}
	}

	/**
	 * Get time until token expires (in milliseconds)
	 * Returns 0 if token is expired or invalid
	 */
	static getTimeUntilExpiration(token: ApiToken): number {
		try {
			const expiresAtMs = this.parseExpiresAtMs(token.accessTokenExpiresAt);
			if (!Number.isFinite(expiresAtMs)) return Number.NaN;
			const now = Date.now();
			const timeUntilExpiration = expiresAtMs - now;
			return timeUntilExpiration;
		} catch {
			// Token parsing failed, consider it expired
			return 0;
		}
	}

	/**
	 * Format token for Authorization header
	 */
	static formatAuthHeader(token: ApiToken): string {
		return `Bearer ${token.accessToken}`;
	}

	/**
	 * Migrate token from old storage format if needed
	 * This can be used for backwards compatibility
	 */
	static migrateTokenStorage(): void {
		// Implementation for migrating from old token storage format
		// Can be expanded as needed for future migrations
	}

	/**
	 * Parse ISO date string with potential microseconds into a valid JS timestamp (ms)
	 */
	private static parseExpiresAtMs(value: string): number {
		try {
			let s = value;
			const dot = s.indexOf('.');
			if (dot !== -1) {
				// find timezone start (Z, +, or -) after the fractional seconds
				let tzPos = s.indexOf('Z', dot);
				if (tzPos === -1) {
					const plus = s.indexOf('+', dot);
					const minus = s.indexOf('-', dot);
					tzPos = plus !== -1 && minus !== -1 ? Math.min(plus, minus) : Math.max(plus, minus);
				}
				const end = tzPos !== -1 ? tzPos : s.length;
				const frac = s.slice(dot + 1, end).replace(/[^0-9]/g, '');
				const frac3 = (frac.slice(0, 3) || '').padEnd(3, '0');
				s = s.slice(0, dot) + '.' + frac3 + (tzPos !== -1 ? s.slice(tzPos) : '');
			}
			const ms = Date.parse(s);
			return ms;
		} catch {
			return Number.NaN;
		}
	}
}
