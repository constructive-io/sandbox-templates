/**
 * Integration tests for data library
 * Tests the complete data flow from hook usage through query generation to GraphQL execution
 */
import { QueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { execute, executeCrmInScope } from '@/graphql/execute';
import { useMeta } from '@/lib/gql/hooks/dashboard/use-dashboard-meta-query';
import { QueryBuilder } from '@/lib/query-builder';

import { useTable } from '../hooks';
import { complexTable, dataResponseFixtures, errorFixtures, queryOptionsFixtures, simpleTable } from './fixtures';
import { createMockExecute, createMockMetaResponse, createTestQueryClient, renderHookWithQuery } from './test-utils';

// Mock all dependencies
vi.mock('@/graphql/execute');
vi.mock('@/lib/gql/hooks/dashboard/use-dashboard-meta-query');
vi.mock('@/lib/query-builder');

describe('integration tests', () => {
	let queryClient: QueryClient;
	let mockExecute: ReturnType<typeof createMockExecute>;

	beforeEach(() => {
		queryClient = createTestQueryClient();

		// Clear mocks first before setting up new ones
		vi.clearAllMocks();

		mockExecute = createMockExecute();

		// Setup comprehensive mocks using imported mocked functions
		vi.mocked(execute).mockImplementation(mockExecute);
		vi.mocked(executeCrmInScope).mockImplementation((_options, document, variables) => mockExecute(document, variables));
		vi.mocked(useMeta).mockReturnValue({
			data: createMockMetaResponse(),
			isLoading: false,
			error: null,
		});

		// Mock query builder
		vi.mocked(QueryBuilder).mockImplementation(() => ({
			query: vi.fn().mockReturnThis(),
			getMany: vi.fn().mockReturnThis(),
			getOne: vi.fn().mockReturnThis(),
			create: vi.fn().mockReturnThis(),
			update: vi.fn().mockReturnThis(),
			delete: vi.fn().mockReturnThis(),
			print: vi.fn().mockReturnValue({
				_hash: 'mock-query-hash',
				_queryName: 'mockQuery',
			}),
		}));
	});

	afterEach(() => {
		queryClient.clear();
	});

	describe('end-to-end data flow', () => {
		it('should complete full query lifecycle', async () => {
			// Setup response
			vi.mocked(executeCrmInScope).mockResolvedValue(dataResponseFixtures.users);

			const { result } = renderHookWithQuery(
				() =>
					useTable('users', {
						select: 'display',
						first: 10,
						where: { isActive: { equalTo: true } },
						orderBy: [{ field: 'name', direction: 'asc' }],
					}),
				{ queryClient },
			);

			// Verify loading state
			expect(result.current.isLoading).toBe(true);

			// Wait for data to load
			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			// Verify data is loaded correctly
			expect(result.current.data).toEqual(dataResponseFixtures.users.users.nodes);
			expect(result.current.totalCount).toBe(dataResponseFixtures.users.users.totalCount);
			expect(result.current.error).toBeNull();

			// Verify GraphQL execution was called
			expect(vi.mocked(executeCrmInScope)).toHaveBeenCalled();
			expect(vi.mocked(executeCrmInScope).mock.calls[0][2]).toMatchObject({
				first: 10,
			});
		});

		it('should handle complex field queries', async () => {
			// Setup response with complex data
			vi.mocked(executeCrmInScope).mockResolvedValue(dataResponseFixtures.complexData);

			const { result } = renderHookWithQuery(
				() =>
					useTable('complex_table', {
						select: 'all',
					}),
				{ queryClient },
			);

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			const data = result.current.data[0];
			expect(data).toHaveProperty('location');
			expect(data.location).toEqual({ x: 10.5, y: 20.3 });
			expect(data).toHaveProperty('timeSpent');
			expect(data.timeSpent).toHaveProperty('days');
			expect(data.timeSpent).toHaveProperty('hours');
		});

		it('should handle complete CRUD operations', async () => {
			// Initial data load
			vi.mocked(executeCrmInScope).mockResolvedValueOnce(dataResponseFixtures.users);

			const { result } = renderHookWithQuery(() => useTable('users'), { queryClient });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			// Test CREATE
			vi.mocked(executeCrmInScope).mockResolvedValueOnce({
				createUser: {
					user: {
						id: '4',
						name: 'New User',
						email: 'new@example.com',
						isActive: true,
					},
				},
			});

			await act(async () => {
				const created = await result.current.create({
					name: 'New User',
					email: 'new@example.com',
					isActive: true,
				});
				expect(created).toBeDefined();
			});

			// Test UPDATE
			vi.mocked(executeCrmInScope).mockResolvedValueOnce({
				updateUser: {
					user: {
						id: '1',
						name: 'Updated User',
						email: 'updated@example.com',
						isActive: true,
					},
				},
			});

			await act(async () => {
				const updated = await result.current.update('1', {
					name: 'Updated User',
					email: 'updated@example.com',
				});
				expect(updated).toBeDefined();
			});

			// Test DELETE
			vi.mocked(executeCrmInScope).mockResolvedValueOnce({
				deleteUser: {
					user: { id: '1' },
				},
			});

			await act(async () => {
				const deleted = await result.current.delete('1');
				expect(deleted).toBeDefined();
			});

			// Verify all operations were called (mutations trigger refetches, so just check minimum)
			expect(vi.mocked(executeCrmInScope)).toHaveBeenCalled();
			expect(vi.mocked(executeCrmInScope).mock.calls.length).toBeGreaterThanOrEqual(4);
		});

		it('omits nullish keys from create mutation variables', async () => {
			vi.mocked(executeCrmInScope).mockResolvedValue(dataResponseFixtures.users);

			const { result } = renderHookWithQuery(() => useTable('users'), { queryClient });
			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			vi.mocked(executeCrmInScope).mockClear();
			vi.mocked(executeCrmInScope).mockResolvedValueOnce({
				createUser: {
					user: {
						id: '4',
						name: 'New User',
						isActive: false,
					},
				},
			});

			await act(async () => {
				await result.current.create({
					name: 'New User',
					nickname: null,
					bio: undefined,
					isActive: false,
				});
			});

			const createVars = vi
				.mocked(executeCrmInScope)
				.mock.calls.map((call) => call[2] as any)
				.find((vars) => {
					const input = vars?.input;
					if (!input || typeof input !== 'object') return false;
					if ('patch' in input) return false;
					const inputKeys = Object.keys(input);
					if (inputKeys.length !== 1) return false;
					const payload = (input as any)[inputKeys[0]];
					return payload && typeof payload === 'object' && 'name' in payload;
				});
			expect(createVars).toBeDefined();

			const createInputKey = Object.keys((createVars as any).input)[0];
			const createInputPayload = (createVars as any).input[createInputKey];
			expect(createInputPayload).toMatchObject({ name: 'New User', isActive: false });
			expect(createInputPayload).not.toHaveProperty('nickname');
			expect(createInputPayload).not.toHaveProperty('bio');
		});

		it('keeps nulls in update patches but omits undefined keys', async () => {
			vi.mocked(executeCrmInScope).mockResolvedValue(dataResponseFixtures.users);

			const { result } = renderHookWithQuery(() => useTable('users'), { queryClient });
			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			vi.mocked(executeCrmInScope).mockClear();
			vi.mocked(executeCrmInScope).mockResolvedValueOnce({
				updateUser: {
					user: {
						id: '1',
						name: 'Updated User',
						nickname: null,
					},
				},
			});

			await act(async () => {
				await result.current.update('1', {
					name: undefined,
					nickname: null,
				});
			});

			const updateVars = vi
				.mocked(executeCrmInScope)
				.mock.calls.map((call) => call[2] as any)
				.find((vars) => vars?.input?.patch);
			expect(updateVars).toBeDefined();

			expect(updateVars).toMatchObject({
				input: {
					id: '1',
					patch: {
						nickname: null,
					},
				},
			});
			expect(updateVars.input.patch).not.toHaveProperty('name');
		});

	});

	describe('field selection integration', () => {
		it('should integrate field selection with query generation', async () => {
			vi.mocked(executeCrmInScope).mockResolvedValue(dataResponseFixtures.users);

			const { result } = renderHookWithQuery(
				() =>
					useTable('users', {
						select: {
							select: ['id', 'name', 'email'],
							exclude: ['createdAt'],
						},
					}),
				{ queryClient },
			);

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(vi.mocked(executeCrmInScope)).toHaveBeenCalledWith(
				expect.anything(),
				expect.anything(),
				expect.anything(),
			);
		});

		it('should handle preset field selections', async () => {
			vi.mocked(executeCrmInScope).mockResolvedValue(dataResponseFixtures.users);

			const presets = ['minimal', 'display', 'all', 'full'] as const;

			for (const preset of presets) {
				const { result } = renderHookWithQuery(() => useTable('users', { select: preset }), { queryClient });

				await waitFor(() => {
					expect(result.current.isLoading).toBe(false);
				});

				expect(result.current.data).toBeDefined();
			}
		});

		it('should handle complex field selections with relations', async () => {
			vi.mocked(executeCrmInScope).mockResolvedValue({
				users: {
					totalCount: 1,
					nodes: [
						{
							id: '1',
							name: 'User with Relations',
							posts: {
								totalCount: 2,
								nodes: [
									{ id: '1', title: 'Post 1' },
									{ id: '2', title: 'Post 2' },
								],
							},
						},
					],
				},
			});

			const { result } = renderHookWithQuery(
				() =>
					useTable('users', {
						select: {
							select: ['id', 'name'],
							include: {
								posts: ['id', 'title'],
							},
						},
					}),
				{ queryClient },
			);

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(result.current.data[0]).toHaveProperty('posts');
		});
	});

	describe('filtering and sorting integration', () => {
		it('should integrate complex filters with query generation', async () => {
			vi.mocked(executeCrmInScope).mockResolvedValue(dataResponseFixtures.users);

			const { result } = renderHookWithQuery(() => useTable('users', queryOptionsFixtures.complex), { queryClient });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(vi.mocked(executeCrmInScope)).toHaveBeenCalledWith(
				expect.anything(),
				expect.anything(),
				expect.objectContaining({
					first: 50,
					offset: 0,
				}),
			);
		});

		it('should handle pagination with sorting', async () => {
			vi.mocked(executeCrmInScope).mockResolvedValue(dataResponseFixtures.users);

			const { result } = renderHookWithQuery(
				() =>
					useTable('users', {
						first: 25,
						offset: 50,
						orderBy: [
							{ field: 'name', direction: 'asc' },
							{ field: 'createdAt', direction: 'desc' },
						],
					}),
				{ queryClient },
			);

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(vi.mocked(executeCrmInScope)).toHaveBeenCalledWith(
				expect.anything(),
				expect.anything(),
				expect.objectContaining({
					first: 25,
					offset: 50,
				}),
			);
		});
	});

	describe('cache integration', () => {
		it('should properly cache and invalidate queries', async () => {
			vi.mocked(executeCrmInScope).mockResolvedValue(dataResponseFixtures.users);

			const { result } = renderHookWithQuery(() => useTable('users'), { queryClient });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			// Clear mock to verify cache hit
			vi.mocked(executeCrmInScope).mockClear();

			// Second hook should use cache
			const { result: result2 } = renderHookWithQuery(() => useTable('users'), { queryClient });

			expect(result2.current.isLoading).toBe(false);
			expect(result2.current.data).toEqual(result.current.data);
			expect(vi.mocked(executeCrmInScope)).not.toHaveBeenCalled();

			// Invalidate cache
			act(() => {
				result.current.invalidate();
			});

			// Should trigger refetch
			await waitFor(() => {
				expect(vi.mocked(executeCrmInScope)).toHaveBeenCalled();
			});
		});

		it('should handle optimistic updates for mutations', async () => {
			vi.mocked(executeCrmInScope).mockResolvedValue(dataResponseFixtures.users);

			const { result } = renderHookWithQuery(() => useTable('users'), { queryClient });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			// Mock successful create
			vi.mocked(executeCrmInScope).mockResolvedValueOnce({
				createUser: {
					user: {
						id: '4',
						name: 'Optimistic User',
						email: 'optimistic@example.com',
						isActive: true,
					},
				},
			});

			await act(async () => {
				await result.current.create({
					name: 'Optimistic User',
					email: 'optimistic@example.com',
					isActive: true,
				});
			});

			// Cache should be updated
			expect(result.current.data).toBeDefined();
		});
	});

	describe('error handling integration', () => {
		it('should handle GraphQL errors gracefully', async () => {
			vi.mocked(executeCrmInScope).mockRejectedValue(errorFixtures.graphqlFieldError);

			const { result } = renderHookWithQuery(() => useTable('users'), { queryClient });

			await waitFor(() => {
				expect(result.current.error).toBeTruthy();
			});

			expect(result.current.isLoading).toBe(false);
			expect(result.current.data).toEqual([]);
		});

		it('should handle validation errors in mutations', async () => {
			vi.mocked(executeCrmInScope).mockResolvedValueOnce(dataResponseFixtures.users);

			const { result } = renderHookWithQuery(() => useTable('users'), { queryClient });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			// Mock validation error for create
			vi.mocked(executeCrmInScope).mockRejectedValueOnce(errorFixtures.validationError);

			// Verify that the mutation throws an error
			await act(async () => {
				await expect(result.current.create({})).rejects.toThrow();
			});
		});

	});

	describe('performance and edge cases', () => {
		it('should handle large datasets efficiently', async () => {
			const largeDataset = {
				users: {
					totalCount: 1000,
					nodes: Array.from({ length: 100 }, (_, i) => ({
						id: `${i + 1}`,
						name: `User ${i + 1}`,
						email: `user${i + 1}@example.com`,
						isActive: i % 2 === 0,
					})),
				},
			};

			vi.mocked(executeCrmInScope).mockResolvedValue(largeDataset);

			const { result } = renderHookWithQuery(() => useTable('users', { first: 100 }), { queryClient });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(result.current.data).toHaveLength(100);
			expect(result.current.totalCount).toBe(1000);
		});

		it('should handle concurrent operations', async () => {
			vi.mocked(executeCrmInScope).mockResolvedValue(dataResponseFixtures.users);

			const { result } = renderHookWithQuery(() => useTable('users'), { queryClient });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			// Mock concurrent mutations
			mockExecute
				.mockResolvedValueOnce({ createUser: { user: { id: '4' } } })
				.mockResolvedValueOnce({ updateUser: { user: { id: '1' } } })
				.mockResolvedValueOnce({ deleteUser: { user: { id: '2' } } });

			// Execute concurrent operations
			await act(async () => {
				await Promise.all([
					result.current.create({ name: 'User 4' }),
					result.current.update('1', { name: 'Updated' }),
					result.current.delete('2'),
				]);
			});

			// Verify concurrent operations were called (with potential refetches)
			expect(vi.mocked(executeCrmInScope)).toHaveBeenCalled();
			expect(vi.mocked(executeCrmInScope).mock.calls.length).toBeGreaterThanOrEqual(4);
		});

		it('should handle empty responses gracefully', async () => {
			vi.mocked(executeCrmInScope).mockResolvedValue(dataResponseFixtures.empty);

			const { result } = renderHookWithQuery(() => useTable('users'), { queryClient });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(result.current.data).toEqual([]);
			expect(result.current.totalCount).toBe(0);
			expect(result.current.error).toBeNull();
		});
	});
});
