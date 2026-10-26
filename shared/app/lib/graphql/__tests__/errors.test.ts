import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	describeError,
	failureKind,
	isRetryable,
	OUTDATED_MESSAGE,
	RequestFailure,
	UNAVAILABLE_MESSAGE,
	type FailureKind,
	type RequestError,
} from '../errors.ts';

describe('failureKind', () => {
	it('tells an unavailable database, an outdated app and an ended session from other failures', () => {
		const cases: Array<[RequestError, FailureKind]> = [
			[{ message: 'Access to this database is suspended.', extensions: { code: 'ACCESS_SUSPENDED', httpStatus: 403 } }, 'unavailable'],
			// A proxy's 403 has no body; the server's own refusals carry a code.
			[{ message: 'HTTP 403: Forbidden', extensions: { code: 'HTTP_ERROR', httpStatus: 403 } }, 'unavailable'],
			[{ message: 'Forbidden', extensions: { code: 'FORBIDDEN', httpStatus: 403 } }, 'other'],
			[{ message: 'HTTP 401: Unauthorized', extensions: { code: 'HTTP_ERROR', httpStatus: 401 } }, 'signed-out'],
			[{ message: 'Not signed in', extensions: { code: 'UNAUTHENTICATED' } }, 'signed-out'],
			[{ message: 'jwt expired' }, 'signed-out'],
			// A domain error that mentions a token is not about the session.
			[{ message: 'invalid token for password reset' }, 'other'],
			[{ message: 'The invite token expired.' }, 'other'],
			[{ message: 'Cannot query field "notes" on type "Shift". Did you mean "note"?' }, 'outdated'],
			[{ message: 'Field "notes" is not defined by type "ShiftPatch".' }, 'outdated'],
			[{ message: 'Value "FULL" does not exist in "ShiftStatus" enum.' }, 'outdated'],
			[{ message: 'column "notes" of relation "shifts" does not exist' }, 'outdated'],
			[{ message: 'something', extensions: { code: '42P01' } }, 'outdated'],
			[{ message: 'Could not reach http://api.test/graphql: fetch failed', extensions: { code: 'NETWORK' } }, 'network'],
			[{ message: 'Shift is full.' }, 'other'],
		];
		for (const [error, kind] of cases) assert.equal(failureKind([error]), kind, error.message);
	});

	it('puts an unavailable database before anything else the response says', () => {
		const errors = [
			{ message: 'Cannot query field "notes" on type "Shift".' },
			{ message: 'invalid token', extensions: { code: 'ACCESS_SUSPENDED', httpStatus: 403 } },
		];
		assert.equal(failureKind(errors), 'unavailable');
	});
});

describe('describeError and isRetryable', () => {
	it('give one sentence for anything a screen catches, and no retry when it cannot help', () => {
		const suspended = new RequestFailure([{ message: 'Access to this database is suspended.', extensions: { code: 'ACCESS_SUSPENDED' } }]);
		assert.equal(suspended.message, UNAVAILABLE_MESSAGE);
		assert.equal(suspended.errors[0].extensions?.code, 'ACCESS_SUSPENDED');
		assert.equal(isRetryable(suspended), false);

		// The ORM's unwrap() throws its own error with the GraphQL errors on it.
		const ormError = Object.assign(new Error('GraphQL Error: Cannot query field "notes" on type "Shift".'), {
			errors: [{ message: 'Cannot query field "notes" on type "Shift".' }],
		});
		assert.equal(describeError(ormError), OUTDATED_MESSAGE);
		assert.equal(isRetryable(ormError), false);

		const flaky = new RequestFailure([{ message: 'Could not reach the API', extensions: { code: 'NETWORK' } }]);
		assert.equal(describeError(flaky), 'Could not reach the API');
		assert.equal(isRetryable(flaky), true);
		assert.equal(describeError(Object.assign(new Error('raw'), { userMessage: 'Fill in the required fields.' })), 'Fill in the required fields.');
		assert.equal(describeError(undefined), 'Something went wrong. Try again.');
	});
});
