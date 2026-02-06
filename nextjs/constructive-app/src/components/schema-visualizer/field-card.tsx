'use client';

import { useState, useMemo } from 'react';
import { Loader2Icon } from 'lucide-react';

import type { CardComponent } from '@constructive-io/ui/stack';
import { Button } from '@constructive-io/ui/button';
import { Input } from '@constructive-io/ui/input';
import { Label } from '@constructive-io/ui/label';
import { Switch } from '@constructive-io/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@constructive-io/ui/select';
import { ScrollArea } from '@constructive-io/ui/scroll-area';
import { showErrorToast, showSuccessToast } from '@constructive-io/ui/toast';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@constructive-io/ui/alert-dialog';

import type { FieldDefinition } from '@/lib/schema';
import type { CellType } from '@/lib/types/cell-types';
import { useCreateField, useUpdateField, useDeleteField } from '@/lib/gql/hooks/schema-builder/use-field-mutations';
import { useSchemaBuilderSelectors, useTableConstraints } from '@/lib/gql/hooks/schema-builder';

// Common field types that are user-selectable
const FIELD_TYPE_OPTIONS: { value: CellType; label: string }[] = [
	// Text types
	{ value: 'text', label: 'Text' },
	{ value: 'textarea', label: 'Long Text' },
	{ value: 'email', label: 'Email' },
	{ value: 'url', label: 'URL' },
	// Numeric types
	{ value: 'integer', label: 'Integer' },
	{ value: 'number', label: 'Number (Decimal)' },
	{ value: 'currency', label: 'Currency' },
	// Date/time types
	{ value: 'date', label: 'Date' },
	{ value: 'datetime', label: 'Date & Time' },
	{ value: 'time', label: 'Time' },
	// Boolean
	{ value: 'boolean', label: 'Boolean' },
	// Special types
	{ value: 'uuid', label: 'UUID' },
	{ value: 'json', label: 'JSON' },
	{ value: 'jsonb', label: 'JSONB' },
	// Media types
	{ value: 'image', label: 'Image' },
	{ value: 'upload', label: 'File Upload' },
];

export type FieldCardProps = {
	tableId: string;
	tableName: string;
	editingField: FieldDefinition | null; // null = create mode
	onFieldCreated?: (field: { id: string; name: string }) => void;
	onFieldUpdated?: (field: { id: string; name: string }) => void;
	onFieldDeleted?: (fieldId: string) => void;
};

interface FieldFormData {
	name: string;
	type: CellType;
	nullable: boolean;
	unique: boolean;
	primaryKey: boolean;
	defaultValue: string;
}

