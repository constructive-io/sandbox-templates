'use client';

import { useEffect, useState } from 'react';
import { Button } from '@constructive-io/ui/button';
import { useCardStack } from '@constructive-io/ui/stack';
import { TooltipProvider } from '@constructive-io/ui/tooltip';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import { durations, easings, springs } from '@/lib/motion/motion-config';
import type { TableDefinition } from '@/lib/schema';
import { cn } from '@/lib/utils';
import { DEFAULT_DROP_ANIMATION, DraggableFieldType } from '@/components/table-editor';

import { ElementLibrary } from './element-library';
import { FormBuilderCanvas } from './form-builder-canvas';
import { FormPreviewCard } from './form-preview-card';
import { NoTableSelectedView } from './no-table-selected-view';
import { useFormBuilderDnD } from './use-form-builder-dnd';
import { useFormSchema } from './use-form-schema';

// Constants for panel widths (numeric for motion animation)
const PANEL_WIDTH_EXPANDED = 380;
const PANEL_WIDTH_COLLAPSED = 56;

// Shared tween config for synchronized animations
const tweenConfig = {
	duration: durations.normal,
	ease: easings.easeOut,
};

interface ElementLibraryHeaderProps {
	isExpanded: boolean;
	onToggle: () => void;
	totalCount: number;
}

function ElementLibraryHeader({ isExpanded, onToggle, totalCount }: ElementLibraryHeaderProps) {
	return (
		<div className='flex items-center justify-between border-b px-3 py-2'>
			<div className='flex items-center gap-2'>
				<h3 className='text-sm font-medium'>Form Elements</h3>
				<span className='text-muted-foreground bg-muted rounded-md px-1.5 py-0.5 text-xs tabular-nums'>
					{totalCount}
				</span>
			</div>
			<Button
				variant='ghost'
				size='sm'
				onClick={onToggle}
				className='h-7 w-7 p-0'
				aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
			>
				{isExpanded ? <ChevronRight className='h-4 w-4' /> : <ChevronLeft className='h-4 w-4' />}
			</Button>
		</div>
	);
}

interface CollapsedHeaderProps {
	onToggle: () => void;
}

function CollapsedHeader({ onToggle }: CollapsedHeaderProps) {
	return (
		<div className='flex items-center justify-center border-b py-2'>
			<Button variant='ghost' size='sm' onClick={onToggle} className='h-7 w-7 p-0' aria-label='Expand panel'>
				<ChevronLeft className='h-4 w-4' />
			</Button>
		</div>
	);
}

