'use client';

import { memo, startTransition, useMemo, useState } from 'react';
import { Collapsible, CollapsibleTrigger } from '@constructive-io/ui/collapsible';
import { Input } from '@constructive-io/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@constructive-io/ui/tooltip';
import { useDraggable } from '@dnd-kit/core';
import { RiDragDropLine, RiSearchLine } from '@remixicon/react';
import { ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { cn } from '@/lib/utils';

import type { FieldTypeInfo } from '@/lib/schema';
import {
	FORM_ELEMENT_LIBRARY,
	getAdvancedFormBuilderTemplates,
	getBasicFormBuilderTemplates,
	getFormBuilderFieldTypeInfo,
	searchFormBuilderTemplates,
	type FormBuilderTemplate,
} from './element-library-registry';
import { getLayoutTemplates, type LayoutTemplate } from './layout-registry';

const totalTypesCount = FORM_ELEMENT_LIBRARY.reduce((sum, cat) => sum + cat.templateIds.length, 0);

type LibraryItem = {
	templateId: string;
	typeInfo: FieldTypeInfo;
};

interface ElementLibraryProps {
	collapsed?: boolean;
	className?: string;
}

export function ElementLibrary({ collapsed = false, className }: ElementLibraryProps) {
	const [searchQuery, setSearchQuery] = useState('');

	// Section expand/collapse state (local, not persisted) - lazy init
	const [sectionsExpanded, setSectionsExpanded] = useState(() => ({ layouts: true, basic: true, advanced: false }));
	const toggleSection = (section: 'layouts' | 'basic' | 'advanced') =>
		setSectionsExpanded((prev) => ({ ...prev, [section]: !prev[section] }));

	// Get layout templates
	const layoutTemplates = useMemo(() => getLayoutTemplates(), []);

	// Filter templates based on search query and map to display FieldTypeInfo
	const { filteredBasicTypes, filteredAdvancedTypes } = useMemo(() => {
		const basicTemplates: FormBuilderTemplate[] = getBasicFormBuilderTemplates();
		const advancedTemplates: FormBuilderTemplate[] = getAdvancedFormBuilderTemplates();

		const toLibraryItem = (template: FormBuilderTemplate): LibraryItem | null => {
			const info = getFormBuilderFieldTypeInfo(template.id);
			if (!info) return null;
			return { templateId: template.id, typeInfo: info };
		};

		if (!searchQuery.trim()) {
			return {
				filteredBasicTypes: basicTemplates.map(toLibraryItem).filter((t): t is LibraryItem => t !== null),
				filteredAdvancedTypes: advancedTemplates.map(toLibraryItem).filter((t): t is LibraryItem => t !== null),
			};
		}

		const searchResults: FormBuilderTemplate[] = searchFormBuilderTemplates(searchQuery);
		const matchingTemplateIds = new Set(searchResults.map((r) => r.id));

		return {
			filteredBasicTypes: basicTemplates
				.filter((t) => matchingTemplateIds.has(t.id))
				.map(toLibraryItem)
				.filter((t): t is LibraryItem => t !== null),
			filteredAdvancedTypes: advancedTemplates
				.filter((t) => matchingTemplateIds.has(t.id))
				.map(toLibraryItem)
				.filter((t): t is LibraryItem => t !== null),
		};
	}, [searchQuery]);

	// Filter layouts based on search
	const filteredLayouts = useMemo(() => {
		if (!searchQuery.trim()) return layoutTemplates;
		const query = searchQuery.toLowerCase();
		return layoutTemplates.filter(
			(t) => t.label.toLowerCase().includes(query) || t.description.toLowerCase().includes(query),
		);
	}, [searchQuery, layoutTemplates]);

	const totalFilteredCount = filteredBasicTypes.length + filteredAdvancedTypes.length + filteredLayouts.length;

	// Collapsed view - show icon rail
	if (collapsed) {
		return (
			<div className={cn('flex flex-col items-center gap-1 overflow-auto px-1', className)}>
				{getBasicFormBuilderTemplates().map((template) => {
					const typeInfo = getFormBuilderFieldTypeInfo(template.id);
					if (!typeInfo) return null;
					return <DraggableElementIcon key={template.id} templateId={template.id} typeInfo={typeInfo} />;
				})}
			</div>
		);
	}

	return (
		<div className='flex h-full min-h-0 flex-col'>
			{/* Search */}
			<div className='px-3 pt-3 pb-2'>
				<div className='relative'>
					<RiSearchLine className='text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2' />
					<Input
						placeholder='Search elements...'
						value={searchQuery}
						onChange={(e) => {
							const value = e.target.value;
							startTransition(() => setSearchQuery(value));
						}}
						className='h-8 pl-8 text-sm'
					/>
				</div>
				{searchQuery && (
					<p className='text-muted-foreground mt-1.5 text-xs'>
						{totalFilteredCount} of {totalTypesCount} elements
					</p>
				)}
			</div>

			{/* Element sections */}
			<div className='scrollbar-neutral-thin min-h-0 flex-1 space-y-2 overflow-auto px-2 pb-2'>
				{totalFilteredCount === 0 ? (
					<div className='text-muted-foreground p-4 text-center text-sm'>
						<p>No elements found for &ldquo;{searchQuery}&rdquo;</p>
					</div>
				) : (
					<>
						{/* Layouts Section */}
						{filteredLayouts.length > 0 && (
							<LayoutSection
								title='LAYOUTS'
								items={filteredLayouts}
								isExpanded={sectionsExpanded.layouts}
								onToggleExpand={() => toggleSection('layouts')}
							/>
						)}

						{/* Basic Elements Section */}
						{filteredBasicTypes.length > 0 && (
							<ElementSection
								title='BASIC'
								items={filteredBasicTypes}
								isExpanded={sectionsExpanded.basic}
								onToggleExpand={() => toggleSection('basic')}
							/>
						)}

						{/* Advanced Elements Section */}
						{filteredAdvancedTypes.length > 0 && (
							<ElementSection
								title='ADVANCED'
								items={filteredAdvancedTypes}
								isExpanded={sectionsExpanded.advanced}
								onToggleExpand={() => toggleSection('advanced')}
							/>
						)}
					</>
				)}
			</div>

			{/* Footer hint */}
			<div className='text-muted-foreground/70 flex items-center gap-1.5 border-t px-3 py-2 text-xs'>
				<RiDragDropLine className='h-3 w-3' />
				<span>Drag to add elements</span>
			</div>
		</div>
	);
}

interface ElementSectionProps {
	title: string;
	items: LibraryItem[];
	isExpanded: boolean;
	onToggleExpand: () => void;
}

function ElementSection({ title, items, isExpanded, onToggleExpand }: ElementSectionProps) {
	return (
		<Collapsible open={isExpanded} onOpenChange={onToggleExpand} className='flex min-h-0 shrink-0 flex-col'>
			<CollapsibleTrigger
				className='group bg-card hover:bg-muted/50 data-[state=open]:bg-muted/50 flex w-full cursor-pointer items-center
					gap-2 rounded-lg py-1.5 pr-2 pl-1 transition-colors duration-150'
			>
				<motion.div
					animate={{ rotate: isExpanded ? 90 : 0 }}
					transition={{ type: 'spring', stiffness: 400, damping: 25 }}
					className='flex shrink-0 items-center justify-center'
				>
					<ChevronRight className='text-muted-foreground/60 h-3.5 w-3.5' />
				</motion.div>
				<span className='text-muted-foreground text-xs font-medium'>{title}</span>
				<span className='text-muted-foreground/70 ml-auto text-[10px] tabular-nums'>{items.length}</span>
			</CollapsibleTrigger>

			<AnimatePresence initial={false}>
				{isExpanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{
							height: 'auto',
							opacity: 1,
							transition: {
								height: { type: 'spring', stiffness: 500, damping: 40, mass: 0.8 },
								opacity: { duration: 0.2, ease: 'easeOut' },
							},
						}}
						exit={{
							height: 0,
							opacity: 0,
							transition: {
								height: { type: 'spring', stiffness: 500, damping: 40, mass: 0.8 },
								opacity: { duration: 0.15, ease: 'easeIn' },
							},
						}}
						className='min-h-0 overflow-hidden'
					>
						<div className='mt-1.5 space-y-1'>
							{items.map((item) => (
								<DraggableElementItem key={item.templateId} templateId={item.templateId} typeInfo={item.typeInfo} />
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</Collapsible>
	);
}

interface DraggableElementItemProps {
	templateId: string;
	typeInfo: FieldTypeInfo;
	className?: string;
}

// Memoized to prevent re-renders when parent search state changes
const DraggableElementItem = memo(function DraggableElementItem({ templateId, typeInfo, className }: DraggableElementItemProps) {
	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id: `element-library-${templateId}`,
		data: {
			templateId,
			source: 'library',
		},
	});

	const Icon = typeInfo.icon;

	return (
		<div
			ref={setNodeRef}
			{...listeners}
			{...attributes}
			className={cn(
				'flex cursor-grab items-center gap-3 rounded-lg border border-transparent px-3 py-2.5',
				'bg-card hover:bg-muted/50 hover:border-border/50',
				'transition-all duration-150',
				isDragging && 'opacity-50',
				className,
			)}
		>
			<div className='bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-md'>
				{Icon ? <Icon className='text-foreground h-4 w-4' /> : null}
			</div>
			<div className='min-w-0 flex-1'>
				<p className='text-foreground text-sm font-medium'>{typeInfo.label}</p>
				<p className='text-muted-foreground truncate text-xs'>{typeInfo.description}</p>
			</div>
		</div>
	);
});

interface LayoutSectionProps {
	title: string;
	items: LayoutTemplate[];
	isExpanded: boolean;
	onToggleExpand: () => void;
}

function LayoutSection({ title, items, isExpanded, onToggleExpand }: LayoutSectionProps) {
	return (
		<Collapsible open={isExpanded} onOpenChange={onToggleExpand} className='flex min-h-0 shrink-0 flex-col'>
			<CollapsibleTrigger
				className='group bg-card hover:bg-muted/50 data-[state=open]:bg-muted/50 flex w-full cursor-pointer items-center
					gap-2 rounded-lg py-1.5 pr-2 pl-1 transition-colors duration-150'
			>
				<motion.div
					animate={{ rotate: isExpanded ? 90 : 0 }}
					transition={{ type: 'spring', stiffness: 400, damping: 25 }}
					className='flex shrink-0 items-center justify-center'
				>
					<ChevronRight className='text-muted-foreground/60 h-3.5 w-3.5' />
				</motion.div>
				<span className='text-muted-foreground text-xs font-medium'>{title}</span>
				<span className='text-muted-foreground/70 ml-auto text-[10px] tabular-nums'>{items.length}</span>
			</CollapsibleTrigger>

			<AnimatePresence initial={false}>
				{isExpanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{
							height: 'auto',
							opacity: 1,
							transition: {
								height: { type: 'spring', stiffness: 500, damping: 40, mass: 0.8 },
								opacity: { duration: 0.2, ease: 'easeOut' },
							},
						}}
						exit={{
							height: 0,
							opacity: 0,
							transition: {
								height: { type: 'spring', stiffness: 500, damping: 40, mass: 0.8 },
								opacity: { duration: 0.15, ease: 'easeIn' },
							},
						}}
						className='min-h-0 overflow-hidden'
					>
						<div className='mt-1.5 space-y-1'>
							{items.map((item) => (
								<DraggableLayoutItem key={item.id} layout={item} />
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</Collapsible>
	);
}

interface DraggableLayoutItemProps {
	layout: LayoutTemplate;
}

// Memoized to prevent re-renders when parent search state changes
const DraggableLayoutItem = memo(function DraggableLayoutItem({ layout }: DraggableLayoutItemProps) {
	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id: `element-library-${layout.id}`,
		data: {
			templateId: layout.id,
			source: 'library',
			isLayout: true,
			columns: layout.columns,
		},
	});

	const Icon = layout.icon;

	return (
		<div
			ref={setNodeRef}
			{...listeners}
			{...attributes}
			className={cn(
				'flex cursor-grab items-center gap-3 rounded-lg border border-transparent px-3 py-2.5',
				'bg-card hover:bg-muted/50 hover:border-border/50',
				'transition-all duration-150',
				isDragging && 'opacity-50',
			)}
		>
			<div className='bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-md'>
				<Icon className='text-foreground h-4 w-4' />
			</div>
			<div className='min-w-0 flex-1'>
				<p className='text-foreground text-sm font-medium'>{layout.label}</p>
				<p className='text-muted-foreground truncate text-xs'>{layout.description}</p>
			</div>
		</div>
	);
});

interface DraggableElementIconProps {
	templateId: string;
	typeInfo: FieldTypeInfo;
}

function DraggableElementIcon({ templateId, typeInfo }: DraggableElementIconProps) {
	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id: `element-library-icon-${templateId}`,
		data: {
			templateId,
			source: 'library',
		},
	});

	const Icon = typeInfo.icon;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div
					ref={setNodeRef}
					{...listeners}
					{...attributes}
					className={cn(
						'flex h-10 w-10 cursor-grab items-center justify-center rounded-lg',
						'bg-card hover:bg-muted/50 hover:border-border/50 border border-transparent',
						'transition-all duration-150',
						isDragging && 'opacity-50',
					)}
				>
					{Icon ? <Icon className='text-foreground h-4 w-4' /> : null}
				</div>
			</TooltipTrigger>
			<TooltipContent side='left'>
				<p>{typeInfo.label}</p>
			</TooltipContent>
		</Tooltip>
	);
}
