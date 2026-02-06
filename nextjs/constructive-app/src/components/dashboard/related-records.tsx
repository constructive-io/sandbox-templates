'use client';

import { useEffect, useMemo, useState } from 'react';
import { RiCloseLine, RiCodeLine, RiExpandDiagonalLine, RiLoader4Line, RiSearchLine } from '@remixicon/react';
import { matchSorter } from 'match-sorter';

import { useJsonViewScroll } from '@/hooks/use-json-view-scroll';
import { useTable } from '@/lib/gql/hooks';
import { useMeta } from '@/lib/gql/hooks/dashboard/use-dashboard-meta-query';
import { Button } from '@constructive-io/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@constructive-io/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@constructive-io/ui/popover';
import { ScrollArea } from '@constructive-io/ui/scroll-area';

/**
 * Gets searchable field names from table metadata
 * Prioritizes text-like fields that are good for searching
 */
function getSearchableFields(tableMeta: any): string[] {
	if (!tableMeta?.fields) return [];

	// Build Map for O(1) field lookup
	const fieldsByName = new Map<string, any>();
	for (const field of tableMeta.fields) {
		if (field?.name) fieldsByName.set(field.name, field);
	}

	const searchableFields: string[] = [];
	const searchableSet = new Set<string>(); // O(1) duplicate check
	const textTypes = ['String', 'Text', 'Varchar', 'Char'];
	const priorityFields = ['name', 'title', 'label', 'description', 'email'];

	// First, add priority fields if they exist
	for (const fieldName of priorityFields) {
		if (fieldsByName.has(fieldName)) {
			searchableFields.push(fieldName);
			searchableSet.add(fieldName);
		}
	}

	// Then add other text-like fields
	for (const field of tableMeta.fields) {
		if (!field?.name || searchableSet.has(field.name)) continue;

		const gqlType = field.type?.gqlType;
		if (gqlType && textTypes.some((type) => gqlType.includes(type))) {
			searchableFields.push(field.name);
			searchableSet.add(field.name);
		}
	}

	// If no text fields found, add the primary key and first few fields
	if (searchableFields.length === 0) {
		const pkField = tableMeta.primaryKeyConstraints?.[0]?.fields?.[0]?.name;
		if (pkField) {
			searchableFields.push(pkField);
			searchableSet.add(pkField);
		}

		// Add first few fields as fallback
		for (const field of tableMeta.fields.slice(0, 3)) {
			if (field?.name && !searchableSet.has(field.name)) {
				searchableFields.push(field.name);
				searchableSet.add(field.name);
			}
		}
	}

	return searchableFields;
}

/**
 * Gets display-friendly field names from table metadata
 * These are used for showing record labels
 */
function getDisplayFields(tableMeta: any): string[] {
	if (!tableMeta?.fields) return [];

	// Build Map for O(1) field lookup
	const fieldsByName = new Map<string, any>();
	for (const field of tableMeta.fields) {
		if (field?.name) fieldsByName.set(field.name, field);
	}

	const displayFields: string[] = [];
	const displaySet = new Set<string>(); // O(1) duplicate check
	const priorityFields = ['name', 'title', 'label', 'description'];

	// First, add priority fields if they exist
	for (const fieldName of priorityFields) {
		if (fieldsByName.has(fieldName)) {
			displayFields.push(fieldName);
			displaySet.add(fieldName);
		}
	}

	// If no priority fields found, add primary key and first text field
	if (displayFields.length === 0) {
		const pkField = tableMeta.primaryKeyConstraints?.[0]?.fields?.[0]?.name;
		if (pkField) {
			displayFields.push(pkField);
			displaySet.add(pkField);
		}

		// Add first text-like field
		const textField = tableMeta.fields.find((field: any) => {
			const gqlType = field?.type?.gqlType;
			return gqlType && ['String', 'Text', 'Varchar'].some((type) => gqlType.includes(type));
		});
		if (textField && !displaySet.has(textField.name)) {
			displayFields.push(textField.name);
			displaySet.add(textField.name);
		}

		// Fallback to first field
		if (displayFields.length === 0 && tableMeta.fields[0]?.name) {
			displayFields.push(tableMeta.fields[0].name);
		}
	}

	return displayFields;
}

/**
 * Gets a display-friendly label from a record using metadata-derived fields
 */
function getRecordLabel(record: any, tableMeta: any): string {
	if (!record || typeof record !== 'object') {
		return String(record || '');
	}

	const displayFields = getDisplayFields(tableMeta);

	// Try display fields first
	for (const field of displayFields) {
		if (record[field] != null) {
			return String(record[field]);
		}
	}

	// Last resort: show first available field
	const keys = Object.keys(record);
	if (keys.length > 0) {
		return String(record[keys[0]] || '');
	}

	return 'Unknown Record';
}

/**
 * RecordJsonView - Component for displaying record data in JSON format with smart scroll behavior
 */
