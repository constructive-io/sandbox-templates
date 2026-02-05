'use client';

import { useMemo } from 'react';

import { Badge } from '@constructive-io/ui/badge';
import { Input } from '@constructive-io/ui/input';
import { Label } from '@constructive-io/ui/label';

import { cn } from '@/lib/utils';

import type { FieldDataType } from './access-model-types';

interface NewFieldInputProps {
	fieldKey: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	type: FieldDataType;
	description?: string;
	existingFieldNames?: string[];
	required?: boolean;
	placeholder?: string;
}

const RESERVED_POSTGRES_WORDS = new Set([
	'id',
	'created_at',
	'updated_at',
	'deleted_at',
	'select',
	'insert',
	'update',
	'delete',
	'from',
	'where',
	'table',
	'index',
	'primary',
	'foreign',
	'key',
	'constraint',
	'null',
	'not',
	'and',
	'or',
]);

function validateFieldName(
	name: string,
	existingNames: string[],
): { valid: boolean; error?: string } {
	const trimmed = name.trim();

	if (!trimmed) {
		return { valid: false, error: 'Field name is required' };
	}

	if (!/^[a-z_][a-z0-9_]*$/i.test(trimmed)) {
		return { valid: false, error: 'Use letters, numbers, and underscores only' };
	}

	if (trimmed.length > 63) {
		return { valid: false, error: 'Field name too long (max 63 characters)' };
	}

	const lowerName = trimmed.toLowerCase();
	if (existingNames.map((n) => n.toLowerCase()).includes(lowerName)) {
		return { valid: false, error: 'Field name already exists' };
	}

	if (RESERVED_POSTGRES_WORDS.has(lowerName)) {
		return { valid: false, error: 'Reserved word - choose another name' };
	}

	return { valid: true };
}

export function NewFieldInput({
	fieldKey,
	label,
	value,
	onChange,
	type,
	description,
	existingFieldNames = [],
	required = true,
	placeholder,
}: NewFieldInputProps) {
	const validation = useMemo(
		() => validateFieldName(value, existingFieldNames),
		[value, existingFieldNames],
	);

	const showError = value.length > 0 && !validation.valid;
	const typeLabel = type === 'uuid[]' ? 'uuid[]' : 'uuid';

	return (
		<div className='space-y-1.5'>
			<div className='flex items-center justify-between'>
				<Label htmlFor={fieldKey}>
					{label}
					{required && <span className='text-destructive ml-0.5'>*</span>}
				</Label>
				<Badge variant='secondary' className='font-mono text-[10px]'>
					{typeLabel}
				</Badge>
			</div>

			<Input
				id={fieldKey}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				autoComplete='off'
				className={cn('font-mono', showError && 'border-destructive')}
			/>

			{showError && <p className='text-destructive text-xs'>{validation.error}</p>}

			{description && !showError && (
				<p className='text-muted-foreground text-xs'>{description}</p>
			)}
		</div>
	);
}

export function useFieldNameValidation(
	fieldNames: Record<string, string>,
	existingTableFieldNames: string[] = [],
): { allValid: boolean; errors: Record<string, string> } {
	return useMemo(() => {
		const errors: Record<string, string> = {};
		const usedNames: string[] = [...existingTableFieldNames];

		for (const [key, name] of Object.entries(fieldNames)) {
			const validation = validateFieldName(name, usedNames);
			if (!validation.valid && validation.error) {
				errors[key] = validation.error;
			} else {
				usedNames.push(name);
			}
		}

		return {
			allValid: Object.keys(errors).length === 0,
			errors,
		};
	}, [fieldNames, existingTableFieldNames]);
}