export const FieldCard: CardComponent<FieldCardProps> = ({
	tableId,
	tableName,
	editingField,
	onFieldCreated,
	onFieldUpdated,
	onFieldDeleted,
	card,
}) => {
	const isEditMode = editingField !== null;

	const [formData, setFormData] = useState<FieldFormData>(() => {
		if (editingField) {
			return {
				name: editingField.name,
				type: editingField.type,
				nullable: editingField.constraints.nullable !== false,
				unique: editingField.constraints.unique || false,
				primaryKey: editingField.constraints.primaryKey || false,
				defaultValue: editingField.constraints.defaultValue?.toString() || '',
			};
		}
		return {
			name: '',
			type: 'text',
			nullable: true,
			unique: false,
			primaryKey: false,
			defaultValue: '',
		};
	});

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const createFieldMutation = useCreateField();
	const updateFieldMutation = useUpdateField();
	const deleteFieldMutation = useDeleteField();
	const { currentDatabase, currentSchema } = useSchemaBuilderSelectors();
	const tableConstraints = useTableConstraints(tableId);

	// Get the table for validation and field ID mapping
	const table = useMemo(() => {
		return currentSchema?.tables?.find((t) => t.id === tableId) ?? null;
	}, [currentSchema?.tables, tableId]);

	// Get existing field names for validation
	const existingFieldNames = useMemo(() => {
		if (!table) return new Set<string>();
		return new Set(
			table.fields
				.filter((f) => !editingField || f.id !== editingField.id) // Exclude current field when editing
				.map((f) => f.name.toLowerCase()),
		);
	}, [table, editingField]);

	// Helper to convert field names to field IDs
	const fieldNamesToIds = useMemo(() => {
		if (!table) return new Map<string, string>();
		return new Map(table.fields.map((f) => [f.name, f.id]));
	}, [table]);

	// Get primary key field IDs from constraint field names
	const primaryKeyFieldIds = useMemo(() => {
		if (!tableConstraints?.primaryKey?.fields) return undefined;
		return tableConstraints.primaryKey.fields
			.map((name) => fieldNamesToIds.get(name))
			.filter((id): id is string => id !== undefined);
	}, [tableConstraints?.primaryKey?.fields, fieldNamesToIds]);

	const trimmedName = formData.name.trim();
	const isDuplicate = trimmedName && existingFieldNames.has(trimmedName.toLowerCase());
	const isValidName = trimmedName && !isDuplicate;
	const isPending = createFieldMutation.isPending || updateFieldMutation.isPending || deleteFieldMutation.isPending;

	const handleInputChange = (field: keyof FieldFormData, value: string | boolean) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!trimmedName) {
			showErrorToast({
				message: 'Field name is required',
				description: 'Please enter a name for the field.',
			});
			return;
		}

		if (isDuplicate) {
			showErrorToast({
				message: 'Name already exists',
				description: 'A field with this name already exists in this table.',
			});
			return;
		}

		const databaseId = currentDatabase?.databaseId ?? currentSchema?.metadata?.databaseId;
		if (!databaseId) {
			showErrorToast({
				message: 'No database selected',
				description: 'Please ensure you have selected a database.',
			});
			return;
		}

		const fieldDefinition: FieldDefinition = {
			id: editingField?.id ?? '',
			name: trimmedName,
			type: formData.type,
			constraints: {
				nullable: formData.nullable,
				unique: formData.unique,
				primaryKey: formData.primaryKey,
				defaultValue: formData.defaultValue || undefined,
			},
		};

		try {
			if (isEditMode && editingField) {
				// Find unique constraint that includes this field
				const uniqueConstraint = tableConstraints?.uniqueConstraints?.find((uc) =>
					uc.fields.includes(editingField.name),
				);

				await updateFieldMutation.mutateAsync({
					id: editingField.id,
					field: fieldDefinition,
					tableId,
					databaseId,
					tableName,
					existingPrimaryKeyConstraintId: tableConstraints?.primaryKey?.id,
					existingUniqueConstraintId: uniqueConstraint?.id,
					allPrimaryKeyFieldIds: primaryKeyFieldIds,
					wasPartOfPrimaryKey: editingField.constraints.primaryKey,
				});
				showSuccessToast({
					message: 'Field updated',
					description: `Field "${trimmedName}" has been updated.`,
				});
				onFieldUpdated?.({ id: editingField.id, name: trimmedName });
			} else {
				const result = await createFieldMutation.mutateAsync({
					field: fieldDefinition,
					tableId,
					databaseId,
					tableName,
					existingPrimaryKeyConstraintId: tableConstraints?.primaryKey?.id,
					allPrimaryKeyFieldIds: primaryKeyFieldIds,
				});
				showSuccessToast({
					message: 'Field created',
					description: `Field "${trimmedName}" has been created.`,
				});
				onFieldCreated?.({ id: result.id, name: result.name });
			}
			card.close();
		} catch (error) {
			showErrorToast({
				message: isEditMode ? 'Failed to update field' : 'Failed to create field',
				description: error instanceof Error ? error.message : 'An unexpected error occurred.',
			});
		}
	};

	const handleDelete = async () => {
		if (!editingField) return;

		// Find unique constraint that includes this field
		const uniqueConstraint = tableConstraints?.uniqueConstraints?.find((uc) =>
			uc.fields.includes(editingField.name),
		);

		try {
			await deleteFieldMutation.mutateAsync({
				id: editingField.id,
				primaryKeyConstraintId: tableConstraints?.primaryKey?.id,
				uniqueConstraintId: uniqueConstraint?.id,
				allPrimaryKeyFieldIds: primaryKeyFieldIds,
				wasPartOfPrimaryKey: editingField.constraints.primaryKey,
			});
			showSuccessToast({
				message: 'Field deleted',
				description: `Field "${editingField.name}" has been deleted.`,
			});
			onFieldDeleted?.(editingField.id);
			setDeleteDialogOpen(false);
			card.close();
		} catch (error) {
			showErrorToast({
				message: 'Failed to delete field',
				description: error instanceof Error ? error.message : 'An unexpected error occurred.',
			});
		}
	};

	return (
		<div className='flex h-full flex-col'>
			<ScrollArea className='min-h-0 flex-1'>
				<form id='field-form' onSubmit={handleSubmit} className='space-y-4 p-6'>
					{/* Field Name */}
					<div className='grid gap-2'>
						<Label htmlFor='name'>
							Field Name <span className='text-destructive'>*</span>
						</Label>
						<Input
							id='name'
							placeholder='field_name'
							value={formData.name}
							onChange={(e) => handleInputChange('name', e.target.value)}
							required
							autoComplete='off'
							autoFocus
							className={isDuplicate ? 'border-destructive' : ''}
						/>
						{isDuplicate && <p className='text-destructive text-xs'>A field with this name already exists</p>}
					</div>

					{/* Field Type */}
					<div className='grid gap-2'>
						<Label htmlFor='type'>Type</Label>
						<Select
							value={formData.type}
							onValueChange={(value) => handleInputChange('type', value as CellType)}
						>
							<SelectTrigger>
								<SelectValue placeholder='Select type' />
							</SelectTrigger>
							<SelectContent>
								{FIELD_TYPE_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Default Value */}
					<div className='grid gap-2'>
						<Label htmlFor='defaultValue'>Default Value</Label>
						<Input
							id='defaultValue'
							placeholder='Enter default value'
							value={formData.defaultValue}
							onChange={(e) => handleInputChange('defaultValue', e.target.value)}
							autoComplete='off'
						/>
						<p className='text-muted-foreground text-xs'>
							For UUID primary keys, leave empty to auto-generate.
						</p>
					</div>

					{/* Constraints */}
					<div className='space-y-3'>
						<Label className='text-muted-foreground text-xs font-medium uppercase'>Constraints</Label>

						<div className='flex items-center justify-between'>
							<Label htmlFor='nullable' className='font-normal'>
								Allow NULL values
							</Label>
							<Switch
								id='nullable'
								checked={formData.nullable}
								onCheckedChange={(checked) => handleInputChange('nullable', checked)}
							/>
						</div>

						<div className='flex items-center justify-between'>
							<Label htmlFor='unique' className='font-normal'>
								Unique constraint
							</Label>
							<Switch
								id='unique'
								checked={formData.unique}
								onCheckedChange={(checked) => handleInputChange('unique', checked)}
							/>
						</div>

						<div className='flex items-center justify-between'>
							<Label htmlFor='primaryKey' className='font-normal'>
								Primary key
							</Label>
							<Switch
								id='primaryKey'
								checked={formData.primaryKey}
								onCheckedChange={(checked) => handleInputChange('primaryKey', checked)}
							/>
						</div>
					</div>
				</form>
			</ScrollArea>

			<div className='flex items-center justify-between gap-2 border-t p-4'>
				{/* Delete button (only in edit mode) */}
				{isEditMode && (
					<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
						<AlertDialogTrigger asChild>
							<Button type='button' variant='destructive' size='sm' disabled={isPending}>
								Delete Field
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete Field</AlertDialogTitle>
								<AlertDialogDescription>
									Are you sure you want to delete the field "{editingField?.name}"? This action cannot be undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={handleDelete}
									className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
								>
									{deleteFieldMutation.isPending ? 'Deleting...' : 'Delete'}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				)}

				{/* Spacer when no delete button */}
				{!isEditMode && <div />}

				<div className='flex gap-2'>
					<Button type='button' variant='outline' disabled={isPending} onClick={() => card.close()}>
						Cancel
					</Button>
					<Button type='submit' form='field-form' disabled={isPending || !isValidName}>
						{isPending && <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />}
						{isPending ? (isEditMode ? 'Saving...' : 'Creating...') : isEditMode ? 'Save Changes' : 'Create Field'}
					</Button>
				</div>
			</div>
		</div>
	);
};
