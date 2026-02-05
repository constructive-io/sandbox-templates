import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { DataError, DataErrorType } from '@/lib/gql/error-handler';
import { createLogger } from '@/lib/logger';
import type { SchemaContext } from '@/lib/runtime/config-core';
import { useAppStore } from '@/store/app-store';

const logger = createLogger({ scope: 'query-client' });

// ============================================================================
// Query Key Context Detection
// ============================================================================

/**
 * Check if a query key element is a DashboardCacheScopeKey.
 * Dashboard queries have keys like: ['dashboard', { databaseId, endpoint }, ...]
 */
function isDashboardCacheScopeKey(value: unknown): boolean {
	if (!value || typeof value !== 'object') return false;
	const candidate = value as Record<string, unknown>;
	return 'databaseId' in candidate && 'endpoint' in candidate;
}

/**
 * Check if a query key element indicates schema-builder context.
 * Schema-builder queries have keys like: ['resource', { context: 'schema-builder' }, ...]
 */
function isSchemaBuilderContextKey(value: unknown): boolean {
	if (!value || typeof value !== 'object') return false;
	const candidate = value as Record<string, unknown>;
	return candidate.context === 'schema-builder';
}

/**
 * Detect the schema context from a React Query key.
 * 
 * @param queryKey - The query key array
 * @returns The detected context, or null if unknown
 */
function detectContextFromQueryKey(queryKey: readonly unknown[]): SchemaContext | null {
	if (!Array.isArray(queryKey) || queryKey.length === 0) return null;

	// Dashboard queries start with 'dashboard' and have a scope object
	if (queryKey[0] === 'dashboard') {
		// Verify it's actually a dashboard query by checking for scope
		if (queryKey.length > 1 && isDashboardCacheScopeKey(queryKey[1])) {
			return 'dashboard';
		}
		// Still likely dashboard even without proper scope
		return 'dashboard';
	}

	// Schema-builder queries have { context: 'schema-builder' } in them
	for (const element of queryKey) {
		if (isSchemaBuilderContextKey(element)) {
			return 'schema-builder';
		}
	}

	// Auth queries (login, logout, etc.) are schema-builder context
	if (queryKey[0] === 'auth') {
		return 'schema-builder';
	}

	// Default to null (unknown context)
	return null;
}

/**
 * Extract the dashboard scope (databaseId) from a query key if present.
 */
function extractDashboardScope(queryKey: readonly unknown[]): string | null {
	if (!Array.isArray(queryKey) || queryKey.length < 2) return null;
	if (queryKey[0] !== 'dashboard') return null;

	const scopeCandidate = queryKey[1];
	if (isDashboardCacheScopeKey(scopeCandidate)) {
		const scope = scopeCandidate as { databaseId: string | null };
		return scope.databaseId;
	}
	return null;
}

// ============================================================================
// Global Auth Error Handler
// ============================================================================

/**
 * Tracks auth error handling state per context to prevent
 * multiple concurrent handlers from triggering logout multiple times.
 */
const authErrorHandlingState: Record<SchemaContext, { isHandling: boolean; lastHandledAt: number }> = {
	'schema-builder': { isHandling: false, lastHandledAt: 0 },
	'dashboard': { isHandling: false, lastHandledAt: 0 },
};

/**
 * Minimum time between auth error handling attempts per context (ms).
 */
const AUTH_ERROR_COOLDOWN = 2000;

/**
 * Check if an error is an authentication error that requires logout.
 */
function isAuthError(error: unknown): boolean {
	if (error instanceof DataError) {
		return error.type === DataErrorType.UNAUTHORIZED;
	}
	// Fallback: check error message for auth-related keywords
	if (error instanceof Error) {
		const msg = error.message.toLowerCase();
		return msg.includes('unauthenticated') || msg.includes('unauthorized');
	}
	return false;
}

/**
 * Handle authentication errors globally with context awareness.
 * 
 * This is called from the QueryCache and MutationCache error handlers.
 * It detects which context (schema-builder or dashboard) the error came from
 * and only invalidates auth for that specific context.
 * 
 * - Schema-builder (Tier 1) auth errors: Clear schema-builder auth only
 * - Dashboard (Tier 2) auth errors: Clear dashboard auth for the specific database scope only
 * 
 * Uses per-context flags and cooldowns to prevent multiple concurrent handlers
 * from triggering logout multiple times when many queries fail at once.
 */
