import { beforeEach, describe, expect, it } from 'vitest';

import { appEndpoints } from '@/lib/runtime/config-core';
import { useAppStore } from '@/store/app-store';
import { getEndpoint } from '@/app-config';

describe('app-config getEndpoint integrates with env-slice', () => {
	beforeEach(() => {
		try {
			localStorage.clear();
			sessionStorage.clear();
		} catch {}
		useAppStore.setState((s: any) => ({
			...s,
			endpointOverrides: { dashboard: null, 'schema-builder': null },
		}));
	});

	it('returns default when no override in store', () => {
		expect(getEndpoint('dashboard')).toBe(appEndpoints.dashboard);
	});

	it('returns store override when set (even if storage empty)', () => {
		// set only in store to ensure it does not rely on localStorage
		useAppStore.setState((s: any) => ({
			...s,
			endpointOverrides: { ...s.endpointOverrides, dashboard: 'http://override/graphql' },
		}));
		try {
			localStorage.removeItem('constructive-endpoint:dashboard');
		} catch {}
		expect(getEndpoint('dashboard')).toBe('http://override/graphql');
	});
});
