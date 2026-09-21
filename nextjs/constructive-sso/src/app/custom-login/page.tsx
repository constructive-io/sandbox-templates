'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { AuthSocialButtons } from '@/blocks/auth/social-buttons/social-buttons';
import { SignInCard, type SignInResult } from '@/blocks/auth/sign-in-card/sign-in-card';
import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';

/**
 * /custom-login — the app-owned sign-in surface (Dan's custom-UI request).
 *
 * Everything here speaks to the platform's cloud functions through the
 * same-origin BFF, never GraphQL, and never the mantra page set:
 *   • provider buttons → POST /api/sso/start (sso:start sync lane; the
 *     redirect URI is constructed server-side) → provider → /auth/custom-callback
 *     relay → sso:callback page → session cookie → back here via `next`;
 *   • the password form → POST /api/custom-auth/sign-in (auth_flows:sign_in
 *     sync lane; the BFF mints the session cookie).
 *
 * Milestone 1: the provider list is static config (the upstream sso:providers
 * lane does not exist yet — filed with Dan). MFA accounts are refused with a
 * pointer to the mantra /login surface.
 */

/** Milestone-1 static provider discovery — keep in step with configure-sso. */
const STATIC_PROVIDERS = ['google', 'mock'];

/** A local path only (`/…`, never `//…`, `/\…` or absolute) — open-redirect guard. */
function toLocalPath(value: string | null): string {
  if (value && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')) {
    return value;
  }
  return '/';
}

function CustomLoginPageContent() {
	const searchParams = useSearchParams();
	const nextPath = toLocalPath(searchParams.get('next'));
	const [notice, setNotice] = useState<string | null>(null);

	return (
		<AuthScreenLayout>
			<AuthSocialButtons
				mode='sign-in'
				startMode='bff'
				providers={STATIC_PROVIDERS}
				returnTo={nextPath}
				className='mb-4 w-full max-w-sm mx-auto'
			/>
			{notice && (
				<p className='text-muted-foreground mb-3 max-w-sm mx-auto text-center text-sm' role='status'>
					{notice}
				</p>
			)}
			<SignInCard
				forgotPasswordHref='/custom-forgot-password'
				signUpHref='/register'
				onSubmit={async (vars): Promise<SignInResult | null> => {
					setNotice(null);
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
					const data = (await res.json()) as {
						signedIn?: boolean;
						mfaRequired?: boolean;
						error?: string;
					};
					if (data.mfaRequired) {
						setNotice('This account uses two-factor sign-in. Please sign in through the platform login page for now.');
						return null;
					}
					if (!res.ok || data.error) {
						// Surface the BFF error code; the card renders it via onError.
						throw new Error(data.error ?? 'SIGN_IN_FAILED');
					}
					if (!data.signedIn) {
						throw new Error('INVALID_CREDENTIALS');
					}
					// The cookie is set — a FULL navigation lets the auth store
					// re-hydrate from it on the destination page mount.
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

export default function CustomLoginPage() {
	return (
		<Suspense fallback={null}>
			<CustomLoginPageContent />
		</Suspense>
	);
}
