'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2Icon, MailIcon, SmartphoneIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { InputOtp } from '@/components/ui/input-otp';
import { sendStepUpCode, StepUpError, type StepUpMethod, verifyStepUpCode } from '@/lib/auth/step-up';

/** How each factor is named in a sentence. */
const FACTOR: Record<StepUpMethod, { thing: string; sent: string; where: string }> = {
	sms: { thing: 'phone number', sent: 'texted', where: 'your phone' },
	email: { thing: 'email address', sent: 'emailed', where: 'your email' },
};

/** Refusals that mean this account has no usable identifier for the factor. */
const NO_IDENTIFIER = new Set(['STEP_UP_CODE_NOT_SENT', 'MFA_IDENTIFIER_UNVERIFIED']);

/** The tenant's refusals, in words a person can act on. */
const messageFor = (err: unknown, method: StepUpMethod): string => {
	if (!(err instanceof StepUpError)) return 'Could not reach the app server — is the dev server running?';
	const { thing, sent } = FACTOR[method];
	switch (err.code) {
		case 'STEP_UP_CODE_NOT_SENT':
			return `This account has no verified ${thing} to send a code to. Add one under Account settings.`;
		case 'MFA_IDENTIFIER_UNVERIFIED':
			return `Your ${thing} is not verified yet. Verify it under Account settings.`;
		case 'TOO_MANY_REQUESTS':
			return `A code was ${sent} less than a minute ago — wait a moment before asking for another.`;
		case 'ACCOUNT_LOCKED_EXCEED_ATTEMPTS':
			return 'Too many wrong codes. Wait a few minutes, then try again.';
		case 'STEP_UP_SESSION_INVALID':
			return 'This session could not be re-verified. Sign out and sign in again.';
		case 'NOT_AUTHENTICATED':
			return 'Your session has ended. Sign in again.';
		default:
			return err.code;
	}
};

/** The tenant's resend window, per factor. */
const RESEND_SECONDS = 60;

interface StepUpCodeFormProps {
	/** Runs once the code is accepted: retry the action the step-up guarded. */
	onVerified: () => Promise<void> | void;
	onCancel: () => void;
	/** The retried action is running. */
	busy?: boolean;
	/** What the submit button says while the retried action runs. */
	busyLabel?: string;
}

/**
 * The second factor a sensitive action demands: sends the signed-in caller a
 * code as soon as it mounts — by text, or by email when the account has no
 * verified phone — takes the six digits, and on a correct code hands control
 * back so the caller can retry the action the tenant refused with
 * `STEP_UP_REQUIRED_MFA`. Either factor's code satisfies the demand, so the
 * caller can switch between them.
 */
export function StepUpCodeForm({
	onVerified,
	onCancel,
	busy = false,
	busyLabel = 'Continuing…',
}: StepUpCodeFormProps) {
	const [method, setMethod] = useState<StepUpMethod>('sms');
	const [code, setCode] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [sending, setSending] = useState(false);
	const [verifying, setVerifying] = useState(false);
	const [cooldown, setCooldown] = useState(0);
	const sentOnMount = useRef(false);

	/** Send by one factor; answers the refusal code, or null once a code is on its way. */
	const send = useCallback(async (via: StepUpMethod, resend: boolean): Promise<string | null> => {
		setSending(true);
		setError(null);
		setNotice(null);
		setMethod(via);
		const { sent, where } = FACTOR[via];
		try {
			await sendStepUpCode(via);
			setNotice(resend ? `New code ${sent}. The latest code is the one to use.` : `We ${sent} a code to ${where}.`);
			setCooldown(RESEND_SECONDS);
			return null;
		} catch (err) {
			// Inside the resend window a code is already on its way and still
			// valid, so the first send of a retried action is not a failure.
			if (!resend && err instanceof StepUpError && err.code === 'TOO_MANY_REQUESTS') {
				setNotice(`A code was ${sent} to ${where} in the last minute — enter it below.`);
				setCooldown(RESEND_SECONDS);
				return null;
			}
			setError(messageFor(err, via));
			return err instanceof StepUpError ? err.code : 'UNREACHABLE';
		} finally {
			setSending(false);
		}
	}, []);

	const switchTo = (via: StepUpMethod) => {
		setCode('');
		setCooldown(0);
		void send(via, false);
	};

	useEffect(() => {
		if (sentOnMount.current) return;
		sentOnMount.current = true;
		void (async () => {
			const refusal = await send('sms', false);
			// No phone to text: the verified address is the other factor the
			// demand accepts, so mail the code there instead.
			if (refusal && NO_IDENTIFIER.has(refusal) && (await send('email', false)) === null) {
				setNotice('This account has no verified phone, so we emailed the code instead.');
			}
		})();
	}, [send]);

	useEffect(() => {
		if (cooldown <= 0) return;
		const timer = setTimeout(() => setCooldown((left) => left - 1), 1000);
		return () => clearTimeout(timer);
	}, [cooldown]);

	const verify = async (value: string) => {
		if (!/^\d{6}$/.test(value) || verifying || busy) return;
		setVerifying(true);
		setError(null);
		try {
			if (!(await verifyStepUpCode(value))) {
				setError(`That code didn’t match. Use the digits from the latest ${method === 'sms' ? 'text' : 'email'}.`);
				setCode('');
				return;
			}
			await onVerified();
		} catch (err) {
			setError(messageFor(err, method));
		} finally {
			setVerifying(false);
		}
	};

	const working = verifying || busy;
	const other: StepUpMethod = method === 'sms' ? 'email' : 'sms';
	const FactorIcon = method === 'sms' ? SmartphoneIcon : MailIcon;

	return (
		<form
			className='space-y-4'
			onSubmit={(event) => {
				event.preventDefault();
				void verify(code);
			}}
		>
			<div className='flex items-start gap-3'>
				<div className='bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full'>
					<FactorIcon className='text-primary h-4 w-4' />
				</div>
				<p className='text-muted-foreground text-sm'>
					This action needs a fresh second factor. Enter the six-digit code we sent to {FACTOR[method].where}.
				</p>
			</div>

			{error ? (
				<div role='alert' className='bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm'>
					{error}
				</div>
			) : null}
			{notice && !error ? (
				<div role='status' className='bg-primary/10 text-foreground rounded-md px-3 py-2 text-sm'>
					{notice}
				</div>
			) : null}

			<InputOtp
				value={code}
				onChange={setCode}
				onComplete={(value) => void verify(value)}
				isDisabled={working}
				isInvalid={Boolean(error)}
				groupEvery={3}
				aria-label='Verification code'
			/>

			<div className='flex flex-col gap-1'>
				<Button
					type='button'
					variant='link'
					className='h-auto self-start px-0 text-sm'
					disabled={sending || cooldown > 0 || working}
					onClick={() => void send(method, true)}
				>
					{sending ? 'Sending…' : cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code'}
				</Button>
				<Button
					type='button'
					variant='link'
					className='h-auto self-start px-0 text-sm'
					disabled={sending || working}
					onClick={() => switchTo(other)}
				>
					{other === 'email' ? 'Email me a code instead' : 'Text me a code instead'}
				</Button>
			</div>

			<div className='flex justify-end gap-2'>
				<Button type='button' variant='ghost' className='h-9' onClick={onCancel} disabled={working}>
					Cancel
				</Button>
				<Button type='submit' className='h-9' disabled={working || code.length !== 6}>
					{working && <Loader2Icon className='mr-2 h-3.5 w-3.5 animate-spin' />}
					{busy ? busyLabel : verifying ? 'Verifying…' : 'Verify'}
				</Button>
			</div>
		</form>
	);
}
