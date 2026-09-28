'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { ArrowLeftIcon, ShieldCheckIcon } from 'lucide-react';

import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';

/**
 * The second factor of a challenged sign-in, in the app's own chrome — now
 * method-driven. An OTP method shows the six-digit input; the questions
 * method shows the ONE question the challenge picked (fetched through the
 * BFF so the token never reaches page JavaScript) and one answer field.
 *
 * When the policy demanded a factor the account never enrolled, the sign-in
 * answers enrollmentRequired and the same page turns into the setup form:
 * possession of the challenge token proves the password, which is what the
 * enrollment accepts. Three questions set, the page flips straight to asking
 * the picked one.
 */
const QUESTION_CATALOG = [
	'What was the name of your first pet?',
	'What street did you grow up on?',
	'What was your childhood nickname?',
	'What was the make of your first car?',
	'What is your mother’s maiden name?',
	'What was the name of your elementary school?',
	'What city were you born in?',
	'What was the first concert you attended?'
];

const FRIENDLY_ERRORS: Record<string, string> = {
	INVALID_MFA_CHALLENGE: 'This challenge is no longer valid — sign in again to start a fresh one.',
	MFA_CHALLENGE_EXPIRED: 'The challenge expired after ten minutes — sign in again.',
	MFA_CHALLENGE_MISSING: 'No challenge in progress — sign in again.',
	ACCOUNT_LOCKED_EXCEED_ATTEMPTS: 'Too many attempts. The account is temporarily locked.',
	TOO_MANY_REQUESTS: 'Too many code requests — wait a moment and try again.',
	MFA_IDENTIFIER_UNVERIFIED: 'This account has no verified number to text — sign in through the platform login page.',
	SECURITY_QUESTIONS_INVALID: 'Pick three different questions and answer each one.'
};

type Mode = 'send' | 'code' | 'question' | 'enroll';

