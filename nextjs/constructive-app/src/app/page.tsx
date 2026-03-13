'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthContext } from '@/lib/auth/auth-context';
import { LoginScreen } from '@/components/auth/screens/login-screen';

/**
 * Root page - entry point for authentication.
 * 
 * - Unauthenticated: Shows login screen
 * - Authenticated: Redirects to /getting-started
 */
export default function HomePage() {
	const [mounted, setMounted] = useState(false);
	const router = useRouter();
	const { isAuthenticated, isLoading: isAuthLoading, login } = useAuthContext();

	// Prevent hydration mismatch by only rendering auth-dependent content after mount
	useEffect(() => {
		setMounted(true);
	}, []);

	// Redirect to getting-started when authenticated
	useEffect(() => {
		if (mounted && !isAuthLoading && isAuthenticated) {
			router.replace('/getting-started');
		}
	}, [mounted, isAuthLoading, isAuthenticated, router]);

	// Show loading spinner until mounted and auth is ready
	if (!mounted || isAuthLoading) {
		return (
			<div className='bg-background flex h-dvh w-dvw items-center justify-center'>
				<div className='flex flex-col items-center gap-4'>
					<div className='border-primary/20 h-10 w-10 animate-spin rounded-full border-2 border-t-transparent' />
				</div>
			</div>
		);
	}

	// Show login screen for unauthenticated users
	if (!isAuthenticated) {
		return <LoginScreen onLogin={login} />;
	}

	// Show loading while redirecting
	return (
		<div className='bg-background flex h-dvh w-dvw items-center justify-center'>
			<div className='flex flex-col items-center gap-4'>
				<div className='border-primary/20 h-10 w-10 animate-spin rounded-full border-2 border-t-transparent' />
			</div>
		</div>
	);
}
