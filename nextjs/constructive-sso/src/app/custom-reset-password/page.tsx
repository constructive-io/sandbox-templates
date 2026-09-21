'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { ResetPasswordCard } from '@/blocks/auth/reset-password-card/reset-password-card';
import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';

/**
 * /custom-reset-password — spend a recovery token through the
 * `auth_flows:reset_password` sync lane via the BFF. Reads `role_id` and
 * `reset_token` from the query string — the same params the recovery email
 * appends to `/reset-password` (email:send_recovery_link). A `reset:false`
 * answer covers wrong, spent and lapsed tokens identically, by design.
 */
function CustomResetPasswordContent() {
	return (
		<AuthScreenLayout>
			<ResetPasswordCard
				forgotPasswordPath='/custom-forgot-password'
				signInPath='/custom-login'
				onSubmit={async (vars) => {
					const res = await fetch('/api/custom-auth/reset-password', {
						method: 'POST',
						credentials: 'include',
						headers: { 'content-type': 'application/json' },
						body: JSON.stringify({
							roleId: vars.roleId,
							resetToken: vars.resetToken,
							newPassword: vars.newPassword
						})
					});
					const data = (await res.json()) as { reset?: boolean; error?: string };
					if (!res.ok || data.error) throw new Error(data.error ?? 'RESET_PASSWORD_FAILED');
					return Boolean(data.reset);
				}}
			/>
		</AuthScreenLayout>
	);
}

export default function CustomResetPasswordPage() {
	return (
		<Suspense fallback={null}>
			<CustomResetPasswordContent />
		</Suspense>
	);
}
