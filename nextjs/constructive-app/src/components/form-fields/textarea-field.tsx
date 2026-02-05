'use client';

import { forwardRef } from 'react';

import { BaseFormFieldProps, EnhancedFormFieldProps } from '@/lib/form-registry/types';
import { cn } from '@/lib/utils';
import { Field } from '@constructive-io/ui/field';
import { InputGroup, InputGroupTextarea } from '@constructive-io/ui/input-group';

export interface TextareaFieldProps extends BaseFormFieldProps {
	rows?: number;
	cols?: number;
	maxLength?: number;
	minLength?: number;
	resize?: 'none' | 'vertical' | 'horizontal' | 'both';
	spellCheck?: boolean;
	wrap?: 'hard' | 'soft' | 'off';
	autoComplete?: string;
}

// Enhanced version that uses metadata
export interface EnhancedTextareaFieldProps extends EnhancedFormFieldProps {
	rows?: number;
	cols?: number;
	maxLength?: number;
	minLength?: number;
	resize?: 'none' | 'vertical' | 'horizontal' | 'both';
	spellCheck?: boolean;
	wrap?: 'hard' | 'soft' | 'off';
	autoComplete?: string;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps | EnhancedTextareaFieldProps>(
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
			rows = 4,
			cols,
			maxLength,
			minLength,
			resize = 'vertical',
			spellCheck,
			wrap = 'soft',
			autoComplete,
			fieldType: _fieldType,
			field: _field,
			metadata,
			validation: _validation,
			...props
		},
		ref,
	) => {
		// Use metadata values when props are not provided
		const effectiveRows = rows !== 4 ? rows : metadata?.rows || 4;
		const textareaValue = typeof value === 'string' ? value : value?.toString() || '';

		// Build description with character count if maxLength is set
		const descriptionWithCount = maxLength
			? `${description ? `${description} ` : ''}${String(textareaValue).length}/${maxLength} characters`
			: description;

		return (
			<Field
				label={label}
				description={descriptionWithCount}
				error={error}
				required={required}
				className={className}
			>
				<InputGroup>
					<InputGroupTextarea
						ref={ref}
						name={name}
						value={textareaValue}
						onChange={(e) => onChange(e.target.value)}
						onBlur={onBlur}
						placeholder={placeholder}
						disabled={disabled}
						required={required}
						rows={effectiveRows}
						cols={cols}
						maxLength={maxLength}
						minLength={minLength}
						spellCheck={spellCheck}
						wrap={wrap}
						autoComplete={autoComplete}
						aria-invalid={!!error}
						className={cn(
							error && 'border-destructive focus-visible:ring-destructive',
							{
								'resize-none': resize === 'none',
								'resize-y': resize === 'vertical',
								'resize-x': resize === 'horizontal',
								resize: resize === 'both',
							},
						)}
						{...props}
					/>
				</InputGroup>
			</Field>
		);
	},
);

TextareaField.displayName = 'TextareaField';
