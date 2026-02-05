'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@constructive-io/ui/button';
import { useCardStack } from '@constructive-io/ui/stack';
import { toast } from '@constructive-io/ui/toast';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';

import { isGridNode, nodeToFieldDefinition, updateNodeFromFieldDefinition, type UINode } from '@/lib/form-builder';
import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import { useCreateField, useDeleteField, useUpdateField } from '@/lib/gql/hooks/schema-builder/use-field-mutations';
import type { FieldDefinition } from '@/lib/schema';
import { getDefaultConstraintsForType } from '@/lib/schema';
import { CARD_WIDTHS } from '@/lib/stack/card-widths';
import { cn } from '@/lib/utils';

import { FieldConfigCard } from './field-config-card';
import { FormElementWrapper } from './form-element-wrapper';
import { FormMetadataSection } from './form-metadata-section';
import { LayoutContainer } from './layout-container';
import { FORM_BUILDER_DROPZONE_ID } from './use-form-builder-dnd';
import type { UseFormSchemaResult } from './use-form-schema';

type CanvasItem =
	| { type: 'field'; node: UINode; field: FieldDefinition; order: number }
	| { type: 'grid'; node: UINode; order: number };

interface FormBuilderCanvasProps {
	onAddFieldRef?: (addFieldFn: (field: FieldDefinition) => void) => void;
	onAddLayoutRef?: (addLayoutFn: (columns: 2 | 3 | 4) => void) => void;
	onAddFieldToLayoutRef?: (fn: (field: FieldDefinition, gridKey: string, columnIndex: number) => void) => void;
	onOpenPreview?: () => void;
	formSchema: UseFormSchemaResult;
}

