'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { MultiSelect } from '@constructive-io/ui/multi-select';
import {
	Select,
	SelectContent,
	SelectFieldItem,
	SelectItem,
	SelectRichItem,
	SelectTrigger,
	SelectValue,
} from '@constructive-io/ui/select';
import { Switch } from '@constructive-io/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@constructive-io/ui/tooltip';
import { Info, Plus } from 'lucide-react';

import type { PolicyFieldType } from '@/lib/gql/hooks/schema-builder/policies/use-create-policy-field';
import type { PolicyTableData } from '@/lib/gql/hooks/schema-builder/policies/use-database-policies';
import { usePermissions } from '@/lib/gql/hooks/schema-builder/policies/use-permissions';

import { MEMBERSHIP_TYPE_OPTIONS, MEMBERSHIP_TYPES } from '../policies.types';
import type { FieldSchema } from '../template-schema';

export type RenderVariant = 'full' | 'compact';

export interface FieldOption {
	name: string;
	type: string | null;
}

const normalizeFieldType = (type: string | null | undefined) => (type ?? '').toLowerCase();
const isUuidType = (type: string | null | undefined) => {
	const t = normalizeFieldType(type);
	return t === 'uuid' || t === 'uuid!' || t.startsWith('uuid');
};
const isUuidArrayType = (type: string | null | undefined) => {
	const t = normalizeFieldType(type);
	return t === 'uuid[]' || t === 'uuid[]!' || t.startsWith('uuid[');
};

export interface FieldCreationContext {
	databaseId: string;
	tableId: string;
	tableName: string;
}

export interface FieldRendererProps<T = unknown> {
	field: FieldSchema;
	value: T;
	onChange: (value: T) => void;
	variant: RenderVariant;
	fields: FieldOption[];
	tables: PolicyTableData[];
	getTableFields: (schema: string, table: string) => FieldOption[];
	data: Record<string, unknown>;
	onCreateTable?: () => void;
	onCreateField?: (fieldType: PolicyFieldType, context?: FieldCreationContext) => void;
	fieldCreationContext?: FieldCreationContext;
}

interface FieldWrapperProps {
	field: FieldSchema;
	variant: RenderVariant;
	children: React.ReactNode;
	className?: string;
	helperText?: string;
}

function FieldWrapper({ field, variant, children, className = '', helperText }: FieldWrapperProps) {
	if (variant === 'compact') {
		return (
			<div className={`flex items-center gap-2 ${className}`}>
				<div className='flex shrink-0 items-center gap-1'>
					<Label className='text-muted-foreground text-xs'>{field.label}</Label>
					{field.description && (
						<Tooltip delayDuration={100}>
							<TooltipTrigger asChild>
								<Info className='text-muted-foreground/80 h-3.5 w-3.5 shrink-0 cursor-help' />
							</TooltipTrigger>
							<TooltipContent side='top' className='max-w-[200px]'>
								<p className='text-xs'>{field.description}</p>
							</TooltipContent>
						</Tooltip>
					)}
					<span className='text-muted-foreground text-xs'>:</span>
				</div>
				{children}
			</div>
		);
	}

	const fullWidthClass = field.fullWidth ? 'sm:col-span-2' : '';

	return (
		<div className={`space-y-1.5 ${fullWidthClass} ${className}`}>
			<Label>{field.label}</Label>
			{children}
			{helperText && <p className='text-muted-foreground text-[11px] italic'>{helperText}</p>}
			{field.description && <p className='text-muted-foreground text-[11px]'>{field.description}</p>}
		</div>
	);
}

function getFieldOptionsFromTable(tables: PolicyTableData[], schema: string, table: string): FieldOption[] {
	const selectedTable = tables.find((t) => t.schema?.schemaName === schema && t.name === table);
	return (
		selectedTable?.fields
			?.slice()
			.sort((a, b) => (a.fieldOrder ?? 0) - (b.fieldOrder ?? 0))
			.map((f) => ({ name: f.name, type: f.type ?? null })) ?? []
	);
}