export default function TwoFactorPage() {
	const [mode, setMode] = useState<Mode>('send');
	const [code, setCode] = useState('');
	const [answer, setAnswer] = useState('');
	const [question, setQuestion] = useState<string | null>(null);
	const [picks, setPicks] = useState([0, 1, 2]);
	const [answers, setAnswers] = useState(['', '', '']);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	// The sign-in BFF parks the challenge cookie; the page itself never sees
	// the token, and asks the BFF which mode the tenant demands by fetching
	// the question — an OTP-method tenant answers MFA_ENROLLMENT_REQUIRED /
	// no question, keeping this cheap and stateless.
	const probeQuestion = useCallback(async () => {
		setBusy(true);
		setError(null);
		try {
			const response = await fetch('/api/custom-auth/mfa/question', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: '{}'
			});
			const payload = (await response.json()) as { question?: string; error?: string };
			if (response.ok && payload.question) {
				setQuestion(payload.question);
				setMode('question');
				return true;
			}
			if (payload.error === 'MFA_ENROLLMENT_REQUIRED') {
				setMode('enroll');
				return true;
			}
		} catch {
			/* fall through to the OTP flow */
		} finally {
			setBusy(false);
		}
		return false;
	}, []);

	useEffect(() => {
		void probeQuestion();
	}, [probeQuestion]);

	const sendCode = async (resend = false) => {
		setError(null);
		setNotice(null);
		setBusy(true);
		try {
			const response = await fetch('/api/custom-auth/mfa/send-code', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ method: 'sms' })
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
			setMode('code');
			if (resend) {
				setNotice('New code sent. The same digits apply within the ten-minute window.');
			}
		} catch {
			setError('could not reach the app server — is the dev server running?');
		} finally {
			setBusy(false);
		}
	};

	const submitAnswer = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!answer.trim()) {
			setError('Type your answer.');
			return;
		}
		setBusy(true);
		setError(null);
		try {
			const response = await fetch('/api/custom-auth/mfa/complete', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ code: answer.trim() })
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

	const submitCode = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!/^\d{6}$/.test(code)) {
			setError('The code is the six digits from the text message.');
			return;
		}
		setBusy(true);
		setError(null);
		try {
			const response = await fetch('/api/custom-auth/mfa/complete', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ code })
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

	const submitEnrollment = async (event: React.FormEvent) => {
		event.preventDefault();
		const questions = picks.map((catalogIndex, slot) => ({
			question: QUESTION_CATALOG[catalogIndex],
			answer: answers[slot]
		}));
		if (questions.some((q) => !q.answer.trim())) {
			setError('Answer all three questions.');
			return;
		}
		setBusy(true);
		setError(null);
		try {
			const response = await fetch('/api/custom-auth/mfa/enroll', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ questions })
			});
			const payload = (await response.json()) as { enrolled?: boolean; error?: string };
			if (response.ok && payload.enrolled) {
				setNotice('Questions saved. Now answer the one this sign-in asks.');
				setMode('send');
				await probeQuestion();
				return;
			}
			setError(
				payload.error
					? (FRIENDLY_ERRORS[payload.error] ?? payload.error)
					: `saving the questions failed (HTTP ${response.status})`
			);
		} catch {
			setError('could not reach the app server — is the dev server running?');
		} finally {
			setBusy(false);
		}
	};

	const heading =
		mode === 'enroll'
			? 'Set up your security questions'
			: mode === 'question'
				? 'Answer your question'
				: mode === 'code'
					? 'Enter your code'
					: 'Two-factor sign-in';

	const subheading =
		mode === 'enroll'
			? 'This workspace requires a security question at sign-in. Your password already checked out — pick three questions and answers to finish setting up.'
			: mode === 'question'
				? 'Your password checked out. Answer the question to finish signing in.'
				: mode === 'code'
					? 'Enter the six digits we just texted you. They expire after ten minutes.'
					: 'Your password checked out. We text a one-time code to your verified number to finish signing in.';

	return (
		<AuthScreenLayout>
			<div className='space-y-5 px-8 pb-8'>
				<div className='flex justify-center pt-4'>
					<div className='bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full'>
						<ShieldCheckIcon className='text-primary h-6 w-6' />
					</div>
				</div>
				<div className='space-y-1 text-center'>
					<h1 className='text-xl font-semibold'>{heading}</h1>
					<p className='text-muted-foreground text-sm'>{subheading}</p>
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

				{mode === 'send' && (
					<form onSubmit={(event) => { event.preventDefault(); void sendCode(); }} className='space-y-3'>
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
				)}

				{mode === 'code' && (
					<form onSubmit={submitCode} className='space-y-3'>
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
								onClick={() => void sendCode(true)}
								className='hover:underline'
								disabled={busy}
							>
								Resend code
							</button>
						</div>
					</form>
				)}

				{mode === 'question' && (
					<form onSubmit={submitAnswer} className='space-y-3'>
						<p className='rounded-md bg-muted px-4 py-3 text-center text-sm font-medium'>
							{question ?? '…'}
						</p>
						<input
							value={answer}
							onChange={(event) => setAnswer(event.target.value)}
							autoComplete='off'
							autoFocus
							placeholder='Your answer'
							aria-label='Your answer'
							className='input'
						/>
						<button type='submit' className='btn btn-primary w-full' disabled={busy}>
							{busy ? 'Verifying…' : 'Verify and continue'}
						</button>
						<Link
							href='/custom-login'
							className='text-muted-foreground flex items-center justify-center gap-1 text-sm hover:underline'
						>
							<ArrowLeftIcon className='h-4 w-4' /> Sign in again
						</Link>
					</form>
				)}

				{mode === 'enroll' && (
					<form onSubmit={submitEnrollment} className='space-y-3'>
						{picks.map((catalogIndex, slot) => (
							<div key={slot} className='space-y-1'>
								<select
									value={catalogIndex}
									onChange={(event) => {
										const next = [...picks];
										next[slot] = Number(event.target.value);
										setPicks(next);
									}}
									aria-label={`Question ${slot + 1}`}
									className='input'
								>
									{QUESTION_CATALOG.map((text, index) => (
										<option key={index} value={index}>
											{text}
										</option>
									))}
								</select>
								<input
									value={answers[slot]}
									onChange={(event) => {
										const next = [...answers];
										next[slot] = event.target.value;
										setAnswers(next);
									}}
									autoComplete='off'
									placeholder={`Answer ${slot + 1}`}
									aria-label={`Answer ${slot + 1}`}
									className='input'
								/>
							</div>
						))}
						<button type='submit' className='btn btn-primary w-full' disabled={busy}>
							{busy ? 'Saving…' : 'Save questions and continue'}
						</button>
					</form>
				)}
			</div>
		</AuthScreenLayout>
	);
}
