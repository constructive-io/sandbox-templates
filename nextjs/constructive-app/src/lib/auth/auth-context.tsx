'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';

import { useExtendToken } from '@/lib/gql/hooks/auth';
import { useLogin } from '@/lib/gql/hooks/auth';
import { useLogout } from '@/lib/gql/hooks/auth';
import type { DirectConnectConfig, SchemaContext } from '@/lib/runtime/config-core';
import { shouldBypassAuth } from '@/lib/runtime/direct-connect';
import { initEnvOverridesSync } from '@/lib/runtime/env-sync';
import { useAppStore, useAuth, useAuthActions, appStore } from '@/store/app-store';
import type { UserProfile } from '@/store/auth-slice';
import { detectSchemaContextFromPath } from '@/app-config';

import type { LoginFormData } from './schemas';
import { TokenManager } from './token-manager';

/**
 * Authentication context interface
 */
interface AuthContextType {
	// State
	isAuthenticated: boolean;
	isLoading: boolean;
	user: UserProfile | null;

	// Actions
	login: (credentials: LoginFormData) => Promise<void>;
	logout: () => Promise<void>;
	extendToken: (intervalInput?: { hours?: number; minutes?: number; days?: number }) => Promise<void>;

	// Utilities
	checkAuthStatus: () => void;
}

/**
 * Authentication context
 */
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Hook to use authentication context
 */
export function useAuthContext(): AuthContextType {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuthContext must be used within an AuthProvider');
	}
	return context;
}

/**
 * Initialize auth state for a specific context.
 * Checks token storage and updates the auth slice accordingly.
 * 
 * @param targetCtx - Schema context (dashboard or schema-builder)
 * @param authActions - Auth actions from store
 * @param directConnect - Direct connect configuration
 * @param userEmail - Email from previous auth state
 * @param scope - Optional scope for dashboard tokens (e.g., databaseId)
 */
function initializeAuth(
	authActions: ReturnType<typeof useAuthActions>,
	directConnect: Record<SchemaContext, DirectConnectConfig>,
) {
	const isAuthBypassed = shouldBypassAuth('schema-builder', directConnect);

	// Direct Connect with skipAuth: mark as authenticated with synthetic token
	if (isAuthBypassed) {
		authActions.setAuthenticated(
			{ id: 'direct-connect', email: 'direct-connect@localhost' },
			{
				id: 'direct-connect',
				userId: 'direct-connect',
				accessToken: '',
				accessTokenExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
			},
			false,
		);
		return;
	}

	const { token, rememberMe } = TokenManager.getToken('schema-builder');

	if (!token) {
		authActions.setUnauthenticated();
		authActions.setLoading(false);
		return;
	}

	if (TokenManager.isTokenExpired(token)) {
		TokenManager.clearToken('schema-builder');
		authActions.setUnauthenticated();
		authActions.setLoading(false);
		return;
	}

	const user: UserProfile = {
		id: token.userId ?? token.id,
		email: '',
	};

	authActions.setAuthenticated(user, token, rememberMe);
}

