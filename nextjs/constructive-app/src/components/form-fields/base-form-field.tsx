'use client';

import { forwardRef, ReactNode } from 'react';

import { BaseFormFieldProps } from '@/lib/form-registry/types';
import { cn } from '@/lib/utils';
import { Label } from '@constructive-io/ui/label';

export interface BaseFormFieldWrapperProps extends Omit<BaseFormFieldProps, 'value' | 'onChange'> {
	children: ReactNode;
	labelClassName?: string;
	descriptionClassName?: string;
	errorClassName?: string;
	containerClassName?: string;
	showCharacterCount?: boolean;
	maxLength?: number;
	currentLength?: number;
}

export const BaseFormFieldWrapper = forwardRef<HTMLDivElement, BaseFormFieldWrapperProps>(
	(
		{
			name,
			label,
			error,
			required = false,
			description,
			className,
			labelClassName,
			descriptionClassName,
			errorClassName,
			containerClassName,
			showCharacterCount = false,
			maxLength,
			currentLength = 0,
			children,
			...props
		},
		ref,
	) => {
		const id = `field-${name}`;

		return (
			<div ref={ref} className={cn('grid gap-2', containerClassName)} {...props}>
				{/* Label */}
				<Label htmlFor={id} className={cn(error && 'text-destructive', labelClassName)}>
					{label}
					{required && (
						<span className='text-destructive ml-1' aria-label='required'>
							*
						</span>
					)}
				</Label>

				{/* Input Field (passed as children) */}
				<div className={cn('relative', className)}>{children}</div>

				{/* Character Count */}
				{showCharacterCount && maxLength && (
					<div id={`${id}-count`} className='text-muted-foreground flex justify-between text-xs' aria-live='polite'>
						<span>
							{currentLength}/{maxLength} characters
						</span>
					</div>
				)}

				{/* Description */}
				{description && (
					<p id={`${id}-description`} className={cn('text-muted-foreground text-sm', descriptionClassName)}>
						{description}
					</p>
				)}

				{/* Error Message */}
				{error && (
					<p
						id={`${id}-error`}
						className={cn('text-destructive text-sm', errorClassName)}
						role='alert'
						aria-live='polite'
					>
						{error}
					</p>
				)}
			</div>
		);
	},
);

BaseFormFieldWrapper.displayName = 'BaseFormFieldWrapper';

// Hook for consistent field props and utilities
export const useFormFieldProps = (props: BaseFormFieldProps) => {
	const { name, required, error, disabled } = props;
	const id = `field-${name}`;

	const describedBy = [props.description ? `${id}-description` : '', error ? `${id}-error` : '']
		.filter(Boolean)
		.join(' ');

	const fieldProps = {
		id,
		name,
		required,
		disabled,
		'aria-describedby': describedBy || undefined,
		'aria-invalid': !!error,
		className: cn(error && 'border-destructive focus-visible:ring-destructive', 'transition-colors'),
	};

	return {
		id,
		describedBy,
		fieldProps,
		hasError: !!error,
		isRequired: required,
	};
};

// Utility for handling common input change patterns
export const createInputChangeHandler = (onChange: (value: any) => void, transform?: (value: string) => any) => {
	return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const value = e.target.value;
		onChange(transform ? transform(value) : value);
	};
};

// Utility for handling common validation patterns
export const validateRequired = (value: any, fieldName: string): string | undefined => {
	if (value === null || value === undefined || value === '') {
		return `${fieldName} is required`;
	}
	return undefined;
};

export const validateLength = (value: string, minLength?: number, maxLength?: number): string | undefined => {
	if (minLength && value.length < minLength) {
		return `Must be at least ${minLength} characters`;
	}
	if (maxLength && value.length > maxLength) {
		return `Must be no more than ${maxLength} characters`;
	}
	return undefined;
};

export const validatePattern = (value: string, pattern: RegExp, message: string): string | undefined => {
	if (value && !pattern.test(value)) {
		return message;
	}
	return undefined;
};

// Common field metadata
export const FIELD_WIDTHS = {
	full: 'full',
	half: 'half',
	third: 'third',
	quarter: 'quarter',
} as const;

export const FIELD_CATEGORIES = {
	text: 'text',
	number: 'number',
	boolean: 'boolean',
	date: 'date',
	json: 'json',
	array: 'array',
	media: 'media',
	special: 'special',
} as const;

export type FieldWidth = (typeof FIELD_WIDTHS)[keyof typeof FIELD_WIDTHS];
export type FieldCategory = (typeof FIELD_CATEGORIES)[keyof typeof FIELD_CATEGORIES];
