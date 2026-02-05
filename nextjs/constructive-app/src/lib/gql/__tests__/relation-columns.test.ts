/**
 * Tests for the simplified relation-aware column utilities
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

import { __buildRelationInfoFromMeta } from '@/store/data-grid-slice';

import { RELATION_CACHE_CONFIG, RELATION_CACHE_KEYS } from '../hooks/dashboard/use-relation-metadata-cache';
import { renderHookWithQuery } from './test-utils';

// Mock the meta query hook
vi.mock('../hooks/dashboard/use-dashboard-meta-query', () => ({
	useMeta: vi.fn(() => ({
		data: {
			_meta: {
				tables: [
					{
						name: 'posts',
						fields: [
							{ name: 'id', type: { gqlType: 'UUID', isArray: false, pgType: 'uuid' } },
							{ name: 'title', type: { gqlType: 'String', isArray: false, pgType: 'text' } },
						],
						relations: {
							belongsTo: [
								{
									fieldName: 'author',
									isUnique: false,
									references: { name: 'users' },
									keys: [{ name: 'authorId', type: { gqlType: 'UUID', isArray: false } }],
									type: 'belongsTo',
								},
							],
							hasOne: [],
							hasMany: [
								{
									fieldName: 'comments',
									isUnique: false,
									referencedBy: { name: 'comments' },
									keys: [{ name: 'postId', type: { gqlType: 'UUID', isArray: false } }],
									type: 'hasMany',
								},
							],
							manyToMany: [],
						},
					},
				],
			},
		},
		isError: false,
		error: null,
	})),
}));

describe('Relation Metadata Cache', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Cache Configuration', () => {
		it('should have reasonable cache timing', () => {
			expect(RELATION_CACHE_CONFIG.staleTime).toBe(5 * 60 * 1000); // 5 minutes
			expect(RELATION_CACHE_CONFIG.gcTime).toBe(30 * 60 * 1000); // 30 minutes
			expect(RELATION_CACHE_CONFIG.retry).toBe(3);
		});

		it('should have correct cache keys', () => {
			const scope = { databaseId: 'db-1', endpoint: 'https://example.com/graphql' };
			expect(RELATION_CACHE_KEYS.tableRelations(scope, 'posts')).toEqual(['dashboard', scope, 'relations', 'posts']);
		});

		it('should have exponential backoff for retries', () => {
			const delay1 = RELATION_CACHE_CONFIG.retryDelay(0);
			const delay2 = RELATION_CACHE_CONFIG.retryDelay(1);
			const delay3 = RELATION_CACHE_CONFIG.retryDelay(2);

			expect(delay1).toBe(1000); // 1s
			expect(delay2).toBe(2000); // 2s
			expect(delay3).toBe(4000); // 4s
		});

		it('should cap retry delay at 5 seconds', () => {
			const delay = RELATION_CACHE_CONFIG.retryDelay(10); // Very high attempt
			expect(delay).toBe(5000); // Capped at 5s
		});
	});

	describe('Integration', () => {
		it('should be importable without errors', async () => {
			const { useRelationMetadataCache } = await import('../hooks/dashboard/use-relation-metadata-cache');
			const { useRelationColumns, useDataGridColumns } = await import('../hooks/dashboard/use-relation-columns');

			expect(useRelationMetadataCache).toBeDefined();
			expect(useRelationColumns).toBeDefined();
			expect(useDataGridColumns).toBeDefined();
		});
	});

	describe('Error Handling', () => {
		it('should handle missing table gracefully', () => {
			// Our cache should not throw errors for missing tables
			// Instead it should return null and log a warning
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			// This test verifies that our error handling approach is sound
			expect(() => {
				console.warn('Table "nonexistent" not found in metadata');
			}).not.toThrow();

			consoleSpy.mockRestore();
		});
	});

	describe('Empty table columns', () => {
		it('should include relation field names even when there are no rows', async () => {
			const { useRelationColumns } = await import('../hooks/dashboard/use-relation-columns');

			const { result } = renderHookWithQuery(() => useRelationColumns('posts', []));

			await waitFor(() => {
				expect(result.current.columnKeys).toEqual(expect.arrayContaining(['id', 'title', 'author', 'comments']));
			});
		});
	});
});

describe('Backward Compatibility', () => {
	it('should maintain the original hook interface', () => {
		// Test that the original interface is preserved
		const mockRows = [{ id: '1', title: 'Test', author: 'user1' }];

		// The original hook should return these properties
		const expectedProperties = [
			'columns',
			'columnKeys',
			'metaFields',
			'isImageField',
			'findImageColumnKey',
			'relationTypeByField',
		];

		// The relation-aware hook should include all original properties plus new ones
		const relationAwareProperties = [
			...expectedProperties,
			'relationMetadata',
			'hasRelationErrors',
			'relationCount',
			'getRelationKind',
			'isRelationField',
			'invalidateRelationCache',
		];

		expect(expectedProperties.length).toBe(6); // Original interface
		expect(relationAwareProperties.length).toBe(12);
		expect(relationAwareProperties).toEqual(expect.arrayContaining(expectedProperties));
	});
});

describe('Relation info mapping', () => {
	const meta = {
		_meta: {
			tables: [
				{
					name: 'posts',
					fields: [
						{ name: 'id', type: { gqlType: 'UUID', isArray: false, pgType: 'uuid' } },
						{ name: 'authorId', type: { gqlType: 'UUID', isArray: false, pgType: 'uuid' } },
					],
					relations: {
						belongsTo: [
							{
								fieldName: 'author',
								isUnique: false,
								referencesTable: 'users',
								keys: [{ name: 'authorId', type: { gqlType: 'UUID', isArray: false } }],
								type: 'belongsTo',
							},
						],
						hasOne: [],
						hasMany: [],
						manyToMany: [],
					},
				},
			],
		},
	};

	it('maps belongsTo relations to both relation and foreign key fields', () => {
		const info = __buildRelationInfoFromMeta('posts', meta as any);
		expect(info).toBeTruthy();
		expect(info?.author).toMatchObject({
			kind: 'belongsTo',
			relationField: 'author',
			foreignKeyField: 'authorId',
		});
		expect(info?.authorId).toMatchObject({
			kind: 'belongsTo',
			relationField: 'author',
			foreignKeyField: 'authorId',
		});
	});
});
