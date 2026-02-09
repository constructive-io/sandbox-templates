import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
import type { DocumentNode } from 'graphql';
import { print } from 'graphql';

import { TokenManager } from '@/lib/auth/token-manager';
import { createError, DataError } from '@/lib/gql/error-handler';
import { createLogger } from '@/lib/logger';
import { getEndpoint, getSchemaContext, type SchemaContext } from '@/app-config';

import { TypedDocumentString } from './typed-document';

const logger = createLogger({ scope: 'execute' });

// ============================================================================
// Type Inference
// ============================================================================

type ExecutableDocument =
	| TypedDocumentString<any, any>
	| (DocumentTypeDecoration<any, any> & { toString(): string })
	| DocumentNode
	| string
	| unknown;

type ResultOfDocument<TDocument> =
	TDocument extends DocumentTypeDecoration<infer TResult, any>
		? TResult
		: TDocument extends TypedDocumentString<infer TResult, any>
			? TResult
			: TDocument extends { __apiType?: DocumentTypeDecoration<infer TResult, any>['__apiType'] }
				? TResult
				: unknown;

type VariablesOfDocument<TDocument> =
	TDocument extends DocumentTypeDecoration<any, infer TVariables>
		? TVariables
		: TDocument extends TypedDocumentString<any, infer TVariables>
			? TVariables
			: TDocument extends { __apiType?: DocumentTypeDecoration<any, infer TVariables>['__apiType'] }
				? TVariables
				: Record<string, unknown>;

// ============================================================================
// Helpers
// ============================================================================

function documentToString(document: ExecutableDocument): string {
	if (typeof document === 'string') return document;
	if (document instanceof String) return document.toString();
	if (document && typeof document === 'object' && 'kind' in (document as DocumentNode)) {
		return print(document as DocumentNode);
	}
	if (document === null || document === undefined) {
		throw createError.badRequest('Invalid GraphQL document: null or undefined');
	}
	return String(document);
}

/**
 * Get authentication headers for the given schema context.
 * For dashboard context, uses the current dashboard scope (databaseId) to get the correct token.
 * 
 * @param ctx - Schema context (dashboard or schema-builder)
 * @param scope - Optional scope for dashboard tokens (e.g., databaseId). If not provided, uses current dashboard scope.
 */
export function getAuthHeaders(ctx: SchemaContext = getSchemaContext(), scope?: string): Record<string, string> {
	const { token } = TokenManager.getToken(ctx, scope);

	if (token) {
		const isExpired = TokenManager.isTokenExpired(token);
		if (!isExpired) {
			return { Authorization: TokenManager.formatAuthHeader(token) };
		}
	}

	return {};
}

// ============================================================================
// GraphQL Response Parsing
// ============================================================================

interface GraphQLResponseError {
	message: string;
	extensions?: { code?: string };
}

interface GraphQLResponse {
	data?: unknown;
	errors?: GraphQLResponseError[];
}

/**
 * Parse GraphQL response and extract error if present
 */
function parseGraphQLResponse(response: GraphQLResponse, ctx: SchemaContext, scope?: string): DataError | null {
	if (!response.errors?.length) return null;

	const error = response.errors[0];
	const code = error.extensions?.code;
	const message = error.message || 'GraphQL query failed';

	// Handle auth errors
	if (code === 'UNAUTHENTICATED' || message.toLowerCase().includes('authentication')) {
		TokenManager.clearToken(ctx, scope);
		return createError.unauthorized('Authentication required. Please log in again.');
	}

	if (code === 'FORBIDDEN') {
		return createError.forbidden('You do not have permission to perform this action.');
	}

	// Return GraphQL error with code if available
	return createError.graphql(message, code);
}

/**
 * Handle HTTP error status codes
 */
