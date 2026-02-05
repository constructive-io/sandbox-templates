/**
 * Tests for context-aware auth error handling - verifies auth errors don't cascade between tiers
 * Consolidated: key detection, error detection, isolation scenarios
 */
import { describe, expect, it } from 'vitest';

import { DataError, DataErrorType } from '../gql/error-handler';
import type { SchemaContext } from '../runtime/config-core';

// ============================================================================
// Test utilities - extracted from query-client.ts
// ============================================================================

function isDashboardCacheScopeKey(value: unknown): boolean {
	if (!value || typeof value !== 'object') return false;
	const candidate = value as Record<string, unknown>;
	return 'databaseId' in candidate && 'endpoint' in candidate;
}

function isSchemaBuilderContextKey(value: unknown): boolean {
	if (!value || typeof value !== 'object') return false;
	return (value as Record<string, unknown>).context === 'schema-builder';
}

function detectContextFromQueryKey(queryKey: readonly unknown[]): SchemaContext | null {
	if (!Array.isArray(queryKey) || queryKey.length === 0) return null;
	if (queryKey[0] === 'dashboard') return 'dashboard';
	for (const element of queryKey) {
		if (isSchemaBuilderContextKey(element)) return 'schema-builder';
	}
	if (queryKey[0] === 'auth') return 'schema-builder';
	return null;
}

function extractDashboardScope(queryKey: readonly unknown[]): string | null {
	if (!Array.isArray(queryKey) || queryKey.length < 2) return null;
	if (queryKey[0] !== 'dashboard') return null;
	const scopeCandidate = queryKey[1];
	if (isDashboardCacheScopeKey(scopeCandidate)) {
		return (scopeCandidate as { databaseId: string | null }).databaseId;
	}
	return null;
}

function isAuthError(error: unknown): boolean {
	if (error instanceof DataError) return error.type === DataErrorType.UNAUTHORIZED;
	if (error instanceof Error) {
		const msg = error.message.toLowerCase();
		return msg.includes('unauthenticated') || msg.includes('unauthorized');
	}
	return false;
}

// ============================================================================
// Fixtures
// ============================================================================

const DATABASE_A = 'db-alpha-123';
const DATABASE_B = 'db-beta-456';

const schemaBuilderKeys = {
	orgs: ['organizations', { context: 'schema-builder' }, 'list'] as const,
	dbs: ['user-databases', { context: 'schema-builder' }, 'list'] as const,
	auth: ['auth', 'login'] as const,
};

const dashboardKeys = {
	rows: (db: string) => ['dashboard', { databaseId: db, endpoint: 'http://localhost:4000/graphql' }, 'table', 'users', 'rows'] as const,
	meta: (db: string) => ['dashboard', { databaseId: db, endpoint: 'http://localhost:4000/graphql' }, 'meta'] as const,
};

// ============================================================================
// Tests
// ============================================================================

describe('Query Key Detection', () => {
	const validDashboardScopes = [
		{ databaseId: 'db-123', endpoint: 'http://localhost' },
		{ databaseId: null, endpoint: null },
	];

	const invalidDashboardScopes = [
		null, undefined, 'string', 123,
		{ context: 'schema-builder' },
		{ databaseId: 'db-123' }, // missing endpoint
		{ endpoint: 'http://localhost' }, // missing databaseId
	];

	it.each(validDashboardScopes)('isDashboardCacheScopeKey: true for %j', (val) => {
		expect(isDashboardCacheScopeKey(val)).toBe(true);
	});

	it.each(invalidDashboardScopes)('isDashboardCacheScopeKey: false for %j', (val) => {
		expect(isDashboardCacheScopeKey(val)).toBe(false);
	});

	const contextDetectionCases = [
		[schemaBuilderKeys.orgs, 'schema-builder'],
		[schemaBuilderKeys.dbs, 'schema-builder'],
		[schemaBuilderKeys.auth, 'schema-builder'],
		[['auth', 'logout'], 'schema-builder'],
		[dashboardKeys.rows(DATABASE_A), 'dashboard'],
		[dashboardKeys.meta(DATABASE_A), 'dashboard'],
		[[], null],
		[['unknown', 'key'], null],
	] as const;

	it.each(contextDetectionCases)('detectContextFromQueryKey: %j → %s', (key, expected) => {
		expect(detectContextFromQueryKey(key as any)).toBe(expected);
	});

	const scopeExtractionCases = [
		[dashboardKeys.rows(DATABASE_A), DATABASE_A],
		[dashboardKeys.meta(DATABASE_B), DATABASE_B],
		[schemaBuilderKeys.orgs, null],
		[['dashboard'], null],
		[['dashboard', 'invalid-scope'], null],
	] as const;

	it.each(scopeExtractionCases)('extractDashboardScope: %j → %s', (key, expected) => {
		expect(extractDashboardScope(key as any)).toBe(expected);
	});
});

