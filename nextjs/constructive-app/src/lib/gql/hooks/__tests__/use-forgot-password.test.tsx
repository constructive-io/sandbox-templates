import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { execute } from '@sdk/api';

import { useForgotPassword } from '../auth';

// Mock dependencies
vi.mock('@sdk/api/hooks/client');

const mockExecute = execute as ReturnType<typeof vi.fn>;

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

describe('useForgotPassword', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should handle successful forgot password request', async () => {
		mockExecute.mockResolvedValue({
			forgotPassword: {
				clientMutationId: 'forgot-password-123',
				query: { __typename: 'Query' },
			},
		});

		const { result } = renderHook(() => useForgotPassword(), {
			wrapper: createWrapper(),
		});

		const formData = {
			email: 'test@example.com',
		};

		result.current.mutate(formData);

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(mockExecute).toHaveBeenCalledWith(
			expect.stringContaining('ForgotPassword'),
			expect.objectContaining({
				input: expect.objectContaining({
					email: 'test@example.com',
				}),
			}),
		);

		// New implementation returns { email } only
		expect(result.current.data).toEqual({
			email: 'test@example.com',
		});
	});

	it('should succeed even when mutation returns null (email sent regardless)', async () => {
		// New implementation doesn't check the response - if mutation doesn't throw, it succeeds
		mockExecute.mockResolvedValue({
			forgotPassword: null,
		});

		const { result } = renderHook(() => useForgotPassword(), {
			wrapper: createWrapper(),
		});

		const formData = {
			email: 'test@example.com',
		};

		result.current.mutate(formData);

		await waitFor(() => {
			// Implementation doesn't throw on null result
			expect(result.current.isSuccess).toBe(true);
		});

		expect(result.current.data).toEqual({
			email: 'test@example.com',
		});
	});

	it('should handle network/GraphQL errors', async () => {
		const networkError = new Error('Network error');
		mockExecute.mockRejectedValue(networkError);

		const { result } = renderHook(() => useForgotPassword(), {
			wrapper: createWrapper(),
		});

		const formData = {
			email: 'test@example.com',
		};

		result.current.mutate(formData);

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		expect(result.current.error).toBe(networkError);
	});

	it('should initialize correctly', () => {
		const { result } = renderHook(() => useForgotPassword(), {
			wrapper: createWrapper(),
		});

		// Should initialize in idle state
		expect(result.current.isIdle).toBe(true);
		expect(result.current.isPending).toBe(false);
		expect(result.current.isSuccess).toBe(false);
		expect(result.current.isError).toBe(false);
	});
});
