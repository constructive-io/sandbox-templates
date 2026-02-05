'use client';

import { cn } from '@/lib/utils';

import { Skeleton, SkeletonContainer, SkeletonPulse, SkeletonBadge, SkeletonButton, SkeletonIcon } from './base-skeleton';

/**
 * Sidebar skeleton - mimics the schema builder table tree.
 * Features staggered reveal animation and data-tree visual metaphor.
 */
export function SchemaBuilderSidebarSkeleton() {
	return (
		<div className='w-64 flex-shrink-0 border-r border-border/40 bg-gradient-to-b from-background to-muted/5'>
			{/* Sidebar header with subtle glow */}
			<div className='space-y-2 border-b border-border/30 p-3'>
				<div className='flex items-center gap-2'>
					<SkeletonIcon size='sm' />
					<Skeleton className='h-4 w-20' />
				</div>
				{/* Search input skeleton */}
				<Skeleton className='h-9 w-full rounded-lg' />
			</div>

			{/* Table sections */}
			<div className='p-3 space-y-4'>
				{/* Your Tables section */}
				<div className='space-y-1.5'>
					<div className='flex items-center gap-2 px-1'>
						<Skeleton className='h-3 w-3 rounded-sm' />
						<Skeleton className='h-3 w-20' />
						<SkeletonBadge className='ml-auto h-4 w-6' />
					</div>
					{/* Table tree items with cascade animation */}
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							className={cn(
								'flex items-center gap-2.5 rounded-md px-2 py-1.5',
								'animate-in fade-in slide-in-from-left-2 fill-mode-both'
							)}
							style={{
								animationDelay: `${150 + i * 80}ms`,
								animationDuration: '400ms',
							}}
						>
							<Skeleton className='h-4 w-4 rounded' />
							<Skeleton
								className='h-3.5 flex-1 rounded'
								style={{ maxWidth: `${85 - i * 8}%` }}
							/>
						</div>
					))}
				</div>

				{/* System Tables section - visually quieter */}
				<div className='space-y-1.5 pt-2 opacity-60'>
					<div className='flex items-center gap-2 px-1'>
						<Skeleton className='h-3 w-3 rounded-sm' />
						<Skeleton className='h-3 w-24' />
						<SkeletonBadge className='ml-auto h-4 w-8' />
					</div>
					{/* Collapsed state indicator */}
					<div className='h-1 w-full bg-gradient-to-r from-zinc-200/40 via-zinc-200/20 to-transparent dark:from-zinc-700/40 dark:via-zinc-700/20' />
				</div>
			</div>
		</div>
	);
}

/**
 * Table editor skeleton - mimics the field editor panel.
 * Features a data-grid aesthetic with flowing row animations.
 */