describe('Auth Error Detection', () => {
	const authErrors = [
		new DataError(DataErrorType.UNAUTHORIZED, 'Auth required'),
		new Error('UNAUTHENTICATED'),
		new Error('User is unauthenticated'),
		new Error('Unauthorized access'),
	];

	const nonAuthErrors = [
		new DataError(DataErrorType.FORBIDDEN, 'Access denied'),
		new DataError(DataErrorType.NETWORK_ERROR, 'Network failed'),
		new Error('Permission denied'),
		new Error('Network error'),
		null,
		undefined,
		'string error',
	];

	it.each(authErrors)('isAuthError: true for %s', (error) => {
		expect(isAuthError(error)).toBe(true);
	});

	it.each(nonAuthErrors)('isAuthError: false for %s', (error) => {
		expect(isAuthError(error)).toBe(false);
	});
});

describe('Auth Isolation', () => {
	const isolationMatrix = [
		{ key: schemaBuilderKeys.orgs, affected: 'schema-builder', unaffected: 'dashboard' },
		{ key: dashboardKeys.rows(DATABASE_A), affected: 'dashboard', unaffected: 'schema-builder' },
		{ key: schemaBuilderKeys.auth, affected: 'schema-builder', unaffected: 'dashboard' },
	] as const;

	it.each(isolationMatrix)('$affected error does NOT affect $unaffected', ({ key, affected, unaffected }) => {
		const detected = detectContextFromQueryKey(key);
		expect(detected).toBe(affected);
		expect(detected).not.toBe(unaffected);
	});

	it('isolates auth between different database scopes', () => {
		const scopeA = extractDashboardScope(dashboardKeys.rows(DATABASE_A));
		const scopeB = extractDashboardScope(dashboardKeys.rows(DATABASE_B));
		expect(scopeA).toBe(DATABASE_A);
		expect(scopeB).toBe(DATABASE_B);
		expect(scopeA).not.toBe(scopeB);
	});

	it('filters only schema-builder queries for schema-builder errors', () => {
		const allKeys = [schemaBuilderKeys.orgs, schemaBuilderKeys.dbs, dashboardKeys.rows(DATABASE_A)];
		const sbQueries = allKeys.filter((k) => detectContextFromQueryKey(k) === 'schema-builder');
		expect(sbQueries).toHaveLength(2);
	});
});

describe('Real-world Patterns', () => {
	it('identifies full dashboard table query', () => {
		const key = [
			'dashboard',
			{ databaseId: 'db-prod', endpoint: 'https://api.example.com/graphql' },
			'table', 'customers', 'rows',
			{ first: 50, offset: 0 },
		];
		expect(detectContextFromQueryKey(key)).toBe('dashboard');
		expect(extractDashboardScope(key)).toBe('db-prod');
	});

	it('handles deeply nested context markers', () => {
		const key = ['resources', 'list', { context: 'schema-builder' }, 'page', 1];
		expect(detectContextFromQueryKey(key)).toBe('schema-builder');
	});
});
