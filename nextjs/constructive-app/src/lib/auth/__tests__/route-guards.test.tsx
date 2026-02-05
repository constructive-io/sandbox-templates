import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthContext } from '../auth-context';
import { GuestRoute, ProtectedRoute, RouteGuard, shouldBeGuestOnly, shouldProtectRoute } from '../route-guards';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
	useRouter: vi.fn(),
	usePathname: vi.fn(),
	useSearchParams: vi.fn(),
}));

// Mock auth context
vi.mock('../auth-context', () => ({
	useAuthContext: vi.fn(),
}));

// Mock app membership hook
vi.mock('@/lib/gql/hooks/schema-builder/app', () => ({
	useCurrentUserAppMembership: vi.fn(() => ({
		appMembership: null,
		isAppAdmin: false,
		isAppOwner: false,
		isActive: false,
		isLoading: false,
		error: null,
		refetch: vi.fn(),
	})),
}));

// Mock app-routes - use actual implementation for route helpers
vi.mock('@/app-routes', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/app-routes')>();
	return {
		...actual,
		buildRoute: vi.fn((routeKey, params) => {
			if (routeKey === 'LOGIN' && params?.redirect) {
				return `/login?redirect=${encodeURIComponent(params.redirect)}`;
			}
			return '/login';
		}),
	};
});

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockUseRouter = useRouter as ReturnType<typeof vi.fn>;
const mockUsePathname = usePathname as ReturnType<typeof vi.fn>;
const mockUseSearchParams = useSearchParams as ReturnType<typeof vi.fn>;
const mockUseAuthContext = useAuthContext as ReturnType<typeof vi.fn>;

