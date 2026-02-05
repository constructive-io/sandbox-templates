import * as React from 'react';
import type { GridCell, Item, ProvideEditorCallbackResult } from '@glideapps/glide-data-grid';
import { GridCellKind } from '@glideapps/glide-data-grid';

import type { RelationInfo } from '@/store/data-grid-slice';

import type { FieldMetadata } from './cell-type-resolver';
import { ArrayEditor } from './editors/array-editor';
import { DateEditor } from './editors/date-editor';
import { GeometryEditor } from './editors/geometry-editor';
import { ImageEditor, type ImageSaveData } from './editors/image-editor';
import { InetEditor } from './editors/inet-editor';
import type { RelationSaveData } from './editors/relation-editor';
import { IntervalEditor } from './editors/interval-editor';
import { JsonEditor } from './editors/json-editor';
import { OverlayViewportGuard } from './editors/overlay-viewport-guard';
import { RelationEditor } from './editors/relation-editor';
import { TsvectorEditor } from './editors/tsvector-editor';
import type { TextCell } from './grid-cell-types';

export interface OverlayEditorProps {
	onFinishedEditing: (cell?: GridCell) => void;
}

/** Result of submitting a draft row */
export interface DraftSubmitResult {
	/** The created row with real database ID */
	createdRow: { id: string | number; [key: string]: unknown } | null;
}

/** Row data from the grid - contains column values indexed by field name */
export type GridRowData = Record<string, unknown> & {
	id?: string | number;
	__isDraft?: boolean;
	__draftRowId?: string;
};

export interface EditorFactoryProps {
	cell: GridCell;
	cellType: string;
	colKey: string;
	rowData: GridRowData;
	tableName: string;
	activeCellRef: React.RefObject<Item | null>;
	data: GridRowData[];
	columnKeys: string[];
	fieldMetaMap: Map<string, FieldMetadata>;
	relationInfoByField?: Map<string, RelationInfo>;
	/**
	 * Unified callback for overlay editors to trigger optimistic cache updates.
	 * Editors that handle mutations internally (e.g., RelationEditor, ImageEditor)
	 * should call this to update the grid cache without full refetch.
	 *
	 * @param colKey - The column key being edited
	 * @param rowIndex - The row index being edited
	 * @param patch - Key-value pairs to merge into the row data
	 */
	onEditorSaveComplete?: (colKey: string, rowIndex: number, patch: Record<string, unknown>) => void;
	/**
	 * Callback to submit a draft row and get the created row with real ID.
	 * Used by editors that need to perform mutations (like ImageEditor upload)
	 * which require a persisted row ID.
	 *
	 * @param draftRowId - The draft row ID (e.g., "draft:abc123")
	 * @returns Promise resolving to the created row or null if submission failed
	 */
	onSubmitDraftRow?: (draftRowId: string) => Promise<DraftSubmitResult>;
	/**
	 * Callback to invalidate/refresh grid data.
	 * Used after draft row + upload workflows complete to refresh the display.
	 */
	onInvalidateData?: () => void;
}

// Use the official Glide Data Grid editor result type
export type EditorFactory = (props: EditorFactoryProps) => ProvideEditorCallbackResult<GridCell>;

function resolveRowCol(
	activeCellRef: React.RefObject<Item | null>,
	cellLocation: [number, number] | undefined,
	dataLength: number,
	columnCount: number,
): [number, number] {
	const [fallbackCol, fallbackRow] = cellLocation || [0, 0];
	const [colIndex, rowIndex] = activeCellRef.current ?? [fallbackCol, fallbackRow];

	const safeDataLength = Math.max(dataLength, 1);
	const safeColumnCount = Math.max(columnCount, 1);
	const safeRowIndex = Math.min(Math.max(rowIndex ?? 0, 0), safeDataLength - 1);
	const safeColIndex = Math.min(Math.max(colIndex ?? 0, 0), safeColumnCount - 1);

	return [safeColIndex, safeRowIndex];
}

// Helper to wrap an editor component with Glide styling disabled
function wrapEditor(
	EditorComponent: React.FC<OverlayEditorProps>,
	styleOverride?: React.CSSProperties,
): ProvideEditorCallbackResult<GridCell> {
	const debugName = EditorComponent.displayName || EditorComponent.name || 'overlay-editor';
	const GuardedEditor = (p: any) => {
		return React.createElement(
			OverlayViewportGuard,
			{ debugName, target: p?.target, minBelowPx: 320 },
			React.createElement(EditorComponent, p),
		);
	};
	GuardedEditor.displayName = `Guarded(${debugName})`;

	return {
		editor: GuardedEditor as any,
		disablePadding: true,
		disableStyling: true,
		styleOverride,
	} as ProvideEditorCallbackResult<GridCell>;
}