export function FieldSelectRenderer({
	field,
	value,
	onChange,
	variant,
	fields,
	tables,
	getTableFields,
	data,
	onCreateField,
	fieldCreationContext,
}: FieldRendererProps<string>) {
	const dependsOnTable = field.dependsOn === 'owned_table' || field.dependsOn === 'obj_table';
	let fieldOptions: FieldOption[] = fields;
	let dependentTableContext: FieldCreationContext | undefined;

	if (dependsOnTable) {
		const schema = (data.owned_schema as string) || (data.obj_schema as string) || '';
		const tableName = (data.owned_table as string) || (data.obj_table as string) || '';
		if (schema && tableName) {
			fieldOptions = getFieldOptionsFromTable(tables, schema, tableName);
			const selectedTable = tables.find((t) => t.schema?.schemaName === schema && t.name === tableName);
			if (selectedTable && fieldCreationContext?.databaseId) {
				dependentTableContext = {
					databaseId: fieldCreationContext.databaseId,
					tableId: selectedTable.id,
					tableName: selectedTable.name,
				};
			}
		} else {
			fieldOptions = [];
		}
	}

	const isUuidArrayField = field.key === 'owned_table_key';
	const isUuidField =
		(field.key === 'entity_field' || field.key.includes('_field') || field.key.includes('_key')) && !isUuidArrayField;

	if (isUuidArrayField) {
		fieldOptions = fieldOptions.filter((f) => isUuidArrayType(f.type));
	} else if (isUuidField) {
		fieldOptions = fieldOptions.filter((f) => isUuidType(f.type));
	}

	const isDisabled = dependsOnTable && fieldOptions.length === 0 && !(isUuidField || isUuidArrayField);
	const showUuidHelper = (isUuidField || isUuidArrayField) && fieldOptions.length > 0;
	const showNoUuidFields = (isUuidField || isUuidArrayField) && fieldOptions.length === 0;
	const noFieldsMessage = isUuidArrayField ? 'No UUID array fields' : 'No UUID fields';
	const helperMessage = isUuidArrayField ? 'Non-UUID array fields are hidden' : 'Non-UUID fields are hidden';
	const placeholder = isDisabled ? 'Select table first' : 'Select field';

	const fieldType: PolicyFieldType = isUuidArrayField ? 'uuid[]' : 'uuid';
	const creationContext = dependsOnTable ? dependentTableContext : fieldCreationContext;
	const canCreateField = onCreateField && creationContext && (isUuidField || isUuidArrayField);
	const showCreateFieldButton = onCreateField && (isUuidField || isUuidArrayField) && showNoUuidFields;

	const [selectOpen, setSelectOpen] = useState(false);

	const handleCreateField = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setSelectOpen(false);
		if (creationContext && onCreateField) {
			onCreateField(fieldType, creationContext);
		}
	};

	if (variant === 'compact') {
		return (
			<FieldWrapper field={field} variant={variant} className='flex-1'>
				<Select
					value={value || ''}
					onValueChange={onChange}
					disabled={isDisabled}
					open={selectOpen}
					onOpenChange={setSelectOpen}
				>
					<SelectTrigger className='bg-background h-8 flex-1 text-xs'>
						<SelectValue placeholder={placeholder} />
					</SelectTrigger>
					<SelectContent className='max-h-48'>
						{showNoUuidFields ? (
							<div className='flex flex-col items-center justify-center gap-2 py-4'>
								<span className='text-muted-foreground text-xs'>{noFieldsMessage}</span>
								{showCreateFieldButton && (
									<button
										type='button'
										onClick={handleCreateField}
										disabled={!creationContext}
										className='text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-medium
											disabled:cursor-not-allowed disabled:opacity-50'
									>
										<Plus className='h-3 w-3' />
										New field
									</button>
								)}
							</div>
						) : (
							<>
								{fieldOptions.map((f) => (
									<SelectFieldItem key={f.name} value={f.name} name={f.name} type={f.type ?? undefined} />
								))}
								{canCreateField && (
									<div className='border-t px-2 py-1.5'>
										<button
											type='button'
											onClick={handleCreateField}
											className='text-muted-foreground hover:text-foreground flex w-full items-center gap-1.5 text-xs
												font-medium'
										>
											<Plus className='h-3 w-3' />
											New field
										</button>
									</div>
								)}
								{showUuidHelper && (
									<div className='text-muted-foreground flex items-center gap-1.5 border-t px-2 py-1.5 text-xs'>
										<Info className='h-3 w-3 shrink-0' />
										<span>{helperMessage}</span>
									</div>
								)}
							</>
						)}
					</SelectContent>
				</Select>
			</FieldWrapper>
		);
	}

	return (
		<FieldWrapper field={field} variant={variant}>
			<Select
				value={value || ''}
				onValueChange={onChange}
				disabled={isDisabled}
				open={selectOpen}
				onOpenChange={setSelectOpen}
			>
				<SelectTrigger>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent className='max-h-48'>
					{showNoUuidFields ? (
						<div className='flex flex-col items-center justify-center gap-2 py-4'>
							<span className='text-muted-foreground text-xs'>{noFieldsMessage}</span>
							{showCreateFieldButton && (
								<button
									type='button'
									onClick={handleCreateField}
									disabled={!creationContext}
									className='text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-medium
										disabled:cursor-not-allowed disabled:opacity-50'
								>
									<Plus className='h-3 w-3' />
									New field
								</button>
							)}
						</div>
					) : (
						<>
							{fieldOptions.map((f) => (
								<SelectFieldItem key={f.name} value={f.name} name={f.name} type={f.type ?? undefined} />
							))}
							{canCreateField && (
								<div className='border-t px-2 py-1.5'>
									<button
										type='button'
										onClick={handleCreateField}
										className='text-muted-foreground hover:text-foreground flex w-full items-center gap-1.5 text-xs
											font-medium'
									>
										<Plus className='h-3 w-3' />
										New field
									</button>
								</div>
							)}
							{showUuidHelper && (
								<div className='text-muted-foreground flex items-center gap-1.5 border-t px-2 py-1.5 text-xs'>
									<Info className='h-3 w-3 shrink-0' />
									<span>{helperMessage}</span>
								</div>
							)}
						</>
					)}
				</SelectContent>
			</Select>
		</FieldWrapper>
	);
}

