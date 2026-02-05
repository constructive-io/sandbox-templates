'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
	addNodeToGrid,
	addNodeToRoot,
	createEmptySchema,
	createGridNode,
	createNodeFromField,
	findGridContainingField,
	findNode,
	getAllFieldIds,
	isGridNode,
	parseFromSmartTags,
	prepareForSmartTags,
	removeNode,
	removeNodeByFieldId,
	reorderChildren,
	replaceFieldId,
	updateNode,
	type UINode,
	type UISchema,
} from '@/lib/form-builder';
import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import { useUpdateTable } from '@/lib/gql/hooks/schema-builder/use-update-table';
import type { FieldDefinition } from '@/lib/schema';

function syncSchemaWithFields(schema: UISchema, fields: FieldDefinition[]): UISchema {
	const dbFieldIds = new Set(fields.map((f) => f.id));
	const schemaFieldIds = new Set(getAllFieldIds(schema.page));

	const toAdd = fields
		.filter((f) => !schemaFieldIds.has(f.id))
		.sort((a, b) => (a.fieldOrder ?? 0) - (b.fieldOrder ?? 0));

	const toRemove = [...schemaFieldIds].filter((id) => !dbFieldIds.has(id));

	if (toAdd.length === 0 && toRemove.length === 0) return schema;

	let newSchema = schema;

	for (const fieldId of toRemove) {
		newSchema = removeNodeByFieldId(newSchema, fieldId);
	}

	for (const field of toAdd) {
		newSchema = addNodeToRoot(newSchema, createNodeFromField(field));
	}

	return newSchema;
}

export interface UseFormSchemaResult {
	schema: UISchema;
	isLoading: boolean;
	isSaving: boolean;

	addField: (field: FieldDefinition, index?: number) => void;
	addFieldToGridColumn: (field: FieldDefinition, gridKey: string, columnIndex: number) => void;
	addGrid: (columns: 2 | 3 | 4, index?: number) => string;
	removeField: (fieldId: string) => void;
	removeGrid: (gridKey: string) => void;
	removeGridAndSave: (gridKey: string) => Promise<void>;
	isGridPersisted: (gridKey: string) => boolean;
	moveItem: (fromIndex: number, toIndex: number) => void;
	replaceFieldId: (oldFieldId: string, newFieldId: string) => void;
	updateNodeProps: (key: string, updates: Partial<UINode['props']>) => void;
	getNode: (key: string) => UINode | null;

	saveSchema: () => Promise<void>;
	getAllFieldIds: () => string[];
	findGridContainingField: (fieldId: string) => { gridKey: string; columnIndex: number; fieldIndex: number } | null;

	/** Suppress field sync (use during save to prevent race conditions) */
	suppressSync: () => void;
	/** Resume field sync after save completes */
	resumeSync: () => void;
}

