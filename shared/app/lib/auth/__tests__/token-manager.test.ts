import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';

import { REMEMBER_ME_KEY, TOKEN_STORAGE_KEY, TokenManager } from '../token-manager.ts';

class MemoryStorage {
	private items = new Map<string, string>();
	getItem(key: string) {
		return this.items.has(key) ? (this.items.get(key) as string) : null;
	}
	setItem(key: string, value: string) {
		this.items.set(key, value);
	}
	removeItem(key: string) {
		this.items.delete(key);
	}
}

const future = new Date(Date.now() + 3_600_000).toISOString().replace('Z', '123+00:00');
const token = { id: 'tok', userId: 'user-1', accessToken: 'secret', accessTokenExpiresAt: future };

describe('token storage contract', () => {
	let local: MemoryStorage;
	let session: MemoryStorage;
	beforeEach(() => {
		local = new MemoryStorage();
		session = new MemoryStorage();
		Object.assign(globalThis, {
			window: { localStorage: local, sessionStorage: session, addEventListener() {}, removeEventListener() {} },
		});
	});
	afterEach(() => {
		delete (globalThis as { window?: unknown }).window;
	});

	it('reads a token the desktop injected into localStorage with remember-me on', () => {
		local.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token));
		local.setItem(REMEMBER_ME_KEY, 'true');
		assert.deepEqual(TokenManager.read().token, token);
		assert.deepEqual(TokenManager.authorization(), { Authorization: 'Bearer secret' });
	});

	it('reads a session-only token from sessionStorage', () => {
		session.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token));
		local.setItem(REMEMBER_ME_KEY, 'false');
		assert.equal(TokenManager.read().token?.accessToken, 'secret');
	});

	it('clears the token when it expires while the app is open, so the session flips to signed out', () => {
		mock.timers.enable({ apis: ['setTimeout', 'Date'], now: Date.now() });
		try {
			TokenManager.write({ ...token, accessTokenExpiresAt: new Date(Date.now() + 120_000).toISOString() }, true);
			let changes = 0;
			const unsubscribe = TokenManager.subscribe(() => changes++);
			mock.timers.tick(60_000);
			assert.ok(TokenManager.read().token, 'still valid a minute in');
			mock.timers.tick(61_000);
			assert.equal(TokenManager.read().token, null);
			assert.equal(local.getItem(TOKEN_STORAGE_KEY), null);
			assert.ok(changes > 0, 'listeners hear it');
			unsubscribe();
		} finally {
			mock.timers.reset();
		}
	});

	it('writes where the desktop reads, and sends no header for an expired token', () => {
		TokenManager.write(token, false);
		assert.equal(local.getItem(REMEMBER_ME_KEY), 'false');
		assert.equal(local.getItem(TOKEN_STORAGE_KEY), null);
		assert.deepEqual(JSON.parse(session.getItem(TOKEN_STORAGE_KEY) as string), token);

		TokenManager.write({ ...token, accessTokenExpiresAt: '2020-01-01T00:00:00Z' }, true);
		assert.equal(local.getItem(REMEMBER_ME_KEY), 'true');
		assert.equal(session.getItem(TOKEN_STORAGE_KEY), null);
		assert.deepEqual(TokenManager.authorization(), {});
	});
});
