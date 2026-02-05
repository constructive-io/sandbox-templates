/**
 * Tests for useImageUpload hook
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TokenManager } from '@/lib/auth/token-manager';
import { appConfig } from '@/app-config';

import { useFieldUpload, useImageUpload } from '../dashboard/use-image-upload';

// Mock meta data
const mockMeta = {
	_meta: {
		tables: [
			{
				name: 'users',
				fields: [
					{ name: 'id', type: { gqlType: 'UUID' } },
					{ name: 'profilePicture', type: { gqlType: 'JSON' } },
				],
			},
		],
	},
};

// Mock dependencies
vi.mock('@/lib/auth/token-manager');
vi.mock('@/app-config', () => ({
	getEndpoint: () => 'http://localhost:4000/graphql',
	getSchemaContext: () => 'dashboard',
	appConfig: {
		get noAuth() {
			return false;
		},
		endpoints: { dashboard: 'http://localhost:4000/graphql' },
	},
}));
vi.mock('../dashboard/use-dashboard-meta-query', () => ({
	useMeta: () => ({ data: mockMeta, isLoading: false }),
}));
vi.mock('sonner', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Test wrapper with QueryClient
const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

	return ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
};

describe('useFieldUpload', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		// Mock app config
		// set endpoint via getter function instead of dynamic property
		// Note: tests can mock getEndpoint() separately if needed.

		// Mock token manager
		vi.mocked(TokenManager.getToken).mockReturnValue({ token: 'test-token' });
		vi.mocked(TokenManager.isTokenExpired).mockReturnValue(false);
		vi.mocked(TokenManager.formatAuthHeader).mockReturnValue('Bearer test-token');
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should upload file to specific field successfully', async () => {
		// Mock successful response
	mockFetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({
			data: {
				updateusers: {
					users: {
						id: 'user-123',
						profilePicture: {
							url: 'https://example.com/uploaded-image.jpg',
							filename: 'test-image.jpg',
							mimetype: 'image/jpeg',
							size: 1024,
							width: 800,
							height: 600,
						},
					},
				},
			},
			}),
		});

		const onSuccess = vi.fn();
		const { result } = renderHook(() => useFieldUpload('users', 'profilePicture', 'user-123', { onSuccess }), {
			wrapper: createWrapper(),
		});

		// Create test file
		const file = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });

		// Trigger upload
		result.current.mutate(file);

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		// Verify fetch was called with correct parameters
		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:4000/graphql',
			expect.objectContaining({
				method: 'POST',
				headers: {
					Authorization: 'Bearer test-token',
				},
				body: expect.any(FormData),
			}),
		);

		// Verify success callback was called
		expect(onSuccess).toHaveBeenCalledWith({
			url: 'https://example.com/uploaded-image.jpg',
			filename: 'test-image.jpg',
			mimetype: 'image/jpeg',
			size: 1024,
			width: 800,
			height: 600,
		});
	});

	it('should validate file type', async () => {
		const onError = vi.fn();
		const { result } = renderHook(() => useImageUpload('users', 'profilePicture', 'user-123', { onError }), {
			wrapper: createWrapper(),
		});

		// Create non-image file
		const file = new File(['test'], 'test.txt', { type: 'text/plain' });

		result.current.mutate(file);

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		expect(onError).toHaveBeenCalledWith(
			expect.objectContaining({
				message: 'Please select an image file',
			}),
		);

		// Verify fetch was not called
		expect(mockFetch).not.toHaveBeenCalled();
	});

	it('should validate file size', async () => {
		const onError = vi.fn();
		const { result } = renderHook(() => useImageUpload('users', 'profilePicture', 'user-123', { onError }), {
			wrapper: createWrapper(),
		});

		// Create large file (11MB)
		const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', {
			type: 'image/jpeg',
		});

		result.current.mutate(largeFile);

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		expect(onError).toHaveBeenCalledWith(
			expect.objectContaining({
				message: 'File size must be less than 10MB',
			}),
		);

		// Verify fetch was not called
		expect(mockFetch).not.toHaveBeenCalled();
	});
});
// Converted to .tsx to allow JSX in tests