/**
 * Authentication provider component
 *
 * Supports Direct Connect: when enabled for a context with skipAuth, marks as authenticated without real tokens
 *
 * IMPORTANT: This provider initializes auth for BOTH contexts on mount:
 * - schema-builder (Tier 1 / app-level auth) - always initialized
 * - dashboard (Tier 2 / per-database auth) - scoped by databaseId, initialized based on current route and scope
 *
 * This ensures the AppShell can check Tier 1 auth regardless of which route the user starts on.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const ctx = detectSchemaContextFromPath(pathname || '/');
	const auth = useAuth();
	const authActions = useAuthActions();

	// Get Direct Connect state - subscribe to changes
	const directConnect = useAppStore((state) => state.env.directConnect);
	const isAuthBypassed = shouldBypassAuth(ctx, directConnect);

	// Use the new custom hooks
	const loginMutation = useLogin();
	const logoutMutation = useLogout();
	const extendTokenMutation = useExtendToken();

	// Track if auth has been initialized to avoid redundant initializations
	const hasInitialized = useRef(false);

	// Check authentication status
	const checkAuthStatus = useCallback(() => {
		initializeAuth(authActions, directConnect);
	}, [authActions, directConnect]);

	// Initialize auth state on mount
	useEffect(() => {
		if (hasInitialized.current) return;
		hasInitialized.current = true;

		TokenManager.initStorageSync();
		initEnvOverridesSync();

		initializeAuth(authActions, directConnect);
	}, [authActions, directConnect]);

	// Set up token expiration monitoring and automatic refresh
	useEffect(() => {
		// Skip token monitoring when auth is bypassed - no real tokens to monitor
		if (isAuthBypassed) {
			return;
		}

		if (!auth.isAuthenticated || !auth.token) {
			return;
		}

		const timeUntilExpiration = TokenManager.getTimeUntilExpiration(auth.token);
		if (!Number.isFinite(timeUntilExpiration) || timeUntilExpiration <= 0) {
			return;
		}

		// Only set up monitoring if token has reasonable time left
		const minimumTime = 10 * 60 * 1000; // 10 minutes
		if (timeUntilExpiration <= minimumTime) {
			return;
		}

		// Set up automatic token refresh 15 minutes before expiration
		const refreshBuffer = 15 * 60 * 1000; // 15 minutes
		const MAX_TIMEOUT = 2_147_483_647; // ~24.8 days, browser setTimeout cap
		const timeUntilRefresh = Math.max(0, Math.min(MAX_TIMEOUT, timeUntilExpiration - refreshBuffer));

		// Set up automatic logout 5 minutes before expiration (fallback)
		const logoutBuffer = 5 * 60 * 1000; // 5 minutes
		const timeUntilLogout = Math.max(0, Math.min(MAX_TIMEOUT, timeUntilExpiration - logoutBuffer));

		let refreshTimeoutId: NodeJS.Timeout | null = null;
		let logoutTimeoutId: NodeJS.Timeout | null = null;

		// Schedule token refresh
		if (timeUntilRefresh > 0) {
			refreshTimeoutId = setTimeout(() => {
				extendTokenMutation.mutate({ hours: 1 });
			}, timeUntilRefresh);
		}

		// Schedule logout as fallback
		if (timeUntilLogout > 0) {
			logoutTimeoutId = setTimeout(() => {
				logoutMutation.mutate();
			}, timeUntilLogout);
		}

		return () => {
			if (refreshTimeoutId) clearTimeout(refreshTimeoutId);
			if (logoutTimeoutId) clearTimeout(logoutTimeoutId);
		};
	}, [auth.isAuthenticated, auth.token, extendTokenMutation, logoutMutation, isAuthBypassed]);

	// Stable action callbacks to prevent context re-renders
	const login = useCallback(
		async (credentials: LoginFormData) => {
			// When auth bypassed, simulate success without network
			if (isAuthBypassed) {
				authActions.setAuthenticated(
					{ id: 'direct-connect', email: credentials.email || 'direct-connect@localhost' },
					{
						id: 'direct-connect',
						userId: 'direct-connect',
						accessToken: '',
						accessTokenExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
					},
					Boolean(credentials.rememberMe),
				);
				return;
			}
			// Note: We intentionally do NOT call setLoading() here.
			// The form manages its own isSubmitting state. Setting auth loading
			// would cause AuthGate to unmount the form (switching to spinner),
			// which loses the form's local error state when login fails.
			await loginMutation.mutateAsync(credentials);
		},
		[isAuthBypassed, authActions, loginMutation],
	);

	const logout = useCallback(async () => {
		// When auth bypassed, logout is a no-op (there's no real session)
		if (isAuthBypassed) {
			return;
		}
		await logoutMutation.mutateAsync(undefined);
	}, [isAuthBypassed, logoutMutation]);

	const extendToken = useCallback(
		async (intervalInput?: { hours?: number; minutes?: number; days?: number }) => {
			// When auth bypassed, token extension is a no-op
			if (isAuthBypassed) return;
			await extendTokenMutation.mutateAsync(intervalInput);
		},
		[isAuthBypassed, extendTokenMutation],
	);

	// Memoized context value - prevents unnecessary re-renders of consumers
	const contextValue = useMemo<AuthContextType>(
		() => ({
			// State - when auth bypassed, always authenticated with no loading
			isAuthenticated: isAuthBypassed ? true : auth.isAuthenticated,
			// Note: loginMutation.isPending is intentionally excluded from isLoading.
			// Including it would cause AuthGate to show a spinner (unmounting the form),
			// which loses the form's local error state when login fails with invalid credentials.
			// The form manages its own isSubmitting state for the button loading indicator.
			isLoading: isAuthBypassed
				? false
				: auth.isLoading || logoutMutation.isPending || extendTokenMutation.isPending,
			user: auth.user,

			// Actions
			login,
			logout,
			extendToken,

			// Utilities
			checkAuthStatus,
		}),
		[
			isAuthBypassed,
			auth.isAuthenticated,
			auth.isLoading,
			auth.user,
			logoutMutation.isPending,
			extendTokenMutation.isPending,
			login,
			logout,
			extendToken,
			checkAuthStatus,
		],
	);

	return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
