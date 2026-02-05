import { StateCreator } from 'zustand';

import { CellRegistry } from '@/lib/cell-registry/registry';
import type { CellType } from '@/lib/types/cell-types';
import { resolveCellType, type FieldMetadata } from '@/components/dashboard/data-grid/cell-type-resolver';

import type { RelationInfo } from './data-grid-slice';

type DraftRowStatus = 'idle' | 'saving' | 'error';

export interface DraftRow {
	id: string;
	values: Record<string, unknown>;
	status: DraftRowStatus;
	errors: Record<string, string> | null;
	createdAt: number;
	metaVersion: string;
}

interface DraftRowsTableState {
	order: string[];
	map: Record<string, DraftRow>;
	template: Record<string, unknown>;
	metaVersion: string;
	columnOrder: string[];
}

type ParsedDraftTableKey = {
	schemaContext: string;
	databaseId: string | null;
	tableName: string;
};

export function parseDraftTableKey(tableKey: string): ParsedDraftTableKey | null {
	const parts = tableKey.split('::');
	if (parts.length === 2) {
		const [schemaContext, tableName] = parts;
		if (!schemaContext || !tableName) return null;
		return { schemaContext, databaseId: null, tableName };
	}
	if (parts.length === 3) {
		const [schemaContext, databaseId, tableName] = parts;
		if (!schemaContext || !databaseId || !tableName) return null;
		return { schemaContext, databaseId, tableName };
	}
	return null;
}

export interface DraftRowCreationArgs {
	tableKey: string;
	columnOrder: readonly string[];
	fieldMetaByKey: Record<string, DraftFieldMetadata | undefined>;
	relationInfoByKey?: Record<string, RelationInfo | undefined>;
	metaVersion: string;
}

export type DraftRowsSyncArgs = DraftRowCreationArgs;

export interface DraftRowUpdateArgs {
	tableKey: string;
	draftRowId: string;
	columnKey: string;
	value: unknown;
	extraValues?: Record<string, unknown>;
}

export interface DraftRowsSlice {
	draftRowsByTable: Record<string, DraftRowsTableState | undefined>;
	createDraftRow: (args: DraftRowCreationArgs) => string;
	updateDraftCell: (args: DraftRowUpdateArgs) => void;
	removeDraftRow: (tableKey: string, draftRowId: string) => void;
	clearDraftRowsForTable: (tableKey: string) => void;
	clearDraftRowsForDatabase: (databaseId: string) => void;
	clearAllDraftRows: () => void;
	syncDraftRowsWithMeta: (args: DraftRowsSyncArgs) => void;
	setDraftRowStatus: (args: {
		tableKey: string;
		draftRowId: string;
		status: DraftRowStatus;
		errors?: Record<string, string> | null;
	}) => void;
}

type DraftFieldMetadata = {
	name?: string | null;
	type?: {
		gqlType?: string | null;
		isArray?: boolean | null;
		pgAlias?: string | null;
		pgType?: string | null;
		subtype?: string | null;
	} | null;
};