export function FormBuilderCanvas({
	onAddFieldRef,
	onAddLayoutRef,
	onAddFieldToLayoutRef,
	onOpenPreview,
	formSchema,
}: FormBuilderCanvasProps) {
	const stack = useCardStack();

	const {
		schema,
		addField,
		addFieldToGridColumn,
		addGrid,
		removeField,
		removeGrid,
		removeGridAndSave,
		isGridPersisted,
		replaceFieldId: replaceFieldIdInSchema,
		updateNodeProps,
		saveSchema,
		findGridContainingField,
		suppressSync,
		resumeSync,
	} = formSchema;

	const [unsavedFieldIds, setUnsavedFieldIds] = useState<Set<string>>(new Set());
	const lastSavedStatesRef = useRef<Map<string, string>>(new Map());

	const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
	const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
	const [pendingSaveId, setPendingSaveId] = useState<string | null>(null);
	const [isDrawerSubmitting, setIsDrawerSubmitting] = useState(false);
	const drawerSubmittingClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const { setNodeRef: setDropZoneRef, isOver: isOverDropZone } = useDroppable({
		id: FORM_BUILDER_DROPZONE_ID,
	});

	const { currentTable, currentSchema, currentDatabase } = useSchemaBuilderSelectors();

	const tableId = currentTable?.id || '';
	const databaseId = currentDatabase?.databaseId ?? (currentSchema?.metadata?.databaseId || '');
	const tableName = currentTable?.name || '';

	const createFieldMutation = useCreateField();
	const updateFieldMutation = useUpdateField();
	const deleteFieldMutation = useDeleteField();

	const isSaving = createFieldMutation.isPending || updateFieldMutation.isPending;
	const isDeleting = deleteFieldMutation.isPending;

	// Sync isSaving/isDeleting to open field config card
	useEffect(() => {
		if (!selectedFieldId) return;
		const cardId = `field-config-${selectedFieldId}`;
		if (!stack.has(cardId)) return;
		stack.updateProps(cardId, { isSaving, isDeleting });
	}, [isSaving, isDeleting, selectedFieldId, stack]);

	const canvasItems = useMemo((): CanvasItem[] => {
		return schema.page.children
			.map((node, index): CanvasItem | null => {
				if (isGridNode(node)) {
					return { type: 'grid', node, order: index };
				}
				const fieldId = node.props.fieldId as string;
				if (fieldId && fieldId !== pendingSaveId) {
					return { type: 'field', node, field: nodeToFieldDefinition(node), order: index };
				}
				return null;
			})
			.filter((item): item is CanvasItem => item !== null);
	}, [schema, pendingSaveId]);

	const fieldsById = useMemo(() => {
		const map = new Map<string, FieldDefinition>();
		const collectFields = (nodes: UINode[]) => {
			for (const node of nodes) {
				if (node.props.fieldId) {
					map.set(node.props.fieldId as string, nodeToFieldDefinition(node));
				}
				collectFields(node.children);
			}
		};
		collectFields(schema.page.children);
		return map;
	}, [schema]);

	// Ref for accessing latest fieldsById in CardSpec.onClose callback
	const fieldsByIdRef = useRef(fieldsById);
	fieldsByIdRef.current = fieldsById;

	const hasFieldUnsavedChanges = useCallback(
		(fieldId: string): boolean => {
			return unsavedFieldIds.has(fieldId);
		},
		[unsavedFieldIds],
	);

	const selectedField = useMemo(() => {
		if (!selectedFieldId) return null;
		return fieldsById.get(selectedFieldId) || null;
	}, [selectedFieldId, fieldsById]);

	useEffect(() => {
		setUnsavedFieldIds(new Set());
		lastSavedStatesRef.current.clear();
		setSelectedFieldId(null);
	}, [currentTable?.id]);

	useEffect(() => {
		if (!isDrawerSubmitting) return;
		if (drawerSubmittingClearTimeoutRef.current) {
			clearTimeout(drawerSubmittingClearTimeoutRef.current);
		}
		drawerSubmittingClearTimeoutRef.current = setTimeout(() => {
			setIsDrawerSubmitting(false);
			drawerSubmittingClearTimeoutRef.current = null;
		}, 250);
	}, [isDrawerSubmitting]);

	const pendingAutoOpenRef = useRef<string | null>(null);
	const fieldRefs = useRef<Map<string, HTMLDivElement>>(new Map());
	const pendingGridScrollRef = useRef<string | null>(null);
	const gridRefs = useRef<Map<string, HTMLDivElement>>(new Map());

	useEffect(() => {
		if (pendingAutoOpenRef.current) {
			const fieldId = pendingAutoOpenRef.current;
			pendingAutoOpenRef.current = null;
			setSelectedFieldId(fieldId);

			setTimeout(() => {
				const field = fieldsById.get(fieldId);
				if (field) {
					openFieldConfigCard(field);
				}
			}, 50);

			setTimeout(() => {
				const fieldElement = fieldRefs.current.get(fieldId);
				if (fieldElement) {
					fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
				}
			}, 100);
		}
	}, [schema, fieldsById]);

	useEffect(() => {
		if (!pendingGridScrollRef.current) return;
		const gridKey = pendingGridScrollRef.current;
		const el = gridRefs.current.get(gridKey);
		if (!el) return;
		pendingGridScrollRef.current = null;
		el.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}, [schema]);

	const addFieldToCanvas = () => {
		if (!currentTable) return;

		const newFieldId = `temp-field-${Date.now()}`;
		const newField: FieldDefinition = {
			id: newFieldId,
			name: '',
			type: 'text',
			label: 'Text Field',
			description: '',
			constraints: { ...getDefaultConstraintsForType('text'), nullable: true },
		};

		lastSavedStatesRef.current.set(newFieldId, JSON.stringify(newField));
		pendingAutoOpenRef.current = newFieldId;
		addField(newField);
	};

	const addFieldFromParent = useCallback(
		(field: FieldDefinition) => {
			lastSavedStatesRef.current.set(field.id, JSON.stringify(field));
			pendingAutoOpenRef.current = field.id;
			addField(field);
		},
		[addField],
	);

	useEffect(() => {
		onAddFieldRef?.(addFieldFromParent);
	}, [onAddFieldRef, addFieldFromParent]);

	const addGridFromParent = useCallback(
		(columns: 2 | 3 | 4) => {
			const gridKey = addGrid(columns);
			pendingGridScrollRef.current = gridKey;
		},
		[addGrid],
	);

	useEffect(() => {
		onAddLayoutRef?.(addGridFromParent);
	}, [onAddLayoutRef, addGridFromParent]);

	const addFieldToGridFromParent = useCallback(
		(field: FieldDefinition, gridKey: string, columnIndex: number) => {
			lastSavedStatesRef.current.set(field.id, JSON.stringify(field));
			pendingAutoOpenRef.current = field.id;
			addFieldToGridColumn(field, gridKey, columnIndex);
		},
		[addFieldToGridColumn],
	);

	useEffect(() => {
		onAddFieldToLayoutRef?.(addFieldToGridFromParent);
	}, [onAddFieldToLayoutRef, addFieldToGridFromParent]);

	const handleDeleteGrid = useCallback(
		async (gridKey: string, fieldIds: string[]) => {
			if (fieldIds.length === 0) {
				if (!isGridPersisted(gridKey)) {
					removeGrid(gridKey);
					return;
				}
				await removeGridAndSave(gridKey);
				return;
			}

			try {
				for (const fieldId of fieldIds) {
					const isTempField = fieldId.startsWith('temp-field-');
					if (isTempField) {
						removeField(fieldId);
						continue;
					}

					try {
						await deleteFieldMutation.mutateAsync({ id: fieldId });
						removeField(fieldId);
					} catch (error) {
						const message = error instanceof Error ? error.message : String(error);
						if (message.includes('No values were deleted')) {
							removeField(fieldId);
							continue;
						}
						throw error;
					}
				}

				if (selectedFieldId && fieldIds.includes(selectedFieldId)) {
					setSelectedFieldId(null);
				}

				removeGrid(gridKey);
				await saveSchema();

				toast.success({ message: 'Layout deleted' });
			} catch (error) {
				toast.error({
					message: 'Failed to delete layout',
					description: error instanceof Error ? error.message : 'An error occurred',
				});
			}
		},
		[deleteFieldMutation, removeField, removeGrid, saveSchema, selectedFieldId, isGridPersisted, removeGridAndSave],
	);

	const handleFieldChange = (fieldId: string, updates: Partial<FieldDefinition>) => {
		const findAndUpdateNode = (nodes: UINode[]): UINode | null => {
			for (const node of nodes) {
				if (node.props.fieldId === fieldId) return node;
				const found = findAndUpdateNode(node.children);
				if (found) return found;
			}
			return null;
		};
		const node = findAndUpdateNode(schema.page.children);
		if (!node) return;

		const currentField = nodeToFieldDefinition(node);
		const updatedField = { ...currentField, ...updates };
		const updatedNode = updateNodeFromFieldDefinition(node, updatedField);
		updateNodeProps(node.key, updatedNode.props);
	};

	const handleSaveField = async (field: FieldDefinition) => {
		const fieldId = field.id;

		if (selectedFieldId === fieldId) {
			setIsDrawerSubmitting(true);
		}

		if (!field.name?.trim()) {
			toast.error({
				message: 'Field name required',
				description: 'Please enter a valid field name (e.g., email_address)',
			});
			return;
		}

		const fieldNameRegex = /^[a-z][a-z0-9_]*$/;
		if (!fieldNameRegex.test(field.name.trim())) {
			toast.error({
				message: 'Invalid field name',
				description: 'Field name must start with a letter and contain only lowercase letters, numbers, and underscores',
			});
			return;
		}

		const isTempField = fieldId.startsWith('temp-field-');
		const isInGridBeforeSave = findGridContainingField(fieldId);
		if (isInGridBeforeSave) {
			setPendingSaveId(fieldId);
		}

		// Suppress sync to prevent race condition where field is moved to root
		// after mutation completes but before replaceFieldId/saveSchema run
		suppressSync();

		try {
			if (isTempField) {
				const result = await createFieldMutation.mutateAsync({
					field,
					tableId,
					databaseId,
					tableName,
				});

				const createdFieldId = result?.id && result.id !== fieldId ? result.id : fieldId;

				setUnsavedFieldIds((prev) => {
					const next = new Set(prev);
					next.delete(fieldId);
					next.delete(createdFieldId);
					return next;
				});
				lastSavedStatesRef.current.delete(fieldId);

				toast.success({
					message: 'Element created',
					description: `Element "${field.label || field.name}" has been created`,
				});

				if (createdFieldId !== fieldId) {
					removeField(createdFieldId);
					replaceFieldIdInSchema(fieldId, createdFieldId);
				}
				setSelectedFieldId(createdFieldId);
				await saveSchema();
			} else {
				await updateFieldMutation.mutateAsync({
					id: fieldId,
					field,
					tableId,
					databaseId,
					tableName,
				});

				await saveSchema();

				lastSavedStatesRef.current.set(fieldId, JSON.stringify(field));
				setUnsavedFieldIds((prev) => {
					const next = new Set(prev);
					next.delete(fieldId);
					return next;
				});
				toast.success({
					message: 'Element updated',
					description: `Element "${field.label || field.name}" has been updated`,
				});
			}
		} catch (error) {
			setIsDrawerSubmitting(false);
			if (drawerSubmittingClearTimeoutRef.current) {
				clearTimeout(drawerSubmittingClearTimeoutRef.current);
				drawerSubmittingClearTimeoutRef.current = null;
			}
			toast.error({
				message: `Failed to ${isTempField ? 'create' : 'update'} element`,
				description: error instanceof Error ? error.message : 'An error occurred',
			});
			// Re-throw so caller knows save failed (e.g., to keep card open)
			throw error;
		} finally {
			setPendingSaveId(null);
			resumeSync();
		}
	};

	const handleSaveFieldById = async (fieldId: string) => {
		const field = fieldsById.get(fieldId);
		if (!field) return;
		await handleSaveField(field);
	};

	const handleDeleteField = async (fieldId: string) => {
		const isTempField = fieldId.startsWith('temp-field-');
		const field = fieldsById.get(fieldId);

		if (isTempField) {
			removeField(fieldId);
			if (selectedFieldId === fieldId) {
				setSelectedFieldId(null);
			}
			return;
		}

		try {
			setPendingDeleteId(fieldId);
			await deleteFieldMutation.mutateAsync({ id: fieldId });
			removeField(fieldId);
			toast.success({
				message: 'Element deleted',
				description: `Element "${field?.label || field?.name}" has been deleted`,
			});
			if (selectedFieldId === fieldId) {
				setSelectedFieldId(null);
			}
		} catch (error) {
			toast.error({
				message: 'Failed to delete element',
				description: error instanceof Error ? error.message : 'An error occurred',
			});
			throw error;
		} finally {
			setPendingDeleteId(null);
		}
	};

	const handleCopyField = (fieldId: string) => {
		const field = fieldsById.get(fieldId);
		if (!field) return;

		const newFieldId = `temp-field-${Date.now()}`;
		const copiedField: FieldDefinition = {
			...field,
			id: newFieldId,
			name: `${field.name}_copy`,
			label: `${field.label || ''} (Copy)`,
		};

		pendingAutoOpenRef.current = newFieldId;
		addField(copiedField);
	};

	const handleCloseCard = (options?: { skipUnsavedCheck?: boolean }) => {
		if (selectedFieldId && !options?.skipUnsavedCheck) {
			const field = fieldsById.get(selectedFieldId);
			if (field) {
				const isTempField = selectedFieldId.startsWith('temp-field-');

				if (isTempField) {
					setUnsavedFieldIds((prev) => new Set(prev).add(selectedFieldId));
				} else {
					const lastSavedJson = lastSavedStatesRef.current.get(selectedFieldId);
					const currentJson = JSON.stringify(field);
					if (lastSavedJson && currentJson !== lastSavedJson) {
						setUnsavedFieldIds((prev) => new Set(prev).add(selectedFieldId));
					}
				}
			}
		}
	};

	const openFieldConfigCard = (field: FieldDefinition) => {
		const isTempField = field.id.startsWith('temp-field-');
		const fieldId = field.id;

		// Store baseline state for unsaved detection (if not already tracked)
		if (!lastSavedStatesRef.current.has(fieldId)) {
			lastSavedStatesRef.current.set(fieldId, JSON.stringify(field));
		}

		stack.push({
			id: `field-config-${fieldId}`,
			title: isTempField ? 'Create New Element' : 'Edit Element',
			Component: FieldConfigCard,
			props: {
				field,
				onClose: handleCloseCard,
				onFieldChange: handleFieldChange,
				onSave: handleSaveField,
				onDelete: handleDeleteField,
				isSaving,
				isDeleting,
			},
			width: CARD_WIDTHS.medium,
			// Fire on any dismiss (overlay, swipe, escape, X button, etc.)
			onClose: () => {
				const currentField = fieldsByIdRef.current.get(fieldId);
				if (!currentField) return; // Field was deleted

				if (isTempField) {
					setUnsavedFieldIds((prev) => new Set(prev).add(fieldId));
				} else {
					const lastSavedJson = lastSavedStatesRef.current.get(fieldId);
					const currentJson = JSON.stringify(currentField);
					if (lastSavedJson && currentJson !== lastSavedJson) {
						setUnsavedFieldIds((prev) => new Set(prev).add(fieldId));
					}
				}
			},
		});
	};

	const handleSelectField = (fieldId: string) => {
		setSelectedFieldId(fieldId);
		const field = fieldsById.get(fieldId);
		if (field) {
			openFieldConfigCard(field);
		}
	};

	return (
		<div className='relative min-h-full min-w-full'>
			<div className='p-6 pb-12'>
				<FormMetadataSection onPreview={onOpenPreview} />

				<div
					ref={setDropZoneRef}
					className={cn(
						`relative mx-auto mt-7 w-full max-w-3xl overflow-auto rounded-lg border-2 border-transparent px-3
						transition-all`,
						isOverDropZone && 'border-primary/50',
					)}
				>
					{isOverDropZone && <div className='bg-primary/5 pointer-events-none absolute inset-0 z-10 rounded-lg' />}
					<div className='relative z-0 min-w-[600px] space-y-2 pt-3'>
						{canvasItems.map((item) => {
							if (item.type === 'field') {
								const fieldId = item.node.props.fieldId as string;
								return (
									<div
										key={item.node.key}
										ref={(el) => {
											if (el) {
												fieldRefs.current.set(fieldId, el);
											} else {
												fieldRefs.current.delete(fieldId);
											}
										}}
									>
										<FormElementWrapper
											node={item.node}
											isSelected={selectedFieldId === fieldId}
											hasUnsavedChanges={hasFieldUnsavedChanges(fieldId)}
											onSelect={() => handleSelectField(fieldId)}
											onEdit={() => handleSelectField(fieldId)}
											onCopy={() => handleCopyField(fieldId)}
											onDelete={() => handleDeleteField(fieldId)}
											onSave={() => handleSaveFieldById(fieldId)}
											isDeleting={pendingDeleteId === fieldId}
											isSaving={isSaving && selectedFieldId === fieldId}
										/>
									</div>
								);
							}
							return (
								<div
									key={item.node.key}
									ref={(el) => {
										if (el) {
											gridRefs.current.set(item.node.key, el);
										} else {
											gridRefs.current.delete(item.node.key);
										}
									}}
								>
									<LayoutContainer
										gridNode={item.node}
										selectedFieldId={selectedFieldId}
										onSelectField={handleSelectField}
										onEditField={handleSelectField}
										onCopyField={handleCopyField}
										onDeleteField={handleDeleteField}
										onSaveField={handleSaveFieldById}
										onDeleteGrid={handleDeleteGrid}
										hasFieldUnsavedChanges={hasFieldUnsavedChanges}
										pendingDeleteId={pendingDeleteId}
										isSaving={isSaving}
										fieldRefs={fieldRefs}
									/>
								</div>
							);
						})}
					</div>

					<div className='mt-6 flex items-center justify-center'>
						<Button variant='outline' size='sm' className='gap-2' onClick={addFieldToCanvas}>
							<Plus className='h-4 w-4' />
							Add Element
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
