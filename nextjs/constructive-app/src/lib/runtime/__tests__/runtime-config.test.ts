/**
 * Runtime Configuration Tests
 * Consolidated: config-core + get-runtime-config + direct-connect
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	appEndpoints,
	DEFAULT_DIRECT_CONNECT,
	detectSchemaContextFromPath,
	getDefaultEndpoint,
	getSchemaBuilderEndpoint,
	getSchemaBuilderSubEndpoint,
	getSchemaContext,
	schemaBuilderGraphqlEndpoint,
	schemaContexts,
	setSchemaContext,
	type DirectConnectConfig,
	type SchemaBuilderSubEndpoint,
	type SchemaContext,
} from '../config-core';
import {
	createDirectConnectConfig,
	getDirectConnectEndpoint,
	isDirectConnectSupported,
	shouldBypassAuth,
	validateEndpointUrl,
} from '../direct-connect';
import { getAllRuntimeConfig, getRuntimeConfig, parseEnvBoolean } from '../get-runtime-config';
import { BUILD_TIME_ENV_VALUES, RUNTIME_CONFIG_KEYS, type RuntimeConfigKey } from '../runtime-config.types';

const DEFAULT_SCHEMA_BUILDER_ENDPOINT = 'http://api.localhost:3000/graphql';

// Helper for tests
const defaultDirectConnect: Record<SchemaContext, DirectConnectConfig> = {
	dashboard: DEFAULT_DIRECT_CONNECT,
	'schema-builder': DEFAULT_DIRECT_CONNECT,
};

describe('Runtime Configuration', () => {
	beforeEach(() => {
		if (typeof window !== 'undefined') {
			delete (window as any).__RUNTIME_CONFIG__;
		}
		setSchemaContext(null);
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		if (typeof window !== 'undefined') {
			delete (window as any).__RUNTIME_CONFIG__;
		}
		setSchemaContext(null);
	});

	// ============================================================================
	// Core Configuration
	// ============================================================================

	describe('schemaContexts and appEndpoints', () => {
		it('has both contexts and correct endpoints', () => {
			expect(schemaContexts).toContain('schema-builder');
			expect(schemaContexts).toContain('dashboard');
			expect(schemaContexts.length).toBe(2);
			expect(appEndpoints['schema-builder']).toBeDefined();
			expect(appEndpoints['dashboard']).toBeNull(); // Dynamic
		});
	});

	describe('DEFAULT_DIRECT_CONNECT', () => {
		it('has correct default values', () => {
			expect(DEFAULT_DIRECT_CONNECT.enabled).toBe(false);
			expect(DEFAULT_DIRECT_CONNECT.endpoint).toBeNull();
			expect(DEFAULT_DIRECT_CONNECT.skipAuth).toBe(true);
		});
	});

	describe('schemaBuilderGraphqlEndpoint', () => {
		it('is a valid URL', () => {
			expect(typeof schemaBuilderGraphqlEndpoint).toBe('string');
			expect(schemaBuilderGraphqlEndpoint).toMatch(/^https?:\/\/.+\/graphql$/);
		});
	});

	// ============================================================================
	// Schema Context
	// ============================================================================

	describe('setSchemaContext / getSchemaContext', () => {
		it('allows forcing and clearing context', () => {
			setSchemaContext('schema-builder');
			expect(getSchemaContext()).toBe('schema-builder');

			setSchemaContext('dashboard');
			expect(getSchemaContext()).toBe('dashboard');

			setSchemaContext(null);
			expect(['schema-builder', 'dashboard']).toContain(getSchemaContext());
		});
	});

	describe('detectSchemaContextFromPath', () => {
		const dashboardPaths = [
			'/orgs/org-123/databases/db-456/data',
			'/orgs/org-123/databases/db-456/data/users',
		];
		const schemaBuilderPaths = [
			'/orgs/org-123/databases/db-456/schemas',
			'/orgs/org-123/databases',
			'/orgs/org-123/databases/db-456',
			'/orgs/org-123/databases/db-456/services',
			'/orgs/org-123/databases/db-456/security',
			'/', '/login', '/settings', '', undefined,
		];

		it.each(dashboardPaths)('returns dashboard for %s', (path) => {
			expect(detectSchemaContextFromPath(path)).toBe('dashboard');
		});

		it.each(schemaBuilderPaths)('returns schema-builder for %s', (path) => {
			expect(detectSchemaContextFromPath(path)).toBe('schema-builder');
		});
	});

	// ============================================================================
	// Endpoint Resolution
	// ============================================================================

	describe('getSchemaBuilderEndpoint', () => {
		it('returns runtime config when set, falls back otherwise', () => {
			(window as any).__RUNTIME_CONFIG__ = {
				NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT: 'https://api.production.com/graphql',
			};
			expect(getSchemaBuilderEndpoint()).toBe('https://api.production.com/graphql');

			// Empty runtime config
			(window as any).__RUNTIME_CONFIG__ = {};
			const result = getSchemaBuilderEndpoint();
			const buildTimeValue = BUILD_TIME_ENV_VALUES['NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT'];
			expect(result).toBe(buildTimeValue || DEFAULT_SCHEMA_BUILDER_ENDPOINT);
		});
	});

	describe('getDefaultEndpoint', () => {
		it('returns endpoint for schema-builder, null for dashboard', () => {
			(window as any).__RUNTIME_CONFIG__ = {};
			expect(getDefaultEndpoint('schema-builder')).toBeDefined();
			expect(getDefaultEndpoint('dashboard')).toBeNull();

			(window as any).__RUNTIME_CONFIG__ = {
				NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT: 'https://runtime.api.com/graphql',
			};
			expect(getDefaultEndpoint('schema-builder')).toBe('https://runtime.api.com/graphql');
		});
	});

	describe('getSchemaBuilderSubEndpoint', () => {
		it('returns per-sub-endpoint env var when set', () => {
			(window as any).__RUNTIME_CONFIG__ = {
				NEXT_PUBLIC_AUTH_GRAPHQL_ENDPOINT: 'http://auth.prod/graphql',
			};
			expect(getSchemaBuilderSubEndpoint('auth')).toBe('http://auth.prod/graphql');
		});

		it('falls back to main schema-builder endpoint when no sub-endpoint env', () => {
			(window as any).__RUNTIME_CONFIG__ = {
				NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT: 'http://main.prod/graphql',
			};
			// admin has no per-sub env set, should use main
			expect(getSchemaBuilderSubEndpoint('admin')).toBe('http://main.prod/graphql');
		});

		it('falls back to hardcoded default when no env vars set', () => {
			(window as any).__RUNTIME_CONFIG__ = {};
			const result = getSchemaBuilderSubEndpoint('app-public');
			const buildTimeValue = BUILD_TIME_ENV_VALUES['NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT'];
			expect(result).toBe(buildTimeValue || DEFAULT_SCHEMA_BUILDER_ENDPOINT);
		});

		it('per-sub env takes priority over main endpoint', () => {
			(window as any).__RUNTIME_CONFIG__ = {
				NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT: 'http://main.prod/graphql',
				NEXT_PUBLIC_ADMIN_GRAPHQL_ENDPOINT: 'http://admin.prod/graphql',
			};
			expect(getSchemaBuilderSubEndpoint('admin')).toBe('http://admin.prod/graphql');
			// auth still falls back to main
			expect(getSchemaBuilderSubEndpoint('auth')).toBe('http://main.prod/graphql');
		});

		it('api sub-endpoint reuses the legacy SCHEMA_BUILDER key', () => {
			(window as any).__RUNTIME_CONFIG__ = {
				NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT: 'http://legacy.api/graphql',
			};
			expect(getSchemaBuilderSubEndpoint('api')).toBe('http://legacy.api/graphql');
		});

		it('resolves all four sub-endpoints', () => {
			(window as any).__RUNTIME_CONFIG__ = {};
			const subs: SchemaBuilderSubEndpoint[] = ['app-public', 'auth', 'admin', 'api'];
			for (const sub of subs) {
				const result = getSchemaBuilderSubEndpoint(sub);
				expect(typeof result).toBe('string');
				expect(result.length).toBeGreaterThan(0);
			}
		});
	});

	describe('Endpoint Priority: Docker runtime > Build-time > Default', () => {
		it('Docker runtime takes precedence', () => {
			(window as any).__RUNTIME_CONFIG__ = {
				NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT: 'http://docker-runtime/graphql',
			};
			expect(getSchemaBuilderEndpoint()).toBe('http://docker-runtime/graphql');
		});

		it('Build-time or default when no runtime config', () => {
			(window as any).__RUNTIME_CONFIG__ = {};
			const result = getSchemaBuilderEndpoint();
			const buildTimeValue = BUILD_TIME_ENV_VALUES['NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT'];
			expect(result).toBe(buildTimeValue || DEFAULT_SCHEMA_BUILDER_ENDPOINT);
		});
	});

	// ============================================================================
	// getRuntimeConfig
	// ============================================================================

	describe('getRuntimeConfig', () => {
		it('priority: runtime > build-time > default', () => {
			(window as any).__RUNTIME_CONFIG__ = {
				NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT: 'http://runtime.test/graphql',
			};
			expect(getRuntimeConfig('NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT')).toBe('http://runtime.test/graphql');

			// Runtime wins over build-time
			(window as any).__RUNTIME_CONFIG__ = {
				NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT: 'http://runtime-wins.test/graphql',
			};
			expect(getRuntimeConfig('NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT')).toBe('http://runtime-wins.test/graphql');
		});

		it('ignores empty string and undefined runtime values', () => {
			(window as any).__RUNTIME_CONFIG__ = {
				NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT: '',
			};
			const result = getRuntimeConfig('NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT', 'http://default.test/graphql');
			expect(result).not.toBe('');

			(window as any).__RUNTIME_CONFIG__ = {};
			expect(getRuntimeConfig('NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT', 'http://default.test/graphql')).toBeDefined();
		});

		it('returns undefined when no value and no default', () => {
			(window as any).__RUNTIME_CONFIG__ = {};
			const key = 'NEXT_PUBLIC_DATABASE_SETUP_SITE_DESCRIPTION' as RuntimeConfigKey;
			if (!BUILD_TIME_ENV_VALUES[key]) {
				expect(getRuntimeConfig(key)).toBeUndefined();
			}
		});
	});

	describe('getAllRuntimeConfig', () => {
		it('returns all configured values with runtime override', () => {
			(window as any).__RUNTIME_CONFIG__ = {
				NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT: 'http://sb.test/graphql',
				NEXT_PUBLIC_DATABASE_SETUP_BASE_DOMAIN: 'test.domain.com',
			};
			const config = getAllRuntimeConfig();
			expect(config.NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT).toBe('http://sb.test/graphql');
			expect(config.NEXT_PUBLIC_DATABASE_SETUP_BASE_DOMAIN).toBe('test.domain.com');
		});
	});

	// ============================================================================
	// parseEnvBoolean
	// ============================================================================

	describe('parseEnvBoolean', () => {
		const truthyValues = ['true', 'TRUE', 'True', '1', 'yes', 'YES', 'on', 'ON'];
		const falsyValues = ['false', 'FALSE', 'False', '0', 'no', 'NO', 'off', 'OFF'];

		it.each(truthyValues)('returns true for %s', (val) => {
			expect(parseEnvBoolean(val)).toBe(true);
		});

		it.each(falsyValues)('returns false for %s', (val) => {
			expect(parseEnvBoolean(val)).toBe(false);
		});

		it('returns default for undefined/empty/unrecognized', () => {
			expect(parseEnvBoolean(undefined)).toBe(false);
			expect(parseEnvBoolean(undefined, true)).toBe(true);
			expect(parseEnvBoolean('')).toBe(false);
			expect(parseEnvBoolean('', true)).toBe(true);
			expect(parseEnvBoolean('maybe')).toBe(false);
			expect(parseEnvBoolean('maybe', true)).toBe(true);
		});

		it('trims whitespace', () => {
			expect(parseEnvBoolean('  true  ')).toBe(true);
			expect(parseEnvBoolean('  false  ')).toBe(false);
		});
	});

	// ============================================================================
	// BUILD_TIME_ENV_VALUES and RUNTIME_CONFIG_KEYS
	// ============================================================================

	describe('BUILD_TIME_ENV_VALUES', () => {
		it('matches RUNTIME_CONFIG_KEYS exactly', () => {
			const buildTimeKeys = Object.keys(BUILD_TIME_ENV_VALUES).sort();
			const configKeys = [...RUNTIME_CONFIG_KEYS].sort();
			expect(buildTimeKeys).toEqual(configKeys);
		});

		it('all values are string or undefined', () => {
			for (const key of RUNTIME_CONFIG_KEYS) {
				const value = BUILD_TIME_ENV_VALUES[key];
				expect(value === undefined || typeof value === 'string').toBe(true);
			}
		});
	});

	describe('RUNTIME_CONFIG_KEYS', () => {
		it('has expected structure', () => {
			expect(RUNTIME_CONFIG_KEYS.length).toBe(24);
			expect(new Set(RUNTIME_CONFIG_KEYS).size).toBe(RUNTIME_CONFIG_KEYS.length); // No duplicates
			for (const key of RUNTIME_CONFIG_KEYS) {
				expect(key.startsWith('NEXT_PUBLIC_')).toBe(true);
			}
			expect(RUNTIME_CONFIG_KEYS).not.toContain('NEXT_PUBLIC_CRM_GRAPHQL_ENDPOINT'); // Dynamic
			expect(RUNTIME_CONFIG_KEYS).toContain('NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT');
		});
	});

	// ============================================================================
	// validateEndpointUrl
	// ============================================================================

	describe('validateEndpointUrl', () => {
		const validUrls = [
			'http://localhost:3000/graphql',
			'https://api.example.com/graphql',
			'http://api.test/graphql?debug=true',
			'http://localhost:4000/graphql',
			'https://api.prod.example.com/graphql',
			'  http://api.test/graphql  ', // whitespace trimmed
		];

		const invalidUrls = [
			['', 'Endpoint URL is required'],
			['   ', 'Endpoint URL is required'],
			['\t\n', 'Endpoint URL is required'],
			['not-a-url', 'Invalid URL format'],
			['api.example.com/graphql', 'Invalid URL format'],
			['http://', 'Invalid URL format'],
			['http://api test.com/graphql', 'Invalid URL format'],
			['ftp://files.example.com', 'URL must use http or https protocol'],
			['file:///path/to/file', 'URL must use http or https protocol'],
			['ws://api.example.com/graphql', 'URL must use http or https protocol'],
		] as const;

		it.each(validUrls)('accepts valid URL: %s', (url) => {
			expect(validateEndpointUrl(url)).toBe(null);
		});

		it.each(invalidUrls)('rejects invalid URL %s with error %s', (url, error) => {
			expect(validateEndpointUrl(url)).toBe(error);
		});
	});

	// ============================================================================
	// Direct Connect
	// ============================================================================

	describe('shouldBypassAuth', () => {
		it('returns true only when enabled with skipAuth=true for correct context', () => {
			const enabledWithSkip: Record<SchemaContext, DirectConnectConfig> = {
				dashboard: { enabled: true, endpoint: 'http://test.com/graphql', skipAuth: true },
				'schema-builder': DEFAULT_DIRECT_CONNECT,
			};
			expect(shouldBypassAuth('dashboard', enabledWithSkip)).toBe(true);
			expect(shouldBypassAuth('schema-builder', enabledWithSkip)).toBe(false);

			const enabledNoSkip: Record<SchemaContext, DirectConnectConfig> = {
				dashboard: { enabled: true, endpoint: 'http://test.com/graphql', skipAuth: false },
				'schema-builder': DEFAULT_DIRECT_CONNECT,
			};
			expect(shouldBypassAuth('dashboard', enabledNoSkip)).toBe(false);
		});

		it('returns false when disabled or undefined config', () => {
			expect(shouldBypassAuth('dashboard', defaultDirectConnect)).toBe(false);
			expect(shouldBypassAuth('dashboard', {} as Record<SchemaContext, DirectConnectConfig>)).toBe(false);
		});
	});

	describe('getDirectConnectEndpoint', () => {
		it('returns endpoint when enabled, null otherwise', () => {
			expect(getDirectConnectEndpoint('dashboard', defaultDirectConnect)).toBe(null);

			const withEndpoint: Record<SchemaContext, DirectConnectConfig> = {
				dashboard: { enabled: true, endpoint: 'http://custom.test/graphql', skipAuth: true },
				'schema-builder': DEFAULT_DIRECT_CONNECT,
			};
			expect(getDirectConnectEndpoint('dashboard', withEndpoint)).toBe('http://custom.test/graphql');

			const enabledNoEndpoint: Record<SchemaContext, DirectConnectConfig> = {
				dashboard: { enabled: true, endpoint: null, skipAuth: true },
				'schema-builder': DEFAULT_DIRECT_CONNECT,
			};
			expect(getDirectConnectEndpoint('dashboard', enabledNoEndpoint)).toBe(null);
		});

		it('returns correct endpoint per context', () => {
			const both: Record<SchemaContext, DirectConnectConfig> = {
				dashboard: { enabled: true, endpoint: 'http://dashboard.test/graphql', skipAuth: true },
				'schema-builder': { enabled: true, endpoint: 'http://schema.test/graphql', skipAuth: false },
			};
			expect(getDirectConnectEndpoint('dashboard', both)).toBe('http://dashboard.test/graphql');
			expect(getDirectConnectEndpoint('schema-builder', both)).toBe('http://schema.test/graphql');
		});
	});

	describe('isDirectConnectSupported', () => {
		it('returns true for dashboard, false for schema-builder', () => {
			expect(isDirectConnectSupported('dashboard')).toBe(true);
			expect(isDirectConnectSupported('schema-builder')).toBe(false);
		});
	});

	describe('createDirectConnectConfig', () => {
		it('creates enabled config with endpoint and skipAuth', () => {
			const config = createDirectConnectConfig(true, 'http://test.com/graphql', true);
			expect(config).toEqual({ enabled: true, endpoint: 'http://test.com/graphql', skipAuth: true });

			const configNoSkip = createDirectConnectConfig(true, 'http://test.com/graphql', false);
			expect(configNoSkip.skipAuth).toBe(false);
		});

		it('trims whitespace and handles empty/null endpoint', () => {
			expect(createDirectConnectConfig(true, '  http://test.com/graphql  ', true).endpoint).toBe('http://test.com/graphql');
			expect(createDirectConnectConfig(true, '', true).endpoint).toBe(null);
			expect(createDirectConnectConfig(true, '   ', true).endpoint).toBe(null);
			expect(createDirectConnectConfig(true, undefined, true).endpoint).toBe(null);
			expect(createDirectConnectConfig(true, null, true).endpoint).toBe(null);
		});

		it('defaults skipAuth to true', () => {
			expect(createDirectConnectConfig(true, 'http://test.com/graphql').skipAuth).toBe(true);
		});

		it('creates disabled config ignoring endpoint', () => {
			const config = createDirectConnectConfig(false, 'http://test.com/graphql', true);
			expect(config).toEqual({ enabled: false, endpoint: null, skipAuth: true });
		});
	});

	// ============================================================================
	// Integration Scenarios
	// ============================================================================

	describe('Direct Connect Integration', () => {
		it('enable/disable workflow', () => {
			let directConnect = { ...defaultDirectConnect };
			expect(shouldBypassAuth('dashboard', directConnect)).toBe(false);
			expect(getDirectConnectEndpoint('dashboard', directConnect)).toBe(null);

			// Enable
			const endpoint = 'http://public-test.com/graphql';
			expect(validateEndpointUrl(endpoint)).toBe(null);
			directConnect = {
				...directConnect,
				dashboard: createDirectConnectConfig(true, endpoint, true),
			};
			expect(shouldBypassAuth('dashboard', directConnect)).toBe(true);
			expect(getDirectConnectEndpoint('dashboard', directConnect)).toBe(endpoint);
			expect(shouldBypassAuth('schema-builder', directConnect)).toBe(false);

			// Disable
			directConnect = {
				...directConnect,
				dashboard: createDirectConnectConfig(false),
			};
			expect(shouldBypassAuth('dashboard', directConnect)).toBe(false);
			expect(getDirectConnectEndpoint('dashboard', directConnect)).toBe(null);
		});
	});

	describe('Edge Cases', () => {
		const edgeCaseUrls = [
			['URL with query params', 'http://api.test/graphql?token=abc&debug=true'],
			['URL with encoded chars', 'http://api.test/graphql?name=%E2%9C%93'],
			['localhost with port', 'http://localhost:4000/graphql'],
			['HTTPS', 'https://secure-api.example.com/graphql'],
			['api.localhost subdomain', 'http://api.localhost:3000/graphql'],
		] as const;

		it.each(edgeCaseUrls)('handles %s', (_, url) => {
			(window as any).__RUNTIME_CONFIG__ = {
				NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT: url,
			};
			expect(getRuntimeConfig('NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT')).toBe(url);
		});

		it('handles unicode and special characters in values', () => {
			(window as any).__RUNTIME_CONFIG__ = {
				NEXT_PUBLIC_DATABASE_SETUP_SITE_DESCRIPTION: '测试数据库 🚀',
			};
			expect(getRuntimeConfig('NEXT_PUBLIC_DATABASE_SETUP_SITE_DESCRIPTION')).toBe('测试数据库 🚀');

			(window as any).__RUNTIME_CONFIG__ = {
				NEXT_PUBLIC_DATABASE_SETUP_SITE_DESCRIPTION: "it's a \"test\"",
			};
			expect(getRuntimeConfig('NEXT_PUBLIC_DATABASE_SETUP_SITE_DESCRIPTION')).toBe("it's a \"test\"");
		});
	});

	describe('Docker Runtime Injection Simulation', () => {
		it('full and partial runtime config', () => {
			// Full config
			(window as any).__RUNTIME_CONFIG__ = {
				NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT: 'https://api.production.com/graphql',
				NEXT_PUBLIC_DATABASE_SETUP_BASE_DOMAIN: 'production.com',
				NEXT_PUBLIC_DATABASE_SETUP_DBNAME: 'prod_db',
			};
			expect(getRuntimeConfig('NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT')).toBe('https://api.production.com/graphql');
			expect(getRuntimeConfig('NEXT_PUBLIC_DATABASE_SETUP_BASE_DOMAIN')).toBe('production.com');

			// Partial - only override endpoint
			(window as any).__RUNTIME_CONFIG__ = {
				NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT: 'https://api.docker.com/graphql',
			};
			expect(getRuntimeConfig('NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT')).toBe('https://api.docker.com/graphql');

			// Empty - use build-time or default
			(window as any).__RUNTIME_CONFIG__ = {};
			const result = getRuntimeConfig('NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT', 'http://fallback/graphql');
			expect(result).toBeDefined();
		});
	});
});
