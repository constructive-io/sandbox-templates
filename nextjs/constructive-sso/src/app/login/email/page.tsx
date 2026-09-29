'use client';

import { useState } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { ArrowLeftIcon, MailIcon } from 'lucide-react';

import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';

/**
 * Email-code sign-in, both legs in the app's own chrome — the email twin of
 * /login/phone:
 *
 *   1. ask for the address — the app's BFF relays it to the gateway's
 *      send-email-otp lane (Postgres mints the code and queues the email
 *      through the tenant's sender identity — see
 *      packages/provision/src/configure-email.ts);
 *   2. type the code — the BFF posts it to the gateway's email-code sign-in
 *      and forwards the session cookie it answers. The cookie is host-only on
 *      localhost and cookies ignore ports, so the app origin receives it and
 *      the browser lands back here signed in.
 *
 * The gateway's own code page stays as the no-JS fallback; this app simply
 * never sends anyone to it. The code is TOTP on a ten-minute window, so a
 * resend inside that window repeats the same digits.
 */
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const FRIENDLY_ERRORS: Record<string, string> = {
	INVALID_CODE: 'That code didn\u2019t match. Codes expire after ten minutes — resend and use the latest email.',
	ACCOUNT_DISABLED: 'This account is disabled. Contact the workspace owner.',
	EMAIL_OTP_SIGN_IN_DISABLED: 'Email-code sign-in is switched off for this workspace.',
	TOO_MANY_REQUESTS: 'Too many requests — wait a minute and try again.',
};

export default function EmailLoginPage() {
	const [step, setStep] = useState<'email' | 'code'>('email');
	const [email, setEmail] = useState('');
	const [code, setCode] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	const sendCode = async (event: React.FormEvent, resend = false) => {
		event.preventDefault();
		setError(null);
		setNotice(null);
		const trimmed = email.trim();
		if (!EMAIL.test(trimmed)) {
			setError('Enter a valid email address.');
			return;
		}
		setBusy(true);
		try {
			const response = await fetch('/api/auth/send-email-otp', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ email: trimmed }),
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
			setEmail(trimmed);
			setStep('code');
			// Step 2 → 2 (a resend): the step doesn't change, so say the send
			// happened — the code window repeats the same digits.
			if (resend) {
				setNotice(`New code sent to ${trimmed}. The same digits apply within the ten-minute window.`);
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
			setError('The code is the six digits from the email.');
			return;
		}
		setBusy(true);
		try {
			const response = await fetch('/api/auth/verify-email-otp', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ email, code }),
			});
			const payload = (await response.json()) as { ok?: boolean; next?: string; error?: string };
			if (response.ok && payload.ok) {
				const target = payload.next ?? '/';
				// Only follow a landing on this app's own origin.
				if (target.startsWith('/') || target.startsWith(window.location.origin)) {
					window.location.href = target as Route;
				} else {
					window.location.href = '/' as Route;
				}
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
						<MailIcon className='text-primary h-6 w-6' />
					</div>
				</div>

				{step === 'email' ? (
					<>
						<div className='space-y-1.5 text-center'>
							<h1 className='text-lg font-semibold'>Sign in with an email code</h1>
							<p className='text-muted-foreground text-sm'>
								We&apos;ll email a verification code to your address. No password needed.
							</p>
						</div>

						<form onSubmit={sendCode} className='space-y-4'>
							{error ? (
								<div role='alert' className='bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm'>
									{error}
								</div>
							) : null}
							<div className='space-y-2'>
								<label htmlFor='email' className='text-sm font-medium'>
									Email
								</label>
								<input
									id='email'
									name='email'
									type='email'
									autoComplete='email'
									placeholder='you@example.com'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									disabled={busy}
									className='border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2'
									data-testid='email-login-input'
								/>
							</div>
							<button
								type='submit'
								disabled={busy}
								className='bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring w-full rounded-md px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 disabled:opacity-50'
								data-testid='email-login-submit'
							>
								{busy ? 'Sending code…' : 'Send code'}
							</button>
						</form>
					</>
				) : (
					<>
						<div className='space-y-1.5 text-center'>
							<h1 className='text-lg font-semibold'>Enter your code</h1>
							<p className='text-muted-foreground text-sm'>
								We emailed a code to <span className='text-foreground font-medium'>{email}</span>. It
								expires in ten minutes.
							</p>
						</div>

						<form onSubmit={verifyCode} className='space-y-4'>
							{error ? (
								<div role='alert' className='bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm'>
									{error}
								</div>
							) : null}
							{notice ? (
								<div role='status' className='bg-primary/10 text-foreground rounded-md px-3 py-2 text-sm'>
									{notice}
								</div>
							) : null}
							<input
								id='code'
								name='code'
								type='text'
								inputMode='numeric'
								autoComplete='one-time-code'
								placeholder='123456'
								value={code}
								onChange={(e) => setCode(e.target.value)}
								disabled={busy}
								className='border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-center text-lg tracking-widest outline-none focus-visible:ring-2'
								data-testid='email-login-code'
							/>
							<button
								type='submit'
								disabled={busy}
								className='bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring w-full rounded-md px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 disabled:opacity-50'
								data-testid='email-login-verify'
							>
								{busy ? 'Verifying…' : 'Verify and sign in'}
							</button>
							<button
								type='button'
								onClick={(e) => sendCode(e, true)}
								disabled={busy}
								className='text-muted-foreground hover:text-foreground w-full py-1 text-sm underline'
							>
								Resend the code
							</button>
						</form>
					</>
				)}

				<Link
					href={'/login' as Route}
					className='text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 pt-2 text-sm hover:underline'
				>
					<ArrowLeftIcon className='h-4 w-4' aria-hidden /> Back to sign in
				</Link>
			</div>
		</AuthScreenLayout>
	);
}
