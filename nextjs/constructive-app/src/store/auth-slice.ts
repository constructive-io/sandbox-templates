import { StateCreator } from 'zustand';

import { getSchemaContext, type SchemaContext } from '@/lib/runtime/config-core';

/**
 * User profile information
 */
export interface UserProfile {
	id: string;
	email: string;
	// Add more user fields as needed
}

/**
 * API Token information from GraphQL
 */
export interface ApiToken {
	id: string;
	userId: string;
	accessToken: string;
	accessTokenExpiresAt: string; // ISO datetime string
	createdAt?: string;
	ip?: string;
	origin?: string;
	otToken?: string;
	uagent?: string;
}

/**
 * Authentication state for a single auth context
 */
export interface PerContextAuthState {
	isAuthenticated: boolean;
	isLoading: boolean;
	user: UserProfile | null;
	token: ApiToken | null;
	rememberMe: boolean;
}

/**
 * Scoped dashboard auth state - keyed by databaseId.
 * Each database has its own independent auth state.
 */
export type ScopedDashboardAuthState = Record<string, PerContextAuthState>;

/**
 * Current dashboard scope - tracks which databaseId is currently active.
 * This is used to determine which scoped auth state to use.
 */
export interface DashboardScope {
	databaseId: string | null;
}

export interface AuthState {
	/** Schema-builder auth (Tier 1) - single global state */
	schemaBuilderAuth: PerContextAuthState;
	/** Dashboard auth (Tier 2) - scoped by databaseId */
	dashboardAuthByScope: ScopedDashboardAuthState;
	/** Current dashboard scope */
	dashboardScope: DashboardScope;
	
	/**
	 * @deprecated Use schemaBuilderAuth and dashboardAuthByScope directly.
	 * Kept for backward compatibility during migration.
	 */
	authByContext: Record<SchemaContext, PerContextAuthState>;
}

/**
 * Authentication actions
 */
export interface AuthActions {
	// Core auth actions - now scope-aware for dashboard
	setAuthenticated: (user: UserProfile, token: ApiToken, rememberMe?: boolean, ctx?: SchemaContext, scope?: string) => void;
	setUnauthenticated: (ctx?: SchemaContext, scope?: string) => void;
	setLoading: (loading: boolean, ctx?: SchemaContext, scope?: string) => void;
	updateToken: (token: ApiToken, ctx?: SchemaContext, scope?: string) => void;
	clearToken: (ctx?: SchemaContext, scope?: string) => void;
	updateUser: (user: Partial<UserProfile>, ctx?: SchemaContext, scope?: string) => void;
	isTokenExpired: (ctx?: SchemaContext, scope?: string) => boolean;
	getAuthHeader: (ctx?: SchemaContext, scope?: string) => string | null;

	// Dashboard scope management
	setDashboardScope: (databaseId: string | null) => void;
	getDashboardScope: () => string | null;

	// Get auth state for a specific scope
	getAuthForScope: (ctx: SchemaContext, scope?: string) => PerContextAuthState;

	// Clear all dashboard auth (cascade logout)
	clearAllDashboardAuth: () => void;
}

/**
 * Combined auth slice type
 */
export type AuthSlice = AuthState & AuthActions;

/**
 * Initial auth state for a context
 */
const initialPerContextState: PerContextAuthState = {
	isAuthenticated: false,
	isLoading: true,
	user: null,
	token: null,
	rememberMe: false,
};

/**
 * Get the initial (unauthenticated, not loading) state
 */
const getUnauthenticatedState = (): PerContextAuthState => ({
	isAuthenticated: false,
	isLoading: false,
	user: null,
	token: null,
	rememberMe: false,
});

const initialAuthState: AuthState = {
	schemaBuilderAuth: { ...initialPerContextState },
	dashboardAuthByScope: {},
	dashboardScope: { databaseId: null },
	// Legacy compatibility - computed from new state
	authByContext: {
		dashboard: { ...initialPerContextState },
		'schema-builder': { ...initialPerContextState },
	},
};

/**
 * Helper to get auth state for a context and optional scope
 */
