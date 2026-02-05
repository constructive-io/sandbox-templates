import { useMemo } from 'react';

import { getDirectConnectEndpoint } from '@/lib/runtime/direct-connect';
import { useAppStore } from '@/store/app-store';
import { getEndpoint } from '@/app-config';

export type DashboardCacheScopeKey = {
	databaseId: string | null;
	endpoint: string | null;
};

export function useDashboardCacheScopeKey(): DashboardCacheScopeKey {
	const databaseId = useAppStore((state) => state.dashboardScope.databaseId);
	const directConnect = useAppStore((state) => state.directConnect);
	const dashboardEndpointOverride = useAppStore((state) => state.endpointOverrides.dashboard);

	const endpoint = useMemo(() => {
		const directConnectEndpoint = getDirectConnectEndpoint('dashboard', directConnect);
		if (directConnectEndpoint) return directConnectEndpoint;
		const trimmedOverride = dashboardEndpointOverride?.trim();
		if (trimmedOverride) return trimmedOverride;
		return getEndpoint('dashboard') ?? null;
	}, [directConnect, dashboardEndpointOverride]);

	return useMemo(
		() => ({ databaseId: databaseId ?? null, endpoint }),
		[databaseId, endpoint],
	);
}
