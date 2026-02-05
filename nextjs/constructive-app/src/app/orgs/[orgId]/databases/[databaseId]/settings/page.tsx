'use client';

import { useParams } from 'next/navigation';

import { useEntityParams } from '@/lib/navigation';
import { PageHeader } from '@constructive-io/ui/page-header';

/**
 * Database Settings page - Database configuration and info
 *
 * Route: /orgs/[orgId]/databases/[databaseId]/settings
 */
export default function DatabaseSettingsPage() {
	const params = useParams();
	const databaseId = params.databaseId as string;
	const { database, organization } = useEntityParams();

	return (
		<div className='flex h-full flex-col'>
			<PageHeader title='Database Settings' description='View and manage database configuration.' />
			<div className='flex-1 p-6'>
				<div className='max-w-2xl space-y-6'>
					<div className='bg-card rounded-lg border p-6'>
						<h3 className='mb-4 text-lg font-medium'>Database Information</h3>
						<dl className='space-y-4'>
							<div>
								<dt className='text-muted-foreground text-sm font-medium'>Database ID</dt>
								<dd className='mt-1 font-mono text-sm'>{databaseId}</dd>
							</div>
							<div>
								<dt className='text-muted-foreground text-sm font-medium'>Name</dt>
								<dd className='mt-1 text-sm'>{database?.name ?? 'Loading...'}</dd>
							</div>
							<div>
								<dt className='text-muted-foreground text-sm font-medium'>Owner</dt>
								<dd className='mt-1 text-sm'>{organization?.name ?? 'Loading...'}</dd>
							</div>
						</dl>
					</div>
				</div>
			</div>
		</div>
	);
}