export function FieldMultiSelectRenderer({
	field,
	value,
	onChange,
	variant,
	fields,
	onCreateField,
	fieldCreationContext,
}: FieldRendererProps<string[]>) {
	const isUuidField = field.key === 'entity_fields' || field.key.includes('_fields');
	let fieldOptions = fields;

	if (isUuidField) {
		fieldOptions = fields.filter((f) => isUuidType(f.type));
	}

	const options = fieldOptions.map((f) => ({
		label: f.name,
		value: f.name,
		description: f.type,
	}));

	const showCreateButton = onCreateField && fieldCreationContext && isUuidField;

	const handleCreateField = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (fieldCreationContext && onCreateField) {
			onCreateField('uuid', fieldCreationContext);
		}
	};

	const footerContent = showCreateButton ? (
		<button
			type='button'
			onClick={handleCreateField}
			className='text-muted-foreground hover:text-foreground flex w-full items-center gap-1.5 px-1 py-1.5 text-xs
				font-medium'
		>
			<Plus className='h-3 w-3' />
			New field
		</button>
	) : undefined;

	if (variant === 'compact') {
		return (
			<FieldWrapper field={field} variant={variant} className='flex-1'>
				<MultiSelect
					options={options}
					defaultValue={value || []}
					onValueChange={onChange}
					placeholder={options.length === 0 ? 'No UUID fields available' : 'Select fields'}
					singleLine
					maxCount={1}
					className='h-8 text-xs'
					dropdownMaxHeight='206px'
					footerContent={footerContent}
				/>
			</FieldWrapper>
		);
	}

	return (
		<FieldWrapper field={field} variant={variant}>
			<MultiSelect
				options={options}
				defaultValue={value || []}
				onValueChange={onChange}
				placeholder={options.length === 0 ? 'No UUID fields available' : 'Select fields'}
				dropdownMaxHeight='206px'
				footerContent={footerContent}
			/>
		</FieldWrapper>
	);
}

