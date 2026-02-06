'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GridSelection } from '@glideapps/glide-data-grid';
import {
	RiAddLine,
	RiArrowDownSLine,
	RiCloseCircleLine,
	RiDeleteBin6Line,
	RiFilter3Line,
	RiLinksLine,
	RiSearch2Line,
} from '@remixicon/react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { cleanTable } from '@/lib/gql/data.types';
import { getAvailableRelations } from '@/lib/gql/field-selector';
import { useMeta } from '@/lib/gql/hooks/dashboard/use-dashboard-meta-query';
import { Button } from '@constructive-io/ui/button';
import { Checkbox } from '@constructive-io/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@constructive-io/ui/collapsible';
import { Input } from '@constructive-io/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@constructive-io/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@constructive-io/ui/select';

// Filter value can be string, number, boolean, null, or undefined
// This matches the usage in buildWhereFromFilters and GraphQL filter operations
type FilterValue = string | number | boolean | null | undefined;

export interface DataGridV2Filter {
	id: string;
	value: FilterValue;
}

type Updater<T> = T | ((prev: T) => T);

export interface DataGridV2ControlsProps {
	openSearch?: () => void;
	filters: DataGridV2Filter[];
	setFilters: (updater: Updater<DataGridV2Filter[]>) => void;
	filtersOpen: boolean;
	setFiltersOpen: (open: boolean) => void;
	addFilter: () => void;
	clearAllFilters: () => void;
	applyFilters: () => void;
	columnKeys: string[];
	showSelection: boolean;
	gridSelection: GridSelection | null;
	setGridSelection: (selection: GridSelection | null) => void;
	deleteSelected: () => void;
	// Note: form open is now controlled via Zustand store
	// Relations control
	tableName: string;
	enabledRelations: string[];
	setEnabledRelations: (relations: string[]) => void;
}

type FilterRowProps = {
	columns: readonly string[];
	value: DataGridV2Filter;
	onChange: (updates: Partial<DataGridV2Filter>) => void;
	onRemove: () => void;
};

