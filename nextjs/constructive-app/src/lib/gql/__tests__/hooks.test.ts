/**
 * Tests for hooks.ts
 * Tests the main useTable hook, query key management, mutation operations, and React Query integration
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { queryKeys } from '../hooks';
import { queryOptionsFixtures } from './fixtures';

describe('hooks', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('queryKeys', () => {
		it('should generate consistent query keys', () => {
			const scope = { databaseId: 'db-1', endpoint: 'https://example.com/graphql' };
			expect(queryKeys.table(scope, 'users')).toEqual(['dashboard', scope, 'table', 'users']);
			expect(queryKeys.tableRows(scope, 'users')).toEqual(['dashboard', scope, 'table', 'users', 'rows', undefined]);
			expect(queryKeys.tableRow(scope, 'users', '123')).toEqual(['dashboard', scope, 'table', 'users', 'row', '123']);
			expect(queryKeys.tableCount(scope, 'users')).toEqual(['dashboard', scope, 'table', 'users', 'count', undefined]);
		});

		it('should include options in query keys', () => {
			const scope = { databaseId: 'db-1', endpoint: 'https://example.com/graphql' };
			const options = { first: 10, where: { isActive: true } };
			expect(queryKeys.tableRows(scope, 'users', options)).toEqual(['dashboard', scope, 'table', 'users', 'rows', options]);
			expect(queryKeys.tableCount(scope, 'users', options.where)).toEqual([
				'dashboard',
				scope,
				'table',
				'users',
				'count',
				options.where,
			]);
		});

		it('should handle different table names', () => {
			const scope = { databaseId: 'db-1', endpoint: 'https://example.com/graphql' };
			expect(queryKeys.table(scope, 'posts')).toEqual(['dashboard', scope, 'table', 'posts']);
			expect(queryKeys.table(scope, 'user_profiles')).toEqual(['dashboard', scope, 'table', 'user_profiles']);
			expect(queryKeys.table(scope, 'complex-table-name')).toEqual(['dashboard', scope, 'table', 'complex-table-name']);
		});

		it('should handle complex options in query keys', () => {
			const scope = { databaseId: 'db-1', endpoint: 'https://example.com/graphql' };
			const complexOptions = queryOptionsFixtures.complex;
			expect(queryKeys.tableRows(scope, 'users', complexOptions)).toEqual([
				'dashboard',
				scope,
				'table',
				'users',
				'rows',
				complexOptions,
			]);
		});

		it('should handle null and undefined values', () => {
			const scope = { databaseId: 'db-1', endpoint: 'https://example.com/graphql' };
			expect(queryKeys.tableRow(scope, 'users', null)).toEqual(['dashboard', scope, 'table', 'users', 'row', null]);
			expect(queryKeys.tableRow(scope, 'users', undefined)).toEqual([
				'dashboard',
				scope,
				'table',
				'users',
				'row',
				undefined,
			]);
			expect(queryKeys.tableRows(scope, 'users', null)).toEqual(['dashboard', scope, 'table', 'users', 'rows', null]);
			expect(queryKeys.tableCount(scope, 'users', null)).toEqual(['dashboard', scope, 'table', 'users', 'count', null]);
		});
	});

	describe('hook utilities', () => {
		it('should provide consistent query key structure', () => {
			// Test that query keys follow a predictable pattern
			const scope = { databaseId: 'db-1', endpoint: 'https://example.com/graphql' };
			const tableKey = queryKeys.table(scope, 'users');
			const rowsKey = queryKeys.tableRows(scope, 'users');
			const rowKey = queryKeys.tableRow(scope, 'users', '123');
			const countKey = queryKeys.tableCount(scope, 'users');

			// All keys should start with the table key
			expect(rowsKey.slice(0, tableKey.length)).toEqual(tableKey);
			expect(rowKey.slice(0, tableKey.length)).toEqual(tableKey);
			expect(countKey.slice(0, tableKey.length)).toEqual(tableKey);

			// Keys should be arrays for React Query compatibility
			expect(Array.isArray(tableKey)).toBe(true);
			expect(Array.isArray(rowsKey)).toBe(true);
			expect(Array.isArray(rowKey)).toBe(true);
			expect(Array.isArray(countKey)).toBe(true);
		});

		it('should generate unique keys for different operations', () => {
			const scope = { databaseId: 'db-1', endpoint: 'https://example.com/graphql' };
			const tableKey = queryKeys.table(scope, 'users');
			const rowsKey = queryKeys.tableRows(scope, 'users');
			const rowKey = queryKeys.tableRow(scope, 'users', '123');
			const countKey = queryKeys.tableCount(scope, 'users');

			// All keys should be different
			expect(tableKey).not.toEqual(rowsKey);
			expect(tableKey).not.toEqual(rowKey);
			expect(tableKey).not.toEqual(countKey);
			expect(rowsKey).not.toEqual(rowKey);
			expect(rowsKey).not.toEqual(countKey);
			expect(rowKey).not.toEqual(countKey);
		});

		it('should handle special characters in table names', () => {
			const scope = { databaseId: 'db-1', endpoint: 'https://example.com/graphql' };
			const specialNames = ['user-profiles', 'user_settings', 'user.data', 'user spaces'];

			specialNames.forEach((tableName) => {
				const key = queryKeys.table(scope, tableName);
				expect(key).toEqual(['dashboard', scope, 'table', tableName]);
				expect(key[3]).toBe(tableName);
			});
		});
	});
});