async function handleHttpError(
	response: Response,
	ctx: SchemaContext,
	scope?: string
): Promise<DataError> {
	const { status, statusText } = response;

	// 401 Unauthorized
	if (status === 401) {
		TokenManager.clearToken(ctx, scope);
		return createError.unauthorized('Authentication required. Please log in again.');
	}

	// 403 Forbidden
	if (status === 403) {
		return createError.forbidden('You do not have permission to perform this action.');
	}

	// 404 Not Found
	if (status === 404) {
		return createError.notFound('The requested endpoint does not exist.');
	}

	// Try to extract error message from response body
	try {
		const body = await response.json();
		if (body.errors?.length) {
			const error = body.errors[0];
			return createError.graphql(error.message || `Request failed: ${status}`, error.extensions?.code);
		}
		if (body.message) {
			return createError.badRequest(body.message);
		}
	} catch {
		// Couldn't parse response body
	}

	return createError.badRequest(`Request failed: ${status} ${statusText}`);
}

// ============================================================================
// Execute Function
// ============================================================================

export type ExecuteInContextOptions = {
	/** Force a specific GraphQL endpoint (useful to keep queryFn aligned with a scoped queryKey). */
	endpoint?: string | null;
	/** Force a specific dashboard auth scope (e.g. database scope id). */
	authScope?: string | undefined;
};

/**
 * Execute a GraphQL document in a specific schema context.
 *
 * Throws DataError on failure - let React Query handle retries.
 */
export async function executeInContext<TDocument extends ExecutableDocument>(
	ctx: SchemaContext,
	document: TDocument,
	variables?: VariablesOfDocument<TDocument>,
	options?: ExecuteInContextOptions,
): Promise<ResultOfDocument<TDocument>> {
	const endpointOverride = options?.endpoint?.trim() ? options.endpoint.trim() : null;

	// Resolve endpoint
	const standardEndpoint = getEndpoint(ctx);
	const url = endpointOverride || standardEndpoint;

	logger.debug('executeInContext', {
		context: ctx,
		endpoint: url,
		endpointOverride: endpointOverride || null,
	});

	if (!url) {
		throw createError.badRequest(
			`No GraphQL endpoint configured for ${ctx} context. Please configure the schema builder endpoint.`
		);
	}

	// Make request
	let response: Response;
	const authHeaders = getAuthHeaders(ctx);
	try {
		response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/graphql-response+json',
				...authHeaders,
			},
			body: JSON.stringify({
				query: documentToString(document),
				...(variables !== undefined && { variables }),
			}),
		});
	} catch (error) {
		// Network error - let React Query retry
		throw createError.network(error instanceof Error ? error : undefined);
	}

	// Handle HTTP errors
	if (!response.ok) {
		throw await handleHttpError(response, ctx);
	}

	// Parse response
	const result: GraphQLResponse = await response.json();

	// Check for GraphQL errors
	const graphqlError = parseGraphQLResponse(result, ctx);
	if (graphqlError) {
		throw graphqlError;
	}

	return result.data as ResultOfDocument<TDocument>;
}

// ============================================================================
// Convenience Exports
// ============================================================================

export function executeCrm<TDocument extends ExecutableDocument>(
	document: TDocument,
	variables?: VariablesOfDocument<TDocument>,
): Promise<ResultOfDocument<TDocument>> {
	return executeInContext('dashboard', document, variables);
}

export function executeCrmInScope<TDocument extends ExecutableDocument>(
	options: ExecuteInContextOptions,
	document: TDocument,
	variables?: VariablesOfDocument<TDocument>,
): Promise<ResultOfDocument<TDocument>> {
	return executeInContext('dashboard', document, variables, options);
}

export function executeSb<TDocument extends ExecutableDocument>(
	document: TDocument,
	variables?: VariablesOfDocument<TDocument>,
): Promise<ResultOfDocument<TDocument>> {
	return executeInContext('schema-builder', document, variables);
}

export function execute<TDocument extends ExecutableDocument>(
	document: TDocument,
	variables?: VariablesOfDocument<TDocument>,
): Promise<ResultOfDocument<TDocument>> {
	return executeInContext(getSchemaContext(), document, variables);
}

// Re-export DataError for consumers
export { DataError } from '@/lib/gql/error-handler';
