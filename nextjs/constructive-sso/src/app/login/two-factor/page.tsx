'use client';

import { useState } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { ArrowLeftIcon, ShieldCheckIcon } from 'lucide-react';

import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';

/**
 * The second factor of a challenged sign-in, in the app's own chrome.
 *
 * The password already checked out — that is what earned the challenge now
 * parked in the HttpOnly cookie this page's BFF routes read. Sending the code
 * and spending it both go through those routes so the token never reaches
 * page JavaScript. The code is TOTP on a ten-minute window, so a resend inside
 * that window repeats the same digits; the challenge itself lives exactly as
 * long, and expiring there means signing in again.
 */
const FRIENDLY_ERRORS: Record<string, string> = {
	INVALID_MFA_CHALLENGE: 'This challenge is no longer valid — sign in again to start a fresh one.',
	MFA_CHALLENGE_EXPIRED: 'The challenge expired after ten minutes — sign in again.',
	MFA_CHALLENGE_MISSING: 'No challenge in progress — sign in again.',
	ACCOUNT_LOCKED_EXCEED_ATTEMPTS: 'Too many attempts. The account is temporarily locked.',
	TOO_MANY_REQUESTS: 'Too many code requests — wait a moment and try again.',
	MFA_IDENTIFIER_UNVERIFIED: 'This account has no verified number to text — sign in through the platform login page.',
};

export default function TwoFactorPage() {
	const [step, setStep] = useState<'intro' | 'code'>('intro');
	const [code, setCode] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	const sendCode = async (event: React.FormEvent, resend = false) => {
		event.preventDefault();
		setError(null);
		setNotice(null);
		setBusy(true);
		try {
			const response = await fetch('/api/custom-auth/mfa/send-code', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ method: 'sms' }),
			});
			const payload = (await response.json()) as { sent?: boolean; error?: string };
			if (!response.ok || !payload.sent) {
				setError(
					payload.error
						? (FRIENDLY_ERRORS[payload.error] ?? payload.error)
						: `sending the code failed (HTTP ${response.status})`
				);
				return;
			}
			setStep('code');
			if (resend) {
				setNotice('New code sent. The same digits apply within the ten-minute window.');
			}
		} catch {
			setError('could not reach the app server — is the dev server running?');
		} finally {
			setBusy(false);
		}
	};

	const verifyCode = async (event: React.FormEvent) => {
		event.preventDefault();
		setError(null);
		setNotice(null);
		if (!/^\d{6}$/.test(code)) {
			setError('The code is the six digits from the text message.');
			return;
		}
		setBusy(true);
		try {
			const response = await fetch('/api/custom-auth/mfa/complete', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ code }),
			});
			const payload = (await response.json()) as { signedIn?: boolean; error?: string };
			if (response.ok && payload.signedIn) {
				window.location.href = '/' as Route;
				return;
			}
			setError(
				payload.error
					? (FRIENDLY_ERRORS[payload.error] ?? payload.error)
					: `sign-in failed (HTTP ${response.status})`
			);
		} catch {
			setError('could not reach the app server — is the dev server running?');
		} finally {
			setBusy(false);
		}
	};

	return (
		<AuthScreenLayout>
			<div className='space-y-5 px-8 pb-8'>
				<div className='flex justify-center pt-4'>
					<div className='bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full'>
						<ShieldCheckIcon className='text-primary h-6 w-6' />
					</div>
				</div>
				<div className='space-y-1 text-center'>
					<h1 className='text-xl font-semibold'>
						{step === 'intro' ? 'Two-factor sign-in' : 'Enter your code'}
					</h1>
					<p className='text-muted-foreground text-sm'>
						{step === 'intro'
							? 'Your password checked out. We text a one-time code to your verified number to finish signing in.'
							: 'Enter the six digits we just texted you. They expire after ten minutes.'}
					</p>
				</div>

				{error && (
					<p className='text-destructive text-center text-sm' role='alert'>
						{error}
					</p>
				)}
				{notice && (
					<p className='text-muted-foreground text-center text-sm' role='status'>
						{notice}
					</p>
				)}

				{step === 'intro' ? (
					<form onSubmit={(event) => sendCode(event)} className='space-y-3'>
						<button type='submit' className='btn btn-primary w-full' disabled={busy}>
							{busy ? 'Sending…' : 'Send code by SMS'}
						</button>
						<Link
							href='/custom-login'
							className='text-muted-foreground flex items-center justify-center gap-1 text-sm hover:underline'
						>
							<ArrowLeftIcon className='h-4 w-4' /> Back to sign in
						</Link>
					</form>
				) : (
					<form onSubmit={verifyCode} className='space-y-3'>
						<input
							value={code}
							onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
							inputMode='numeric'
							autoComplete='one-time-code'
							autoFocus
							placeholder='······'
							aria-label='Six-digit code'
							className='input text-center text-lg tracking-[0.5em]'
						/>
						<button type='submit' className='btn btn-primary w-full' disabled={busy}>
							{busy ? 'Verifying…' : 'Verify and continue'}
						</button>
						<div className='text-muted-foreground flex items-center justify-between text-sm'>
							<Link href='/custom-login' className='flex items-center gap-1 hover:underline'>
								<ArrowLeftIcon className='h-4 w-4' /> Sign in again
							</Link>
							<button
								type='button'
								onClick={(event) => sendCode(event, true)}
								className='hover:underline'
								disabled={busy}
							>
								Resend code
							</button>
						</div>
					</form>
				)}
			</div>
		</AuthScreenLayout>
	);
}
