'use client';

import { forwardRef } from 'react';

import { BaseFormFieldProps } from '@/lib/form-registry/types';
import { cn } from '@/lib/utils';
import { Field } from '@constructive-io/ui/field';
import { InputGroup, InputGroupInput } from '@constructive-io/ui/input-group';

export interface DateFieldProps extends BaseFormFieldProps {
	type?: 'date' | 'datetime-local' | 'time';
	min?: string;
	max?: string;
	showTime?: boolean;
	format?: string;
}

export const DateField = forwardRef<HTMLInputElement, DateFieldProps>(
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
			type = 'date',
			min,
			max,
			showTime = false,
			fieldType: _fieldType,
			format: _format,
			field: _field,
			metadata,
			validation: _validation,
			...props
		},
		ref,
	) => {
		// Determine input type based on showTime prop or metadata
		const inputType = showTime ? 'datetime-local' : metadata?.inputType || type;

		// Format value for input
		const formatValue = (val: any): string => {
			if (!val) return '';

			if (val instanceof Date) {
				if (inputType === 'datetime-local') {
					// Format as YYYY-MM-DDTHH:MM for datetime-local input
					return val.toISOString().slice(0, 16);
				} else if (inputType === 'time') {
					// Format as HH:MM for time input
					return val.toISOString().slice(11, 16);
				} else {
					// Format as YYYY-MM-DD for date input
					return val.toISOString().slice(0, 10);
				}
			}

			if (typeof val === 'string') {
				// Handle ISO string dates
				if (val.includes('T')) {
					const date = new Date(val);
					if (!isNaN(date.getTime())) {
						if (inputType === 'datetime-local') {
							return date.toISOString().slice(0, 16);
						} else if (inputType === 'time') {
							return date.toISOString().slice(11, 16);
						} else {
							return date.toISOString().slice(0, 10);
						}
					}
				}
				return val;
			}

			return String(val);
		};

		// Parse input value back to appropriate format
		const parseValue = (inputValue: string): Date | string | null => {
			if (!inputValue) return null;

			try {
				if (inputType === 'datetime-local') {
					// Parse datetime-local format (YYYY-MM-DDTHH:MM)
					return new Date(inputValue);
				} else if (inputType === 'time') {
					// For time input, create a date with today's date
					const today = new Date();
					const [hours, minutes] = inputValue.split(':').map(Number);
					const timeDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
					return timeDate;
				} else {
					// Parse date format (YYYY-MM-DD)
					const date = new Date(inputValue + 'T00:00:00');
					return date;
				}
			} catch {
				return inputValue; // Return as string if parsing fails
			}
		};

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const inputValue = e.target.value;
			const parsedValue = parseValue(inputValue);
			onChange(parsedValue);
		};

		const displayValue = formatValue(value);

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
						value={displayValue}
						onChange={handleChange}
						onBlur={onBlur}
						placeholder={placeholder}
						disabled={disabled}
						required={required}
						min={min}
						max={max}
						aria-invalid={!!error}
						className={cn(error && 'border-destructive focus-visible:ring-destructive')}
						{...props}
					/>
				</InputGroup>
			</Field>
		);
	},
);

DateField.displayName = 'DateField';
