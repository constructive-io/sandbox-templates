'use client';

import { memo } from 'react';
import { RiUserForbidLine } from '@remixicon/react';

import { cn } from '@/lib/utils';
import type { DataError } from '@/lib/gql/error-handler';
import {
	BaseSkeleton,
	type BaseStateConfig,
	DefaultPageHeader,
	EmptyBanner,
	ErrorBanner,
} from '@/components/shared/base-state-display';

// ============================================================================
// Types
// ============================================================================

export type PermissionsStateType = 'loading' | 'error' | 'empty';

export interface PermissionsStateConfig {
	type: PermissionsStateType;
	message?: string;
	onRetry?: () => void;
	/** Original error object for auth error detection */
	error?: Error | DataError | null;
}

// ============================================================================
// Skeleton Components (matching permissions layout)
// ============================================================================

/**
 * Permission section skeleton - mimics a collapsible section with permission rows
 */
function PermissionSectionSkeleton({ rows = 3, delay = 0 }: { rows?: number; delay?: number }) {
	return (
		<div
			className='rounded-xl border border-zinc-200/60 dark:border-zinc-800/50 bg-card overflow-hidden'
			style={{ animationDelay: `${delay}ms` }}
		>
			{/* Section header */}
			<div className='flex items-center justify-between px-4 py-3 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30'>
				<div className='flex items-center gap-3'>
					<BaseSkeleton className='h-4 w-4 rounded' />
					<BaseSkeleton className='h-4 w-32 rounded' />
					<BaseSkeleton className='h-5 w-8 rounded-full' />
				</div>
				<BaseSkeleton className='h-8 w-28 rounded-md' />
			</div>

			{/* Permission rows */}
			<div className='divide-y divide-zinc-100 dark:divide-zinc-800/50'>
				{Array.from({ length: rows }).map((_, i) => (
					<div
						key={i}
						className='flex items-center gap-4 px-4 py-3'
						style={{ opacity: 1 - i * 0.15 }}
					>
						<div className='flex items-center gap-2 min-w-[200px] pl-2'>
							<BaseSkeleton className='h-3.5 w-3.5 rounded' />
							<BaseSkeleton className='h-4 w-28 rounded' />
						</div>
						<div className='flex-1'>
							<BaseSkeleton className='h-4 w-48 rounded' />
						</div>
						<BaseSkeleton className='h-7 w-7 rounded-md' />
					</div>
				))}
			</div>
		</div>
	);
}

/**
 * Page header skeleton
 */
function HeaderSkeleton() {
	return (
		<div className='space-y-2'>
			<BaseSkeleton className='h-8 w-40 rounded' />
			<BaseSkeleton className='h-4 w-96 rounded' />
		</div>
	);
}

/**
 * Full loading skeleton with header and permission sections
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

			{/* Permission sections */}
			<PermissionSectionSkeleton rows={4} delay={0} />
			<PermissionSectionSkeleton rows={3} delay={100} />
		</div>
	);
}

/**
 * Permissions skeleton for background display
 */
function PermissionsSkeleton() {
	return (
		<div className='space-y-8'>
			<PermissionSectionSkeleton rows={3} />
			<PermissionSectionSkeleton rows={2} />
		</div>
	);
}

/**
 * Permissions page header
 */
function PermissionsPageHeader() {
	return (
		<DefaultPageHeader
			title='Permissions'
			description='Manage app and membership permissions for your application.'
		/>
	);
}

// ============================================================================
// Main Component
// ============================================================================

interface PermissionsStateDisplayProps {
	config: PermissionsStateConfig;
	className?: string;
}

/**
 * Permissions route state display component
 *
 * Features:
 * - Loading states show skeleton UI mimicking permissions layout
 * - Error states display as horizontal banners with auth error detection
 * - Empty state for when no permissions exist
 * - Works in both light and dark modes
 */
export const PermissionsStateDisplay = memo(function PermissionsStateDisplay({
	config,
	className,
}: PermissionsStateDisplayProps) {
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
						title='Failed to load permissions'
						pageHeader={<PermissionsPageHeader />}
						skeleton={<PermissionsSkeleton />}
					/>
				</div>
			</div>
		);
	}

	// Empty state (inline, doesn't take full page)
	if (config.type === 'empty') {
		return (
			<EmptyBanner
				icon={RiUserForbidLine}
				title='No permissions found'
				description={config.message || 'No permissions have been created yet'}
			/>
		);
	}

	return null;
});

// Export components for reuse
export { BaseSkeleton as PermissionsSkeleton, PermissionSectionSkeleton, LoadingSkeleton };
