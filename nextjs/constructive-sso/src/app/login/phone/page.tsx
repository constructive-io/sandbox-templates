'use client';

import { useState } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { ArrowLeftIcon, SmartphoneIcon } from 'lucide-react';

import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';

/**
 * Phone sign-in, both legs in the app's own chrome:
 *
 *   1. ask for the number — the app's BFF relays it to the gateway's
 *      send-sms-otp lane (Postgres mints the code, the sms function texts
 *      it through the tenant's provider);
 *   2. type the code — the BFF posts it to the gateway's sms-code sign-in
 *      and forwards the session cookie it answers. The cookie is host-only
 *      on localhost and cookies ignore ports, so the app origin receives
 *      it and the browser lands back here signed in.
 *
 * The gateway's own code page stays as the no-JS fallback; this app simply
 * never sends anyone to it. The code is TOTP on a ten-minute window, so a
 * resend inside that window repeats the same digits.
 */
const E164 = /^\+[1-9]\d{7,14}$/;

const FRIENDLY_ERRORS: Record<string, string> = {
	INVALID_CODE: 'That code didn\u2019t match. Codes expire after ten minutes — resend and use the latest text.',
	ACCOUNT_NOT_FOUND:
		'No account is linked to this number yet. Sign in another way, then add the number under Account Settings \u2192 Phone.',
	SMS_SIGN_IN_DISABLED: 'Phone sign-in is switched off for this workspace.',
};

export default function PhoneLoginPage() {
	const [step, setStep] = useState<'phone' | 'code'>('phone');
	const [phone, setPhone] = useState('');
	const [code, setCode] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	const sendCode = async (event: React.FormEvent) => {
		event.preventDefault();
		setError(null);
		const trimmed = phone.trim();
		if (!E164.test(trimmed)) {
			setError('Enter the number in international format, e.g. +14155550123');
			return;
		}
		setBusy(true);
		try {
			const response = await fetch('/api/auth/send-sms-otp', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ phone: trimmed }),
			});
			const payload = (await response.json()) as { sent?: boolean; error?: string };
			if (!response.ok || !payload.sent) {
				setError(payload.error ?? `sending the code failed (HTTP ${response.status})`);
				return;
			}
			setPhone(trimmed);
			setStep('code');
		} catch {
			setError('could not reach the app server — is the dev server running?');
		} finally {
			setBusy(false);
		}
	};

	const verifyCode = async (event: React.FormEvent) => {
		event.preventDefault();
		setError(null);
		if (!/^\d{6}$/.test(code)) {
			setError('The code is the six digits from the text message.');
			return;
		}
		setBusy(true);
		try {
			const response = await fetch('/api/auth/verify-sms-otp', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ phone, code }),
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
						<SmartphoneIcon className='text-primary h-6 w-6' />
					</div>
				</div>

				{step === 'phone' ? (
					<>
						<div className='space-y-1.5 text-center'>
							<h1 className='text-lg font-semibold'>Sign in with your phone</h1>
							<p className='text-muted-foreground text-sm'>
								We&apos;ll text a verification code to your number. Standard rates may apply.
							</p>
						</div>

						<form onSubmit={sendCode} className='space-y-4'>
							{error ? (
								<div role='alert' className='bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm'>
									{error}
								</div>
							) : null}
							<div className='space-y-2'>
								<label htmlFor='phone' className='text-sm font-medium'>
									Phone number
								</label>
								<input
									id='phone'
									name='phone'
									type='tel'
									inputMode='tel'
									autoComplete='tel'
									placeholder='+14155550123'
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									disabled={busy}
									className='border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2'
									data-testid='phone-login-input'
								/>
							</div>
							<button
								type='submit'
								disabled={busy}
								className='bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring w-full rounded-md px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 disabled:opacity-50'
								data-testid='phone-login-submit'
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
								We texted a code to <span className='text-foreground font-medium'>{phone}</span>. It
								expires in ten minutes.
							</p>
						</div>

						<form onSubmit={verifyCode} className='space-y-4'>
							{error ? (
								<div role='alert' className='bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm'>
									{error}
								</div>
							) : null}
							<input
								id='code'
								name='code'
								type='text'
								inputMode='numeric'
								autoComplete='one-time-code'
								pattern='\d{6}'
								maxLength={6}
								placeholder='······'
								autoFocus
								value={code}
								onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
								disabled={busy}
								className='border-input bg-background focus-visible:ring-ring h-14 w-full rounded-md border px-3 text-center text-2xl font-semibold tracking-[0.5em] outline-none focus-visible:ring-2'
								data-testid='phone-login-code-input'
							/>
							<button
								type='submit'
								disabled={busy || code.length !== 6}
								className='bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring w-full rounded-md px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 disabled:opacity-50'
								data-testid='phone-login-verify-submit'
							>
								{busy ? 'Signing in…' : 'Verify and sign in'}
							</button>
						</form>

						<div className='flex items-center justify-between text-sm'>
							<button
								type='button'
								className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium'
								onClick={() => {
									setStep('phone');
									setCode('');
									setError(null);
								}}
							>
								<ArrowLeftIcon className='size-4' />
								Use a different number
							</button>
							<button
								type='button'
								disabled={busy}
								className='text-primary hover:text-primary/80 font-medium disabled:opacity-50'
								onClick={() => sendCode({ preventDefault: () => {} } as React.FormEvent)}
							>
								Resend code
							</button>
						</div>
					</>
				)}

				<div className='text-muted-foreground text-center text-sm'>
					Prefer email or SSO?{' '}
					<Link href='/login' className='text-primary hover:text-primary/80 font-medium'>
						All sign-in options
					</Link>
				</div>
			</div>
		</AuthScreenLayout>
	);
}
