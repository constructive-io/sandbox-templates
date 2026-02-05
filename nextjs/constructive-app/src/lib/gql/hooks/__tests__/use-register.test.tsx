import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { execute } from '@sdk/auth';
import { TokenManager } from '@/lib/auth/token-manager';
import { useAuth, useAuthActions } from '@/store/app-store';

import { useRegister } from '../auth';

// Mock dependencies
vi.mock('@sdk/auth/hooks/client');
vi.mock('@/lib/auth/token-manager');
vi.mock('@/store/app-store');
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

describe('useRegister', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseAuthActions.mockReturnValue(mockAuthActions);
		mockUseAuth.mockReturnValue(mockAuthState);
		mockPush.mockClear();
	});

	it('should handle successful registration and redirect to verification', async () => {
		// SignUp succeeds - must return result with token data
		mockExecute.mockResolvedValueOnce({
			signUp: {
				result: {
					id: 'token-123',
					userId: 'user-789',
					accessToken: 'access-token-123',
					accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
				},
				clientMutationId: 'register-123',
			},
		});
		// fetchAppMembershipByActorIdQuery - user not verified
		mockExecute.mockResolvedValueOnce({
			appMembershipByActorId: {
				isVerified: false,
			},
		});
		// SendVerificationEmail succeeds
		mockExecute.mockResolvedValueOnce({
			sendVerificationEmail: {
				boolean: true,
				clientMutationId: 'verify-123',
			},
		});

		const { result } = renderHook(() => useRegister(), {
			wrapper: createWrapper(),
		});

		const registerData = {
			email: 'phat@gmail.com',
			password: 'password1111',
			confirmPassword: 'password1111',
			rememberMe: true,
		};

		result.current.mutate(registerData);

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		// Token is stored first, then user is set to unauthenticated for verification flow
		expect(mockTokenManager.setToken).toHaveBeenCalled();
		expect(mockAuthActions.setUnauthenticated).toHaveBeenCalledWith('schema-builder');

		// Should redirect to check-email page
		expect(mockPush).toHaveBeenCalledWith('/check-email?type=verification&email=phat%40gmail.com');
	});

	it('should handle registration failure', async () => {
		mockExecute.mockRejectedValue(new Error('Registration failed'));

		const { result } = renderHook(() => useRegister(), {
			wrapper: createWrapper(),
		});

		const registerData = {
			email: 'existing@gmail.com',
			password: 'password1111',
			confirmPassword: 'password1111',
			rememberMe: false,
		};

		result.current.mutate(registerData);

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		expect(mockAuthActions.setUnauthenticated).toHaveBeenCalled();
		expect(mockTokenManager.setToken).not.toHaveBeenCalled();
	});

	it('should redirect to check-email even when verification email fails', async () => {
		// SignUp succeeds - must return result with token data
		mockExecute.mockResolvedValueOnce({
			signUp: {
				result: {
					id: 'token-123',
					userId: 'user-789',
					accessToken: 'access-token-123',
					accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
				},
				clientMutationId: 'register-123',
			},
		});
		// fetchAppMembershipByActorIdQuery - user not verified
		mockExecute.mockResolvedValueOnce({
			appMembershipByActorId: {
				isVerified: false,
			},
		});
		// SendVerificationEmail fails
		mockExecute.mockRejectedValueOnce(new Error('Email send failed'));

		const { result } = renderHook(() => useRegister(), {
			wrapper: createWrapper(),
		});

		const registerData = {
			email: 'test@gmail.com',
			password: 'password1111',
			confirmPassword: 'password1111',
		};

		result.current.mutate(registerData);

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		// Should still redirect to check-email page (best-effort verification email)
		expect(mockPush).toHaveBeenCalledWith('/check-email?type=verification&email=test%40gmail.com');
	});
});
