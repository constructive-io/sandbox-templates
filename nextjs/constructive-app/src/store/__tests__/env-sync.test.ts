import { beforeEach, describe, expect, it } from 'vitest';

import { initEnvOverridesSync } from '@/lib/runtime/env-sync';
import { useAppStore } from '@/store/app-store';

describe('env-sync storage listener', () => {
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

	it('updates store when localStorage changes in another tab', () => {
		initEnvOverridesSync();

		// Simulate a storage event for schema-builder (dashboard sync is disabled)
		const e = new StorageEvent('storage', {
			key: 'constructive-endpoint:schema-builder',
			newValue: 'http://other/graphql',
			storageArea: localStorage,
		} as StorageEventInit);
		window.dispatchEvent(e);

		expect(useAppStore.getState().endpointOverrides['schema-builder']).toBe('http://other/graphql');
	});
});
