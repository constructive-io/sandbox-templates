import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ApiToken } from '@/store/auth-slice';

vi.mock('@/app-config', () => ({
	getSchemaContext: () => 'dashboard',
}));

import { TokenManager } from '../token-manager';

// Mock localStorage and sessionStorage
const mockStorage = () => {
	let store: Record<string, string> = {};
	return {
		getItem: vi.fn((key: string) => store[key] || null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value;
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			store = {};
		}),
	};
};

// Mock token for testing
const mockToken: ApiToken = {
	id: 'test-token-id',
	accessToken: 'test-access-token',
	accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
	createdAt: new Date().toISOString(),
	ip: '127.0.0.1',
};

const expiredToken: ApiToken = {
	...mockToken,
	accessTokenExpiresAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
};

describe('TokenManager', () => {
	let mockLocalStorage: ReturnType<typeof mockStorage>;
	let mockSessionStorage: ReturnType<typeof mockStorage>;

	beforeEach(() => {
		mockLocalStorage = mockStorage();
		mockSessionStorage = mockStorage();

		// Replace global storage objects
		Object.defineProperty(window, 'localStorage', {
			value: mockLocalStorage,
			writable: true,
		});
		Object.defineProperty(window, 'sessionStorage', {
			value: mockSessionStorage,
			writable: true,
		});

		// Reset in-memory cache between tests
		const manager = TokenManager as unknown as { cache?: Record<string, unknown> };
		if (manager.cache) {
			manager.cache = {};
		}
	});

	describe('setToken', () => {
		it('should store token in localStorage when rememberMe is true', () => {
			TokenManager.setToken(mockToken, true);

			expect(mockLocalStorage.setItem).toHaveBeenCalledWith('constructive-auth-token:dashboard', JSON.stringify(mockToken));
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith('constructive-remember-me:dashboard', JSON.stringify(true));
		});

		it('should store token in sessionStorage when rememberMe is false', () => {
			TokenManager.setToken(mockToken, false);

			expect(mockSessionStorage.setItem).toHaveBeenCalledWith('constructive-auth-token:dashboard', JSON.stringify(mockToken));
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith('constructive-remember-me:dashboard', JSON.stringify(false));
		});
	});

	describe('getToken', () => {
		it('should retrieve token from localStorage when rememberMe is true', () => {
			mockLocalStorage.getItem.mockImplementation((key) => {
				if (key === 'constructive-remember-me:dashboard') return JSON.stringify(true);
				if (key === 'constructive-auth-token:dashboard') return JSON.stringify(mockToken);
				return null;
			});

			const result = TokenManager.getToken();

			expect(result.token).toEqual(mockToken);
			expect(result.rememberMe).toBe(true);
		});

		it('should retrieve token from sessionStorage when rememberMe is false', () => {
			mockLocalStorage.getItem.mockImplementation((key) => {
				if (key === 'constructive-remember-me:dashboard') return JSON.stringify(false);
				return null;
			});

			mockSessionStorage.getItem.mockImplementation((key) => {
				if (key === 'constructive-auth-token:dashboard') return JSON.stringify(mockToken);
				return null;
			});

			const result = TokenManager.getToken();

			expect(result.token).toEqual(mockToken);
			expect(result.rememberMe).toBe(false);
		});

		it('should return null when no token exists', () => {
			const result = TokenManager.getToken();

			expect(result.token).toBeNull();
			expect(result.rememberMe).toBe(false);
		});
	});

	describe('clearToken', () => {
		it('should remove token from both storage locations', () => {
			TokenManager.clearToken();

			expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('constructive-auth-token:dashboard');
			expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('constructive-auth-token:dashboard');
			expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('constructive-remember-me:dashboard');
		});
	});

	describe('isTokenExpired', () => {
		it('should return false for valid token', () => {
			const result = TokenManager.isTokenExpired(mockToken);
			expect(result).toBe(false);
		});

		it('should return true for expired token', () => {
			const result = TokenManager.isTokenExpired(expiredToken);
			expect(result).toBe(true);
		});

		it('should return true for token expiring within buffer time', () => {
			const soonToExpireToken: ApiToken = {
				...mockToken,
				accessTokenExpiresAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 minutes from now
			};

			const result = TokenManager.isTokenExpired(soonToExpireToken);
			expect(result).toBe(true); // Should be true because of 5-minute buffer
		});
	});

	describe('formatAuthHeader', () => {
		it('should format token as Bearer header', () => {
			const result = TokenManager.formatAuthHeader(mockToken);
			expect(result).toBe(`Bearer ${mockToken.accessToken}`);
		});
	});

	describe('getTimeUntilExpiration', () => {
		it('should return positive time for valid token', () => {
			const result = TokenManager.getTimeUntilExpiration(mockToken);
			expect(result).toBeGreaterThan(0);
		});

		it('should return 0 for expired token', () => {
			const result = TokenManager.getTimeUntilExpiration(expiredToken);
			expect(result).toBeLessThanOrEqual(0);
		});
	});
});
