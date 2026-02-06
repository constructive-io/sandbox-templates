'use client';

import { useState } from 'react';
import { RiServerLine } from '@remixicon/react';
import { ChevronRight } from 'lucide-react';

import type { DatabaseService } from '@/lib/gql/hooks/schema-builder/apis';
import { cn } from '@/lib/utils';
import { Skeleton } from '@constructive-io/ui/skeleton';

import { ServicesList } from './services-list';

interface DatabaseServicesSectionProps {
	services: DatabaseService[];
	isLoading: boolean;
	error: Error | null;
	orgId: string;
	databaseId: string;
}

export function DatabaseServicesSection({ services, isLoading, error, orgId, databaseId }: DatabaseServicesSectionProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	// Handle loading state
	if (isLoading) {
		return (
			<div className='flex items-center justify-between rounded-lg px-2 py-2'>
				<div className='flex items-center gap-2.5'>
					<Skeleton className='h-2 w-2 rounded-full' />
					<Skeleton className='h-4 w-28' />
				</div>
			</div>
		);
	}

	// Handle error state
	if (error) {
		return (
			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className='group hover:bg-sidebar-accent flex w-full items-center justify-between rounded-lg px-2 py-2 text-left
					transition-colors'
			>
				<div className='flex items-center gap-2.5'>
					<div className='bg-destructive h-2 w-2 shrink-0 rounded-full' />
					<span className='text-destructive text-sm'>Service error</span>
				</div>
				<ChevronRight
					className='text-muted-foreground group-hover:text-foreground h-4 w-4 shrink-0 transition-transform'
				/>
			</button>
		);
	}

	// Don't render if no services
	if (services.length === 0) {
		return null;
	}

	const serviceText = services.length === 1 ? '1 service active' : `${services.length} services active`;

	return (
		<div className='space-y-1.5'>
			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className='group hover:bg-sidebar-accent flex w-full items-center justify-between rounded-lg px-2 py-2 text-left transition-colors'
			>
				<div className='flex items-center gap-2.5'>
					<div className='h-2 w-2 shrink-0 rounded-full bg-green-500' />
					<span className='text-sm'>{serviceText}</span>
				</div>
				<ChevronRight
					className={cn(
						'text-muted-foreground group-hover:text-foreground h-4 w-4 shrink-0 transition-all',
						isExpanded && 'rotate-90',
					)}
				/>
			</button>

			{isExpanded && (
				<div className='pl-2'>
					<ServicesList services={services} orgId={orgId} databaseId={databaseId} />
				</div>
			)}
		</div>
	);
}

/**
 * Empty state component when no services are configured
 */
export function NoServicesView() {
	return (
		<div
			className='border-border/60 bg-muted/30 flex flex-col items-center justify-center rounded-lg border border-dashed
				py-6 text-center'
		>
			<div className='bg-muted mb-2 flex h-10 w-10 items-center justify-center rounded-full'>
				<RiServerLine className='text-muted-foreground h-5 w-5' />
			</div>
			<p className='text-muted-foreground text-xs'>No services configured yet</p>
		</div>
	);
}
