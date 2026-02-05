/**
 * Schema Builder Selectors Hook
 *
 * This hook provides derived state by combining:
 * 1. React Query data from SchemaBuilderDataProvider
 * 2. Zustand selection state (selectedSchemaKey, selectedTableId, etc.)
 *
 * All derived values are computed via useMemo - nothing is stored redundantly.
 * This eliminates the sync layer that caused race conditions.
 */
import { createElement, useCallback, useMemo, type ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { createContext, useContextSelector } from '@fluentui/react-context-selector';

import { transformUserDatabases } from '@/lib/gql/schema-builder/transformers';
import { useTableSelection } from '@/lib/navigation';
import { useAppStore, useShallow } from '@/store/app-store';
import type { CurrentDatabaseApi, SchemaInfo as StoreSchemaInfo } from '@/store/schema-slice';
import type {
	DbLightSchema,
	FieldDefinition,
	SchemaData,
	TableDefinition,
} from '@/lib/schema';
import { dbLightToSchemaData } from '@/lib/schema';
// Database schema mapping removed - database functionality has been removed from the application

import { useAccessibleDatabases } from './use-accessible-databases';
import { useDatabaseConstraints } from './use-database-constraints';

// Re-export types for convenience
export type { CurrentDatabaseApi, StoreSchemaInfo };

export interface SchemaInfo {
	key: string;
	name: string;
	description: string;
	category: string;
	nodeCount: number;
	edgeCount: number;
	source: 'custom' | 'database';
	schema: SchemaData;
	dbSchema?: DbLightSchema;
	checksum?: string;
	databaseInfo?: {
		id: string;
		name: string;
		label?: string | null;
		schemaName?: string | null;
		schemaId?: string | null;
		ownerName?: string;
		ownerId?: string;
		tableCount: number;
		fieldCount: number;
	};
}

export interface CurrentDatabaseInfo {
	schemaKey: string;
	databaseId: string;
	name: string;
	label: string | null;
	schemaName: string | null;
	schemaId: string | null;
}

export interface SchemaBuilderDataState {
	availableSchemas: SchemaInfo[];
	selectedSchemaKey: string;
	currentSchemaInfo: SchemaInfo | null;
	currentSchema: DbLightSchema | null;
	currentTable: TableDefinition | null;
	selectedTableId: string | null;
	isLoading: boolean;
	isFetching: boolean;
	error: Error | null;
	refetch: () => Promise<unknown>;
	selectTable: (tableId: string | null, tableName?: string | null) => void;
}

const SchemaBuilderDataContext = createContext<SchemaBuilderDataState | null>(null);

export function SchemaBuilderDataProvider({ children }: { children: ReactNode }) {
	const {
		databases,
		isLoading: dbLoading,
		isFetching: dbFetching,
		error: dbError,
		refetch: refetchDatabases,
	} = useAccessibleDatabases();

	const {
		primaryKeyConstraints,
		uniqueConstraints,
		foreignKeyConstraints,
		indexes,
		isLoading: constraintsLoading,
		isFetching: constraintsFetching,
		error: constraintsError,
	} = useDatabaseConstraints();

	const isLoading = dbLoading || constraintsLoading;
	const isFetching = dbFetching || constraintsFetching;
	const error = dbError || constraintsError;

	const remoteSchemas = useMemo<SchemaInfo[]>(() => {
		const start = typeof performance !== 'undefined' ? performance.now() : null;
		const transformed = transformUserDatabases(
			databases,
			primaryKeyConstraints,
			uniqueConstraints,
			foreignKeyConstraints,
			indexes,
		);

		const schemas = transformed.map((entry) => ({
			key: entry.key,
			name: entry.dbSchema.name,
			description: entry.description ?? entry.dbSchema.description ?? '',
			category: entry.category ?? 'Database',
			nodeCount: entry.dbSchema.tables.length,
			edgeCount: entry.dbSchema.relationships?.length ?? 0,
			source: 'database' as const,
			schema: dbLightToSchemaData(entry.dbSchema),
			dbSchema: entry.dbSchema,
			checksum: entry.checksum,
			databaseInfo: entry.databaseInfo,
		}));

		if (start !== null && process.env.NODE_ENV === 'development') {
			const duration = performance.now() - start;
			if (duration > 16) {
				console.debug(`[schema-builder] transformUserDatabases ${Math.round(duration)}ms`);
			}
		}

		return schemas;
	}, [databases, primaryKeyConstraints, uniqueConstraints, foreignKeyConstraints, indexes]);

	const { customSchemas, storeSelectedSchemaKey, storeSelectedTableId, storeSelectTable } = useAppStore(
		useShallow((state) => ({
			customSchemas: state.customSchemas,
			storeSelectedSchemaKey: state.selectedSchemaKey,
			storeSelectedTableId: state.selectedTable,
			storeSelectTable: state.selectTable,
		})),
	);

	const availableSchemas = useMemo(
		() => [...remoteSchemas, ...customSchemas],
		[remoteSchemas, customSchemas],
	);

	const params = useParams();
	const urlDatabaseId = (params?.databaseId as string) ?? null;
	const urlOrgId = (params?.orgId as string) ?? null;
	const [urlTableName, setUrlTableName] = useTableSelection();

	// Database schema key lookup removed - database functionality has been removed
	const urlSchemaKey = useMemo(() => {
		return null;
	}, [urlDatabaseId, urlOrgId]);

	const selectedSchemaKey = urlSchemaKey ?? storeSelectedSchemaKey;

	const currentSchemaInfo = useMemo(
		() => availableSchemas.find((schema) => schema.key === selectedSchemaKey) ?? null,
		[availableSchemas, selectedSchemaKey],
	);

	const currentSchema = currentSchemaInfo?.dbSchema ?? null;

	const tableFromUrl = useMemo(() => {
		if (!urlTableName || !currentSchema) return null;
		return currentSchema.tables.find((table) => table.name.toLowerCase() === urlTableName.toLowerCase()) ?? null;
	}, [currentSchema, urlTableName]);

	const isDatabaseContext = Boolean(urlSchemaKey);
	const selectedTableId = isDatabaseContext ? tableFromUrl?.id ?? null : storeSelectedTableId;

	const currentTable = useMemo(
		() => currentSchema?.tables.find((table) => table.id === selectedTableId) ?? null,
		[currentSchema, selectedTableId],
	);

	// URL is source of truth for database context (urlSchemaKey, tableFromUrl).
	// Store state (storeSelectedSchemaKey, storeSelectedTableId) is fallback for
	// non-database contexts (custom schemas) where there's no URL routing.

	const selectTable = useCallback(
		(tableId: string | null, tableName?: string | null) => {
			if (!isDatabaseContext) {
				storeSelectTable(tableId);
				return;
			}

			if (!tableId) {
				setUrlTableName(null);
				return;
			}

			if (tableName) {
				setUrlTableName(tableName);
				return;
			}

			const table = currentSchema?.tables.find((t) => t.id === tableId);
			if (table?.name) {
				setUrlTableName(table.name);
			}
		},
		[currentSchema, isDatabaseContext, setUrlTableName, storeSelectTable],
	);

	const refetch = useCallback(async () => {
		await refetchDatabases();
	}, [refetchDatabases]);

	const value = useMemo(
		() => ({
			availableSchemas,
			selectedSchemaKey,
			currentSchemaInfo,
			currentSchema,
			currentTable,
			selectedTableId,
			isLoading,
			isFetching,
			error,
			refetch,
			selectTable,
		}),
		[
			availableSchemas,
			selectedSchemaKey,
			currentSchemaInfo,
			currentSchema,
			currentTable,
			selectedTableId,
			isLoading,
			isFetching,
			error,
			refetch,
			selectTable,
		],
	);

	return createElement(SchemaBuilderDataContext.Provider, { value }, children);
}

export function useSchemaBuilderDataSelector<T>(selector: (state: SchemaBuilderDataState) => T): T {
	return useContextSelector(SchemaBuilderDataContext, (state) => {
		if (!state) {
			throw new Error('SchemaBuilderDataProvider is missing');
		}
		return selector(state);
	});
}

export interface UseSchemaBuilderSelectorsResult {
	// === Entity Selection State (from Zustand) ===
	selectedOrgId: string | null;
	selectedSchemaKey: string; // database key
	selectedTableId: string | null;
	selectedFieldId: string | null;
	activeTab: 'diagram' | 'schemas';

	// === Entity Selection Actions (from Zustand, with cascade clearing) ===
	selectOrg: (orgId: string | null) => void;
	selectSchema: (schemaKey: string) => void;
	selectTable: (tableId: string | null, tableName?: string | null) => void;
	selectField: (fieldId: string | null) => void;
	clearAllSelections: () => void;
	setActiveTab: (tab: 'diagram' | 'schemas') => void;

	// === Derived Data (computed, not stored) ===
	availableSchemas: SchemaInfo[];
	currentSchema: DbLightSchema | null;
	currentTable: TableDefinition | null;
	currentField: FieldDefinition | null;
	currentDatabase: CurrentDatabaseInfo | null;

	// === API State (from Zustand, fetched separately) ===
	currentDatabaseApi: CurrentDatabaseApi | null;
	setCurrentDatabaseApi: (api: CurrentDatabaseApi | null) => void;

	// === Computed Helpers ===
	isCustomSchema: (schemaKey: string) => boolean;
	getSchemaByKey: (key: string) => SchemaInfo | null;

	// === Loading/Error State ===
	/** True only on initial load (no cached data yet). Use for blocking UI. */
	isLoading: boolean;
	/** True during any fetch (including background refetch). Use for syncing indicators. */
	isFetching: boolean;
	error: Error | null;
	refetch: () => Promise<unknown>;

	// === Custom Schemas (localStorage-backed, kept in Zustand) ===
	customSchemas: SchemaInfo[];
}

export function useSchemaBuilderSelectors(): UseSchemaBuilderSelectorsResult {
	// 1. Get selection state from Zustand (lightweight, no server data)
	const {
		// Entity selection state
		selectedOrgId,
		selectedFieldId,
		activeTab,
		customSchemas,
		currentDatabaseApi,
		// Entity selection actions
		selectOrg,
		selectSchema: storeSelectSchema,
		selectField,
		clearAllSelections,
		setActiveTab,
		setCurrentDatabaseApi,
	} = useAppStore(
		useShallow((state) => ({
			// Entity selection state
			selectedOrgId: state.selectedOrgId,
			selectedFieldId: state.selectedField,
			activeTab: state.activeTab,
			customSchemas: state.customSchemas,
			currentDatabaseApi: state.currentDatabaseApi,
			// Entity selection actions
			selectOrg: state.selectOrg,
			selectSchema: state.selectSchema,
			selectField: state.selectField,
			clearAllSelections: state.clearAllSelections,
			setActiveTab: state.setActiveTab,
			setCurrentDatabaseApi: state.setCurrentDatabaseApi,
		})),
	);

	// 2. Get server + selection data from provider (computed once per tree)
	const availableSchemas = useSchemaBuilderDataSelector((state) => state.availableSchemas);
	const selectedSchemaKey = useSchemaBuilderDataSelector((state) => state.selectedSchemaKey);
	const currentSchemaInfo = useSchemaBuilderDataSelector((state) => state.currentSchemaInfo);
	const currentSchema = useSchemaBuilderDataSelector((state) => state.currentSchema);
	const currentTable = useSchemaBuilderDataSelector((state) => state.currentTable);
	const selectedTableId = useSchemaBuilderDataSelector((state) => state.selectedTableId);
	const isLoading = useSchemaBuilderDataSelector((state) => state.isLoading);
	const isFetching = useSchemaBuilderDataSelector((state) => state.isFetching);
	const error = useSchemaBuilderDataSelector((state) => state.error);
	const refetch = useSchemaBuilderDataSelector((state) => state.refetch);
	const selectTableFromProvider = useSchemaBuilderDataSelector((state) => state.selectTable);

	// 3. Derive current field (computed, not stored)
	const currentField = useMemo(
		() => currentTable?.fields.find((f) => f.id === selectedFieldId) ?? null,
		[currentTable, selectedFieldId],
	);

	// 8. Derive current database info (computed, not stored)
	const currentDatabase = useMemo<CurrentDatabaseInfo | null>(() => {
		if (!currentSchemaInfo?.databaseInfo) return null;
		return {
			schemaKey: selectedSchemaKey,
			databaseId: currentSchemaInfo.databaseInfo.id,
			name: currentSchemaInfo.databaseInfo.name,
			label: currentSchemaInfo.databaseInfo.label ?? null,
			schemaName: currentSchemaInfo.databaseInfo.schemaName ?? null,
			schemaId: currentSchemaInfo.databaseInfo.schemaId ?? null,
		};
	}, [currentSchemaInfo, selectedSchemaKey]);

	// 9. Helper functions
	const isCustomSchema = useMemo(() => (schemaKey: string) => schemaKey.startsWith('custom-'), []);

	const getSchemaByKey = useMemo(
		() => (key: string) => availableSchemas.find((s) => s.key === key) ?? null,
		[availableSchemas],
	);

	// 10. Wrapped selection actions that clear dependent selections
	const selectSchema = useCallback(
		(schemaKey: string) => {
			storeSelectSchema(schemaKey);
		},
		[storeSelectSchema],
	);

	const selectTable = useCallback(
		(tableId: string | null, tableName?: string | null) => {
			selectTableFromProvider(tableId, tableName);
			// Always clear field selection when selecting a table
			selectField(null);
		},
		[selectTableFromProvider, selectField],
	);

	return {
		// Entity selection state
		selectedOrgId,
		selectedSchemaKey,
		selectedTableId,
		selectedFieldId,
		activeTab,

		// Entity selection actions (with cascade clearing)
		selectOrg,
		selectSchema,
		selectTable,
		selectField,
		clearAllSelections,
		setActiveTab,

		// Derived data
		availableSchemas,
		currentSchema,
		currentTable,
		currentField,
		currentDatabase,

		// API state (from Zustand)
		currentDatabaseApi,
		setCurrentDatabaseApi,

		// Helpers
		isCustomSchema,
		getSchemaByKey,

		// Loading/error
		isLoading,
		isFetching,
		error,
		refetch,

		// Custom schemas
		customSchemas,
	};
}

export interface UseVisualizerSchemaOptions {
	/** Show CORE/MODULE tables in addition to APP tables. Default: false */
	showSystemTables?: boolean;
}

/**
 * Hook to get visualizer schema data.
 * Computed from currentSchema - call this only where needed (visualizer components).
 *
 * @param options.showSystemTables - If true, include CORE/MODULE tables. Default: false (only APP tables)
 */
export function useVisualizerSchema(options?: UseVisualizerSchemaOptions): SchemaData | null {
	const { currentSchema } = useSchemaBuilderSelectors();
	const { showSystemTables = false } = options ?? {};

	return useMemo(() => {
		if (!currentSchema) return null;

		// Determine which categories to include
		const includeCategories: ('APP' | 'MODULE' | 'CORE')[] = showSystemTables
			? ['APP', 'MODULE', 'CORE']
			: ['APP'];

		return dbLightToSchemaData(currentSchema, { includeCategories });
	}, [currentSchema, showSystemTables]);
}

/**
 * Hook to get constraint information for a table.
 * Useful for field-level operations.
 */
export function useTableConstraints(tableId: string | null) {
	const { currentSchema } = useSchemaBuilderSelectors();

	return useMemo(() => {
		if (!tableId || !currentSchema) {
			return {
				primaryKey: null,
				uniqueConstraints: [],
				foreignKeyConstraints: [],
				indexes: [],
			};
		}

		const table = currentSchema.tables.find((t) => t.id === tableId);
		if (!table) {
			return {
				primaryKey: null,
				uniqueConstraints: [],
				foreignKeyConstraints: [],
				indexes: [],
			};
		}

		const constraints = table.constraints ?? [];
		let primaryKey = null;
		const uniqueConstraints = [];
		const foreignKeyConstraints = [];

		for (const c of constraints) {
			if (c.type === 'primary_key') primaryKey = c;
			else if (c.type === 'unique') uniqueConstraints.push(c);
			else if (c.type === 'foreign_key') foreignKeyConstraints.push(c);
		}

		return {
			primaryKey,
			uniqueConstraints,
			foreignKeyConstraints,
			indexes: table.indexes ?? [],
		};
	}, [tableId, currentSchema]);
}
