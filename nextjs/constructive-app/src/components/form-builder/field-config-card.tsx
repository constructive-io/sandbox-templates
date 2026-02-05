'use client';

import type { ComponentType } from 'react';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { Button } from '@constructive-io/ui/button';
import {
	Combobox,
	ComboboxCollection,
	ComboboxEmpty,
	ComboboxGroup,
	ComboboxGroupLabel,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxPopup,
	ComboboxSeparator,
} from '@constructive-io/ui/combobox';
import { Input } from '@constructive-io/ui/input';
import { Label } from '@constructive-io/ui/label';
import { MultiSelect } from '@constructive-io/ui/multi-select';
import { ScrollArea } from '@constructive-io/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@constructive-io/ui/select';
import type { CardComponent } from '@constructive-io/ui/stack';
import { Switch } from '@constructive-io/ui/switch';
import { Loader2, Trash2 } from 'lucide-react';

import type { FieldDefinition } from '@/lib/schema';
import { getFieldTypeInfo, updateConfigurableConstraint, type ConfigurableConstraintValue } from '@/lib/schema';
import { cn } from '@/lib/utils';
import { SUPPORTED_LANGUAGES } from '@/components/ui/code-editor';
import {
	LengthConstraintControl,
	PrecisionConstraintControl,
	RangeConstraintControl,
	ScaleConstraintControl,
} from '@/components/table-editor';

import ChoiceOptionsSection from './choice-options-section';
import {
	applyFormBuilderTemplateToField,
	getAllFormBuilderTemplates,
	getFormBuilderFieldTypeInfo,
	type FormBuilderTemplate,
} from './element-library-registry';

/** Computes the template ID from a field's type and smartTags */
function getTemplateIdFromField(field: FieldDefinition): string {
	const tags = (field.metadata?.smartTags ?? {}) as Record<string, unknown>;
	const ui = typeof tags.ui === 'string' ? (tags.ui as string) : undefined;

	// Text type with various UI modes
	if (field.type === 'text') {
		if (ui === 'textarea') return 'text.long';
		if (ui === 'markdown') return 'text.markdown';
		if (ui === 'select') return 'choice.select';
		if (ui === 'radio') return 'choice.radio';
		if (ui === 'phone') return 'input.phone';
		if (ui === 'code') return 'input.code';
		return 'text.short';
	}

	// Boolean type with toggle/checkbox UI
	if (field.type === 'boolean') {
		if (ui === 'checkbox') return 'input.checkbox';
		return 'input.toggle'; // Default for boolean
	}

	// Basic input types with dedicated templates
	if (field.type === 'email') return 'input.email';
	if (field.type === 'date') return 'input.date';
	if (field.type === 'number') return 'input.number';

	// Fallback to type-based template ID for advanced types
	return `type.${field.type}`;
}

/** Element type selector component */
interface ElementTypeSelectProps {
	currentTemplateId: string;
	onSelect: (template: FormBuilderTemplate) => void;
	disabled?: boolean;
}

