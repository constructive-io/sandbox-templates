import { GridCell, GridColumnIcon, Item } from '@glideapps/glide-data-grid';

import { CellRegistry } from '@/lib/cell-registry/registry';
import type { MetaField } from '@/lib/dynamic-form';
import { prepareCreateInput } from '@/lib/gql/mutation-input';
import { isStructuredDataType, mapToFrontendCellType } from '@/lib/gql/type-mapping';
import type { RelationInfo } from '@/store/data-grid-slice';

import type { FieldMetadata } from './cell-type-resolver';
import type { DataGridV2Filter } from './data-grid.controls';
import { compactJsonPreview } from './data-grid.formatters';
import { isBooleanCell, isBubbleCell, isImageCell, isNumberCell, isTextCell, isUriCell } from './grid-cell-types';

export function formatColumnHeader(fieldName: string): string {
	return fieldName
		.replace(/([A-Z])/g, ' $1')
		.replace(/^./, (str) => str.toUpperCase())
		.replace(/_/g, ' ')
		.trim();
}

export function getColumnWidthByMeta(field: FieldMetadata): number {
	const t = field.type;
	if (!t) return 150;
	const cellType = mapToFrontendCellType({
		gqlType: t.gqlType,
		isArray: !!t.isArray,
		pgAlias: t.pgAlias,
		pgType: t.pgType,
		subtype: t.subtype ?? null,
	});
	const entry = CellRegistry.get(cellType);
	return entry?.metadata?.width ?? 150;
}

// Map cell types to Glide column icons
export function getCellTypeIcon(cellType: string | undefined): GridColumnIcon {
	switch (cellType) {
		case 'text':
		case 'textarea':
		case 'citext':
		case 'bpchar':
		case 'uuid':
		case 'tsvector':
		case 'origin':
		case 'unknown':
			return GridColumnIcon.HeaderString;

		case 'integer':
		case 'smallint':
		case 'number':
		case 'decimal':
		case 'currency':
			return GridColumnIcon.HeaderNumber;

		case 'boolean':
		case 'bit':
			return GridColumnIcon.HeaderBoolean;

		case 'image':
		case 'upload':
			return GridColumnIcon.HeaderImage;

		case 'url':
		case 'email':
			return GridColumnIcon.HeaderUri;

		case 'text-array':
		case 'uuid-array':
		case 'number-array':
		case 'integer-array':
		case 'date-array':
		case 'array':
			return GridColumnIcon.HeaderArray;

		case 'json':
		case 'jsonb':
			return GridColumnIcon.HeaderCode;

		case 'relation':
			return GridColumnIcon.HeaderRowID;

		default:
			return GridColumnIcon.HeaderString; // Fallback
	}
}

export function buildWhereFromFilters(filters: DataGridV2Filter[], globalFilter: string, tableMeta: any) {
	const where: Record<string, any> = {};

	// Column filters
	if (filters?.length) {
		const ands = filters
			.filter((f) => f.value !== '' && f.value !== null && f.value !== undefined)
			.map((f) => {
				const fieldMeta = tableMeta?.fields?.find((x: any) => x?.name === f.id);
				const gqlType = fieldMeta?.type?.gqlType;
				const isString = gqlType === 'String';
				if (isString) return { [f.id]: { includesInsensitive: f.value } };
				return { [f.id]: { equalTo: f.value } };
			});
		if (ands.length) where.and = ands;
	}

	// Global filter (v1 heuristic)
	if (globalFilter) {
		const textFields = ['name', 'description', 'title', 'email']; // same as v1 for now
		const ors = textFields.map((field) => ({ [field]: { includesInsensitive: globalFilter } }));
		if (where.and) where.and = [{ or: ors }, ...where.and];
		else where.or = ors;
	}

	return Object.keys(where).length ? where : undefined;
}

export function mapFromFieldMetaMap(fieldMetaMap: Map<string, MetaField>): Record<string, MetaField | undefined> {
	const record: Record<string, MetaField | undefined> = {};
	fieldMetaMap.forEach((value, key) => {
		record[key] = value;
	});
	return record;
}

