'use client';

import dynamic from 'next/dynamic';

import { ServicesSkeleton } from '@/components/skeletons';

// Dynamic import: ServicesRoute includes API linkers and service management
// ~100KB code split from initial bundle
const ServicesRoute = dynamic(() => import('@/components/services/services-route').then((m) => m.ServicesRoute), {
	ssr: false,
	loading: () => <ServicesSkeleton />,
});

/**
 * Database Services page - API management and extensions
 *
 * Route: /orgs/[orgId]/databases/[databaseId]/services
 */
export default function DatabaseServicesPage() {
	return <ServicesRoute />;
}
