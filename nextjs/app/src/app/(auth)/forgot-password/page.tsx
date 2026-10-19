'use client';

import { forgotPassword } from '@/lib/auth/auth-api';
import { ForgotPasswordPanel } from '@/components/ui/auth-pages';

export default function ForgotPasswordPage() {
	return <ForgotPasswordPanel links={{ signIn: '/sign-in' }} onSubmit={forgotPassword} />;
}