function handleGlobalAuthError(error: unknown, queryKey?: readonly unknown[]): void {
	if (!isAuthError(error)) return;

	// Detect context from query key
	const context = queryKey ? detectContextFromQueryKey(queryKey) : null;
	const now = Date.now();

	// If we can't determine context, log and skip (don't blindly clear everything)
	if (!context) {
		logger.debug('Auth error detected but could not determine context from query key', { queryKey });
		return;
	}

	const handlingState = authErrorHandlingState[context];

	// Skip if we're already handling or within cooldown period for this context
	if (handlingState.isHandling || (now - handlingState.lastHandledAt) < AUTH_ERROR_COOLDOWN) {
		logger.debug('Auth error handling skipped for context (already handling or in cooldown)', { context });
		return;
	}

	handlingState.isHandling = true;
	handlingState.lastHandledAt = now;

	logger.info('Context-aware auth error detected', { context, queryKey });

	// Access store state directly (useAppStore is a Zustand store with getState())
	const state = useAppStore.getState();

	if (context === 'schema-builder') {
		// Tier 1 auth error: clear schema-builder auth only
		state.setUnauthenticated('schema-builder');

		// Cancel schema-builder queries only
		queryClient.cancelQueries({
			predicate: (query) => {
				const qCtx = detectContextFromQueryKey(query.queryKey);
				return qCtx === 'schema-builder' || qCtx === null;
			},
		});

		logger.info('Schema-builder auth cleared');
	} else if (context === 'dashboard') {
		// Tier 2 auth error: clear dashboard auth for specific scope
		const dashboardScope = queryKey ? extractDashboardScope(queryKey) : null;

		if (dashboardScope) {
			// Clear auth for the specific database
			state.setUnauthenticated('dashboard', dashboardScope);

			// Cancel queries for this specific dashboard scope
			queryClient.cancelQueries({
				predicate: (query) => {
					const qScope = extractDashboardScope(query.queryKey);
					return qScope === dashboardScope;
				},
			});

			logger.info('Dashboard auth cleared for scope', { scope: dashboardScope });
		} else {
			// No specific scope, clear current dashboard scope
			const currentScope = state.dashboardScope.databaseId;
			if (currentScope) {
				state.setUnauthenticated('dashboard', currentScope);
			}

			// Cancel all dashboard queries
			queryClient.cancelQueries({
				predicate: (query) => detectContextFromQueryKey(query.queryKey) === 'dashboard',
			});

			logger.info('Dashboard auth cleared for current scope', { scope: currentScope });
		}
	}

	// Reset the flag after cooldown
	setTimeout(() => {
		handlingState.isHandling = false;
	}, AUTH_ERROR_COOLDOWN);
}

// ============================================================================
// Query Client Configuration
// ============================================================================

/**
 * Configured QueryClient with sensible defaults for GraphQL operations
 *
 * Key configurations:
 * - Queries retry up to 2 times for network/timeout errors only
 * - Mutations never auto-retry (user should control this)
 * - Errors propagate immediately for non-retryable cases
 * - Global error handler for authentication errors
 */
export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error, query) => {
			logger.debug('Query error', { queryKey: query.queryKey, error });
			handleGlobalAuthError(error, query.queryKey);
		},
	}),
	mutationCache: new MutationCache({
		onError: (error, _variables, _context, mutation) => {
			// Mutations may have a mutationKey that helps identify context
			const mutationKey = mutation.options.mutationKey;
			logger.debug('Mutation error', { mutationKey, error });
			handleGlobalAuthError(error, mutationKey);
		},
	}),
	defaultOptions: {
		queries: {
			// Retry only retryable errors (network, timeout) up to 2 times
			// Never retry auth errors
			retry: (failureCount, error) => {
				// Never retry auth errors
				if (isAuthError(error)) return false;
				if (failureCount >= 2) return false;
				// Use DataError's isRetryable method if available
				if (error instanceof DataError) {
					return error.isRetryable();
				}
				return false;
			},
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),

			// Don't refetch on window focus by default
			refetchOnWindowFocus: false,

			// Cache configuration
			staleTime: 0,
			gcTime: 5 * 60 * 1000,
		},
		mutations: {
			// Never auto-retry mutations
			retry: false,
		},
	},
});