function getAuthStateForScope(state: AuthState, ctx: SchemaContext, scope?: string): PerContextAuthState {
	if (ctx === 'schema-builder') {
		return state.schemaBuilderAuth;
	}
	// Dashboard - use scoped state
	const effectiveScope = scope ?? state.dashboardScope.databaseId;
	if (effectiveScope && state.dashboardAuthByScope[effectiveScope]) {
		return state.dashboardAuthByScope[effectiveScope];
	}
	// No scope or no state for scope - return unauthenticated
	return getUnauthenticatedState();
}

/**
 * Helper to sync authByContext for backward compatibility
 */
function syncLegacyAuthByContext(state: AuthState): Record<SchemaContext, PerContextAuthState> {
	const dashboardScope = state.dashboardScope.databaseId;
	const dashboardAuth = dashboardScope && state.dashboardAuthByScope[dashboardScope]
		? state.dashboardAuthByScope[dashboardScope]
		: getUnauthenticatedState();
	
	return {
		'schema-builder': state.schemaBuilderAuth,
		dashboard: dashboardAuth,
	};
}

/**
 * Create auth slice for zustand store
 */
export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set, get) => ({
	...initialAuthState,

	setAuthenticated: (user, token, rememberMe = false, ctx = getSchemaContext(), scope) => {
		const newAuthState: PerContextAuthState = {
			isAuthenticated: true,
			isLoading: false,
			user,
			token,
			rememberMe,
		};

		if (ctx === 'schema-builder') {
			set((state) => {
				const newState = {
					...state,
					schemaBuilderAuth: newAuthState,
				};
				return {
					...newState,
					authByContext: syncLegacyAuthByContext(newState),
				};
			});
		} else {
			// Dashboard - use scoped state
			const effectiveScope = scope ?? get().dashboardScope.databaseId;
			if (!effectiveScope) {
				console.warn('[auth-slice] setAuthenticated called for dashboard without scope');
				return;
			}
			set((state) => {
				const newState = {
					...state,
					dashboardAuthByScope: {
						...state.dashboardAuthByScope,
						[effectiveScope]: newAuthState,
					},
				};
				return {
					...newState,
					authByContext: syncLegacyAuthByContext(newState),
				};
			});
		}
	},

	setUnauthenticated: (ctx = getSchemaContext(), scope) => {
		if (ctx === 'schema-builder') {
			// Guard: Skip if already unauthenticated
			if (!get().schemaBuilderAuth.isAuthenticated && !get().schemaBuilderAuth.isLoading) return;

			const unauthState = getUnauthenticatedState();
			set((state) => {
				const newState = {
					...state,
					schemaBuilderAuth: unauthState,
				};
				return {
					...newState,
					authByContext: syncLegacyAuthByContext(newState),
				};
			});
		} else {
			// Dashboard - clear scoped state
			const effectiveScope = scope ?? get().dashboardScope.databaseId;
			if (!effectiveScope) {
				// No scope - nothing to clear
				return;
			}
			// Guard: Skip if scope doesn't exist (already cleared)
			if (!get().dashboardAuthByScope[effectiveScope]) return;

			set((state) => {
				const { [effectiveScope]: _, ...remainingScopes } = state.dashboardAuthByScope;
				const newState = {
					...state,
					dashboardAuthByScope: remainingScopes,
				};
				return {
					...newState,
					authByContext: syncLegacyAuthByContext(newState),
				};
			});
		}
	},

	setLoading: (loading, ctx = getSchemaContext(), scope) => {
		if (ctx === 'schema-builder') {
			// Guard: Skip if loading state is already the same
			if (get().schemaBuilderAuth.isLoading === loading) return;

			set((state) => {
				const newState = {
					...state,
					schemaBuilderAuth: { ...state.schemaBuilderAuth, isLoading: loading },
				};
				return {
					...newState,
					authByContext: syncLegacyAuthByContext(newState),
				};
			});
		} else {
			const effectiveScope = scope ?? get().dashboardScope.databaseId;
			if (!effectiveScope) return;
			// Guard: Skip if loading state is already the same
			const currentScopedAuth = get().dashboardAuthByScope[effectiveScope];
			if (currentScopedAuth?.isLoading === loading) return;

			set((state) => {
				const scopedAuth = state.dashboardAuthByScope[effectiveScope] ?? getUnauthenticatedState();
				const newState = {
					...state,
					dashboardAuthByScope: {
						...state.dashboardAuthByScope,
						[effectiveScope]: { ...scopedAuth, isLoading: loading },
					},
				};
				return {
					...newState,
					authByContext: syncLegacyAuthByContext(newState),
				};
			});
		}
	},

	updateToken: (token, ctx = getSchemaContext(), scope) => {
		if (ctx === 'schema-builder') {
			set((state) => {
				const newState = {
					...state,
					schemaBuilderAuth: { ...state.schemaBuilderAuth, token },
				};
				return {
					...newState,
					authByContext: syncLegacyAuthByContext(newState),
				};
			});
		} else {
			const effectiveScope = scope ?? get().dashboardScope.databaseId;
			if (!effectiveScope) return;
			set((state) => {
				const currentScopedAuth = state.dashboardAuthByScope[effectiveScope];
				if (!currentScopedAuth) return state;
				const newState = {
					...state,
					dashboardAuthByScope: {
						...state.dashboardAuthByScope,
						[effectiveScope]: { ...currentScopedAuth, token },
					},
				};
				return {
					...newState,
					authByContext: syncLegacyAuthByContext(newState),
				};
			});
		}
	},

	clearToken: (ctx = getSchemaContext(), scope) => {
		if (ctx === 'schema-builder') {
			set((state) => {
				const newState = {
					...state,
					schemaBuilderAuth: { ...state.schemaBuilderAuth, token: null, isAuthenticated: false },
				};
				return {
					...newState,
					authByContext: syncLegacyAuthByContext(newState),
				};
			});
		} else {
			const effectiveScope = scope ?? get().dashboardScope.databaseId;
			if (!effectiveScope) return;
			set((state) => {
				const currentScopedAuth = state.dashboardAuthByScope[effectiveScope];
				if (!currentScopedAuth) return state;
				const newState = {
					...state,
					dashboardAuthByScope: {
						...state.dashboardAuthByScope,
						[effectiveScope]: { ...currentScopedAuth, token: null, isAuthenticated: false },
					},
				};
				return {
					...newState,
					authByContext: syncLegacyAuthByContext(newState),
				};
			});
		}
	},

	updateUser: (userUpdate, ctx = getSchemaContext(), scope) => {
		if (ctx === 'schema-builder') {
			const currentUser = get().schemaBuilderAuth.user;
			if (!currentUser) return;
			set((state) => {
				const newState = {
					...state,
					schemaBuilderAuth: { ...state.schemaBuilderAuth, user: { ...currentUser, ...userUpdate } },
				};
				return {
					...newState,
					authByContext: syncLegacyAuthByContext(newState),
				};
			});
		} else {
			const effectiveScope = scope ?? get().dashboardScope.databaseId;
			if (!effectiveScope) return;
			const currentScopedAuth = get().dashboardAuthByScope[effectiveScope];
			if (!currentScopedAuth?.user) return;
			set((state) => {
				const newState = {
					...state,
					dashboardAuthByScope: {
						...state.dashboardAuthByScope,
						[effectiveScope]: {
							...currentScopedAuth,
							user: { ...currentScopedAuth.user!, ...userUpdate },
						},
					},
				};
				return {
					...newState,
					authByContext: syncLegacyAuthByContext(newState),
				};
			});
		}
	},

	isTokenExpired: (ctx = getSchemaContext(), scope) => {
		const authState = getAuthStateForScope(get(), ctx, scope);
		const token = authState.token;
		if (!token) return true;
		const expiresAt = new Date(token.accessTokenExpiresAt);
		const now = new Date();
		const bufferTime = 5 * 60 * 1000; // 5 minutes
		return now.getTime() >= expiresAt.getTime() - bufferTime;
	},

	getAuthHeader: (ctx = getSchemaContext(), scope) => {
		const authState = getAuthStateForScope(get(), ctx, scope);
		if (!authState.isAuthenticated || !authState.token) return null;
		return `Bearer ${authState.token.accessToken}`;
	},

	// Dashboard scope management
	setDashboardScope: (databaseId) => {
		// Guard: Skip update if value hasn't changed (prevents unnecessary re-renders)
		if (get().dashboardScope.databaseId === databaseId) return;

		set((state) => {
			const newState = {
				...state,
				dashboardScope: { databaseId },
			};
			return {
				...newState,
				authByContext: syncLegacyAuthByContext(newState),
			};
		});
	},

	getDashboardScope: () => {
		return get().dashboardScope.databaseId;
	},

	getAuthForScope: (ctx, scope) => {
		return getAuthStateForScope(get(), ctx, scope);
	},

	clearAllDashboardAuth: () => {
		set((state) => {
			const newState = {
				...state,
				dashboardAuthByScope: {},
				dashboardScope: { databaseId: null },
			};
			return {
				...newState,
				authByContext: syncLegacyAuthByContext(newState),
			};
		});
	},
});