export function useFormSchema(): UseFormSchemaResult {
	const [schema, setSchema] = useState<UISchema>(createEmptySchema);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);

	const { currentTable } = useSchemaBuilderSelectors();
	const updateTableMutation = useUpdateTable();
	const loadedForTableIdRef = useRef<string | null>(null);
	const schemaRef = useRef<UISchema>(schema);
	const lastSavedSchemaRef = useRef<UISchema>(schema);
	const currentTableRef = useRef(currentTable);
	currentTableRef.current = currentTable;

	// Suppress sync during save to prevent race condition where field is added to root
	// instead of staying in its grid position
	const syncSuppressedRef = useRef(false);

	const updateSchema = useCallback((updater: (prev: UISchema) => UISchema) => {
		const next = updater(schemaRef.current);
		schemaRef.current = next;
		setSchema(next);
	}, []);

	useEffect(() => {
		if (!currentTable) {
			setSchema(createEmptySchema());
			loadedForTableIdRef.current = null;
			setIsLoading(false);
			return;
		}

		if (loadedForTableIdRef.current !== currentTable.id) {
			loadedForTableIdRef.current = null;
		}

		if (loadedForTableIdRef.current === currentTable.id) {
			return;
		}

		setIsLoading(true);
		const smartTags = currentTable.smartTags as Record<string, unknown> | undefined;
		if (smartTags === undefined) {
			schemaRef.current = createEmptySchema(currentTable.id);
			setSchema(schemaRef.current);
			setIsLoading(false);
			return;
		}

		const loadedSchema = parseFromSmartTags(smartTags, currentTable.fields ?? [], currentTable.id);
		const hydratedSchema = syncSchemaWithFields(loadedSchema, currentTable.fields ?? []);

		loadedForTableIdRef.current = currentTable.id;
		schemaRef.current = hydratedSchema;
		lastSavedSchemaRef.current = hydratedSchema;
		setSchema(hydratedSchema);
		setIsLoading(false);
	}, [currentTable?.id, currentTable?.smartTags, currentTable?.fields]);

	useEffect(() => {
		if (!currentTable) return;
		if (isLoading) return;
		if (syncSuppressedRef.current) return;
		updateSchema((prev) => syncSchemaWithFields(prev, currentTable.fields ?? []));
	}, [currentTable?.id, currentTable?.fields, isLoading, updateSchema]);

	const addField = useCallback(
		(field: FieldDefinition, index?: number) => {
			updateSchema((prev) => addNodeToRoot(prev, createNodeFromField(field), index));
		},
		[updateSchema],
	);

	const addFieldToGridColumn = useCallback(
		(field: FieldDefinition, gridKey: string, columnIndex: number) => {
			updateSchema((prev) => addNodeToGrid(prev, gridKey, columnIndex, createNodeFromField(field)));
		},
		[updateSchema],
	);

	const addGrid = useCallback(
		(columns: 2 | 3 | 4, index?: number) => {
			const gridNode = createGridNode(columns);
			updateSchema((prev) => addNodeToRoot(prev, gridNode, index));
			return gridNode.key;
		},
		[updateSchema],
	);

	const removeFieldFn = useCallback(
		(fieldId: string) => {
			updateSchema((prev) => removeNodeByFieldId(prev, fieldId));
		},
		[updateSchema],
	);

	const removeGridFn = useCallback(
		(gridKey: string) => {
			updateSchema((prev) => removeNode(prev, gridKey));
		},
		[updateSchema],
	);

	const moveItem = useCallback(
		(fromIndex: number, toIndex: number) => {
			updateSchema((prev) => reorderChildren(prev, 'root', fromIndex, toIndex));
		},
		[updateSchema],
	);

	const replaceFieldIdFn = useCallback(
		(oldFieldId: string, newFieldId: string) => {
			updateSchema((prev) => replaceFieldId(prev, oldFieldId, newFieldId));
		},
		[updateSchema],
	);

	const updateNodeProps = useCallback(
		(key: string, updates: Partial<UINode['props']>) => {
			updateSchema((prev) => updateNode(prev, key, updates));
		},
		[updateSchema],
	);

	const getNode = useCallback(
		(key: string): UINode | null => {
			return findNode(schema.page, key);
		},
		[schema],
	);

	const saveSchema = useCallback(async () => {
		const table = currentTableRef.current;
		if (!table) return;

		setIsSaving(true);
		try {
			const existingSmartTags = table.smartTags as Record<string, unknown> | undefined;
			const newSmartTags = prepareForSmartTags(existingSmartTags, schemaRef.current);

			await updateTableMutation.mutateAsync({
				id: table.id,
				smartTags: newSmartTags,
			});
			lastSavedSchemaRef.current = schemaRef.current;
		} finally {
			setIsSaving(false);
		}
	}, [updateTableMutation]);

	const removeGridAndSave = useCallback(
		async (gridKey: string) => {
			const table = currentTableRef.current;
			if (!table) return;

			const nextSchema = removeNode(schemaRef.current, gridKey);

			setIsSaving(true);
			try {
				const existingSmartTags = table.smartTags as Record<string, unknown> | undefined;
				const newSmartTags = prepareForSmartTags(existingSmartTags, nextSchema);

				await updateTableMutation.mutateAsync({
					id: table.id,
					smartTags: newSmartTags,
				});

				schemaRef.current = nextSchema;
				lastSavedSchemaRef.current = nextSchema;
				setSchema(nextSchema);
			} finally {
				setIsSaving(false);
			}
		},
		[updateTableMutation],
	);

	const isGridPersisted = useCallback((gridKey: string) => {
		return lastSavedSchemaRef.current.page.children.some((child) => isGridNode(child) && child.key === gridKey);
	}, []);

	const getAllFieldIdsFn = useCallback(() => {
		return getAllFieldIds(schema.page);
	}, [schema]);

	const findGridContainingFieldFn = useCallback(
		(fieldId: string) => {
			return findGridContainingField(schema, fieldId);
		},
		[schema],
	);

	const suppressSync = useCallback(() => {
		syncSuppressedRef.current = true;
	}, []);

	const resumeSync = useCallback(() => {
		syncSuppressedRef.current = false;
	}, []);

	return {
		schema,
		isLoading,
		isSaving,
		addField,
		addFieldToGridColumn,
		addGrid,
		removeField: removeFieldFn,
		removeGrid: removeGridFn,
		removeGridAndSave,
		isGridPersisted,
		moveItem,
		replaceFieldId: replaceFieldIdFn,
		updateNodeProps,
		getNode,
		saveSchema,
		getAllFieldIds: getAllFieldIdsFn,
		findGridContainingField: findGridContainingFieldFn,
		suppressSync,
		resumeSync,
	};
}