describe('Route Guards', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseRouter.mockReturnValue({ push: mockPush, replace: mockReplace });
		mockUsePathname.mockReturnValue('/organizations'); // Default to schema-builder route
		mockUseSearchParams.mockReturnValue({ get: vi.fn(() => null) });
	});

	describe('RouteGuard (main component)', () => {
		describe('Root route (public with auth handling)', () => {
			it('should render children for root route (public)', () => {
				mockUsePathname.mockReturnValue('/');
				mockUseAuthContext.mockReturnValue({
					isAuthenticated: false,
					isLoading: false,
				});

				render(
					<RouteGuard>
						<div>Root Content</div>
					</RouteGuard>,
				);

				// Root route is public, renders immediately
				expect(screen.getByText('Root Content')).toBeInTheDocument();
			});

			it('should render children for root route when authenticated', () => {
				mockUsePathname.mockReturnValue('/');
				mockUseAuthContext.mockReturnValue({
					isAuthenticated: true,
					isLoading: false,
				});

				render(
					<RouteGuard>
						<div>Root Content</div>
					</RouteGuard>,
				);

				// Root route is public, renders regardless of auth
				expect(screen.getByText('Root Content')).toBeInTheDocument();
			});
		});

		describe('Protected routes (schema-builder context)', () => {
			it('should render children for protected routes when authenticated', () => {
				mockUsePathname.mockReturnValue('/organizations');
				mockUseAuthContext.mockReturnValue({
					isAuthenticated: true,
					isLoading: false,
				});

				render(
					<RouteGuard>
						<div>Organizations Content</div>
					</RouteGuard>,
				);

				expect(screen.getByText('Organizations Content')).toBeInTheDocument();
			});

			it('should redirect to root for protected routes when not authenticated', async () => {
				mockUsePathname.mockReturnValue('/organizations');
				mockUseAuthContext.mockReturnValue({
					isAuthenticated: false,
					isLoading: false,
				});

				render(
					<RouteGuard>
						<div>Organizations Content</div>
					</RouteGuard>,
				);

				// Protected routes redirect to root when not authenticated
				await waitFor(() => {
					expect(mockReplace).toHaveBeenCalledWith('/');
				});
			});

			it('should redirect to root for /settings when not authenticated', async () => {
				mockUsePathname.mockReturnValue('/settings');
				mockUseAuthContext.mockReturnValue({
					isAuthenticated: false,
					isLoading: false,
				});

				render(
					<RouteGuard>
						<div>Settings Content</div>
					</RouteGuard>,
				);

				await waitFor(() => {
					expect(mockReplace).toHaveBeenCalledWith('/');
				});
			});

			it('should render children during auth loading for protected routes (loading deferred to shell)', () => {
				mockUsePathname.mockReturnValue('/organizations');
				mockUseAuthContext.mockReturnValue({
					isAuthenticated: false,
					isLoading: true,
				});

				render(
					<RouteGuard>
						<div>Organizations Content</div>
					</RouteGuard>,
				);

				// For protected routes, children are rendered during loading (loading UI is deferred to shell)
				expect(screen.getByText('Organizations Content')).toBeInTheDocument();
			});
		});

		describe('Public routes (dashboard context)', () => {
			it('should render children for data route regardless of auth', () => {
				mockUsePathname.mockReturnValue('/orgs/org-123/databases/db-456/data');
				mockUseAuthContext.mockReturnValue({
					isAuthenticated: false,
					isLoading: false,
				});

				render(
					<RouteGuard>
						<div>Data Content</div>
					</RouteGuard>,
				);

				// Data route is public, auth handled by AuthGate in layout
				expect(screen.getByText('Data Content')).toBeInTheDocument();
			});
		});

		describe('Guest-only routes', () => {
			it('should render children for guest-only routes when not authenticated', () => {
				mockUsePathname.mockReturnValue('/login');
				mockUseAuthContext.mockReturnValue({
					isAuthenticated: false,
					isLoading: false,
				});

				render(
					<RouteGuard>
						<div>Login Form</div>
					</RouteGuard>,
				);

				expect(screen.getByText('Login Form')).toBeInTheDocument();
			});

			it('should redirect to home for guest-only routes when authenticated', async () => {
				mockUsePathname.mockReturnValue('/login');
				mockUseAuthContext.mockReturnValue({
					isAuthenticated: true,
					isLoading: false,
				});

				render(
					<RouteGuard>
						<div>Login Form</div>
					</RouteGuard>,
				);

				// Redirects to home path - default context is schema-builder, so home is /
				// The redirect happens in useEffect, so we need to wait for it
				await waitFor(() => {
					expect(mockReplace).toHaveBeenCalledWith('/');
				});
			});
		});
	});

	describe('Legacy Components (backward compatibility)', () => {
		describe('ProtectedRoute (alias for RouteGuard)', () => {
			it('should work the same as RouteGuard for protected routes when authenticated', () => {
				mockUsePathname.mockReturnValue('/organizations');
				mockUseAuthContext.mockReturnValue({
					isAuthenticated: true,
					isLoading: false,
				});

				render(
					<ProtectedRoute>
						<div>Protected Content</div>
					</ProtectedRoute>,
				);

				expect(screen.getByText('Protected Content')).toBeInTheDocument();
			});

			it('should redirect for protected routes when not authenticated', async () => {
				mockUsePathname.mockReturnValue('/settings');
				mockUseAuthContext.mockReturnValue({
					isAuthenticated: false,
					isLoading: false,
				});

				render(
					<ProtectedRoute>
						<div>Settings Content</div>
					</ProtectedRoute>,
				);

				await waitFor(() => {
					expect(mockReplace).toHaveBeenCalledWith('/');
				});
			});
		});

		describe('GuestRoute (alias for RouteGuard)', () => {
			it('should work the same as RouteGuard for guest routes', () => {
				mockUsePathname.mockReturnValue('/login');
				mockUseAuthContext.mockReturnValue({
					isAuthenticated: false,
					isLoading: false,
				});

				render(
					<GuestRoute>
						<div>Guest Content</div>
					</GuestRoute>,
				);

				expect(screen.getByText('Guest Content')).toBeInTheDocument();
			});

			it('should redirect to home when authenticated', async () => {
				mockUsePathname.mockReturnValue('/login');
				mockUseAuthContext.mockReturnValue({
					isAuthenticated: true,
					isLoading: false,
				});

				render(
					<GuestRoute>
						<div>Guest Content</div>
					</GuestRoute>,
				);

				// Default context is schema-builder, so home is /
				// The redirect happens in useEffect, so we need to wait for it
				await waitFor(() => {
					expect(mockReplace).toHaveBeenCalledWith('/');
				});
			});
		});
	});
});

describe('Route utility functions', () => {
	describe('shouldProtectRoute', () => {
		it('should return true for protected schema-builder routes', () => {
			// Protected routes redirect to root when not authenticated
			expect(shouldProtectRoute('/organizations')).toBe(true);
			expect(shouldProtectRoute('/settings')).toBe(true);
			expect(shouldProtectRoute('/users')).toBe(true);
			expect(shouldProtectRoute('/invites')).toBe(true);
			expect(shouldProtectRoute('/help')).toBe(true);
		});

		it('should return false for public routes', () => {
			// Root is public (handles auth via embedded form)
			expect(shouldProtectRoute('/')).toBe(false);
		});

		it('should return false for guest-only routes', () => {
			expect(shouldProtectRoute('/login')).toBe(false);
			expect(shouldProtectRoute('/register')).toBe(false);
			expect(shouldProtectRoute('/forgot-password')).toBe(false);
			expect(shouldProtectRoute('/reset-password')).toBe(false);
		});
	});

	describe('shouldBeGuestOnly', () => {
		it('should return true for auth routes', () => {
			expect(shouldBeGuestOnly('/login')).toBe(true);
			expect(shouldBeGuestOnly('/register')).toBe(true);
			expect(shouldBeGuestOnly('/forgot-password')).toBe(true);
			expect(shouldBeGuestOnly('/reset-password')).toBe(true);
		});

		it('should return false for other routes', () => {
			expect(shouldBeGuestOnly('/')).toBe(false);
			expect(shouldBeGuestOnly('/organizations')).toBe(false);
		});
	});
});
