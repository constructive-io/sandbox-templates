'use client';

import { useRouter } from 'next/navigation';

import { signUp } from '@/lib/auth/auth-api';
import { SignUpPanel } from '@/components/ui/auth-pages';

export default function SignUpPage() {
	const router = useRouter();
	return (
		<SignUpPanel
			links={{ signIn: '/sign-in' }}
			onSubmit={async (values) => {
				const result = await signUp(values);
				if (result.ok) router.push(`/check-email?email=${encodeURIComponent(values.email)}`);
				return result;
			}}
		/>
	);
}
