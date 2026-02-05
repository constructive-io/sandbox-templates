/**
 * Authentication hooks
 *
 * Two separate implementations:
 * - Schema-builder: SDK-generated mutations (codegen'd from api.localhost)
 * - Dashboard: Manual GraphQL queries (dynamic schema per database)
 *
 * Components should import the specific hooks they need:
 *   import { useLoginSb } from '@/lib/gql/hooks/auth';        // Schema-builder pages
 *   import { useLoginDashboard } from '@/lib/gql/hooks/auth'; // Dashboard pages
 */

// ============================================================================
// Schema-builder hooks (SDK-based, for app-level auth)
// ============================================================================

export {
	useLoginSb,
	useRegisterSb,
	useLogoutSb,
	useExtendTokenSb,
	useForgotPasswordSb,
	useResetPasswordSb,
	useSendVerificationEmailSb,
	useVerifyEmailSb,
	useSubmitInviteCodeSb,
	useSubmitOrgInviteCodeSb,
} from './schema-builder';

// ============================================================================
// Dashboard hooks (manual queries, for per-database auth)
// ============================================================================

export {
	useLoginDashboard,
	useRegisterDashboard,
	useLogoutDashboard,
	useExtendTokenDashboard,
	useForgotPasswordDashboard,
	useResetPasswordDashboard,
	useSendVerificationEmailDashboard,
	useVerifyEmailDashboard,
} from './dashboard';

// ============================================================================
// Default exports for app-level pages (schema-builder context)
// ============================================================================

// These are the hooks used by /login, /register, /forgot-password, etc.
// They target the schema-builder endpoint
// TODO: will solely rely on the auth.<base> endpoint in the future
export { useLoginSb as useLogin } from './schema-builder';
export { useRegisterSb as useRegister } from './schema-builder';
export { useLogoutSb as useLogout } from './schema-builder';
export { useExtendTokenSb as useExtendToken } from './schema-builder';
export { useForgotPasswordSb as useForgotPassword } from './schema-builder';
export { useResetPasswordSb as useResetPassword } from './schema-builder';
export { useSendVerificationEmailSb as useSendVerificationEmail } from './schema-builder';
export { useVerifyEmailSb as useVerifyEmail } from './schema-builder';
export { useSubmitInviteCodeSb as useSubmitInviteCode } from './schema-builder';
export { useSubmitOrgInviteCodeSb as useSubmitOrgInviteCode } from './schema-builder';
