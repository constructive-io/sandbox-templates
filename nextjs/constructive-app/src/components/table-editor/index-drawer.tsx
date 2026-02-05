'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import { useCreateIndex, useUpdateIndex } from '@/lib/gql/hooks/schema-builder/use-index-mutations';
import { Button } from '@constructive-io/ui/button';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@constructive-io/ui/drawer';
import { Input } from '@constructive-io/ui/input';
import { Label } from '@constructive-io/ui/label';
import { MultiSelect } from '@constructive-io/ui/multi-select';
import { ResponsiveDiagram } from '@constructive-io/ui/responsive-diagram';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@constructive-io/ui/select';
import { Switch } from '@constructive-io/ui/switch';
import { toast } from '@constructive-io/ui/toast';

import type { IndexDefinition, IndexType } from '@/lib/schema';
import { INDEX_TYPE_LABELS } from '@/lib/schema';
import { IndexDiagram } from './index-diagram';

const FIELD_SUMMARY_LIMIT = 4;

const indexTypeOptions = (Object.keys(INDEX_TYPE_LABELS) as IndexType[]).map((value) => ({
	value,
	label: value === 'btree' ? `${INDEX_TYPE_LABELS[value]} (default)` : INDEX_TYPE_LABELS[value],
}));

function normalizeIndexType(type: string | undefined | null): IndexType {
	const raw = type?.toLowerCase() as IndexType | undefined;
	return raw && raw in INDEX_TYPE_LABELS ? raw : 'btree';
}

function generateIndexName(tableName: string, existingIndexes: IndexDefinition[]): string {
	let counter = 1;
	let candidateName = `${tableName}_index_${counter}`;

	while (existingIndexes.some((idx) => idx.name === candidateName)) {
		counter++;
		candidateName = `${tableName}_index_${counter}`;
	}

	return candidateName;
}

interface IndexDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editingIndex: IndexDefinition | null;
}

