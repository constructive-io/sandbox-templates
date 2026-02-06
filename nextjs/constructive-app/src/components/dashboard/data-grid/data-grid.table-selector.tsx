'use client';

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RiAddLine, RiDatabaseLine, RiSearchLine } from '@remixicon/react';
import { ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { cn } from '@/lib/utils';
import { useSidebarSectionActions, useSidebarSections } from '@/store/app-store';
import { Button } from '@constructive-io/ui/button';
import { Collapsible, CollapsibleTrigger } from '@constructive-io/ui/collapsible';
import { Input } from '@constructive-io/ui/input';
import { ProgressiveBlur } from '@constructive-io/ui/progressive-blur';
import { ScrollArea } from '@constructive-io/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@constructive-io/ui/tooltip';
import type { TableCategory } from '@/components/shared/category-filter';

// Height of each table item in pixels (for height calculations)
const TABLE_ITEM_HEIGHT = 32;
// Height of section header (collapsible trigger)
const SECTION_HEADER_HEIGHT = 32;
// Gap between sections
const SECTION_GAP = 8;
// Empty state height
const EMPTY_STATE_HEIGHT = 100;

const BLUR_HEIGHT_PERCENT = 0.28;
const BLUR_HEIGHT_MIN_PX = 64;
const BLUR_HEIGHT_MAX_PX = 140;

export type TableWithCategory = {
	name: string;
	category?: TableCategory;
};

interface TableItemProps {
	table: { value: string; label: string; category?: TableCategory };
	activeTable: string;
	onTableSelect: (tableName: string) => void;
	/** Ref to attach to this item (used for scroll-into-view on active item) */
	itemRef?: React.RefObject<HTMLDivElement | null>;
}

const TableItem = memo(function TableItem({ table, activeTable, onTableSelect, itemRef }: TableItemProps) {
	const isActive = activeTable === table.value;

	return (
		<div
			ref={isActive ? itemRef : undefined}
			data-testid='table-item'
			className={cn(
				`group relative my-1 flex h-8 cursor-pointer items-center justify-between rounded-lg px-2 transition-all
				duration-200`,
				isActive
					? 'bg-primary/10 text-foreground ring-primary/30 dark:bg-primary/15 dark:ring-primary/40 ring-1'
					: 'text-muted-foreground hover:text-foreground',
			)}
			onClick={() => onTableSelect(table.value)}
		>
			<div className='flex min-w-0 flex-1 items-center'>
				<Tooltip>
					<TooltipTrigger asChild>
						<span className='truncate text-xs'>{table.label}</span>
					</TooltipTrigger>
					<TooltipContent side='right' align='start'>
						<span className='text-xs font-medium'>{table.label}</span>
					</TooltipContent>
				</Tooltip>
			</div>
		</div>
	);
});

export interface TableSelectorProps {
	tables: string[] | TableWithCategory[];
	activeTable: string;
	onTableChange: (table: string) => void;
	isLoading?: boolean;
	categoriesEnabled?: boolean;
	/** When true, scroll the active table into view and expand its section */
	shouldScrollToActive?: boolean;
}

export const TableSelector = memo(function TableSelector({
	tables,
	activeTable,
	onTableChange,
	isLoading = false,
	categoriesEnabled = false,
	shouldScrollToActive = false,
}: TableSelectorProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const containerRef = useRef<HTMLDivElement>(null);
	const [containerHeight, setContainerHeight] = useState(0);

	// Sidebar section expand/collapse state (persisted)
	const sidebarSections = useSidebarSections();
	const { toggleSidebarSection, setSidebarSectionExpanded } = useSidebarSectionActions();

	// Transform tables to internal format
	const tableData = useMemo(() => {
		return tables.map((table) => {
			const isObject = typeof table === 'object';
			const name = isObject ? table.name : table;
			const category = isObject ? table.category : undefined;
			return {
				value: name,
				label: name,
				category,
			};
		});
	}, [tables]);

	// Check if any tables have category data
	const hasCategoryData = useMemo(() => {
		return tableData.some((table) => table.category !== undefined);
	}, [tableData]);

	// Split tables by category: APP vs CORE + MODULE (system)
	// Only split when categoriesEnabled AND we have category data
	const { appTables, systemTables } = useMemo(() => {
		// When categories aren't enabled or no category data, show all tables in "Your Tables"
		if (!categoriesEnabled || !hasCategoryData) {
			return { appTables: tableData, systemTables: [] };
		}

		const app: typeof tableData = [];
		const system: typeof tableData = [];

		tableData.forEach((table) => {
			if (table.category === 'APP') {
				app.push(table);
			} else {
				// CORE + MODULE go to system tables
				system.push(table);
			}
		});

		return { appTables: app, systemTables: system };
	}, [tableData, categoriesEnabled, hasCategoryData]);

	// Apply search filter to both groups
	const applyFilters = useCallback(
		(items: typeof tableData) => {
			let filtered = items;

			// Apply search filter
			if (searchQuery) {
				filtered = filtered.filter((table) => table.label.toLowerCase().includes(searchQuery.toLowerCase()));
			}

			return filtered;
		},
		[searchQuery],
	);

	const filteredAppTables = useMemo(() => applyFilters(appTables), [applyFilters, appTables]);
	const filteredSystemTables = useMemo(() => applyFilters(systemTables), [applyFilters, systemTables]);

	// Combined filtered tables for empty state check
	const allFilteredTables = useMemo(
		() => [...filteredAppTables, ...filteredSystemTables],
		[filteredAppTables, filteredSystemTables],
	);

	// Measure container height on mount and resize
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const updateHeight = () => {
			setContainerHeight(container.clientHeight);
		};

		updateHeight();

		const resizeObserver = new ResizeObserver(updateHeight);
		resizeObserver.observe(container);

		return () => resizeObserver.disconnect();
	}, []);

	// Check if system tables section should be shown
	const showSystemSection = (systemTables.length > 0 || searchQuery) && hasCategoryData && categoriesEnabled;

	// Determine which section contains the active table
	const activeTableSection = useMemo((): 'app' | 'system' | null => {
		if (!activeTable) return null;
		if (appTables.some((t) => t.value === activeTable)) return 'app';
		if (systemTables.some((t) => t.value === activeTable)) return 'system';
		return null;
	}, [activeTable, appTables, systemTables]);

	// Track if we've handled the scroll request to avoid repeated scrolls
	const hasScrolledRef = useRef(false);

	// Reset scroll tracking when activeTable changes
	useEffect(() => {
		hasScrolledRef.current = false;
	}, [activeTable]);

	// Auto-expand section containing active table and trigger scroll
	useEffect(() => {
		if (!shouldScrollToActive || !activeTableSection || hasScrolledRef.current) return;

		// Mark as handled to prevent repeated scrolls
		hasScrolledRef.current = true;

		// Expand the section if it's collapsed
		if (activeTableSection === 'app' && !sidebarSections.app) {
			setSidebarSectionExpanded('app', true);
		} else if (activeTableSection === 'system' && !sidebarSections.system) {
			setSidebarSectionExpanded('system', true);
		}
	}, [shouldScrollToActive, activeTableSection, sidebarSections.app, sidebarSections.system, setSidebarSectionExpanded]);

	// Calculate dynamic heights for sections
	const { topMaxHeight, bottomMaxHeight } = useMemo(() => {
		if (containerHeight === 0) {
			return { topMaxHeight: undefined, bottomMaxHeight: undefined };
		}

		// Available height = container - section headers - gaps
		const headersHeight = SECTION_HEADER_HEIGHT + (showSystemSection ? SECTION_HEADER_HEIGHT + SECTION_GAP : 0);
		const availableHeight = containerHeight - headersHeight;
		const halfAvailable = availableHeight / 2;

		// Calculate natural content heights
		const topContentHeight =
			filteredAppTables.length > 0 ? filteredAppTables.length * TABLE_ITEM_HEIGHT : EMPTY_STATE_HEIGHT;
		const bottomContentHeight = showSystemSection
			? filteredSystemTables.length > 0
				? filteredSystemTables.length * TABLE_ITEM_HEIGHT
				: EMPTY_STATE_HEIGHT
			: 0;

		// Rule: Top list never exceeds 50% of available space
		// Rule: If top is short, bottom takes remaining space
		// Rule: If top is long, it's capped at 50%, bottom gets rest

		let topMax: number;
		let bottomMax: number;

		if (!showSystemSection) {
			// Only top section - it takes all available space
			topMax = availableHeight;
			bottomMax = 0;
		} else if (!sidebarSections.system) {
			// System section is collapsed - top takes all space
			topMax = availableHeight;
			bottomMax = 0;
		} else if (!sidebarSections.app) {
			// App section is collapsed - bottom takes all space
			topMax = 0;
			bottomMax = availableHeight;
		} else {
			// Both sections expanded
			if (topContentHeight <= halfAvailable && bottomContentHeight <= halfAvailable) {
				// Both fit in their half - use natural heights
				topMax = topContentHeight;
				bottomMax = bottomContentHeight;
			} else if (topContentHeight <= halfAvailable) {
				// Top is short, bottom is long - top uses natural, bottom gets rest
				topMax = topContentHeight;
				bottomMax = availableHeight - topContentHeight;
			} else {
				// Top is long - cap at 50%, bottom gets the other 50%
				topMax = halfAvailable;
				bottomMax = halfAvailable;
			}
		}

		return {
			topMaxHeight: Math.max(topMax, 0),
			bottomMaxHeight: Math.max(bottomMax, 0),
		};
	}, [
		containerHeight,
		filteredAppTables.length,
		filteredSystemTables.length,
		showSystemSection,
		sidebarSections.app,
		sidebarSections.system,
	]);

	const handleTableSelect = useCallback(
		(tableName: string) => {
			onTableChange(tableName);
		},
		[onTableChange],
	);

	const handleNewTable = useCallback(() => {
		// TODO: Implement new table creation
		console.log('New table creation not implemented yet');
	}, []);

	if (isLoading) {
		return (
			<div data-part-id='dashboard-table-selector-loading' className='bg-background flex h-full flex-col'>
				{/* Header skeleton */}
				<div className='border-border/60 flex-shrink-0 border-b p-6'>
					<div className='bg-muted mb-6 h-8 w-32 animate-pulse rounded'></div>

					{/* Schema selector skeleton */}
					<div className='bg-muted mb-4 h-10 w-full animate-pulse rounded-md'></div>

					{/* New table button skeleton */}
					<div className='bg-muted mb-4 h-10 w-full animate-pulse rounded-md'></div>

					{/* Search input skeleton */}
					<div className='bg-muted h-10 w-full animate-pulse rounded-md'></div>
				</div>

				{/* Table list skeleton */}
				<div className='flex-1 space-y-2 p-6'>
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className='flex items-center justify-between rounded-lg border p-3'>
							<div className='flex items-center gap-3'>
								<div className='bg-muted h-4 w-4 animate-pulse rounded'></div>
								<div className='bg-muted h-4 w-24 animate-pulse rounded'></div>
							</div>
							<div className='bg-muted h-6 w-20 animate-pulse rounded-full'></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<TooltipProvider delayDuration={150}>
			<div
				data-part-id='dashboard-table-selector'
				className='bg-background flex h-full max-h-[calc(100vh-4rem)] flex-col'
			>
				{/* Header */}
				<div className='flex-shrink-0 py-4'>
					<div className='flex flex-col gap-2 pr-2 pb-2'>
						{/* New table button */}
						<Button onClick={handleNewTable} className='h-8 w-full justify-start gap-2' variant='outline'>
							<RiAddLine size={16} />
							New table
						</Button>
					</div>

					{/* Search input */}
					<div className='relative pr-2'>
						<RiSearchLine
							size={16}
							className='text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transform'
						/>
						<Input
							size='sm'
							placeholder='Search tables...'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='pl-10'
						/>
					</div>
				</div>

				{/* Table list */}
				<div
					ref={containerRef}
					data-part-id='table-selector-table-list'
					className='mt-4 flex min-h-0 flex-1 flex-col gap-2 overflow-hidden pr-2'
				>
					{allFilteredTables.length === 0 ? (
						<div className='flex flex-col items-center justify-center py-12 text-center'>
							<div className='bg-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full'>
								<RiSearchLine size={20} className='text-muted-foreground' />
							</div>
							<p className='text-muted-foreground mb-1 text-sm font-medium'>No tables found</p>
							<p className='text-muted-foreground/80 text-xs'>
								{searchQuery ? 'Try adjusting your search terms' : 'No tables available in this schema'}
							</p>
						</div>
					) : (
						<div className='flex min-h-0 flex-1 flex-col gap-2 overflow-hidden'>
							{/* Your Tables Section - APP tables, expanded by default */}
							<TableListByCategory
								title='Your Tables'
								tables={filteredAppTables}
								activeTable={activeTable}
								isExpanded={sidebarSections.app}
								onToggleExpand={() => toggleSidebarSection('app')}
								onTableSelect={handleTableSelect}
								emptyMessage='No tables yet'
								hasSearchTerm={searchQuery.length > 0}
								maxContentHeight={topMaxHeight}
								shouldScrollToActive={shouldScrollToActive && activeTableSection === 'app'}
							/>

							{/* System Tables Section - CORE + MODULE tables, collapsed by default */}
							{showSystemSection && (
								<TableListByCategory
									title='System Tables'
									tables={filteredSystemTables}
									activeTable={activeTable}
									isExpanded={sidebarSections.system}
									onToggleExpand={() => toggleSidebarSection('system')}
									onTableSelect={handleTableSelect}
									emptyMessage='No system tables'
									hasSearchTerm={searchQuery.length > 0}
									maxContentHeight={bottomMaxHeight}
									shouldScrollToActive={shouldScrollToActive && activeTableSection === 'system'}
								/>
							)}
						</div>
					)}
				</div>
			</div>
		</TooltipProvider>
	);
});

