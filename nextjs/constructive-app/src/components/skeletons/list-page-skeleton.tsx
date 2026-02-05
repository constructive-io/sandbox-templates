'use client';

import { cn } from '@/lib/utils';
import { Skeleton, SkeletonContainer } from './base-skeleton';

interface ListPageSkeletonProps {
	/** Number of skeleton items to show */
	itemCount?: number;
	/** Layout mode */
	mode?: 'grid' | 'list';
	/** Optional header skeleton */
	showHeader?: boolean;
	/** Optional search/filter skeleton */
	showFilters?: boolean;
}

/**
 * Card skeleton for grid mode
 */
function CardSkeleton({ index }: { index: number }) {
	return (
		<div
			className={cn(
				'rounded-xl border border-border/50 bg-card p-4',
				'animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-backwards duration-300'
			)}
			style={{ animationDelay: `${index * 50}ms` }}
		>
			<div className='flex items-start gap-3'>
				<Skeleton className='h-10 w-10 shrink-0 rounded-lg' />
				<div className='flex-1 space-y-2'>
					<Skeleton className='h-4 w-3/4 rounded' />
					<Skeleton className='h-3 w-1/2 rounded' />
				</div>
			</div>
			<div className='mt-4 flex items-center justify-between'>
				<Skeleton className='h-5 w-16 rounded-full' />
				<Skeleton className='h-8 w-8 rounded-md' />
			</div>
		</div>
	);
}

/**
 * Row skeleton for list mode
 */
function RowSkeleton({ index }: { index: number }) {
	return (
		<div
			className={cn(
				'flex items-center gap-4 border-b border-border/50 px-4 py-3 last:border-b-0',
				'animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-backwards duration-300'
			)}
			style={{ animationDelay: `${index * 50}ms` }}
		>
			<Skeleton className='h-10 w-10 shrink-0 rounded-lg' />
			<div className='flex-1 space-y-1.5'>
				<Skeleton className='h-4 w-48 rounded' />
				<Skeleton className='h-3 w-32 rounded' />
			</div>
			<Skeleton className='h-5 w-16 rounded-full' />
			<Skeleton className='h-4 w-12 rounded' />
			<Skeleton className='h-8 w-8 rounded-md' />
		</div>
	);
}

/**
 * Page header skeleton
 */
function HeaderSkeleton() {
	return (
		<div
			className='animate-in fade-in-0 slide-in-from-bottom-4 fill-mode-backwards mb-6 flex items-start justify-between duration-500'
			style={{ animationDelay: '50ms' }}
		>
			<div className='space-y-2'>
				<Skeleton className='h-8 w-48 rounded-lg' />
				<Skeleton className='h-4 w-72 rounded' />
			</div>
			<Skeleton className='h-9 w-32 rounded-md' />
		</div>
	);
}

/**
 * Filter bar skeleton
 */
function FiltersSkeleton() {
	return (
		<div
			className='animate-in fade-in-0 slide-in-from-bottom-4 fill-mode-backwards mb-6 flex items-center justify-between duration-500'
			style={{ animationDelay: '100ms' }}
		>
			<div className='flex items-center gap-3'>
				<Skeleton className='h-9 w-64 rounded-md' />
				<Skeleton className='h-4 w-20 rounded' />
			</div>
			<Skeleton className='h-9 w-24 rounded-lg' />
		</div>
	);
}

/**
 * Generic list page skeleton.
 * Used for organizations, databases, users, members pages.
 */
export function ListPageSkeleton({
	itemCount = 6,
	mode = 'grid',
	showHeader = true,
	showFilters = true,
}: ListPageSkeletonProps) {
	return (
		<SkeletonContainer className='h-full overflow-y-auto'>
			<div className='mx-auto max-w-6xl px-6 py-8 lg:px-8 lg:py-10'>
				{showHeader && <HeaderSkeleton />}
				{showFilters && <FiltersSkeleton />}

				{mode === 'grid' ? (
					<div
						className='animate-in fade-in-0 slide-in-from-bottom-4 fill-mode-backwards grid gap-4 duration-500 sm:grid-cols-2 lg:grid-cols-3'
						style={{ animationDelay: '150ms' }}
					>
						{Array.from({ length: itemCount }).map((_, i) => (
							<CardSkeleton key={i} index={i} />
						))}
					</div>
				) : (
					<div
						className='animate-in fade-in-0 slide-in-from-bottom-4 fill-mode-backwards overflow-hidden rounded-xl border border-border/50 bg-card duration-500'
						style={{ animationDelay: '150ms' }}
					>
						{Array.from({ length: itemCount }).map((_, i) => (
							<RowSkeleton key={i} index={i} />
						))}
					</div>
				)}
			</div>
		</SkeletonContainer>
	);
}

/**
 * Compact list skeleton without page wrapper.
 * For embedding in sections/panels.
 */
export function ListSkeleton({
	itemCount = 5,
	mode = 'list',
}: Pick<ListPageSkeletonProps, 'itemCount' | 'mode'>) {
	if (mode === 'grid') {
		return (
			<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
				{Array.from({ length: itemCount }).map((_, i) => (
					<CardSkeleton key={i} index={i} />
				))}
			</div>
		);
	}

	return (
		<div className='space-y-3'>
			{Array.from({ length: itemCount }).map((_, i) => (
				<div
					key={i}
					className={cn(
						'flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4',
						'animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-backwards duration-300'
					)}
					style={{ animationDelay: `${i * 50}ms` }}
				>
					<Skeleton className='h-10 w-10 shrink-0 rounded-full' />
					<div className='flex-1 space-y-2'>
						<Skeleton className='h-4 w-32 rounded' />
						<Skeleton className='h-3 w-24 rounded' />
					</div>
					<Skeleton className='h-5 w-16 rounded-full' />
				</div>
			))}
		</div>
	);
}
