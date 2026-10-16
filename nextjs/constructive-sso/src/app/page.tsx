'use client';

import React from 'react';
import { Rocket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getDbName, getSSOGatewayOrigin } from '@/app-config';
import { useAuthContext } from '@/lib/auth/auth-context';

/**
 * Home Page - Start Building Here
 *
 * Replace this page with your business logic.
 */
export default function HomePage() {
	const { isAuthenticated, isLoading: isAuthLoading } = useAuthContext();

	// Prevent hydration mismatch: auth state resolves on the client after
	// useEffect runs, so the server always sees isLoading=true while the
	// client may already have a resolved state. Render the same loading UI
	// on both server and first client paint, then switch after mount.
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => setMounted(true), []);

	// Loop guard: a sign-in trip that comes back still signed out means the
	// gateway's session cookie never reached this origin — the gateway and
	// the app are on different cookie hosts (localhost:3000 vs
	// myapp.localhost, say) and the tenant sets no cookie_domain to bridge
	// them. Bouncing again would loop forever between this page and the
	// gateway's /login, so the second trip is answered with the diagnosis
	// instead. The outbound trip marks this tab (sessionStorage survives the
	// hard navigation to the gateway and back; the gateway's own redirect
	// carries no marker we could read).
	const [loginLoop] = React.useState(() => {
		if (typeof window === 'undefined') return false;
		try {
			return window.sessionStorage.getItem('sent-to-login') === '1';
		} catch {
			return false;
		}
	});

	let dbName = 'your-db';
	try {
		dbName = getDbName();
	} catch {
		// DB name not configured yet
	}

	// Sign-in is owned by the platform's mantra page set — unauthenticated
	// visitors go STRAIGHT to the gateway's sign-in page. `next` is the gateway
	// root '/': the app-origin redirect row there (ensure-site step 7) turns the
	// post-auth landing into an instant 302 back into this app — password submit
	// ends up in myapp with no intermediate click.
	//
	// The trip is a hard navigation fired from an effect, NOT redirect():
	// next/navigation's redirect is for routes THIS app owns, and a cross-origin
	// URL cast to Route makes the client router render the not-found boundary —
	// the post-SSO landing 404'd until the user refreshed. While the state is
	// unresolved (or resolved-unauthenticated, one frame before the browser
	// leaves) the loading shell below is what renders.
	React.useEffect(() => {
		if (!mounted || isAuthLoading) return;
		if (!isAuthenticated && !loginLoop) {
			try {
				window.sessionStorage.setItem('sent-to-login', '1');
			} catch {
				// A storage-less browser degrades to the old bounce — never
				// blocks the sign-in trip itself.
			}
			window.location.replace(`${getSSOGatewayOrigin()}/login?next=%2F`);
		}
	}, [mounted, isAuthLoading, isAuthenticated, loginLoop]);

	if (mounted && !isAuthLoading && !isAuthenticated && loginLoop) {
		return (
			<div className='bg-background flex h-dvh w-dvw items-center justify-center p-6'>
				<div className='max-w-md space-y-3 text-center'>
					<h1 className='text-foreground text-lg font-semibold'>Signed in, but not here</h1>
					<p className='text-muted-foreground text-sm'>
						The sign-in page sent you back still signed out: its session cookie lives on another
						host than this app, so this app can never read it. This is a deployment mismatch, not
						a bad login — set the gateway and the app on one cookie host (both{' '}
						<code>localhost</code>) and provision the tenant again.
					</p>
					<button
						type='button'
						className='text-primary text-sm underline underline-offset-4'
						onClick={() => {
							try {
								window.sessionStorage.removeItem('sent-to-login');
							} catch {
								// storage-less tab: a reload re-runs the trip either way
							}
							window.location.reload();
						}}
					>
						Try again
					</button>
				</div>
			</div>
		);
	}

	// Show loading until client-side auth state is resolved (and for the one
	// frame an unauthenticated visitor waits out the navigation above).
	if (!mounted || isAuthLoading || !isAuthenticated) {
		return (
			<div className='bg-background flex h-dvh w-dvw items-center justify-center'>
				<div className='border-primary/20 h-10 w-10 animate-spin rounded-full border-2 border-t-transparent' />
			</div>
		);
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
									<span className="text-green-600 w-24">@sdk/auth</span>
									<span className="text-muted-foreground">users, authentication</span>
								</div>
								<div className="flex gap-2">
									<span className="text-purple-600 w-24">@sdk/admin</span>
									<span className="text-muted-foreground">organizations, members</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
