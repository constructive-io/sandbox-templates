'use client';

import type { CellType } from '@/lib/types/cell-types';
import { cn } from '@/lib/utils';
import { Checkbox } from '@constructive-io/ui/checkbox';
import { Input } from '@constructive-io/ui/input';
import { Label } from '@constructive-io/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@constructive-io/ui/select';
import { RadioGroup, RadioGroupItem } from '@constructive-io/ui/radio-group';
import { Textarea } from '@constructive-io/ui/textarea';

import type { FieldDefinition } from '@/lib/schema';

interface ElementPreviewerProps {
	field: FieldDefinition;
	className?: string;
}

/**
 * Renders a preview of a form field based on its type.
 * This component shows how the field will appear to end users.
 */
export function ElementPreviewer({ field, className }: ElementPreviewerProps) {
	// Don't render hidden fields in preview
	if (field.isHidden) {
		return null;
	}

	const isRequired = field.isRequired ?? field.constraints.nullable === false;
	const label = field.label || field.name || 'Untitled Field';
	const placeholder = field.description || `Enter ${label.toLowerCase()}`;
	const defaultValue = field.constraints.defaultValue?.toString() || '';
	const smartTags = (field.metadata?.smartTags ?? {}) as Record<string, unknown>;
	const smartUi = typeof smartTags.ui === 'string' ? (smartTags.ui as string) : undefined;
	const smartEnum = Array.isArray(smartTags.enum) ? (smartTags.enum as unknown[]).map((v) => String(v)) : [];

	return (
		<div className={cn('space-y-2', className)}>
			{/* Label with required indicator */}
			<Label className='text-sm font-medium'>
				{label}
				{isRequired && <span className='text-destructive ml-1'>*</span>}
			</Label>

			{/* Field input based on type */}
			<FieldInput
				type={field.type}
				placeholder={placeholder}
				defaultValue={defaultValue}
				disabled={false}
				smartUi={smartUi}
				smartEnum={smartEnum}
			/>

			{/* Help text / description */}
			{field.description && (
				<p className='text-muted-foreground text-xs'>{field.description}</p>
			)}
		</div>
	);
}

interface FieldInputProps {
	type: CellType;
	placeholder?: string;
	defaultValue?: string;
	disabled?: boolean;
	smartUi?: string;
	smartEnum?: string[];
}

