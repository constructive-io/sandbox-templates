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

function signIn(expiresAt: string) {
	Object.assign(globalThis, { window: { localStorage: storage, sessionStorage: storage, addEventListener() {}, removeEventListener() {} } });
	TokenManager.write({ id: 't', userId: 'u', accessToken: 'secret', accessTokenExpiresAt: expiresAt }, true);
}

function cleanUp() {
	items.clear();
	mock.restoreAll();
	delete (globalThis as { window?: unknown }).window;
}

describe('graphqlRequest with an expired session', () => {
	afterEach(cleanUp);

	it('ends the session instead of sending the request without a token', async () => {
		signIn('2020-01-01T00:00:00Z');
		const fetch = mock.method(globalThis, 'fetch', async () => new Response('{}'));

		const result = await graphqlRequest('http://api.test/graphql', '{ __typename }');

		assert.equal(fetch.mock.callCount(), 0);
		assert.equal(result.ok, false);
		assert.equal(result.errors?.[0].extensions?.code, 'UNAUTHENTICATED');
		assert.equal(storage.getItem(TOKEN_STORAGE_KEY), null);
	});
});

describe('graphqlRequest refused by the server', () => {
	afterEach(cleanUp);

	it('keeps the code and status of a suspended database, and keeps the session', async () => {
		signIn('2999-01-01T00:00:00Z');
		const body = { errors: [{ message: 'Access to this database is suspended.', extensions: { code: 'ACCESS_SUSPENDED' } }] };
		mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify(body), { status: 403 }));

		const result = await graphqlRequest('http://api.test/graphql', '{ __typename }');

		assert.deepEqual(result.errors?.[0].extensions, { code: 'ACCESS_SUSPENDED', httpStatus: 403 });
		assert.notEqual(storage.getItem(TOKEN_STORAGE_KEY), null, 'signing in again would not help');
	});

	it('keeps the session and the server\'s text for a domain error that mentions a token', async () => {
		signIn('2999-01-01T00:00:00Z');
		const body = { errors: [{ message: 'invalid token for password reset' }] };
		mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify(body)));

		const result = await graphqlRequest('http://api.test/graphql', 'mutation { resetPassword }');

		assert.equal(result.errors?.[0].message, 'invalid token for password reset');
		assert.notEqual(storage.getItem(TOKEN_STORAGE_KEY), null);
	});

	it('names a 403 without a body, and signs out only on a 401', async () => {
		signIn('2999-01-01T00:00:00Z');
		mock.method(globalThis, 'fetch', async () => new Response('Forbidden', { status: 403, statusText: 'Forbidden' }));
		const forbidden = await graphqlRequest('http://api.test/graphql', '{ __typename }');
		assert.deepEqual(forbidden.errors?.[0], { message: 'HTTP 403: Forbidden', extensions: { code: 'HTTP_ERROR', httpStatus: 403 } });
		assert.notEqual(storage.getItem(TOKEN_STORAGE_KEY), null);

		mock.restoreAll();
		mock.method(globalThis, 'fetch', async () => new Response('', { status: 401, statusText: 'Unauthorized' }));
		await graphqlRequest('http://api.test/graphql', '{ __typename }');
		assert.equal(storage.getItem(TOKEN_STORAGE_KEY), null);
	});
});