// Image editor factory
function createImageEditorFactory(props: EditorFactoryProps): ProvideEditorCallbackResult<GridCell> {
	const { cell, colKey, tableName, activeCellRef, data, columnKeys, fieldMetaMap, onEditorSaveComplete, onSubmitDraftRow, onInvalidateData } = props;
	const cellLocation = (cell as any).location as [number, number] | undefined;

	const ImageEditorDef = ({ onFinishedEditing }: OverlayEditorProps) => {
		const [safeColIndex, safeRowIndex] = resolveRowCol(activeCellRef, cellLocation, data.length, columnKeys.length);
		const rowData = data[safeRowIndex];
		const recordId = rowData?.id;

		// Detect if this is a draft row (has temp ID like "draft:abc123")
		const isDraftRow = typeof recordId === 'string' && recordId.startsWith('draft:');
		const draftRowId = isDraftRow ? recordId : undefined;

		let finalColKey = colKey;
		if (finalColKey === 'id' || !finalColKey || cell.kind === GridCellKind.Image) {
			for (const key of columnKeys) {
				const fieldMeta = fieldMetaMap.get(key);
				if (fieldMeta) {
					const isImageByType =
						fieldMeta.type?.gqlType === 'JSON' &&
						(key.toLowerCase().includes('image') ||
							key.toLowerCase().includes('picture') ||
							key.toLowerCase().includes('photo') ||
							key.toLowerCase().includes('avatar'));

					if (isImageByType) {
						finalColKey = key;
						break;
					}
				}
			}
		}

		// Wrap callback to include cell context for optimistic updates
		const wrappedOnSaveComplete = onEditorSaveComplete
			? (saveData: ImageSaveData) => onEditorSaveComplete(finalColKey, safeRowIndex, { [finalColKey]: saveData.imageData })
			: undefined;

		// Wrap draft submission to return result
		const wrappedOnSubmitDraft = isDraftRow && onSubmitDraftRow && draftRowId
			? () => onSubmitDraftRow(draftRowId)
			: undefined;

		return React.createElement(ImageEditor, {
			value: cell,
			onFinishedEditing,
			tableName,
			fieldName: finalColKey,
			recordId,
			onSaveComplete: wrappedOnSaveComplete,
			// Draft row handling props
			isDraftRow,
			onSubmitDraft: wrappedOnSubmitDraft,
			onDraftUploadComplete: onInvalidateData,
		});
	};

	ImageEditorDef.displayName = 'ImageEditorWrapper';
	return wrapEditor(ImageEditorDef);
}

// Simple editor factories
function createDateEditorFactory(props: EditorFactoryProps): ProvideEditorCallbackResult<GridCell> {
	const { cell } = props;
	const DateEditorDef = ({ onFinishedEditing }: OverlayEditorProps) =>
		React.createElement(DateEditor, { value: cell, onFinishedEditing });

	DateEditorDef.displayName = 'DateEditorWrapper';
	return wrapEditor(DateEditorDef);
}

function createGeometryEditorFactory(props: EditorFactoryProps): ProvideEditorCallbackResult<GridCell> {
	const { cell } = props;

	const GeometryEditorDef = ({ onFinishedEditing }: OverlayEditorProps) => {
		let editorCell = cell;
		if (cell.kind === GridCellKind.Custom && (cell.data as any).kind === 'geometry-cell') {
			const geometryData = (cell.data as any).value;
			const jsonData = typeof geometryData === 'object' ? JSON.stringify(geometryData) : String(geometryData);
			editorCell = {
				kind: GridCellKind.Text,
				data: jsonData,
				displayData: jsonData,
				allowOverlay: true,
			} as TextCell;
		}
		return React.createElement(GeometryEditor, { value: editorCell, onFinishedEditing });
	};

	GeometryEditorDef.displayName = 'GeometryEditorWrapper';

	return wrapEditor(GeometryEditorDef, {
		minWidth: 600,
		maxWidth: '90vw',
		width: 'auto',
	});
}