export function TableSelectRenderer({
	field,
	value,
	onChange,
	variant,
	tables,
	onCreateTable,
}: FieldRendererProps<string> & { onTableChange?: (schema: string, table: string) => void }) {
	const selectedTable = tables.find((t) => t.name === value);
	const selectedTableId = selectedTable?.id ?? '';

	const tableOptions = tables.map((t) => ({
		label: t.name,
		value: t.id,
	}));

	const selectedTableOption = tableOptions.find((o) => o.value === selectedTableId) ?? null;

	const handleChange = (tableId: string) => {
		const table = tables.find((t) => t.id === tableId);
		if (table) {
			onChange(table.name);
		}
	};

	const handleCreateTable = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onCreateTable?.();
	};

	if (variant === 'compact') {
		return (
			<FieldWrapper field={field} variant={variant} className='flex-1'>
				<Select value={selectedTableId} onValueChange={handleChange}>
					<SelectTrigger className='bg-background h-8 flex-1 text-xs'>
						<SelectValue placeholder='Select table' />
					</SelectTrigger>
					<SelectContent>
						{tables.map((t) => (
							<SelectItem key={t.id} value={t.id}>
								{t.name}
							</SelectItem>
						))}
						{onCreateTable && (
							<div className='border-t px-2 py-1.5'>
								<button
									type='button'
									onClick={handleCreateTable}
									className='text-muted-foreground hover:text-foreground flex w-full items-center gap-1.5 text-xs
										font-medium'
								>
									<Plus className='h-3 w-3' />
									New table
								</button>
							</div>
						)}
					</SelectContent>
				</Select>
			</FieldWrapper>
		);
	}

	return (
		<FieldWrapper field={field} variant={variant}>
			<Combobox
				items={tableOptions}
				value={selectedTableOption}
				onValueChange={(next) => {
					if (next) handleChange(next.value);
				}}
			>
				<ComboboxInput placeholder='Search tables...' showClear={false} />
				<ComboboxPopup>
					<ComboboxEmpty>No tables found</ComboboxEmpty>
					<ComboboxList className='scrollbar-neutral-thin max-h-[180px] overflow-y-auto'>
						{(table: (typeof tableOptions)[number]) => (
							<ComboboxItem key={table.value} value={table}>
								<span className='truncate'>{table.label}</span>
							</ComboboxItem>
						)}
					</ComboboxList>
					{onCreateTable && (
						<div className='border-t px-2 py-1.5'>
							<button
								type='button'
								onClick={handleCreateTable}
								className='text-muted-foreground hover:text-foreground flex w-full items-center gap-1.5 text-xs
									font-medium'
							>
								<Plus className='h-3 w-3' />
								New table
							</button>
						</div>
					)}
				</ComboboxPopup>
			</Combobox>
		</FieldWrapper>
	);
}