export function mapFromRelationInfoMap(
	relationInfoMap: Map<string, RelationInfo | undefined>,
): Record<string, RelationInfo | undefined> {
	const record: Record<string, RelationInfo | undefined> = {};
	relationInfoMap.forEach((value, key) => {
		record[key] = value;
	});
	return record;
}

function unwrapConnectionNode(entry: unknown): unknown {
	if (!entry || typeof entry !== 'object') return entry;

	const record = entry as Record<string, unknown>;
	if ('node' in record && record.node !== undefined) {
		return unwrapConnectionNode(record.node);
	}
	return entry;
}

export function unwrapRelationValue<T = unknown>(value: T): T {
	if (Array.isArray(value)) {
		return value.map((entry) => unwrapRelationValue(entry)) as unknown as T;
	}

	if (value && typeof value === 'object') {
		const record = value as Record<string, unknown>;

		if (Array.isArray(record.nodes)) {
			return record.nodes.map((entry) => unwrapRelationValue(entry)) as unknown as T;
		}

		if (Array.isArray(record.edges)) {
			return record.edges.map((edge) => unwrapRelationValue(unwrapConnectionNode(edge))) as unknown as T;
		}

		if ('node' in record && record.node !== undefined) {
			return unwrapRelationValue(record.node) as unknown as T;
		}
	}

	return value;
}

export function normalizeServerRow(row: Record<string, unknown>, relationFields: Set<string>): Record<string, unknown> {
	if (!row || typeof row !== 'object') {
		return row;
	}

	const next: Record<string, unknown> = { ...row };
	relationFields.forEach((fieldName) => {
		next[fieldName] = unwrapRelationValue(next[fieldName]);
	});
	return next;
}

interface DraftSubmissionOptions {
	allowedColumns?: ReadonlySet<string>;
	relationInfoByKey?: Record<string, RelationInfo | undefined>;
}

export function prepareDraftSubmissionPayload(
	values: Record<string, unknown>,
	options: DraftSubmissionOptions = {},
): Record<string, unknown> {
	const { allowedColumns, relationInfoByKey } = options;
	const allowsAll = !allowedColumns || allowedColumns.size === 0;

	// Step 1: Filter nullish values using centralized utility
	// Draft submission is a CREATE operation, so null/undefined are filtered
	const { id: _id, ...valuesWithoutId } = values;
	const filtered = prepareCreateInput(valuesWithoutId);

	// Step 2: Apply relation-specific transformations
	const payload: Record<string, unknown> = {};

	const normalizeForeignKeyValue = (input: unknown): unknown => {
		if (input === undefined || input === null) return undefined;

		const extractId = (candidate: unknown): string | number | null => {
			if (candidate === null || candidate === undefined) return null;
			if (typeof candidate === 'object') {
				const record = candidate as Record<string, unknown>;
				const id = record.id;
				if (typeof id === 'string' || typeof id === 'number') {
					return id;
				}
				return null;
			}
			if (typeof candidate === 'string' || typeof candidate === 'number') {
				return candidate;
			}
			return null;
		};

		if (Array.isArray(input)) {
			return input
				.map((entry) => extractId(entry))
				.filter((entry): entry is string | number => entry !== undefined && entry !== null);
		}

		return extractId(input);
	};

	for (const [key, value] of Object.entries(filtered)) {
		const isAllowed = allowsAll || allowedColumns?.has(key);
		if (!isAllowed) continue;

		const relInfo = relationInfoByKey?.[key];

		if (relInfo?.relationField === key) {
			// Skip relation display fields; rely on the corresponding foreign key entry
			continue;
		}

		if (relInfo?.foreignKeyField === key) {
			const normalized = normalizeForeignKeyValue(value);
			if (normalized === undefined) continue;
			payload[key] = normalized;
			continue;
		}

		payload[key] = value;
	}

	return payload;
}