export const createDraftRowsSlice: StateCreator<DraftRowsSlice, [], [], DraftRowsSlice> = (set) => ({
	draftRowsByTable: {},

	createDraftRow: (args) => {
		const { tableKey, columnOrder, fieldMetaByKey, relationInfoByKey, metaVersion } = args;

		const effectiveColumnOrder = ensureColumnOrder(columnOrder, fieldMetaByKey, relationInfoByKey);
		const template = buildTemplate(effectiveColumnOrder, fieldMetaByKey, relationInfoByKey);
		const draftRowId = `draft:${generateDraftSuffix()}`;
		const values = initializeValuesFromTemplate(template, draftRowId);

		set((state) => {
			const existing = state.draftRowsByTable[tableKey];

			const nextOrder = existing ? [...existing.order, draftRowId] : [draftRowId];
			const nextMap = {
				...(existing?.map ?? {}),
				[draftRowId]: {
					id: draftRowId,
					values,
					status: 'idle',
					errors: null,
					createdAt: Date.now(),
					metaVersion,
				},
			} satisfies DraftRowsTableState['map'];

			return {
				draftRowsByTable: {
					...state.draftRowsByTable,
					[tableKey]: {
						order: nextOrder,
						map: nextMap,
						template,
						metaVersion,
						columnOrder: [...effectiveColumnOrder],
					},
				},
			};
		});

		return draftRowId;
	},

	updateDraftCell: ({ tableKey, draftRowId, columnKey, value, extraValues }) => {
		set((state) => {
			const tableState = state.draftRowsByTable[tableKey];
			if (!tableState) return state;

			const existingRow = tableState.map[draftRowId];
			if (!existingRow) return state;

			const updatedValues = { ...existingRow.values, [columnKey]: deepClone(value) };
			if (extraValues) {
				for (const [key, extraValue] of Object.entries(extraValues)) {
					updatedValues[key] = deepClone(extraValue);
				}
			}

			const nextMap = {
				...tableState.map,
				[draftRowId]: {
					...existingRow,
					values: updatedValues,
					status: existingRow.status === 'error' ? 'idle' : existingRow.status,
					errors: null,
				},
			};

			return {
				draftRowsByTable: {
					...state.draftRowsByTable,
					[tableKey]: {
						...tableState,
						map: nextMap,
					},
				},
			};
		});
	},

	removeDraftRow: (tableKey, draftRowId) => {
		set((state) => {
			const tableState = state.draftRowsByTable[tableKey];
			if (!tableState) return state;
			if (!tableState.map[draftRowId]) return state;

			const nextOrder = tableState.order.filter((id) => id !== draftRowId);
			const nextMap = { ...tableState.map };
			delete nextMap[draftRowId];

			const nextTableState: DraftRowsTableState | undefined = nextOrder.length
				? {
						...tableState,
						order: nextOrder,
						map: nextMap,
					}
				: undefined;

			const nextByTable = { ...state.draftRowsByTable };
			if (nextTableState) {
				nextByTable[tableKey] = nextTableState;
			} else {
				delete nextByTable[tableKey];
			}

			return {
				draftRowsByTable: nextByTable,
			};
		});
	},

	clearDraftRowsForTable: (tableKey) => {
		set((state) => {
			if (!state.draftRowsByTable[tableKey]) return state;
			const nextByTable = { ...state.draftRowsByTable };
			delete nextByTable[tableKey];
			return {
				draftRowsByTable: nextByTable,
			};
		});
	},

	clearDraftRowsForDatabase: (databaseId) => {
		set((state) => {
			if (!databaseId || !Object.keys(state.draftRowsByTable).length) return state;
			let changed = false;
			const nextByTable: Record<string, DraftRowsTableState | undefined> = { ...state.draftRowsByTable };

			for (const tableKey of Object.keys(nextByTable)) {
				const parsed = parseDraftTableKey(tableKey);
				const matchesDatabase = parsed
					? parsed.databaseId === databaseId
					: tableKey.includes(`::${databaseId}::`);

				if (matchesDatabase) {
					delete nextByTable[tableKey];
					changed = true;
				}
			}

			return changed ? { draftRowsByTable: nextByTable } : state;
		});
	},

	clearAllDraftRows: () => {
		set((state) => {
			if (!Object.keys(state.draftRowsByTable).length) return state;
			return { draftRowsByTable: {} };
		});
	},

	syncDraftRowsWithMeta: (args) => {
		const { tableKey, columnOrder, fieldMetaByKey, relationInfoByKey, metaVersion } = args;

		set((state) => {
			const tableState = state.draftRowsByTable[tableKey];
			const effectiveColumnOrder = ensureColumnOrder(columnOrder, fieldMetaByKey, relationInfoByKey);
			const template = buildTemplate(effectiveColumnOrder, fieldMetaByKey, relationInfoByKey);

			if (!tableState) {
				if (!effectiveColumnOrder.length) return state;
				return {
					draftRowsByTable: {
						...state.draftRowsByTable,
						[tableKey]: {
							order: [],
							map: {},
							template,
							metaVersion,
							columnOrder: [...effectiveColumnOrder],
						},
					},
				};
			}

			const isSameMeta =
				tableState.metaVersion === metaVersion && shallowEqualArrays(tableState.columnOrder, effectiveColumnOrder);

			if (isSameMeta) {
				return state;
			}

			const nextMap: Record<string, DraftRow> = {};
			for (const draftId of tableState.order) {
				const row = tableState.map[draftId];
				if (!row) continue;

				const mergedValues: Record<string, unknown> = initializeValuesFromTemplate(template, draftId);

				for (const key of Object.keys(row.values)) {
					if (Object.prototype.hasOwnProperty.call(template, key)) {
						mergedValues[key] = deepClone(row.values[key]);
					}
				}

				nextMap[draftId] = {
					...row,
					values: mergedValues,
					metaVersion,
				};
			}

			return {
				draftRowsByTable: {
					...state.draftRowsByTable,
					[tableKey]: {
						order: [...tableState.order],
						map: nextMap,
						template,
						metaVersion,
						columnOrder: [...effectiveColumnOrder],
					},
				},
			};
		});
	},

	setDraftRowStatus: ({ tableKey, draftRowId, status, errors }) => {
		set((state) => {
			const tableState = state.draftRowsByTable[tableKey];
			if (!tableState) return state;
			const row = tableState.map[draftRowId];
			if (!row) return state;

			const nextMap = {
				...tableState.map,
				[draftRowId]: {
					...row,
					status,
					errors: errors ?? null,
				},
			};

			return {
				draftRowsByTable: {
					...state.draftRowsByTable,
					[tableKey]: {
						...tableState,
						map: nextMap,
					},
				},
			};
		});
	},
});