function FieldInput({ type, placeholder, defaultValue, disabled, smartUi, smartEnum }: FieldInputProps) {
	// Map field types to appropriate input components
	switch (type) {
		case 'text': {
			if (smartUi === 'textarea') {
				return (
					<Textarea
						placeholder={placeholder}
						defaultValue={defaultValue}
						disabled={disabled}
						rows={4}
					/>
				);
			}

			if ((smartUi === 'select' || smartUi === 'radio' || (smartEnum?.length ?? 0) > 0) && smartEnum) {
				if (smartUi === 'radio') {
					return (
						<RadioGroup defaultValue={defaultValue} className='gap-2'>
							{smartEnum
								.filter((opt) => opt && opt.trim() !== '')
								.map((opt, idx) => (
									<div key={`${opt}-${idx}`} className='flex items-center gap-2'>
										<RadioGroupItem value={opt} id={`preview-radio-${opt}-${idx}`} disabled={disabled} />
										<Label htmlFor={`preview-radio-${opt}-${idx}`} className='text-sm font-normal'>
											{opt}
										</Label>
									</div>
								))}
						</RadioGroup>
					);
				}

				return (
					<Select defaultValue={defaultValue} disabled={disabled}>
						<SelectTrigger>
							<SelectValue placeholder={placeholder || 'Select an option'} />
						</SelectTrigger>
						<SelectContent>
							{smartEnum
								.filter((opt) => opt && opt.trim() !== '')
								.map((opt, idx) => (
									<SelectItem key={`${opt}-${idx}`} value={opt}>
										{opt}
									</SelectItem>
								))}
						</SelectContent>
					</Select>
				);
			}

			return (
				<Input type='text' placeholder={placeholder} defaultValue={defaultValue} disabled={disabled} />
			);
		}

		case 'citext':
		case 'bpchar':
			return (
				<Input
					type='text'
					placeholder={placeholder}
					defaultValue={defaultValue}
					disabled={disabled}
				/>
			);

		case 'textarea':
			return (
				<Textarea
					placeholder={placeholder}
					defaultValue={defaultValue}
					disabled={disabled}
					rows={4}
				/>
			);

		case 'email':
			return (
				<Input
					type='email'
					placeholder={placeholder || 'email@example.com'}
					defaultValue={defaultValue}
					disabled={disabled}
				/>
			);

		case 'phone':
			return (
				<Input
					type='tel'
					placeholder={placeholder || '+1 (555) 000-0000'}
					defaultValue={defaultValue}
					disabled={disabled}
				/>
			);

		case 'integer':
		case 'smallint':
		case 'number':
		case 'decimal':
			return (
				<Input
					type='number'
					placeholder={placeholder || '0'}
					defaultValue={defaultValue}
					disabled={disabled}
				/>
			);

		case 'boolean':
			return (
				<div className='flex items-center space-x-2'>
					<Checkbox
						id='preview-checkbox'
						defaultChecked={defaultValue === 'true'}
						disabled={disabled}
					/>
					<label
						htmlFor='preview-checkbox'
						className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
					>
						{placeholder || 'Yes'}
					</label>
				</div>
			);

		case 'date':
			return (
				<Input
					type='date'
					defaultValue={defaultValue}
					disabled={disabled}
				/>
			);

		case 'datetime':
			return (
				<Input
					type='datetime-local'
					defaultValue={defaultValue}
					disabled={disabled}
				/>
			);

		case 'timestamptz':
			return (
				<Input
					type='datetime-local'
					defaultValue={defaultValue}
					disabled={disabled}
				/>
			);

		case 'time':
			return (
				<Input
					type='time'
					defaultValue={defaultValue}
					disabled={disabled}
				/>
			);

		case 'text-array':
			// Render as a select/dropdown for arrays
			return (
				<Select defaultValue={defaultValue} disabled={disabled}>
					<SelectTrigger>
						<SelectValue placeholder={placeholder || 'Select an option'} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='option1'>Option 1</SelectItem>
						<SelectItem value='option2'>Option 2</SelectItem>
						<SelectItem value='option3'>Option 3</SelectItem>
					</SelectContent>
				</Select>
			);

		case 'json':
		case 'jsonb':
			return (
				<Textarea
					placeholder={placeholder || '{\n  "key": "value"\n}'}
					defaultValue={defaultValue}
					disabled={disabled}
					className='font-mono text-sm'
					rows={4}
				/>
			);

		case 'uuid':
			return (
				<Input
					type='text'
					placeholder={placeholder || 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'}
					defaultValue={defaultValue}
					disabled={disabled}
					className='font-mono'
				/>
			);

		case 'url':
			return (
				<Input
					type='url'
					placeholder={placeholder || 'https://example.com'}
					defaultValue={defaultValue}
					disabled={disabled}
				/>
			);

		// Long text / textarea types
		case 'interval':
			return (
				<Textarea
					placeholder={placeholder}
					defaultValue={defaultValue}
					disabled={disabled}
					rows={3}
				/>
			);

		case 'image':
		case 'file':
		case 'video':
		case 'audio':
		case 'upload':
			return (
				<div className='text-muted-foreground rounded-md border border-dashed p-3 text-sm'>
					Upload
				</div>
			);

		// Fallback for other types
		default:
			return (
				<Input
					type='text'
					placeholder={placeholder}
					defaultValue={defaultValue}
					disabled={disabled}
				/>
			);
	}
}

/**
 * Get a human-readable type label for display
 */
export function getElementTypeLabel(type: CellType): string {
	const typeLabels: Partial<Record<CellType, string>> = {
		text: 'Text',
		email: 'Email',
		integer: 'Number',
		number: 'Number',
		decimal: 'Decimal',
		boolean: 'Checkbox',
		date: 'Date',
		timestamptz: 'Date & Time',
		time: 'Time',
		'text-array': 'Dropdown',
		json: 'JSON',
		jsonb: 'JSON',
		url: 'URL',
		citext: 'Text',
	};

	return typeLabels[type] || type;
}