export function prepareDraftRelationValue(
	rawValue: unknown,
	relationInfo: RelationInfo,
): {
	relationData: unknown;
	foreignKeyUpdates?: Record<string, unknown>;
	relationReferences?: unknown;
} {
	let value = rawValue;

	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed) {
			value = null;
		} else {
			try {
				value = JSON.parse(trimmed);
			} catch {
				value = trimmed;
			}
		}
	}

	const isListRelation = relationInfo.kind === 'hasMany' || relationInfo.kind === 'manyToMany';

	if (isListRelation) {
		const entries = Array.isArray(value) ? value : value == null ? [] : [value];
		const normalized = entries
			.map(normalizeRelationEntry)
			.filter((entry): entry is RelationNormalization => entry !== null);

		const relationData = normalized.map((entry) => entry.value);
		const relationReferences = normalized.map((entry) => entry.reference ?? null);

		const fkField = relationInfo.foreignKeyField;
		const foreignKeyUpdates = fkField
			? {
					[fkField]: normalized.map((entry) => (entry.reference === undefined ? null : entry.reference)),
				}
			: undefined;

		return {
			relationData,
			foreignKeyUpdates,
			relationReferences,
		};
	}

	const normalizedEntry = normalizeRelationEntry(Array.isArray(value) ? (value[0] ?? null) : value);

	const relationData = normalizedEntry?.value ?? null;
	const relationReference = normalizedEntry?.reference ?? null;

	const fkField = relationInfo.foreignKeyField;
	const foreignKeyUpdates = fkField
		? {
				[fkField]: normalizedEntry?.reference ?? null,
			}
		: undefined;

	return {
		relationData,
		foreignKeyUpdates,
		relationReferences: relationReference,
	};
}

type RelationNormalization = {
	value: unknown;
	reference: string | number | null | undefined;
};

function normalizeRelationEntry(entry: unknown): RelationNormalization | null {
	if (entry === null || entry === undefined || entry === '') {
		return null;
	}

	if (Array.isArray(entry)) {
		return normalizeRelationEntry(entry[0]);
	}

	if (typeof entry === 'object') {
		const record = entry as Record<string, unknown>;
		const id = record.id;
		return {
			value: record,
			reference: typeof id === 'string' || typeof id === 'number' ? (id as string | number) : null,
		};
	}

	if (typeof entry === 'string' || typeof entry === 'number') {
		return {
			value: entry,
			reference: entry,
		};
	}

	return null;
}

// Infer cell type from data content when location/metadata is not available
export function inferCellTypeFromData(data: string): string | undefined {
	if (!data || typeof data !== 'string') return undefined;

	try {
		const parsed = JSON.parse(data);

		// Check for geometry data patterns (wrapped format with geojson property)
		if (parsed && typeof parsed === 'object' && parsed.geojson) {
			// This is the wrapped geometry format: {"geojson": {...}, "srid": ..., "x": ..., "y": ...}
			// But sometimes it might only have the geojson property
			if (parsed.geojson.type === 'Point') {
				return 'geometry-point';
			} else if (parsed.geojson.type === 'GeometryCollection') {
				return 'geometry-collection';
			} else {
				return 'geometry';
			}
		}

		// Check for raw GeoJSON (direct GeoJSON object)
		if (parsed && typeof parsed === 'object' && parsed.type && parsed.coordinates) {
			const validGeoJSONTypes = [
				'Point',
				'LineString',
				'Polygon',
				'MultiPoint',
				'MultiLineString',
				'MultiPolygon',
				'GeometryCollection',
			];
			if (validGeoJSONTypes.includes(parsed.type)) {
				if (parsed.type === 'Point') {
					return 'geometry-point';
				} else if (parsed.type === 'GeometryCollection') {
					return 'geometry-collection';
				} else {
					return 'geometry';
				}
			}
		}

		// Check for array data
		if (Array.isArray(parsed)) {
			return 'array';
		}

		// Check for interval data (objects with days/hours/minutes/seconds properties)
		if (
			parsed &&
			typeof parsed === 'object' &&
			(parsed.days !== undefined ||
				parsed.hours !== undefined ||
				parsed.minutes !== undefined ||
				parsed.seconds !== undefined)
		) {
			return 'interval';
		}

		// Check for image data (objects with url/src/href/path properties)
		if (parsed && typeof parsed === 'object' && (parsed.url || parsed.src || parsed.href || parsed.path)) {
			return 'image';
		}

		// Check for date strings (ISO format)
		if (typeof parsed === 'string' && /^\d{4}-\d{2}-\d{2}/.test(parsed)) {
			if (parsed.includes('T')) {
				return 'datetime';
			} else {
				return 'date';
			}
		}

		// Generic JSON object
		return 'json';
	} catch {
		// Not valid JSON, could be other data types

		// Check for date strings
		if (/^\d{4}-\d{2}-\d{2}/.test(data)) {
			if (data.includes('T')) {
				return 'datetime';
			} else {
				return 'date';
			}
		}

		// Check for time strings
		if (/^\d{2}:\d{2}/.test(data)) {
			return 'time';
		}

		return undefined;
	}
}