function createIntervalEditorFactory(props: EditorFactoryProps): ProvideEditorCallbackResult<GridCell> {
	const { cell } = props;
	const IntervalEditorDef = ({ onFinishedEditing }: OverlayEditorProps) =>
		React.createElement(IntervalEditor, { value: cell, onFinishedEditing });

	IntervalEditorDef.displayName = 'IntervalEditorWrapper';
	return wrapEditor(IntervalEditorDef);
}

function createRelationEditorFactory(props: EditorFactoryProps): ProvideEditorCallbackResult<GridCell> {
	const { cell, colKey, tableName, activeCellRef, data, columnKeys, relationInfoByField, onEditorSaveComplete } = props;
	const cellLocation = (cell as any).location as [number, number] | undefined;

	const RelationEditorDef = ({ onFinishedEditing }: OverlayEditorProps) => {
		const [safeColIndex, safeRowIndex] = resolveRowCol(activeCellRef, cellLocation, data.length, columnKeys.length);
		const resolvedColKey = colKey || columnKeys[safeColIndex] || '';
		const rowData = data[safeRowIndex] ?? {};
		const relationInfo = relationInfoByField?.get(resolvedColKey);
		const relationFieldKey = relationInfo?.relationField;
		const relatedValue = relationFieldKey ? rowData?.[relationFieldKey] : undefined;
		const currentRaw = relatedValue ?? rowData?.[resolvedColKey];

		// Wrap callback to convert RelationSaveData to patch for optimistic updates
		const wrappedOnSaveComplete = onEditorSaveComplete
			? (saveData: RelationSaveData) => {
					const patch: Record<string, unknown> = {};
					// For belongsTo: update both FK field and relation display field
					if (relationInfo?.kind === 'belongsTo' && relationInfo.foreignKeyField) {
						patch[relationInfo.foreignKeyField] = saveData.foreignKeyValue;
					}
					// Update the relation display field
					const displayField = relationInfo?.relationField || resolvedColKey;
					patch[displayField] = saveData.relationData;
					onEditorSaveComplete(resolvedColKey, safeRowIndex, patch);
				}
			: undefined;

		return React.createElement(RelationEditor, {
			value: cell,
			onFinishedEditing,
			tableName,
			recordId: rowData?.id,
			fieldName: resolvedColKey,
			currentValue: currentRaw,
			onSaveComplete: wrappedOnSaveComplete,
		});
	};

	RelationEditorDef.displayName = 'RelationEditorWrapper';
	return wrapEditor(RelationEditorDef);
}

function createTsvectorEditorFactory(props: EditorFactoryProps): ProvideEditorCallbackResult<GridCell> {
	const { cell, colKey, activeCellRef, data, columnKeys } = props;
	const cellLocation = (cell as any).location as [number, number] | undefined;

	const TsvectorEditorDef = ({ onFinishedEditing }: OverlayEditorProps) => {
		const [, safeRowIndex] = resolveRowCol(activeCellRef, cellLocation, data.length, columnKeys.length);
		const raw = data[safeRowIndex]?.[colKey] ?? '';

		const editorCell: TextCell = {
			kind: GridCellKind.Text,
			data: typeof raw === 'string' ? raw : String(raw ?? ''),
			displayData: typeof raw === 'string' ? raw : String(raw ?? ''),
			allowOverlay: true,
		};

		return React.createElement(TsvectorEditor, { value: editorCell, onFinishedEditing });
	};

	TsvectorEditorDef.displayName = 'TsvectorEditorWrapper';
	return wrapEditor(TsvectorEditorDef);
}

function createInetEditorFactory(props: EditorFactoryProps): ProvideEditorCallbackResult<GridCell> {
	const { cell } = props;
	const InetEditorDef = ({ onFinishedEditing }: OverlayEditorProps) =>
		React.createElement(InetEditor, { value: cell, onFinishedEditing });

	InetEditorDef.displayName = 'InetEditorWrapper';
	return wrapEditor(InetEditorDef);
}

