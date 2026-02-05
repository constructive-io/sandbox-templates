import React from 'react';
import { useRouter } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { execute } from '@sdk/auth';
import { TokenManager } from '@/lib/auth/token-manager';
import { useAuth, useAuthActions } from '@/store/app-store';

import { useLogout } from '../auth';

// Mock dependencies
vi.mock('@sdk/auth/hooks/client');
vi.mock('@/lib/auth/token-manager');
vi.mock('@/store/app-store', async () => {
	const actual = await vi.importActual<object>('@/store/app-store');
	return {
		...actual,
		useAuthActions: vi.fn(),
		useAuth: vi.fn(),
	};
});
vi.mock('next/navigation');

const mockExecute = execute as ReturnType<typeof vi.fn>;
const mockTokenManager = TokenManager as any;
const mockUseAuthActions = useAuthActions as ReturnType<typeof vi.fn>;
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockUseRouter = useRouter as ReturnType<typeof vi.fn>;

// Mock auth actions
const mockAuthActions = {
	setAuthenticated: vi.fn(),
	setUnauthenticated: vi.fn(),
	updateToken: vi.fn(),
	clearAllDashboardAuth: vi.fn(),
};

// Mock auth state
const mockAuthState = {
	isAuthenticated: false,
	isLoading: false,
	user: null,
	token: null,
	rememberMe: false,
};

// Mock router
const mockRouter = {
	push: vi.fn(),
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

describe('useLogout', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseAuthActions.mockReturnValue(mockAuthActions);
		mockUseAuth.mockReturnValue(mockAuthState);
		mockUseRouter.mockReturnValue(mockRouter);
	});

	it('should handle successful logout', async () => {
		mockExecute.mockResolvedValue({
			signOut: {
				clientMutationId: 'test',
				query: { __typename: 'Query' },
			},
		});

		const { result } = renderHook(() => useLogout(), {
			wrapper: createWrapper(),
		});

		result.current.mutate();

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		// For schema-builder logout, should also clear all dashboard tokens
		expect(mockTokenManager.clearToken).toHaveBeenCalledWith('schema-builder');
		expect(mockTokenManager.clearAllDashboardTokens).toHaveBeenCalled();
		expect(mockAuthActions.setUnauthenticated).toHaveBeenCalledWith('schema-builder');
		expect(mockAuthActions.clearAllDashboardAuth).toHaveBeenCalled();
		// Default context is schema-builder, so home path is /
		expect(mockRouter.push).toHaveBeenCalledWith('/');
	});

	it('should handle logout failure gracefully', async () => {
		// Even when the server call fails, logout still succeeds (it's caught internally)
		mockExecute.mockRejectedValue(new Error('Server error'));

		const { result } = renderHook(() => useLogout(), {
			wrapper: createWrapper(),
		});

		result.current.mutate();

		await waitFor(() => {
			// Logout mutation catches errors internally and still succeeds
			expect(result.current.isSuccess).toBe(true);
		});

		// Should still clear local state even if server logout fails
		expect(mockTokenManager.clearToken).toHaveBeenCalledWith('schema-builder');
		expect(mockTokenManager.clearAllDashboardTokens).toHaveBeenCalled();
		expect(mockAuthActions.setUnauthenticated).toHaveBeenCalledWith('schema-builder');
		expect(mockAuthActions.clearAllDashboardAuth).toHaveBeenCalled();
		// Default context is schema-builder, so home path is /
		expect(mockRouter.push).toHaveBeenCalledWith('/');
	});
});
