'use client';

import { RiMoreLine } from '@remixicon/react';
import { Eye } from 'lucide-react';

import type { PolicyTableData } from '@/lib/gql/hooks/schema-builder/policies/use-database-policies';
import { Button } from '@constructive-io/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@constructive-io/ui/popover';
import { ResponsiveDiagram } from '@constructive-io/ui/responsive-diagram';
import { Tooltip, TooltipContent, TooltipTrigger } from '@constructive-io/ui/tooltip';

import type { PolicyTypeKey } from '../policies.types';
import { PolicyDiagram } from '../policy-diagram';
import { PolicyPreview } from '../policy-preview';
import type { FieldSchema, PolicyTypeId } from '../template-schema';
import { getPolicyTypeSchema } from '../template-schema';
import type { PolicyFieldType } from '@/lib/gql/hooks/schema-builder/policies/use-create-policy-field';

import {
	AccessTypeRadioRenderer,
	FieldMultiSelectRenderer,
	FieldSelectRenderer,
	MembershipTypeSelectRenderer,
	PermissionSelectRenderer,
	TableSelectRenderer,
	TextFieldRenderer,
	type FieldCreationContext,
	type FieldOption,
	type RenderVariant,
} from './field-renderers';

export interface TemplateFieldsRendererProps {
	policyTypeId: PolicyTypeId | string;
	data: Record<string, unknown>;
	onChange: (data: Record<string, unknown>) => void;
	variant: RenderVariant;
	fields: FieldOption[];
	tables: PolicyTableData[];
	singleColumn?: boolean;
	onCreateTable?: () => void;
	onCreateField?: (fieldType: PolicyFieldType, context?: FieldCreationContext) => void;
	fieldCreationContext?: FieldCreationContext;
}

function getTableFields(tables: PolicyTableData[], schema: string, table: string): FieldOption[] {
	const selectedTable = tables.find((t) => t.schema?.schemaName === schema && t.name === table);
	return (
		selectedTable?.fields
			?.slice()
			.sort((a, b) => (a.fieldOrder ?? 0) - (b.fieldOrder ?? 0))
			.map((f) => ({ name: f.name, type: f.type ?? null })) ?? []
	);
}

function renderField(
	field: FieldSchema,
	data: Record<string, unknown>,
	onChange: (updates: Record<string, unknown>) => void,
	variant: RenderVariant,
	fields: FieldOption[],
	tables: PolicyTableData[],
	policyTypeId: PolicyTypeId | string,
	onCreateTable?: () => void,
	onCreateField?: (fieldType: PolicyFieldType, context?: FieldCreationContext) => void,
	fieldCreationContext?: FieldCreationContext,
) {
	const commonProps = {
		field,
		variant,
		fields,
		tables,
		data,
		getTableFields: (schema: string, table: string) => getTableFields(tables, schema, table),
		onCreateTable,
		onCreateField,
		fieldCreationContext,
	};

	const handleChange = (value: unknown) => onChange({ [field.key]: value });

	switch (field.type) {
		case 'field-select':
			return (
				<FieldSelectRenderer
					key={field.key}
					{...commonProps}
					value={(data[field.key] as string) || ''}
					onChange={handleChange}
				/>
			);
		case 'field-multi-select':
			return (
				<FieldMultiSelectRenderer
					key={field.key}
					{...commonProps}
					value={(data[field.key] as string[]) || []}
					onChange={handleChange}
				/>
			);
		case 'table-select':
			return (
				<TableSelectRenderer
					key={field.key}
					{...commonProps}
					value={(data[field.key] as string) || ''}
					onChange={(tableName: string) => {
						const table = tables.find((t) => t.name === tableName);
						if (table) {
							const schemaKey = field.key === 'owned_table' ? 'owned_schema' : 'obj_schema';
							const schema = getPolicyTypeSchema(policyTypeId);
							const updates: Record<string, unknown> = {
								[field.key]: tableName,
								[schemaKey]: table.schema?.schemaName || '',
							};

							if (schema?.fields) {
								schema.fields.forEach((f) => {
									if (f.dependsOn === field.key) {
										updates[f.key] = f.type === 'field-multi-select' ? [] : '';
									}
								});
							}

							onChange(updates);
						}
					}}
				/>
			);
		case 'membership-type-select':
			return (
				<MembershipTypeSelectRenderer
					key={field.key}
					{...commonProps}
					value={(data[field.key] as number | null) ?? null}
					onChange={(value) => {
						if (field.key === 'membership_type') {
							onChange({ [field.key]: value, permission: undefined });
						} else {
							handleChange(value);
						}
					}}
				/>
			);
		case 'permission-select':
			return (
				<PermissionSelectRenderer
					key={field.key}
					{...commonProps}
					value={(data[field.key] as string) || undefined}
					onChange={handleChange}
				/>
			);
		case 'access-type-radio':
			return (
				<AccessTypeRadioRenderer
					key={field.key}
					{...commonProps}
					value={(data[field.key] as boolean) ?? false}
					onChange={handleChange}
				/>
			);
		case 'text':
		default:
			return (
				<TextFieldRenderer
					key={field.key}
					{...commonProps}
					value={(data[field.key] as string) || ''}
					onChange={handleChange}
				/>
			);
	}
}