function createArrayEditorFactory(props: EditorFactoryProps): ProvideEditorCallbackResult<GridCell> {
	const { cell, colKey, activeCellRef, data, columnKeys } = props;
	const cellLocation = (cell as any).location as [number, number] | undefined;

	const ArrayEditorDef = ({ onFinishedEditing }: OverlayEditorProps) => {
		const [, safeRowIndex] = resolveRowCol(activeCellRef, cellLocation, data.length, columnKeys.length);
		const rowData = data[safeRowIndex] ?? {};
		const raw = colKey ? rowData?.[colKey] : undefined;

		const initialValue: unknown[] = Array.isArray(raw)
			? raw
			: cell.kind === GridCellKind.Bubble
				? (((cell as any).data as unknown[]) ?? [])
				: [];

		return React.createElement(ArrayEditor, {
			value: initialValue,
			onChange: () => {},
			onFinished: (next) => {
				if (next === undefined) {
					onFinishedEditing(undefined);
					return;
				}
				const serialized = JSON.stringify(next);
				const nextCell: TextCell = {
					kind: GridCellKind.Text,
					data: serialized,
					displayData: serialized,
					allowOverlay: true,
				};
				onFinishedEditing(nextCell);
			},
		});
	};

	ArrayEditorDef.displayName = 'ArrayEditorWrapper';
	return wrapEditor(ArrayEditorDef);
}

function createJsonEditorFactory(props: EditorFactoryProps): ProvideEditorCallbackResult<GridCell> {
	const { cell, colKey, activeCellRef, data, columnKeys } = props;
	const cellLocation = (cell as any).location as [number, number] | undefined;

	const JsonEditorDef = ({ onFinishedEditing }: OverlayEditorProps) => {
		const [, safeRowIndex] = resolveRowCol(activeCellRef, cellLocation, data.length, columnKeys.length);
		const rowData = data[safeRowIndex] ?? {};
		const raw = colKey ? rowData?.[colKey] : undefined;

		let initialValue: unknown = raw;
		if (initialValue === undefined && cell.kind === GridCellKind.Text && typeof (cell as any).data === 'string') {
			const asString = (cell as any).data as string;
			if (asString.trim() !== '') {
				try {
					initialValue = JSON.parse(asString);
				} catch {
					initialValue = asString;
				}
			}
		}

		return React.createElement(JsonEditor, {
			value: initialValue ?? null,
			onChange: () => {},
			onFinished: (next) => {
				if (next === undefined) {
					onFinishedEditing(undefined);
					return;
				}
				const serialized = JSON.stringify(next);
				const nextCell: TextCell = {
					kind: GridCellKind.Text,
					data: serialized,
					displayData: serialized,
					allowOverlay: true,
				};
				onFinishedEditing(nextCell);
			},
		});
	};

	JsonEditorDef.displayName = 'JsonEditorWrapper';
	return wrapEditor(JsonEditorDef);
}

// Fallback editor factory - returns undefined to let Glide's built-in editor handle it
// NOTE: Cell type is determined from schema metadata, NOT from runtime values.
// The previous JSON.parse heuristic caused text columns to show JSON editor for numeric strings.
function createFallbackEditorFactory(_props: EditorFactoryProps): ProvideEditorCallbackResult<GridCell> {
	// Return undefined to use Glide's built-in text editor
	return undefined;
}

const EDITOR_REGISTRY: Record<string, EditorFactory> = {
	// Text types - return undefined to use Glide's built-in text editor
	text: () => undefined,
	varchar: () => undefined,
	// Image/upload types
	image: createImageEditorFactory,
	upload: createImageEditorFactory, // upload should also use the image editor
	// Date/time types
	date: createDateEditorFactory,
	datetime: createDateEditorFactory,
	timestamptz: createDateEditorFactory,
	time: createDateEditorFactory,
	// Geometry types
	geometry: createGeometryEditorFactory,
	'geometry-point': createGeometryEditorFactory,
	'geometry-collection': createGeometryEditorFactory,
	// Other complex types
	interval: createIntervalEditorFactory,
	relation: createRelationEditorFactory,
	tsvector: createTsvectorEditorFactory,
	inet: createInetEditorFactory,
	// Array types
	array: createArrayEditorFactory,
	'text-array': createArrayEditorFactory,
	'uuid-array': createArrayEditorFactory,
	'number-array': createArrayEditorFactory,
	'integer-array': createArrayEditorFactory,
	'date-array': createArrayEditorFactory,
	tags: createArrayEditorFactory,
	// JSON types
	json: createJsonEditorFactory,
	jsonb: createJsonEditorFactory,
};

export function createEditor(props: EditorFactoryProps): ProvideEditorCallbackResult<GridCell> {
	const factory = EDITOR_REGISTRY[props.cellType];
	if (factory) {
		const result = factory(props);
		if (result !== undefined) return result;
	}

	return createFallbackEditorFactory(props);
}
