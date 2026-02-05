import React from 'react';
import * as NextNav from 'next/navigation';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAppStore, useAuth, useAuthActions } from '@/store/app-store';
import type { ApiToken, UserProfile } from '@/store/auth-slice';

vi.mock('next/navigation', async (orig) => {
	// We provide a mutable mock for usePathname per test
	let path = '/';
	return {
		...(await orig()),
		usePathname: () => path,
		__setPathname: (p: string) => {
			path = p;
		},
	} as any;
});

function HookProbe() {
	const { isAuthenticated, isLoading } = useAuth();
	return (
		<div>
			<span data-testid='authed'>{String(isAuthenticated)}</span>
			<span data-testid='loading'>{String(isLoading)}</span>
		</div>
	);
}

const token: ApiToken = {
	id: 't1',
	userId: 'u1',
	accessToken: 'abc',
	accessTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
};
const user: UserProfile = { id: 'u1', email: 'u@example.com' };

function resetAuth() {
	useAppStore.setState((s) => ({
		...s,
		schemaBuilderAuth: { isAuthenticated: false, isLoading: false, user: null, token: null, rememberMe: false },
		dashboardAuthByScope: {},
		dashboardScope: { databaseId: null },
		authByContext: {
			dashboard: { isAuthenticated: false, isLoading: false, user: null, token: null, rememberMe: false },
			'schema-builder': {
				isAuthenticated: false,
				isLoading: false,
				user: null,
				token: null,
				rememberMe: false,
			},
		},
	}));
}

describe('useAuth selects per-route auth slice', () => {
	beforeEach(() => {
		// clear persisted state if any from previous tests
		try {
			localStorage.clear();
			sessionStorage.clear();
		} catch {}
		resetAuth();
	});

	it('returns dashboard auth when pathname is /orgs/[orgId]/databases/[databaseId]/data', () => {
		(NextNav as any).__setPathname('/orgs/org-123/databases/db-456/data');
		// Set dashboard scope first, then authenticate
		useAppStore.getState().setDashboardScope('db-456');
		useAppStore.getState().setAuthenticated(user, token, false, 'dashboard', 'db-456');

		render(<HookProbe />);
		expect(screen.getByTestId('authed').textContent).toBe('true');
		expect(screen.getByTestId('loading').textContent).toBe('false');
	});

	it('returns schema-builder auth when pathname is /orgs/[orgId]/databases/[databaseId]/schemas', () => {
		(NextNav as any).__setPathname('/orgs/org-123/databases/db-456/schemas');
		// Set dashboard scope and authenticate dashboard (only dashboard is authed)
		useAppStore.getState().setDashboardScope('db-456');
		useAppStore.getState().setAuthenticated(user, token, false, 'dashboard', 'db-456');

		render(<HookProbe />);
		// visiting schemas route should use schema-builder auth, not dashboard auth
		expect(screen.getByTestId('authed').textContent).toBe('false');
		expect(screen.getByTestId('loading').textContent).toBe('false');
	});

	it('returns schema-builder auth when pathname is root', () => {
		(NextNav as any).__setPathname('/');
		// Set auth state on schema-builder context
		useAppStore.getState().setAuthenticated(user, token, false, 'schema-builder');

		render(<HookProbe />);
		expect(screen.getByTestId('authed').textContent).toBe('true');
		expect(screen.getByTestId('loading').textContent).toBe('false');
	});
});
