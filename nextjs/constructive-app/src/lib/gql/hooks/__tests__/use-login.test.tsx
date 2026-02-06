import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { execute } from '@sdk/api';
import { TokenManager } from '@/lib/auth/token-manager';
import { useAuth, useAuthActions } from '@/store/app-store';

import { useLogin } from '../auth';

// Mock dependencies
vi.mock('@sdk/api/hooks/client');
vi.mock('@/lib/auth/token-manager');
vi.mock('@/store/app-store', async () => {
	const actual = await vi.importActual<object>('@/store/app-store');
	return {
		...actual,
		useAuthActions: vi.fn(),
		useAuth: vi.fn(),
		useAppStore: {
			getState: vi.fn(() => ({
				dashboardScope: { databaseId: null },
			})),
		},
	};
});
vi.mock('next/navigation');

const mockExecute = execute as ReturnType<typeof vi.fn>;
const mockTokenManager = TokenManager as any;
const mockUseAuthActions = useAuthActions as ReturnType<typeof vi.fn>;
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

// Mock router
const mockPush = vi.fn();
vi.mocked(await import('next/navigation')).useRouter = vi.fn(() => ({
	push: mockPush,
	replace: vi.fn(),
	back: vi.fn(),
	forward: vi.fn(),
	refresh: vi.fn(),
	prefetch: vi.fn(),
}));

vi.mocked(await import('next/navigation')).useSearchParams = vi.fn(
	() =>
		({
			get: () => null,
		}) as any,
);

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

describe('useLogin', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseAuthActions.mockReturnValue(mockAuthActions);
		mockUseAuth.mockReturnValue(mockAuthState);
		mockPush.mockClear();
	});

	it('should handle successful login', async () => {
		const mockToken = {
			id: 'token-123',
			userId: 'user-789',
			accessToken: 'access-token-123',
			accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
			origin: null,
			otToken: null,
			ip: null,
			uagent: null,
			createdAt: new Date().toISOString(),
		};

		mockExecute.mockResolvedValue({
			signIn: {
				result: mockToken,
				clientMutationId: 'test',
				query: { __typename: 'Query' },
			},
		});

		const { result } = renderHook(() => useLogin(), {
			wrapper: createWrapper(),
		});

		const credentials = {
			email: 'test@example.com',
			password: 'password123',
			rememberMe: true,
		};

		result.current.mutate(credentials);

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		// SDK execute is called with string query and variables
		expect(mockExecute).toHaveBeenCalledWith(
			expect.stringContaining('SignIn'),
			expect.objectContaining({
				input: expect.objectContaining({
					email: 'test@example.com',
					password: 'password123',
					rememberMe: true,
				}),
			}),
		);

		// For schema-builder, scope is undefined
		expect(mockTokenManager.setToken).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 'token-123',
				userId: 'user-789',
				accessToken: 'access-token-123',
			}),
			true,
			'schema-builder',
		);
		expect(mockAuthActions.setAuthenticated).toHaveBeenCalledWith(
			expect.objectContaining({ id: 'user-789' }),
			expect.objectContaining({
				id: 'token-123',
				userId: 'user-789',
				accessToken: 'access-token-123',
			}),
			true,
			'schema-builder',
		);
	});

	it('should handle login failure from network error', async () => {
		mockExecute.mockRejectedValue(new Error('Network error'));

		const { result } = renderHook(() => useLogin(), {
			wrapper: createWrapper(),
		});

		const credentials = {
			email: 'test@example.com',
			password: 'wrongpassword',
			rememberMe: false,
		};

		result.current.mutate(credentials);

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		// Should NOT call setAuthenticated on failure
		expect(mockAuthActions.setAuthenticated).not.toHaveBeenCalled();
	});

	it('should throw INVALID_CREDENTIALS error when result is null', async () => {
		// Simulate backend returning null token (invalid credentials)
		mockExecute.mockResolvedValue({
			signIn: {
				result: null,
				clientMutationId: null,
			},
		});

		const { result } = renderHook(() => useLogin(), {
			wrapper: createWrapper(),
		});

		const credentials = {
			email: 'nonexistent@example.com',
			password: 'wrongpassword',
			rememberMe: false,
		};

		result.current.mutate(credentials);

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		// Error should be an AuthError with INVALID_CREDENTIALS code
		expect(result.current.error).toBeDefined();
		expect(result.current.error?.message).toBe('Invalid email or password.');

		// Should NOT call setAuthenticated
		expect(mockAuthActions.setAuthenticated).not.toHaveBeenCalled();
		expect(mockTokenManager.setToken).not.toHaveBeenCalled();
	});

	it('should throw INVALID_CREDENTIALS error when signIn is null', async () => {
		// Simulate edge case where signIn itself is null
		mockExecute.mockResolvedValue({
			signIn: null,
		});

		const { result } = renderHook(() => useLogin(), {
			wrapper: createWrapper(),
		});

		const credentials = {
			email: 'test@example.com',
			password: 'password',
			rememberMe: true,
		};

		result.current.mutate(credentials);

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		expect(result.current.error?.message).toBe('Invalid email or password.');
		expect(mockAuthActions.setAuthenticated).not.toHaveBeenCalled();
	});

	it('should not redirect on login failure', async () => {
		mockExecute.mockResolvedValue({
			signIn: {
				result: null,
				clientMutationId: null,
			},
		});

		const { result } = renderHook(() => useLogin(), {
			wrapper: createWrapper(),
		});

		result.current.mutate({
			email: 'test@example.com',
			password: 'wrong',
			rememberMe: false,
		});

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		// Should NOT redirect on failure
		expect(mockPush).not.toHaveBeenCalled();
	});
});