function ElementTypeSelect({ currentTemplateId, onSelect, disabled }: ElementTypeSelectProps) {
	const templates = getAllFormBuilderTemplates();
	const basicTemplates = templates.filter((t) => t.category === 'basic');
	const advancedTemplates = templates.filter((t) => t.category === 'advanced');

	type TemplateOption = {
		value: string;
		label: string;
		template: FormBuilderTemplate;
		icon?: string | ComponentType<{ className?: string }>;
	};

	const allOptions: TemplateOption[] = templates.map((template) => {
		const info = getFormBuilderFieldTypeInfo(template.id);
		return {
			value: template.id,
			label: info?.label || template.id,
			template,
			icon: info?.icon,
		};
	});

	const basicOptions = basicTemplates
		.map((template) => allOptions.find((o) => o.value === template.id))
		.filter(Boolean) as TemplateOption[];
	const advancedOptions = advancedTemplates
		.map((template) => allOptions.find((o) => o.value === template.id))
		.filter(Boolean) as TemplateOption[];

	const groupedOptions = [
		{ label: 'Basic', items: basicOptions },
		{ label: 'Advanced', items: advancedOptions },
	].filter((g) => g.items.length > 0);

	// Get current template info for trigger icon
	const currentInfo = getFormBuilderFieldTypeInfo(currentTemplateId);
	const CurrentIcon = currentInfo?.icon;

	const selectedOption = allOptions.find((o) => o.value === currentTemplateId) ?? null;

	return (
		<Combobox
			items={groupedOptions}
			value={selectedOption}
			onValueChange={(next) => {
				if (next) onSelect(next.template);
			}}
		>
			<ComboboxInput
				disabled={disabled}
				placeholder='Search element types...'
				startAddon={
					typeof CurrentIcon === 'string' ? (
						<span className='text-muted-foreground font-mono text-xs'>{CurrentIcon}</span>
					) : CurrentIcon ? (
						<CurrentIcon className='h-4 w-4' />
					) : undefined
				}
				showClear={false}
			/>
			<ComboboxPopup>
				<ComboboxEmpty>No element types found.</ComboboxEmpty>
				<ComboboxList>
					{(group: (typeof groupedOptions)[number], index: number) => (
						<Fragment key={group.label}>
							<ComboboxGroup items={group.items}>
								<ComboboxGroupLabel>{group.label}</ComboboxGroupLabel>
								<ComboboxCollection>
									{(option: TemplateOption) => (
										<ComboboxItem key={option.value} value={option}>
											<span className='flex items-center gap-2'>
												{typeof option.icon === 'string' ? (
													<span className='text-muted-foreground font-mono text-xs'>{option.icon}</span>
												) : option.icon ? (
													<option.icon className='text-muted-foreground h-4 w-4' />
												) : null}
												{option.label}
											</span>
										</ComboboxItem>
									)}
								</ComboboxCollection>
							</ComboboxGroup>
							{index < groupedOptions.length - 1 && <ComboboxSeparator />}
						</Fragment>
					)}
				</ComboboxList>
			</ComboboxPopup>
		</Combobox>
	);
}

export type FieldConfigCardProps = {
	field: FieldDefinition;
	onClose: (options?: { skipUnsavedCheck?: boolean }) => void;
	onFieldChange: (fieldId: string, updates: Partial<FieldDefinition>) => void;
	onSave: (field: FieldDefinition) => Promise<void>;
	onDelete: (fieldId: string) => Promise<void>;
	isSaving?: boolean;
	isDeleting?: boolean;
};