function ensureColumnOrder(
	columnOrder: readonly string[],
	fieldMetaByKey: Record<string, DraftFieldMetadata | undefined>,
	relationInfoByKey?: Record<string, RelationInfo | undefined>,
): string[] {
	if (columnOrder.length > 0) {
		return [...columnOrder];
	}

	const keys = new Set<string>();
	Object.keys(fieldMetaByKey).forEach((key) => {
		if (key) keys.add(key);
	});
	if (relationInfoByKey) {
		Object.keys(relationInfoByKey).forEach((key) => {
			if (key) keys.add(key);
		});
	}
	return Array.from(keys).sort((a, b) => a.localeCompare(b));
}

function buildTemplate(
	columnOrder: readonly string[],
	fieldMetaByKey: Record<string, DraftFieldMetadata | undefined>,
	relationInfoByKey?: Record<string, RelationInfo | undefined>,
): Record<string, unknown> {
	const template: Record<string, unknown> = {};

	for (const column of columnOrder) {
		if (!column) continue;
		const relationInfo = relationInfoByKey?.[column];
		const meta = toFieldMetadata(column, fieldMetaByKey[column]);

		if (relationInfo) {
			template[column] = relationInfo.kind === 'hasMany' || relationInfo.kind === 'manyToMany' ? [] : null;
			continue;
		}

		if (meta?.type) {
			const resolution = resolveCellType(column, meta);
			const defaultFromRegistry = resolveDefaultValue(resolution.cellType as CellType | string);
			if (meta.type.isArray) {
				template[column] = [];
			} else if (defaultFromRegistry !== undefined) {
				template[column] = defaultFromRegistry;
			} else {
				template[column] = null;
			}
			continue;
		}

		template[column] = null;
	}

	return template;
}

// Fallback default values for common cell types when CellRegistry has no entry.
// Only boolean types need explicit defaults to render correctly as checkboxes.
// Other types use null to indicate "not yet filled in".
const CELL_TYPE_DEFAULT_VALUES: Record<string, unknown> = {
	boolean: false,
	bit: false,
};

function resolveDefaultValue(cellType: CellType | string): unknown {
	const entry = CellRegistry.get(cellType as CellType);
	if (entry?.defaultValue) {
		try {
			return deepClone(entry.defaultValue());
		} catch {
			return entry.defaultValue();
		}
	}
	// Fallback to hardcoded defaults if CellRegistry has no entry
	if (Object.prototype.hasOwnProperty.call(CELL_TYPE_DEFAULT_VALUES, cellType)) {
		return CELL_TYPE_DEFAULT_VALUES[cellType];
	}
	return undefined;
}

function generateDraftSuffix(): string {
	const cryptoObj = typeof globalThis !== 'undefined' ? (globalThis as any).crypto : undefined;
	if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
		const buffer = new Uint32Array(1);
		cryptoObj.getRandomValues(buffer);
		return buffer[0].toString(36).slice(0, 8);
	}
	return Math.random().toString(36).slice(2, 10);
}

