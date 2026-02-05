'use client';

import { forwardRef } from 'react';

import { BaseFormFieldProps, EnhancedFormFieldProps } from '@/lib/form-registry/types';
import { cn } from '@/lib/utils';
import { Field } from '@constructive-io/ui/field';
import { InputGroup, InputGroupInput } from '@constructive-io/ui/input-group';

export interface TextFieldProps extends BaseFormFieldProps {
	type?: 'text' | 'email' | 'url' | 'tel' | 'search' | 'color';
	autoComplete?: string;
	maxLength?: number;
	minLength?: number;
	pattern?: string;
	spellCheck?: boolean;
}

// Enhanced version that uses metadata
export interface EnhancedTextFieldProps extends EnhancedFormFieldProps {
	type?: 'text' | 'email' | 'url' | 'tel' | 'search' | 'color';
	autoComplete?: string;
	maxLength?: number;
	minLength?: number;
	pattern?: string;
	spellCheck?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps | EnhancedTextFieldProps>(
	(
		{
			name,
			label,
			value,
			onChange,
			onBlur,
			error,
			required = false,
			disabled = false,
			placeholder,
			description,
			className,
			type = 'text',
			autoComplete,
			maxLength,
			minLength,
			pattern,
			spellCheck,
			fieldType: _fieldType,
			field: _field,
			metadata,
			validation: _validation,
			...props
		},
		ref,
	) => {
		// Use metadata to determine input type if not explicitly provided
		const inputType = type !== 'text' ? type : (metadata?.inputType as any) || 'text';

		return (
			<Field
				label={label}
				description={description}
				error={error}
				required={required}
				className={className}
			>
				<InputGroup>
					<InputGroupInput
						ref={ref}
						name={name}
						type={inputType}
						value={typeof value === 'string' ? value : value?.toString() || ''}
						onChange={(e) => onChange(e.target.value)}
						onBlur={onBlur}
						placeholder={placeholder}
						disabled={disabled}
						required={required}
						autoComplete={autoComplete}
						maxLength={maxLength}
						minLength={minLength}
						pattern={pattern}
						spellCheck={spellCheck}
						aria-invalid={!!error}
						className={cn(error && 'border-destructive focus-visible:ring-destructive')}
						{...props}
					/>
				</InputGroup>
			</Field>
		);
	},
);

TextField.displayName = 'TextField';
