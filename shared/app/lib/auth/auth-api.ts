// Sign-in, sign-up and recovery against the tenant's auth endpoint.
//
// These operations are the same on every Constructive database, so they are
// written as plain documents and work before codegen has run. Sign-up never
// signs anyone in: the tenant mails a verification link, then the user signs
// in with their password.

import { runtimeConfig } from '../runtime/config';
import { failureKind, UNAVAILABLE_MESSAGE } from '../graphql/errors';
import { graphqlRequest, type GraphQLError } from '../graphql/request';
import { TokenManager } from './token-manager';

export type AuthResult = { ok: true } | { ok: false; message: string };

export type CurrentUser = { id: string; username: string | null; displayName: string | null; email: string | null };

const MESSAGES: Record<string, string> = {
	INCORRECT_PASSWORD: 'Invalid email or password.',
	INVALID_CREDENTIALS: 'Invalid email or password.',
	ACCOUNT_LOCKED_EXCEED_ATTEMPTS: 'Too many failed attempts. Try again later or reset your password.',
	ACCOUNT_DISABLED: 'This account is disabled.',
	EMAIL_NOT_VERIFIED: 'Confirm your email first: open the link we emailed you, then sign in.',
	ACCOUNT_EXISTS: 'An account with this email already exists. Sign in instead.',
	PASSWORD_INSECURE: 'Choose a stronger password.',
	PASSWORD_LEN: 'Passwords must be 8 to 63 characters long.',
	NETWORK: 'Could not reach the server. Check that the backend is running.',
};

function failed(errors: GraphQLError[], fallback: string): AuthResult {
	// A deleted or suspended database answers every request this way, sign-in included.
	if (failureKind(errors) === 'unavailable') return { ok: false, message: UNAVAILABLE_MESSAGE };
	for (const error of errors) {
		const code = typeof error.extensions?.code === 'string' ? error.extensions.code : '';
		const known = MESSAGES[code] ?? Object.entries(MESSAGES).find(([key]) => error.message.includes(key))?.[1];
		if (known) return { ok: false, message: known };
	}
	return { ok: false, message: errors[0]?.message || fallback };
}

function authRequest<T>(query: string, variables?: Record<string, unknown>, auth = false) {
	return graphqlRequest<T>(runtimeConfig.authEndpoint, query, variables, { auth });
}

const SIGN_IN = `mutation SignIn($input: SignInInput!) {
	signIn(input: $input) {
		result { id userId accessToken accessTokenExpiresAt mfaRequired deviceApprovalRequired outDeviceToken }
	}
}`;

const REQUEST_DEVICE_APPROVAL = `mutation RequestDeviceApproval($input: RequestDeviceApprovalInput!) {
	requestDeviceApproval(input: $input) { result }
}`;

type SignInRecord = {
	id: string | null;
	userId: string | null;
	accessToken: string | null;
	accessTokenExpiresAt: string | null;
	mfaRequired: boolean | null;
	deviceApprovalRequired: boolean | null;
	outDeviceToken: string | null;
};

export const MFA_REQUIRED_MESSAGE =
	'Your password is correct, but this account needs a second sign-in step that this app does not support yet. You are not signed in.';
export const DEVICE_APPROVAL_MESSAGE =
	'Your password is correct, but this device must be approved first. We emailed you a link: open it on this device, approve it, then sign in again.';

// The tenant recognizes this browser by the token it handed out on an earlier sign-in, so an
// approved device stays approved. Without it every sign-in looks like a new device.
export const DEVICE_TOKEN_KEY = 'constructive-device-token:admin';

function deviceStorage(): Pick<Storage, 'getItem' | 'setItem'> | null {
	if (typeof window === 'undefined') return null;
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}

export async function signIn(input: { email: string; password: string; rememberMe: boolean }): Promise<AuthResult> {
	const storage = deviceStorage();
	const deviceToken = storage?.getItem(DEVICE_TOKEN_KEY) || undefined;
	const result = await authRequest<{ signIn: { result: SignInRecord | null } | null }>(SIGN_IN, {
		input: { ...input, deviceToken },
	});
	if (!result.ok) return failed(result.errors, 'Sign-in failed.');
	const record = result.data.signIn?.result;
	if (record?.outDeviceToken) storage?.setItem(DEVICE_TOKEN_KEY, record.outDeviceToken);
	// A challenge answers a correct password with no token; nothing is stored until it is met.
	if (record?.mfaRequired) return { ok: false, message: MFA_REQUIRED_MESSAGE };
	if (record?.deviceApprovalRequired) {
		const device = record.outDeviceToken ?? deviceToken;
		if (!record.userId || !device) return failed([], 'Sign-in failed.');
		const next = typeof window === 'undefined' ? undefined : window.location.pathname + window.location.search;
		const requested = await authRequest(REQUEST_DEVICE_APPROVAL, {
			input: { userId: record.userId, deviceToken: device, next },
		});
		if (!requested.ok) return failed(requested.errors, 'Could not send the device approval email.');
		return { ok: false, message: DEVICE_APPROVAL_MESSAGE };
	}
	if (!record?.accessToken || !record.accessTokenExpiresAt) return { ok: false, message: MESSAGES.INVALID_CREDENTIALS };
	TokenManager.write(
		{
			id: record.id ?? '',
			userId: record.userId ?? record.id ?? '',
			accessToken: record.accessToken,
			accessTokenExpiresAt: record.accessTokenExpiresAt,
		},
		input.rememberMe,
	);
	return { ok: true };
}

