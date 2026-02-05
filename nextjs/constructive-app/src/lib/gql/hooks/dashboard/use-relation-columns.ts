/**
 * Build data grid columns that understand relation metadata
 */
import { useCallback, useMemo } from 'react';
import type { GridColumn } from '@glideapps/glide-data-grid';

import { isImageField, resolveCellType, type FieldMetadata } from '@/components/dashboard/data-grid/cell-type-resolver';
import { getCellTypeIcon, getColumnWidthByMeta } from '@/components/dashboard/data-grid/data-grid.utils';

import { useRelationMetadataCache, type RelationMetadata } from './use-relation-metadata-cache';

type RelationKind = 'belongsTo' | 'hasOne' | 'hasMany' | 'manyToMany';

/**
 * Relation-aware column info with simple error handling
 */
export interface RelationColumnInfo {
	columns: GridColumn[];
	columnKeys: string[];
	relationMetadata: Record<string, RelationMetadata>;
	metaFields?: { name: string; type: any }[];
	hasRelationErrors: boolean;
	relationCount: number;
	// Helper functions (backward compatible)
	isImageField: (fieldMeta: FieldMetadata | undefined, fieldName?: string) => boolean;
	findImageColumnKey: (columnKeys: string[], fieldMetaMap: Map<string, any>, currentColKey?: string) => string;
	getRelationKind: (fieldName: string) => RelationKind | null;
	isRelationField: (fieldName: string) => boolean;
	invalidateRelationCache: () => Promise<void>;
	// For backward compatibility
	relationTypeByField: Map<string, RelationKind>;
}

/**
 * Create data grid columns with relation metadata baked in
 */
