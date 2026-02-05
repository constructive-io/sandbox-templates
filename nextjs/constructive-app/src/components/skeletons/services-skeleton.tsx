'use client';

import { cn } from '@/lib/utils';

import { Skeleton, SkeletonContainer, SkeletonBadge, SkeletonIcon } from './base-skeleton';

/**
 * Tab strip skeleton - mimics the tabbed navigation bar.
 */
function TabStripSkeleton() {
	return (
		<div
			className={cn(
				'flex items-center gap-1.5 border-b border-border/40 bg-muted/10 px-3 py-2',
				'animate-in fade-in duration-300',
			)}
		>
			{Array.from({ length: 5 }).map((_, i) => (
				<div
					key={i}
					className={cn(
						'flex items-center gap-2 rounded-lg px-3 py-2',
						i === 0 && 'bg-background shadow-xs',
						'animate-in fade-in fill-mode-both',
					)}
					style={{
						animationDelay: `${i * 50}ms`,
						animationDuration: '250ms',
					}}
				>
					<Skeleton className='h-3.5 w-3.5 rounded' />
					<Skeleton className={cn('h-3.5 rounded', i === 0 ? 'w-16' : 'w-12')} />
					<Skeleton className='h-5 w-5 rounded-full' />
				</div>
			))}
		</div>
	);
}

/**
 * Section header skeleton - accent bar + title + count.
 */
function SectionHeaderSkeleton() {
	return (
		<div className='flex items-center gap-3 animate-in fade-in duration-200' style={{ animationDelay: '200ms' }}>
			<div className='h-5 w-1 rounded-full bg-primary/30' />
			<Skeleton className='h-4 w-20 rounded' />
			<Skeleton className='h-3.5 w-14 rounded opacity-50' />
		</div>
	);
}

/**
 * Table skeleton - mimics the ServiceTableView with rows.
 */
function TableSkeleton({ rows = 4 }: { rows?: number }) {
	return (
		<div
			className={cn(
				'rounded-lg border border-border/60 bg-card overflow-hidden',
				'animate-in fade-in slide-in-from-bottom-1 fill-mode-both',
			)}
			style={{ animationDelay: '250ms', animationDuration: '350ms' }}
		>
			{/* Table header */}
			<div className='flex items-center gap-4 bg-muted/40 px-4 py-2.5 border-b border-border/30'>
				{[80, 100, 60, 70, 40].map((w, i) => (
					<Skeleton key={i} className='h-3.5 rounded' style={{ width: `${w}px` }} />
				))}
			</div>
			{/* Table rows */}
			<div className='divide-y divide-border/20'>
				{Array.from({ length: rows }).map((_, i) => (
					<div
						key={i}
						className={cn(
							'flex items-center gap-4 px-4 py-3',
							'animate-in fade-in fill-mode-both',
						)}
						style={{
							animationDelay: `${300 + i * 60}ms`,
							animationDuration: '250ms',
						}}
					>
						{/* Icon + name */}
						<div className='flex items-center gap-2 min-w-[150px]'>
							<Skeleton className='h-3.5 w-3.5 rounded' />
							<Skeleton className='h-4 rounded' style={{ width: `${100 + Math.random() * 60}px` }} />
						</div>
						{/* Columns */}
						<Skeleton className='h-3.5 w-24 rounded opacity-70' />
						<Skeleton className='h-3.5 w-20 rounded opacity-50' />
						{/* Badge */}
						<SkeletonBadge style={{ width: `${48 + Math.random() * 20}px` }} />
						{/* Actions */}
						<div className='ml-auto'>
							<SkeletonIcon size='sm' />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

/**
 * Services page skeleton.
 * Shows tabbed navigation + table content matching the redesigned layout.
 */
export function ServicesSkeleton() {
	return (
		<SkeletonContainer className='flex h-full flex-1 flex-col overflow-hidden'>
			{/* Tab strip */}
			<TabStripSkeleton />

			{/* Content area */}
			<div className='flex-1 overflow-y-auto scrollbar-neutral-thin'>
				<div className='space-y-4 px-3 pt-4 pb-8'>
					<SectionHeaderSkeleton />
					<TableSkeleton rows={5} />
				</div>
			</div>
		</SkeletonContainer>
	);
}

/**
 * Compact services skeleton for embedding.
 */
export function ServicesCompactSkeleton({ sectionCount = 2 }: { sectionCount?: number }) {
	return (
		<div className='space-y-4 p-4'>
			<TabStripSkeleton />
			{Array.from({ length: sectionCount }).map((_, i) => (
				<TableSkeleton key={i} rows={3} />
			))}
		</div>
	);
}
