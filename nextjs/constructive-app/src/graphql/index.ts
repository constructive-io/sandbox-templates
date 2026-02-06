/**
 * GraphQL exports for the application.
 *
 * Schema-builder operations use the SDK directly from @sdk/api.
 * Dashboard operations use dynamically generated queries via TypedDocumentString.
 */
import { TypedDocumentString } from './typed-document';

// Core execution functions with proper type inference
export { execute, executeCrm, executeSb, executeInContext, getAuthHeaders } from './execute';

// Context utilities
export { getSchemaContext, type SchemaContext } from '@/app-config';

/**
 * Creates a TypedDocumentString from a GraphQL query/mutation string.
 *
 * This is a simple wrapper that creates a TypedDocumentString instance.
 * For dashboard operations, queries are dynamically generated at runtime
 * via query-generator.ts, so codegen types are not needed.
 *
 * @example
 * const doc = graphql(`query GetUsers { users { id name } }`);
 * const result = await executeCrm(doc);
 */
export function graphql<TResult = unknown, TVariables = Record<string, unknown>>(
	source: string,
): TypedDocumentString<TResult, TVariables> {
	return new TypedDocumentString<TResult, TVariables>(source, {
		operationName: source.match(/(?:mutation|query)\s+(\w+)/)?.[1] ?? 'Unknown',
	});
}

export default graphql;
