'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { buildOrgDatabaseRoute } from '@/app-routes';

/**
 * Database index page - redirects to schemas view
 *
 * Route: /orgs/[orgId]/databases/[databaseId]
 * Redirects to: /orgs/[orgId]/databases/[databaseId]/schemas
 */
export default function DatabaseIndexPage() {
	const router = useRouter();
	const params = useParams();
	const orgId = params.orgId as string;
	const databaseId = params.databaseId as string;

	useEffect(() => {
		if (orgId && databaseId) {
			router.replace(buildOrgDatabaseRoute('ORG_DATABASE_SCHEMAS', orgId, databaseId));
		}
	}, [orgId, databaseId, router]);

	return (
		<div className='flex h-full items-center justify-center'>
			<div className='border-primary/20 border-t-primary h-6 w-6 animate-spin rounded-full border-2' />
		</div>
	);
}