function RecordJsonView({ record, onClose }: { record: any; onClose: () => void }) {
	const { jsonViewRef, cursorInside } = useJsonViewScroll({
		onClose,
		scrollDelta: 100, // Close after 100px of scroll outside the view
	});

	// Clean up the record data for display
	const cleanRecord = useMemo(() => {
		if (!record || typeof record !== 'object') return record;

		// Create a clean copy without internal fields
		const cleaned = { ...record };

		// Remove common internal/system fields that aren't useful for users
		const internalFields = ['__typename', '_meta', 'nodeId'];
		internalFields.forEach((field) => {
			delete cleaned[field];
		});

		return cleaned;
	}, [record]);

	return (
		<div
			ref={jsonViewRef}
			data-part-id='relation-popover-record-data'
			className={`bg-card border-border/60 w-[400px] border shadow-md transition-all duration-200 ${
				cursorInside ? 'ring-primary/20 ring-2' : ''
			}`}
		>
			<div className='border-border/40 flex items-center gap-2 border-b p-3'>
				<RiCodeLine className='text-muted-foreground h-4 w-4' />
				<h4 className='text-sm font-medium'>Record Data</h4>
				<div className='ml-auto flex items-center gap-2'>
					{cursorInside && (
						<span className='text-muted-foreground bg-primary/10 rounded px-2 py-1 text-xs'>Scroll enabled</span>
					)}
					<Button variant='ghost' size='sm' className='hover:bg-muted h-6 w-6 p-0' onClick={onClose}>
						<RiCloseLine className='h-3 w-3' />
					</Button>
				</div>
			</div>
			<ScrollArea className='scrollbar-neutral-thin max-h-[250px]'>
				<pre className='bg-background text-foreground overflow-x-auto p-3 font-mono text-xs'>
					{JSON.stringify(cleanRecord, null, 2)}
				</pre>
			</ScrollArea>
		</div>
	);
}

/**
 * RelatedRecords - Component for exploring and loading more related records
 */
