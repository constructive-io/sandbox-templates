'use client';

import { cn } from '@/lib/utils';

import { Skeleton, SkeletonContainer, SkeletonBadge, SkeletonIcon, SkeletonButton } from './base-skeleton';

/**
 * Table sidebar skeleton for dashboard.
 * Features a tree-like structure with search and table list.
 */
function TableSidebarSkeleton() {
	return (
		<div className='w-56 shrink-0 border-r border-border/40 bg-gradient-to-b from-background to-muted/5 flex flex-col'>
			{/* Header with database info */}
			<div className='flex items-center gap-2 border-b border-border/30 px-3 py-2.5'>
				<SkeletonIcon size='sm' />
				<Skeleton className='h-4 w-16 rounded' />
				<SkeletonBadge className='ml-auto h-4 w-6' />
			</div>

			{/* Search input */}
			<div className='p-2 border-b border-border/20'>
				<Skeleton className='h-8 w-full rounded-lg' />
			</div>

			{/* Table list with cascade animation */}
			<div className='flex-1 overflow-hidden p-2 space-y-0.5'>
				{Array.from({ length: 12 }).map((_, i) => (
					<div
						key={i}
						className={cn(
							'flex items-center gap-2 rounded-md px-2 py-1.5',
							'animate-in fade-in slide-in-from-left-1 fill-mode-both',
							i === 2 && 'bg-primary/10' // Active table indicator
						)}
						style={{
							animationDelay: `${100 + i * 40}ms`,
							animationDuration: '300ms',
						}}
					>
						<Skeleton className='h-3.5 w-3.5 rounded' />
						<Skeleton
							className='h-3.5 flex-1 rounded'
							style={{
								maxWidth: `${70 + Math.random() * 25}%`,
								opacity: 1 - (i * 0.05),
							}}
						/>
					</div>
				))}
				{/* Fade-out gradient for long lists */}
				<div className='h-8 bg-gradient-to-t from-background to-transparent pointer-events-none' />
			</div>
		</div>
	);
}

/**
 * Data grid toolbar skeleton.
 */
function DataGridToolbarSkeleton() {
	return (
		<div
			className={cn(
				'flex items-center justify-between px-3 py-2 border-b border-border/30',
				'bg-gradient-to-r from-muted/10 via-transparent to-muted/10',
				'animate-in fade-in duration-300'
			)}
		>
			<div className='flex items-center gap-2'>
				{/* Table name */}
				<SkeletonIcon size='md' />
				<Skeleton className='h-5 w-28 rounded' />
				<SkeletonBadge className='h-5 w-16' />
			</div>
			<div className='flex items-center gap-2'>
				{/* Action buttons */}
				<SkeletonButton size='sm' className='w-20' />
				<SkeletonButton size='sm' className='w-16' />
				<div className='w-px h-5 bg-border/40 mx-1' />
				<SkeletonButton size='sm' className='w-24' />
			</div>
		</div>
	);
}

/**
 * Data grid skeleton with column headers and rows.
 * Features a data visualization aesthetic with flowing row animations.
 */
function DataGridSkeleton() {
	// Column widths for variety
	const columns = [
		{ width: 32, header: 8 },    // checkbox
		{ width: 80, header: 24 },   // id
		{ width: 140, header: 40 },  // name
		{ width: 180, header: 48 },  // email
		{ width: 100, header: 32 },  // status
		{ width: 120, header: 36 },  // created
		{ width: 80, header: 28 },   // actions
	];

	return (
		<div className='flex min-h-0 flex-1 flex-col'>
			{/* Toolbar */}
			<DataGridToolbarSkeleton />

			{/* Grid container */}
			<div className='flex-1 flex flex-col min-h-0 overflow-hidden'>
				{/* Column headers - distinctive grid header */}
				<div
					className={cn(
						'flex items-center gap-0 bg-muted/40 border-b border-border/40',
						'sticky top-0 z-10'
					)}
				>
					{columns.map((col, i) => (
						<div
							key={i}
							className='flex items-center px-3 py-2.5 border-r border-border/20 last:border-r-0'
							style={{ width: `${col.width}px`, minWidth: `${col.width}px` }}
						>
							<Skeleton
								className='h-3.5 rounded'
								style={{ width: `${col.header}px` }}
							/>
						</div>
					))}
					<div className='flex-1' />
				</div>

				{/* Data rows with wave animation */}
				<div className='flex-1 overflow-hidden'>
					{Array.from({ length: 14 }).map((_, rowIndex) => (
						<div
							key={rowIndex}
							className={cn(
								'flex items-center gap-0 border-b border-border/15',
								'hover:bg-muted/10 transition-colors',
								'animate-in fade-in fill-mode-both'
							)}
							style={{
								animationDelay: `${150 + rowIndex * 30}ms`,
								animationDuration: '250ms',
							}}
						>
							{columns.map((col, colIndex) => (
								<div
									key={colIndex}
									className='flex items-center px-3 py-2.5 border-r border-border/10 last:border-r-0'
									style={{ width: `${col.width}px`, minWidth: `${col.width}px` }}
								>
									{colIndex === 0 ? (
										// Checkbox column
										<Skeleton className='h-4 w-4 rounded' />
									) : colIndex === 4 ? (
										// Status column - badge style
										<SkeletonBadge
											className='h-5'
											style={{ width: `${40 + Math.random() * 30}px` }}
										/>
									) : colIndex === 6 ? (
										// Actions column
										<SkeletonIcon size='sm' />
									) : (
										// Regular data cell
										<Skeleton
											className='h-4 rounded'
											style={{
												width: `${(col.width - 24) * (0.5 + Math.random() * 0.5)}px`,
												opacity: 0.9 - (rowIndex * 0.03),
											}}
										/>
									)}
								</div>
							))}
							<div className='flex-1' />
						</div>
					))}
				</div>

				{/* Pagination footer */}
				<div className='flex items-center justify-between border-t border-border/40 bg-muted/20 px-3 py-2'>
					<div className='flex items-center gap-2'>
						<Skeleton className='h-4 w-24 rounded' />
						<SkeletonBadge className='h-5 w-10' />
					</div>
					<div className='flex items-center gap-1.5'>
						<SkeletonButton size='sm' className='w-8 h-8' />
						<Skeleton className='h-4 w-12 rounded' />
						<SkeletonButton size='sm' className='w-8 h-8' />
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Dashboard page skeleton.
 * Shows table sidebar + data grid structure.
 */
export function DashboardSkeleton() {
	return (
		<SkeletonContainer className='flex h-full flex-1 flex-col overflow-hidden'>
			<div className='flex min-h-0 flex-1 overflow-hidden'>
				<TableSidebarSkeleton />
				<div className='flex min-h-0 flex-1 flex-col overflow-hidden bg-background'>
					<DataGridSkeleton />
				</div>
			</div>
		</SkeletonContainer>
	);
}

/**
 * Dashboard skeleton without sidebar.
 * For when we only need the grid area.
 */
export function DashboardGridSkeleton() {
	return (
		<SkeletonContainer className='flex min-h-0 flex-1 flex-col'>
			<DataGridSkeleton />
		</SkeletonContainer>
	);
}
