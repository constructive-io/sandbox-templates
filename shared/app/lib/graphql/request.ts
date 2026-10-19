// One GraphQL POST, answered in the generated ORM's result shape so the same
// transport backs the ORM adapter and the hand-written auth operations.

// The generated SDKs re-export these types from the same module, so this adapter fits every client.
import type { GraphQLAdapter, GraphQLError, QueryResult } from '@constructive-io/graphql-query/runtime';

import { isExpired, TokenManager } from '../auth/token-manager.ts';

export type { GraphQLError, QueryResult };

const AUTH_ERROR = /UNAUTHENTICATED|jwt expired|invalid token|token.*expired/i;

function failure<T>(message: string, code?: string): QueryResult<T> {
	return { ok: false, data: null, errors: [{ message, ...(code ? { extensions: { code } } : {}) }] };
}

export async function graphqlRequest<T>(
	endpoint: string,
	query: string,
	variables?: Record<string, unknown>,
	options: { auth?: boolean } = {},
): Promise<QueryResult<T>> {
	if (!endpoint) {
		return failure('No GraphQL endpoint is configured. Set NEXT_PUBLIC_DB_NAME or the endpoint variables in .env.local.');
	}
	// An expired token would make this request anonymous: end the session instead.
	const stored = options.auth === false ? null : TokenManager.read().token;
	if (stored && isExpired(stored)) {
		TokenManager.clear();
		return failure('Your session has expired. Sign in again.', 'UNAUTHENTICATED');
	}
	let response: Response;
	try {
		response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				...(options.auth === false ? {} : TokenManager.authorization()),
			},
			body: JSON.stringify({ query, variables: variables ?? {} }),
		});
	} catch (error) {
		return failure(`Could not reach ${endpoint}: ${error instanceof Error ? error.message : String(error)}`, 'NETWORK');
	}

	const body = (await response.json().catch(() => null)) as { data?: T; errors?: GraphQLError[] } | null;
	const errors = body?.errors?.length
		? body.errors
		: response.ok
			? undefined
			: [{ message: `HTTP ${response.status}: ${response.statusText}` }];
	if (errors) {
		// A rejected token ends the session; the guard then sends the user to sign in.
		const rejected = response.status === 401 || errors.some((e) => AUTH_ERROR.test(`${e.extensions?.code ?? ''} ${e.message}`));
		if (rejected && options.auth !== false && TokenManager.read().token) TokenManager.clear();
		return { ok: false, data: null, errors };
	}
	return { ok: true, data: (body?.data ?? null) as T, errors: undefined };
}

/** A GraphQL adapter for the generated ORM: the session's token on every request. */
export function sessionAdapter(endpoint: () => string): GraphQLAdapter {
	return {
		execute<T>(document: string, variables?: Record<string, unknown>): Promise<QueryResult<T>> {
			return graphqlRequest<T>(endpoint(), document, variables);
		},
		getEndpoint: endpoint,
	};
}
