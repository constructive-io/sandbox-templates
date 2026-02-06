/**
 * Hook for fetching databases accessible to the current user (without constraints)
 * Tier 4 wrapper: Uses SDK hooks + composition
 *
 * This includes:
 * 1. Databases owned directly by the user
 * 2. Databases owned by organizations the user is a member of
 *
 * This hook fetches databases/tables/fields which change frequently.
 * For constraints/indexes (which change rarely), use useDatabaseConstraints.
 *
 * Split from the original mega-query to enable different caching strategies:
 * - Databases: 30s staleTime, respects cache on mount
 * - Constraints: 5min staleTime (see use-database-constraints.ts)
 */
import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { SchemaContext } from '@/app-config';
import { useAppStore, useShallow } from '@/store/app-store';
import {
	fetchApiSchemasQuery,
	fetchApisQuery,
	fetchDatabasesQuery,
	fetchFieldsQuery,
	fetchSchemasQuery,
	fetchTablesQuery,
	fetchUsersQuery,
} from '@sdk/api';

import { useOrganizations } from './organizations';
import {
	type DatabaseTableNode,
	type DatabaseFieldNode,
	type DatabaseOwnerNode,
	type DatabaseSchemaNode,
	type DatabaseApiNode,
	buildFieldsByTableMap,
	buildTablesByDatabaseMap,
	extractIds,
} from './database-shared-utils';

// Re-export shared types for backwards compatibility
export type { DatabaseFieldNode as AccessibleDatabaseField, DatabaseTableNode as AccessibleDatabaseTable };

// Owner type - extends shared type with 'type' field for user/org distinction
export interface AccessibleDatabaseOwner extends DatabaseOwnerNode {
	type: string | null;
}

// Database type (uses shared sub-types)
export interface AccessibleDatabase {
	id: string;
	label: string | null;
	name: string;
	ownerId: string;
	owner: AccessibleDatabaseOwner | null;
	schemaName: string | null;
	tables: {
		edges: Array<{ node: DatabaseTableNode }>;
		totalCount: number;
	} | null;
	schemas: {
		nodes: DatabaseSchemaNode[];
	} | null;
	apis: {
		nodes: DatabaseApiNode[];
	} | null;
}

interface AccessibleDatabasesQueryResult {
	databases: {
		nodes: AccessibleDatabase[];
		totalCount: number;
		pageInfo: {
			hasNextPage: boolean;
			hasPreviousPage: boolean;
		};
	} | null;
}

export interface UseAccessibleDatabasesOptions {
	/** Enable/disable the query */
	enabled?: boolean;
	/** Override schema context (defaults to schema-builder) */
	context?: SchemaContext;
}

