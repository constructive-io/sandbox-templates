'use client';

import { useLoginDashboard } from '@/lib/gql/hooks/auth';
import { LoginFormView } from './login-form-view';

interface DashboardLoginFormProps {
	onShowForgot?: () => void;
	onShowRegister?: () => void;
}

/**
 * Dashboard-specific login form
 * Uses dashboard login hook directly for per-database authentication (Tier 2)
 */
export function DashboardLoginForm({ onShowForgot, onShowRegister }: DashboardLoginFormProps) {
	const loginMutation = useLoginDashboard();

	const handleLogin = async (credentials: Parameters<typeof loginMutation.mutateAsync>[0]) => {
		await loginMutation.mutateAsync(credentials);
	};

	return <LoginFormView onLogin={handleLogin} onShowForgot={onShowForgot} onShowRegister={onShowRegister} />;
}
