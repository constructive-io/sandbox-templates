import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { execute } from '@sdk/api';
import { TokenManager } from '@/lib/auth/token-manager';
import { useAppStore, useAuth, useAuthActions } from '@/store/app-store';

import { useExtendToken } from '../auth';

// Mock dependencies
vi.mock('@sdk/api/hooks/client');
vi.mock('@/lib/auth/token-manager');
vi.mock('@/store/app-store');

const mockExecute = execute as ReturnType<typeof vi.fn>;
const mockTokenManager = TokenManager as any;
const mockUseAuthActions = useAuthActions as ReturnType<typeof vi.fn>;
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

// Mock auth actions
const mockAuthActions = {
	setAuthenticated: vi.fn(),
	setUnauthenticated: vi.fn(),
	updateToken: vi.fn(),
};

// Mock auth state
const mockAuthState = {
	isAuthenticated: false,
	isLoading: false,
	user: null,
	token: null,
	rememberMe: false,
};

// Mock current token for getState
const mockCurrentToken = {
	id: 'current-token-123',
	accessToken: 'current-access-token',
	accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
	userId: 'user-123',
};

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

describe('useExtendToken', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseAuthActions.mockReturnValue(mockAuthActions);
		mockUseAuth.mockReturnValue(mockAuthState);
		(useAppStore as any).getState = vi.fn(() => ({
			schemaBuilderAuth: {
				rememberMe: false,
				token: mockCurrentToken,
			},
		}));
	});

	it('should handle successful token extension', async () => {
		const mockNewExpiration = new Date(Date.now() + 7200000).toISOString();

		mockExecute.mockResolvedValue({
			extendTokenExpires: {
				results: [{ expiresAt: mockNewExpiration }],
				clientMutationId: 'test',
				query: { __typename: 'Query' },
			},
		});

		const { result } = renderHook(() => useExtendToken(), {
			wrapper: createWrapper(),
		});

		result.current.mutate({ hours: 2 });

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(mockExecute).toHaveBeenCalledWith(
			expect.stringContaining('ExtendTokenExpires'),
			expect.objectContaining({
				input: expect.objectContaining({
					amount: { hours: 2 },
				}),
			}),
		);

		// New implementation uses setToken and updateToken with the merged token
		expect(mockTokenManager.setToken).toHaveBeenCalledWith(
			expect.objectContaining({
				...mockCurrentToken,
				accessTokenExpiresAt: mockNewExpiration,
			}),
			false,
			'schema-builder',
		);
		expect(mockAuthActions.updateToken).toHaveBeenCalledWith(
			expect.objectContaining({
				...mockCurrentToken,
				accessTokenExpiresAt: mockNewExpiration,
			}),
			'schema-builder',
		);
	});

	it('should use default interval when none provided', async () => {
		const mockNewExpiration = new Date(Date.now() + 3600000).toISOString();

		mockExecute.mockResolvedValue({
			extendTokenExpires: {
				results: [{ expiresAt: mockNewExpiration }],
				clientMutationId: 'test',
				query: { __typename: 'Query' },
			},
		});

		const { result } = renderHook(() => useExtendToken(), {
			wrapper: createWrapper(),
		});

		result.current.mutate(undefined);

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(mockExecute).toHaveBeenCalledWith(
			expect.stringContaining('ExtendTokenExpires'),
			expect.objectContaining({
				input: expect.objectContaining({
					amount: { hours: 1 },
				}),
			}),
		);
	});

	it('should handle token extension failure', async () => {
		mockExecute.mockRejectedValue(new Error('Token extension failed'));

		const { result } = renderHook(() => useExtendToken(), {
			wrapper: createWrapper(),
		});

		result.current.mutate({ hours: 1 });

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		expect(result.current.error?.message).toBe('Token extension failed');
	});
});
