'use client';

import { forwardRef } from 'react';

import { BaseFormFieldProps } from '@/lib/form-registry/types';
import { cn } from '@/lib/utils';
import { Checkbox } from '@constructive-io/ui/checkbox';
import { FieldRow } from '@constructive-io/ui/field';
import { Switch } from '@constructive-io/ui/switch';

export interface BooleanFieldProps extends BaseFormFieldProps {
	variant?: 'switch' | 'checkbox';
	size?: 'sm' | 'md' | 'lg';
	labelPosition?: 'left' | 'right';
}

export const BooleanField = forwardRef<HTMLButtonElement, BooleanFieldProps>(
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
			description,
			className,
			variant = 'switch',
			size: _size = 'md',
			labelPosition = 'right',
			fieldType: _fieldType,
			field: _field,
			metadata: _metadata,
			validation: _validation,
			...props
		},
		ref,
	) => {
		const booleanValue = Boolean(value);

		const handleChange = (checked: boolean) => {
			onChange(checked);
		};

		const control = variant === 'checkbox' ? (
			<Checkbox
				ref={ref}
				name={name}
				checked={booleanValue}
				onCheckedChange={handleChange}
				onBlur={onBlur}
				disabled={disabled}
				required={required}
				aria-invalid={!!error}
				className={cn(error && 'border-destructive data-[state=checked]:bg-destructive')}
				{...props}
			/>
		) : (
			<Switch
				ref={ref}
				name={name}
				checked={booleanValue}
				onCheckedChange={handleChange}
				onBlur={onBlur}
				disabled={disabled}
				required={required}
				aria-invalid={!!error}
				className={cn(error && 'border-destructive data-[state=checked]:bg-destructive')}
				{...props}
			/>
		);

		return (
			<FieldRow
				label={`${label}${required ? ' *' : ''}`}
				description={description}
				error={error}
				labelPosition={labelPosition === 'left' ? 'start' : 'end'}
				className={className}
			>
				{control}
			</FieldRow>
		);
	},
);

BooleanField.displayName = 'BooleanField';