const FilterRow = memo(function FilterRow({ columns, value, onChange, onRemove }: FilterRowProps) {
	return (
		<div className='flex items-center gap-2'>
			<Select value={value.id} onValueChange={(v) => onChange({ id: v })}>
				<SelectTrigger className='w-[150px]'>
					<SelectValue placeholder='Column' />
				</SelectTrigger>
				<SelectContent>
					{columns.map((k) => (
						<SelectItem key={k} value={k}>
							{k}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Input
				className='w-[150px]'
				placeholder='Value...'
				value={typeof value.value === 'string' || typeof value.value === 'number' ? String(value.value) : ''}
				onChange={(e) => onChange({ value: e.target.value })}
			/>

			<Button variant='ghost' size='icon' onClick={onRemove} aria-label='Remove filter'>
				<RiCloseCircleLine className='h-4 w-4' />
			</Button>
		</div>
	);
});

// Virtualized relation list for performance with many relations
function VirtualizedRelationList({
	relations,
	localEnabledRelations,
	onToggleRelation,
}: {
	relations: Array<{ fieldName: string; type: string; referencedTable?: string }>;
	localEnabledRelations: string[];
	onToggleRelation: (fieldName: string, checked: boolean) => void;
}) {
	const parentRef = useRef<HTMLDivElement | null>(null);

	const rowVirtualizer = useVirtualizer({
		count: relations.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 44, // approx height per row
		overscan: 6,
	});

	return (
		<div ref={parentRef} className='bg-muted h-[220px] overflow-auto rounded-lg' style={{ contain: 'strict' }}>
			<div style={{ height: rowVirtualizer.getTotalSize(), width: '100%', position: 'relative' }}>
				{rowVirtualizer.getVirtualItems().map((vi) => {
					const rel = relations[vi.index];
					if (!rel) return null;
					return (
						<div
							key={vi.key}
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								height: vi.size,
								transform: `translateY(${vi.start}px)`,
							}}
							className='flex items-center gap-2 px-2 py-2'
						>
							<Checkbox
								checked={localEnabledRelations.includes(rel.fieldName)}
								onCheckedChange={(checked) => onToggleRelation(rel.fieldName, !!checked)}
							/>
							<span className='text-sm font-medium'>{rel.fieldName}</span>
							{rel.referencedTable && <span className='text-muted-foreground text-xs'>→ {rel.referencedTable}</span>}
						</div>
					);
				})}
			</div>
		</div>
	);
}

export function DataGridV2Controls(props: DataGridV2ControlsProps) {
	const {
		openSearch,
		filters,
		setFilters,
		filtersOpen,
		setFiltersOpen,
		addFilter,
		clearAllFilters,
		applyFilters,
	columnKeys,
	showSelection,
	gridSelection,
	setGridSelection: _setGridSelection,
	deleteSelected,
		tableName,
		enabledRelations,
		setEnabledRelations,
	} = props;

	// Relations Control State and Data
	const { data: meta } = useMeta();
	const [relationsOpen, setRelationsOpen] = useState(false);
	const [localEnabledRelations, setLocalEnabledRelations] = useState<string[]>(enabledRelations || []);
	const [filterQuery, setFilterQuery] = useState('');
	const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

	type RelationKind = 'belongsTo' | 'hasOne' | 'hasMany' | 'manyToMany';
	type RelationEntry = { fieldName: string; type: RelationKind; referencedTable?: string };

	const relationsByType = useMemo(() => {
		if (!meta?._meta?.tables || !tableName) return {} as Record<RelationKind, RelationEntry[]>;
		const metaTable = meta._meta.tables.find((t: any) => t?.name === tableName);
		if (!metaTable) return {} as Record<RelationKind, RelationEntry[]>;
		const cleaned = cleanTable(metaTable);
		const available = getAvailableRelations(cleaned);
		return available.reduce(
			(acc, rel) => {
				(acc[rel.type as RelationKind] ||= []).push(rel as RelationEntry);
				return acc;
			},
			{} as Record<RelationKind, RelationEntry[]>,
		);
	}, [meta, tableName]);

	const filteredRelationsByType = useMemo(() => {
		if (!filterQuery.trim()) return relationsByType;
		const q = filterQuery.toLowerCase();
		const filtered: Record<string, RelationEntry[]> = {};
		(Object.entries(relationsByType) as [RelationKind, RelationEntry[]][]).forEach(([type, list]) => {
			const matches = list.filter(
				(r) => r.fieldName.toLowerCase().includes(q) || r.referencedTable?.toLowerCase().includes(q),
			);
			if (matches.length) filtered[type] = matches;
		});
		return filtered;
	}, [relationsByType, filterQuery]);

	// Reset local state when popover opens - only trigger on open/close, not on data changes
	useEffect(() => {
		if (relationsOpen) {
			setLocalEnabledRelations(enabledRelations || []);
			setFilterQuery('');
			const init: Record<string, boolean> = {};
			Object.keys(relationsByType).forEach((t) => (init[t] = false));
			setExpandedSections(init);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only trigger on popover state change
	}, [relationsOpen]);

	useEffect(() => {
		// Reset when table changes
		setLocalEnabledRelations([]);
		setExpandedSections({});
		setFilterQuery('');
	}, [tableName]);

	const selectedRowCount = useMemo(() => {
		if (!gridSelection) return 0;
		try {
			return gridSelection.rows.toArray().length;
		} catch {
			return gridSelection.rows?.length ?? 0;
		}
	}, [gridSelection]);

	const toggleSection = useCallback((t: string) => {
		setExpandedSections((prev) => ({ ...prev, [t]: !prev[t] }));
	}, []);

	const onToggleRelation = useCallback((field: string, checked: boolean) => {
		setLocalEnabledRelations((cur) => (checked ? [...cur, field] : cur.filter((r) => r !== field)));
	}, []);

	const applyRelations = useCallback(() => {
		setEnabledRelations(localEnabledRelations);
		setRelationsOpen(false);
	}, [localEnabledRelations, setEnabledRelations]);

	const clearRelations = useCallback(() => {
		setLocalEnabledRelations([]);
	}, []);

	const selectedCountFor = useCallback(
		(list: Array<{ fieldName: string }>) => list.filter((r) => localEnabledRelations.includes(r.fieldName)).length,
		[localEnabledRelations],
	);

	const hasAnyRelations = useMemo(() => Object.keys(relationsByType).length > 0, [relationsByType]);

	return (
		<>
			<div
				data-part-id='data-grid-v2-controls'
				className='flex shrink-0 flex-wrap items-center justify-between gap-4 py-4'
			>
				<Button variant='outline' size='sm' onClick={() => openSearch?.()}>
					<RiSearch2Line className='text-muted-foreground/60 -ms-1.5 size-5' aria-hidden='true' />
					Search
				</Button>

				<div className='flex items-center gap-2'>
					{hasAnyRelations && (
						<Popover open={relationsOpen} onOpenChange={setRelationsOpen}>
							<PopoverTrigger asChild>
								<Button variant='outline' size='sm' className='relative'>
									<RiLinksLine className='text-muted-foreground/60 -ms-1.5 size-5' aria-hidden='true' />
									Relations
									{(enabledRelations?.length ?? 0) > 0 && (
										<span
											className='border-border/60 bg-background text-muted-foreground/70 ms-2 -me-1 inline-flex h-5
												max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium'
										>
											{enabledRelations.length}
										</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-auto min-w-[24rem] p-4' align='start'>
								<div className='grid gap-4'>
									<div className='space-y-2'>
										<h4 className='leading-none font-medium'>Relation Columns</h4>
										<p className='text-muted-foreground text-sm'>Select columns to load related data</p>
									</div>
									<div className='flex gap-2'>
										<Input
											placeholder='Filter relations...'
											value={filterQuery}
											onChange={(e) => setFilterQuery(e.target.value)}
										/>
										{filterQuery && (
											<Button variant='ghost' size='sm' onClick={() => setFilterQuery('')}>
												Clear
											</Button>
										)}
									</div>
									{Object.keys(filteredRelationsByType).length === 0 ? (
										<div className='text-muted-foreground py-2 text-sm'>No relations found</div>
									) : (
										<div className='grid max-h-[350px] gap-2 overflow-auto pr-1'>
											{Object.entries(filteredRelationsByType).map(([type, list]) => (
												<Collapsible
													key={type}
													open={!!expandedSections[type]}
													onOpenChange={() => toggleSection(type)}
												>
													<CollapsibleTrigger
														className='hover:bg-accent/50 flex w-full items-center justify-between rounded-md px-1 py-2'
													>
														<div className='flex items-center gap-2'>
															<h5 className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>
																{type}
															</h5>
															<span className='text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-xs'>
																{selectedCountFor(list)} / {list.length}
															</span>
														</div>
														<RiArrowDownSLine
															className='text-muted-foreground h-4 w-4 transition-transform duration-200'
															style={{ transform: expandedSections[type] ? 'rotate(0deg)' : 'rotate(-90deg)' }}
														/>
													</CollapsibleTrigger>
													<CollapsibleContent>
														<div className='pb-2 pl-1'>
															<VirtualizedRelationList
																relations={list}
																localEnabledRelations={localEnabledRelations}
																onToggleRelation={onToggleRelation}
															/>
														</div>
													</CollapsibleContent>
												</Collapsible>
											))}
										</div>
									)}
									<div className='flex items-center justify-between pt-2'>
										<Button
											variant='ghost'
											size='sm'
											onClick={clearRelations}
											disabled={localEnabledRelations.length === 0}
										>
											Clear all
										</Button>
										<div className='flex items-center gap-2'>
											<Button variant='ghost' size='sm' onClick={() => setRelationsOpen(false)}>
												Cancel
											</Button>
											<Button size='sm' onClick={applyRelations}>
												Apply
											</Button>
										</div>
									</div>
								</div>
							</PopoverContent>
						</Popover>
					)}
					{showSelection && (
						<Button
							variant='destructive-outline'
							size='sm'
							disabled={selectedRowCount === 0}
							onClick={() => selectedRowCount > 0 && deleteSelected()}
						>
							<RiDeleteBin6Line className='-ms-1.5 size-5' aria-hidden='true' />
							Delete
							{selectedRowCount > 0 ? ` (${selectedRowCount})` : ''}
						</Button>
					)}
					<Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
						<PopoverTrigger asChild>
							<Button variant='outline' size='sm' className='relative'>
								<RiFilter3Line className='text-muted-foreground/60 -ms-1.5 size-5' aria-hidden='true' />
								Filters
								{filters.length > 0 && (
									<span
											className='border-border/60 bg-background text-muted-foreground/70 ms-2 -me-1 inline-flex h-5
											max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium'
									>
										{filters.length}
									</span>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent className='w-auto min-w-[24rem] p-4' align='end'>
							<div className='grid gap-4'>
								<div className='space-y-2'>
									<h4 className='leading-none font-medium'>Filters</h4>
									<p className='text-muted-foreground text-sm'>Add filters to refine the data.</p>
								</div>
								<div className='grid gap-2'>
									{filters.map((f, i) => (
										<FilterRow
											key={`${f.id}-${i}`}
											columns={columnKeys}
											value={f}
											onChange={(updates) =>
												setFilters((fs) => fs.map((x, idx) => (idx === i ? { ...x, ...updates } : x)))
											}
											onRemove={() => setFilters((fs) => fs.filter((_, idx) => idx !== i))}
										/>
									))}
								</div>
								<div className='flex items-center justify-between pt-2'>
									<Button variant='outline' size='sm' onClick={addFilter}>
										<RiAddLine className='mr-2 h-4 w-4' /> Add filter
									</Button>
									<div className='flex items-center gap-2'>
										<Button variant='ghost' size='sm' onClick={clearAllFilters} disabled={filters.length === 0}>
											Clear all
										</Button>
										<Button size='sm' onClick={applyFilters}>
											Apply
										</Button>
									</div>
								</div>
							</div>
						</PopoverContent>
					</Popover>
				</div>
			</div>
		</>
	);
}
