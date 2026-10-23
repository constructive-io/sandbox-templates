'use client';

import { useSyncExternalStore } from 'react';

import { isExpired, TokenManager, type AuthToken } from './token-manager';

export type SessionStatus = 'loading' | 'authenticated' | 'anonymous';

export type Session = {
	status: SessionStatus;
	token: AuthToken | null;
	userId: string | null;
};

// Storage only exists in the browser, so the server render and the first
// client render agree on "loading" and the guard decides after hydration.
const LOADING: Session = { status: 'loading', token: null, userId: null };

let cached: { key: string; session: Session } | null = null;

function readSession(): Session {
	const stored = TokenManager.read();
	// Expiry is part of the key: the same stored token reads as signed-out once it lapses.
	const expired = stored.token ? isExpired(stored.token) : false;
	const key = `${stored.raw}:${expired}`;
	if (cached?.key === key) return cached.session;
	const token = stored.token && !expired ? stored.token : null;
	const session: Session = token
		? { status: 'authenticated', token, userId: token.userId || token.id }
		: { status: 'anonymous', token: null, userId: null };
	cached = { key, session };
	return session;
}

export function useSession(): Session {
	return useSyncExternalStore(TokenManager.subscribe, readSession, () => LOADING);
}
