import type { ApiToken } from '@/store/auth-slice';
import type { SignInRecord, SignUpRecord } from '@sdk/api';

/**
 * Sign-in/sign-up result record type.
 * Uses SDK's SignInRecord as the canonical definition.
 * SignUpRecord has the same shape.
 */
export type AuthResultRecord = SignInRecord | SignUpRecord;

/**
 * Convert sign-in/sign-up result to ApiToken.
 * Works with both SDK types (SignInRecord, SignUpRecord) and dashboard responses.
 *
 * Returns null if required fields are missing.
 */
export function toApiToken(record: AuthResultRecord | null | undefined): ApiToken | null {
	if (!record?.accessToken || !record?.accessTokenExpiresAt || !record?.id || !record?.userId) {
		return null;
	}

	return {
		id: record.id,
		userId: record.userId,
		accessToken: record.accessToken,
		accessTokenExpiresAt: record.accessTokenExpiresAt,
	};
}
