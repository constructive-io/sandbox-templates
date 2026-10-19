import assert from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';

import { TOKEN_STORAGE_KEY, TokenManager } from '../../auth/token-manager.ts';
import { graphqlRequest } from '../request.ts';

const items = new Map<string, string>();
const storage = {
	getItem: (key: string) => items.get(key) ?? null,
	setItem: (key: string, value: string) => void items.set(key, value),
	removeItem: (key: string) => void items.delete(key),
};

describe('graphqlRequest with an expired session', () => {
	afterEach(() => {
		items.clear();
		mock.restoreAll();
		delete (globalThis as { window?: unknown }).window;
	});

	it('ends the session instead of sending the request without a token', async () => {
		Object.assign(globalThis, { window: { localStorage: storage, sessionStorage: storage, addEventListener() {}, removeEventListener() {} } });
		TokenManager.write({ id: 't', userId: 'u', accessToken: 'secret', accessTokenExpiresAt: '2020-01-01T00:00:00Z' }, true);
		const fetch = mock.method(globalThis, 'fetch', async () => new Response('{}'));

		const result = await graphqlRequest('http://api.test/graphql', '{ __typename }');

		assert.equal(fetch.mock.callCount(), 0);
		assert.equal(result.ok, false);
		assert.equal(result.errors?.[0].extensions?.code, 'UNAUTHENTICATED');
		assert.equal(storage.getItem(TOKEN_STORAGE_KEY), null);
	});
});
