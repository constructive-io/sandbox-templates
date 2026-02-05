'use client';

import React, { ComponentType, useCallback } from 'react';

import { BaseCellProps } from '@/lib/cell-registry/types';
import { CellType, CellValue } from '@/lib/types/cell-types';
import { cn } from '@/lib/utils';
import { Label } from '@constructive-io/ui/label';

import { BaseFormFieldProps } from './types';

/**
 * Wrapper that adapts cell components for use as form input fields
 * This bridges the gap between display-focused cell components and form input requirements
 */
export class CellFormWrapper {
	/**
	 * Create a form-compatible wrapper around a cell component
	 */
	static createFormWrapper(
		CellComponent: ComponentType<BaseCellProps>,
		cellType: CellType,
	): ComponentType<BaseFormFieldProps> {
		const FormWrapper: ComponentType<BaseFormFieldProps> = ({
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
		}) => {
			// Create a mock column schema for the cell component
			const mockColumn = {
				id: name,
				name,
				type: cellType,
				nullable: !required,
				metadata: {
					label,
					description,
					placeholder,
					required,
				},
			};

			// Handle value changes from cell component
			const handleCellChange = useCallback(
				(newValue: CellValue) => {
					onChange(newValue);
				},
				[onChange],
			);

			// Handle cell save (equivalent to blur for forms)
			const handleCellSave = useCallback(() => {
				if (onBlur) {
					onBlur();
				}
			}, [onBlur]);

			// Determine if we should render in editing mode
			const shouldEdit = this.shouldRenderAsEditable(cellType);

			return (
				<div className={cn('space-y-2', className)}>
					{/* Form field label */}
					<Label htmlFor={name} className={cn(error && 'text-destructive')}>
						{label}
						{required && <span className='text-destructive ml-1'>*</span>}
					</Label>

					{/* Description */}
					{description && <p className='text-muted-foreground text-sm'>{description}</p>}

					{/* Cell component wrapper */}
					<div
						className={cn(
							'form-cell-wrapper',
							shouldEdit && 'editing-mode',
							error && 'error-state',
							disabled && 'disabled-state',
						)}
					>
						<CellComponent
							value={value}
							column={mockColumn}
							rowId='form-input'
							isEditing={shouldEdit}
							onChange={handleCellChange}
							onSave={handleCellSave}
							onCancel={() => {}} // No cancel in forms
							disabled={disabled}
							className={cn('w-full', error && 'border-destructive focus-visible:ring-destructive')}
						/>
					</div>

					{/* Error message */}
					{error && (
						<p className='text-destructive text-sm' role='alert'>
							{error}
						</p>
					)}
				</div>
			);
		};

		FormWrapper.displayName = `FormWrapper(${CellComponent.displayName || CellComponent.name || 'Cell'})`;
		return FormWrapper;
	}

	/**
	 * Determine if a cell type should render in editing mode for forms
	 */
	private static shouldRenderAsEditable(cellType: CellType): boolean {
		// These types work better when always in editing mode for forms
		const alwaysEditableTypes: CellType[] = [
			'text',
			'textarea',
			'email',
			'url',
			'phone',
			'citext',
			'bpchar',
			'number',
			'integer',
			'smallint',
			'decimal',
			'currency',
			'percentage',
			'date',
			'datetime',
			'time',
			'timestamptz',
			'interval',
			'boolean',
			'toggle',
			'bit',
			'json',
			'jsonb',
			'array',
			'text-array',
			'uuid-array',
			'number-array',
			'integer-array',
			'date-array',
			'inet',
			'uuid',
			'color',
			'rating',
			'tags',
			'tsvector',
			'origin',
		];

		return alwaysEditableTypes.includes(cellType);
	}
}

/**
 * Enhanced form wrapper for complex cell types that need special handling
 */
export class EnhancedFormWrapper extends CellFormWrapper {
	/**
	 * Create enhanced wrapper with additional form-specific features
	 */
	static createEnhancedWrapper(
		CellComponent: ComponentType<BaseCellProps>,
		cellType: CellType,
		options?: {
			customValidator?: (value: CellValue) => string | undefined;
			customFormatter?: (value: CellValue) => string;
			customParser?: (input: string) => CellValue;
			formSpecificProps?: Record<string, any>;
		},
	): ComponentType<BaseFormFieldProps> {
		const { formSpecificProps = {} } = options || {};

		const EnhancedWrapper: ComponentType<BaseFormFieldProps> = (props) => {
			// Apply form-specific transformations
			const enhancedProps = {
				...props,
				...formSpecificProps,
			};

			// Use base wrapper but with enhanced functionality
			const BaseWrapper = this.createFormWrapper(CellComponent, cellType);

			return <BaseWrapper {...enhancedProps} />;
		};

		EnhancedWrapper.displayName = `EnhancedFormWrapper(${CellComponent.displayName || cellType})`;
		return EnhancedWrapper;
	}
}

/**
 * Specialized wrapper for geometry types that need form-specific handling
 */
export function GeometryFormWrapper(props: BaseFormFieldProps) {
	const { name, label, value, onChange, error, required, disabled, description } = props;

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			try {
				const parsed = JSON.parse(e.target.value);
				onChange(parsed);
			} catch {
				// Keep the raw string value for the user to fix
				onChange(e.target.value);
			}
		},
		[onChange],
	);

	const formattedValue = React.useMemo(() => {
		if (typeof value === 'string') return value;
		if (value && typeof value === 'object') {
			return JSON.stringify(value, null, 2);
		}
		return '';
	}, [value]);

	return (
		<div className='space-y-2'>
			<Label htmlFor={name} className={cn(error && 'text-destructive')}>
				{label}
				{required && <span className='text-destructive ml-1'>*</span>}
			</Label>

			{description && <p className='text-muted-foreground text-sm'>{description}</p>}

			<textarea
				id={name}
				value={formattedValue}
				onChange={handleChange}
				disabled={disabled}
				className={cn(
					'min-h-[120px] w-full rounded-md border p-3 font-mono text-sm',
					'focus:ring-ring focus:border-transparent focus:ring-2 focus:outline-none',
					error && 'border-destructive focus:ring-destructive',
					disabled && 'cursor-not-allowed opacity-50',
				)}
				placeholder='{"type": "Point", "coordinates": [0, 0]}'
				rows={6}
			/>

			{error && (
				<p className='text-destructive text-sm' role='alert'>
					{error}
				</p>
			)}
		</div>
	);
}

/**
 * Specialized wrapper for relation types that need form-specific handling
 */
export function RelationFormWrapper(props: BaseFormFieldProps) {
	const { name, label, value, error, required, disabled, description } = props;

	const displayValue = React.useMemo(() => {
		if (value === null || value === undefined) return '';
		if (Array.isArray(value)) return `${value.length} related records`;
		if (typeof value === 'object') return 'Related record';
		return String(value);
	}, [value]);

	return (
		<div className='space-y-2'>
			<Label htmlFor={name} className={cn(error && 'text-destructive')}>
				{label}
				{required && <span className='text-destructive ml-1'>*</span>}
			</Label>

			{description && <p className='text-muted-foreground text-sm'>{description}</p>}

			<div className={cn('bg-muted rounded-md p-3', disabled && 'cursor-not-allowed opacity-50')} aria-disabled={disabled}>
				<p className='text-muted-foreground text-sm'>{displayValue}</p>
				<p className='text-muted-foreground mt-1 text-xs'>Relation editing is not yet supported in forms</p>
			</div>

			{error && (
				<p className='text-destructive text-sm' role='alert'>
					{error}
				</p>
			)}
		</div>
	);
}