interface TableListByCategoryProps {
	title: string;
	tables: { value: string; label: string; category?: TableCategory }[];
	activeTable: string;
	isExpanded: boolean;
	onToggleExpand: () => void;
	onTableSelect: (tableName: string) => void;
	emptyMessage?: string;
	hasSearchTerm?: boolean;
	maxContentHeight?: number;
	/** When true, scroll the active table into view */
	shouldScrollToActive?: boolean;
}

function TableListByCategory({
	title,
	tables,
	activeTable,
	isExpanded,
	onToggleExpand,
	onTableSelect,
	emptyMessage = 'No tables',
	hasSearchTerm = false,
	maxContentHeight,
	shouldScrollToActive = false,
}: TableListByCategoryProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const activeItemRef = useRef<HTMLDivElement>(null);
	const [showBottomBlur, setShowBottomBlur] = useState(false);
	const [scrollAreaHeight, setScrollAreaHeight] = useState(0);

	const hasSelectedItem = activeTable ? tables.some((t) => t.value === activeTable) : false;

	// Scroll active item into view when requested
	useEffect(() => {
		if (!shouldScrollToActive || !isExpanded || !activeItemRef.current) return;

		// Wait for animation to complete before scrolling
		const timer = setTimeout(() => {
			activeItemRef.current?.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
			});
		}, 350); // Match the collapsible animation duration

		return () => clearTimeout(timer);
	}, [shouldScrollToActive, isExpanded, activeTable]);

	const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
		const el = event.currentTarget;
		const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
		setShowBottomBlur(!(atBottom || el.scrollHeight <= el.clientHeight));
	}, []);

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
		setShowBottomBlur(!(atBottom || el.scrollHeight <= el.clientHeight));
	}, [tables.length, isExpanded, maxContentHeight]);

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;

		const update = () => setScrollAreaHeight(el.clientHeight);
		update();

		const ro = new ResizeObserver(update);
		ro.observe(el);
		return () => ro.disconnect();
	}, [isExpanded, maxContentHeight]);

	const blurHeight = useMemo(() => {
		if (!scrollAreaHeight) return '28%';
		const percentPx = scrollAreaHeight * BLUR_HEIGHT_PERCENT;
		const clamped = Math.min(scrollAreaHeight, Math.min(BLUR_HEIGHT_MAX_PX, Math.max(BLUR_HEIGHT_MIN_PX, percentPx)));
		return `${Math.round(clamped)}px`;
	}, [scrollAreaHeight]);

	// Calculate max-height style
	const scrollAreaStyle = maxContentHeight !== undefined ? { maxHeight: `${maxContentHeight}px` } : undefined;

	return (
		<Collapsible open={isExpanded} onOpenChange={onToggleExpand} className='flex min-h-0 shrink-0 flex-col'>
			<CollapsibleTrigger
				className={cn(
					'group flex w-full items-center gap-2 rounded-lg py-1.5 pr-2 pl-1 transition-colors duration-150',
					'bg-muted hover:bg-muted/50',
					isExpanded && 'bg-muted/50',
				)}
			>
				<motion.div
					animate={{ rotate: isExpanded ? 90 : 0 }}
					transition={{ type: 'spring', stiffness: 400, damping: 25 }}
					className='flex shrink-0 items-center justify-center'
				>
					<ChevronRight className='text-muted-foreground/60 h-3.5 w-3.5' />
				</motion.div>
				<span className='text-muted-foreground text-xs font-medium'>{title}</span>
				<span className='ml-auto flex items-center gap-1.5'>
					{!isExpanded && hasSelectedItem && (
						<span className='bg-primary/50 h-1.5 w-1.5 rounded-full' aria-label='Contains selected item' />
					)}
					<span className='text-muted-foreground/70 text-[10px] tabular-nums'>{tables.length}</span>
				</span>
			</CollapsibleTrigger>

			<AnimatePresence initial={false}>
				{isExpanded && (
					<motion.div
						data-testid={`collapsible-content-${title}`}
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
						{tables.length > 0 ? (
							<div className='relative mt-2 min-h-0'>
								<ScrollArea
									ref={scrollRef}
									onScroll={handleScroll}
									style={scrollAreaStyle}
									className='scrollbar-neutral-thin min-h-0'
								>
									<div className='space-y-0.5 pr-1 pb-2 pl-1'>
										{tables.map((table) => (
											<TableItem
												key={table.value}
												table={table}
												activeTable={activeTable}
												onTableSelect={onTableSelect}
												itemRef={table.value === activeTable ? activeItemRef : undefined}
											/>
										))}
									</div>
								</ScrollArea>
								{showBottomBlur && tables.length > 3 && (
									<ProgressiveBlur position='bottom' height={blurHeight} surface='background' intensity={0.22} />
								)}
							</div>
						) : (
							<div className='flex flex-col items-center justify-center py-6 text-center'>
								<div className='bg-muted mb-2 flex h-10 w-10 items-center justify-center rounded-full'>
									{hasSearchTerm ? (
										<RiSearchLine className='text-muted-foreground h-5 w-5' />
									) : (
										<RiDatabaseLine className='text-muted-foreground h-5 w-5' />
									)}
								</div>
								<p className='text-muted-foreground text-xs'>{emptyMessage}</p>
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</Collapsible>
	);
}
