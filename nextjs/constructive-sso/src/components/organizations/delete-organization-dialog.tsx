'use client';

import { useState } from 'react';
import { Loader2Icon } from 'lucide-react';

import { useDeleteOrganization, type OrganizationWithRole } from '@/lib/gql/hooks/admin';
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { showErrorToast } from '@/components/ui/toast';
import { showSuccessToast } from '@/components/ui/toast';

interface DeleteOrganizationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	organization: OrganizationWithRole | null;
	onSuccess?: () => void;
}

/**
 * Dialog for confirming organization deletion
 *
 * Only owners should be able to access this dialog.
 * The parent component is responsible for checking permissions.
 *
 * Requires typing the organization name to confirm deletion.
 */
export function DeleteOrganizationDialog({ open, onOpenChange, organization, onSuccess }: DeleteOrganizationDialogProps) {
	const [confirmName, setConfirmName] = useState('');
	// Step-up: deleting an organization demands mfa-fresh verification. When
	// the tenant refuses with STEP_UP_REQUIRED_MFA we offer the SMS code here —
	// send, type, verify, and the delete retries inside the 30-minute window.
	const [stepUp, setStepUp] = useState<'idle' | 'code' | 'sent'>('idle');
	const [stepUpCode, setStepUpCode] = useState('');
	const [stepUpBusy, setStepUpBusy] = useState(false);
	const [stepUpError, setStepUpError] = useState<string | null>(null);

	const { deleteOrganization, isDeleting } = useDeleteOrganization({
		onSuccess: (result) => {
			showSuccessToast({
				message: 'Organization deleted',
				description: `"${result.deletedOrgName}" has been permanently deleted.`,
			});
			setConfirmName('');
			onOpenChange(false);
			onSuccess?.();
		},
		onError: (error) => {
			if (error.message.includes('STEP_UP_REQUIRED_MFA')) {
				setStepUp(stepUp === 'sent' ? 'sent' : 'code');
				setStepUpError(null);
				return;
			}
			showErrorToast({
				message: 'Failed to delete organization',
				description: error.message,
			});
		},
	});

	const orgName = organization?.displayName || organization?.username || '';
	const canDelete = confirmName === orgName;

	const sendStepUpCode = async () => {
		setStepUpBusy(true);
		setStepUpError(null);
		try {
			const response = await fetch('/api/auth/step-up/send', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: '{}'
			});
			const payload = (await response.json()) as { sent?: boolean; error?: string };
			if (response.ok && payload.sent) {
				setStepUp('sent');
				return;
			}
			setStepUpError(payload.error ?? `sending the code failed (HTTP ${response.status})`);
		} catch {
			setStepUpError('could not reach the app server');
		} finally {
			setStepUpBusy(false);
		}
	};

	const handleDelete = async () => {
		if (!organization || !canDelete) return;
		// The step-up lane is open: verify the typed code first, then retry.
		if (stepUp === 'sent') {
			setStepUpBusy(true);
			setStepUpError(null);
			try {
				const response = await fetch('/api/auth/step-up/verify', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ code: stepUpCode })
				});
				const payload = (await response.json()) as { verified?: boolean; error?: string };
				if (!response.ok || !payload.verified) {
					setStepUpError(payload.error ?? 'That code didn\u2019t match — check the text and retry.');
					return;
				}
			} catch {
				setStepUpError('could not reach the app server');
				return;
			} finally {
				setStepUpBusy(false);
			}
		}

		try {
			await deleteOrganization({
				orgId: organization.id,
				confirmName
			});
		} catch (error) {
			// The step-up refusal is a state, not a fault: onError already
			// opened the SMS panel for it. Everything else surfaces as a
			// failure the user can read (and stops the unhandled rejection
			// that renders the dev overlay over the open panel).
			if (!(error instanceof Error) || !error.message.includes('STEP_UP_REQUIRED_MFA')) {
				throw error;
			}
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (!isDeleting) {
			onOpenChange(newOpen);
			if (!newOpen) {
				setConfirmName('');
			}
		}
	};

	if (!organization) return null;

	return (
		<AlertDialog open={open} onOpenChange={handleOpenChange}>
			<AlertDialogContent className='sm:max-w-md gap-0 p-0 overflow-hidden'>
				{/* Header */}
				<AlertDialogHeader className='px-6 pt-6 pb-4'>
					<AlertDialogTitle className='text-lg font-semibold tracking-tight'>
						Delete organization
					</AlertDialogTitle>
					<AlertDialogDescription className='text-sm text-muted-foreground pt-1'>
						This will permanently delete{' '}
						<span className='font-medium text-foreground'>{orgName}</span>{' '}
						and cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>

				{/* Info section */}
				<div className='px-6 pb-5'>
					<div className='rounded-lg border border-border/60 bg-muted/30 p-4'>
						<p className='text-[13px] font-medium text-foreground/80 mb-2'>
							The following will be removed:
						</p>
						<ul className='text-[13px] text-muted-foreground space-y-1.5'>
							<li className='flex items-center gap-2'>
								<span className='h-1 w-1 rounded-full bg-muted-foreground/50' />
								Organization settings and configuration
							</li>
							<li className='flex items-center gap-2'>
								<span className='h-1 w-1 rounded-full bg-muted-foreground/50' />
								All member relationships
							</li>
							<li className='flex items-center gap-2'>
								<span className='h-1 w-1 rounded-full bg-muted-foreground/50' />
								Associated resources and permissions
							</li>
						</ul>
					</div>
				</div>

				{/* Form with confirmation input */}
				<form
					onSubmit={(e) => {
						e.preventDefault();
						if (canDelete && !isDeleting) {
							void handleDelete();
						}
					}}
				>
					<div className='px-6 pb-6'>
						<label
							htmlFor='confirm-name'
							className='block text-[13px] text-muted-foreground mb-2'
						>
							Type <span className='font-mono text-foreground bg-muted px-1.5 py-0.5 rounded text-xs'>{orgName}</span> to confirm
						</label>
						<Input
							id='confirm-name'
							placeholder='Enter organization name'
							value={confirmName}
							onChange={(e) => setConfirmName(e.target.value)}
							disabled={isDeleting}
							autoComplete='off'
							autoFocus
							className='h-10'
						/>
					</div>

					{/* Step-up: the tenant demanded mfa-fresh verification for this delete */}
					{stepUp !== 'idle' && (
						<div className='mx-6 mt-3 space-y-2 rounded-md border border-border/60 bg-muted/40 p-4'>
							<p className='text-sm font-medium'>
								{stepUp === 'code' || stepUp === 'sent'
									? 'This deletion needs a verification code'
									: ''}
							</p>
							<p className='text-muted-foreground text-sm'>
								We text a one-time code to your verified number. Enter it, then delete again —
								your verification lasts thirty minutes.
							</p>
							{stepUp === 'code' && (
								<Button
									type='button'
									variant='outline'
									className='h-9'
									disabled={stepUpBusy}
									onClick={() => void sendStepUpCode()}
								>
									{stepUpBusy ? 'Sending…' : 'Send code by SMS'}
								</Button>
							)}
							{stepUp === 'sent' && (
								<div className='flex items-center gap-2'>
									<input
										value={stepUpCode}
										onChange={(event) =>
											setStepUpCode(event.target.value.replace(/\D/g, '').slice(0, 6))
										}
										inputMode='numeric'
										autoComplete='one-time-code'
										placeholder='······'
										aria-label='Six-digit code'
										className='input h-9 w-28 text-center tracking-[0.3em]'
									/>
									<Button
										type='button'
										variant='outline'
										className='h-9'
										disabled={stepUpBusy || !/^\d{6}$/.test(stepUpCode)}
										onClick={() => void sendStepUpCode()}
									>
										Resend
									</Button>
								</div>
							)}
							{stepUpError && (
								<p className='text-destructive text-sm' role='alert'>
									{stepUpError}
								</p>
							)}
						</div>
					)}

					{/* Footer */}
					<AlertDialogFooter className='px-6 py-4 bg-muted/30 border-t border-border/60'>
						<Button
							type='button'
							variant='ghost'
							onClick={() => handleOpenChange(false)}
							disabled={isDeleting}
							className='h-9'
						>
							Cancel
						</Button>
						<Button
							type='submit'
							variant='destructive'
							disabled={isDeleting || !canDelete}
							className='h-9'
						>
							{isDeleting && <Loader2Icon className='mr-2 h-3.5 w-3.5 animate-spin' />}
							{isDeleting ? 'Deleting...' : 'Delete organization'}
						</Button>
					</AlertDialogFooter>
				</form>
			</AlertDialogContent>
		</AlertDialog>
	);
}
