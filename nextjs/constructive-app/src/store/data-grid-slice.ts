import { StateCreator } from 'zustand';

import { cleanTable } from '@/lib/gql/data.types';
import type { CellValue } from '@/lib/types/cell-types';
import type { DataGridV2Filter } from '@/components/dashboard/data-grid/data-grid.controls';

export interface DataGridSlice {
	starredTables: string[];
	toggleStarredTable: (tableName: string) => void;
	addStarredTable: (tableName: string) => void;
	removeStarredTable: (tableName: string) => void;
	clearStarredTables: () => void;

	// Filters/global search
	gridFilters: DataGridV2Filter[];
	gridGlobalFilter: string;
	gridFiltersOpen: boolean;
	setGridFilters: (filters: DataGridV2Filter[]) => void;
	setGridGlobalFilter: (value: string) => void;
	setGridFiltersOpen: (open: boolean) => void;
	addGridFilter: (firstColumn?: string) => void;
	removeGridFilter: (index: number) => void;
	updateGridFilter: (index: number, updates: Partial<DataGridV2Filter>) => void;
	clearAllGridFilters: () => void;
	applyGridFilters: () => void;

	// Create/Edit form state
	gridFormOpen: boolean;
	gridFormMode: 'create' | 'edit' | 'view';
	gridFormData: Record<string, CellValue>;
	gridFormLoading: boolean;
	gridFormError: string | null;
	openCreateForm: (initialData?: Record<string, CellValue>) => void;
	openEditForm: (data: Record<string, CellValue>) => void;
	openViewForm: (data: Record<string, CellValue>) => void;
	closeForm: () => void;
	setFormLoading: (loading: boolean) => void;
	setFormError: (err: string | null) => void;

	// Pagination (basic state; consumers can compute derived values)
	gridPageIndex: number;
	gridPageSize: number;
	setGridPageIndex: (index: number) => void;
	setGridPageSize: (size: number) => void;

	// Relation metadata cache by table -> field
	relationInfoCache: Record<string, Record<string, RelationInfo>>;
	relationInfoMapCache: Record<string, Map<string, RelationInfo>>;
	setRelationInfoForTable: (tableName: string, info: Record<string, RelationInfo>) => void;
	getRelationInfoForTable: (tableName: string) => Record<string, RelationInfo> | undefined;
	getRelationInfoMapForTable: (tableName: string) => Map<string, RelationInfo> | undefined;
	rebuildRelationInfo: (tableName: string, meta: any) => void;
	ensureRelationInfo: (tableName: string, meta: any) => Record<string, RelationInfo>;
	clearRelationInfoCache: () => void;
}

export type RelationKind = 'belongsTo' | 'hasOne' | 'hasMany' | 'manyToMany';
export interface RelationInfo {
	kind: RelationKind;
	relatedTable?: string;
	displayCandidates: string[];
	relationField?: string;
	foreignKeyField?: string;
	junctionTable?: string;
	junctionLeftKeyField?: string;
	junctionRightKeyField?: string;
}

