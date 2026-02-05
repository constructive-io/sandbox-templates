'use client';

import { useRegisterDashboard } from '@/lib/gql/hooks/auth';
import { RegisterFormView } from './register-form-view';

interface DashboardRegisterFormProps {
	onShowLogin?: () => void;
}

/**
 * Dashboard-specific register form
 * Uses dashboard register hook for per-database registration (Tier 2)
 */
export function DashboardRegisterForm({ onShowLogin }: DashboardRegisterFormProps) {
	const registerMutation = useRegisterDashboard();

	return <RegisterFormView onRegister={(data) => registerMutation.mutateAsync(data)} onShowLogin={onShowLogin} />;
}
