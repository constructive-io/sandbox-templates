// What a failed request means for the person using the app.
//
// A screen can fail because the database is gone or suspended (unavailable),
// because the app asks for columns or tables the database no longer has
// (outdated: the database changed after the app was built), because the
// session ended (signed-out), or because the server could not be reached.
// These need a sentence and no retry; everything else keeps the server's text.
//
// Imports nothing, so the node test runner and every layer can use it.

export type FailureKind = 'unavailable' | 'outdated' | 'signed-out' | 'network' | 'other';

export type RequestError = { message?: string; extensions?: Record<string, unknown> };

export const UNAVAILABLE_MESSAGE = "This app's database is unavailable.";
export const OUTDATED_MESSAGE = 'This screen is out of date with the database; ask to rebuild the app.';
export const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Sign in again.';

/** A rejected or expired token, by code or wording. */
export const AUTH_ERROR = /UNAUTHENTICATED|jwt expired|invalid token|token.*expired/i;

// The API answers these when the app's queries name what the database no longer has.
const OUTDATED_TEXT = [
	/Cannot query field "[^"]*" on type "[^"]*"/,
	/Field "[^"]*" is not defined by type "[^"]*"/,
	/Unknown argument "[^"]*"/,
	/Unknown type "[^"]*"/,
	/Value "[^"]*" does not exist in "[^"]*" enum/,
	/(column|relation) "[^"]*" (of relation "[^"]*" )?does not exist/,
];
const OUTDATED_CODES = new Set(['42703', '42P01', 'UNDEFINED_COLUMN', 'UNDEFINED_TABLE']);

const KINDS = new Set<string>(['unavailable', 'outdated', 'signed-out', 'network', 'other']);

const codeOf = (error: RequestError) => (typeof error.extensions?.code === 'string' ? error.extensions.code : '');
const statusOf = (error: RequestError) => error.extensions?.httpStatus;

/** First match wins, across all the errors of one response. */
export function failureKind(errors: readonly RequestError[]): FailureKind {
	// The tenant API answers ACCESS_SUSPENDED for a deleted or suspended database; a 403 without a body is a proxy's.
	if (errors.some((e) => codeOf(e) === 'ACCESS_SUSPENDED' || (statusOf(e) === 403 && (!codeOf(e) || codeOf(e) === 'HTTP_ERROR')))) {
		return 'unavailable';
	}
	if (errors.some((e) => statusOf(e) === 401 || codeOf(e) === 'UNAUTHENTICATED' || AUTH_ERROR.test(`${codeOf(e)} ${e.message ?? ''}`))) {
		return 'signed-out';
	}
	if (errors.some((e) => OUTDATED_CODES.has(codeOf(e)) || OUTDATED_TEXT.some((pattern) => pattern.test(e.message ?? '')))) {
		return 'outdated';
	}
	if (errors.some((e) => codeOf(e) === 'NETWORK')) return 'network';
	return 'other';
}

/** The sentence for a kind that has one; the others keep the server's text. */
export function failureMessage(kind: FailureKind): string | undefined {
	switch (kind) {
		case 'unavailable':
			return UNAVAILABLE_MESSAGE;
		case 'outdated':
			return OUTDATED_MESSAGE;
		case 'signed-out':
			return SESSION_EXPIRED_MESSAGE;
		default:
			return undefined;
	}
}

/** A failed request, thrown with its errors so callers can still read their codes. */
export class RequestFailure extends Error {
	kind: FailureKind;
	errors: RequestError[];
	userMessage?: string;

	constructor(errors: readonly RequestError[], fallback = 'Request failed.') {
		const kind = failureKind(errors);
		const userMessage = failureMessage(kind);
		const raw = errors
			.map((error) => error.message)
			.filter(Boolean)
			.join('; ');
		super(userMessage ?? (raw || fallback));
		this.name = 'RequestFailure';
		this.kind = kind;
		this.errors = [...errors];
		this.userMessage = userMessage;
	}
}

function errorsOf(error: unknown): RequestError[] | undefined {
	const errors = (error as { errors?: unknown } | null)?.errors;
	return Array.isArray(errors) ? (errors as RequestError[]) : undefined;
}

/** The kind of anything thrown: a RequestFailure, a source error, the ORM's GraphQLRequestError, or a plain Error. */
export function errorKind(error: unknown): FailureKind {
	const kind = (error as { kind?: unknown } | null)?.kind;
	if (typeof kind === 'string' && KINDS.has(kind)) return kind as FailureKind;
	const errors = errorsOf(error);
	if (errors) return failureKind(errors);
	return error instanceof Error ? failureKind([{ message: error.message }]) : 'other';
}

/** One sentence for a person, from anything a query or mutation threw. */
export function describeError(error: unknown, fallback = 'Something went wrong. Try again.'): string {
	const userMessage = (error as { userMessage?: unknown } | null)?.userMessage;
	if (typeof userMessage === 'string' && userMessage.trim()) return userMessage;
	const known = failureMessage(errorKind(error));
	if (known) return known;
	const errors = errorsOf(error);
	const raw = errors?.map((e) => e.message).filter(Boolean).join('; ');
	if (raw) return raw;
	if (error instanceof Error && error.message.trim()) return error.message;
	if (typeof error === 'string' && error.trim()) return error;
	return fallback;
}

/** Whether trying the same request again can help: not when the database, the app or the session is the problem. */
export function isRetryable(error: unknown): boolean {
	const kind = errorKind(error);
	return kind !== 'unavailable' && kind !== 'outdated' && kind !== 'signed-out';
}
