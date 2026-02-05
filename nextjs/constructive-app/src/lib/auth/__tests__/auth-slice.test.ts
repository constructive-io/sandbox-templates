import { beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from 'zustand';

import { createAuthSlice, deserializeAuthSlice, serializeAuthSlice, type AuthSlice } from '../../../store/auth-slice';
import type { ApiToken, UserProfile } from '../../../store/auth-slice';

// Mock the runtime config
vi.mock('@/lib/runtime/config-core', () => ({
	getSchemaContext: vi.fn(() => 'dashboard'),
}));

// Mock data
const mockUser: UserProfile = {
	id: 'user-123',
	email: 'test@example.com',
};

const mockToken: ApiToken = {
	id: 'token-123',
	userId: 'user-123',
	accessToken: 'access-token-123',
	accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
	createdAt: new Date().toISOString(),
	ip: '127.0.0.1',
};

const expiredToken: ApiToken = {
	...mockToken,
	accessTokenExpiresAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
};

// Test database ID for scoped dashboard auth
const TEST_DATABASE_ID = 'test-db-123';

describe('AuthSlice', () => {
	let store: ReturnType<typeof create<AuthSlice>>;

	beforeEach(() => {
		store = create<AuthSlice>()(createAuthSlice);
		// Set dashboard scope for dashboard context tests
		store.getState().setDashboardScope(TEST_DATABASE_ID);
	});

	describe('initial state', () => {
		it('should have correct initial state', () => {
			const state = store.getState();
			const dashboardAuth = state.authByContext.dashboard;

			expect(dashboardAuth.isAuthenticated).toBe(false);
			// Note: with scope set but no auth, isLoading is false (unauthenticated)
			expect(dashboardAuth.isLoading).toBe(false);
			expect(dashboardAuth.user).toBeNull();
			expect(dashboardAuth.token).toBeNull();
			expect(dashboardAuth.rememberMe).toBe(false);
		});
	});

	describe('setAuthenticated', () => {
		it('should set authenticated state with user and token', () => {
			store.getState().setAuthenticated(mockUser, mockToken, true);

			const dashboardAuth = store.getState().authByContext.dashboard;
			expect(dashboardAuth.isAuthenticated).toBe(true);
			expect(dashboardAuth.isLoading).toBe(false);
			expect(dashboardAuth.user).toEqual(mockUser);
			expect(dashboardAuth.token).toEqual(mockToken);
			expect(dashboardAuth.rememberMe).toBe(true);
		});

		it('should default rememberMe to false', () => {
			store.getState().setAuthenticated(mockUser, mockToken);

			const dashboardAuth = store.getState().authByContext.dashboard;
			expect(dashboardAuth.rememberMe).toBe(false);
		});
	});

	describe('setUnauthenticated', () => {
		it('should reset to initial state', () => {
			// First set authenticated
			store.getState().setAuthenticated(mockUser, mockToken, true);

			// Then set unauthenticated
			store.getState().setUnauthenticated();

			const dashboardAuth = store.getState().authByContext.dashboard;
			expect(dashboardAuth.isAuthenticated).toBe(false);
			expect(dashboardAuth.isLoading).toBe(false);
			expect(dashboardAuth.user).toBeNull();
			expect(dashboardAuth.token).toBeNull();
			expect(dashboardAuth.rememberMe).toBe(false);
		});
	});

	describe('setLoading', () => {
		it('should set loading state', () => {
			store.getState().setLoading(true);
			expect(store.getState().authByContext.dashboard.isLoading).toBe(true);

			store.getState().setLoading(false);
			expect(store.getState().authByContext.dashboard.isLoading).toBe(false);
		});
	});

	describe('updateToken', () => {
		it('should update token', () => {
			// First set authenticated so there's a state to update
			store.getState().setAuthenticated(mockUser, mockToken);
			
			const newToken: ApiToken = { ...mockToken, accessToken: 'new-token' };
			store.getState().updateToken(newToken);

			expect(store.getState().authByContext.dashboard.token).toEqual(newToken);
		});
	});

	describe('clearToken', () => {
		it('should clear token and set unauthenticated', () => {
			// First set authenticated
			store.getState().setAuthenticated(mockUser, mockToken);

			// Then clear token
			store.getState().clearToken();

			const dashboardAuth = store.getState().authByContext.dashboard;
			expect(dashboardAuth.token).toBeNull();
			expect(dashboardAuth.isAuthenticated).toBe(false);
		});
	});

	describe('updateUser', () => {
		it('should update user profile', () => {
			// First set authenticated
			store.getState().setAuthenticated(mockUser, mockToken);

			// Update user
			store.getState().updateUser({ email: 'updated@example.com' });

			const dashboardAuth = store.getState().authByContext.dashboard;
			expect(dashboardAuth.user?.email).toBe('updated@example.com');
			expect(dashboardAuth.user?.id).toBe(mockUser.id); // Should preserve other fields
		});

		it('should not update if no user is set', () => {
			store.getState().updateUser({ email: 'test@example.com' });

			expect(store.getState().authByContext.dashboard.user).toBeNull();
		});
	});

	describe('isTokenExpired', () => {
		it('should return true when no token', () => {
			const result = store.getState().isTokenExpired();
			expect(result).toBe(true);
		});

		it('should return false for valid token', () => {
			store.getState().setAuthenticated(mockUser, mockToken);

			const result = store.getState().isTokenExpired();
			expect(result).toBe(false);
		});

		it('should return true for expired token', () => {
			store.getState().setAuthenticated(mockUser, expiredToken);

			const result = store.getState().isTokenExpired();
			expect(result).toBe(true);
		});
	});

	describe('getAuthHeader', () => {
		it('should return null when not authenticated', () => {
			const result = store.getState().getAuthHeader();
			expect(result).toBeNull();
		});

		it('should return Bearer token when authenticated', () => {
			store.getState().setAuthenticated(mockUser, mockToken);

			const result = store.getState().getAuthHeader();
			expect(result).toBe(`Bearer ${mockToken.accessToken}`);
		});
	});
});

describe('Auth slice serialization', () => {
	let store: ReturnType<typeof create<AuthSlice>>;

	beforeEach(() => {
		store = create<AuthSlice>()(createAuthSlice);
		// Set up dashboard scope for serialization tests
		store.getState().setDashboardScope(TEST_DATABASE_ID);
	});

	describe('serializeAuthSlice', () => {
		it('should serialize auth state correctly', () => {
			// Authenticate with scope
			store.getState().setAuthenticated(mockUser, mockToken, true, 'dashboard', TEST_DATABASE_ID);

			const serialized = serializeAuthSlice(store.getState());

			// New serialization format includes schemaBuilderAuth and dashboardAuthByScope
			expect(serialized.schemaBuilderAuth).toEqual({
				isAuthenticated: false,
				isLoading: false,
				user: null,
				token: null,
				rememberMe: false,
			});
			expect(serialized.dashboardAuthByScope[TEST_DATABASE_ID]).toEqual({
				isAuthenticated: true,
				isLoading: false,
				user: mockUser,
				token: mockToken,
				rememberMe: true,
			});
		});
	});

	describe('deserializeAuthSlice', () => {
		it('should deserialize valid auth state (new format)', () => {
			const serializedState = {
				schemaBuilderAuth: {
					isAuthenticated: true,
					isLoading: false,
					user: mockUser,
					token: mockToken,
					rememberMe: true,
				},
				dashboardAuthByScope: {
					[TEST_DATABASE_ID]: {
						isAuthenticated: true,
						isLoading: false,
						user: mockUser,
						token: mockToken,
						rememberMe: true,
					},
				},
				dashboardScope: { databaseId: TEST_DATABASE_ID },
			};

			const deserialized = deserializeAuthSlice(serializedState);

			expect(deserialized.schemaBuilderAuth).toEqual({
				isAuthenticated: true,
				isLoading: true, // Set to true so AuthProvider can finalize
				user: mockUser,
				token: mockToken,
				rememberMe: true,
			});
			expect(deserialized.dashboardAuthByScope![TEST_DATABASE_ID]).toEqual({
				isAuthenticated: true,
				isLoading: true,
				user: mockUser,
				token: mockToken,
				rememberMe: true,
			});
		});

		it('should migrate from legacy format', () => {
			// Legacy format: authByContext only
			const serializedState = {
				authByContext: {
					dashboard: {
						isAuthenticated: true,
						isLoading: false,
						user: mockUser,
						token: mockToken,
						rememberMe: true,
					},
					'schema-builder': {
						isAuthenticated: true,
						isLoading: false,
						user: mockUser,
						token: mockToken,
						rememberMe: true,
					},
				},
			};

			const deserialized = deserializeAuthSlice(serializedState);

			// Schema-builder should be migrated
			expect(deserialized.schemaBuilderAuth).toEqual({
				isAuthenticated: true,
				isLoading: true,
				user: mockUser,
				token: mockToken,
				rememberMe: true,
			});
			// Dashboard should NOT be migrated (user must re-auth per database)
			expect(deserialized.dashboardAuthByScope).toEqual({});
		});

		it('should return initial state for expired token', () => {
			const serializedState = {
				schemaBuilderAuth: {
					isAuthenticated: true,
					isLoading: false,
					user: mockUser,
					token: expiredToken,
					rememberMe: true,
				},
				dashboardAuthByScope: {},
				dashboardScope: { databaseId: null },
			};

			const deserialized = deserializeAuthSlice(serializedState);

			expect(deserialized.schemaBuilderAuth).toEqual({
				isAuthenticated: false,
				isLoading: false,
				user: null,
				token: null,
				rememberMe: false,
			});
		});

		it('should return initial state for invalid data', () => {
			const deserialized = deserializeAuthSlice({});

			expect(deserialized.schemaBuilderAuth).toEqual({
				isAuthenticated: false,
				isLoading: false,
				user: null,
				token: null,
				rememberMe: false,
			});
			expect(deserialized.dashboardAuthByScope).toEqual({});
		});
	});
});
