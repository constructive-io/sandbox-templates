'use client';

import { Input } from '@constructive-io/ui/input';
import { Label } from '@constructive-io/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@constructive-io/ui/select';
import { Switch } from '@constructive-io/ui/switch';

import type { FormFieldSchema } from '../policy-types';

interface DynamicFormFieldProps {
	field: FormFieldSchema;
	value: unknown;
	onChange: (value: unknown) => void;
	disabled?: boolean;
}

/**
 * Membership type options matching the backend values
 */
const MEMBERSHIP_TYPE_OPTIONS = [
	{ value: '1', label: 'Group' },
	{ value: '2', label: 'Organization' },
	{ value: '3', label: 'App' },
];

/**
 * Renders a form field based on its type
 */
export function DynamicFormField({ field, value, onChange, disabled }: DynamicFormFieldProps) {
	const renderField = () => {
		switch (field.type) {
			case 'text':
			case 'field-select': // Simplified - text input for field names
			case 'table-select': // Simplified - text input for table names
				return (
					<Input
						type='text'
						value={(value as string) ?? ''}
						onChange={(e) => onChange(e.target.value)}
						placeholder={field.placeholder}
						disabled={disabled}
					/>
				);

			case 'field-multi-select':
				// Simplified - comma-separated input
				return (
					<Input
						type='text'
						value={Array.isArray(value) ? (value as string[]).join(', ') : ''}
						onChange={(e) =>
							onChange(
								e.target.value
									.split(',')
									.map((s) => s.trim())
									.filter(Boolean),
							)
						}
						placeholder={field.placeholder ?? 'field1, field2, ...'}
						disabled={disabled}
					/>
				);

			case 'membership-type-select':
				return (
					<Select
						value={value !== null && value !== undefined ? String(value) : ''}
						onValueChange={(v) => onChange(parseInt(v, 10))}
						disabled={disabled}
					>
						<SelectTrigger>
							<SelectValue placeholder='Select scope' />
						</SelectTrigger>
						<SelectContent>
							{MEMBERSHIP_TYPE_OPTIONS.map((opt) => (
								<SelectItem key={opt.value} value={opt.value}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				);

			case 'permission-select':
				// Simplified - text input for permission name
				return (
					<Input
						type='text'
						value={(value as string) ?? ''}
						onChange={(e) => onChange(e.target.value || undefined)}
						placeholder={field.placeholder ?? 'Permission name (optional)'}
						disabled={disabled}
					/>
				);

			case 'boolean':
				return (
					<Switch
						checked={!!value}
						onCheckedChange={onChange}
						disabled={disabled}
					/>
				);

			case 'number':
				return (
					<Input
						type='number'
						value={value !== null && value !== undefined ? String(value) : ''}
						onChange={(e) => onChange(e.target.value ? parseInt(e.target.value, 10) : null)}
						placeholder={field.placeholder}
						disabled={disabled}
					/>
				);

			default:
				return (
					<Input
						type='text'
						value={(value as string) ?? ''}
						onChange={(e) => onChange(e.target.value)}
						placeholder={field.placeholder}
						disabled={disabled}
					/>
				);
		}
	};

	return (
		<div className='space-y-1.5'>
			<Label>
				{field.label}
				{field.required && <span className='ml-1 text-red-500'>*</span>}
			</Label>
			{renderField()}
			{field.description && <p className='text-muted-foreground text-xs'>{field.description}</p>}
		</div>
	);
}
