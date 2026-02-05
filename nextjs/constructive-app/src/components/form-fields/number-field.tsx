'use client';

import { forwardRef } from 'react';

import { BaseFormFieldProps, EnhancedFormFieldProps } from '@/lib/form-registry/types';
import { cn } from '@/lib/utils';
import { Field } from '@constructive-io/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@constructive-io/ui/input-group';

export interface NumberFieldProps extends BaseFormFieldProps {
	type?: 'integer' | 'number' | 'decimal' | 'currency' | 'percentage';
	min?: number;
	max?: number;
	step?: number;
	precision?: number;
	prefix?: string;
	suffix?: string;
	allowNegative?: boolean;
	thousandSeparator?: string;
	decimalSeparator?: string;
}

// Enhanced version that uses metadata
export interface EnhancedNumberFieldProps extends EnhancedFormFieldProps {
	type?: 'integer' | 'number' | 'decimal' | 'currency' | 'percentage';
	min?: number;
	max?: number;
	step?: number;
	precision?: number;
	prefix?: string;
	suffix?: string;
	allowNegative?: boolean;
	thousandSeparator?: string;
	decimalSeparator?: string;
}

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps | EnhancedNumberFieldProps>(
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
			type = 'number',
			min,
			max,
			step,
			precision,
			prefix,
			suffix,
			allowNegative = true,
			thousandSeparator,
			decimalSeparator = '.',
			fieldType: _fieldType,
			field: _field,
			metadata,
			validation: _validation,
			...props
		},
		ref,
	) => {
		// Use metadata values when props are not provided
		const effectiveMin = min !== undefined ? min : metadata?.min;
		const effectiveMax = max !== undefined ? max : metadata?.max;
		const effectiveStep = step !== undefined ? step : metadata?.step;

		// Format number for display
		const formatValue = (val: any): string => {
			if (val === null || val === undefined || val === '') {
				return '';
			}

			const numValue = typeof val === 'string' ? parseFloat(val) : val;

			if (isNaN(numValue)) {
				return '';
			}

			let formatted = numValue.toString();

			// Handle precision
			if (precision !== undefined) {
				formatted = numValue.toFixed(precision);
			}

			// Handle thousand separator
			if (thousandSeparator) {
				const parts = formatted.split('.');
				parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
				formatted = parts.join(decimalSeparator);
			}

			// Handle decimal separator
			if (decimalSeparator !== '.') {
				formatted = formatted.replace('.', decimalSeparator);
			}

			return formatted;
		};

		// Parse input value
		const parseValue = (inputValue: string): number | null => {
			if (!inputValue || inputValue === '') {
				return null;
			}

			let cleanValue = inputValue;

			// Handle thousand separator
			if (thousandSeparator) {
				cleanValue = cleanValue.replace(new RegExp(`\\${thousandSeparator}`, 'g'), '');
			}

			// Handle decimal separator
			if (decimalSeparator !== '.') {
				cleanValue = cleanValue.replace(decimalSeparator, '.');
			}

			const numValue = parseFloat(cleanValue);

			if (isNaN(numValue)) {
				return null;
			}

			// Handle type-specific parsing
			switch (type) {
				case 'integer':
					return Math.round(numValue);
				case 'percentage':
					return numValue / 100;
				default:
					return numValue;
			}
		};

		// Handle input change
		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const inputValue = e.target.value;
			const parsedValue = parseValue(inputValue);

			// Validate range
			if (parsedValue !== null) {
				if (min !== undefined && parsedValue < min) {
					return;
				}
				if (max !== undefined && parsedValue > max) {
					return;
				}
				if (!allowNegative && parsedValue < 0) {
					return;
				}
			}

			onChange(parsedValue);
		};

		// Get display value (without prefix/suffix - those are now addons)
		const displayValue = formatValue(value);

		// Get input type and attributes
		const inputStep = effectiveStep !== undefined ? effectiveStep : type === 'integer' ? 1 : 'any';

		return (
			<Field
				label={label}
				description={description}
				error={error}
				required={required}
				className={className}
			>
				<InputGroup>
					{prefix && (
						<InputGroupAddon>
							<InputGroupText>{prefix}</InputGroupText>
						</InputGroupAddon>
					)}
					<InputGroupInput
						ref={ref}
						name={name}
						type='number'
						value={displayValue}
						onChange={handleChange}
						onBlur={onBlur}
						placeholder={placeholder}
						disabled={disabled}
						required={required}
						min={effectiveMin}
						max={effectiveMax}
						step={inputStep}
						aria-invalid={!!error}
						className={cn(error && 'border-destructive focus-visible:ring-destructive')}
						{...props}
					/>
					{suffix && (
						<InputGroupAddon align='inline-end'>
							<InputGroupText>{suffix}</InputGroupText>
						</InputGroupAddon>
					)}
				</InputGroup>
			</Field>
		);
	},
);

NumberField.displayName = 'NumberField';
