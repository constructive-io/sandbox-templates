'use client';

import { forwardRef, useMemo, useState } from 'react';
import { RiCloseLine, RiSearch2Line } from '@remixicon/react';

import { BaseFormFieldProps } from '@/lib/form-registry/types';
import { cn } from '@/lib/utils';
import { Button } from '@constructive-io/ui/button';
import { Field } from '@constructive-io/ui/field';
import { Input } from '@constructive-io/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@constructive-io/ui/select';

export interface SelectOption {
	value: string | number;
	label: string;
	disabled?: boolean;
	description?: string;
}

export interface SelectFieldProps extends BaseFormFieldProps {
	options: SelectOption[];
	multiple?: boolean;
	searchable?: boolean;
	clearable?: boolean;
	loading?: boolean;
	loadOptions?: (inputValue: string) => Promise<SelectOption[]>;
	maxSelectedItems?: number;
	emptyMessage?: string;
	searchPlaceholder?: string;
}

export const SelectField = forwardRef<HTMLButtonElement, SelectFieldProps>(
	(
		{
			name,
			label,
			value,
			onChange,
			onBlur: _onBlur,
			error,
			required = false,
			disabled = false,
			placeholder,
			description,
			className,
			options = [],
			multiple = false,
			searchable = false,
			clearable = false,
			loading = false,
			loadOptions,
			maxSelectedItems,
			emptyMessage = 'No options available',
			searchPlaceholder = 'Search...',
			fieldType: _fieldType,
			field: _field,
			...props
		},
		ref,
	) => {
		const [searchValue, setSearchValue] = useState('');
		const [_isOpen, setIsOpen] = useState(false);
		const [asyncOptions, setAsyncOptions] = useState<SelectOption[]>([]);

		// Normalize value for consistency
		const normalizedValue = useMemo(() => {
			if (multiple) {
				return Array.isArray(value) ? value : value ? [value] : [];
			}
			return value;
		}, [value, multiple]);

		// Filter options based on search
		const filteredOptions = useMemo(() => {
			const baseOptions = loadOptions ? asyncOptions : options;

			if (!searchable || !searchValue) {
				return baseOptions;
			}

			return baseOptions.filter(
				(option) =>
					option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
					option.value.toString().toLowerCase().includes(searchValue.toLowerCase()),
			);
		}, [options, asyncOptions, searchValue, searchable, loadOptions]);

		// Handle async option loading
		const handleSearch = async (inputValue: string) => {
			if (loadOptions) {
				try {
					const newOptions = await loadOptions(inputValue);
					setAsyncOptions(newOptions);
				} catch (error) {
					console.error('Error loading options:', error);
				}
			}
		};

		// Handle selection change
		const handleSelectionChange = (selectedValue: string) => {
			if (multiple) {
				const currentValues = Array.isArray(normalizedValue) ? normalizedValue : [];
				const newValues = currentValues.includes(selectedValue)
					? currentValues.filter((v) => v !== selectedValue)
					: [...currentValues, selectedValue];

				// Check max selected items
				if (maxSelectedItems && newValues.length > maxSelectedItems) {
					return;
				}

				onChange(newValues);
			} else {
				onChange(selectedValue);
				setIsOpen(false);
			}
		};

		// Clear selection
		const handleClear = () => {
			onChange(multiple ? [] : null);
		};

		// Remove individual item (for multiple selection)
		const handleRemoveItem = (itemValue: string | number) => {
			if (multiple && Array.isArray(normalizedValue)) {
				const newValues = normalizedValue.filter((v) => v !== itemValue);
				onChange(newValues);
			}
		};

		// Get display value
		const getDisplayValue = () => {
			if (multiple && Array.isArray(normalizedValue)) {
				if (normalizedValue.length === 0) return placeholder || 'Select options...';
				if (normalizedValue.length === 1) {
					const option = options.find((opt) => opt.value === normalizedValue[0]);
					return option?.label || normalizedValue[0];
				}
				return `${normalizedValue.length} selected`;
			}

			const option = options.find((opt) => opt.value === normalizedValue);
			return option?.label || placeholder || 'Select an option...';
		};

		// Render multiple selection badges
		const renderSelectedItems = () => {
			if (!multiple || !Array.isArray(normalizedValue) || normalizedValue.length === 0) {
				return null;
			}

			return (
				<div className='mt-2 flex flex-wrap gap-1'>
					{normalizedValue.map((val) => {
						const option = options.find((opt) => opt.value === val);
						return (
							<div
								key={val}
								className='bg-secondary text-secondary-foreground flex items-center gap-1 rounded-md px-2 py-1 text-xs'
							>
								<span>{option?.label || val}</span>
								<Button
									type='button'
									variant='ghost'
									size='sm'
									className='hover:bg-secondary-foreground/20 h-3 w-3 p-0'
									onClick={() => handleRemoveItem(val)}
									disabled={disabled}
								>
									<RiCloseLine className='h-2 w-2' />
								</Button>
							</div>
						);
					})}
				</div>
			);
		};

		return (
			<Field
				label={label}
				description={description}
				error={error}
				required={required}
				className={className}
			>
				<Select
					value={multiple ? undefined : (normalizedValue as string)}
					onValueChange={handleSelectionChange}
					onOpenChange={setIsOpen}
					disabled={disabled}
					required={required}
				>
					<SelectTrigger
						ref={ref}
						className={cn(error && 'border-destructive focus:ring-destructive')}
						aria-invalid={!!error}
						{...props}
					>
						<SelectValue placeholder={getDisplayValue()} />
						{clearable && normalizedValue !== null && normalizedValue !== undefined && (
							<Button
								type='button'
								variant='ghost'
								size='sm'
								className='hover:bg-secondary-foreground/20 h-4 w-4 p-0'
								onClick={(e) => {
									e.stopPropagation();
									handleClear();
								}}
								disabled={disabled}
							>
								<RiCloseLine className='h-3 w-3' />
							</Button>
						)}
					</SelectTrigger>

					<SelectContent>
						{searchable && (
							<div className='flex items-center border-b px-3 py-2'>
								<RiSearch2Line className='text-muted-foreground mr-2 h-4 w-4' />
								<Input
									placeholder={searchPlaceholder}
									value={searchValue}
									onChange={(e) => {
										setSearchValue(e.target.value);
										if (loadOptions) {
											handleSearch(e.target.value);
										}
									}}
									className='border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0'
								/>
							</div>
						)}

						{loading && (
							<div className='flex items-center justify-center py-6'>
								<div className='text-muted-foreground text-sm'>Loading...</div>
							</div>
						)}

						{!loading && filteredOptions.length === 0 && (
							<div className='flex items-center justify-center py-6'>
								<div className='text-muted-foreground text-sm'>{emptyMessage}</div>
							</div>
						)}

						{!loading &&
							filteredOptions.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value.toString()}
									disabled={option.disabled}
									className={cn(
										multiple && Array.isArray(normalizedValue) && normalizedValue.includes(option.value)
											? 'bg-accent text-accent-foreground'
											: '',
									)}
								>
									<div className='flex w-full items-center justify-between'>
										<div className='flex flex-col'>
											<span>{option.label}</span>
											{option.description && (
												<span className='text-muted-foreground text-xs'>{option.description}</span>
											)}
										</div>
										{multiple && Array.isArray(normalizedValue) && normalizedValue.includes(option.value) && (
											<span className='text-primary text-xs'>✓</span>
										)}
									</div>
								</SelectItem>
							))}
					</SelectContent>
				</Select>

				{renderSelectedItems()}
			</Field>
		);
	},
);

SelectField.displayName = 'SelectField';
