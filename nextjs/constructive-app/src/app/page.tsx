'use client';

import { useEffect, useState } from 'react';
import { Rocket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getDbName } from '@/app-config';
import { useAuthContext } from '@/lib/auth/auth-context';
import { LoginScreen } from '@/components/auth/screens/login-screen';

/**
 * Home Page - Start Building Here
 * 
 * Replace this page with your business logic.
 */
export default function HomePage() {
	const [mounted, setMounted] = useState(false);
	const { isAuthenticated, isLoading: isAuthLoading, login } = useAuthContext();

	useEffect(() => {
		setMounted(true);
	}, []);

	let dbName = 'your-db';
	try {
		dbName = getDbName();
	} catch {
		// DB name not configured yet
	}

	// Loading state
	if (!mounted || isAuthLoading) {
		return (
			<div className='bg-background flex h-dvh w-dvw items-center justify-center'>
				<div className='border-primary/20 h-10 w-10 animate-spin rounded-full border-2 border-t-transparent' />
			</div>
		);
	}

	// Login screen for unauthenticated users
	if (!isAuthenticated) {
		return <LoginScreen onLogin={login} />;
	}

	// =========================================================================
	// START BUILDING HERE - Replace this with your app
	// =========================================================================

	return (
		<div className="h-full overflow-y-auto">
			<div className="mx-auto max-w-2xl px-6 py-16">
				<div className="text-center space-y-6">
					<div className="flex justify-center">
						<div className="rounded-full bg-primary/10 p-4">
							<Rocket className="h-10 w-10 text-primary" />
						</div>
					</div>
					
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Start Building Here</h1>
						<p className="text-muted-foreground mt-2">
							Edit <code className="text-primary bg-muted px-1.5 py-0.5 rounded text-sm">src/app/page.tsx</code> to build your app
						</p>
					</div>

					<Card className="text-left">
						<CardContent className="pt-6 space-y-4">
							<div className="flex items-center gap-3">
								<span className="text-muted-foreground text-sm">Database:</span>
								<code className="text-sm font-medium">{dbName}</code>
							</div>
							<div className="border-t pt-4 space-y-2 font-mono text-xs">
								<div className="flex gap-2">
									<span className="text-blue-600 w-24">@sdk/admin</span>
									<span className="text-muted-foreground">orgs, members, permissions</span>
								</div>
								<div className="flex gap-2">
									<span className="text-green-600 w-24">@sdk/auth</span>
									<span className="text-muted-foreground">users, authentication</span>
								</div>
								<div className="flex gap-2">
									<span className="text-purple-600 w-24">@sdk/app</span>
									<span className="text-muted-foreground">your business data</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
