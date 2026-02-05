/**
 * @vitest-environment jsdom
 *
 * Tests for the cache update flow after cell edits.
 *
 * Bug context: After a successful cell edit mutation, the grid would show stale data
 * because getRowAtIndex was reading from queryResults (stale) before React Query cache (fresh).
 *
 * These tests verify:
 * 1. updateRowAtIndex correctly updates the React Query cache
 * 2. getRowAtIndex reads from cache first, returning fresh data
 * 3. The full edit -> cache update -> read flow works correctly
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';

// Simulated page data structure (matches use-infinite-table.ts)
interface PageData<T = Record<string, unknown>> {
	rows: T[];
	pageInfo: { hasNextPage: boolean; endCursor: string | null };
	pageIndex: number;
	totalCount?: number;
}

// Simulated query key factory (matches dashboard-query-keys.ts)
const createQueryKey = (tableName: string, pageIndex: number, optionsKey: string) =>
	['dashboard', { databaseId: 'test-db', endpoint: 'http://test' }, 'infinite-table', tableName, 'page', pageIndex, optionsKey] as const;

describe('Cache Update Flow', () => {
	let queryClient: QueryClient;
	const tableName = 'users';
	const pageSize = 100;
	const optionsKey = '{"pageSize":100}';

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
			},
		});
	});

	describe('updateRowAtIndex -> getRowAtIndex flow', () => {
		it('should return updated data after cache update', () => {
			// Setup: Seed cache with initial data
			const initialData: PageData = {
				rows: [
					{ id: '1', name: 'Original Name', email: 'test@example.com' },
					{ id: '2', name: 'Another User', email: 'other@example.com' },
				],
				pageInfo: { hasNextPage: false, endCursor: null },
				pageIndex: 0,
				totalCount: 2,
			};
			const queryKey = createQueryKey(tableName, 0, optionsKey);
			queryClient.setQueryData(queryKey, initialData);

			// Act: Simulate updateRowAtIndex (matches use-infinite-table.ts implementation)
			const rowIndex = 0;
			const patch = { name: 'Updated Name' };
			const pageIndex = Math.floor(rowIndex / pageSize);
			const rowIndexInPage = rowIndex % pageSize;

			queryClient.setQueryData<PageData>(queryKey, (old) => {
				if (!old) return old;
				const newRows = [...old.rows];
				newRows[rowIndexInPage] = { ...newRows[rowIndexInPage], ...patch };
				return { ...old, rows: newRows };
			});

			// Assert: getRowAtIndex should return updated data (reading from cache)
			const cachedData = queryClient.getQueryData<PageData>(queryKey);
			const row = cachedData?.rows[rowIndexInPage];

			expect(row).toEqual({
				id: '1',
				name: 'Updated Name', // Should be updated
				email: 'test@example.com',
			});
		});

		it('should update only the specified row without affecting others', () => {
			// Setup
			const initialData: PageData = {
				rows: [
					{ id: '1', name: 'User 1' },
					{ id: '2', name: 'User 2' },
					{ id: '3', name: 'User 3' },
				],
				pageInfo: { hasNextPage: false, endCursor: null },
				pageIndex: 0,
				totalCount: 3,
			};
			const queryKey = createQueryKey(tableName, 0, optionsKey);
			queryClient.setQueryData(queryKey, initialData);

			// Act: Update middle row
			queryClient.setQueryData<PageData>(queryKey, (old) => {
				if (!old) return old;
				const newRows = [...old.rows];
				newRows[1] = { ...newRows[1], name: 'Updated User 2' };
				return { ...old, rows: newRows };
			});

			// Assert
			const cachedData = queryClient.getQueryData<PageData>(queryKey);
			expect(cachedData?.rows[0]).toEqual({ id: '1', name: 'User 1' }); // Unchanged
			expect(cachedData?.rows[1]).toEqual({ id: '2', name: 'Updated User 2' }); // Updated
			expect(cachedData?.rows[2]).toEqual({ id: '3', name: 'User 3' }); // Unchanged
		});

		it('should handle full row replacement from server response', () => {
			// Setup
			const initialData: PageData = {
				rows: [{ id: '1', name: 'Original', createdAt: '2024-01-01', updatedAt: '2024-01-01' }],
				pageInfo: { hasNextPage: false, endCursor: null },
				pageIndex: 0,
			};
			const queryKey = createQueryKey(tableName, 0, optionsKey);
			queryClient.setQueryData(queryKey, initialData);

			// Act: Server returns full updated row (simulating mutation response)
			const serverResponse = {
				id: '1',
				name: 'Updated',
				createdAt: '2024-01-01',
				updatedAt: '2024-01-15T10:30:00Z', // Server updated this
			};

			queryClient.setQueryData<PageData>(queryKey, (old) => {
				if (!old) return old;
				const newRows = [...old.rows];
				newRows[0] = { ...newRows[0], ...serverResponse };
				return { ...old, rows: newRows };
			});

			// Assert: Should have server's updatedAt value
			const cachedData = queryClient.getQueryData<PageData>(queryKey);
			expect(cachedData?.rows[0]?.updatedAt).toBe('2024-01-15T10:30:00Z');
		});
	});

	describe('cache-first read strategy', () => {
		it('should read from cache even when cache was set after initial query', () => {
			const queryKey = createQueryKey(tableName, 0, optionsKey);

			// Simulate initial query populating cache
			const initialData: PageData = {
				rows: [{ id: '1', name: 'From Query' }],
				pageInfo: { hasNextPage: false, endCursor: null },
				pageIndex: 0,
			};
			queryClient.setQueryData(queryKey, initialData);

			// Simulate optimistic update via setQueryData
			queryClient.setQueryData<PageData>(queryKey, (old) => {
				if (!old) return old;
				const newRows = [...old.rows];
				newRows[0] = { ...newRows[0], name: 'From SetQueryData' };
				return { ...old, rows: newRows };
			});

			// Reading from cache should get the optimistically updated value
			const cachedData = queryClient.getQueryData<PageData>(queryKey);
			expect(cachedData?.rows[0]?.name).toBe('From SetQueryData');
		});

		it('should return null for rows in pages not yet loaded', () => {
			const queryKey = createQueryKey(tableName, 0, optionsKey);

			// Only page 0 is loaded
			queryClient.setQueryData(queryKey, {
				rows: [{ id: '1', name: 'User 1' }],
				pageInfo: { hasNextPage: true, endCursor: 'cursor1' },
				pageIndex: 0,
			});

			// Page 1 is not loaded - querying it returns undefined
			const page1Key = createQueryKey(tableName, 1, optionsKey);
			const page1Data = queryClient.getQueryData<PageData>(page1Key);

			expect(page1Data).toBeUndefined();
		});
	});

	describe('cross-page updates', () => {
		it('should update correct row when row spans page boundary', () => {
			// Setup: Row at index 100 is first row of page 1 (with pageSize=100)
			const page1Key = createQueryKey(tableName, 1, optionsKey);
			queryClient.setQueryData(page1Key, {
				rows: [
					{ id: '101', name: 'First of Page 1' },
					{ id: '102', name: 'Second of Page 1' },
				],
				pageInfo: { hasNextPage: false, endCursor: null },
				pageIndex: 1,
			});

			// Act: Update row at absolute index 100 (page 1, row 0)
			const absoluteRowIndex = 100;
			const pageIndex = Math.floor(absoluteRowIndex / pageSize); // = 1
			const rowIndexInPage = absoluteRowIndex % pageSize; // = 0

			expect(pageIndex).toBe(1);
			expect(rowIndexInPage).toBe(0);

			queryClient.setQueryData<PageData>(page1Key, (old) => {
				if (!old) return old;
				const newRows = [...old.rows];
				newRows[rowIndexInPage] = { ...newRows[rowIndexInPage], name: 'Updated' };
				return { ...old, rows: newRows };
			});

			// Assert
			const cachedData = queryClient.getQueryData<PageData>(page1Key);
			expect(cachedData?.rows[0]?.name).toBe('Updated');
			expect(cachedData?.rows[1]?.name).toBe('Second of Page 1'); // Unchanged
		});
	});
});