export const createDataGridSlice: StateCreator<DataGridSlice, [], [], DataGridSlice> = (set, get) => ({
	starredTables: [],

	toggleStarredTable: (tableName: string) => {
		const { starredTables } = get();
		if (starredTables.includes(tableName)) {
			set({ starredTables: starredTables.filter((t) => t !== tableName) });
		} else {
			set({ starredTables: [...starredTables, tableName] });
		}
	},

	addStarredTable: (tableName: string) => {
		const { starredTables } = get();
		if (!starredTables.includes(tableName)) {
			set({ starredTables: [...starredTables, tableName] });
		}
	},

	removeStarredTable: (tableName: string) => {
		set({ starredTables: get().starredTables.filter((t) => t !== tableName) });
	},

	clearStarredTables: () => {
		set({ starredTables: [] });
	},

	// Filters/global search
	gridFilters: [],
	gridGlobalFilter: '',
	gridFiltersOpen: false,
	setGridFilters: (filters) => set({ gridFilters: filters }),
	setGridGlobalFilter: (value) => set({ gridGlobalFilter: value }),
	setGridFiltersOpen: (open) => set({ gridFiltersOpen: open }),
	addGridFilter: (firstColumn) => {
		const filters = get().gridFilters;
		const id = firstColumn || 'id';
		set({ gridFilters: [...filters, { id, value: '' }] });
	},
	removeGridFilter: (index) => {
		set({ gridFilters: get().gridFilters.filter((_, i) => i !== index) });
	},
	updateGridFilter: (index, updates) => {
		set({ gridFilters: get().gridFilters.map((f, i) => (i === index ? { ...f, ...updates } : f)) });
	},
	clearAllGridFilters: () => set({ gridFilters: [], gridGlobalFilter: '' }),
	applyGridFilters: () => set({ gridFiltersOpen: false }),

	// Create/Edit form state
	gridFormOpen: false,
	gridFormMode: 'create',
	gridFormData: {},
	gridFormLoading: false,
	gridFormError: null,
	openCreateForm: (initialData = {}) =>
		set({ gridFormOpen: true, gridFormMode: 'create', gridFormData: initialData, gridFormError: null }),
	openEditForm: (data) => set({ gridFormOpen: true, gridFormMode: 'edit', gridFormData: data, gridFormError: null }),
	openViewForm: (data) => set({ gridFormOpen: true, gridFormMode: 'view', gridFormData: data, gridFormError: null }),
	closeForm: () => set({ gridFormOpen: false, gridFormData: {}, gridFormError: null }),
	setFormLoading: (loading) => set({ gridFormLoading: loading }),
	setFormError: (err) => set({ gridFormError: err }),

	// Pagination
	gridPageIndex: 0,
	gridPageSize: 100,
	setGridPageIndex: (index) => set({ gridPageIndex: Math.max(0, index) }),
	setGridPageSize: (size) => set({ gridPageSize: Math.max(1, size), gridPageIndex: 0 }),

	// Relation metadata cache
	relationInfoCache: {},
	relationInfoMapCache: {},
	setRelationInfoForTable: (tableName, info) =>
		set((state) => ({
			relationInfoCache: { ...state.relationInfoCache, [tableName]: info },
			relationInfoMapCache: { ...state.relationInfoMapCache, [tableName]: new Map(Object.entries(info)) },
		})),
	getRelationInfoForTable: (tableName) => get().relationInfoCache[tableName],
	getRelationInfoMapForTable: (tableName) => get().relationInfoMapCache[tableName],
	clearRelationInfoCache: () => set({ relationInfoCache: {}, relationInfoMapCache: {} }),
	rebuildRelationInfo: (tableName: string, meta: any) => {
		try {
			const info = buildRelationInfoFromMeta(tableName, meta);
			if (!info) return;
			set((state) => ({
				relationInfoCache: { ...state.relationInfoCache, [tableName]: info },
				relationInfoMapCache: { ...state.relationInfoMapCache, [tableName]: new Map(Object.entries(info)) },
			}));
		} catch {
			// ignore
		}
	},
	ensureRelationInfo: (tableName: string, meta: any) => {
		const existing = get().relationInfoCache[tableName];
		if (existing) return existing;
		const info = buildRelationInfoFromMeta(tableName, meta) || {};
		if (Object.keys(info).length) {
			set((state) => ({
				relationInfoCache: { ...state.relationInfoCache, [tableName]: info },
				relationInfoMapCache: { ...state.relationInfoMapCache, [tableName]: new Map(Object.entries(info)) },
			}));
		}
		return info;
	},
});

