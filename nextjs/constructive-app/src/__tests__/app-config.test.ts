import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { appConfig, getEndpoint, getHomePath, getSchemaContext, homePathByContext, setSchemaContext } from '../app-config';
import { BUILD_TIME_ENV_VALUES } from '../lib/runtime/runtime-config.types';
import { useAppStore } from '../store/app-store';

// Default fallback when no env is set
const DEFAULT_SCHEMA_BUILDER_ENDPOINT = 'http://api.localhost:3000/graphql';

/**
 * Note: These tests use window.__RUNTIME_CONFIG__ to simulate different values
 * because BUILD_TIME_ENV_VALUES is captured at module load time (before tests run).
 * This mirrors how Docker runtime injection works in production.
 *
 * vi.stubEnv() cannot affect BUILD_TIME_ENV_VALUES because it was already evaluated
 * when the module was imported.
 */

describe('app-config', () => {
	beforeEach(() => {
		// Clear runtime config
		if (typeof window !== 'undefined') {
			delete (window as any).__RUNTIME_CONFIG__;
		}
		// Reset context
		setSchemaContext(null);
		// Reset store endpoint overrides
		useAppStore.getState().resetEndpointOverrides();
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		if (typeof window !== 'undefined') {
			delete (window as any).__RUNTIME_CONFIG__;
		}
		setSchemaContext(null);
		useAppStore.getState().resetEndpointOverrides();
	});

	describe('homePathByContext', () => {
		it('has correct path for schema-builder', () => {
			expect(homePathByContext['schema-builder']).toBe('/');
		});

		it('has correct path for dashboard', () => {
			expect(homePathByContext['dashboard']).toBe('/');
		});
	});

	describe('getHomePath', () => {
		it('returns / for schema-builder context', () => {
			setSchemaContext('schema-builder');
			expect(getHomePath()).toBe('/');
		});

		it('returns / for dashboard context', () => {
			setSchemaContext('dashboard');
			expect(getHomePath()).toBe('/');
		});

		it('accepts explicit context parameter', () => {
			expect(getHomePath('schema-builder')).toBe('/');
			expect(getHomePath('dashboard')).toBe('/');
		});
	});

	describe('appConfig', () => {
		it('has endpoints object', () => {
			expect(appConfig.endpoints).toBeDefined();
		});

		it('endpoints has schema-builder defined', () => {
			expect(appConfig.endpoints['schema-builder']).toBeDefined();
		});

		it('endpoints has dashboard as null', () => {
			expect(appConfig.endpoints['dashboard']).toBeNull();
		});
	});

	describe('getEndpoint', () => {
		describe('schema-builder context', () => {
			it('returns runtime config value when set', () => {
				(window as any).__RUNTIME_CONFIG__ = {
					NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT: 'https://api.runtime.com/graphql',
				};

				expect(getEndpoint('schema-builder')).toBe('https://api.runtime.com/graphql');
			});

			it('returns build-time or default when runtime not set', () => {
				(window as any).__RUNTIME_CONFIG__ = {};

				const result = getEndpoint('schema-builder');
				const buildTimeValue = BUILD_TIME_ENV_VALUES['NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT'];

				if (buildTimeValue) {
					expect(result).toBe(buildTimeValue);
				} else {
					expect(result).toBe(DEFAULT_SCHEMA_BUILDER_ENDPOINT);
				}
			});

			it('returns UI override when set in store', () => {
				(window as any).__RUNTIME_CONFIG__ = {
					NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT: 'https://api.runtime.com/graphql',
				};

				// Set UI override
				useAppStore.getState().setEndpointOverride('schema-builder', 'https://api.override.com/graphql');

				expect(getEndpoint('schema-builder')).toBe('https://api.override.com/graphql');
			});
		});

		describe('dashboard context', () => {
			it('returns null when no endpoint configured', () => {
				(window as any).__RUNTIME_CONFIG__ = {};

				expect(getEndpoint('dashboard')).toBeNull();
			});

			it('returns UI override when set in store', () => {
				// Dashboard endpoint is set via database API selection
				useAppStore.getState().setEndpointOverride('dashboard', 'https://crm.api.com/graphql');

				expect(getEndpoint('dashboard')).toBe('https://crm.api.com/graphql');
			});
		});

		describe('priority chain', () => {
			it('Priority 1: UI override takes precedence over everything', () => {
				(window as any).__RUNTIME_CONFIG__ = {
					NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT: 'http://docker-runtime/graphql',
				};
				useAppStore.getState().setEndpointOverride('schema-builder', 'http://ui-override/graphql');

				expect(getEndpoint('schema-builder')).toBe('http://ui-override/graphql');
			});

			it('Priority 2: Docker runtime when no UI override', () => {
				(window as any).__RUNTIME_CONFIG__ = {
					NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT: 'http://docker-runtime/graphql',
				};
				// No UI override

				expect(getEndpoint('schema-builder')).toBe('http://docker-runtime/graphql');
			});

			it('Priority 3/4: Build-time or hardcoded default when no runtime config', () => {
				(window as any).__RUNTIME_CONFIG__ = {};
				// No UI override

				const result = getEndpoint('schema-builder');
				const buildTimeValue = BUILD_TIME_ENV_VALUES['NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT'];

				if (buildTimeValue) {
					expect(result).toBe(buildTimeValue);
				} else {
					expect(result).toBe(DEFAULT_SCHEMA_BUILDER_ENDPOINT);
				}
			});
		});

		describe('uses current context when no parameter provided', () => {
			it('uses schema-builder context', () => {
				setSchemaContext('schema-builder');
				(window as any).__RUNTIME_CONFIG__ = {
					NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT: 'https://api.test.com/graphql',
				};

				expect(getEndpoint()).toBe('https://api.test.com/graphql');
			});

			it('uses dashboard context', () => {
				setSchemaContext('dashboard');
				useAppStore.getState().setEndpointOverride('dashboard', 'https://crm.test.com/graphql');

				expect(getEndpoint()).toBe('https://crm.test.com/graphql');
			});
		});
	});
});

