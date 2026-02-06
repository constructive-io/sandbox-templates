'use client';

import { memo } from 'react';
import {
	RiAlertLine,
	RiDatabase2Line,
	RiRefreshLine,
	RiServerLine,
	RiTableLine,
} from '@remixicon/react';

import { cn } from '@/lib/utils';
import { AuthErrorBanner, isAuthError } from '@/lib/gql/auth-error-handler';
import type { DataError } from '@/lib/gql/error-handler';
import { useAppStore } from '@/store/app-store';
import { Button } from '@constructive-io/ui/button';

// ============================================================================
// Custom Skeleton for Dashboard States
// Uses higher contrast colors that work in both light and dark modes
// ============================================================================

function DashboardSkeleton({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='skeleton'
			className={cn(
				'animate-pulse rounded-md',
				// Light mode: visible gray, Dark mode: subtle but visible
				'bg-zinc-200 dark:bg-zinc-800',
				className
			)}
			{...props}
		/>
	);
}

// ============================================================================
// Types
// ============================================================================

export type DashboardStateType =
	| 'loading'
	| 'error'
	| 'no-database'
	| 'no-apis'
	| 'no-tables'
	| 'empty';

export interface DashboardStateConfig {
	type: DashboardStateType;
	message?: string;
	onRetry?: () => void;
	/** Original error object for auth error detection */
	error?: Error | DataError | null;
}

interface StateDisplayProps {
	config: DashboardStateConfig;
	className?: string;
	/** Compact mode for inline display (e.g., in toolbar area) */
	compact?: boolean;
}

// ============================================================================
// State Configuration
// ============================================================================

interface StateDefinition {
	icon: React.ElementType;
	title: string;
	description: string;
	accentColor: string;
	bgColor: string;
	borderColor: string;
}

const STATE_DEFINITIONS: Record<DashboardStateType, StateDefinition> = {
	loading: {
		icon: RiDatabase2Line,
		title: 'Loading',
		description: 'Fetching data...',
		accentColor: 'text-muted-foreground',
		bgColor: 'bg-muted/20',
		borderColor: 'border-border/50',
	},
	error: {
		icon: RiAlertLine,
		title: 'Connection Error',
		description: 'Something went wrong',
		accentColor: 'text-destructive',
		bgColor: 'bg-destructive/5',
		borderColor: 'border-destructive/20',
	},
	'no-database': {
		icon: RiDatabase2Line,
		title: 'No database selected',
		description: 'Select a database from the header to get started',
		accentColor: 'text-muted-foreground',
		bgColor: 'bg-muted/20',
		borderColor: 'border-border/50',
	},
	'no-apis': {
		icon: RiServerLine,
		title: 'No APIs available',
		description: 'Create an API in Services to connect to this database',
		accentColor: 'text-amber-500',
		bgColor: 'bg-amber-500/5',
		borderColor: 'border-amber-500/20',
	},
	'no-tables': {
		icon: RiTableLine,
		title: 'No tables found',
		description: 'This schema has no tables yet',
		accentColor: 'text-muted-foreground',
		bgColor: 'bg-muted/20',
		borderColor: 'border-border/50',
	},
	empty: {
		icon: RiDatabase2Line,
		title: 'No data',
		description: 'Nothing to display',
		accentColor: 'text-muted-foreground',
		bgColor: 'bg-muted/20',
		borderColor: 'border-border/50',
	},
};

// ============================================================================
// Skeleton Components
// ============================================================================

/**
 * Table sidebar skeleton - mimics the table list
 */
function TableSidebarSkeleton() {
	return (
		<div className="w-56 flex-shrink-0 border-r border-border/50 p-3 space-y-1.5">
			{/* Search skeleton */}
			<DashboardSkeleton className="h-8 w-full rounded-md mb-3" />
			{/* Table items */}
			{Array.from({ length: 8 }).map((_, i) => (
				<DashboardSkeleton
					key={i}
					className="h-7 w-full rounded-md"
					style={{
						opacity: 1 - (i * 0.06),
						animationDelay: `${i * 75}ms`
					}}
				/>
			))}
		</div>
	);
}

/**
 * Data grid skeleton - mimics the data grid structure
 */
