'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { signIn } from '@/lib/auth/auth-api';
import { nextPath } from '@/lib/auth/next-path';
import { SignInPanel } from '@/components/ui/auth-pages';

function SignIn() {
	const router = useRouter();
	const params = useSearchParams();
	const notice = params.get('reset')
		? ({ tone: 'success', message: 'Password updated. Sign in with your new password.' } as const)
		: undefined;
	return (
		<SignInPanel
			notice={notice}
			defaultEmail={params.get('email') ?? undefined}
			links={{ signUp: '/sign-up', forgotPassword: '/forgot-password' }}
			onSubmit={async (values) => {
				const result = await signIn(values);
				if (result.ok) router.replace(nextPath(params.get('next')));
				return result;
			}}
		/>
	);
}

export default function SignInPage() {
	return (
		<Suspense>
			<SignIn />
		</Suspense>
	);
}