export function RelatedRecords({
	relatedTableSchema,
	currentRecord: _currentRecord,
	displayFields: _displayFields, // We'll derive this from meta instead
}: {
	relatedTableSchema: any;
	currentRecord: any;
	displayFields: string[];
}) {
	const [filterQuery, setFilterQuery] = useState('');
	const [page, setPage] = useState(1);
	const [allLoadedRecords, setAllLoadedRecords] = useState<any[]>([]);
	const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

	// Get the table name from schema
	const tableName = relatedTableSchema?.name;

	// Get meta data to derive field information
	const { data: meta } = useMeta();

	// Find the table metadata from the meta query
	const tableMeta = useMemo(() => {
		if (!meta?._meta?.tables || !tableName) return null;
		return meta._meta.tables.find((table: any) => table?.name === tableName);
	}, [meta, tableName]);

	// Derive searchable fields from metadata
	const searchableFields = useMemo(() => {
		return getSearchableFields(tableMeta);
	}, [tableMeta]);

	// Use the table hook for data loading
	const {
		data: currentPageData,
		isLoading,
		totalCount,
		refetch,
	} = useTable(tableName, {
		enabled: !!tableName,
		limit: 20,
		offset: (page - 1) * 20,
	});

	// Accumulate records from all loaded pages
	useEffect(() => {
		if (currentPageData && currentPageData.length > 0) {
			if (page === 1) {
				// First page - replace all records
				setAllLoadedRecords(currentPageData);
			} else {
				// Subsequent pages - append to existing records
				setAllLoadedRecords((prev) => [...prev, ...currentPageData]);
			}
		}
	}, [currentPageData, page]);

	// Filter records based on search query using metadata-derived fields
	const filteredRecords = useMemo(() => {
		if (!filterQuery.trim()) {
			return allLoadedRecords;
		}

		// Use searchable fields derived from metadata, fallback to basic fields if none found
		const keysToSearch = searchableFields.length > 0 ? searchableFields : ['id'];

		return matchSorter(allLoadedRecords, filterQuery, {
			keys: keysToSearch,
			threshold: matchSorter.rankings.CONTAINS,
		});
	}, [allLoadedRecords, filterQuery, searchableFields]);

	// Reset to page 1 when filter changes
	useEffect(() => {
		if (filterQuery.trim()) {
			// When filtering, we work with already loaded data
			return;
		}
		// When filter is cleared, reset to page 1 and refetch
		setPage(1);
		setAllLoadedRecords([]);
		refetch();
	}, [filterQuery, refetch]);

	// Check if there are more pages to load
	const hasNextPage = allLoadedRecords.length < totalCount;
	const canLoadMore = hasNextPage && !filterQuery.trim();

	// Handle load more
	const handleLoadMore = () => {
		if (canLoadMore && !isLoading) {
			setPage((prev) => prev + 1);
		}
	};

	return (
		<div className='space-y-4'>
			{/* Search and Filter Section */}
			<div className='space-y-3'>
				<div className='flex items-center gap-2'>
					<RiExpandDiagonalLine className='text-muted-foreground h-4 w-4' />
					<h5 className='text-sm font-medium'>Explore Related Data</h5>
					{tableName && (
						<span className='text-foreground bg-accent ml-auto rounded px-2 py-1 text-xs font-semibold'>
							{tableName}
						</span>
					)}
				</div>

				{/* Filter Input */}
				<InputGroup>
					<InputGroupAddon>
						<RiSearchLine />
					</InputGroupAddon>
					<InputGroupInput
						placeholder={
							searchableFields.length > 0
								? `Search by ${searchableFields.slice(0, 2).join(', ')}${searchableFields.length > 2 ? '...' : ''}`
								: `Search ${tableName || 'records'}...`
						}
						value={filterQuery}
						onChange={(e) => setFilterQuery(e.target.value)}
					/>
					{filterQuery && (
						<InputGroupAddon align='inline-end'>
							<Button
								variant='ghost'
								size='sm'
								className='hover:bg-muted h-7 w-7 p-0'
								onClick={() => setFilterQuery('')}
							>
								<RiCloseLine className='h-4 w-4' />
							</Button>
						</InputGroupAddon>
					)}
				</InputGroup>

				{/* Filter Status */}
				{filterQuery && (
					<div className='text-muted-foreground flex items-center gap-2 text-xs'>
						<span>Filtered: {filteredRecords.length} results</span>
						{filteredRecords.length === 0 && <span className='text-destructive'>No matches found</span>}
					</div>
				)}
			</div>

			{/* Results Section */}
			<div className='space-y-3'>
				<div className='flex items-center justify-between'>
					<h6 className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>Related Records</h6>
					<div className='text-muted-foreground bg-muted/40 rounded px-2 py-1 text-xs'>
						{isLoading ? (
							<div className='flex items-center gap-1'>
								<RiLoader4Line className='h-3 w-3 animate-spin' />
								Loading...
							</div>
						) : (
							`${filteredRecords.length} records`
						)}
					</div>
				</div>

				{/* Records List */}
				<ScrollArea className='scrollbar-neutral-thin h-[300px]'>
					<div className='space-y-2 pr-2'>
						{isLoading && filteredRecords.length === 0 ? (
							// Loading skeleton
							<>
								{[1, 2, 3, 4, 5].map((i) => (
									<div key={i} className='border-border/40 bg-card/30 rounded-md border p-3'>
										<div className='space-y-2'>
											<div className='bg-muted/40 h-3 w-3/4 animate-pulse rounded'></div>
											<div className='bg-muted/30 h-2 w-1/2 animate-pulse rounded'></div>
										</div>
									</div>
								))}
							</>
						) : filteredRecords.length === 0 ? (
							// Empty state
							<div className='text-muted-foreground py-8 text-center'>
								<RiExpandDiagonalLine className='mx-auto mb-2 h-8 w-8 opacity-50' />
								<p className='text-sm'>{filterQuery ? 'No records match your search' : 'No related records found'}</p>
							</div>
						) : (
							// Records list
							<>
								{filteredRecords.map((record, index) => {
									const recordId = record.id || `record-${index}`;
									const isOpen = openPopoverId === recordId;

									return (
										<Popover
											key={recordId}
											open={isOpen}
											onOpenChange={(open) => {
												setOpenPopoverId(open ? recordId : null);
											}}
										>
											<PopoverTrigger asChild>
												<div
													className='border-border/40 bg-card/30 hover:bg-card/50 group cursor-pointer rounded-md border
														p-3 transition-colors'
													title='Click to view full record data'
												>
													<div className='space-y-1'>
														<div className='flex items-center justify-between'>
															<p className='flex-1 truncate text-sm font-medium'>{getRecordLabel(record, tableMeta)}</p>
															<RiCodeLine
																className='text-muted-foreground/50 ml-2 h-3 w-3 flex-shrink-0 opacity-0
																	transition-opacity group-hover:opacity-100'
															/>
														</div>
														<p className='text-muted-foreground truncate text-xs'>
															{record.id ? `ID: ${record.id}` : `Record #${index + 1}`}
														</p>
													</div>
												</div>
											</PopoverTrigger>
											<PopoverContent
												side='left'
												align='start'
												className='p-0 shadow-lg'
												onFocusOutside={(e) => {
													// Allow clicking outside to close
													e.preventDefault();
												}}
											>
												<RecordJsonView record={record} onClose={() => setOpenPopoverId(null)} />
											</PopoverContent>
										</Popover>
									);
								})}
							</>
						)}
					</div>
				</ScrollArea>

				{/* Load More Button - Outside of ScrollArea */}
				{canLoadMore && (
					<div className='pt-3'>
						<Button variant='outline' size='sm' className='w-full' onClick={handleLoadMore} disabled={isLoading}>
							{isLoading ? (
								<div className='flex items-center gap-2'>
									<RiLoader4Line className='h-4 w-4 animate-spin' />
									Loading more...
								</div>
							) : (
								`Load More Records (${allLoadedRecords.length}/${totalCount})`
							)}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