/**
 * Serialize auth slice for persistence
 * Only persist essential data, not loading states
 */
export const serializeAuthSlice = (state: AuthSlice) => {
	// Serialize schema-builder auth
	const schemaBuilderAuth = state.schemaBuilderAuth.rememberMe
		? { ...state.schemaBuilderAuth, isLoading: false }
		: getUnauthenticatedState();

	// Serialize scoped dashboard auth - only persist those with rememberMe=true
	const dashboardAuthByScope: ScopedDashboardAuthState = {};
	for (const [scope, authState] of Object.entries(state.dashboardAuthByScope)) {
		if (authState.rememberMe) {
			dashboardAuthByScope[scope] = { ...authState, isLoading: false };
		}
	}

	return {
		schemaBuilderAuth,
		dashboardAuthByScope,
		dashboardScope: state.dashboardScope,
		// Legacy compatibility
		authByContext: {
			dashboard: getUnauthenticatedState(), // Don't persist legacy dashboard
			'schema-builder': schemaBuilderAuth,
		},
	};
};

/**
 * Validate and clean a persisted auth state
 */
function validatePersistedAuth(auth: PerContextAuthState | undefined): PerContextAuthState {
	if (!auth || !auth.rememberMe || !auth.token) {
		return getUnauthenticatedState();
	}
	// If expired, drop token and reset
	try {
		const expiresAt = new Date(auth.token.accessTokenExpiresAt);
		if (new Date() >= expiresAt) {
			return getUnauthenticatedState();
		}
	} catch {
		return getUnauthenticatedState();
	}
	// Valid - set loading=true so AuthProvider can finalize
	return { ...auth, isLoading: true };
}