export function SchemaBuilderEditorSkeleton() {
	return (
		<div className='flex-1 flex flex-col min-h-0 bg-background'>
			{/* Header bar with table info */}
			<div className='flex items-center justify-between border-b border-border/40 px-4 py-3'>
				<div className='flex items-center gap-3'>
					<div className='flex items-center gap-2'>
						<SkeletonIcon size='md' />
						<Skeleton className='h-5 w-28 rounded' />
					</div>
					<SkeletonBadge className='h-5 w-12' />
				</div>
				<div className='flex items-center gap-2'>
					<SkeletonButton size='sm' className='w-18' />
					<SkeletonButton size='sm' className='w-24' />
				</div>
			</div>

			{/* Tab navigation */}
			<div className='flex items-center gap-1 border-b border-border/40 px-4'>
				{['Structure', 'Relations', 'Indexes'].map((_, i) => (
					<div
						key={i}
						className={cn(
							'relative px-3 py-2',
							i === 0 && 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary/50 after:rounded-full'
						)}
					>
						<Skeleton
							className='h-4 rounded'
							style={{ width: `${60 + i * 15}px` }}
						/>
					</div>
				))}
			</div>

			{/* Fields table */}
			<div className='flex-1 flex flex-col min-h-0 overflow-hidden'>
				{/* Column headers - subtle grid header aesthetic */}
				<div className='flex items-center gap-3 bg-muted/30 border-b border-border/30 px-4 py-2.5'>
					<Skeleton className='h-4 w-4 rounded' />
					<Skeleton className='h-3 w-24 rounded' />
					<Skeleton className='h-3 w-16 rounded' />
					<Skeleton className='h-3 w-20 rounded' />
					<div className='flex-1' />
					<Skeleton className='h-3 w-12 rounded' />
				</div>

				{/* Field rows with data-flow animation */}
				<div className='flex-1 overflow-hidden'>
					{Array.from({ length: 8 }).map((_, i) => (
						<div
							key={i}
							className={cn(
								'flex items-center gap-3 border-b border-border/20 px-4 py-2.5',
								'group hover:bg-muted/20 transition-colors',
								'animate-in fade-in slide-in-from-bottom-1 fill-mode-both'
							)}
							style={{
								animationDelay: `${200 + i * 50}ms`,
								animationDuration: '350ms',
							}}
						>
							{/* Drag handle indicator */}
							<div className='flex flex-col gap-0.5 opacity-40'>
								<Skeleton className='h-1 w-3 rounded-full' />
								<Skeleton className='h-1 w-3 rounded-full' />
							</div>
							{/* Field name */}
							<Skeleton
								className='h-4 rounded'
								style={{ width: `${100 + Math.random() * 40}px` }}
							/>
							{/* Field type badge */}
							<SkeletonBadge
								className='h-5'
								style={{ width: `${50 + Math.random() * 30}px` }}
							/>
							{/* Constraints */}
							<div className='flex items-center gap-1.5'>
								{i % 3 === 0 && <SkeletonIcon size='sm' />}
								{i % 2 === 0 && <SkeletonIcon size='sm' />}
							</div>
							<div className='flex-1' />
							{/* Actions */}
							<SkeletonIcon size='sm' className='opacity-0 group-hover:opacity-100 transition-opacity' />
						</div>
					))}
				</div>
			</div>

			{/* Types Library sidebar hint */}
			<div className='absolute right-0 top-0 bottom-0 w-64 border-l border-border/30 bg-gradient-to-l from-muted/10 to-transparent pointer-events-none opacity-50'>
				<div className='p-3 space-y-2'>
					<Skeleton className='h-4 w-24 rounded' />
					<Skeleton className='h-8 w-full rounded-lg' />
					<div className='space-y-1.5 pt-2'>
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton key={i} className='h-8 w-full rounded' />
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Full schema builder skeleton with sidebar and editor.
 * This is the primary loading state for the schemas route.
 */
export function SchemaBuilderSkeleton({ message }: { message?: string }) {
	return (
		<SkeletonContainer className='flex min-h-0 flex-1 overflow-hidden relative'>
			<SchemaBuilderSidebarSkeleton />
			<div className='flex flex-1 flex-col relative'>
				{message && (
					<div className='border-b border-primary/20 bg-primary/5 px-4 py-2'>
						<span className='text-xs font-medium uppercase tracking-wider text-primary/70'>
							{message}
						</span>
					</div>
				)}
				<SchemaBuilderEditorSkeleton />
			</div>
		</SkeletonContainer>
	);
}

/**
 * Faded sidebar skeleton for error/empty state backgrounds.
 */
export function SchemaBuilderSidebarSkeletonFaded() {
	return (
		<div className='w-64 flex-shrink-0 border-r border-border/30 p-3 opacity-30 pointer-events-none'>
			<div className='space-y-2 mb-4'>
				<Skeleton className='h-4 w-20' />
				<SkeletonPulse className='h-9 w-full' />
			</div>
			{Array.from({ length: 5 }).map((_, i) => (
				<SkeletonPulse key={i} className='mb-1.5 h-8 w-full' />
			))}
		</div>
	);
}

/**
 * Faded editor skeleton for error/empty state backgrounds.
 */
export function SchemaBuilderEditorSkeletonFaded() {
	return (
		<div className='flex-1 p-4 opacity-20 pointer-events-none'>
			<div className='space-y-4'>
				<div className='flex items-center gap-3 border-b border-border/30 pb-3'>
					<SkeletonPulse className='h-6 w-32' />
					<SkeletonPulse className='h-5 w-16 rounded-full' />
				</div>
				<div className='flex gap-1 border-b border-border/30'>
					<SkeletonPulse className='h-8 w-20' />
					<SkeletonPulse className='h-8 w-24' />
				</div>
				{Array.from({ length: 4 }).map((_, i) => (
					<div
						key={i}
						className='flex items-center gap-4 rounded-md border border-border/20 px-3 py-2.5'
					>
						<SkeletonPulse className='h-4 w-28' />
						<SkeletonPulse className='h-4 w-20' />
						<div className='flex-1' />
					</div>
				))}
			</div>
		</div>
	);
}