function DataGridSkeleton() {
	const columns = 6;
	const rows = 10;

	return (
		<div className="flex-1 p-3">
			{/* Toolbar skeleton */}
			<div className="flex items-center gap-2 mb-3">
				<DashboardSkeleton className="h-8 w-24 rounded-md" />
				<DashboardSkeleton className="h-8 w-32 rounded-md" />
				<div className="flex-1" />
				<DashboardSkeleton className="h-8 w-20 rounded-md" />
			</div>

			{/* Grid container */}
			<div className="border border-zinc-200/60 dark:border-zinc-800/50 rounded-lg overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/50">
				{/* Grid header */}
				<div className="flex bg-zinc-100/80 dark:bg-zinc-800/50 border-b border-zinc-200/60 dark:border-zinc-700/50">
					{Array.from({ length: columns }).map((_, i) => (
						<div key={i} className="flex-1 px-3 py-2.5 border-r border-zinc-200/50 dark:border-zinc-700/50 last:border-r-0">
							<DashboardSkeleton
								className="h-4 rounded"
								style={{
									width: `${55 + (i * 7) % 35}%`,
									animationDelay: `${i * 50}ms`
								}}
							/>
						</div>
					))}
				</div>

				{/* Grid rows */}
				{Array.from({ length: rows }).map((_, rowIdx) => (
					<div
						key={rowIdx}
						className="flex border-b border-zinc-100/60 dark:border-zinc-800/50 last:border-b-0"
					>
						{Array.from({ length: columns }).map((_, colIdx) => (
							<div key={colIdx} className="flex-1 px-3 py-2.5 border-r border-zinc-100/50 dark:border-zinc-800/30 last:border-r-0">
								<DashboardSkeleton
									className="h-3.5 rounded"
									style={{
										width: `${35 + ((rowIdx + colIdx) * 11) % 50}%`,
										opacity: 1 - (rowIdx * 0.06),
										animationDelay: `${(rowIdx * columns + colIdx) * 15}ms`
									}}
								/>
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	);
}

/**
 * Full loading skeleton with sidebar and grid
 */
function LoadingSkeleton({ message }: { message?: string }) {
	return (
		<div className="flex flex-1 min-h-0 overflow-hidden">
			<TableSidebarSkeleton />
			<div className="flex-1 flex flex-col">
				{message && (
					<div className="px-4 py-2 border-b border-border/30 bg-muted/10">
						<span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
							{message}
						</span>
					</div>
				)}
				<DataGridSkeleton />
			</div>
		</div>
	);
}

// ============================================================================
// State Display Components
// ============================================================================

/**
 * Compact inline state indicator for toolbar/header areas
 */
function CompactStateDisplay({ config, className }: Omit<StateDisplayProps, 'compact'>) {
	const definition = STATE_DEFINITIONS[config.type];
	const Icon = definition.icon;
	const message = config.message || definition.description;

	return (
		<div
			className={cn(
				'inline-flex items-center gap-2 rounded-md border px-3 py-1.5',
				definition.bgColor,
				definition.borderColor,
				className
			)}
		>
			<Icon className={cn('h-3.5 w-3.5 shrink-0', definition.accentColor)} />
			<span className='text-xs text-muted-foreground truncate max-w-[200px]'>
				{config.type === 'error' ? message : definition.title}
			</span>
			{config.type === 'error' && config.onRetry && (
				<Button
					variant='ghost'
					size='sm'
					onClick={config.onRetry}
					className='h-5 w-5 p-0 ml-1'
				>
					<RiRefreshLine className='h-3 w-3' />
				</Button>
			)}
		</div>
	);
}

/**
 * Horizontal error banner - compact, spans width
 * Shows AuthErrorBanner with countdown for authentication errors
 */
function ErrorBanner({ config }: { config: DashboardStateConfig }) {
	const definition = STATE_DEFINITIONS.error;
	const Icon = definition.icon;
	const message = config.message || definition.description;

	// Get dashboard scope for context-aware auth clearing
	const dashboardScope = useAppStore((state) => state.dashboardScope.databaseId);

	// Check if this is an auth error
	const errorObj = config.error || (config.message ? new Error(config.message) : null);
	const showAuthBanner = errorObj && isAuthError(errorObj);

	return (
		<div className="flex flex-1 min-h-0 overflow-hidden">
			{/* Skeleton sidebar for context */}
			<div className="w-56 flex-shrink-0 border-r border-zinc-200/50 dark:border-zinc-800/50 p-3 opacity-50">
				<DashboardSkeleton className="h-8 w-full rounded-md mb-3" />
				{Array.from({ length: 5 }).map((_, i) => (
					<DashboardSkeleton key={i} className="h-7 w-full rounded-md mb-1.5" />
				))}
			</div>

			{/* Main content with error */}
			<div className="flex-1 flex flex-col">
				{/* Auth error banner with countdown */}
				{showAuthBanner && errorObj ? (
					<div className="mx-3 mt-3">
						<AuthErrorBanner error={errorObj} context='dashboard' dashboardScope={dashboardScope} />
					</div>
				) : (
					/* Regular error banner */
					<div className={cn(
						"mx-3 mt-3 rounded-lg border overflow-hidden",
					"bg-red-50 dark:bg-red-950/30 border-red-200/60 dark:border-red-900/50"
					)}>
						<div className="flex items-center gap-4 px-4 py-3">
							{/* Icon */}
						<div className="flex h-9 w-9 items-center justify-center rounded-md shrink-0 bg-red-100 dark:bg-red-900/50 border border-red-200/60 dark:border-red-800/50">
								<Icon className="h-4.5 w-4.5 text-red-600 dark:text-red-400" />
							</div>

							{/* Content */}
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-foreground">
									{definition.title}
								</p>
								<p className="text-xs text-muted-foreground truncate">
									{message}
								</p>
							</div>

							{/* Retry button */}
							{config.onRetry && (
								<Button
									variant="outline"
									size="sm"
									onClick={config.onRetry}
									className="h-8 px-3 text-xs shrink-0 border-red-200/60 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-700 dark:hover:text-red-300"
								>
									<RiRefreshLine className="mr-1.5 h-3.5 w-3.5" />
									Retry
								</Button>
							)}
						</div>
					</div>
				)}

				{/* Faded grid skeleton */}
				<div className="flex-1 p-3 opacity-40">
					<div className="flex items-center gap-2 mb-3">
						<DashboardSkeleton className="h-8 w-24 rounded-md" />
						<DashboardSkeleton className="h-8 w-32 rounded-md" />
					</div>
					<div className="border border-zinc-200/60 dark:border-zinc-800/50 rounded-lg overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/50">
						<div className="flex bg-zinc-100/80 dark:bg-zinc-800/50 border-b border-zinc-200/60 dark:border-zinc-700/50">
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="flex-1 px-3 py-2.5 border-r border-zinc-200/50 dark:border-zinc-700/50 last:border-r-0">
									<DashboardSkeleton className="h-4 w-3/4 rounded" />
								</div>
							))}
						</div>
						{Array.from({ length: 6 }).map((_, rowIdx) => (
							<div key={rowIdx} className="flex border-b border-zinc-100/60 dark:border-zinc-800/50 last:border-b-0">
								{Array.from({ length: 5 }).map((_, colIdx) => (
									<div key={colIdx} className="flex-1 px-3 py-2.5 border-r border-zinc-100/50 dark:border-zinc-800/30 last:border-r-0">
										<DashboardSkeleton className="h-3.5 w-1/2 rounded" />
									</div>
								))}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Info state display - horizontal layout for no-database, no-apis, no-tables
 */
function InfoStateDisplay({ config }: { config: DashboardStateConfig }) {
	const definition = STATE_DEFINITIONS[config.type];
	const Icon = definition.icon;
	const message = config.message || definition.description;

	// Determine colors based on state type
	const isWarning = config.type === 'no-apis';
	const bannerBg = isWarning
		? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-900/50'
		: 'bg-zinc-100 dark:bg-zinc-900/50 border-zinc-200/60 dark:border-zinc-800/50';
	const iconBg = isWarning
		? 'bg-amber-100 dark:bg-amber-900/50 border-amber-200/60 dark:border-amber-800/50'
		: 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300/60 dark:border-zinc-700/50';
	const iconColor = isWarning
		? 'text-amber-600 dark:text-amber-400'
		: 'text-zinc-500 dark:text-zinc-400';

	return (
		<div className="flex flex-1 min-h-0 overflow-hidden">
			{/* Skeleton sidebar */}
			<div className="w-56 flex-shrink-0 border-r border-zinc-200/50 dark:border-zinc-800/50 p-3 opacity-40">
				<DashboardSkeleton className="h-8 w-full rounded-md mb-3" />
				{Array.from({ length: 5 }).map((_, i) => (
					<DashboardSkeleton key={i} className="h-7 w-full rounded-md mb-1.5" />
				))}
			</div>

			{/* Main content */}
			<div className="flex-1 flex flex-col">
				{/* Info banner */}
				<div className={cn("mx-3 mt-3 rounded-lg border overflow-hidden", bannerBg)}>
					<div className="flex items-center gap-4 px-4 py-3">
						{/* Icon */}
						<div className={cn("flex h-9 w-9 items-center justify-center rounded-md shrink-0 border", iconBg)}>
							<Icon className={cn('h-4.5 w-4.5', iconColor)} />
						</div>

						{/* Content */}
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-foreground">
								{definition.title}
							</p>
							<p className="text-xs text-muted-foreground">
								{message}
							</p>
						</div>
					</div>
				</div>

				{/* Faded grid skeleton */}
				<div className="flex-1 p-3 opacity-30">
					<div className="border border-zinc-200/60 dark:border-zinc-800/50 rounded-lg overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/50">
						<div className="flex bg-zinc-100/80 dark:bg-zinc-800/50 border-b border-zinc-200/60 dark:border-zinc-700/50">
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="flex-1 px-3 py-2.5 border-r border-zinc-200/50 dark:border-zinc-700/50 last:border-r-0">
									<DashboardSkeleton className="h-4 w-3/4 rounded" />
								</div>
							))}
						</div>
						{Array.from({ length: 8 }).map((_, rowIdx) => (
							<div key={rowIdx} className="flex border-b border-zinc-100/60 dark:border-zinc-800/50 last:border-b-0">
								{Array.from({ length: 5 }).map((_, colIdx) => (
									<div key={colIdx} className="flex-1 px-3 py-2.5 border-r border-zinc-100/50 dark:border-zinc-800/30 last:border-r-0">
										<DashboardSkeleton className="h-3.5 w-1/2 rounded" />
									</div>
								))}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Unified state display component for dashboard
 *
 * Features:
 * - Loading states show skeleton UI mimicking actual layout
 * - Error states display as horizontal banners with skeleton background
 * - Info states (no-database, no-apis) use compact horizontal layout
 * - Minimal whitespace, data-focused aesthetic
 */
export const DashboardStateDisplay = memo(function DashboardStateDisplay({
	config,
	className,
	compact = false,
}: StateDisplayProps) {
	if (compact) {
		return <CompactStateDisplay config={config} className={className} />;
	}

	// Loading state - show full skeleton
	if (config.type === 'loading') {
		return (
			<div className={cn('flex flex-1 min-h-0', className)}>
				<LoadingSkeleton message={config.message} />
			</div>
		);
	}

	// Error state - horizontal banner with skeleton background
	if (config.type === 'error') {
		return (
			<div className={cn('flex flex-1 min-h-0', className)}>
				<ErrorBanner config={config} />
			</div>
		);
	}

	// Info states - horizontal layout
	return (
		<div className={cn('flex flex-1 min-h-0', className)}>
			<InfoStateDisplay config={config} />
		</div>
	);
});

// ============================================================================
// Helper to determine current state from dashboard context
// ============================================================================

export interface DashboardStateInput {
	noDatabaseSelected: boolean;
	noApisAvailable: boolean;
	schemasLoading: boolean;
	schemasError: Error | null;
	servicesLoading: boolean;
	servicesError: Error | null;
	metaLoading: boolean;
	metaError: Error | null;
	tablesCount: number;
	activeTable: string | null;
}

/**
 * Determines the current dashboard state based on context values.
 * Returns null if no special state needs to be displayed.
 *
 * Priority order:
 * 1. Schemas error (failed to load databases - blocks everything)
 * 2. Schemas loading (initial load)
 * 3. No database selected (user action required)
 * 4. Services error (API loading failed)
 * 5. Services loading
 * 6. No APIs available (configuration issue)
 * 7. Meta error (schema loading failed)
 * 8. Meta loading
 * 9. No tables (empty schema)
 */
export function getDashboardState(input: DashboardStateInput): DashboardStateConfig | null {
	const {
		noDatabaseSelected,
		noApisAvailable,
		schemasLoading,
		schemasError,
		servicesLoading,
		servicesError,
		metaLoading,
		metaError,
		tablesCount,
	} = input;

	// Priority 1: Schemas error (blocks everything - can't load databases)
	if (schemasError) {
		return {
			type: 'error',
			message: `Failed to load databases: ${schemasError.message}`,
			error: schemasError,
		};
	}

	// Priority 2: Schemas loading (initial database list load)
	if (schemasLoading) {
		return {
			type: 'loading',
			message: 'Loading databases...',
		};
	}

	// Priority 3: No database selected
	if (noDatabaseSelected) {
		return { type: 'no-database' };
	}

	// Priority 4: Services error (blocks everything)
	if (servicesError) {
		return {
			type: 'error',
			message: `Failed to load APIs: ${servicesError.message}`,
			error: servicesError,
		};
	}

	// Priority 5: Services loading
	if (servicesLoading) {
		return {
			type: 'loading',
			message: 'Loading APIs...',
		};
	}

	// Priority 6: No APIs available
	if (noApisAvailable) {
		return { type: 'no-apis' };
	}

	// Priority 7: Meta error
	if (metaError) {
		return {
			type: 'error',
			message: `Failed to load schema: ${metaError.message}`,
			error: metaError,
		};
	}

	// Priority 8: Meta loading
	if (metaLoading) {
		return {
			type: 'loading',
			message: 'Loading schema...',
		};
	}

	// Priority 9: No tables
	if (tablesCount === 0) {
		return { type: 'no-tables' };
	}

	// No special state - show normal content
	return null;
}
