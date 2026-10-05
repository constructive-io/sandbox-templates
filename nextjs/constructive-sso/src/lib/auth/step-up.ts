/**
 * Step-up: re-verifying a signed-in session before a sensitive write.
 *
 * A guarded write (an org delete, for one) is refused by the tenant with
 * `STEP_UP_REQUIRED_<KIND>` until the session proves itself again within the
 * tenant's step-up window. A texted or emailed code proves `mfa`, and `mfa` also
 * satisfies `password_or_mfa` and `fresh_auth`; `password` alone needs the
 * password re-entered, which this lane does not do.
 */

/** The refusals a step-up code can answer. */
const CODE_SATISFIES = new Set([
	'STEP_UP_REQUIRED_MFA',
	'STEP_UP_REQUIRED_PASSWORD_OR_MFA',
	'STEP_UP_REQUIRED_FRESH_AUTH',
]);

const STEP_UP_CODE = /\bSTEP_UP_REQUIRED_[A-Z_]+\b/;

/** The `STEP_UP_REQUIRED_*` code an error carries, if any. */
export function stepUpRefusalOf(error: unknown): string | null {
	if (!error || typeof error !== 'object') return null;
	// GraphQLRequestError keeps the tenant's errors; their message IS the code.
	const errors = (error as { errors?: Array<{ message?: string; extensions?: { code?: unknown } }> }).errors;
	if (Array.isArray(errors)) {
		for (const entry of errors) {
			const candidate =
				typeof entry.extensions?.code === 'string' ? entry.extensions.code : (entry.message ?? '');
			const match = STEP_UP_CODE.exec(candidate);
			if (match) return match[0];
		}
	}
	const message = (error as { message?: unknown }).message;
	return typeof message === 'string' ? (STEP_UP_CODE.exec(message)?.[0] ?? null) : null;
}

/** Whether a step-up code can clear this error. */
export function isCodeStepUp(error: unknown): boolean {
	const refusal = stepUpRefusalOf(error);
	return refusal !== null && CODE_SATISFIES.has(refusal);
}

/** A refusal from the step-up lane, carrying the tenant's own code. */
export class StepUpError extends Error {
	constructor(readonly code: string) {
		super(code);
		this.name = 'StepUpError';
	}
}

async function post<T>(path: string, body: unknown): Promise<T> {
	const response = await fetch(path, {
		method: 'POST',
		credentials: 'include',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
	});
	const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
	if (!response.ok) {
		throw new StepUpError(payload.error ?? `HTTP_${response.status}`);
	}
	return payload;
}

/** Which of the caller's verified identifiers the code goes to. */
export type StepUpMethod = 'sms' | 'email';

/** Send the signed-in caller a step-up code by text (default) or email. */
export async function sendStepUpCode(method: StepUpMethod = 'sms'): Promise<void> {
	const { sent } = await post<{ sent: boolean }>('/api/auth/step-up/send', { method });
	if (!sent) throw new StepUpError('STEP_UP_CODE_NOT_SENT');
}

/** Spend the code; `false` is a wrong or lapsed code, never an error. */
export async function verifyStepUpCode(code: string): Promise<boolean> {
	const { verified } = await post<{ verified: boolean }>('/api/auth/step-up/verify', { code });
	return verified === true;
}
