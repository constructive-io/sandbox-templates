'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { CheckEmailPanel } from '@/components/ui/auth-pages';

function CheckEmail() {
	const params = useSearchParams();
	return <CheckEmailPanel email={params.get('email') ?? undefined} links={{ signIn: '/sign-in' }} />;
}

export default function CheckEmailPage() {
	return (
		<Suspense>
			<CheckEmail />
		</Suspense>
	);
}
