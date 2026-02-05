'use client';

import { useResetPasswordDashboard } from '@/lib/gql/hooks/auth';
import { ResetPasswordFormView } from './reset-password-form-view';

interface DashboardResetPasswordFormProps {
	resetToken: string;
	roleId?: string;
	onShowLogin?: () => void;
}

/**
 * Dashboard-specific reset password form
 * Uses dashboard reset password hook for per-database password reset (Tier 2)
 */
export function DashboardResetPasswordForm({ resetToken, roleId, onShowLogin }: DashboardResetPasswordFormProps) {
	const resetPasswordMutation = useResetPasswordDashboard();

	return (
		<ResetPasswordFormView
			resetToken={resetToken}
			roleId={roleId}
			onResetPassword={(input) => resetPasswordMutation.mutateAsync(input)}
			onShowLogin={onShowLogin}
		/>
	);
}