// Helper to compute relation info without mutating state
function buildRelationInfoFromMeta(tableName: string, meta: any): Record<string, RelationInfo> | null {
	// Single pass: filter and map in one reduce (avoids intermediate array)
	const tables: any[] = (meta?._meta?.tables ?? []).reduce((acc: any[], t: any) => {
		if (t != null) acc.push(cleanTable(t));
		return acc;
	}, []);
	const table = tables.find((t: any) => t?.name === tableName);
	if (!table) return null;

	// Pre-defined priority fields for display candidates
	const PRIORITY_FIELDS = [
		'displayName',
		'fullName',
		'preferredName',
		'nickname',
		'firstName',
		'lastName',
		'givenName',
		'familyName',
		'username',
		'handle',
		'email',
		'phone',
		'title',
		'label',
		'slug',
		'code',
		'name',
	];
	// Hoisted RegExp for name-like field detection
	const NAME_PATTERN = /name/i;

	const computeCandidates = (relatedTableName?: string): string[] => {
		if (!relatedTableName) return [];
		const related = tables.find((t: any) => t?.name === relatedTableName);
		if (!related) return [];

		// Convert to Set for O(1) lookups
		const fieldNamesSet = new Set<string>(related.fields.map((f: any) => f.name));

		// Filter priority fields that exist in this table
		const explicit = PRIORITY_FIELDS.filter((k) => fieldNamesSet.has(k));
		const explicitSet = new Set(explicit);

		// Find name-like fields not already in explicit
		const nameLike: string[] = [];
		for (const name of fieldNamesSet) {
			if (NAME_PATTERN.test(name) && !explicitSet.has(name)) {
				nameLike.push(name);
			}
		}
		nameLike.sort((a, b) => a.length - b.length);

		const idIfAny = fieldNamesSet.has('id') ? ['id'] : [];
		return Array.from(new Set([...explicit, ...nameLike, ...idIfAny]));
	};

	const info: Record<string, RelationInfo> = {};
	(table.relations?.belongsTo ?? []).forEach((r: any) => {
		if (!r) return;
		const displayCandidates = computeCandidates(r.referencesTable);
		const foreignKeys = (r.keys ?? []).map((k: any) => k?.name).filter(Boolean);
		const primaryForeignKey = foreignKeys[0];

		if (r?.fieldName) {
			info[r.fieldName] = {
				kind: 'belongsTo',
				relatedTable: r.referencesTable,
				displayCandidates,
				relationField: r.fieldName,
				foreignKeyField: primaryForeignKey,
			};
		}

		foreignKeys.forEach((fk: string) => {
			if (!fk) return;
			info[fk] = {
				kind: 'belongsTo',
				relatedTable: r.referencesTable,
				displayCandidates,
				relationField: r.fieldName ?? undefined,
				foreignKeyField: fk,
			};
		});
	});
	(table.relations?.hasOne ?? []).forEach((r: any) => {
		if (r?.fieldName) {
			info[r.fieldName] = {
				kind: 'hasOne',
				relatedTable: r.referencedByTable,
				displayCandidates: computeCandidates(r.referencedByTable),
				relationField: r.fieldName,
				foreignKeyField: (r.keys ?? []).map((k: any) => k?.name).filter(Boolean)[0],
			};
		}
	});
	(table.relations?.hasMany ?? []).forEach((r: any) => {
		if (r?.fieldName) {
			info[r.fieldName] = {
				kind: 'hasMany',
				relatedTable: r.referencedByTable,
				displayCandidates: computeCandidates(r.referencedByTable),
				relationField: r.fieldName,
				foreignKeyField: (r.keys ?? []).map((k: any) => k?.name).filter(Boolean)[0],
			};
		}
	});
	(table.relations?.manyToMany ?? []).forEach((r: any) => {
		if (r?.fieldName) {
			const junctionTableName = r.junctionTable;
			const junctionTable = junctionTableName ? tables.find((t: any) => t?.name === junctionTableName) : undefined;
			const junctionBelongsTo = junctionTable?.relations?.belongsTo ?? [];
			const leftRel = junctionBelongsTo.find((rel: any) => rel?.referencesTable === tableName);
			const rightRel = junctionBelongsTo.find((rel: any) => rel?.referencesTable === r.rightTable);
			const junctionLeftKeyField = leftRel?.keys?.map((k: any) => k?.name).filter(Boolean)[0];
			const junctionRightKeyField = rightRel?.keys?.map((k: any) => k?.name).filter(Boolean)[0];

			info[r.fieldName] = {
				kind: 'manyToMany',
				relatedTable: r.rightTable,
				displayCandidates: computeCandidates(r.rightTable),
				relationField: r.fieldName,
				junctionTable: junctionTableName,
				junctionLeftKeyField,
				junctionRightKeyField,
			};
		}
	});

	return info;
}

/* ==== Serialization and deserialization ==== */
export const serializeDataGridSlice = (state: DataGridSlice) => ({
	starredTables: state.starredTables,
	gridFilters: state.gridFilters,
	gridGlobalFilter: state.gridGlobalFilter,
	gridPageIndex: state.gridPageIndex,
	gridPageSize: state.gridPageSize,
});

export const deserializeDataGridSlice = (state: DataGridSlice) => ({
	starredTables: state.starredTables,
	gridFilters: state.gridFilters,
	gridGlobalFilter: state.gridGlobalFilter,
	gridPageIndex: state.gridPageIndex,
	gridPageSize: state.gridPageSize,
});

export { buildRelationInfoFromMeta as __buildRelationInfoFromMeta };
