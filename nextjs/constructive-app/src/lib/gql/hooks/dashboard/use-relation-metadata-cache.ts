/**
 * Light-weight relation metadata cache with straightforward error handling
 */
import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { cleanTable, type CleanTable } from '../../data.types';
import { useMeta } from './use-dashboard-meta-query';
import { type DashboardCacheScopeKey, useDashboardCacheScopeKey } from './use-dashboard-cache-scope';
import { dashboardQueryKeys } from './dashboard-query-keys';

/**
 * Simple cache keys for relations
 */
export const RELATION_CACHE_KEYS = {
	tableRelations: (scope: DashboardCacheScopeKey, tableName: string) => dashboardQueryKeys.relations(scope, tableName),
} as const;

/**
 * Cache timing tuned for relation metadata
 */
export const RELATION_CACHE_CONFIG = {
	staleTime: 5 * 60 * 1000, // 5 minutes - reasonable for relation metadata
	gcTime: 30 * 60 * 1000, // 30 minutes - keep in memory longer
	retry: 3, // Retry failed requests
	retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 5000),
} as const;

export type RelationMetadataSource = 'relation' | 'foreignKey';

export interface RelationMetadata {
	tableName: string;
	fieldName: string;
	relationKind: 'belongsTo' | 'hasOne' | 'hasMany' | 'manyToMany';
	targetTable: string;
	isOptional: boolean;
	foreignKeyFields: string[];
	/** Headline relation field name when this metadata originates from a foreign key */
	relationFieldName?: string | null;
	/** Primary foreign key field associated with the relation */
	foreignKeyField?: string;
	/** Indicates whether the metadata entry is for the relation field or the FK column */
	sourceField: RelationMetadataSource;
	junctionTable?: string;
}

/**
 * Simple error state tracking
 */
export interface RelationCacheState {
	isLoading: boolean;
	isError: boolean;
	error: Error | null;
	hasData: boolean;
	relationCount: number;
}

export interface RelationMetadataSet {
	relationFields: RelationMetadata[];
	foreignKeyFields: RelationMetadata[];
}

/**
 * Cache and expose relation metadata for a table
 */
