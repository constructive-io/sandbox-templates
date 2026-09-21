'use client';

import { Suspense } from 'react';

import { ForgotPasswordCard } from '@/blocks/auth/forgot-password-card/forgot-password-card';
import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';

/**
 * /custom-forgot-password — the custom-UI recovery request, through the
 * `auth_flows:forgot_password` sync lane via the BFF. The lane always answers
 * `requested:true` (an unknown mailbox is indistinguishable by design), so
 * success copy makes no claims about whether the address exists.
 *
 * The recovery EMAIL still points at the mantra `/reset-password` page —
 * changing that requires upstream configurability — so a full custom round
 * trip is: request here, spend on the mantra reset page.
 */
function CustomForgotPasswordContent() {
	return (
		<AuthScreenLayout>
			<ForgotPasswordCard
				signInHref='/custom-login'
				onSubmit={async (vars) => {
					const res = await fetch('/api/custom-auth/forgot-password', {
						method: 'POST',
						credentials: 'include',
						headers: { 'content-type': 'application/json' },
						body: JSON.stringify({ email: vars.email })
					});
					const data = (await res.json()) as { requested?: boolean; error?: string };
					if (!res.ok || data.error) throw new Error(data.error ?? 'FORGOT_PASSWORD_FAILED');
				}}
			/>
		</AuthScreenLayout>
	);
}

export default function CustomForgotPasswordPage() {
	return (
		<Suspense fallback={null}>
			<CustomForgotPasswordContent />
		</Suspense>
	);
}
