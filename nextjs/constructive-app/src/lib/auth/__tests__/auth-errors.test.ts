/**
 * Tests for auth-errors.ts
 * Consolidated: removed redundant tests, kept essential coverage
 */
import { describe, expect, it } from 'vitest';

import {
	AuthError,
	createInvalidCredentialsError,
	DEFAULT_ERROR_MESSAGE,
	ERROR_CODES,
	ERROR_MESSAGES,
	getErrorMessage,
	isKnownErrorCode,
	parseGraphQLError,
	type ErrorCode,
	type ParseGraphQLErrorOptions,
} from '../auth-errors';

describe('auth-errors', () => {
	describe('ERROR_CODES and ERROR_MESSAGES', () => {
		it('has all expected error codes with matching messages', () => {
			const expectedCodes = [
				'INCORRECT_PASSWORD',
				'PASSWORD_INSECURE',
				'ACCOUNT_LOCKED_EXCEED_ATTEMPTS',
				'ACCOUNT_DISABLED',
				'ACCOUNT_EXISTS',
				'PASSWORD_LEN',
				'INVITE_NOT_FOUND',
				'INVITE_LIMIT',
				'INVITE_EMAIL_NOT_FOUND',
				'INVALID_CREDENTIALS',
			];

			expect(Object.keys(ERROR_CODES)).toHaveLength(10);
			expectedCodes.forEach((code) => {
				expect(ERROR_CODES[code as keyof typeof ERROR_CODES]).toBe(code);
				expect(ERROR_MESSAGES[code as ErrorCode]).toBeDefined();
				expect(typeof ERROR_MESSAGES[code as ErrorCode]).toBe('string');
			});
		});

		it('has user-friendly messages', () => {
			expect(ERROR_MESSAGES.INVALID_CREDENTIALS).toBe('Invalid email or password.');
			expect(ERROR_MESSAGES.ACCOUNT_LOCKED_EXCEED_ATTEMPTS).toContain('locked');
			expect(ERROR_MESSAGES.PASSWORD_LEN).toContain('8');
		});
	});

	describe('isKnownErrorCode', () => {
		it('returns true for known codes, false for unknown', () => {
			Object.values(ERROR_CODES).forEach((code) => {
				expect(isKnownErrorCode(code)).toBe(true);
			});
			expect(isKnownErrorCode('UNKNOWN_CODE')).toBe(false);
			expect(isKnownErrorCode('')).toBe(false);
			expect(isKnownErrorCode(null)).toBe(false);
		});
	});

	describe('getErrorMessage', () => {
		it('returns correct message for error codes', () => {
			expect(getErrorMessage('INCORRECT_PASSWORD')).toBe(ERROR_MESSAGES.INCORRECT_PASSWORD);
			expect(getErrorMessage('ACCOUNT_EXISTS')).toBe(ERROR_MESSAGES.ACCOUNT_EXISTS);
		});
	});

	describe('parseGraphQLError', () => {
		it('extracts code from GraphQL extensions', () => {
			const result = parseGraphQLError({ extensions: { code: 'INCORRECT_PASSWORD' } });
			expect(result.code).toBe('INCORRECT_PASSWORD');
			expect(result.isKnownError).toBe(true);
			expect(result.message).toBe(ERROR_MESSAGES.INCORRECT_PASSWORD);
		});

		it('extracts code from error.code property', () => {
			const result = parseGraphQLError({ message: 'Error', code: 'ACCOUNT_EXISTS' });
			expect(result.code).toBe('ACCOUNT_EXISTS');
			expect(result.isKnownError).toBe(true);
		});

		it('extracts code from (Code: X) pattern in message', () => {
			const result = parseGraphQLError(new Error('Failed (Code: PASSWORD_LEN)'));
			expect(result.code).toBe('PASSWORD_LEN');
			expect(result.isKnownError).toBe(true);
		});

		it('finds known code directly in message', () => {
			const result = parseGraphQLError(new Error('INVITE_NOT_FOUND: Not found'));
			expect(result.code).toBe('INVITE_NOT_FOUND');
		});

		it('extracts code from string errors', () => {
			expect(parseGraphQLError('PASSWORD_INSECURE').code).toBe('PASSWORD_INSECURE');
			expect(parseGraphQLError('Error (Code: INVITE_LIMIT)').code).toBe('INVITE_LIMIT');
		});

		it('returns default for unknown/invalid errors', () => {
			const cases = [
				{ extensions: { code: 'UNKNOWN' } },
				null,
				undefined,
			];
			cases.forEach((error) => {
				const result = parseGraphQLError(error);
				expect(result.code).toBe(null);
				expect(result.isKnownError).toBe(false);
				expect(result.message).toBe(DEFAULT_ERROR_MESSAGE);
			});
		});

		it('uses default for technical errors, passes through user-friendly messages', () => {
			expect(parseGraphQLError(new Error('GraphQL validation failed')).message).toBe(DEFAULT_ERROR_MESSAGE);
			expect(parseGraphQLError(new Error('fetch failed')).message).toBe(DEFAULT_ERROR_MESSAGE);
			expect(parseGraphQLError(new Error('Your session has expired')).message).toBe('Your session has expired');
		});

		it('includes original error in result', () => {
			const original = new Error('Test');
			expect(parseGraphQLError(original).originalError).toBe(original);
		});

		describe('options', () => {
			it('uses custom defaultMessage', () => {
				const options: ParseGraphQLErrorOptions = { defaultMessage: 'Custom default' };
				expect(parseGraphQLError(new Error('Network'), options).message).toBe('Custom default');
			});

			it('handles customMessages for custom and override cases', () => {
				const options: ParseGraphQLErrorOptions = {
					customMessages: {
						CUSTOM_ERROR: 'Custom message',
						INCORRECT_PASSWORD: 'Override message',
					},
				};
				expect(parseGraphQLError({ extensions: { code: 'CUSTOM_ERROR' } }, options).message).toBe('Custom message');
				expect(parseGraphQLError({ extensions: { code: 'INCORRECT_PASSWORD' } }, options).message).toBe(
					'Override message'
				);
			});
		});
	});

	describe('AuthError class', () => {
		it('creates error with code and default message', () => {
			const error = new AuthError('INVALID_CREDENTIALS');
			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe('AuthError');
			expect(error.code).toBe('INVALID_CREDENTIALS');
			expect(error.message).toBe(ERROR_MESSAGES.INVALID_CREDENTIALS);
			expect(error.userMessage).toBe(ERROR_MESSAGES.INVALID_CREDENTIALS);
		});

		it('accepts custom message override', () => {
			const error = new AuthError('ACCOUNT_DISABLED', 'Custom message');
			expect(error.message).toBe('Custom message');
		});

		it('works with all error codes', () => {
			Object.values(ERROR_CODES).forEach((code) => {
				const error = new AuthError(code);
				expect(error.code).toBe(code);
				expect(error.userMessage).toBe(ERROR_MESSAGES[code]);
			});
		});

		describe('AuthError.isCode', () => {
			it('checks if error matches code', () => {
				const error = new AuthError('INVALID_CREDENTIALS');
				expect(AuthError.isCode(error, 'INVALID_CREDENTIALS')).toBe(true);
				expect(AuthError.isCode(error, 'ACCOUNT_DISABLED')).toBe(false);
				expect(AuthError.isCode(new Error('test'), 'INVALID_CREDENTIALS')).toBe(false);
				expect(AuthError.isCode(null, 'INVALID_CREDENTIALS')).toBe(false);
			});
		});
	});

	describe('createInvalidCredentialsError', () => {
		it('creates INVALID_CREDENTIALS AuthError', () => {
			const error = createInvalidCredentialsError();
			expect(error).toBeInstanceOf(AuthError);
			expect(error.code).toBe('INVALID_CREDENTIALS');
		});
	});

	describe('validation errors', () => {
		it('handles ZodError-like objects', () => {
			const result = parseGraphQLError({
				name: 'ZodError',
				issues: [{ message: 'Passwords do not match' }],
			});
			expect(result.code).toBe('VALIDATION_ERROR');
			expect(result.message).toBe('Passwords do not match');
		});

		it('ignores non-ZodError with issues', () => {
			const result = parseGraphQLError({
				name: 'NotZodError',
				issues: [{ message: 'Message' }],
			});
			expect(result.code).toBeNull();
		});
	});
});
