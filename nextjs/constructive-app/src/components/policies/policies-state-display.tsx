'use client';

import { memo } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { RiDatabase2Line, RiShieldLine } from '@remixicon/react';

import { cn } from '@/lib/utils';
import type { DataError } from '@/lib/gql/error-handler';
import { Button } from '@constructive-io/ui/button';
import {
	BaseSkeleton,
	type BaseStateConfig,
	DefaultPageHeader,
	EmptyBanner,
	ErrorBanner,
	InfoBanner,
} from '@/components/shared/base-state-display';

// ============================================================================
// Types
// ============================================================================

export type PoliciesStateType = 'loading' | 'error' | 'no-database' | 'empty';

export interface PoliciesStateConfig {
	type: PoliciesStateType;
	message?: string;
	onRetry?: () => void;
	/** Original error object for auth error detection */
	error?: Error | DataError | null;
}

// ============================================================================
// Skeleton Components (matching policies layout)
// ============================================================================

/**
 * Policy table card skeleton - mimics a table with policies
 */
function PolicyTableCardSkeleton({ rows = 3, delay = 0 }: { rows?: number; delay?: number }) {
	return (
		<div
			className='rounded-xl border border-zinc-200/60 dark:border-zinc-800/50 bg-card overflow-hidden'
			style={{ animationDelay: `${delay}ms` }}
		>
			{/* Table header */}
			<div className='flex items-center justify-between px-4 py-3 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30'>
				<div className='flex items-center gap-3'>
					<BaseSkeleton className='h-5 w-5 rounded' />
					<BaseSkeleton className='h-4 w-28 rounded' />
					<BaseSkeleton className='h-5 w-14 rounded-full' />
				</div>
				<div className='flex items-center gap-2'>
					<BaseSkeleton className='h-6 w-16 rounded-full' />
					<BaseSkeleton className='h-8 w-24 rounded-md' />
				</div>
			</div>

			{/* Policy rows */}
			<div className='divide-y divide-zinc-100 dark:divide-zinc-800/50'>
				{Array.from({ length: rows }).map((_, i) => (
					<div
						key={i}
						className='flex items-center gap-4 px-4 py-3'
						style={{ opacity: 1 - i * 0.15 }}
					>
						<BaseSkeleton className='h-8 w-8 rounded-lg' />
						<div className='flex-1 space-y-1.5'>
							<BaseSkeleton className='h-4 w-40 rounded' />
							<div className='flex items-center gap-2'>
								<BaseSkeleton className='h-3 w-16 rounded' />
								<BaseSkeleton className='h-3 w-20 rounded' />
							</div>
						</div>
						<BaseSkeleton className='h-6 w-14 rounded-full' />
						<BaseSkeleton className='h-8 w-8 rounded-md' />
					</div>
				))}
			</div>
		</div>
	);
}

/**
 * Filters skeleton
 */
function FiltersSkeleton() {
	return (
		<div className='flex flex-wrap items-center gap-3'>
			<BaseSkeleton className='h-9 w-64 rounded-md' />
			<BaseSkeleton className='h-9 w-28 rounded-md' />
			<BaseSkeleton className='h-9 w-32 rounded-md' />
			<BaseSkeleton className='h-9 w-28 rounded-md' />
			<div className='flex-1' />
			<BaseSkeleton className='h-5 w-32 rounded' />
		</div>
	);
}

/**
 * Page header skeleton
 */
function HeaderSkeleton() {
	return (
		<div className='flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between'>
			<div className='space-y-2'>
				<BaseSkeleton className='h-8 w-32 rounded' />
				<BaseSkeleton className='h-4 w-80 rounded' />
			</div>
			<BaseSkeleton className='h-10 w-32 rounded-lg' />
		</div>
	);
}

/**
 * Full loading skeleton with header, filters, and table cards
 */
function LoadingSkeleton({ message }: { message?: string }) {
	return (
		<div className='mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-6 pb-12 md:px-6 lg:px-8'>
			{message && (
				<div className='px-1'>
					<span className='text-xs text-muted-foreground font-medium tracking-wide uppercase'>
						{message}
					</span>
				</div>
			)}

			{/* Page header skeleton */}
			<HeaderSkeleton />

			{/* Filters skeleton */}
			<FiltersSkeleton />

			{/* Table cards */}
			<div className='space-y-5'>
				<PolicyTableCardSkeleton rows={3} delay={0} />
				<PolicyTableCardSkeleton rows={2} delay={100} />
				<PolicyTableCardSkeleton rows={2} delay={200} />
			</div>
		</div>
	);
}

/**
 * Policies skeleton for background display
 */
function PoliciesSkeleton() {
	return (
		<div className='space-y-5'>
			<FiltersSkeleton />
			<PolicyTableCardSkeleton rows={2} />
			<PolicyTableCardSkeleton rows={2} />
		</div>
	);
}

/**
 * Policies page header
 */
function PoliciesPageHeader() {
	return (
		<DefaultPageHeader
			title='Policies'
			description='Review and manage row-level security policies for your tables.'
		/>
	);
}

// ============================================================================
// Main Component
// ============================================================================

interface PoliciesStateDisplayProps {
	config: PoliciesStateConfig;
	className?: string;
}

/**
 * Policies route state display component
 *
 * Features:
 * - Loading states show skeleton UI mimicking policies layout
 * - Error states display as horizontal banners with auth error detection
 * - No database state shows info with link to schemas
 * - Empty state for when no policies match filters
 * - Works in both light and dark modes
 */
export const PoliciesStateDisplay = memo(function PoliciesStateDisplay({
	config,
	className,
}: PoliciesStateDisplayProps) {
	// Loading state - show full skeleton
	if (config.type === 'loading') {
		return (
			<div className={cn('flex-1 overflow-y-auto', className)}>
				<LoadingSkeleton message={config.message} />
			</div>
		);
	}

	// Error state - horizontal banner with skeleton background
	if (config.type === 'error') {
		return (
			<div className={cn('flex-1 overflow-y-auto', className)}>
				<div className='mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-6 pb-12 md:px-6 lg:px-8'>
					<ErrorBanner
						config={config as BaseStateConfig}
						title='Failed to load policies'
						pageHeader={<PoliciesPageHeader />}
						skeleton={<PoliciesSkeleton />}
					/>
				</div>
			</div>
		);
	}

	// No database selected
	if (config.type === 'no-database') {
		return (
			<div className={cn('flex-1 overflow-y-auto', className)}>
				<div className='mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-6 pb-12 md:px-6 lg:px-8'>
					<PoliciesPageHeader />
					<InfoBanner
						icon={RiDatabase2Line}
						title='No database selected'
						description='Select a database from the topbar to view its policies'
						action={
							<Button variant='outline' size='sm' asChild className='h-8 px-3 text-xs shrink-0'>
								<Link href={'/' as Route}>Go to Organizations</Link>
							</Button>
						}
						skeleton={<PoliciesSkeleton />}
					/>
				</div>
			</div>
		);
	}

	// Empty state (inline, doesn't take full page)
	if (config.type === 'empty') {
		return (
			<EmptyBanner
				icon={RiShieldLine}
				title='No policies found'
				description={config.message || 'No policies match your current filters'}
			/>
		);
	}

	return null;
});

// Export components for reuse
export { BaseSkeleton as PoliciesSkeleton, PolicyTableCardSkeleton, FiltersSkeleton, LoadingSkeleton, EmptyBanner as EmptyState };
