/**
 * GraphQL Error Extensions Parsing Tests
 * Consolidated: code mapping, extension parsing, prioritization
 */
import { describe, expect, it } from 'vitest';

import { DataErrorType, parseGraphQLError, parseGraphQLErrorCode, type GraphQLError } from '../error-handler';

describe('GraphQL Error Extensions', () => {
	describe('parseGraphQLErrorCode', () => {
		const codeMappings = [
			['UNAUTHENTICATED', DataErrorType.UNAUTHORIZED],
			['FORBIDDEN', DataErrorType.FORBIDDEN],
			['GRAPHQL_VALIDATION_FAILED', DataErrorType.QUERY_GENERATION_FAILED],
			['INTERNAL_ERROR', DataErrorType.QUERY_EXECUTION_FAILED],
			['NOT_FOUND', DataErrorType.TABLE_NOT_FOUND],
			['UNKNOWN_CODE', DataErrorType.UNKNOWN_ERROR],
		] as const;

		it.each(codeMappings)('maps %s → %s', (code, expected) => {
			expect(parseGraphQLErrorCode(code)).toBe(expected);
		});
	});

	describe('parseGraphQLError with extensions', () => {
		const extensionCases = [
			[{ message: 'Auth required', extensions: { code: 'UNAUTHENTICATED' } }, DataErrorType.UNAUTHORIZED],
			[{ message: 'Access denied', extensions: { code: 'FORBIDDEN' } }, DataErrorType.FORBIDDEN],
			[{ message: 'Field invalid', extensions: { code: 'GRAPHQL_VALIDATION_FAILED' } }, DataErrorType.QUERY_GENERATION_FAILED],
			[{ message: 'DB failed', extensions: { code: 'INTERNAL_ERROR' } }, DataErrorType.QUERY_EXECUTION_FAILED],
			[{ message: 'Validation failed', extensions: { code: 'INVALID_INPUT' } }, DataErrorType.INVALID_MUTATION_DATA],
		] as const;

		it.each(extensionCases)('parses %j → %s', (error, expected) => {
			const result = parseGraphQLError(error as GraphQLError, 'users');
			expect(result.type).toBe(expected);
			expect(result.tableName).toBe('users');
		});

		it('falls back to message parsing when no extension code', () => {
			const gqlError: GraphQLError = {
				message: 'You are not authorized to access this resource',
				extensions: { timestamp: '2024-01-01' },
			};
			expect(parseGraphQLError(gqlError, 'users').type).toBe(DataErrorType.UNAUTHORIZED);
		});

		it('handles errors without extensions', () => {
			const gqlError: GraphQLError = { message: 'Access forbidden' };
			expect(parseGraphQLError(gqlError, 'users').type).toBe(DataErrorType.FORBIDDEN);
		});
	});

	describe('Error objects with embedded codes', () => {
		const embeddedCodeCases = [
			['Auth required (Code: UNAUTHENTICATED)', DataErrorType.UNAUTHORIZED],
			['Access denied (Code: FORBIDDEN)', DataErrorType.FORBIDDEN],
			['Network timeout (Code: UNKNOWN_CODE)', DataErrorType.TIMEOUT_ERROR], // Falls back to message
		] as const;

		it.each(embeddedCodeCases)('parses %s → %s', (msg, expected) => {
			expect(parseGraphQLError(new Error(msg), 'users').type).toBe(expected);
		});
	});

	describe('Error prioritization', () => {
		it('prioritizes extension code over message', () => {
			const gqlError: GraphQLError = {
				message: 'Network failed', // Would be NETWORK_ERROR
				extensions: { code: 'UNAUTHENTICATED' }, // But extension says UNAUTHORIZED
			};
			expect(parseGraphQLError(gqlError, 'users').type).toBe(DataErrorType.UNAUTHORIZED);
		});

		it('uses message when extension code is unknown', () => {
			const gqlError: GraphQLError = {
				message: 'Network timeout occurred',
				extensions: { code: 'UNKNOWN_CODE' },
			};
			expect(parseGraphQLError(gqlError, 'users').type).toBe(DataErrorType.TIMEOUT_ERROR);
		});
	});

	describe('Real-world scenarios', () => {
		it('handles PostGraphile JWT errors', () => {
			const gqlError: GraphQLError = {
				message: 'Auth hook failed',
				extensions: { code: 'UNAUTHENTICATED', exception: { stacktrace: ['JWT expired'] } },
				path: ['users'],
			};
			const result = parseGraphQLError(gqlError, 'users');
			expect(result.type).toBe(DataErrorType.UNAUTHORIZED);
			expect(result.getUserMessage()).toContain('not authorized');
		});

		it('handles field-level permission errors', () => {
			const gqlError: GraphQLError = {
				message: 'Access denied for field "sensitiveData"',
				extensions: { code: 'FORBIDDEN' },
				path: ['users', 0, 'sensitiveData'],
			};
			const result = parseGraphQLError(gqlError, 'users');
			expect(result.type).toBe(DataErrorType.FORBIDDEN);
			expect(result.getUserMessage()).toContain('permission');
		});
	});
});
