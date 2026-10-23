'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { resetPassword } from '@/lib/auth/auth-api';
import { ResetPasswordPanel } from '@/components/ui/auth-pages';

function ResetPassword() {
	const router = useRouter();
	const params = useSearchParams();
	const roleId = params.get('role_id');
	const resetToken = params.get('reset_token');
	return (
		<ResetPasswordPanel
			links={{ signIn: '/sign-in' }}
			onSubmit={async ({ password }) => {
				if (!roleId || !resetToken) {
					return { ok: false, message: 'This reset link is incomplete. Open the link from the email again.' };
				}
				const result = await resetPassword({ roleId, resetToken, newPassword: password });
				if (result.ok) router.replace('/sign-in?reset=1');
				return result;
			}}
		/>
	);
}

export default function ResetPasswordPage() {
	return (
		<Suspense>
			<ResetPassword />
		</Suspense>
	);
}