// Utility functions for array previews
export function formatArrayPreview(arr: any[]): string {
	const max = 3;
	const items = arr.slice(0, max).map((v) => (typeof v === 'object' ? compactJsonPreview(v, 20) : String(v)));
	const more = arr.length > max ? ` +${arr.length - max}` : '';
	return items.join(', ') + more;
}

// Geometry helper functions
export function isValidGeoJSON(obj: any): boolean {
	if (!obj || typeof obj !== 'object') return false;
	if (!obj.type || typeof obj.type !== 'string') return false;
	return true; // Simplified validation for display purposes
}

export function isValidGeometry(obj: any): boolean {
	if (!obj || typeof obj !== 'object') return false;
	if (!('geojson' in obj) || !('srid' in obj) || !('x' in obj) || !('y' in obj)) {
		return false;
	}
	return isValidGeoJSON(obj.geojson);
}

export function safeToFixed(value: number | undefined | null, decimals: number = 6): string {
	if (typeof value === 'number' && isFinite(value)) {
		return value.toFixed(decimals);
	}
	return 'N/A';
}

export function safeExecute<T>(fn: () => T, fallback: T, context: string): T {
	try {
		return fn();
	} catch (error) {
		console.warn(`Error in ${context}:`, error);
		return fallback;
	}
}

export function formatCoordinateDisplay(x: any, y: any, decimals: number = 6): string {
	const xStr = safeToFixed(x, decimals);
	const yStr = safeToFixed(y, decimals);
	return `${xStr}, ${yStr}`;
}

export function createSafeGeometryDisplay(geometry: any, icon: string = '🗺️'): string {
	try {
		if (!geometry || !geometry.geojson) return 'Invalid geometry';
		const type = geometry.geojson.type || 'Unknown';
		const srid = geometry.srid || 'Unknown';
		const coordinateDisplay = formatCoordinateDisplay(geometry.x, geometry.y, 4);
		return `${icon} ${type} (${coordinateDisplay}) SRID:${srid}`;
	} catch (error) {
		console.warn('Error creating geometry display:', error);
		return `${icon} Error displaying geometry`;
	}
}