function initializeValuesFromTemplate(template: Record<string, unknown>, draftRowId: string): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(template)) {
		result[key] = deepClone(value);
	}

	if (!result.id) {
		result.id = draftRowId;
	}

	return result;
}

function toFieldMetadata(fieldName: string, meta?: DraftFieldMetadata): FieldMetadata | undefined {
	if (!meta) return undefined;
	const normalized: FieldMetadata = {
		name: fieldName,
	};

	if (meta.type) {
		normalized.type = {
			gqlType: meta.type.gqlType ?? '',
			isArray: Boolean(meta.type.isArray),
			pgAlias: meta.type.pgAlias ?? null,
			pgType: meta.type.pgType ?? null,
			subtype: meta.type.subtype ?? null,
		};
	}

	return normalized;
}

function deepClone<T>(value: T): T {
	if (Array.isArray(value)) {
		return value.map((item) => deepClone(item)) as unknown as T;
	}
	if (value instanceof Date) {
		return new Date(value.getTime()) as unknown as T;
	}
	if (value && typeof value === 'object') {
		const result: Record<string, unknown> = {};
		for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
			result[key] = deepClone(val);
		}
		return result as unknown as T;
	}
	return value;
}

function shallowEqualArrays(a: readonly string[], b: readonly string[]): boolean {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i += 1) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

export function computeDraftMetaSignature(
	columnOrder: readonly string[],
	fieldMetaByKey: Record<string, DraftFieldMetadata | undefined>,
	relationInfoByKey?: Record<string, RelationInfo | undefined>,
): string {
	const signatureParts = columnOrder.map((column) => {
		const typeMeta = fieldMetaByKey[column]?.type;
		const relationMeta = relationInfoByKey?.[column];

		const typePart = typeMeta
			? [
					typeMeta.gqlType ?? '',
					typeMeta.isArray ? '1' : '0',
					typeMeta.pgAlias ?? '',
					typeMeta.pgType ?? '',
					typeMeta.subtype ?? '',
				].join(':')
			: '';

		const relationPart = relationMeta
			? [relationMeta.kind ?? '', relationMeta.foreignKeyField ?? '', relationMeta.relationField ?? ''].join(':')
			: '';

		return `${column}|${typePart}|${relationPart}`;
	});

	return hashString(signatureParts.join('||'));
}

function hashString(input: string): string {
	let hash = 0;
	for (let i = 0; i < input.length; i += 1) {
		hash = (hash << 5) - hash + input.charCodeAt(i);
		hash |= 0;
	}
	return hash.toString(16);
}

export const serializeDraftRowsSlice = (state: DraftRowsSlice) => {
	const serialized: Record<string, DraftRowsTableState> = {};
	for (const [tableKey, tableState] of Object.entries(state.draftRowsByTable)) {
		if (!tableState) continue;
		serialized[tableKey] = {
			order: [...tableState.order],
			map: Object.fromEntries(
				Object.entries(tableState.map).map(([id, row]) => [
					id,
					{
						...row,
						values: deepClone(row.values),
						errors: row.errors ? { ...row.errors } : null,
					},
				]),
			),
			template: deepClone(tableState.template),
			metaVersion: tableState.metaVersion,
			columnOrder: [...tableState.columnOrder],
		};
	}

	return {
		draftRowsByTable: serialized,
	};
};

export const deserializeDraftRowsSlice = (state: DraftRowsSlice) => {
	const draftRowsByTable: Record<string, DraftRowsTableState> = {};
	for (const [tableKey, tableState] of Object.entries(state.draftRowsByTable)) {
		if (!tableState) continue;
		draftRowsByTable[tableKey] = {
			order: Array.isArray(tableState.order) ? [...tableState.order] : [],
			map: Object.fromEntries(
				Object.entries(tableState.map || {}).map(([id, row]) => [
					id,
					{
						...row,
						values: deepClone(row.values),
						errors: row.errors ? { ...row.errors } : null,
					},
				]),
			),
			template: deepClone(tableState.template || {}),
			metaVersion: tableState.metaVersion,
			columnOrder: Array.isArray(tableState.columnOrder) ? [...tableState.columnOrder] : [],
		};
	}

	return {
		draftRowsByTable,
	};
};