export function useRelationMetadataCache(tableName?: string) {
	const queryClient = useQueryClient();
	const scopeKey = useDashboardCacheScopeKey();
	const { data: metaData, isError: metaError, error: metaErrorDetails } = useMeta();

	// Get table relations with improved error handling
	const {
		data: tableRelations,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: RELATION_CACHE_KEYS.tableRelations(scopeKey, tableName || ''),
		queryFn: async (): Promise<CleanTable | null> => {
			if (!metaData?._meta?.tables || !tableName) {
				return null;
			}

			const metaTable = metaData._meta.tables.find((t) => t?.name === tableName);
			if (!metaTable) {
				// Don't throw error for missing table - just return null
				console.warn(`Table "${tableName}" not found in metadata`);
				return null;
			}

			return cleanTable(metaTable);
		},
		...RELATION_CACHE_CONFIG,
		refetchOnMount: 'always', // Stay fresh with meta query
		enabled: Boolean(metaData && tableName),
	});

	// Extract relation metadata with error handling
	const { relationFields, foreignKeyFields } = useMemo((): RelationMetadataSet => {
		if (!tableRelations?.relations || isError) {
			return { relationFields: [], foreignKeyFields: [] };
		}

		const relationFieldEntries: RelationMetadata[] = [];
		const foreignKeyEntries: RelationMetadata[] = [];
		const relations = tableRelations.relations;

		try {
			// Process belongsTo relations
			relations.belongsTo.forEach((rel) => {
				if (!rel) return;
				const foreignKeys = rel.keys.map((k) => k.name);
				const primaryForeignKey = foreignKeys[0];
				if (rel.fieldName) {
					relationFieldEntries.push({
						tableName: tableName || '',
						fieldName: rel.fieldName,
						relationKind: 'belongsTo',
						targetTable: rel.referencesTable,
						isOptional: !rel.isUnique,
						foreignKeyFields: foreignKeys,
						relationFieldName: rel.fieldName,
						foreignKeyField: primaryForeignKey,
						sourceField: 'relation',
					});
				}

				foreignKeys.forEach((fk) => {
					if (!fk) return;
					foreignKeyEntries.push({
						tableName: tableName || '',
						fieldName: fk,
						relationKind: 'belongsTo',
						targetTable: rel.referencesTable,
						isOptional: !rel.isUnique,
						foreignKeyFields: foreignKeys,
						relationFieldName: rel.fieldName ?? null,
						foreignKeyField: fk,
						sourceField: 'foreignKey',
					});
				});
			});

			// Process hasOne relations
			relations.hasOne.forEach((rel) => {
				if (rel.fieldName) {
					relationFieldEntries.push({
						tableName: tableName || '',
						fieldName: rel.fieldName,
						relationKind: 'hasOne',
						targetTable: rel.referencedByTable,
						isOptional: true,
						foreignKeyFields: rel.keys.map((k) => k.name),
						relationFieldName: rel.fieldName,
						foreignKeyField: rel.keys[0]?.name,
						sourceField: 'relation',
					});
				}
			});

			// Process hasMany relations
			relations.hasMany.forEach((rel) => {
				if (rel.fieldName) {
					relationFieldEntries.push({
						tableName: tableName || '',
						fieldName: rel.fieldName,
						relationKind: 'hasMany',
						targetTable: rel.referencedByTable,
						isOptional: true,
						foreignKeyFields: rel.keys.map((k) => k.name),
						relationFieldName: rel.fieldName,
						foreignKeyField: rel.keys[0]?.name,
						sourceField: 'relation',
					});
				}
			});

			// Process manyToMany relations
			relations.manyToMany.forEach((rel) => {
				if (rel.fieldName) {
					relationFieldEntries.push({
						tableName: tableName || '',
						fieldName: rel.fieldName,
						relationKind: 'manyToMany',
						targetTable: rel.rightTable,
						isOptional: true,
						foreignKeyFields: [],
						relationFieldName: rel.fieldName,
						foreignKeyField: undefined,
						sourceField: 'relation',
						junctionTable: rel.junctionTable,
					});
				}
			});
		} catch (processError) {
			console.warn('Error processing relation metadata:', processError);
		}

		return { relationFields: relationFieldEntries, foreignKeyFields: foreignKeyEntries };
	}, [tableRelations, tableName, isError]);

	const relationMetadata = useMemo(() => relationFields.concat(foreignKeyFields), [relationFields, foreignKeyFields]);

	const relationMap = useMemo(() => {
		const map = new Map<string, RelationMetadata>();
		relationFields.forEach((rel) => {
			map.set(rel.fieldName, rel);
		});
		foreignKeyFields.forEach((rel) => {
			map.set(rel.fieldName, rel);
		});
		return map;
	}, [relationFields, foreignKeyFields]);

	// Simple cache invalidation
	const invalidateRelationCache = useCallback(async () => {
		if (tableName) {
			await queryClient.invalidateQueries({
				queryKey: RELATION_CACHE_KEYS.tableRelations(scopeKey, tableName),
			});
		}
	}, [queryClient, scopeKey, tableName]);

	// Get relation info for a specific field
	const getRelationInfo = useCallback(
		(fieldName: string): RelationMetadata | null => {
			return relationMap.get(fieldName) || null;
		},
		[relationMap],
	);

	// Check if field is a relation
	const isRelationField = useCallback(
		(fieldName: string): boolean => {
			return relationMap.has(fieldName);
		},
		[relationMap],
	);

	// Get relation kind for backward compatibility
	const getRelationKind = useCallback(
		(fieldName: string): 'belongsTo' | 'hasOne' | 'hasMany' | 'manyToMany' | null => {
			const relation = relationMap.get(fieldName);
			return relation?.relationKind || null;
		},
		[relationMap],
	);

	// Simple cache state
	const cacheState: RelationCacheState = useMemo(
		() => ({
			isLoading: isLoading || (!metaData && !metaError),
			isError: isError || metaError,
			error: error || metaErrorDetails || null,
			hasData: Boolean(tableRelations && relationMetadata.length > 0),
			relationCount: relationMetadata.length,
		}),
		[isLoading, metaData, metaError, isError, error, metaErrorDetails, tableRelations, relationMetadata.length],
	);

	return {
		// Data
		relationMetadata,
		relationFields,
		foreignKeyFields,
		relationMap,
		tableRelations,

		// State
		cacheState,
		isLoading,
		isError,
		error,

		// Utilities
		getRelationInfo,
		isRelationField,
		getRelationKind,
		invalidateRelationCache,
	};
}
