'use client';

import { cn } from '@/lib/utils';

import { Skeleton, SkeletonContainer, SkeletonBadge, SkeletonIcon, SkeletonButton } from './base-skeleton';

/**
 * Security stats bar skeleton - mimics the 4 stat cards at the top.
 */
function SecurityStatsSkeleton() {
	return (
		<div
			className={cn(
				'grid grid-cols-4 gap-4 animate-in fade-in duration-300'
			)}
		>
			{Array.from({ length: 4 }).map((_, i) => (
				<div
					key={i}
					className={cn(
						'flex items-center gap-3 rounded-xl border border-border/40 bg-card px-4 py-3',
						'shadow-card',
						'animate-in fade-in slide-in-from-bottom-1 fill-mode-both'
					)}
					style={{
						animationDelay: `${i * 60}ms`,
						animationDuration: '350ms',
					}}
				>
					{/* Stat icon */}
					<div className='relative'>
						<Skeleton className='h-10 w-10 rounded-xl' />
						{/* Decorative ring */}
						<div className='absolute inset-0 rounded-xl ring-2 ring-primary/10 ring-offset-2 ring-offset-card' />
					</div>
					{/* Stat content */}
					<div className='space-y-1'>
						<Skeleton className='h-6 w-8 rounded' />
						<Skeleton className='h-3 w-20 rounded opacity-60' />
					</div>
				</div>
			))}
		</div>
	);
}

/**
 * Security filters bar skeleton.
 */
function SecurityFiltersSkeleton() {
	return (
		<div
			className={cn(
				'flex items-center gap-3 rounded-lg border border-border/30 bg-muted/20 px-4 py-2.5',
				'animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-both'
			)}
			style={{ animationDelay: '200ms' }}
		>
			{/* Search input */}
			<Skeleton className='h-9 flex-1 max-w-md rounded-lg' />
			{/* Filter dropdowns */}
			<div className='flex items-center gap-2'>
				<Skeleton className='h-9 w-28 rounded-lg' />
				<Skeleton className='h-9 w-32 rounded-lg' />
				<Skeleton className='h-9 w-28 rounded-lg' />
			</div>
			{/* View toggle */}
			<div className='flex items-center gap-1 ml-auto'>
				<Skeleton className='h-8 w-8 rounded-md' />
				<Skeleton className='h-8 w-8 rounded-md' />
			</div>
		</div>
	);
}

/**
 * Policy table card skeleton - mimics a table with its policies.
 */
function PolicyTableSkeleton({ index }: { index: number }) {
	return (
		<div
			className={cn(
				'rounded-xl border border-border/40 bg-card overflow-hidden',
				'shadow-card',
				'animate-in fade-in slide-in-from-bottom-2 fill-mode-both'
			)}
			style={{
				animationDelay: `${300 + index * 80}ms`,
				animationDuration: '400ms',
			}}
		>
			{/* Table header */}
			<div className='flex items-center gap-3 border-b border-border/30 bg-gradient-to-r from-muted/30 to-transparent px-4 py-3'>
				<SkeletonIcon size='md' />
				<Skeleton className='h-5 w-32 rounded' />
				<SkeletonBadge className='ml-auto' />
			</div>
			{/* Policy rows */}
			<div className='divide-y divide-border/20'>
				{Array.from({ length: 2 + (index % 2) }).map((_, i) => (
					<div
						key={i}
						className={cn(
							'flex items-center gap-4 px-4 py-3',
							'animate-in fade-in fill-mode-both'
						)}
						style={{
							animationDelay: `${350 + index * 80 + i * 50}ms`,
							animationDuration: '250ms',
						}}
					>
						{/* Policy indicator */}
						<div className='relative'>
							<Skeleton className='h-8 w-8 rounded-lg' />
							<div className='absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500/50' />
						</div>
						{/* Policy info */}
						<div className='flex-1 min-w-0 space-y-1'>
							<Skeleton className='h-4 w-40 rounded' />
							<div className='flex items-center gap-2'>
								<Skeleton className='h-3 w-24 rounded opacity-60' />
								<Skeleton className='h-3 w-16 rounded opacity-40' />
							</div>
						</div>
						{/* Tags */}
						<div className='flex items-center gap-1.5'>
							<SkeletonBadge className='h-5 w-14' />
							<SkeletonBadge className='h-5 w-12' />
						</div>
						{/* Actions */}
						<SkeletonIcon size='sm' />
					</div>
				))}
			</div>
		</div>
	);
}

/**
 * Permissions panel skeleton - right sidebar with permissions list.
 */
