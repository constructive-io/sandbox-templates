'use client';

import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@constructive-io/ui/button';
import { Input } from '@constructive-io/ui/input';
import { Label } from '@constructive-io/ui/label';

export interface ChoiceOption {
	id: string;
	value: string;
}

interface ChoiceOptionRowProps {
	id: string;
	value: string;
	onChange: (value: string) => void;
	onRemove: () => void;
	onEnterKey: () => void;
	disabled?: boolean;
	inputRef?: React.RefObject<HTMLInputElement | null>;
	hasError?: boolean;
	errorMessage?: string;
}

function ChoiceOptionRow({
	id,
	value,
	onChange,
	onRemove,
	onEnterKey,
	disabled,
	inputRef,
	hasError,
	errorMessage,
}: ChoiceOptionRowProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

	const style: CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div className='space-y-1'>
			<div
				ref={setNodeRef}
				style={style}
				className={cn(
					'bg-background flex items-center gap-2 rounded-md border px-2 py-1.5',
					isDragging && 'opacity-60',
					hasError && 'border-destructive',
				)}
			>
				<div
					{...listeners}
					{...attributes}
					className='text-muted-foreground/60 hover:text-muted-foreground cursor-grab'
					aria-label='Reorder option'
				>
					<GripVertical className='h-4 w-4' />
				</div>
				<Input
					ref={inputRef}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							onEnterKey();
						}
					}}
					disabled={disabled}
					className={cn('h-8 border-none shadow-none focus-visible:ring-0', hasError && 'text-destructive')}
				/>
				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={onRemove}
					disabled={disabled}
					className='text-muted-foreground/80 hover:text-destructive h-8 w-8 p-0'
					aria-label='Remove option'
				>
					<Trash2 className='h-4 w-4' />
				</Button>
			</div>
			{hasError && errorMessage && <p className='text-destructive pl-8 text-xs'>{errorMessage}</p>}
		</div>
	);
}

export interface ChoiceOptionsSectionProps {
	choiceOptions: ChoiceOption[];
	onOptionsChange: (options: string[]) => void;
	disabled?: boolean;
}

export default function ChoiceOptionsSection({ choiceOptions, onOptionsChange, disabled }: ChoiceOptionsSectionProps) {
	// Use a ref to maintain stable IDs for choice options across renders
	const optionIdsRef = useRef<Map<number, string>>(new Map());

	// Initialize IDs for existing options
	useEffect(() => {
		choiceOptions.forEach((_, i) => {
			if (!optionIdsRef.current.has(i)) {
				optionIdsRef.current.set(i, `opt-${crypto.randomUUID()}`);
			}
		});
	}, [choiceOptions]);

	// Ref for focusing newly added option
	const newOptionRef = useRef<HTMLInputElement | null>(null);
	const [pendingFocusIndex, setPendingFocusIndex] = useState<number | null>(null);
	// Track which options have been touched (interacted with)
	const [touchedOptions, setTouchedOptions] = useState<Set<number>>(new Set());

	// Focus new option when added
	useEffect(() => {
		if (pendingFocusIndex !== null && newOptionRef.current) {
			newOptionRef.current.focus();
			newOptionRef.current.select();
			setPendingFocusIndex(null);
		}
	}, [pendingFocusIndex, choiceOptions.length]);

	// Validate choice options for empty and duplicate values
	const optionValidation = new Map<number, string>();
	const trimmedValues = new Map<string, number[]>();

	choiceOptions.forEach((opt, index) => {
		const trimmed = opt.value.trim();

		// Check for empty only if the option has been touched
		if (trimmed === '' && touchedOptions.has(index)) {
			optionValidation.set(index, 'Option cannot be empty');
			return;
		}

		// Track for duplicates (always check, regardless of touched state)
		if (trimmed !== '') {
			if (!trimmedValues.has(trimmed)) {
				trimmedValues.set(trimmed, []);
			}
			trimmedValues.get(trimmed)!.push(index);
		}
	});

	// Mark duplicates
	trimmedValues.forEach((indices) => {
		if (indices.length > 1) {
			indices.forEach((index) => {
				optionValidation.set(index, 'Duplicate option');
			});
		}
	});

	const addChoiceOption = () => {
		const newIndex = choiceOptions.length;
		optionIdsRef.current.set(newIndex, `opt-${crypto.randomUUID()}`);
		onOptionsChange([...choiceOptions.map((o) => o.value), '']);
		setPendingFocusIndex(newIndex);
	};

	const updateChoiceOption = (index: number, value: string) => {
		setTouchedOptions((prev) => new Set(prev).add(index));
		onOptionsChange(choiceOptions.map((o, i) => (i === index ? value : o.value)));
	};

	const removeChoiceOption = (index: number) => {
		onOptionsChange(choiceOptions.filter((_, i) => i !== index).map((o) => o.value));
	};

	const insertChoiceOptionAfter = (index: number) => {
		const newIndex = index + 1;
		optionIdsRef.current.set(newIndex, `opt-${crypto.randomUUID()}`);
		const values = choiceOptions.map((o) => o.value);
		values.splice(newIndex, 0, '');
		onOptionsChange(values);
		setPendingFocusIndex(newIndex);
	};

	const handleChoiceDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const oldIndex = choiceOptions.findIndex((o) => o.id === String(active.id));
		const newIndex = choiceOptions.findIndex((o) => o.id === String(over.id));
		if (oldIndex === -1 || newIndex === -1) return;
		const reordered = arrayMove(choiceOptions, oldIndex, newIndex);
		onOptionsChange(reordered.map((o) => o.value));
	};

	return (
		<div className='space-y-2'>
			<Label className='text-muted-foreground text-xs font-medium'>Options</Label>
			<DndContext collisionDetection={closestCenter} onDragEnd={handleChoiceDragEnd}>
				<SortableContext items={choiceOptions.map((o) => o.id)} strategy={verticalListSortingStrategy}>
					<div className='space-y-1'>
						{choiceOptions.length === 0 ? (
							<div className='text-muted-foreground rounded-md border border-dashed p-3 text-xs'>No options yet</div>
						) : (
							choiceOptions.map((opt, index) => (
								<ChoiceOptionRow
									key={opt.id}
									id={opt.id}
									value={opt.value}
									onChange={(v: string) => updateChoiceOption(index, v)}
									onRemove={() => removeChoiceOption(index)}
									onEnterKey={() => insertChoiceOptionAfter(index)}
									disabled={disabled}
									inputRef={index === pendingFocusIndex ? newOptionRef : undefined}
									hasError={optionValidation.has(index)}
									errorMessage={optionValidation.get(index)}
								/>
							))
						)}
					</div>
				</SortableContext>
			</DndContext>
			<div className='pt-1'>
				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={addChoiceOption}
					disabled={disabled}
					className='h-7 gap-1.5 px-2'
				>
					<Plus className='h-3.5 w-3.5' />
					Add option
				</Button>
			</div>
		</div>
	);
}
