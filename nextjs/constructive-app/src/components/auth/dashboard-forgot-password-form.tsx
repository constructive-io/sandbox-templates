'use client';

import { useForgotPasswordDashboard } from '@/lib/gql/hooks/auth';
import { ForgotPasswordFormView } from './forgot-password-form-view';

interface DashboardForgotPasswordFormProps {
	onShowLogin?: () => void;
}

/**
 * Dashboard-specific forgot password form
 * Uses dashboard forgot password hook for per-database password reset (Tier 2)
 */
export function DashboardForgotPasswordForm({ onShowLogin }: DashboardForgotPasswordFormProps) {
	const forgotPasswordMutation = useForgotPasswordDashboard();

	return (
		<ForgotPasswordFormView
			onForgotPassword={(data) => forgotPasswordMutation.mutateAsync(data)}
			onShowLogin={onShowLogin}
		/>
	);
}