describe('Full Integration: Development vs Docker environments', () => {
	beforeEach(() => {
		if (typeof window !== 'undefined') {
			delete (window as any).__RUNTIME_CONFIG__;
		}
		setSchemaContext(null);
		useAppStore.getState().resetEndpointOverrides();
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		if (typeof window !== 'undefined') {
			delete (window as any).__RUNTIME_CONFIG__;
		}
		setSchemaContext(null);
		useAppStore.getState().resetEndpointOverrides();
	});

	it('Development: uses build-time values from BUILD_TIME_ENV_VALUES', () => {
		// In development, .env.local values are captured in BUILD_TIME_ENV_VALUES at build
		(window as any).__RUNTIME_CONFIG__ = {}; // Empty in dev

		const result = getEndpoint('schema-builder');
		// Result will be BUILD_TIME_ENV_VALUES or the hardcoded default
		expect(result).toBeDefined();
		expect(typeof result).toBe('string');
	});

	it('Docker: reads from window.__RUNTIME_CONFIG__ (docker-entrypoint.sh)', () => {
		// docker-entrypoint.sh injects fresh values that override build-time
		(window as any).__RUNTIME_CONFIG__ = {
			NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT: 'https://api.production.example.com/graphql',
		};

		expect(getEndpoint('schema-builder')).toBe('https://api.production.example.com/graphql');
	});

	it('User can override both with UI settings', () => {
		(window as any).__RUNTIME_CONFIG__ = {
			NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT: 'http://docker-runtime/graphql',
		};

		// User opens settings dialog and enters custom endpoint
		useAppStore.getState().setEndpointOverride('schema-builder', 'http://localhost:4000/graphql');

		expect(getEndpoint('schema-builder')).toBe('http://localhost:4000/graphql');
	});
});
