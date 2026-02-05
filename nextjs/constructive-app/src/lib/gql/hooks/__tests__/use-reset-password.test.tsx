import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { execute } from '@sdk/auth';

import { useResetPassword } from '../auth';

vi.mock('@sdk/auth/hooks/client');

const mockExecute = execute as ReturnType<typeof vi.fn>;

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

describe('useResetPassword', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should handle successful reset password', async () => {
		mockExecute.mockResolvedValue({
			resetPassword: {
				boolean: true,
				clientMutationId: 'reset-123',
			},
		});

		const { result } = renderHook(() => useResetPassword(), { wrapper: createWrapper() });

		result.current.mutate({ newPassword: 'Password123!', resetToken: 'token-abc' });

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(mockExecute).toHaveBeenCalledWith(
			expect.stringContaining('ResetPassword'),
			expect.objectContaining({
				input: expect.objectContaining({
					newPassword: 'Password123!',
					resetToken: 'token-abc',
				}),
			}),
		);
	});

	it('should error when mutation returns false', async () => {
		mockExecute.mockResolvedValue({
			resetPassword: {
				boolean: false,
				clientMutationId: 'reset-123',
			},
		});

		const { result } = renderHook(() => useResetPassword(), { wrapper: createWrapper() });

		result.current.mutate({ newPassword: 'Password123!', resetToken: 'token-abc' });

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		expect(result.current.error).toEqual(new Error('Failed to reset password. The link may have expired.'));
	});
});
