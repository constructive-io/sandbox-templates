import { useMemo } from 'react';

import type { MetaField, MetaTable } from '@/lib/dynamic-form';
// Fluent UI context removed; return values directly

import { useTable } from '@/lib/gql';
import type { FieldSelection } from '@/lib/gql/field-selector';
import { buildEnhancedFieldMetaMap } from '@/lib/gql/hooks/dashboard/enhance-field-with-smart-tags';
import { useDashboardCacheScopeKey } from '@/lib/gql/hooks/dashboard/use-dashboard-cache-scope';
import { useMeta } from '@/lib/gql/hooks/dashboard/use-dashboard-meta-query';
import { useFieldSmartTags } from '@/lib/gql/hooks/schema-builder/use-field-smart-tags';
import { createColumnSchemaFromMeta } from '@/lib/gql/type-mapping';
import type { TableSchema } from '@/lib/types/cell-types';
import type { MetaQuery } from '@/lib/gql/meta-query.types';

// Data loading context type
export interface DataLoadingContextValue {
	// Table data
	data: any[];
	totalCount: number;
	// Loading states
	isLoading: boolean;
	isError: boolean;
	error: Error | null;
	// CRUD operations
	update: (id: string | number, data: Record<string, unknown>) => Promise<any>;
	create: (data: Record<string, unknown>) => Promise<any>;
	delete: (id: string | number) => Promise<any>;
	// Meta information
	meta: MetaQuery | undefined;
	tableMeta: MetaTable | null;
	tableSchema: TableSchema | null;
	fieldMetaMap: Map<string, MetaField>;
}

// Create context
// Context removed; consumers receive value directly

// Data loading hook configuration
export interface UseDataLoadingConfig {
	tableName: string;
	enabled?: boolean;
	queryOptions: {
		limit?: number;
		offset?: number;
		orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
		where?: any;
	};
	// Optional relation fields to load
	enabledRelations?: string[];
	/** Controls auto inclusion of belongsTo relations. true (default) includes all, false disables, array restricts to provided fields. */
	autoIncludeRelations?: boolean | string[];
}

// Main data loading hook
export function useDataLoading({
	tableName,
	enabled = true,
	queryOptions,
	enabledRelations,
	autoIncludeRelations,
}: UseDataLoadingConfig) {
	// Meta data for table information
	const { data: meta, isLoading: isMetaLoading, error: metaError } = useMeta({ enabled });
	// Get databaseId for smartTags fetch
	const scopeKey = useDashboardCacheScopeKey();
	// Get smartTags from schema-builder (for Upload/custom type rendering)
	const { smartTagsMap } = useFieldSmartTags({ databaseId: scopeKey.databaseId });

	const tableMeta = useMemo<MetaTable | null>(() => {
		const candidate = meta?._meta?.tables?.find((t) => t?.name === tableName) as MetaTable | undefined;
		return candidate ?? null;
	}, [meta, tableName]);

	// Table schema for form integration
	const tableSchema = useMemo<TableSchema | null>(() => buildTableSchema(tableMeta), [tableMeta]);

	// Field metadata map for quick lookup, enhanced with smartTags
	// This fixes Upload type rendering: smartTags.pgAlias="upload" overrides _meta.pgAlias="text"
	const fieldMetaMap = useMemo(() => {
		const candidate = meta?._meta?.tables?.find((t) => t?.name === tableName) as MetaTable | undefined;
		const fields = (candidate?.fields as MetaField[]) || [];
		return buildEnhancedFieldMetaMap(fields, tableName, smartTagsMap);
	}, [meta, tableName, smartTagsMap]);

	// Table data loading
	const autoRelationFields = useMemo(() => {
		const belongsToRelations: string[] =
			(tableMeta?.relations?.belongsTo as Array<{ fieldName: string | null }> | undefined)
				?.map((rel) => rel?.fieldName)
				.filter((name): name is string => Boolean(name)) ?? [];

		const autoOption = autoIncludeRelations;
		if (autoOption === false) {
			return [] as string[];
		}

		if (Array.isArray(autoOption)) {
			const allowed = new Set(autoOption);
			return belongsToRelations.filter((field) => allowed.has(field));
		}

		return Array.from(new Set(belongsToRelations));
	}, [tableMeta, autoIncludeRelations]);

	const relationSelection = useMemo<FieldSelection>(() => {
		const combined = new Set<string>();
		autoRelationFields.forEach((rel) => combined.add(rel));
		(enabledRelations ?? []).forEach((rel) => combined.add(rel));

		const selection = Array.from(combined);
		return selection.length > 0 ? { includeRelations: selection } : 'all';
	}, [autoRelationFields, enabledRelations]);

	const tableData = useTable(tableName, {
		...queryOptions,
		// Leverage field selection to include relation fields when requested
		select: relationSelection,
		enabled,
	});
	const {
		data = [],
		totalCount,
		update,
		create,
		delete: deleteRow,
		isLoading: isTableLoading,
		error: tableError,
	} = tableData as any;

	// Combined loading and error states
	const isLoading = isMetaLoading || isTableLoading;
	const isError = !!metaError || !!tableError;
	const error = (metaError as Error | null) || (tableError as Error | null) || null;

	const contextValue: DataLoadingContextValue = useMemo(
		() => ({
			data,
			totalCount,
			isLoading,
			isError,
			error,
			update,
			create,
			delete: deleteRow,
			meta,
			tableMeta,
			tableSchema,
			fieldMetaMap,
		}),
		[
			data,
			totalCount,
			isLoading,
			isError,
			error,
			update,
			create,
			deleteRow,
			meta,
			tableMeta,
			tableSchema,
			fieldMetaMap,
		],
	);

	return {
		contextValue,
		Provider: ({ children }: { children: any }) => children,
	};
}

function buildTableSchema(metaTable: MetaTable | null): TableSchema | null {
	if (!metaTable) return null;

	const columns: TableSchema['columns'] = [];
	for (const field of metaTable.fields ?? []) {
		if (!field) continue;
		columns.push(createColumnSchemaFromMeta(field as MetaField));
	}

	const primaryKeyFields = (metaTable.primaryKeyConstraints ?? [])
		.flatMap((constraint) => constraint?.fields ?? [])
		.map((field) => field?.name)
		.filter((name): name is string => Boolean(name));

	const inflection = (metaTable as any)?.inflection;

	const metadata: TableSchema['metadata'] = {
		label: inflection?.singular ?? metaTable.name ?? undefined,
		description: inflection?.plural ?? undefined,
		primaryKey: primaryKeyFields.length > 0 ? primaryKeyFields : undefined,
	};

	return {
		id: metaTable.name ?? 'unknown-table',
		name: metaTable.name ?? 'unknown-table',
		columns,
		metadata,
	};
}

// Convenience hooks for accessing specific parts of the context
export function useTableData() {
	return null as any;
}
export function useTableOperations() {
	return null as any;
}
export function useTableMeta() {
	return null as any;
}