export const FieldConfigCard: CardComponent<FieldConfigCardProps> = ({
	field,
	onClose,
	onFieldChange,
	onSave,
	onDelete,
	isSaving = false,
	isDeleting = false,
	card,
}) => {
	// useTransition for non-blocking state updates
	const [isPendingTransition, startTransition] = useTransition();

	const [localField, setLocalField] = useState<FieldDefinition>(field);
	// Use spread copy instead of structuredClone for faster initialization
	const originalFieldRef = useRef<FieldDefinition>({
		...field,
		constraints: { ...field.constraints },
		metadata: field.metadata ? { ...field.metadata } : undefined,
	});
	const titleInputRef = useRef<HTMLInputElement>(null);

	// Sync local field with prop using startTransition for non-blocking update
	useEffect(() => {
		startTransition(() => {
			setLocalField(field);
		});
	}, [field]);

	// Auto-focus title input when card mounts
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			titleInputRef.current?.focus();
		}, 50);
		return () => clearTimeout(timeoutId);
	}, [field.id]);

	const currentTemplateId = useMemo(() => {
		return getTemplateIdFromField(localField);
	}, [localField]);

	const fieldTypeInfo = useMemo(() => {
		return getFormBuilderFieldTypeInfo(currentTemplateId);
	}, [currentTemplateId]);

	// Use a ref to maintain stable IDs for choice options across renders
	const optionIdsRef = useRef<Map<number, string>>(new Map());

	const choiceOptions = useMemo(() => {
		const tags = (localField.metadata?.smartTags ?? {}) as Record<string, unknown>;
		if (!Array.isArray(tags.enum)) return [] as { id: string; value: string }[];
		return (tags.enum as unknown[]).map((v, i) => {
			// Get or create a stable ID for this index
			if (!optionIdsRef.current.has(i)) {
				optionIdsRef.current.set(i, `opt-${crypto.randomUUID()}`);
			}
			return { id: optionIdsRef.current.get(i)!, value: String(v) };
		});
	}, [localField]);

	// Get available constraints for this field type
	const fieldTypeConstraints = useMemo(() => {
		const typeInfo = getFieldTypeInfo(localField.type);
		if (!typeInfo) return { length: false, precision: false, scale: false, range: false };

		// Check if this is a choice field (select/radio) - they shouldn't have length constraints
		const tags = (localField.metadata?.smartTags ?? {}) as Record<string, unknown>;
		const ui = typeof tags.ui === 'string' ? tags.ui : undefined;
		const isChoice = localField.type === 'text' && (ui === 'select' || ui === 'radio');

		return {
			...typeInfo.configurable,
			length: isChoice ? false : typeInfo.configurable.length,
		};
	}, [localField]);

	const smartTags = (localField.metadata?.smartTags ?? {}) as Record<string, unknown>;
	const smartUi = typeof smartTags.ui === 'string' ? (smartTags.ui as string) : undefined;
	const smartEnum = Array.isArray(smartTags.enum) ? (smartTags.enum as unknown[]) : undefined;
	const isChoiceField = localField.type === 'text' && (smartUi === 'select' || smartUi === 'radio' || !!smartEnum);
	const isTempField = localField.id.startsWith('temp-field-');

	const isRequired = localField.isRequired ?? localField.constraints.nullable === false;
	const isHidden = localField.isHidden ?? false;

	// Memoize handlers with useCallback
	const handleLocalChange = useCallback(
		(updates: Partial<FieldDefinition>) => {
			setLocalField((prev) => ({ ...prev, ...updates }));
			onFieldChange(localField.id, updates);
		},
		[localField.id, onFieldChange],
	);

	const handleRequiredChange = useCallback(
		(checked: boolean) => {
			handleLocalChange({
				isRequired: checked,
				constraints: {
					...localField.constraints,
					nullable: !checked,
				},
			});
		},
		[handleLocalChange, localField.constraints],
	);

	const handleHiddenChange = useCallback(
		(checked: boolean) => {
			handleLocalChange({ isHidden: checked });
		},
		[handleLocalChange],
	);

	const handleConstraintChange = useCallback(
		(type: ConfigurableConstraintValue['type'], value: unknown) => {
			const updatedConstraints = updateConfigurableConstraint(localField.constraints, type, value);
			handleLocalChange({ constraints: updatedConstraints });
		},
		[localField.constraints, handleLocalChange],
	);

	const setSmartTags = useCallback(
		(next: Record<string, unknown>) => {
			handleLocalChange({
				metadata: {
					...(localField.metadata ?? {}),
					smartTags: next,
				},
			});
		},
		[localField.metadata, handleLocalChange],
	);

	// Choice options handler for the lazy-loaded ChoiceOptionsSection
	const handleChoiceOptionsChange = useCallback(
		(options: string[]) => {
			handleLocalChange({
				metadata: {
					...(localField.metadata ?? {}),
					smartTags: { ...smartTags, enum: options },
				},
			});
		},
		[localField.metadata, smartTags, handleLocalChange],
	);

	const handleSave = useCallback(
		async (e?: React.FormEvent) => {
			e?.preventDefault();

			// On save attempt, validate choice options
			if (isChoiceField && choiceOptions.length > 0) {
				// Check for any empty or duplicate options
				const hasEmpty = choiceOptions.some((opt) => opt.value.trim() === '');
				const values = choiceOptions.map((opt) => opt.value.trim()).filter((v) => v !== '');
				const hasDuplicates = new Set(values).size !== values.length;

				if (hasEmpty || hasDuplicates) {
					// Don't save if there are validation errors
					return;
				}
			}

			try {
				await onSave(localField);
				card.close();
			} catch {
				// Save failed - stay open, error toast already shown by onSave
			}
		},
		[isChoiceField, choiceOptions, onSave, localField, card],
	);

	const handleDelete = useCallback(async () => {
		try {
			await onDelete(localField.id);
			card.close();
		} catch {
			// Delete failed - stay open, error toast already shown by onDelete
		}
	}, [onDelete, localField.id, card]);

	const handleCancel = useCallback(() => {
		// Reset to original field state - revert changes completely
		onFieldChange(localField.id, originalFieldRef.current);
		setLocalField(originalFieldRef.current);
		// Skip unsaved check since we reverted
		onClose({ skipUnsavedCheck: true });
		card.close();
	}, [onFieldChange, localField.id, onClose, card]);

	const handleDismiss = useCallback(() => {
		onClose();
		card.close();
	}, [onClose, card]);

	return (
		<div className='flex h-full flex-col'>
			<ScrollArea className='min-h-0 flex-1'>
				<form id='field-config-form' onSubmit={handleSave} className='space-y-4 p-6'>
					{/* Element Type Selector */}
					<div className='space-y-1.5'>
						<Label htmlFor='field-type' className='text-muted-foreground text-xs font-medium'>
							Element Type
						</Label>
						<ElementTypeSelect
							currentTemplateId={currentTemplateId}
							onSelect={(template) => {
								const updated = applyFormBuilderTemplateToField(template.id, localField);
								handleLocalChange(updated as Partial<FieldDefinition>);
							}}
							disabled={isSaving}
						/>
					</div>

					{/* Field Title */}
					<div className='space-y-1.5'>
						<Label htmlFor='field-title' className='text-muted-foreground text-xs font-medium'>
							Title
						</Label>
						<Input
							ref={titleInputRef}
							id='field-title'
							value={localField.label || ''}
							onChange={(e) => handleLocalChange({ label: e.target.value })}
							placeholder={`${fieldTypeInfo?.label || 'Field'} Title`}
							disabled={isSaving}
							autoComplete='off'
						/>
					</div>

					{/* Field Name */}
					<div className='space-y-1.5'>
						<Label htmlFor='field-name' className='text-muted-foreground text-xs font-medium'>
							Field Name (database)
						</Label>
						<Input
							id='field-name'
							value={localField.name}
							onChange={(e) => handleLocalChange({ name: e.target.value })}
							placeholder='field_name'
							className='font-mono text-sm'
							disabled={isSaving}
							autoComplete='off'
						/>
					</div>

					{/* Field Description */}
					<div className='space-y-1.5'>
						<Label htmlFor='field-description' className='text-muted-foreground text-xs font-medium'>
							Description
						</Label>
						<Input
							id='field-description'
							value={localField.description || ''}
							onChange={(e) => handleLocalChange({ description: e.target.value })}
							placeholder='Enter description'
							disabled={isSaving}
							autoComplete='off'
						/>
					</div>

					{/* Placeholder */}
					<div className='space-y-1.5'>
						<Label htmlFor='field-placeholder' className='text-muted-foreground text-xs font-medium'>
							Placeholder
						</Label>
						<Input
							id='field-placeholder'
							value={(smartTags.placeholder as string) || ''}
							onChange={(e) => setSmartTags({ ...smartTags, placeholder: e.target.value || undefined })}
							placeholder='Enter placeholder text'
							disabled={isSaving}
							autoComplete='off'
						/>
					</div>

					{/* Code field settings */}
					{smartUi === 'code' && (
						<>
							{/* Allowed languages multi-select */}
							<div className='space-y-1.5'>
								<Label className='text-muted-foreground text-xs font-medium'>Allowed Languages</Label>
								<MultiSelect
									options={SUPPORTED_LANGUAGES.map((lang) => ({
										value: lang.value,
										label: lang.label,
									}))}
									defaultValue={
										Array.isArray(smartTags.allowedLanguages) ? (smartTags.allowedLanguages as string[]) : []
									}
									onValueChange={(values) => {
										// If current default language is not in new allowed list, update it
										const currentLang = (smartTags.language as string) || 'plain_text';
										const newLang = values.length === 0 || values.includes(currentLang) ? currentLang : values[0];
										setSmartTags({ ...smartTags, allowedLanguages: values, language: newLang });
									}}
									placeholder='Select languages (empty = all)'
									maxCount={3}
									disabled={isSaving}
								/>
								<p className='text-muted-foreground text-xs'>Leave empty to allow all languages</p>
							</div>

							{/* Default language selector */}
							<div className='space-y-1.5'>
								<Label htmlFor='field-language' className='text-muted-foreground text-xs font-medium'>
									Default Language
								</Label>
								<Select
									value={(() => {
										const allowed = Array.isArray(smartTags.allowedLanguages)
											? (smartTags.allowedLanguages as string[])
											: [];
										const current = (smartTags.language as string) || 'plain_text';
										// If allowed is empty (all allowed) or current is in allowed, use current
										if (allowed.length === 0 || allowed.includes(current)) return current;
										// Otherwise use first allowed
										return allowed[0] || 'plain_text';
									})()}
									onValueChange={(value) => setSmartTags({ ...smartTags, language: value })}
									disabled={isSaving}
								>
									<SelectTrigger id='field-language'>
										<SelectValue placeholder='Select default language' />
									</SelectTrigger>
									<SelectContent>
										{(Array.isArray(smartTags.allowedLanguages) && smartTags.allowedLanguages.length > 0
											? SUPPORTED_LANGUAGES.filter((lang) =>
													(smartTags.allowedLanguages as string[]).includes(lang.value),
												)
											: SUPPORTED_LANGUAGES
										).map((lang) => (
											<SelectItem key={lang.value} value={lang.value}>
												{lang.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Line numbers toggle */}
							<div className='flex items-center justify-between rounded-md border p-3'>
								<Label htmlFor='field-line-numbers' className='text-sm'>
									Show line numbers
								</Label>
								<Switch
									id='field-line-numbers'
									checked={smartTags.showLineNumbers !== false}
									onCheckedChange={(checked) => setSmartTags({ ...smartTags, showLineNumbers: checked })}
									disabled={isSaving}
								/>
							</div>
						</>
					)}

					{/* Default Value */}
					<div className='space-y-1.5'>
						<Label htmlFor='field-default' className='text-muted-foreground text-xs font-medium'>
							Default Value
						</Label>
						{isChoiceField && choiceOptions.length > 0 ? (
							<Select
								value={
									localField.constraints.defaultValue
										? choiceOptions.find((o) => o.value === localField.constraints.defaultValue)?.id || '__none__'
										: '__none__'
								}
								onValueChange={(id) => {
									const opt = choiceOptions.find((o) => o.id === id);
									handleLocalChange({
										constraints: {
											...localField.constraints,
											defaultValue: opt ? opt.value : undefined,
										},
									});
								}}
								disabled={isSaving}
							>
								<SelectTrigger id='field-default'>
									<SelectValue placeholder='Select default option' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='__none__'>No default</SelectItem>
									{choiceOptions
										.filter((opt) => opt.value.trim() !== '')
										.map((opt) => (
											<SelectItem key={opt.id} value={opt.id}>
												{opt.value}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						) : (
							<Input
								id='field-default'
								value={localField.constraints.defaultValue?.toString() || ''}
								onChange={(e) =>
									handleLocalChange({
										constraints: {
											...localField.constraints,
											defaultValue: e.target.value || undefined,
										},
									})
								}
								placeholder='Enter default value'
								disabled={isSaving}
								autoComplete='off'
							/>
						)}
					</div>

					{/* Attributes */}
					<div className='space-y-2'>
						<Label className='text-muted-foreground text-xs font-medium'>Attributes</Label>
						<div className='space-y-3 rounded-md border p-3'>
							<div className='flex items-center justify-between'>
								<Label htmlFor='field-required' className='text-sm'>
									Required
								</Label>
								<Switch id='field-required' checked={isRequired} onCheckedChange={handleRequiredChange} />
							</div>
							<div className='flex items-center justify-between'>
								<Label htmlFor='field-hidden' className='text-sm'>
									Hidden
								</Label>
								<Switch id='field-hidden' checked={isHidden} onCheckedChange={handleHiddenChange} />
							</div>
						</div>
					</div>

					{/* Constraints - render all available constraints for this field type */}
					{(fieldTypeConstraints.length ||
						fieldTypeConstraints.precision ||
						fieldTypeConstraints.scale ||
						fieldTypeConstraints.range) && (
						<div className='space-y-3'>
							<Label className='text-muted-foreground text-xs font-medium'>Constraints</Label>
							{fieldTypeConstraints.length && (
								<LengthConstraintControl
									constraint={{
										type: 'length',
										label: 'Length',
										value: { min: localField.constraints.minLength, max: localField.constraints.maxLength },
										hasValue: true,
									}}
									onChange={(value) => handleConstraintChange('length', value)}
								/>
							)}
							{fieldTypeConstraints.precision && (
								<PrecisionConstraintControl
									constraint={{
										type: 'precision',
										label: 'Precision',
										value: localField.constraints.precision,
										hasValue: true,
									}}
									onChange={(value) => handleConstraintChange('precision', value)}
								/>
							)}
							{fieldTypeConstraints.scale && (
								<ScaleConstraintControl
									constraint={{
										type: 'scale',
										label: 'Scale',
										value: localField.constraints.scale,
										hasValue: true,
									}}
									onChange={(value) => handleConstraintChange('scale', value)}
								/>
							)}
							{fieldTypeConstraints.range && (
								<RangeConstraintControl
									constraint={{
										type: 'range',
										label: 'Value Range',
										value: { min: localField.constraints.minValue, max: localField.constraints.maxValue },
										hasValue: true,
									}}
									onChange={(value) => handleConstraintChange('range', value)}
								/>
							)}
						</div>
					)}

					{/* Choice Options with DND */}
					{isChoiceField && (
						<ChoiceOptionsSection
							choiceOptions={choiceOptions}
							onOptionsChange={handleChoiceOptionsChange}
							disabled={isSaving}
						/>
					)}
				</form>
			</ScrollArea>

			{/* Footer */}
			<div className={cn('flex items-center border-t px-4 py-3', isTempField ? 'justify-end' : 'justify-between')}>
				{!isTempField && (
					<Button
						type='button'
						variant='ghost'
						size='sm'
						onClick={handleDelete}
						disabled={isDeleting || isSaving}
						className='text-destructive hover:text-destructive gap-1.5'
					>
						{isDeleting ? <Loader2 className='h-4 w-4 animate-spin' /> : <Trash2 className='h-4 w-4' />}
						Delete
					</Button>
				)}
				<div className='flex items-center gap-2'>
					<Button type='button' variant='outline' size='sm' onClick={handleCancel} disabled={isSaving || isDeleting}>
						Cancel
					</Button>
					<Button
						type='submit'
						form='field-config-form'
						variant='default'
						size='sm'
						disabled={isSaving || !localField.name.trim()}
						className='gap-1.5'
					>
						{isSaving && <Loader2 className='h-4 w-4 animate-spin' />}
						{isTempField ? 'Create' : 'Save'}
					</Button>
				</div>
			</div>
		</div>
	);
};
