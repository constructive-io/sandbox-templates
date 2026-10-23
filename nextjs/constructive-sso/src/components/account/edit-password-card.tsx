'use client';

import { useRef, useState } from 'react';
import { StepUpCodeForm } from '@/components/auth/step-up-code-form';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import type { CardComponent } from '@/components/ui/stack';
import { showErrorToast, showSuccessToast } from '@/components/ui/toast';
import { Loader2 } from 'lucide-react';

import { isCodeStepUp } from '@/lib/auth/step-up';
import { useSetPasswordMutation } from '@sdk/auth';

export type EditPasswordCardProps = {
	onSuccess?: () => void;
};

export const EditPasswordCard: CardComponent<EditPasswordCardProps> = ({ onSuccess, card }) => {
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	// A password change is a step-up-guarded write: the tenant refuses a session
	// that has not authenticated within its step-up window with
	// STEP_UP_REQUIRED_FRESH_AUTH, so the card swaps to the code step — a
	// verified code counts as a fresh authentication — and retries once it is
	// accepted.
	const [stepUp, setStepUp] = useState(false);
	// Set once a code was accepted: a second step-up refusal after that is a
	// fault to show, not another prompt to loop on.
	const verifiedRetry = useRef(false);

	const { mutateAsync: setPassword, isPending: isSettingPassword, error } = useSetPasswordMutation({
		selection: { fields: { result: true } },
	});

	const canSave =
		currentPassword.length > 0 && newPassword.length >= 8 && newPassword === confirmPassword && !isSettingPassword;

	const handleSave = async () => {
		if (!canSave) return;

		try {
			const res = await setPassword({ input: { currentPassword, newPassword } });
			if (!res.setPassword?.result) {
				showErrorToast({
					message: 'Failed to update password',
					description: 'Session may have expired. Please log in again.',
				});
				return;
			}
			showSuccessToast({ message: 'Password updated', description: 'Your password has been changed successfully.' });
			onSuccess?.();
			card.close();
		} catch (err) {
			if (isCodeStepUp(err) && !verifiedRetry.current) {
				setStepUp(true);
				return;
			}
			verifiedRetry.current = false;
			console.error('Failed to set password:', err);
			showErrorToast({
				message: 'Failed to update password',
				description: err instanceof Error ? err.message : 'An error occurred while changing your password.',
			});
		}
	};

	if (stepUp) {
		return (
			<div className='space-y-4 p-4'>
				<p className='text-muted-foreground text-sm'>Changing your password needs a fresh check that it’s you.</p>
				<StepUpCodeForm
					busy={isSettingPassword}
					busyLabel='Saving…'
					onCancel={() => card.close()}
					onVerified={async () => {
						verifiedRetry.current = true;
						await handleSave();
					}}
				/>
			</div>
		);
	}

	return (
		<div className='flex h-full flex-col'>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					handleSave();
				}}
				className='flex flex-1 flex-col'
			>
				<div className='flex-1 space-y-4 p-4'>
					<input type='password' autoComplete='new-password' style={{ display: 'none' }} />
					<Field label='Current Password'>
						<InputGroup>
							<InputGroupInput
								type='password'
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
							/>
						</InputGroup>
					</Field>
					<Field label='New Password' description='Must be at least 8 characters'>
						<InputGroup>
							<InputGroupInput type='password' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
						</InputGroup>
					</Field>
					<Field
						label='Confirm New Password'
						error={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : undefined}
					>
						<InputGroup>
							<InputGroupInput
								type='password'
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								aria-invalid={confirmPassword && newPassword !== confirmPassword ? true : undefined}
							/>
						</InputGroup>
					</Field>
					{error && <p className='text-destructive text-sm'>{error.message}</p>}
				</div>

				<div className='flex justify-end gap-2 border-t px-4 py-3'>
					<Button variant='outline' onClick={() => card.close()}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={!canSave}>
						{isSettingPassword ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Saving...
							</>
						) : (
							'Save Password'
						)}
					</Button>
				</div>
			</form>
		</div>
	);
};