export function formatGeometryPreview(val: any): string {
	if (val === null || val === undefined) return 'null';

	return safeExecute(
		() => {
			// Handle raw GeoJSON (most common from PostGIS)
			if (isValidGeoJSON(val)) {
				const type = val.type;
				const mapIcon = type === 'Point' ? '📍' : '🗺️';
				if (type === 'Point' && Array.isArray(val.coordinates)) {
					const [lng, lat] = val.coordinates;
					return `${mapIcon} ${type} (${safeToFixed(lat, 4)}, ${safeToFixed(lng, 4)})`;
				}
				return `${mapIcon} ${type}`;
			}

			// Handle wrapped geometry format
			if (isValidGeometry(val)) {
				const geom = val as any;
				const mapIcon = geom.geojson?.type === 'Point' ? '📍' : '🗺️';
				return createSafeGeometryDisplay(geom, mapIcon);
			}

			// Fallback to JSON preview
			const jsonString = typeof val === 'object' ? JSON.stringify(val) : String(val);
			if (jsonString.length <= 50) {
				return jsonString;
			}
			return jsonString.substring(0, 50) + '...';
		},
		String(val).substring(0, 50) + (String(val).length > 50 ? '...' : ''),
		'formatGeometryPreview',
	);
}

// Cell content generation utilities

/** Result from a cell edit operation */
export interface CellEditResult {
	/** Whether the edit was performed */
	success: boolean;
	/** The updated row data from the server (if available) */
	updatedRow?: Record<string, unknown> | null;
	/** The field that was patched */
	patchField?: string;
	/** The value that was sent */
	patchValue?: unknown;
}

// Type-safe cell editing utilities
export async function handleCellEdit(
	cell: Item,
	newValue: GridCell,
	data: any[],
	columnKeys: string[],
	fieldMetaMap: Map<string, any>,
	updateFunction: (id: string, data: any) => Promise<{ updatedRow?: Record<string, unknown> | null }>,
	onCellEdit?: (id: string, field: string, value: any) => void,
	relationInfoByField?: Map<string, RelationInfo>,
): Promise<CellEditResult> {
	const [col, row] = cell;
	const rowData = data[row];
	if (!rowData) return { success: false };
	const colKey = columnKeys[col];

	// Block edits to UUID primary key id
	const metaField = fieldMetaMap.get(colKey);
	if (colKey === 'id' && metaField?.type?.gqlType === 'UUID') {
		return { success: false };
	}

	const fieldMeta = fieldMetaMap.get(colKey);
	let value = extractCellValue(newValue, fieldMeta);

	const relationInfo = relationInfoByField?.get(colKey);
	if (relationInfo) {
		const patchFieldCandidate = relationInfo.foreignKeyField || colKey;
		const canEditRelationInline = relationInfo.kind === 'belongsTo' && fieldMetaMap.has(patchFieldCandidate);
		if (!canEditRelationInline) return { success: false };
	}

	if (relationInfo) {
		if (typeof value === 'string') {
			const trimmed = value.trim();
			if (trimmed === '') {
				value = null;
			} else {
				try {
					const parsed = JSON.parse(trimmed);
					value = parsed;
				} catch {
					value = trimmed;
				}
			}
		}

		if (Array.isArray(value)) {
			const mapped = value
				.map((entry) => (entry && typeof entry === 'object' ? ((entry as any).id ?? entry) : entry))
				.filter((entry) => entry !== undefined && entry !== null);
			value = relationInfo.kind === 'belongsTo' || relationInfo.kind === 'hasOne' ? (mapped[0] ?? null) : mapped;
		} else if (value && typeof value === 'object') {
			value = (value as any).id ?? null;
		}

		if (value === '') {
			value = null;
		}
	}
	if (value === undefined) return { success: false };

	const patchField = relationInfo?.foreignKeyField || colKey;

	const result = await updateFunction(rowData.id, { [patchField]: value });
	onCellEdit?.(rowData.id, patchField, value);

	return {
		success: true,
		updatedRow: result?.updatedRow ?? null,
		patchField,
		patchValue: value,
	};
}

