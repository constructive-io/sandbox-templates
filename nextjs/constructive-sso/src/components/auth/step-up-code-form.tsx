'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2Icon, SmartphoneIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { InputOtp } from '@/components/ui/input-otp';
import { sendStepUpCode, StepUpError, verifyStepUpCode } from '@/lib/auth/step-up';

/** The tenant's refusals, in words a person can act on. */
const MESSAGES: Record<string, string> = {
	STEP_UP_CODE_NOT_SENT:
		'This account has no verified phone number to text a code to. Add one under Account settings → Phone.',
	MFA_IDENTIFIER_UNVERIFIED:
		'Your phone number is not verified yet. Verify it under Account settings → Phone.',
	TOO_MANY_REQUESTS: 'A code was texted less than a minute ago — wait a moment before asking for another.',
	ACCOUNT_LOCKED_EXCEED_ATTEMPTS: 'Too many wrong codes. Wait a few minutes, then try again.',
	STEP_UP_SESSION_INVALID: 'This session could not be re-verified. Sign out and sign in again.',
	NOT_AUTHENTICATED: 'Your session has ended. Sign in again.',
};

const messageFor = (err: unknown): string =>
	err instanceof StepUpError
		? (MESSAGES[err.code] ?? err.code)
		: 'Could not reach the app server — is the dev server running?';

/** The tenant's resend window for a texted code. */
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
 * The second factor a sensitive action demands: texts the signed-in caller a
 * code as soon as it mounts, takes the six digits, and on a correct code hands
 * control back so the caller can retry the action the tenant refused with
 * `STEP_UP_REQUIRED_MFA`.
 */
export function StepUpCodeForm({
	onVerified,
	onCancel,
	busy = false,
	busyLabel = 'Continuing…',
}: StepUpCodeFormProps) {
	const [code, setCode] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [sending, setSending] = useState(false);
	const [verifying, setVerifying] = useState(false);
	const [cooldown, setCooldown] = useState(0);
	const sentOnMount = useRef(false);

	const send = useCallback(async (resend: boolean) => {
		setSending(true);
		setError(null);
		setNotice(null);
		try {
			await sendStepUpCode();
			setNotice(resend ? 'New code texted. The latest code is the one to use.' : 'We texted a code to your phone.');
			setCooldown(RESEND_SECONDS);
		} catch (err) {
			// Inside the resend window a code is already on its way and still
			// valid, so the first send of a retried action is not a failure.
			if (!resend && err instanceof StepUpError && err.code === 'TOO_MANY_REQUESTS') {
				setNotice('A code was texted to your phone in the last minute — enter it below.');
				setCooldown(RESEND_SECONDS);
				return;
			}
			setError(messageFor(err));
		} finally {
			setSending(false);
		}
	}, []);

	useEffect(() => {
		if (sentOnMount.current) return;
		sentOnMount.current = true;
		void send(false);
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
				setError('That code didn’t match. Use the digits from the latest text.');
				setCode('');
				return;
			}
			await onVerified();
		} catch (err) {
			setError(messageFor(err));
		} finally {
			setVerifying(false);
		}
	};

	const working = verifying || busy;

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
					<SmartphoneIcon className='text-primary h-4 w-4' />
				</div>
				<p className='text-muted-foreground text-sm'>
					This action needs a fresh second factor. Enter the six-digit code we text to your phone.
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

			<div className='flex items-center justify-between gap-2'>
				<Button
					type='button'
					variant='link'
					className='h-auto px-0 text-sm'
					disabled={sending || cooldown > 0 || working}
					onClick={() => void send(true)}
				>
					{sending ? 'Sending…' : cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code'}
				</Button>
				<div className='flex gap-2'>
					<Button type='button' variant='ghost' className='h-9' onClick={onCancel} disabled={working}>
						Cancel
					</Button>
					<Button type='submit' className='h-9' disabled={working || code.length !== 6}>
						{working && <Loader2Icon className='mr-2 h-3.5 w-3.5 animate-spin' />}
						{busy ? busyLabel : verifying ? 'Verifying…' : 'Verify'}
					</Button>
				</div>
			</div>
		</form>
	);
}
