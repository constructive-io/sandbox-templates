'use client';

import { RiGlobalLine } from '@remixicon/react';

import type { DatabaseService } from '@/lib/gql/hooks/schema-builder/apis';
import { Skeleton } from '@constructive-io/ui/skeleton';

import { ServicesList } from './services-list';

interface ServicesPanelProps {
	services: DatabaseService[];
	isLoading: boolean;
	orgId: string;
	databaseId: string;
	onNavigate?: () => void;
}

function ServicesPanelSkeleton() {
	return (
		<div className='space-y-2 p-4'>
			{Array.from({ length: 3 }).map((_, i) => (
				<div key={i} className='flex items-center gap-2.5 rounded-lg border p-2.5'>
					<Skeleton className='h-6 w-6 rounded-md' />
					<div className='flex-1 space-y-1'>
						<Skeleton className='h-4 w-32' />
					</div>
					<Skeleton className='h-2 w-2 rounded-full' />
				</div>
			))}
		</div>
	);
}

function EmptyServicesState() {
	return (
		<div className='flex flex-col items-center justify-center px-6 py-12 text-center'>
			<div className='bg-muted/50 mb-4 flex h-12 w-12 items-center justify-center rounded-full'>
				<RiGlobalLine className='text-muted-foreground h-6 w-6' />
			</div>
			<h3 className='text-sm font-medium'>No services configured</h3>
			<p className='text-muted-foreground mt-1 max-w-xs text-sm'>
				Services provide API endpoints for your database. Set up a service to enable GraphQL access.
			</p>
		</div>
	);
}

export function ServicesPanel({ services, isLoading, orgId, databaseId, onNavigate }: ServicesPanelProps) {
	if (isLoading) {
		return <ServicesPanelSkeleton />;
	}

	if (services.length === 0) {
		return <EmptyServicesState />;
	}

	return (
		<div className='p-4'>
			<ServicesList services={services} orgId={orgId} databaseId={databaseId} onNavigate={onNavigate} />
		</div>
	);
}
