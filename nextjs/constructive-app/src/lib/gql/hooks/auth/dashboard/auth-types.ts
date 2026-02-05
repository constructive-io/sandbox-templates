/**
 * Type definitions for dashboard auth mutations.
 *
 * Dashboard auth works against dynamic database endpoints, so we use manual
 * GraphQL queries rather than SDK-generated hooks.
 *
 * Where possible, we reuse types from the SDK (schema-types.ts) to avoid duplication.
 * The SDK types are the source of truth for the auth schema.
 */

import type { SignInRecord } from '@sdk/auth';

// Re-export shared utilities and types
export { toApiToken } from '@/lib/auth/token-utils';
export type { ApiToken } from '@/store/auth-slice';

// Use SDK's SignInRecord as the canonical auth result type
// SignUpRecord has the same shape
export type { SignInRecord as AuthResultRecord } from '@sdk/auth';

// Local alias for use within this file
type AuthResultRecord = SignInRecord;

// ============================================================================
// Generic Helper
// ============================================================================

export type MutationVariables<TInput> = { input: TInput };

// ============================================================================
// ExtendTokenExpires Response (new schema - Jan 2025)
// ============================================================================

/**
 * ExtendTokenExpires apiToken response (new schema)
 * Note: accessToken is now accessTokenHash - we cannot get the actual token
 */
export interface ExtendTokenApiTokenResponse {
	id: string;
	userId: string;
	accessTokenHash?: string | null;
	accessTokenExpiresAt?: string | null;
	isVerified?: boolean | null;
	totpEnabled?: boolean | null;
}

// ============================================================================
// SignIn Mutation
// ============================================================================

export interface SignInInput {
	email: string;
	password: string;
	rememberMe?: boolean;
}

export type SignInMutationVariables = MutationVariables<SignInInput>;

export interface SignInMutationResult {
	signIn?: {
		result?: AuthResultRecord | null;
		clientMutationId?: string | null;
	} | null;
}

// ============================================================================
// SignUp Mutation
// ============================================================================

export interface SignUpInput {
	email: string;
	password: string;
	rememberMe?: boolean;
}

export type SignUpMutationVariables = MutationVariables<SignUpInput>;

export interface SignUpMutationResult {
	signUp?: {
		result?: AuthResultRecord | null;
	} | null;
}

// ============================================================================
// Extend Token Expires Mutation
// ============================================================================

export interface ExtendTokenExpiresInput {
	amount?: { hours?: number; minutes?: number; days?: number } | null;
}

export type ExtendTokenExpiresMutationVariables = MutationVariables<ExtendTokenExpiresInput>;

export interface ExtendTokenExpiresMutationResult {
	extendTokenExpires?: {
		apiToken?: ExtendTokenApiTokenResponse | null;
	} | null;
}

// ============================================================================
// SignOut Mutation
// ============================================================================

export interface SignOutInput {
	clientMutationId?: string | null;
}

export type SignOutMutationVariables = MutationVariables<SignOutInput>;

export interface SignOutMutationResult {
	signOut?: {
		clientMutationId?: string | null;
	} | null;
}

// ============================================================================
// Forgot Password Mutation
// ============================================================================

export interface ForgotPasswordInput {
	email: string;
}

export type ForgotPasswordMutationVariables = MutationVariables<ForgotPasswordInput>;

export interface ForgotPasswordMutationResult {
	forgotPassword?: {
		clientMutationId?: string | null;
	} | null;
}

// ============================================================================
// Reset Password Mutation
// ============================================================================

export interface ResetPasswordInput {
	newPassword: string;
	resetToken: string;
	roleId?: string;
}

export type ResetPasswordMutationVariables = MutationVariables<ResetPasswordInput>;

export interface ResetPasswordMutationResult {
	resetPassword?: {
		boolean?: boolean | null;
		clientMutationId?: string | null;
	} | null;
}

// ============================================================================
// Verify Email Mutation
// ============================================================================

export interface VerifyEmailInput {
	emailId: string;
	token: string;
}

export type VerifyEmailMutationVariables = MutationVariables<VerifyEmailInput>;

export interface VerifyEmailMutationResult {
	verifyEmail?: {
		boolean?: boolean | null;
		clientMutationId?: string | null;
	} | null;
}

// ============================================================================
// Send Verification Email Mutation
// ============================================================================

export interface SendVerificationEmailInput {
	email?: string | null;
}

export type SendVerificationEmailMutationVariables = MutationVariables<SendVerificationEmailInput>;

export interface SendVerificationEmailMutationResult {
	sendVerificationEmail?: {
		boolean?: boolean | null;
		clientMutationId?: string | null;
	} | null;
}