// Helper function to extract value from typed cells
export function extractCellValue(cell: GridCell, fieldMeta?: FieldMetadata): any {
	if (isTextCell(cell)) {
		// For structured/non-scalar fields (arrays/json/interval/geometry),
		// parse JSON strings to objects for GraphQL mutations.
		try {
			const t = fieldMeta?.type;
			if (t) {
				const cellType = mapToFrontendCellType({
					gqlType: t.gqlType || '',
					isArray: !!t.isArray,
					pgAlias: t.pgAlias,
					pgType: t.pgType,
					subtype: t.subtype ?? null,
				});

				const isGeometry =
					cellType === 'geometry' || cellType === 'geometry-point' || cellType === 'geometry-collection';
				const shouldParse = isStructuredDataType(cellType) || isGeometry;

				if (shouldParse) {
					// @ts-expect-error data is arbitrary so we can ignore this TS error
					const raw = typeof cell.data === 'string' ? cell.data.trim() : cell.data;
					if (raw === '' || raw === undefined || raw === null) return null;
					if (typeof raw === 'string') {
						try {
							return JSON.parse(raw);
						} catch {
							// If parsing fails, fall back to raw to avoid data loss
							return raw;
						}
					}
					return raw;
				}
			}
		} catch {
			// fallthrough to default behavior
		}

		return cell.data;
	}

	if (isNumberCell(cell)) {
		return cell.data;
	}

	if (isBooleanCell(cell)) {
		return cell.data;
	}

	if (isImageCell(cell)) {
		return cell.data[0] || null;
	}

	if (isUriCell(cell)) {
		const uriData = cell.data || '';
		if (uriData.startsWith('mailto:')) {
			return uriData.substring(7); // Remove 'mailto:' prefix
		}
		return uriData;
	}

	if (isBubbleCell(cell)) {
		return transformBubbleData(cell.data || [], fieldMeta);
	}

	return undefined;
}

// Helper function to transform bubble data based on field type
function transformBubbleData(bubbleData: string[], fieldMeta?: FieldMetadata): any {
	if (!fieldMeta?.type) {
		return bubbleData;
	}

	const cellType = mapToFrontendCellType({
		gqlType: fieldMeta.type.gqlType || '',
		isArray: !!fieldMeta.type.isArray,
		pgAlias: fieldMeta.type.pgAlias,
		pgType: fieldMeta.type.pgType,
		subtype: fieldMeta.type.subtype ?? null,
	});

	switch (cellType) {
		case 'tsvector':
			return bubbleData.join(' ');
		case 'number-array':
			return bubbleData.map((item) => parseFloat(item)).filter((item) => !isNaN(item));
		case 'integer-array':
			return bubbleData.map((item) => parseInt(item, 10)).filter((item) => !isNaN(item));
		case 'date-array':
			return bubbleData.map((item) => new Date(item)).filter((item) => !isNaN(item.getTime()));
		default:
			return bubbleData;
	}
}

// Cell activation handler
export function handleCellActivation(cell: Item, columnKeys: string[]): void {
	console.log('🎯 Cell activated:', {
		cell,
		colIndex: cell[0],
		rowIndex: cell[1],
		colKey: columnKeys[cell[0]],
	});
	// Cell activation is handled by activationBehaviorOverride in getCellContent
	// Empty image cells have 'single-click' activation behavior
}

// Row operations
export async function handleRowAppend(
	createFunction: (data: any) => Promise<any>,
): Promise<'top' | 'bottom' | number | undefined> {
	const { createdRow } = await createFunction({});
	if (createdRow) {
		return 'bottom';
	}
	return undefined;
}

// Type-safe header click handler for sorting
// Only allows sorting on columns in the sortableColumns set (excludes relation columns)
export function createHeaderClickHandler(
	columnKeys: string[],
	toggleSorting: (colId: string) => void,
	sortableColumns?: Set<string>,
) {
	return (colIndex: number) => {
		const colId = columnKeys[colIndex];
		if (!colId) return;

		// If sortableColumns is provided, only allow sorting on those columns
		if (sortableColumns && !sortableColumns.has(colId)) {
			return;
		}

		toggleSorting(colId);
	};
}

// Type-safe column resize handler
export function createColumnResizeHandler(resizeColumn: (id: string, width: number) => void) {
	return (column: { id?: string }, newSize: number) => {
		if (column.id) {
			resizeColumn(column.id, newSize);
		}
	};
}
