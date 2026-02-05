/**
 * Hook for fetching databases owned by the current authenticated user
 * Tier 4 wrapper: Uses SDK hooks + composition
 */
import { useQuery } from '@tanstack/react-query';

import { useAppStore, useShallow } from '@/store/app-store';
import type { SchemaContext } from '@/app-config';
import {
	fetchApiSchemasQuery,
	fetchApisQuery,
	fetchDatabasesQuery,
	fetchFieldsQuery,
	fetchForeignKeyConstraintsQuery,
	fetchIndicesQuery,
	fetchPrimaryKeyConstraintsQuery,
	fetchSchemasQuery,
	fetchTablesQuery,
	fetchUniqueConstraintsQuery,
} from '@sdk/app-public';
import { fetchUsersQuery } from '@sdk/auth';

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
export type { DatabaseFieldNode as DatabaseField, DatabaseTableNode as DatabaseTable };
export type { DatabaseOwnerNode as DatabaseOwner };

// Database type (uses shared sub-types)
export interface UserDatabase {
	id: string;
	label: string | null;
	name: string;
	owner: DatabaseOwnerNode | null;
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

// Constraint types
export interface PrimaryKeyConstraint {
	databaseId: string;
	fieldIds: string[];
	id: string;
	name: string;
	tableId: string;
	type: string;
}

export interface UniqueConstraint {
	databaseId: string;
	fieldIds: string[];
	id: string;
	name: string;
	tableId: string;
	type: string;
}

export interface ForeignKeyConstraint {
	databaseId: string;
	deleteAction: string | null;
	description: string | null;
	fieldIds: string[];
	id: string;
	name: string;
	refFieldIds: string[];
	refTableId: string;
	smartTags: Record<string, unknown> | null;
	tableId: string;
	type: string;
	updateAction: string | null;
}

export interface DatabaseIndex {
	accessMethod: string | null;
	createdAt: string | null;
	databaseId: string;
	fieldIds: string[];
	id: string;
	includeFieldIds: string[] | null;
	indexParams: string | null;
	isUnique: boolean | null;
	name: string;
	tableId: string;
	whereClause: string | null;
}

// Connection types (for backwards compatibility)
export interface DatabasesConnection {
	nodes: UserDatabase[];
	totalCount: number;
	pageInfo: {
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}

// Query result type
interface UserDatabasesQueryResult {
	databases: DatabasesConnection | null;
	primaryKeyConstraints: { nodes: PrimaryKeyConstraint[] } | null;
	uniqueConstraints: { nodes: UniqueConstraint[] } | null;
	foreignKeyConstraints: { nodes: ForeignKeyConstraint[] } | null;
	indices: { nodes: DatabaseIndex[] } | null;
}

export interface UseUserDatabasesOptions {
	/** Enable/disable the query */
	enabled?: boolean;
	/** Override user ID (defaults to current authenticated user) */
	userId?: string;
	/** Override schema context (defaults to schema-builder) */
	context?: SchemaContext;
}

export interface UseUserDatabasesResult {
	/** Array of database objects */
	databases: UserDatabase[];
	/** Primary key constraints across all databases */
	primaryKeyConstraints: PrimaryKeyConstraint[];
	/** Unique constraints across all databases */
	uniqueConstraints: UniqueConstraint[];
	/** Foreign key constraints across all databases */
	foreignKeyConstraints: ForeignKeyConstraint[];
	/** Index definitions across all databases */
	indexes: DatabaseIndex[];
	/** Total count of all databases */
	totalCount: number;
	/** Loading state */
	isLoading: boolean;
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
 * Hook for fetching databases owned by the current authenticated user
 *
 * @example
 * ```tsx
 * const { databases, totalCount, isLoading } = useUserDatabases();
 *
 * // With specific user ID
 * const { databases } = useUserDatabases({
 *   userId: 'specific-user-id'
 * });
 * ```
 */
export function useUserDatabases(options: UseUserDatabasesOptions = {}): UseUserDatabasesResult {
	const { enabled = true, userId, context = 'schema-builder' } = options;
	void context; // Context handled by SDK execute-adapter

	const { user, token } = useAppStore(
		useShallow((state) => ({
			user: state.schemaBuilderAuth?.user || null,
			token: state.schemaBuilderAuth?.token || null,
		})),
	);

	// Determine the owner ID to use
	const ownerId = userId || user?.id || token?.userId;

	const { data, isLoading, error, refetch } = useQuery<UserDatabasesQueryResult>({
		queryKey: userDatabasesQueryKeys.byUser(context, ownerId || ''),
		queryFn: async (): Promise<UserDatabasesQueryResult> => {
			if (!ownerId) {
				throw new Error('No authenticated user found');
			}

			// Step 1: Fetch databases by owner
			const databasesResult = await fetchDatabasesQuery({
				filter: { ownerId: { equalTo: ownerId } },
				orderBy: ['NAME_ASC'],
			});

			const rawDatabases = databasesResult.databases?.nodes ?? [];
			if (rawDatabases.length === 0) {
				return {
					databases: { nodes: [], totalCount: 0, pageInfo: { hasNextPage: false, hasPreviousPage: false } },
					primaryKeyConstraints: { nodes: [] },
					uniqueConstraints: { nodes: [] },
					foreignKeyConstraints: { nodes: [] },
					indices: { nodes: [] },
				};
			}

			const databaseIds = extractIds(rawDatabases);
			const ownerIds = [...new Set(rawDatabases.map((d) => d.ownerId).filter((id): id is string => !!id))];

			// Step 2: Fetch all related data in parallel (with proper filtering!)
			const [
				tablesResult,
				schemasResult,
				apisResult,
				ownersResult,
				pkResult,
				uniqueResult,
				fkResult,
				indicesResult,
			] = await Promise.all([
				fetchTablesQuery({ filter: { databaseId: { in: databaseIds } }, orderBy: ['NAME_ASC'] }),
				fetchSchemasQuery({ filter: { databaseId: { in: databaseIds } }, orderBy: ['NAME_ASC'] }),
				fetchApisQuery({ filter: { databaseId: { in: databaseIds } }, orderBy: ['NAME_ASC'] }),
				ownerIds.length > 0 ? fetchUsersQuery({ filter: { id: { in: ownerIds } } }) : Promise.resolve({ users: { nodes: [] } }),
				// BUG FIX: Previously fetched ALL constraints globally - now filtered by databaseId
				fetchPrimaryKeyConstraintsQuery({ filter: { databaseId: { in: databaseIds } } }),
				fetchUniqueConstraintsQuery({ filter: { databaseId: { in: databaseIds } } }),
				fetchForeignKeyConstraintsQuery({ filter: { databaseId: { in: databaseIds } }, orderBy: ['NAME_ASC'] }),
				fetchIndicesQuery({ filter: { databaseId: { in: databaseIds } }, orderBy: ['CREATED_AT_DESC'] }),
			]);

			// Step 3: Fetch fields and apiSchemas
			const tableIds = (tablesResult.tables?.nodes ?? []).map((t) => t.id).filter((id): id is string => !!id);
			const apiIds = (apisResult.apis?.nodes ?? []).map((a) => a.id).filter((id): id is string => !!id);

			const [fieldsResult, apiSchemasResult] = await Promise.all([
				tableIds.length > 0 ? fetchFieldsQuery({ filter: { tableId: { in: tableIds } } }) : Promise.resolve({ fields: { nodes: [] } }),
				apiIds.length > 0 ? fetchApiSchemasQuery({ filter: { apiId: { in: apiIds } } }) : Promise.resolve({ apiSchemas: { nodes: [] } }),
			]);

			// Step 4: Build lookup maps using shared utilities
			const ownerMap = new Map<string, DatabaseOwnerNode>();
			for (const u of ownersResult.users?.nodes ?? []) {
				if (u.id) {
					ownerMap.set(u.id, {
						id: u.id,
						displayName: u.displayName ?? null,
						username: u.username ?? null,
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
			const databases: UserDatabase[] = rawDatabases.map((d) => {
				const tables = tablesByDatabase.get(d.id ?? '') ?? [];
				return {
					id: d.id ?? '',
					label: d.label ?? null,
					name: d.name ?? '',
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

			// Step 6: Build constraints and indices
			const primaryKeyConstraints: PrimaryKeyConstraint[] = (pkResult.primaryKeyConstraints?.nodes ?? []).map((c) => ({
				databaseId: c.databaseId ?? '',
				fieldIds: (c.fieldIds ?? []).filter((id): id is string => id !== null),
				id: c.id ?? '',
				name: c.name ?? '',
				tableId: c.tableId ?? '',
				type: c.type ?? '',
			}));

			const uniqueConstraints: UniqueConstraint[] = (uniqueResult.uniqueConstraints?.nodes ?? []).map((c) => ({
				databaseId: c.databaseId ?? '',
				fieldIds: (c.fieldIds ?? []).filter((id): id is string => id !== null),
				id: c.id ?? '',
				name: c.name ?? '',
				tableId: c.tableId ?? '',
				type: c.type ?? '',
			}));

			const foreignKeyConstraints: ForeignKeyConstraint[] = (fkResult.foreignKeyConstraints?.nodes ?? []).map((c) => ({
				databaseId: c.databaseId ?? '',
				deleteAction: c.deleteAction ?? null,
				description: c.description ?? null,
				fieldIds: (c.fieldIds ?? []).filter((id): id is string => id !== null),
				id: c.id ?? '',
				name: c.name ?? '',
				refFieldIds: (c.refFieldIds ?? []).filter((id): id is string => id !== null),
				refTableId: c.refTableId ?? '',
				smartTags: (c.smartTags as Record<string, unknown>) ?? null,
				tableId: c.tableId ?? '',
				type: c.type ?? '',
				updateAction: c.updateAction ?? null,
			}));

			const indices: DatabaseIndex[] = (indicesResult.indices?.nodes ?? []).map((i) => ({
				accessMethod: i.accessMethod ?? null,
				createdAt: i.createdAt ?? null,
				databaseId: i.databaseId ?? '',
				fieldIds: (i.fieldIds ?? []).filter((id): id is string => id !== null),
				id: i.id ?? '',
				includeFieldIds: i.includeFieldIds ? (i.includeFieldIds as string[]).filter((id): id is string => id !== null) : null,
				indexParams: typeof i.indexParams === 'string' ? i.indexParams : null,
				isUnique: i.isUnique ?? null,
				name: i.name ?? '',
				tableId: i.tableId ?? '',
				whereClause: typeof i.whereClause === 'string' ? i.whereClause : null,
			}));

			return {
				databases: {
					nodes: databases,
					totalCount: databasesResult.databases?.totalCount ?? 0,
					pageInfo: {
						hasNextPage: databasesResult.databases?.pageInfo?.hasNextPage ?? false,
						hasPreviousPage: databasesResult.databases?.pageInfo?.hasPreviousPage ?? false,
					},
				},
				primaryKeyConstraints: { nodes: primaryKeyConstraints },
				uniqueConstraints: { nodes: uniqueConstraints },
				foreignKeyConstraints: { nodes: foreignKeyConstraints },
				indices: { nodes: indices },
			};
		},
		enabled: enabled && !!ownerId,
		staleTime: 5 * 60 * 1000, // 5 minutes
		// CRITICAL: Reduce stale time after workflow completion to ensure fresh data
		// This was previously 5 minutes, but that's too long for post-workflow updates
		refetchOnMount: 'always',
	});

	// Extract the databases data from the response
	const databases = data?.databases?.nodes || [];
	const primaryKeyConstraints = data?.primaryKeyConstraints?.nodes || [];
	const uniqueConstraints = data?.uniqueConstraints?.nodes || [];
	const foreignKeyConstraints = data?.foreignKeyConstraints?.nodes || [];
	const indexes = data?.indices?.nodes || [];
	const totalCount = data?.databases?.totalCount || 0;
	const pageInfo = data?.databases?.pageInfo || {
		hasNextPage: false,
		hasPreviousPage: false,
	};

	return {
		databases,
		primaryKeyConstraints,
		uniqueConstraints,
		foreignKeyConstraints,
		indexes,
		totalCount,
		isLoading,
		error,
		pageInfo,
		refetch,
	};
}

/**
 * Generate query keys for consistent cache management
 */
export const userDatabasesQueryKeys = {
	all: ['user-databases'] as const,
	byContext: (context: SchemaContext) => [...userDatabasesQueryKeys.all, { context }] as const,
	byUser: (context: SchemaContext, userId: string) =>
		[...userDatabasesQueryKeys.byContext(context), { ownerId: userId }] as const,
};
