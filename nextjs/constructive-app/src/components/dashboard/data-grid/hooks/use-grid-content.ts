import { useCallback, useEffect } from 'react';
import type { GridCell, Item } from '@glideapps/glide-data-grid';
import { GridCellKind } from '@glideapps/glide-data-grid';

import { useMeta } from '@/lib/gql/hooks/dashboard/use-dashboard-meta-query';
import { useAppStore, useShallow } from '@/store/app-store';
import type { RelationInfo } from '@/store/data-grid-slice';

import { createCellContent } from '../cell-content-factory';
import { resolveCellType } from '../cell-type-resolver';
import type { FieldMetadata } from '../cell-type-resolver';
import { unwrapRelationValue } from '../data-grid.utils';
import type { CellCreationMetadata } from '../grid-cell-types';

interface RelationOptions {
	relationChipLimit?: number;
	relationLabelMaxLength?: number;
}

const EMPTY_RELATION_INFO_BY_FIELD = new Map<string, RelationInfo>();

const DRAFT_DISABLED_THEME_OVERRIDE = {
	textDark: '#9CA3AF',
	textMedium: '#9CA3AF',
	textLight: '#9CA3AF',
	bgCell: '#F9FAFB',
} satisfies NonNullable<GridCell['themeOverride']>;

function applyDraftDisabledStyle(cell: GridCell): GridCell {
	return {
		...cell,
		allowOverlay: false,
		style: 'faded',
		cursor: 'not-allowed',
		themeOverride: {
			...(cell.themeOverride ?? {}),
			...DRAFT_DISABLED_THEME_OVERRIDE,
		},
	} as GridCell;
}

export function useGridContent(
	data: unknown[],
	columnKeys: string[],
	fieldMetaMap: Map<string, unknown>,
	createGeometryCell: (value: unknown) => GridCell,
	tableName?: string,
	options?: RelationOptions,
) {
	const { data: meta } = useMeta();

	const { ensureRelationInfo, relationInfoByFieldFromStore } = useAppStore(
		useShallow((s) => ({
			ensureRelationInfo: s.ensureRelationInfo,
			relationInfoByFieldFromStore: tableName ? s.relationInfoMapCache[tableName] : undefined,
		})),
	);

	const relationInfoByField = relationInfoByFieldFromStore ?? EMPTY_RELATION_INFO_BY_FIELD;

	useEffect(() => {
		if (!tableName) return;
		ensureRelationInfo(tableName, meta);
	}, [tableName, meta, ensureRelationInfo]);

	const getCellContent = useCallback(
		(cell: Item): GridCell => {
			const [col, row] = cell;
			const rowData = (data as any[])[row] ?? {};
			const colKey = columnKeys[col];
			if (!colKey) {
				return {
					kind: GridCellKind.Text,
					data: '',
					displayData: '',
					allowOverlay: true,
				};
			}
			const rawValue = rowData?.[colKey];
			const isDraftRow = Boolean((rowData as any)?.__isDraft);
			const isDraftIdCell = isDraftRow && colKey === 'id';

			const baseFieldMeta = fieldMetaMap.get(colKey) as FieldMetadata | undefined;
			const relationInfo = relationInfoByField.get(colKey);
			const fieldMeta:
				| FieldMetadata
				| (FieldMetadata & { __relationInfo: RelationInfo; __relationOptions: RelationOptions })
				| undefined = relationInfo
				? ({
						...(baseFieldMeta || ({} as FieldMetadata)),
						__relationInfo: relationInfo,
						__relationOptions: options || {},
					} as any)
				: baseFieldMeta;
			// Cell type is determined from schema metadata only, not runtime values
			const resolution = resolveCellType(colKey, fieldMeta);

			const isRelation = !!relationInfo;
			const foreignKeyField = relationInfo?.foreignKeyField;
			const canEditRelationInline =
				relationInfo?.kind === 'belongsTo' &&
				typeof foreignKeyField === 'string' &&
				fieldMetaMap.has(foreignKeyField);
			let valueForCell = rawValue;

			if (relationInfo && relationInfo.relationField && relationInfo.relationField !== colKey) {
				const relatedValue = (rowData as any)?.[relationInfo.relationField];
				if (relatedValue !== undefined && relatedValue !== null) {
					valueForCell = relatedValue;
				} else if (typeof rawValue === 'string' && rawValue) {
					valueForCell = { id: rawValue };
				}
			} else if (relationInfo && valueForCell == null) {
				const fkField = relationInfo.foreignKeyField;
				const fkValue = fkField ? (rowData as any)?.[fkField] : undefined;
				if (fkValue) {
					valueForCell = { id: fkValue };
				}
			}

			if (relationInfo) {
				valueForCell = unwrapRelationValue(valueForCell);
			}

			const metadata: CellCreationMetadata = {
				cellType: isRelation ? 'relation' : resolution.cellType,
				fieldName: colKey,
				fieldMeta,
				// Relations can show an overlay editor (editing remains guarded elsewhere).
				canEdit: isDraftIdCell ? false : isRelation ? canEditRelationInline : resolution.canEdit,
				isReadonly: isDraftIdCell ? true : isRelation ? !canEditRelationInline : resolution.isReadonly,
				activationBehavior: resolution.activationBehavior,
			};

			const cellContent = createCellContent(valueForCell, metadata, createGeometryCell);

			if (isDraftIdCell) return applyDraftDisabledStyle(cellContent);

			const isServerTimestamp = isDraftRow && (colKey === 'createdAt' || colKey === 'updatedAt');
			if (isServerTimestamp) return applyDraftDisabledStyle(cellContent);

			return cellContent;
		},
		[data, columnKeys, fieldMetaMap, createGeometryCell, relationInfoByField, options],
	);

	return {
		getCellContent,
		relationInfoByField,
	};
}