export function MembershipTypeSelectRenderer({ field, value, onChange, variant }: FieldRendererProps<number | null>) {
	if (variant === 'compact') {
		return (
			<FieldWrapper field={field} variant={variant} className='flex-1'>
				<Select value={value ? String(value) : ''} onValueChange={(v) => onChange(v ? Number(v) : null)}>
					<SelectTrigger className='bg-background h-8 flex-1 text-xs'>
						<SelectValue placeholder='Select type' />
					</SelectTrigger>
					<SelectContent>
						{MEMBERSHIP_TYPE_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={String(option.value)}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FieldWrapper>
		);
	}

	return (
		<FieldWrapper field={field} variant={variant}>
			<Select value={value ? String(value) : ''} onValueChange={(v) => onChange(v ? Number(v) : null)}>
				<SelectTrigger>
					<SelectValue placeholder='Select membership type' />
				</SelectTrigger>
				<SelectContent>
					{MEMBERSHIP_TYPE_OPTIONS.map((option) => (
						<SelectRichItem
							key={option.value}
							value={String(option.value)}
							label={option.label}
							description={option.description}
						/>
					))}
				</SelectContent>
			</Select>
		</FieldWrapper>
	);
}

export function PermissionSelectRenderer({
	field,
	value,
	onChange,
	variant,
	data,
}: FieldRendererProps<string | undefined>) {
	const { data: permissions, isLoading } = usePermissions();
	const membershipType = data.membership_type as number | null;
	const isAppLevel = membershipType === MEMBERSHIP_TYPES.APP;
	const permissionsList = isAppLevel ? permissions?.appPermissions || [] : permissions?.membershipPermissions || [];

	const inferredPermission = useMemo(() => {
		if (value) return null;
		const mask = data.mask as string | undefined;
		if (!mask || !permissionsList.length) return null;
		const matchedPermission = permissionsList.find((p) => p.bitstr === mask);
		return matchedPermission?.name ?? null;
	}, [value, data.mask, permissionsList]);

	// Update data with resolved permission name (converts mask to permission name)
	useEffect(() => {
		if (inferredPermission) {
			onChange(inferredPermission);
		}
	}, [inferredPermission, onChange]);

	const resolvedValue = value || inferredPermission || undefined;

	if (variant === 'compact') {
		return (
			<FieldWrapper field={field} variant={variant} className='flex-1'>
				<Select value={resolvedValue || ''} onValueChange={(v) => onChange(v || undefined)}>
					<SelectTrigger className='bg-background h-8 flex-1 text-xs'>
						<SelectValue placeholder={isLoading ? 'Loading...' : 'Select permission'} />
					</SelectTrigger>
					<SelectContent className='max-h-48'>
						{permissionsList
							.filter((p) => p.name)
							.map((permission) => (
								<SelectItem key={permission.id} value={permission.name!}>
									{permission.name}
								</SelectItem>
							))}
					</SelectContent>
				</Select>
			</FieldWrapper>
		);
	}

	return (
		<FieldWrapper field={field} variant={variant}>
			<Select value={resolvedValue || ''} onValueChange={(v) => onChange(v || undefined)}>
				<SelectTrigger>
					<SelectValue
						placeholder={isLoading ? 'Loading...' : `Select ${isAppLevel ? 'app' : 'membership'} permission`}
					/>
				</SelectTrigger>
				<SelectContent className='max-h-48'>
					{permissionsList
						.filter((p) => p.name)
						.map((permission) => (
							<SelectRichItem
								key={permission.id}
								value={permission.name!}
								label={permission.name ?? undefined}
								description={permission.description}
							/>
						))}
				</SelectContent>
			</Select>
		</FieldWrapper>
	);
}

export function AccessTypeRadioRenderer({ field, value, onChange, variant }: FieldRendererProps<boolean>) {
	if (variant === 'compact') {
		return (
			<FieldWrapper field={field} variant={variant}>
				<Switch checked={value === true} onCheckedChange={onChange} />
			</FieldWrapper>
		);
	}

	const switchId = `switch-${field.key}`;
	return (
		<FieldWrapper field={field} variant={variant}>
			<div className='flex items-center justify-between rounded-md border px-3 py-2'>
				<label htmlFor={switchId} className='cursor-pointer text-sm'>
					Enabled
				</label>
				<Switch id={switchId} checked={value === true} onCheckedChange={onChange} />
			</div>
		</FieldWrapper>
	);
}

export function TextFieldRenderer({ field, value, onChange, variant }: FieldRendererProps<string>) {
	if (variant === 'compact') {
		return (
			<FieldWrapper field={field} variant={variant} className='flex-1'>
				<Input
					size='sm'
					className='bg-background h-8 flex-1 text-xs'
					value={value || ''}
					onChange={(e) => onChange(e.target.value)}
					placeholder={field.placeholder}
				/>
			</FieldWrapper>
		);
	}

	return (
		<FieldWrapper field={field} variant={variant}>
			<Input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />
		</FieldWrapper>
	);
}