export interface UseAccessibleDatabasesResult {
	/** Array of all accessible database objects */
	databases: AccessibleDatabase[];
	/** Total count of all databases */
	totalCount: number;
	/** True only on initial load (no cached data yet) */
	isLoading: boolean;
	/** True when fetching (including background refetch with cached data) */
	isFetching: boolean;
	/** Error state */
	error: Error | null;
	/** Pagination info */
	pageInfo: {
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
	/** Refetch function */
	refetch: () => Promise<unknown>;
}

/**
 * Hook for fetching databases accessible to the current user
 *
 * This combines:
 * - User's personal databases (owned directly)
 * - Organization databases (owned by orgs the user belongs to)
 *
 * NOTE: This hook does NOT include constraints/indexes.
 * Use useDatabaseConstraints separately for those.
 *
 * @example
 * ```tsx
 * const { databases, isLoading } = useAccessibleDatabases();
 *
 * // Databases include both personal and org-owned databases
 * databases.forEach(db => {
 *   console.log(db.name, db.owner?.displayName);
 * });
 * ```
 */
export function useAccessibleDatabases(
	options: UseAccessibleDatabasesOptions = {}
): UseAccessibleDatabasesResult {
	const { enabled = true, context = 'schema-builder' } = options;
	void context; // Context handled by SDK execute-adapter

	// Get current user ID and auth loading state
	const { user, token, isAuthLoading } = useAppStore(
		useShallow((state) => ({
			user: state.schemaBuilderAuth?.user || null,
			token: state.schemaBuilderAuth?.token || null,
			isAuthLoading: state.schemaBuilderAuth?.isLoading ?? true,
		}))
	);
	const userId = user?.id || token?.userId;

	// Get organizations the user belongs to
	const { organizations, isLoading: orgsLoading } = useOrganizations({ context, enabled });

	// Compute the list of owner IDs (user + all org IDs) - memoize to prevent query key changes
	const ownerIds = useMemo(() => {
		return userId
			? [userId, ...organizations.map((org) => org.id)]
			: organizations.map((org) => org.id);
	}, [userId, organizations]);

	// Fetch databases for all owner IDs in a single query
	const {
		data,
		isLoading: dbLoading,
		isFetching: dbFetching,
		error,
		refetch,
	} = useQuery<AccessibleDatabasesQueryResult>({
		queryKey: accessibleDatabasesQueryKeys.byOwners(context, ownerIds),
		queryFn: async (): Promise<AccessibleDatabasesQueryResult> => {
			// Step 1: Fetch databases by owner IDs
			const databasesResult = await fetchDatabasesQuery({
				filter: { ownerId: { in: ownerIds } },
				orderBy: ['NAME_ASC'],
			});

			const rawDatabases = databasesResult.databases?.nodes ?? [];
			if (rawDatabases.length === 0) {
				return {
					databases: { nodes: [], totalCount: 0, pageInfo: { hasNextPage: false, hasPreviousPage: false } },
				};
			}

			const databaseIds = extractIds(rawDatabases);
			const uniqueOwnerIds = [...new Set(rawDatabases.map((d) => d.ownerId).filter((id): id is string => !!id))];

			// Step 2: Fetch all related data in parallel
			const [tablesResult, schemasResult, apisResult, ownersResult] = await Promise.all([
				fetchTablesQuery({ filter: { databaseId: { in: databaseIds } }, orderBy: ['NAME_ASC'] }),
				fetchSchemasQuery({ filter: { databaseId: { in: databaseIds } }, orderBy: ['NAME_ASC'] }),
				fetchApisQuery({ filter: { databaseId: { in: databaseIds } }, orderBy: ['NAME_ASC'] }),
				uniqueOwnerIds.length > 0 ? fetchUsersQuery({ filter: { id: { in: uniqueOwnerIds } } }) : Promise.resolve({ users: { nodes: [] } }),
			]);

			// Step 3: Fetch fields and apiSchemas
			const tableIds = extractIds(tablesResult.tables?.nodes ?? []);
			const apiIds = extractIds(apisResult.apis?.nodes ?? []);

			const [fieldsResult, apiSchemasResult] = await Promise.all([
				tableIds.length > 0 ? fetchFieldsQuery({ filter: { tableId: { in: tableIds } } }) : Promise.resolve({ fields: { nodes: [] } }),
				apiIds.length > 0 ? fetchApiSchemasQuery({ filter: { apiId: { in: apiIds } } }) : Promise.resolve({ apiSchemas: { nodes: [] } }),
			]);

			// Step 4: Build lookup maps using shared utilities
			const ownerMap = new Map<string, AccessibleDatabaseOwner>();
			for (const u of ownersResult.users?.nodes ?? []) {
				if (u.id) {
					ownerMap.set(u.id, {
						id: u.id,
						displayName: u.displayName ?? null,
						username: u.username ?? null,
						type: u.type != null ? String(u.type) : null,
					});
				}
			}

			// Use shared utility for fields and tables
			const fieldsByTable = buildFieldsByTableMap(fieldsResult.fields?.nodes ?? []);
			const tablesByDatabase = buildTablesByDatabaseMap(tablesResult.tables?.nodes ?? [], fieldsByTable);

			const schemasByDatabase = new Map<string, DatabaseSchemaNode[]>();
			for (const s of schemasResult.schemas?.nodes ?? []) {
				if (s.databaseId) {
					const existing = schemasByDatabase.get(s.databaseId) ?? [];
					existing.push({ id: s.id ?? '', name: s.name ?? '', schemaName: s.schemaName ?? '' });
					schemasByDatabase.set(s.databaseId, existing);
				}
			}

			const apiSchemasByApi = new Map<string, Array<{ schemaId: string }>>();
			for (const as of apiSchemasResult.apiSchemas?.nodes ?? []) {
				if (as.apiId) {
					const existing = apiSchemasByApi.get(as.apiId) ?? [];
					existing.push({ schemaId: as.schemaId ?? '' });
					apiSchemasByApi.set(as.apiId, existing);
				}
			}

			const apisByDatabase = new Map<string, DatabaseApiNode[]>();
			for (const a of apisResult.apis?.nodes ?? []) {
				if (a.databaseId) {
					const existing = apisByDatabase.get(a.databaseId) ?? [];
					existing.push({
						id: a.id ?? '',
						name: a.name ?? '',
						apiSchemas: { nodes: apiSchemasByApi.get(a.id ?? '') ?? [] },
					});
					apisByDatabase.set(a.databaseId, existing);
				}
			}

			// Step 5: Build final databases structure
			const databases: AccessibleDatabase[] = rawDatabases.map((d) => {
				const tables = tablesByDatabase.get(d.id ?? '') ?? [];
				return {
					id: d.id ?? '',
					label: d.label ?? null,
					name: d.name ?? '',
					ownerId: d.ownerId ?? '',
					owner: d.ownerId ? ownerMap.get(d.ownerId) ?? null : null,
					schemaName: d.schemaName ?? null,
					tables: {
						edges: tables.map((t) => ({ node: t })),
						totalCount: tables.length,
					},
					schemas: { nodes: schemasByDatabase.get(d.id ?? '') ?? [] },
					apis: { nodes: apisByDatabase.get(d.id ?? '') ?? [] },
				};
			});

			return {
				databases: {
					nodes: databases,
					totalCount: databasesResult.databases?.totalCount ?? 0,
					pageInfo: {
						hasNextPage: databasesResult.databases?.pageInfo?.hasNextPage ?? false,
						hasPreviousPage: databasesResult.databases?.pageInfo?.hasPreviousPage ?? false,
					},
				},
			};
		},
		enabled: enabled && !orgsLoading && ownerIds.length > 0,
		staleTime: 30 * 1000, // 30 seconds - shorter for fresher data
		refetchOnMount: true, // Respect staleTime (NOT 'always' which ignores cache)
		// Keep previous data during refetch to prevent UI flicker
		// This prevents databases array from resetting during background refetch
		placeholderData: keepPreviousData,
	});

	// Extract the data from the response (data is undefined when query is disabled or loading)
	const databases = data?.databases?.nodes ?? [];
	const totalCount = data?.databases?.totalCount ?? 0;
	const pageInfo = data?.databases?.pageInfo ?? {
		hasNextPage: false,
		hasPreviousPage: false,
	};

	// Loading state logic:
	// isLoading = true only on initial load (no cached data yet)
	// isFetching = true during any fetch (including background refetch)
	//
	// - If auth is still initializing, report loading
	// - If orgs are loading (includes auth loading via useOrganizations), report loading
	// - If db query is loading (first time), report loading
	// - If auth done and not authenticated (no userId, empty ownerIds), report NOT loading
	//   (query is disabled, allows route guards to properly redirect)
	const isLoading = isAuthLoading || orgsLoading || dbLoading;
	const isFetching = dbFetching;

	return {
		databases,
		totalCount,
		isLoading,
		isFetching,
		error,
		pageInfo,
		refetch,
	};
}

/**
 * Generate query keys for consistent cache management
 */
export const accessibleDatabasesQueryKeys = {
	all: ['accessible-databases'] as const,
	byContext: (context: SchemaContext) =>
		[...accessibleDatabasesQueryKeys.all, { context }] as const,
	byOwners: (context: SchemaContext, ownerIds: string[]) =>
		[...accessibleDatabasesQueryKeys.byContext(context), { ownerIds: ownerIds.sort() }] as const,
};
