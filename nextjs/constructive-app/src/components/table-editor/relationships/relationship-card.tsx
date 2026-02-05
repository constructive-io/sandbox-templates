'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@constructive-io/ui/button';
import { Checkbox } from '@constructive-io/ui/checkbox';
import {
	Combobox,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxPopup,
} from '@constructive-io/ui/combobox';
import { Input } from '@constructive-io/ui/input';
import { Label } from '@constructive-io/ui/label';
import { ScrollArea } from '@constructive-io/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@constructive-io/ui/select';
import type { CardComponent } from '@constructive-io/ui/stack';
import { toast } from '@constructive-io/ui/toast';
import { AlertCircle, Key, Link, Loader2 } from 'lucide-react';

import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import {
	useCreateForeignKey,
	useCreateManyToMany,
	useUpdateForeignKey,
} from '@/lib/gql/hooks/schema-builder/use-relationship-mutations';
import type {
	FieldDefinition,
	ForeignKeyAction,
	ForeignKeyConstraint,
	RelationshipType,
	TableDefinition,
} from '@/lib/schema';
import { ForeignKeyActionLabels, ForeignKeyActions, RelationshipTypes } from '@/lib/schema';
import { cn } from '@/lib/utils';

import { RelationshipConnector } from './relationship-connectors';
import { RelationshipTypeSelector } from './relationship-type-selector';

export type RelationshipCardProps = {
	editingRelationship: ForeignKeyConstraint | null;
	/** Direct source table definition (takes precedence) */
	sourceTable?: TableDefinition;
	/** Prefill source table ID (from drag-to-connect, looks up from schema) */
	prefilledSourceTableId?: string;
	/** Prefill target table ID (from drag-to-connect) */
	prefilledTargetTableId?: string;
};

const RELATIONSHIP_COLORS = {
	'one-to-one': {
		stroke: '#a855f7',
		bg: 'bg-purple-500/5',
		border: 'border-purple-500',
		text: 'text-purple-400',
		gradient: 'from-purple-500/20 to-purple-600/20',
		badgeBg: 'bg-purple-500/20',
	},
	'one-to-many': {
		stroke: '#60a5fa',
		bg: 'bg-blue-500/5',
		border: 'border-blue-500',
		text: 'text-blue-400',
		gradient: 'from-blue-500/20 to-blue-600/20',
		badgeBg: 'bg-blue-500/20',
	},
	'many-to-many': {
		stroke: '#fbbf24',
		bg: 'bg-amber-500/5',
		border: 'border-amber-500',
		text: 'text-amber-400',
		gradient: 'from-amber-500/20 to-amber-600/20',
		badgeBg: 'bg-amber-500/20',
	},
};

// =============================================================================
// Table Combobox - Searchable table selector
// =============================================================================

type TableOption = {
	value: string;
	label: string;
	table: TableDefinition;
};

interface TableComboboxProps {
	tables: TableDefinition[];
	value: string;
	onChange: (tableId: string) => void;
	placeholder?: string;
	disabled?: boolean;
}

