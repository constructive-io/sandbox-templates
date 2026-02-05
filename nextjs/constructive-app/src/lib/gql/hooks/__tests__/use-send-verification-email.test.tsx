import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { execute } from '@sdk/auth';

import { useSendVerificationEmail } from '../auth';

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

describe('useSendVerificationEmail', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should handle successful send verification email', async () => {
		mockExecute.mockResolvedValue({
			sendVerificationEmail: {
				boolean: true,
				clientMutationId: 'send-123',
			},
		});

		const { result } = renderHook(() => useSendVerificationEmail(), { wrapper: createWrapper() });
		result.current.mutate({ email: 'test@example.com' });

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(mockExecute).toHaveBeenCalledWith(
			expect.stringContaining('SendVerificationEmail'),
			expect.objectContaining({
				input: expect.objectContaining({ email: 'test@example.com' }),
			}),
		);

		expect(result.current.data).toEqual({ success: true, email: 'test@example.com' });
	});

	it('should error when mutation returns false', async () => {
		mockExecute.mockResolvedValue({
			sendVerificationEmail: {
				boolean: false,
				clientMutationId: 'send-123',
			},
		});

		const { result } = renderHook(() => useSendVerificationEmail(), { wrapper: createWrapper() });
		result.current.mutate({ email: 'test@example.com' });

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		expect(result.current.error).toEqual(new Error('Failed to send verification email. Please try again.'));
	});
});
