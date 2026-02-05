import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { execute } from '@sdk/auth';

import { useVerifyEmail } from '../auth';

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

describe('useVerifyEmail', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should handle successful verify email', async () => {
		mockExecute.mockResolvedValue({
			verifyEmail: {
				boolean: true,
				clientMutationId: 'verify-123',
			},
		});

		const { result } = renderHook(() => useVerifyEmail(), { wrapper: createWrapper() });

		result.current.mutate({ emailId: 'email-id', token: 'token-abc' });

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(mockExecute).toHaveBeenCalledWith(
			expect.stringContaining('VerifyEmail'),
			expect.objectContaining({
				input: expect.objectContaining({ emailId: 'email-id', token: 'token-abc' }),
			}),
		);
	});

	it('should error when mutation returns false', async () => {
		mockExecute.mockResolvedValue({
			verifyEmail: {
				boolean: false,
				clientMutationId: 'verify-123',
			},
		});

		const { result } = renderHook(() => useVerifyEmail(), { wrapper: createWrapper() });
		result.current.mutate({ emailId: 'email-id', token: 'token-abc' });

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		expect(result.current.error).toEqual(new Error('Failed to verify email. The link may have expired or is invalid.'));
	});
});