function PermissionsPanelSkeleton() {
	return (
		<div
			className={cn(
				'w-80 shrink-0 border-l border-border/40 bg-gradient-to-b from-background to-muted/5',
				'animate-in fade-in slide-in-from-right-2 duration-400'
			)}
		>
			{/* Panel header */}
			<div className='flex items-center justify-between border-b border-border/30 px-4 py-3'>
				<div className='flex items-center gap-2'>
					<SkeletonIcon size='md' />
					<Skeleton className='h-5 w-24 rounded' />
				</div>
				<SkeletonButton size='sm' className='w-16' />
			</div>

			{/* Permission sections */}
			<div className='p-4 space-y-4'>
				{/* App Permissions section */}
				<div className='space-y-2'>
					<div className='flex items-center gap-2'>
						<Skeleton className='h-4 w-4 rounded' />
						<Skeleton className='h-4 w-28 rounded' />
						<SkeletonBadge className='ml-auto h-4 w-6' />
					</div>
					{Array.from({ length: 4 }).map((_, i) => (
						<div
							key={i}
							className={cn(
								'flex items-center gap-3 rounded-lg border border-border/30 px-3 py-2',
								'animate-in fade-in fill-mode-both'
							)}
							style={{
								animationDelay: `${400 + i * 50}ms`,
								animationDuration: '300ms',
							}}
						>
							<Skeleton className='h-4 w-4 rounded' />
							<div className='flex-1 space-y-1'>
								<Skeleton className='h-3.5 w-24 rounded' />
								<Skeleton className='h-2.5 w-32 rounded opacity-50' />
							</div>
							<SkeletonIcon size='sm' />
						</div>
					))}
				</div>

				{/* Membership Permissions section */}
				<div className='space-y-2 pt-2'>
					<div className='flex items-center gap-2'>
						<Skeleton className='h-4 w-4 rounded' />
						<Skeleton className='h-4 w-36 rounded' />
						<SkeletonBadge className='ml-auto h-4 w-6' />
					</div>
					{Array.from({ length: 3 }).map((_, i) => (
						<div
							key={i}
							className={cn(
								'flex items-center gap-3 rounded-lg border border-border/30 px-3 py-2',
								'animate-in fade-in fill-mode-both'
							)}
							style={{
								animationDelay: `${600 + i * 50}ms`,
								animationDuration: '300ms',
							}}
						>
							<Skeleton className='h-4 w-4 rounded' />
							<div className='flex-1 space-y-1'>
								<Skeleton className='h-3.5 w-28 rounded' />
								<Skeleton className='h-2.5 w-36 rounded opacity-50' />
							</div>
							<SkeletonIcon size='sm' />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

/**
 * Security page skeleton.
 * Shows stats, filters, policies list, and permissions panel.
 */
export function SecuritySkeleton() {
	return (
		<SkeletonContainer className='flex h-full flex-1 overflow-hidden'>
			{/* Main content area */}
			<div className='flex-1 overflow-y-auto scrollbar-neutral-thin'>
				<div className='space-y-5 p-4 md:p-6'>
					{/* Page header */}
					<div className='flex items-center justify-between animate-in fade-in duration-200'>
						<div className='space-y-1'>
							<Skeleton className='h-7 w-24 rounded' />
							<Skeleton className='h-4 w-64 rounded opacity-60' />
						</div>
						<div className='flex items-center gap-2'>
							<SkeletonButton className='w-32' />
							<SkeletonButton className='w-28' />
						</div>
					</div>

					{/* Stats cards */}
					<SecurityStatsSkeleton />

					{/* Filters bar */}
					<SecurityFiltersSkeleton />

					{/* Section headers */}
					<div className='flex items-center gap-4 pt-2'>
						<div className='flex items-center gap-2'>
							<SkeletonIcon size='md' />
							<Skeleton className='h-5 w-16 rounded' />
						</div>
						<div className='h-px flex-1 bg-border/30' />
						<div className='flex items-center gap-2'>
							<SkeletonIcon size='md' />
							<Skeleton className='h-5 w-24 rounded' />
						</div>
					</div>

					{/* Policy tables */}
					<div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
						<div className='space-y-4'>
							<PolicyTableSkeleton index={0} />
							<PolicyTableSkeleton index={2} />
						</div>
						<div className='space-y-4'>
							<PolicyTableSkeleton index={1} />
							<PolicyTableSkeleton index={3} />
						</div>
					</div>
				</div>
			</div>

			{/* Permissions sidebar */}
			<PermissionsPanelSkeleton />
		</SkeletonContainer>
	);
}

/**
 * Compact security skeleton without permissions panel.
 */
export function SecurityCompactSkeleton() {
	return (
		<div className='space-y-4 p-4'>
			<SecurityStatsSkeleton />
			<SecurityFiltersSkeleton />
			<PolicyTableSkeleton index={0} />
			<PolicyTableSkeleton index={1} />
		</div>
	);
}