const SIGN_UP = `mutation SignUp($input: SignUpInput!) { signUp(input: $input) { clientMutationId } }`;

export async function signUp(input: { email: string; password: string }): Promise<AuthResult> {
	const result = await authRequest(SIGN_UP, { input });
	if (!result.ok) return failed(result.errors, 'Sign-up failed.');
	TokenManager.clear();
	return { ok: true };
}

const VERIFY_EMAIL = `mutation VerifyEmail($input: VerifyEmailInput!) { verifyEmail(input: $input) { result } }`;

// The link proves the inbox; the password chosen at sign-up proves the person.
// The backend turns a sign-up's pending password on only when both match, and
// answers a wrong password the same false as a dead link.
export async function verifyEmail(input: { emailId: string; token: string; password: string }): Promise<AuthResult> {
	const result = await authRequest<{ verifyEmail: { result: boolean | null } | null }>(VERIFY_EMAIL, { input });
	if (!result.ok) return failed(result.errors, 'Verification failed.');
	return result.data.verifyEmail?.result
		? { ok: true }
		: { ok: false, message: 'This link is invalid or has expired.' };
}

const FORGOT_PASSWORD = `mutation ForgotPassword($input: ForgotPasswordInput!) { forgotPassword(input: $input) { clientMutationId } }`;

export async function forgotPassword(input: { email: string }): Promise<AuthResult> {
	const result = await authRequest(FORGOT_PASSWORD, { input });
	return result.ok ? { ok: true } : failed(result.errors, 'Could not send the reset email.');
}

const RESET_PASSWORD = `mutation ResetPassword($input: ResetPasswordInput!) { resetPassword(input: $input) { result } }`;

export async function resetPassword(input: { roleId: string; resetToken: string; newPassword: string }): Promise<AuthResult> {
	const result = await authRequest<{ resetPassword: { result: boolean | null } | null }>(RESET_PASSWORD, { input });
	if (!result.ok) return failed(result.errors, 'Could not reset the password.');
	return result.data.resetPassword?.result
		? { ok: true }
		: { ok: false, message: 'This reset link is invalid or has expired.' };
}

const SIGN_OUT = `mutation SignOut($input: SignOutInput!) { signOut(input: $input) { clientMutationId } }`;

/** Ends the server session when it can; the local token goes either way. */
export async function signOut(): Promise<void> {
	await authRequest(SIGN_OUT, { input: {} }, true).catch(() => undefined);
	TokenManager.clear();
}

type UserRow = { id: string; username: string | null; displayName: string | null };

// The user's own emails, primary first. Only the user's rows are readable.
const CURRENT_ACCOUNT = `query CurrentAccount {
	currentUser { id username displayName }
	emails(first: 5, orderBy: [IS_PRIMARY_DESC, CREATED_AT_ASC]) { nodes { email ownerId } }
}`;
const CURRENT_USER = `query CurrentUser { currentUser { id username displayName } }`;

/** The signed-in user and their primary email, from the auth plane. */
export async function fetchCurrentUser(): Promise<CurrentUser | null> {
	const account = await authRequest<{
		currentUser: UserRow | null;
		emails: { nodes: Array<{ email: string; ownerId: string }> } | null;
	}>(CURRENT_ACCOUNT, undefined, true);
	if (account.ok) {
		const user = account.data.currentUser;
		if (!user) return null;
		const email = account.data.emails?.nodes.find((row) => row.ownerId === user.id)?.email ?? null;
		return { ...user, email };
	}
	// An auth schema without the email ordering still has the user.
	const result = await authRequest<{ currentUser: UserRow | null }>(CURRENT_USER, undefined, true);
	return result.ok && result.data.currentUser ? { ...result.data.currentUser, email: null } : null;
}