export function useRelationColumns(tableName?: string, rows?: unknown[]): RelationColumnInfo {
	const { relationMetadata, tableRelations, cacheState, getRelationKind, isRelationField, invalidateRelationCache } =
		useRelationMetadataCache(tableName);

	const metaFields = useMemo(() => {
		return tableRelations?.fields as { name: string; type: any }[] | undefined;
	}, [tableRelations]);

	const baseFieldNames = useMemo(() => {
		if (rows && rows.length > 0) {
			const sample = rows[0] ?? {};
			return Object.keys(sample);
		}

		if (metaFields?.length) {
			const scalarNames = metaFields.map((field) => field?.name).filter((name): name is string => Boolean(name));
			const relationNames: string[] = [];
			relationMetadata.forEach((rel) => {
				if (rel.sourceField === 'relation') relationNames.push(rel.fieldName);
			});
			return Array.from(new Set([...scalarNames, ...relationNames]));
		}

		return [] as string[];
	}, [rows, metaFields, relationMetadata]);

	// Extract column keys from data
	const columnKeys: string[] = useMemo(() => {
		if (baseFieldNames.length === 0) return [];
		const keys = [...baseFieldNames];

		const belongsToForeignKeysToHide = new Set<string>();

		relationMetadata.forEach((rel) => {
			if (rel.sourceField !== 'relation' || rel.relationKind !== 'belongsTo' || !rel.relationFieldName) {
				return;
			}

			const foreignKeyEntries = relationMetadata.filter(
				(candidate) => candidate.sourceField === 'foreignKey' && candidate.relationFieldName === rel.relationFieldName,
			);

			if (foreignKeyEntries.length > 0) {
				foreignKeyEntries.forEach((entry) => {
					belongsToForeignKeysToHide.add(entry.fieldName);
				});
			}
		});

		const filteredKeys = keys.filter((key) => !belongsToForeignKeysToHide.has(key));

		// Ensure id comes first if present
		const idIdx = filteredKeys.indexOf('id');
		if (idIdx > -1) {
			filteredKeys.splice(idIdx, 1);
			filteredKeys.unshift('id');
		}
		return filteredKeys;
	}, [baseFieldNames, relationMetadata]);

	// Create relation metadata map for quick lookup
	const relationMetadataMap = useMemo(() => {
		const map: Record<string, RelationMetadata> = {};

		relationMetadata.forEach((rel) => {
			map[rel.fieldName] = rel;
		});

		return map;
	}, [relationMetadata]);

	// Table fields metadata
	// Generate columns with improved error handling
	const columns: GridColumn[] = useMemo(() => {
		return columnKeys.map((fieldName) => {
			const metaField = metaFields?.find((f) => f.name === fieldName);
			const relationInfo = relationMetadataMap[fieldName];
			const relationDisplayField = relationInfo?.relationFieldName || undefined;
			const isForeignKeyRelationField = relationInfo?.sourceField === 'foreignKey';

			// Use centralized cell type resolution
			const resolution = resolveCellType(fieldName, metaField);
			const cellType = resolution.cellType;

			// For relation fields, use relation kind as type label
			const typeLabel = relationInfo?.relationKind
				? relationInfo.relationKind
				: metaField
					? metaField.type?.pgAlias || metaField.type?.pgType || metaField.type?.gqlType
					: cellType;

			let headerName = fieldName;
			if (relationDisplayField) {
				headerName = relationDisplayField;
			} else if (isForeignKeyRelationField) {
				const stripped = fieldName.replace(/Id$/i, '');
				headerName = stripped.length > 0 ? stripped : fieldName;
			}

			const titleRaw = typeLabel ? `${headerName} (${typeLabel})` : headerName;

			return {
				id: fieldName,
				title: titleRaw,
				width: metaField ? getColumnWidthByMeta(metaField) : 150,
				icon: relationInfo ? getCellTypeIcon('relation') : getCellTypeIcon(cellType),
			} satisfies GridColumn;
		});
	}, [columnKeys, metaFields, relationMetadataMap]);

	// Helper function using centralized image field detection
	const checkIsImageField = useCallback((fieldMeta: FieldMetadata | undefined, fieldName?: string): boolean => {
		return isImageField(fieldMeta, fieldName);
	}, []);

	// Helper function to find the correct column key for image cells
	const findImageColumnKey = useCallback(
		(columnKeys: string[], fieldMetaMap: Map<string, any>, currentColKey?: string): string => {
			// If we already have a reliable column key, use it
			if (currentColKey && currentColKey !== 'id' && fieldMetaMap.has(currentColKey)) {
				const fieldMeta = fieldMetaMap.get(currentColKey);
				if (checkIsImageField(fieldMeta, currentColKey)) {
					return currentColKey;
				}
			}

			// Look through all columns to find image-type fields
			for (const key of columnKeys) {
				const fieldMeta = fieldMetaMap.get(key);
				if (fieldMeta && checkIsImageField(fieldMeta, key)) {
					return key;
				}
			}

			// Fallback to the current column key or first non-id column
			return currentColKey || columnKeys.find((k) => k !== 'id') || columnKeys[0] || '';
		},
		[checkIsImageField],
	);

	// Create backward compatibility map
	const relationTypeByField = useMemo(() => {
		const map = new Map<string, RelationKind>();
		Object.entries(relationMetadataMap).forEach(([fieldName, info]) => {
			map.set(fieldName, info.relationKind);
		});
		return map;
	}, [relationMetadataMap]);

	return {
		columns,
		columnKeys,
		relationMetadata: relationMetadataMap,
		metaFields,
		hasRelationErrors: cacheState.isError,
		relationCount: cacheState.relationCount,
		isImageField: checkIsImageField,
		findImageColumnKey,
		getRelationKind,
		isRelationField,
		invalidateRelationCache,
		relationTypeByField, // For backward compatibility
	};
}

/**
 * Drop-in replacement for the original useDataGridColumns hook
 * Maintains complete backward compatibility while providing improvements
 */
export function useDataGridColumns(tableName?: string, rows: unknown[] = []) {
	const enhanced = useRelationColumns(tableName, rows);

	// Return exact same interface as original for backward compatibility
	return {
		columns: enhanced.columns,
		columnKeys: enhanced.columnKeys,
		metaFields: enhanced.metaFields,
		isImageField: enhanced.isImageField,
		findImageColumnKey: enhanced.findImageColumnKey,
		relationTypeByField: enhanced.relationTypeByField,
		// Add new enhanced features for those who want them
		relationMetadata: enhanced.relationMetadata,
		hasRelationErrors: enhanced.hasRelationErrors,
		relationCount: enhanced.relationCount,
		getRelationKind: enhanced.getRelationKind,
		isRelationField: enhanced.isRelationField,
		invalidateRelationCache: enhanced.invalidateRelationCache,
	};
}
