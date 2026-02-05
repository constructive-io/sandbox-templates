import { describe, expect, it } from 'vitest';

import { getHostnameError, getSubdomainError, isValidHostname, isValidSubdomain } from '../hostname';

describe('hostname validation', () => {
	describe('isValidSubdomain', () => {
		const validCases = ['', 'a', '1', 'api', 'test123', 'API', 'MyApi', 'my-api', 'a-b-c', 'a'.repeat(63)];

		const invalidCases = ['-api', 'api-', 'my.api', 'my_api', 'my api', ' api', 'api ', 'my@api', 'a'.repeat(64)];

		it.each(validCases)('returns true for valid: %s', (subdomain) => {
			expect(isValidSubdomain(subdomain)).toBe(true);
		});

		it.each(invalidCases)('returns false for invalid: %s', (subdomain) => {
			expect(isValidSubdomain(subdomain)).toBe(false);
		});
	});

	describe('getSubdomainError', () => {
		const errorCases = [
			['-api', 'Subdomain cannot start with a hyphen'],
			['api-', 'Subdomain cannot end with a hyphen'],
			['my.api', 'Subdomain cannot contain dots'],
			['my_api', 'Subdomain cannot contain underscores'],
			['my api', 'Subdomain cannot contain spaces'],
			['a'.repeat(64), 'Subdomain must be 63 characters or less'],
			['api@test', 'Subdomain can only contain letters, numbers, and hyphens'],
		] as const;

		it('returns null for valid subdomains', () => {
			expect(getSubdomainError('')).toBeNull();
			expect(getSubdomainError('api')).toBeNull();
			expect(getSubdomainError('my-api')).toBeNull();
		});

		it.each(errorCases)('returns error for %s', (input, expected) => {
			expect(getSubdomainError(input)).toBe(expected);
		});
	});

	describe('isValidHostname', () => {
		const validCases = ['localhost', 'example', 'example.com', 'sub.example.com', 'my-domain.com', 'a'.repeat(253)];

		const invalidCases = ['', 'my_domain.com', '-example.com', 'example-.com', 'a'.repeat(254)];

		it.each(validCases)('returns true for valid: %s', (hostname) => {
			expect(isValidHostname(hostname)).toBe(true);
		});

		it.each(invalidCases)('returns false for invalid: %s', (hostname) => {
			expect(isValidHostname(hostname)).toBe(false);
		});
	});

	describe('getHostnameError', () => {
		const errorCases = [
			['', 'Hostname is required'],
			['my domain.com', 'Hostname cannot contain spaces'],
			['my_domain.com', 'Hostname cannot contain underscores'],
			['a'.repeat(254), 'Hostname must be 253 characters or less'],
		] as const;

		it('returns null for valid hostnames', () => {
			expect(getHostnameError('localhost')).toBeNull();
			expect(getHostnameError('example.com')).toBeNull();
		});

		it.each(errorCases)('returns error for %s', (input, expected) => {
			expect(getHostnameError(input)).toBe(expected);
		});
	});
});
