'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { SignInCard, type SignInResult } from '@/blocks/auth/sign-in-card/sign-in-card';
import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';

/**
 * /auth/custom-complete — the landing the sso return leg always points at.
 *
 * Two shapes arrive here:
 *   • A signed-in browser (the sso:callback page set the session cookie and
 *     redirected with no ticket) — forward to `next` with a FULL navigation
 *     so the auth store re-hydrates from the cookie.
 *   • A browser carrying `?link_ticket=…` and NO session: the provider proved
 *     control of a mailbox that already belongs to an account, and the
 *     platform refused to sign in without that account's consent. The owner
 *     signs in below (password, milestone 1); only then can the BFF spend the
 *     ticket — /api/sso/link is authenticated, verifies the session owns the
 *     ticket's email, and may answer STEP_UP_REQUIRED, which we surface as-is
 *     rather than trying to self-elevate.
 */
function CustomCompleteContent() {
	const searchParams = useSearchParams();
	const nextPath = toLocalPath(searchParams.get('next'));
	const ticket = searchParams.get('link_ticket');
	const [linkNotice, setLinkNotice] = useState<string | null>(null);

	// No ticket: the session cookie is already on the browser — go.
	useEffect(() => {
		if (!ticket) {
			window.location.assign(nextPath);
		}
	}, [ticket, nextPath]);

	if (!ticket) {
		return (
			<div className='bg-background flex h-dvh w-dvw items-center justify-center'>
				<div className='border-primary/20 h-10 w-10 animate-spin rounded-full border-2 border-t-transparent' />
			</div>
		);
	}

	return (
		<AuthScreenLayout>
			<div className='mb-4 w-full max-w-sm mx-auto text-center space-y-2'>
				<h1 className='text-foreground text-lg font-semibold'>Connect your sign-in</h1>
				<p className='text-muted-foreground text-sm'>
					An account already uses this address. Sign in with your password to
					connect it to your provider sign-in.
				</p>
			</div>
			{linkNotice && (
				<p className='text-muted-foreground mb-3 max-w-sm mx-auto text-center text-sm' role='status'>
					{linkNotice}
				</p>
			)}
			<SignInCard
				forgotPasswordHref='/custom-forgot-password'
				onSubmit={async (vars): Promise<SignInResult | null> => {
					setLinkNotice(null);
					const res = await fetch('/api/custom-auth/sign-in', {
						method: 'POST',
						credentials: 'include',
						headers: { 'content-type': 'application/json' },
						body: JSON.stringify({
							email: vars.email,
							password: vars.password,
							rememberMe: vars.rememberMe
						})
					});
					const data = (await res.json()) as { signedIn?: boolean; mfaRequired?: boolean; error?: string };
					if (data.mfaRequired) {
						setLinkNotice('This account uses two-factor sign-in. Linking from a custom page is not available yet — sign in through the platform login page.');
						return null;
					}
					if (!res.ok || data.error) throw new Error(data.error ?? 'SIGN_IN_FAILED');
					if (!data.signedIn) throw new Error('INVALID_CREDENTIALS');

					// Signed in as the existing account — spend the ticket.
					const linkRes = await fetch('/api/sso/link', {
						method: 'POST',
						credentials: 'include',
						headers: { 'content-type': 'application/json' },
						body: JSON.stringify({ ticket })
					});
					const linkData = (await linkRes.json()) as { linked?: boolean; error?: string };
					if (!linkRes.ok || !linkData.linked) {
						throw new Error(linkData.error ?? 'LINK_FAILED');
					}
					window.location.assign(nextPath);
					return {
						id: null,
						userId: null,
						accessToken: null,
						accessTokenExpiresAt: null,
						isVerified: true,
						totpEnabled: false,
						mfaRequired: false,
						mfaChallengeToken: null
					};
				}}
			/>
		</AuthScreenLayout>
	);
}

function toLocalPath(value: string | null): string {
	if (value && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')) {
		return value;
	}
	return '/';
}

export default function CustomCompletePage() {
	return (
		<Suspense fallback={null}>
			<CustomCompleteContent />
		</Suspense>
	);
}