export function IndexDrawer({ open, onOpenChange, editingIndex: initialEditingIndex }: IndexDrawerProps) {
	const { currentTable } = useSchemaBuilderSelectors();

	const createIndexMutation = useCreateIndex();
	const updateIndexMutation = useUpdateIndex();

	const [editingIndex, setEditingIndex] = useState<IndexDefinition | null>(null);
	const [originalIndex, setOriginalIndex] = useState<IndexDefinition | null>(null);

	const indexes = currentTable?.indexes || [];

	const fieldOptions = useMemo(
		() =>
			currentTable?.fields.map((field) => ({
				label: field.name,
				value: field.id,
			})) || [],
		[currentTable?.fields],
	);

	const fieldNameMap = useMemo(() => {
		const map: Record<string, string> = {};
		currentTable?.fields.forEach((field) => {
			map[field.id] = field.name;
		});
		return map;
	}, [currentTable?.fields]);

	useEffect(() => {
		if (open && initialEditingIndex) {
			const indexCopy = {
				...initialEditingIndex,
				fields: [...initialEditingIndex.fields],
				type: normalizeIndexType(initialEditingIndex.type),
			};
			setEditingIndex(indexCopy);
			setOriginalIndex(indexCopy);
		} else if (open && currentTable) {
			const generatedName = generateIndexName(currentTable.name, indexes);
			const newIndex: IndexDefinition = {
				id: `idx-${Date.now()}`,
				name: generatedName,
				fields: [],
				unique: false,
				type: 'btree',
			};
			setEditingIndex(newIndex);
			setOriginalIndex(null);
		} else if (!open) {
			setEditingIndex(null);
			setOriginalIndex(null);
		}
	}, [open, initialEditingIndex, currentTable, indexes]);

	const handleSaveIndex = async () => {
		if (!editingIndex || editingIndex.fields.length === 0 || !currentTable) return;

		const trimmedName = editingIndex.name?.trim() ?? '';
		if (!trimmedName) return;

		const isExisting = indexes.some((index) => index.id === editingIndex.id);

		try {
			if (isExisting) {
				await updateIndexMutation.mutateAsync({
					id: editingIndex.id,
					name: trimmedName,
					fieldIds: editingIndex.fields,
					isUnique: editingIndex.type === 'btree' ? editingIndex.unique : false,
					accessMethod: editingIndex.type,
				});
				toast.success({
					message: 'Index updated',
					description: `Index "${trimmedName}" has been updated`,
				});
			} else {
				await createIndexMutation.mutateAsync({
					tableId: currentTable.id,
					name: trimmedName,
					fieldIds: editingIndex.fields,
					isUnique: editingIndex.type === 'btree' ? editingIndex.unique : false,
					accessMethod: editingIndex.type,
				});
				toast.success({
					message: 'Index created',
					description: `Index "${trimmedName}" has been created`,
				});
			}
			onOpenChange(false);
		} catch (error) {
			toast.error({
				message: isExisting ? 'Failed to update index' : 'Failed to create index',
				description: error instanceof Error ? error.message : 'An error occurred',
			});
		}
	};

	if (!currentTable) return null;

	const isEditMode = initialEditingIndex !== null;
	const selectedIndexType = editingIndex?.type ?? 'btree';
	const selectedFieldNames = editingIndex?.fields.map((id) => fieldNameMap[id] || id) || [];

	const hasChanges = originalIndex === null || JSON.stringify(editingIndex) !== JSON.stringify(originalIndex);
	const canSave =
		editingIndex && editingIndex.fields.length > 0 && (editingIndex.name?.trim().length ?? 0) > 0 && hasChanges;

	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction='right'>
			<DrawerContent className='h-full w-full max-w-xl overflow-hidden'>
				<DrawerHeader className='border-b px-6'>
					<DrawerTitle>{isEditMode ? 'Edit Index' : 'Create New Index'}</DrawerTitle>
					<DrawerDescription>
						{isEditMode
							? 'Update the configuration for your database index.'
							: 'Configure a new index to optimize query performance.'}
					</DrawerDescription>
				</DrawerHeader>

				<div className='scrollbar-neutral-thin min-h-0 flex-1 overflow-y-auto'>
					<div className='space-y-6 p-6'>
						{/* Diagram Section */}
						<ResponsiveDiagram className='py-8'>
							<IndexDiagram
								tableName={currentTable.name}
								indexName={editingIndex?.name}
								fields={selectedFieldNames}
								indexType={selectedIndexType}
								isUnique={editingIndex?.unique ?? false}
							/>
						</ResponsiveDiagram>

						{/* Form Section */}
						{editingIndex && (
							<div className='space-y-4'>
								<div className='space-y-2'>
									<Label className='block' htmlFor='index-name'>
										Index name
									</Label>
									<Input
										id='index-name'
										value={editingIndex.name}
										onChange={(event) => setEditingIndex({ ...editingIndex, name: event.target.value })}
										placeholder='e.g. table_index_1'
									/>
								</div>

								<div className='space-y-2'>
									<Label className='block'>Fields</Label>
									<MultiSelect
										options={fieldOptions}
										defaultValue={editingIndex.fields}
										onValueChange={(values) => setEditingIndex({ ...editingIndex, fields: values })}
										placeholder='Select fields'
										dropdownMaxHeight='300px'
										maxCount={FIELD_SUMMARY_LIMIT}
									/>
								</div>

								<div className='space-y-2'>
									<Label className='block'>Index type</Label>
									<Select
										value={selectedIndexType}
										onValueChange={(value) =>
											setEditingIndex({
												...editingIndex,
												type: value as IndexType,
												unique: value === 'btree' ? editingIndex.unique : false,
											})
										}
									>
										<SelectTrigger>
											<SelectValue placeholder='Select index type' />
										</SelectTrigger>
										<SelectContent>
											{indexTypeOptions.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								{selectedIndexType === 'btree' && (
									<div className='flex items-center justify-between'>
										<Label htmlFor='index-unique'>Unique</Label>
										<Switch
											id='index-unique'
											checked={editingIndex.unique ?? false}
											onCheckedChange={(checked) => setEditingIndex({ ...editingIndex, unique: checked })}
										/>
									</div>
								)}
							</div>
						)}
					</div>
				</div>

				<DrawerFooter className='flex-row justify-end gap-2 border-t px-6'>
					<DrawerClose asChild>
						<Button variant='outline' disabled={createIndexMutation.isPending || updateIndexMutation.isPending}>
							Cancel
						</Button>
					</DrawerClose>
					<Button
						onClick={handleSaveIndex}
						disabled={!canSave || createIndexMutation.isPending || updateIndexMutation.isPending}
					>
						{(createIndexMutation.isPending || updateIndexMutation.isPending) && (
							<Loader2 className='h-4 w-4 animate-spin' />
						)}
						{createIndexMutation.isPending || updateIndexMutation.isPending
							? 'Saving...'
							: isEditMode
								? 'Update index'
								: 'Create index'}
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
