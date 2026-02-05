import { beforeEach, describe, expect, it } from 'vitest';

import { appEndpoints } from '@/lib/runtime/config-core';
import { useAppStore } from '@/store/app-store';

describe('env-slice', () => {
	beforeEach(() => {
		try {
			localStorage.clear();
			sessionStorage.clear();
		} catch {}
		// reset store slice
		useAppStore.setState((s: any) => ({
			...s,
			endpointOverrides: { dashboard: null, 'schema-builder': null },
		}));
	});

	it('defaults to appEndpoints when no overrides', () => {
		const state: any = useAppStore.getState();
		// Dashboard has no default endpoint (returns null)
		expect(state.getEffectiveEndpoint('dashboard')).toBe(appEndpoints.dashboard);
		expect(state.getEffectiveEndpoint('schema-builder')).toBe(appEndpoints['schema-builder']);
	});

	it('setEndpointOverride persists in state and storage for schema-builder', () => {
		const state: any = useAppStore.getState();
		// Dashboard is NOT persisted to localStorage (managed dynamically via Direct Connect)
		// So we test schema-builder instead
		state.setEndpointOverride('schema-builder', 'http://example.com/gql');
		expect(useAppStore.getState().endpointOverrides['schema-builder']).toBe('http://example.com/gql');
		expect(localStorage.getItem('constructive-endpoint:schema-builder')).toBe('http://example.com/gql');
	});

	it('setEndpointOverride updates state for dashboard but does not persist', () => {
		const state: any = useAppStore.getState();
		state.setEndpointOverride('dashboard', 'http://dashboard-custom.com/gql');
		expect(useAppStore.getState().endpointOverrides.dashboard).toBe('http://dashboard-custom.com/gql');
		// Dashboard is NOT persisted to localStorage
		expect(localStorage.getItem('constructive-endpoint:dashboard')).toBeNull();
	});

	it('getEffectiveEndpoint returns override when set', () => {
		useAppStore.getState().setEndpointOverride('schema-builder', 'https://api.test/graphql');
		expect(useAppStore.getState().getEffectiveEndpoint('schema-builder')).toBe('https://api.test/graphql');
	});
});
