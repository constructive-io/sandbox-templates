/**
 * Dashboard auth hooks
 *
 * These hooks use manual GraphQL queries that target the dashboard endpoint.
 * The schema is dynamic per database, so we can't use SDK-generated hooks.
 * Tokens are scoped by databaseId.
 */

export { useLoginDashboard } from './use-login-dashboard';
export { useRegisterDashboard } from './use-register-dashboard';
export { useLogoutDashboard } from './use-logout-dashboard';
export { useExtendTokenDashboard } from './use-extend-token-dashboard';
export { useForgotPasswordDashboard } from './use-forgot-password-dashboard';
export { useResetPasswordDashboard } from './use-reset-password-dashboard';
export { useSendVerificationEmailDashboard } from './use-send-verification-email-dashboard';
export { useVerifyEmailDashboard } from './use-verify-email-dashboard';

// Re-export types
export type {
	SignInInput,
	SignUpInput,
	ResetPasswordInput,
	VerifyEmailInput,
	AuthResultRecord,
} from './auth-types';

// Re-export token utility
export { toApiToken } from './auth-types';