export function FormBuilderEditor() {
	const stack = useCardStack();
	const { currentTable } = useSchemaBuilderSelectors();

	// Use the unified form schema hook for state management and persistence
	const formSchema = useFormSchema();

	// Drag and drop state
	const {
		sensors,
		customCollisionDetection,
		handleDragStart,
		handleDragEnd,
		handleAddFieldRef,
		handleAddLayoutRef,
		handleAddFieldToLayoutRef,
		activeId,
		draggedType,
		draggedLayoutTemplate,
		totalElementCount,
	} = useFormBuilderDnD(currentTable as TableDefinition | null);

	// Panel state: expanded (full panel) or collapsed (icon rail) - default to expanded
	const [panelExpanded, setPanelExpanded] = useState(true);

	const togglePanel = () => setPanelExpanded((prev) => !prev);

	const openPreview = () => {
		stack.push({
			id: 'form-preview',
			title: 'Preview',
			Component: FormPreviewCard,
			props: { hasTable: !!currentTable, formSchema: formSchema.schema },
			width: 740,
		});
	};

	useEffect(() => {
		if (!stack.has('form-preview')) return;
		stack.updateProps('form-preview', { formSchema: formSchema.schema });
	}, [stack, formSchema.schema]);

	return (
		<TooltipProvider delayDuration={300}>
			<DndContext
				sensors={sensors}
				collisionDetection={customCollisionDetection}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				{/* Container with relative positioning for the absolute panel */}
				<div className='relative flex min-h-0 min-w-0 flex-1 overflow-hidden'>
					{/* Main content area - add right padding to make room for collapsed panel */}
					<motion.div
						className={cn('scrollbar-neutral-thin relative min-h-0 min-w-0 flex-1 overflow-auto')}
						initial={false}
						animate={{
							paddingRight: panelExpanded ? PANEL_WIDTH_EXPANDED : PANEL_WIDTH_COLLAPSED,
						}}
						transition={tweenConfig}
					>
						{currentTable ? (
							<FormBuilderCanvas
								onAddFieldRef={handleAddFieldRef}
								onAddLayoutRef={handleAddLayoutRef}
								onAddFieldToLayoutRef={handleAddFieldToLayoutRef}
								onOpenPreview={openPreview}
								formSchema={formSchema}
							/>
						) : (
							<div className='flex min-h-full min-w-full items-start justify-center p-6 pb-12'>
								<NoTableSelectedView className='mt-20' />
							</div>
						)}
					</motion.div>

					{/* Right panel - Form Elements - absolutely positioned */}
					<motion.div
						data-state={panelExpanded ? 'expanded' : 'collapsed'}
						className='bg-background border-border/60 absolute top-0 right-0 z-10 flex h-full flex-col border-l'
						initial={false}
						animate={{
							width: panelExpanded ? PANEL_WIDTH_EXPANDED : PANEL_WIDTH_COLLAPSED,
						}}
						transition={tweenConfig}
					>
						{/* Panel content - both layers always mounted, crossfade via opacity */}
						<div className='relative flex h-full min-h-0 flex-1 flex-col overflow-hidden'>
							{/* Collapsed layer: Icon rail with header - always rendered */}
							<motion.div
								className='absolute inset-0 flex h-full flex-col'
								initial={false}
								animate={{
									opacity: panelExpanded ? 0 : 1,
									pointerEvents: panelExpanded ? 'none' : 'auto',
								}}
								transition={tweenConfig}
							>
								<CollapsedHeader onToggle={togglePanel} />
								<ElementLibrary collapsed className='min-h-0 flex-1 py-2' />
							</motion.div>

							{/* Expanded layer: Full Form Elements panel - always rendered */}
							<motion.div
								className='absolute inset-0 flex h-full flex-col overflow-hidden'
								initial={false}
								animate={{
									opacity: panelExpanded ? 1 : 0,
									pointerEvents: panelExpanded ? 'auto' : 'none',
								}}
								transition={tweenConfig}
							>
								<ElementLibraryHeader
									isExpanded={panelExpanded}
									onToggle={togglePanel}
									totalCount={totalElementCount}
								/>
								<div className='min-h-0 flex-1 overflow-hidden'>
									<ElementLibrary />
								</div>
							</motion.div>
						</div>
					</motion.div>
				</div>

				{/* Drag Overlay */}
				<DragOverlay dropAnimation={DEFAULT_DROP_ANIMATION}>
					<AnimatePresence>
						{activeId && (draggedType || draggedLayoutTemplate) && (
							<motion.div
								key={activeId}
								className='rotate-3 transform'
								initial={{ opacity: 0, scale: 0.9, y: 4 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0 }}
								transition={{
									...springs.stiff,
									opacity: { duration: durations.instant, ease: easings.easeOut },
								}}
							>
								{/* Layout template preview */}
								{draggedLayoutTemplate ? (
									<div
										className='bg-background border-primary/50 flex items-center gap-2 rounded-lg border-2 px-3 py-2
											shadow-2xl'
									>
										<draggedLayoutTemplate.icon className='text-foreground h-4 w-4' />
										<span className='text-sm font-medium'>{draggedLayoutTemplate.label}</span>
									</div>
								) : draggedType ? (
									/* Show compact icon preview when dragging from collapsed rail */
									activeId.toString().includes('element-library-icon-') ? (
										<div
											className='bg-background border-primary/50 flex h-12 w-12 items-center justify-center rounded-lg
												border-2 shadow-2xl'
										>
											{draggedType.icon && <draggedType.icon className='text-foreground h-5 w-5' />}
										</div>
									) : (
										<DraggableFieldType
											typeInfo={draggedType}
											isDragging
											className='border-primary/50 bg-background border-2 shadow-2xl'
										/>
									)
								) : null}
							</motion.div>
						)}
					</AnimatePresence>
				</DragOverlay>
			</DndContext>
		</TooltipProvider>
	);
}
