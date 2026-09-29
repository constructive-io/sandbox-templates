'use client';

import { useState } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { ArrowLeftIcon, MailIcon } from 'lucide-react';

import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';

/**
 * Magic-link sign-in, the email twin of /login/phone:
 *
 *   1. ask for the address — the app's BFF relays it to the gateway's
 *      request-magic-link lane (Postgres mints the one-time token, keeps only
 *      its hash, and queues the email through the tenant's sender identity —
 *      see packages/provision/src/configure-email.ts);
 *   2. the email's button lands on the GATEWAY's /auth/magic-link, which
 *      spends the token, sets the session cookie, and redirects into the app
 *      through the site-root redirect row. The cookie is host-only on
 *      localhost and cookies ignore ports, so the app origin receives it and
 *      the browser lands back here signed in.
 *
 * The link is single-use; a resend queues a fresh token, and the newest
 * email's link is the one that works.
 */
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const FRIENDLY_ERRORS: Record<string, string> = {
	MAGIC_LINK_SIGN_IN_DISABLED: 'Magic-link sign-in is switched off for this workspace.',
	TOO_MANY_REQUESTS: 'Too many requests — wait a minute and try again.',
};

export default function MagicLoginPage() {
	const [step, setStep] = useState<'email' | 'sent'>('email');
	const [email, setEmail] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	const requestLink = async (event: React.FormEvent, resend = false) => {
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
			const response = await fetch('/api/auth/request-magic-link', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ email: trimmed }),
			});
			const payload = (await response.json()) as { requested?: boolean; error?: string };
			if (!response.ok || !payload.requested) {
				setError(
					payload.error
						? (FRIENDLY_ERRORS[payload.error] ?? payload.error)
						: `requesting the link failed (HTTP ${response.status})`
				);
				return;
			}
			setEmail(trimmed);
			setStep('sent');
			if (resend) {
				setNotice('New link sent — the newest email\u2019s button is the one that works.');
			}
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
							<h1 className='text-lg font-semibold'>Sign in with a magic link</h1>
							<p className='text-muted-foreground text-sm'>
								We&apos;ll email you a button. No password needed.
							</p>
						</div>

						<form onSubmit={requestLink} className='space-y-4'>
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
									data-testid='magic-login-input'
								/>
							</div>
							<button
								type='submit'
								disabled={busy}
								className='bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring w-full rounded-md px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 disabled:opacity-50'
								data-testid='magic-login-submit'
							>
								{busy ? 'Sending…' : 'Email me a sign-in link'}
							</button>
						</form>
					</>
				) : (
					<>
						<div className='space-y-1.5 text-center'>
							<h1 className='text-lg font-semibold'>Check your email</h1>
							<p className='text-muted-foreground text-sm'>
								A sign-in link is on its way to{' '}
								<span className='text-foreground font-medium'>{email}</span>. The link is
								single-use — use the newest email&apos;s button.
							</p>
						</div>

						<div className='space-y-4'>
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
							<button
								type='button'
								onClick={(e) => requestLink(e, true)}
								disabled={busy}
								className='border-input bg-background hover:bg-accent focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 disabled:opacity-50'
								data-testid='magic-login-resend'
							>
								{busy ? 'Sending…' : 'Resend the link'}
							</button>
							<button
								type='button'
								onClick={() => {
									setStep('email');
									setNotice(null);
									setError(null);
								}}
								className='text-muted-foreground hover:text-foreground w-full py-2 text-sm underline'
							>
								Use a different address
							</button>
						</div>
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
