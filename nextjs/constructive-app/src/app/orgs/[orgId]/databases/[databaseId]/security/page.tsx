'use client';

import dynamic from 'next/dynamic';

import { SecuritySkeleton } from '@/components/skeletons';

// Dynamic import: SecurityRoute includes policy builder with complex condition trees
// ~150KB code split from initial bundle
const SecurityRoute = dynamic(() => import('@/components/security/security-route').then((m) => m.SecurityRoute), {
	ssr: false,
	loading: () => <SecuritySkeleton />,
});

/**
 * Database Security page - RLS policies and permissions
 *
 * Route: /orgs/[orgId]/databases/[databaseId]/security
 */
export default function DatabaseSecurityPage() {
	return <SecurityRoute />;
}
