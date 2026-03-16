/**
 * GraphQL exports for the application.
 *
 * Per-DB mode uses three SDK contexts:
 * - @sdk/admin: Organizations, permissions, invites
 * - @sdk/auth: Users, emails, authentication
 * - @sdk/app: Your business data
 */
import { TypedDocumentString } from './typed-document';

// Core execution functions with proper type inference
export { execute, executeAdmin, executeAuth, executeApp, executeInContext, getAuthHeaders } from './execute';

// Context type
export { type SchemaContext } from '@/app-config';

/**
 * Creates a TypedDocumentString from a GraphQL query/mutation string.
 *
 * @example
 * const doc = graphql(`query GetUsers { users { id name } }`);
 * const result = await execute(doc);
 */
export function graphql<TResult = unknown, TVariables = Record<string, unknown>>(
	source: string,
): TypedDocumentString<TResult, TVariables> {
	return new TypedDocumentString<TResult, TVariables>(source, {
		operationName: source.match(/(?:mutation|query)\s+(\w+)/)?.[1] ?? 'Unknown',
	});
}

export default graphql;
