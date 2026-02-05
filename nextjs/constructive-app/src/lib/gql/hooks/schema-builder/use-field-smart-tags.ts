/**
 * Hook to fetch field smartTags from schema-builder API for a given database.
 * Tier 4 wrapper: Uses SDK hooks + composition
 *
 * This supplements the dashboard _meta query which returns pgAlias from PostgreSQL introspection.
 * For fields with custom types (upload, image, etc.) stored as base types (text) with
 * smartTags.pgAlias, we need this additional data to render the correct cell type.
 *
 * Architecture:
 * - Schema Builder stores: type="text", smartTags={ pgAlias: "upload" }
 * - Dashboard _meta returns: pgAlias="text" (from PG introspection)
 * - This hook provides: smartTags.pgAlias="upload" to override the _meta value
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAppStore, useShallow } from '@/store/app-store';
import {
	fetchFieldsQuery,
	fetchTablesQuery,
} from '@sdk/app-public';

export interface FieldSmartTagsMap {
	/** Map of "tableName.fieldName" -> smartTags object */
	byFullKey: Map<string, Record<string, unknown>>;
	/** Map of tableName -> Map of fieldName -> smartTags */
	byTable: Map<string, Map<string, Record<string, unknown>>>;
}

interface UseFieldSmartTagsOptions {
	databaseId: string | null | undefined;
	enabled?: boolean;
}

interface UseFieldSmartTagsResult {
	smartTagsMap: FieldSmartTagsMap;
	isLoading: boolean;
	error: Error | null;
}

const EMPTY_SMART_TAGS_MAP: FieldSmartTagsMap = {
	byFullKey: new Map(),
	byTable: new Map(),
};

interface SmartTagsQueryResult {
	tables: Map<string, string>; // tableId -> tableName
	fields: Array<{ tableId: string; name: string; smartTags: Record<string, unknown> | null }>;
}

/**
 * Hook to fetch field smartTags from schema-builder for a given database.
 *
 * Returns a map structure for efficient lookup by table and field name.
 * Falls back gracefully if schema-builder auth is not available.
 */
export function useFieldSmartTags(options: UseFieldSmartTagsOptions): UseFieldSmartTagsResult {
	const { databaseId, enabled = true } = options;

	// Check if schema-builder auth is available
	const { isSchemaBuilderAuthenticated, schemaBuilderUserId } = useAppStore(
		useShallow((state) => ({
			isSchemaBuilderAuthenticated: state.schemaBuilderAuth.isAuthenticated,
			schemaBuilderUserId: state.schemaBuilderAuth.user?.id ?? state.schemaBuilderAuth.token?.userId,
		})),
	);

	const canFetch = enabled && !!databaseId && isSchemaBuilderAuthenticated && !!schemaBuilderUserId;

	const { data, isLoading, error } = useQuery<SmartTagsQueryResult>({
		queryKey: ['schema-builder', 'field-smart-tags', databaseId],
		queryFn: async (): Promise<SmartTagsQueryResult> => {
			if (!databaseId) {
				throw new Error('No database ID available');
			}

			// Step 1: Fetch tables for this database
			const tablesResult = await fetchTablesQuery({
				filter: { databaseId: { equalTo: databaseId } },
			});

			const tables = tablesResult.tables?.nodes ?? [];
			if (tables.length === 0) {
				return { tables: new Map(), fields: [] };
			}

			// Build tableId -> tableName map
			const tableIdToName = new Map<string, string>();
			const tableIds: string[] = [];
			for (const table of tables) {
				if (table.id && table.name) {
					tableIdToName.set(table.id, table.name);
					tableIds.push(table.id);
				}
			}

			// Step 2: Fetch fields for all tables in this database
			const fieldsResult = await fetchFieldsQuery({
				filter: { tableId: { in: tableIds } },
			});

			const fields = (fieldsResult.fields?.nodes ?? []).map((f) => ({
				tableId: f.tableId ?? '',
				name: f.name ?? '',
				smartTags: (f.smartTags as Record<string, unknown>) ?? null,
			}));

			return { tables: tableIdToName, fields };
		},
		enabled: canFetch,
		staleTime: 5 * 60 * 1000, // 5 minutes - smartTags don't change often
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});

	const smartTagsMap = useMemo<FieldSmartTagsMap>(() => {
		if (!data || data.tables.size === 0) {
			return EMPTY_SMART_TAGS_MAP;
		}

		const byFullKey = new Map<string, Record<string, unknown>>();
		const byTable = new Map<string, Map<string, Record<string, unknown>>>();

		for (const field of data.fields) {
			const tableName = data.tables.get(field.tableId);
			if (!tableName || !field.name) continue;

			const smartTags = field.smartTags;
			if (smartTags && typeof smartTags === 'object' && Object.keys(smartTags).length > 0) {
				const fullKey = `${tableName}.${field.name}`;
				byFullKey.set(fullKey, smartTags);

				let tableMap = byTable.get(tableName);
				if (!tableMap) {
					tableMap = new Map<string, Record<string, unknown>>();
					byTable.set(tableName, tableMap);
				}
				tableMap.set(field.name, smartTags);
			}
		}

		return { byFullKey, byTable };
	}, [data]);

	return {
		smartTagsMap,
		isLoading: canFetch && isLoading,
		error: error as Error | null,
	};
}

/**
 * Extract pgAlias from smartTags object.
 * Checks multiple possible key names for compatibility.
 */
export function extractPgAliasFromSmartTags(smartTags: Record<string, unknown> | null | undefined): string | null {
	if (!smartTags || typeof smartTags !== 'object') return null;

	// Check standard keys in priority order
	const aliasCandidates = ['pgAlias', 'type', 'alias'];
	for (const key of aliasCandidates) {
		const value = smartTags[key];
		if (typeof value === 'string' && value.trim().length > 0) {
			return value;
		}
	}

	return null;
}

/**
 * Get pgAlias override for a specific field from smartTags map.
 */
export function getPgAliasOverride(
	smartTagsMap: FieldSmartTagsMap,
	tableName: string,
	fieldName: string,
): string | null {
	const tableMap = smartTagsMap.byTable.get(tableName);
	if (!tableMap) return null;

	const smartTags = tableMap.get(fieldName);
	return extractPgAliasFromSmartTags(smartTags);
}
