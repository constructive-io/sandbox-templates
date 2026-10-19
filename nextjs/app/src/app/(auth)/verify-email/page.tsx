'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { verifyEmail } from '@/lib/auth/auth-api';
import { useSession } from '@/lib/auth/session';
import { VerifyEmailPanel } from '@/components/ui/auth-pages';

function VerifyEmail() {
	const params = useSearchParams();
	const session = useSession();
	const emailId = params.get('email_id');
	const token = params.get('verification_token');
	return (
		<VerifyEmailPanel
			links={{ signIn: '/sign-in', continue: session.status === 'authenticated' ? '/' : '/sign-in' }}
			onVerify={() =>
				emailId && token
					? verifyEmail({ emailId, token })
					: { ok: false, message: 'This verification link is incomplete. Open the link from the email again.' }
			}
		/>
	);
}

export default function VerifyEmailPage() {
	return (
		<Suspense>
			<VerifyEmail />
		</Suspense>
	);
}