function TableCombobox({ tables, value, onChange, placeholder = 'Select table', disabled }: TableComboboxProps) {
	const tableOptions: TableOption[] = tables.map((t) => ({
		value: t.id,
		label: t.name,
		table: t,
	}));

	const selectedOption = tableOptions.find((o) => o.value === value) ?? null;

	return (
		<Combobox
			items={tableOptions}
			value={selectedOption}
			onValueChange={(next) => {
				if (next) onChange(next.value);
			}}
			filter={(item: TableOption, query: string) => {
				return item.label.toLowerCase().includes(query.toLowerCase());
			}}
			disabled={disabled}
		>
			<ComboboxInput placeholder={placeholder} showClear={false} />
			<ComboboxPopup>
				<ComboboxEmpty>No tables found</ComboboxEmpty>
				<ComboboxList>
					{(option: TableOption) => (
						<ComboboxItem key={option.value} value={option}>
							{option.label}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxPopup>
		</Combobox>
	);
}

// =============================================================================
// Field Combobox - Searchable field selector with type display
// =============================================================================

type FieldOption = {
	value: string;
	label: string;
	field: FieldDefinition;
};

interface FieldComboboxProps {
	fields: FieldDefinition[];
	value: string;
	onChange: (fieldId: string) => void;
	placeholder?: string;
	disabled?: boolean;
}

function FieldCombobox({ fields, value, onChange, placeholder = 'Select field', disabled }: FieldComboboxProps) {
	const selectedField = fields.find((f) => f.id === value);

	const fieldOptions: FieldOption[] = fields.map((f) => ({
		value: f.id,
		label: selectedField?.id === f.id ? `${f.name}  ` : f.name, // Add spacing for badge
		field: f,
	}));

	const selectedOption = fieldOptions.find((o) => o.value === value) ?? null;

	return (
		<div className='relative'>
			<Combobox
				items={fieldOptions}
				value={selectedOption}
				onValueChange={(next) => {
					if (next) onChange(next.value);
				}}
				filter={(item: FieldOption, query: string) => {
					const q = query.toLowerCase();
					return item.field.name.toLowerCase().includes(q) || item.field.type.toLowerCase().includes(q);
				}}
				disabled={disabled}
			>
				<ComboboxInput placeholder={placeholder} showClear={false} />
				<ComboboxPopup>
					<ComboboxEmpty>No fields found</ComboboxEmpty>
					<ComboboxList>
						{(option: FieldOption) => (
							<ComboboxItem key={option.value} value={option}>
								<div className='flex w-full items-center justify-between gap-2'>
									<span>{option.field.name}</span>
									<span className='bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px]'>
										{option.field.type}
									</span>
								</div>
							</ComboboxItem>
						)}
					</ComboboxList>
				</ComboboxPopup>
			</Combobox>
			{selectedField && (
				<span
					className='bg-muted text-muted-foreground pointer-events-none absolute top-1/2 right-9 -translate-y-1/2
						rounded px-1.5 py-0.5 font-mono text-[10px]'
				>
					{selectedField.type}
				</span>
			)}
		</div>
	);
}

export const RelationshipCard: CardComponent<RelationshipCardProps> = ({
	editingRelationship: editingConstraint,
	sourceTable: directSourceTable,
	prefilledSourceTableId,
	prefilledTargetTableId,
	card,
}) => {
	const { currentSchema, currentTable: selectedTable } = useSchemaBuilderSelectors();

	const createForeignKeyMutation = useCreateForeignKey();
	const updateForeignKeyMutation = useUpdateForeignKey();
	const createManyToManyMutation = useCreateManyToMany();

	const tables = currentSchema?.tables || [];

	// Resolve source table: direct prop > prefilledSourceTableId > selected table
	const sourceTable = useMemo(() => {
		if (directSourceTable) return directSourceTable;
		if (prefilledSourceTableId) {
			return tables.find((t) => t.id === prefilledSourceTableId) ?? selectedTable;
		}
		return selectedTable;
	}, [directSourceTable, prefilledSourceTableId, tables, selectedTable]);

	// Form state
	const [relationshipType, setRelationshipType] = useState<RelationshipType>(RelationshipTypes.ONE_TO_ONE);
	const [sourceFieldId, setSourceFieldId] = useState('');
	const [targetTableId, setTargetTableId] = useState(prefilledTargetTableId || '');
	const [targetFieldId, setTargetFieldId] = useState('');
	const [onUpdate, setOnUpdate] = useState<ForeignKeyAction>(ForeignKeyActions.NO_ACTION);
	const [onDelete, setOnDelete] = useState<ForeignKeyAction>(ForeignKeyActions.NO_ACTION);
	const [junctionTableName, setJunctionTableName] = useState('');
	const [junctionTableTouched, setJunctionTableTouched] = useState(false);
	const [autoGenerateJunctionName, setAutoGenerateJunctionName] = useState(false);

	const isEditMode = editingConstraint !== null;
	const isManyToMany = relationshipType === RelationshipTypes.MANY_TO_MANY;

	// Helper to check if table is a system table (CORE or MODULE)
	const isSystemTable = (category?: 'CORE' | 'MODULE' | 'APP') => category === 'CORE' || category === 'MODULE';

	// Filter out system tables for the target table dropdown
	const availableTargetTables = useMemo(
		() => tables.filter((t) => t.id !== sourceTable?.id && !isSystemTable(t.category)),
		[tables, sourceTable?.id],
	);

	const sourceFields = sourceTable?.fields || [];
	const targetTable = tables.find((t) => t.id === targetTableId);
	const targetFields = targetTable?.fields || [];

	const colors = RELATIONSHIP_COLORS[relationshipType];

	// Get existing table names for validation
	const existingTableNames = useMemo(() => new Set(tables.map((t) => t.name.toLowerCase())), [tables]);

	// Check if junction table name is taken
	const isJunctionNameTaken = useMemo(
		() => junctionTableName.trim() && existingTableNames.has(junctionTableName.trim().toLowerCase()),
		[junctionTableName, existingTableNames],
	);

	// Generate unique junction table name (with increment if needed)
	const generateUniqueJunctionName = useCallback(
		(baseName: string): string => {
			if (!existingTableNames.has(baseName.toLowerCase())) {
				return baseName;
			}
			let counter = 1;
			while (existingTableNames.has(`${baseName}_${counter}`.toLowerCase())) {
				counter++;
			}
			return `${baseName}_${counter}`;
		},
		[existingTableNames],
	);

	// Initialize form when editing
	useEffect(() => {
		if (editingConstraint) {
			setSourceFieldId(editingConstraint.fields[0] || '');
			setTargetTableId(editingConstraint.referencedTable || '');
			setTargetFieldId(editingConstraint.referencedFields?.[0] || '');
			setOnUpdate(editingConstraint.onUpdate || ForeignKeyActions.NO_ACTION);
			setOnDelete(editingConstraint.onDelete || ForeignKeyActions.NO_ACTION);

			// Read relationship type from smartTags
			const storedType = editingConstraint.smartTags?.relationshipType as RelationshipType | undefined;
			setRelationshipType(storedType || RelationshipTypes.ONE_TO_MANY);
			setJunctionTableName('');
		}
	}, [editingConstraint]);

	// Auto-generate junction table name for M2M when auto-generate is enabled
	useEffect(() => {
		if (isManyToMany && sourceTable && targetTable && autoGenerateJunctionName) {
			const sortedNames = [sourceTable.name, targetTable.name].sort();
			const baseName = `${sortedNames[0]}_${sortedNames[1]}`;
			setJunctionTableName(generateUniqueJunctionName(baseName));
		}
	}, [isManyToMany, sourceTable, targetTable, autoGenerateJunctionName, generateUniqueJunctionName]);

	// Clear junction table name when switching away from M2M
	useEffect(() => {
		if (!isManyToMany) {
			setJunctionTableName('');
			setJunctionTableTouched(false);
			setAutoGenerateJunctionName(false);
		}
	}, [isManyToMany]);

	const handleTargetTableChange = useCallback((tableId: string) => {
		setTargetTableId(tableId);
		setTargetFieldId('');
		// Don't clear junction table name - only auto-generate if empty
	}, []);

	const handleClose = useCallback(() => {
		card.close();
	}, [card]);

	// Helper to get primary key field ID from a table
	const getPrimaryKeyFieldId = useCallback(
		(tableId: string): string | null => {
			const table = tables.find((t) => t.id === tableId);
			if (!table?.constraints) return null;
			const pkConstraint = table.constraints.find((c) => c.type === 'primary_key');
			if (!pkConstraint || !('fields' in pkConstraint) || pkConstraint.fields.length === 0) return null;
			// pkConstraint.fields contains field IDs, not names
			const pkFieldId = pkConstraint.fields[0];
			// Verify the field exists in the table
			const pkField = table.fields.find((f) => f.id === pkFieldId);
			return pkField?.id ?? null;
		},
		[tables],
	);

	const handleSave = useCallback(async () => {
		if (!sourceTable) {
			toast.error({ message: 'No source table selected' });
			return;
		}

		if (!targetTableId) {
			toast.error({ message: 'Please select a target table' });
			return;
		}

		// Many-to-Many
		if (isManyToMany) {
			if (!junctionTableName.trim()) {
				toast.error({ message: 'Please provide a junction table name' });
				return;
			}

			const tableAPkFieldId = getPrimaryKeyFieldId(sourceTable.id);
			const tableBPkFieldId = getPrimaryKeyFieldId(targetTableId);

			if (!tableAPkFieldId || !tableBPkFieldId) {
				toast.error({
					message: 'Primary key not found',
					description: 'Both tables must have a primary key field.',
				});
				return;
			}

			try {
				await createManyToManyMutation.mutateAsync({
					tableAId: sourceTable.id,
					tableBId: targetTableId,
					tableAName: sourceTable.name,
					tableBName: targetTable!.name,
					junctionTableName: junctionTableName.trim(),
					tableAPrimaryKeyFieldId: tableAPkFieldId,
					tableBPrimaryKeyFieldId: tableBPkFieldId,
					deleteAction: onDelete,
					updateAction: onUpdate,
				});
				toast.success({
					message: 'Many-to-many relationship created',
					description: `Junction table "${junctionTableName}" created.`,
				});
				card.close();
			} catch (error) {
				toast.error({
					message: 'Failed to create relationship',
					description: error instanceof Error ? error.message : 'An error occurred',
				});
			}
			return;
		}

		// Standard FK
		if (!sourceFieldId || !targetFieldId) {
			toast.error({ message: 'Please select fields for both tables' });
			return;
		}

		try {
			if (isEditMode && editingConstraint) {
				await updateForeignKeyMutation.mutateAsync({
					id: editingConstraint.id,
					fieldIds: [sourceFieldId],
					refTableId: targetTableId,
					refFieldIds: [targetFieldId],
					deleteAction: onDelete,
					updateAction: onUpdate,
				});
				toast.success({ message: 'Relationship updated' });
			} else {
				const result = await createForeignKeyMutation.mutateAsync({
					tableId: sourceTable.id,
					fieldIds: [sourceFieldId],
					refTableId: targetTableId,
					refFieldIds: [targetFieldId],
					deleteAction: onDelete,
					updateAction: onUpdate,
					relationshipType, // Pass type to enforce 1:1 with unique constraint
				});
				toast.success({
					message: 'Relationship created',
					description: result.name ? `Created "${result.name}" successfully` : undefined,
				});
			}
			card.close();
		} catch (error) {
			toast.error({
				message: isEditMode ? 'Failed to update relationship' : 'Failed to create relationship',
				description: error instanceof Error ? error.message : 'An error occurred',
			});
		}
	}, [
		sourceTable,
		targetTableId,
		sourceFieldId,
		targetFieldId,
		targetTable,
		isManyToMany,
		junctionTableName,
		relationshipType,
		onUpdate,
		onDelete,
		isEditMode,
		editingConstraint,
		getPrimaryKeyFieldId,
		createForeignKeyMutation,
		updateForeignKeyMutation,
		createManyToManyMutation,
		card,
	]);

	const isPending =
		createForeignKeyMutation.isPending || updateForeignKeyMutation.isPending || createManyToManyMutation.isPending;

	// Get selected field objects
	const selectedSourceField = sourceFields.find((f) => f.id === sourceFieldId);
	const selectedTargetField = targetFields.find((f) => f.id === targetFieldId);

	// Type mismatch validation
	const hasTypeMismatch = useMemo(() => {
		if (!selectedSourceField || !selectedTargetField) return false;
		return selectedSourceField.type !== selectedTargetField.type;
	}, [selectedSourceField, selectedTargetField]);

	// Validation
	const canSaveM2M = isManyToMany && targetTableId && junctionTableName.trim().length > 0 && !isJunctionNameTaken;
	const canSaveFK = !isManyToMany && sourceFieldId && targetTableId && targetFieldId && !hasTypeMismatch;
	const canSave = canSaveM2M || canSaveFK;

	// Early return if no source table
	if (!sourceTable) {
		return (
			<div className='flex h-full flex-col items-center justify-center p-6'>
				<p className='text-muted-foreground text-sm'>No table selected</p>
			</div>
		);
	}

	return (
		<div className='flex h-full flex-col'>
			<ScrollArea className='min-h-0 flex-1'>
				<div className='space-y-6 p-6'>
					{/* Relationship Type Selector */}
					<RelationshipTypeSelector
						value={relationshipType}
						onChange={setRelationshipType}
						disabled={isEditMode && isManyToMany}
					/>

					{/* Junction Table Name (M2M only) */}
					{isManyToMany && (
						<div className='space-y-2'>
							<div className='flex items-center justify-between'>
								<Label>Junction table name</Label>
								<label className='flex cursor-pointer items-center gap-2 text-sm'>
									<Checkbox
										checked={autoGenerateJunctionName}
										onCheckedChange={(checked) => setAutoGenerateJunctionName(checked === true)}
									/>
									<span>Auto-generate</span>
								</label>
							</div>
							<Input
								value={junctionTableName}
								onChange={(e) => {
									setJunctionTableName(e.target.value);
									setJunctionTableTouched(true);
								}}
								onBlur={() => setJunctionTableTouched(true)}
								placeholder={autoGenerateJunctionName ? 'Auto-generated' : 'Enter table name'}
								disabled={autoGenerateJunctionName}
								className={
									!autoGenerateJunctionName &&
									(isJunctionNameTaken || (junctionTableTouched && !junctionTableName.trim()))
										? 'border-destructive'
										: ''
								}
							/>
							{!autoGenerateJunctionName && isJunctionNameTaken ? (
								<p className='text-destructive text-xs'>Table name already exists</p>
							) : !autoGenerateJunctionName && junctionTableTouched && !junctionTableName.trim() ? (
								<p className='text-destructive text-xs'>Junction table name is required</p>
							) : (
								<p className='text-muted-foreground text-xs'>
									A join table will be created with foreign keys to both tables.
								</p>
							)}
						</div>
					)}

					{/* Table Selection */}
					<div className='flex items-start gap-6'>
						{/* FK Table Panel (locked to current table) */}
						<div className='bg-card border-border flex-1 rounded-2xl border p-6'>
							<div className='mb-6 flex items-start justify-between'>
								<div
									className={cn(
										'flex h-18 w-18 items-center justify-center rounded-2xl bg-gradient-to-br',
										colors.gradient,
									)}
								>
									<Key className={cn('h-10 w-10', colors.text)} />
								</div>
								<div className={cn('rounded-md px-3 py-1 text-xs font-medium', colors.badgeBg, colors.text)}>
									{isManyToMany ? 'Connected table' : 'Foreign Key'}
								</div>
							</div>

							<div className='space-y-4'>
								<h3 className='text-muted-foreground text-sm'>
									{isManyToMany ? 'Select table' : 'Table with foreign key'}
								</h3>
								{/* Locked display - not a select */}
								<div className='border-input bg-muted/30 flex h-9 items-center rounded-lg border px-3 text-sm sm:h-8'>
									<span>{sourceTable.name}</span>
								</div>

								{!isManyToMany && (
									<>
										<p className='text-muted-foreground text-sm'>Which field holds the reference?</p>
										<FieldCombobox
											fields={sourceFields}
											value={sourceFieldId}
											onChange={setSourceFieldId}
											placeholder='Select field'
										/>
									</>
								)}

								<div className={cn('rounded-lg border-l-4 p-4', colors.bg, colors.border)}>
									<div className='flex items-start gap-3'>
										{isManyToMany ? (
											<Link className={cn('mt-0.5 h-5 w-5', colors.text)} />
										) : (
											<Key className={cn('mt-0.5 h-5 w-5', colors.text)} />
										)}
										<div>
											<h4 className='mb-1 text-sm font-medium'>{isManyToMany ? 'Connected table' : 'Foreign Key'}</h4>
											<p className='text-muted-foreground text-xs'>
												{isManyToMany
													? 'This table will be linked through a junction table.'
													: 'This table has the foreign key column.'}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Connector - vertically centered */}
						<div className='flex items-center justify-center self-center'>
							<RelationshipConnector type={relationshipType} color={colors.stroke} />
						</div>

						{/* Referenced Table Panel */}
						<div className='bg-card border-border flex-1 rounded-2xl border p-6'>
							<div className='mb-6 flex items-start justify-between'>
								<div
									className={cn(
										'flex h-18 w-18 items-center justify-center rounded-2xl bg-gradient-to-br',
										colors.gradient,
									)}
								>
									<Link className={cn('h-10 w-10', colors.text)} />
								</div>
								<div className={cn('rounded-md px-3 py-1 text-xs font-medium', colors.badgeBg, colors.text)}>
									{isManyToMany ? 'Connected table' : 'Referenced'}
								</div>
							</div>

							<div className='space-y-4'>
								<h3 className='text-muted-foreground text-sm'>{isManyToMany ? 'Select table' : 'Referenced table'}</h3>
								<TableCombobox
									tables={availableTargetTables}
									value={targetTableId}
									onChange={handleTargetTableChange}
									placeholder='Select table'
								/>

								{!isManyToMany && (
									<>
										<p className='text-muted-foreground text-sm'>Which field is being referenced?</p>
										<FieldCombobox
											fields={targetFields}
											value={targetFieldId}
											onChange={setTargetFieldId}
											placeholder='Select field'
											disabled={!targetTableId}
										/>
										{hasTypeMismatch && selectedSourceField && selectedTargetField && (
											<div
												className='border-destructive/50 bg-destructive/10 flex items-center gap-2 rounded-md border
													p-3'
											>
												<AlertCircle className='text-destructive h-4 w-4' />
												<p className='text-destructive text-sm'>
													Type mismatch: {selectedSourceField.type} ≠ {selectedTargetField.type}
												</p>
											</div>
										)}
									</>
								)}

								<div className={cn('rounded-lg border-l-4 p-4', colors.bg, colors.border)}>
									<div className='flex items-start gap-3'>
										<Link className={cn('mt-0.5 h-5 w-5', colors.text)} />
										<div>
											<h4 className='mb-1 text-sm font-medium'>{isManyToMany ? 'Connected table' : 'Referenced'}</h4>
											<p className='text-muted-foreground text-xs'>
												{isManyToMany
													? 'This table will be linked through a junction table.'
													: 'This table is referenced by the foreign key.'}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Referential Actions */}
					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label>On update</Label>
							<Select value={onUpdate} onValueChange={(v) => setOnUpdate(v as ForeignKeyAction)}>
								<SelectTrigger className='h-11'>
									<span>{ForeignKeyActionLabels[onUpdate]}</span>
								</SelectTrigger>
								<SelectContent>
									{Object.entries(ForeignKeyActions).map(([key, value]) => (
										<SelectItem key={key} value={value}>
											{ForeignKeyActionLabels[value]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className='space-y-2'>
							<Label>On delete</Label>
							<Select value={onDelete} onValueChange={(v) => setOnDelete(v as ForeignKeyAction)}>
								<SelectTrigger className='h-11'>
									<span>{ForeignKeyActionLabels[onDelete]}</span>
								</SelectTrigger>
								<SelectContent>
									{Object.entries(ForeignKeyActions).map(([key, value]) => (
										<SelectItem key={key} value={value}>
											{ForeignKeyActionLabels[value]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>
			</ScrollArea>

			{/* Footer */}
			<div className='flex items-center justify-end gap-3 border-t p-4'>
				<Button variant='outline' onClick={handleClose} disabled={isPending}>
					Cancel
				</Button>
				<Button onClick={handleSave} disabled={!canSave || isPending}>
					{isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
					{isEditMode ? 'Update Relationship' : 'Create Relationship'}
				</Button>
			</div>
		</div>
	);
};