export function TemplateFieldsRenderer({
	policyTypeId,
	data,
	onChange,
	variant,
	fields,
	tables,
	singleColumn = false,
	onCreateTable,
	onCreateField,
	fieldCreationContext,
}: TemplateFieldsRendererProps) {
	const schema = getPolicyTypeSchema(policyTypeId);
	if (!schema) return null;

	const handleFieldChange = (updates: Record<string, unknown>) => {
		onChange({ ...data, ...updates });
	};

	const schemaFields = schema.fields;

	if (variant === 'compact') {
		const visibleFields = schemaFields.slice(0, 1);
		const overflowFields = schemaFields.slice(1);

		const hasUnfilledRequiredFields = overflowFields.some((field) => {
			if (!field.required) return false;
			const value = data[field.key];

			if (field.type === 'field-select' || field.type === 'table-select' || field.type === 'text') {
				return typeof value !== 'string' || value.trim() === '';
			} else if (field.type === 'field-multi-select') {
				return !Array.isArray(value) || value.length === 0;
			} else if (field.type === 'membership-type-select') {
				return value === null || value === undefined;
			}
			return false;
		});

		return (
			<>
				<div className='flex flex-1 items-center gap-2'>
					{visibleFields.map((field) =>
						renderField(field, data, handleFieldChange, variant, fields, tables, policyTypeId, onCreateTable, onCreateField, fieldCreationContext),
					)}
				</div>
				{overflowFields.length > 0 && (
					<Popover>
						<PopoverTrigger asChild>
							<Button variant='ghost' size='sm' className='relative -mr-2 size-7 shrink-0 p-0'>
								<RiMoreLine className='size-4' />
								{hasUnfilledRequiredFields && (
									<span className='absolute top-0.5 right-0.5 size-1.5 rounded-full bg-yellow-500' />
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent
							className='w-auto min-w-[280px] rounded-lg p-3 shadow-lg'
							align='end'
							side='bottom'
							sideOffset={4}
						>
							<div className='flex flex-col gap-3'>
								{overflowFields.map((field) =>
									renderField(field, data, handleFieldChange, 'full', fields, tables, policyTypeId, onCreateTable, onCreateField, fieldCreationContext),
								)}
							</div>
						</PopoverContent>
					</Popover>
				)}
				<Tooltip delayDuration={100}>
					<TooltipTrigger asChild>
						<button
							type='button'
							className='text-muted-foreground/60 hover:text-foreground -mr-2 flex h-6 w-6 shrink-0 cursor-pointer
								items-center justify-center transition-colors'
						>
							<Eye className='h-4 w-4' />
						</button>
					</TooltipTrigger>
					<TooltipContent side='top' align='end' sideOffset={8} className='w-fit max-w-none p-0'>
						<div className='max-w-[320px] space-y-3 p-3 shadow-lg'>
							<div className='space-y-1'>
								<p className='text-sm font-semibold'>{schema.label}</p>
								<p className='text-muted-foreground text-xs'>{schema.description}</p>
								<p className='text-muted-foreground text-xs italic'>{schema.explanation}</p>
							</div>
							<ResponsiveDiagram className='rounded-md border-0 p-2'>
									<PolicyDiagram policyType={policyTypeId as PolicyTypeKey} tableName='Table' data={data} />
								</ResponsiveDiagram>
								<PolicyPreview
									policyTypeId={policyTypeId as PolicyTypeId}
									data={data}
									className='border-0 bg-transparent p-0'
								/>
						</div>
					</TooltipContent>
				</Tooltip>
			</>
		);
	}

	const gridCols = singleColumn ? '' : schemaFields.length > 1 ? 'sm:grid-cols-2' : '';

	return (
		<div className={`grid gap-4 ${gridCols}`}>
			{schema.fields.map((field) => renderField(field, data, onChange, variant, fields, tables, policyTypeId, onCreateTable, onCreateField, fieldCreationContext))}
		</div>
	);
}