/**
 * Deserialize auth slice from persistence
 * Restore state and validate token expiration
 */
export const deserializeAuthSlice = (state: any): Partial<AuthSlice> => {
	// Try new format first
	if (state.schemaBuilderAuth) {
		const schemaBuilderAuth = validatePersistedAuth(state.schemaBuilderAuth);
		
		// Restore scoped dashboard auth
		const dashboardAuthByScope: ScopedDashboardAuthState = {};
		if (state.dashboardAuthByScope) {
			for (const [scope, authState] of Object.entries(state.dashboardAuthByScope as ScopedDashboardAuthState)) {
				const validated = validatePersistedAuth(authState);
				if (validated.isAuthenticated || validated.isLoading) {
					dashboardAuthByScope[scope] = validated;
				}
			}
		}

		const dashboardScope = state.dashboardScope ?? { databaseId: null };

		// Compute legacy authByContext
		const dashboardAuth = dashboardScope.databaseId && dashboardAuthByScope[dashboardScope.databaseId]
			? dashboardAuthByScope[dashboardScope.databaseId]
			: getUnauthenticatedState();

		return {
			schemaBuilderAuth,
			dashboardAuthByScope,
			dashboardScope,
			authByContext: {
				'schema-builder': schemaBuilderAuth,
				dashboard: dashboardAuth,
			},
		};
	}

	// Fallback: migrate from legacy format
	const stored = state.authByContext as Record<SchemaContext, PerContextAuthState> | undefined;
	if (!stored) {
		return {
			schemaBuilderAuth: getUnauthenticatedState(),
			dashboardAuthByScope: {},
			dashboardScope: { databaseId: null },
			authByContext: {
				dashboard: getUnauthenticatedState(),
				'schema-builder': getUnauthenticatedState(),
			},
		};
	}

	const schemaBuilderAuth = validatePersistedAuth(stored['schema-builder']);
	// Note: legacy dashboard token is NOT migrated - user must re-auth per database

	return {
		schemaBuilderAuth,
		dashboardAuthByScope: {},
		dashboardScope: { databaseId: null },
		authByContext: {
			'schema-builder': schemaBuilderAuth,
			dashboard: getUnauthenticatedState(),
		},
	};
};
