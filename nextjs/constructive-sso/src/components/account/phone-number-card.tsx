'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import type { CardComponent } from '@/components/ui/stack';
import { useCardStack } from '@/components/ui/stack';
import { showErrorToast, showSuccessToast } from '@/components/ui/toast';
import { Loader2, Phone, PlusIcon, StarIcon } from 'lucide-react';

import {
	phoneNumberKeys,
	useCreatePhoneNumberMutation,
	useDeletePhoneNumberMutation,
	usePhoneNumbersQuery,
	useUpdatePhoneNumberMutation,
} from '@sdk/auth';

/**
 * Phone-number management for the signed-in account.
 *
 * The rows this edits are what phone sign-in matches: the platform's
 * sign-in-lookup compares the typed number against `number`, so the full
 * E.164 form (+country and all) is what gets stored — the same shape the
 * platform's own sign-up flow writes. A number changed here becomes
 * unverified until a code proves it; sign-in itself does not require the
 * verified flag, but the badge tells the truth.
 */

interface PhoneRow {
	id: string;
	cc?: string | null;
	number?: string | null;
	isVerified?: boolean | null;
	isPrimary?: boolean | null;
	name?: string | null;
}

const E164 = /^\+[1-9]\d{7,14}$/;

const PHONE_FIELDS = {
	id: true,
	cc: true,
	number: true,
	isVerified: true,
	isPrimary: true,
	name: true,
} as const;

export type EditPhoneNumberCardProps = {
	phoneNumber?: PhoneRow;
	isFirst?: boolean;
	onSuccess?: () => void;
};

export const EditPhoneNumberCard: CardComponent<EditPhoneNumberCardProps> = ({
	phoneNumber,
	isFirst = false,
	onSuccess,
	card,
}) => {
	const isEdit = Boolean(phoneNumber);
	const [label, setLabel] = useState(phoneNumber?.name ?? '');
	const [number, setNumber] = useState(phoneNumber?.number ?? '');
	const queryClient = useQueryClient();

	const invalidate = () => queryClient.invalidateQueries({ queryKey: phoneNumberKeys.all });

	const { mutateAsync: createPhoneNumber, isPending: isCreating } = useCreatePhoneNumberMutation({
		selection: { fields: { ...PHONE_FIELDS }, first: 20 },
	});
	const { mutateAsync: updatePhoneNumber, isPending: isUpdating } = useUpdatePhoneNumberMutation({
		selection: { fields: { ...PHONE_FIELDS }, first: 20 },
	});

	const busy = isCreating || isUpdating;
	const canSave = E164.test(number.trim()) && !busy;

	const handleSave = async () => {
		if (!canSave) return;
		const trimmed = number.trim();
		try {
			if (isEdit && phoneNumber) {
				await updatePhoneNumber({
					id: phoneNumber.id,
					phoneNumberPatch: {
						cc: '+',
						number: trimmed,
						name: label.trim() || null,
						// A moved number is unproven until a code verifies it.
						...(trimmed !== phoneNumber.number ? { isVerified: false } : {}),
					},
				});
			} else {
				await createPhoneNumber({
					cc: '+',
					number: trimmed,
					name: label.trim() || undefined,
					isPrimary: isFirst,
				});
			}
			await invalidate();
			showSuccessToast({
				message: isEdit ? 'Phone number updated' : 'Phone number added',
				description: 'Sign-in codes will now reach this number.',
			});
			onSuccess?.();
			card.close();
		} catch (err) {
			showErrorToast({
				message: 'Failed to save phone number',
				description: err instanceof Error ? err.message : 'An unexpected error occurred.',
			});
		}
	};

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
					<Field
						label='Phone number'
						description='International format, starting with + — this is the number your sign-in codes go to.'
						error={number && !E164.test(number.trim()) ? 'Use the full international form, e.g. +14155550123' : undefined}
					>
						<InputGroup>
							<InputGroupInput
								type='tel'
								inputMode='tel'
								autoComplete='tel'
								placeholder='+14155550123'
								value={number}
								onChange={(e) => setNumber(e.target.value)}
								disabled={busy}
								data-testid='phone-number-input'
							/>
						</InputGroup>
					</Field>
					<Field label='Label (optional)' description='e.g. Mobile, Work'>
						<InputGroup>
							<InputGroupInput
								type='text'
								placeholder='Mobile'
								value={label}
								onChange={(e) => setLabel(e.target.value)}
								disabled={busy}
							/>
						</InputGroup>
					</Field>
				</div>
				<div className='border-t p-4'>
					<Button type='submit' className='w-full' disabled={!canSave} data-testid='phone-number-save'>
						{busy ? <Loader2 className='mr-2 size-4 animate-spin' /> : null}
						{isEdit ? 'Save changes' : 'Add number'}
					</Button>
				</div>
			</form>
		</div>
	);
};

function PhoneRowItem({ row, isOnly }: { row: PhoneRow; isOnly: boolean }) {
	const stack = useCardStack();
	const queryClient = useQueryClient();
	const { data } = usePhoneNumbersQuery({ selection: { fields: { ...PHONE_FIELDS }, first: 20 } });
	const { mutateAsync: updatePhoneNumber, isPending: isUpdating } = useUpdatePhoneNumberMutation({
		selection: { fields: { ...PHONE_FIELDS }, first: 20 },
	});
	const { mutateAsync: deletePhoneNumber, isPending: isDeleting } = useDeletePhoneNumberMutation({
		selection: { fields: { id: true } },
	});

	const makePrimary = async () => {
		const nodes = (data?.phoneNumbers?.nodes ?? []) as PhoneRow[];
		const currentPrimary = nodes.find((n) => n.isPrimary && n.id !== row.id);
		try {
			// One primary per account (a partial unique index enforces it), so
			// clear the old one before raising this number.
			if (currentPrimary) {
				await updatePhoneNumber({ id: currentPrimary.id, phoneNumberPatch: { isPrimary: false } });
			}
			await updatePhoneNumber({ id: row.id, phoneNumberPatch: { isPrimary: true } });
			await queryClient.invalidateQueries({ queryKey: phoneNumberKeys.all });
		} catch (err) {
			showErrorToast({
				message: 'Failed to set primary number',
				description: err instanceof Error ? err.message : 'An unexpected error occurred.',
			});
		}
	};

	const remove = async () => {
		try {
			await deletePhoneNumber({ id: row.id });
			await queryClient.invalidateQueries({ queryKey: phoneNumberKeys.all });
			showSuccessToast({ message: 'Phone number removed' });
		} catch (err) {
			showErrorToast({
				message: 'Failed to remove phone number',
				description: err instanceof Error ? err.message : 'An unexpected error occurred.',
			});
		}
	};

	return (
		<div className='bg-muted/30 flex w-full items-center justify-between gap-4 rounded-xl p-6'>
			<div className='flex min-w-0 items-center gap-3'>
				<div className='bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
					<Phone className='text-primary size-4' />
				</div>
				<div className='min-w-0 space-y-1'>
					<p className='text-foreground truncate text-sm font-medium' data-testid='phone-row-number'>
						{row.number}
						{row.name ? <span className='text-muted-foreground font-normal'> · {row.name}</span> : null}
					</p>
					<div className='flex items-center gap-1.5'>
						{row.isPrimary ? <Badge variant='default'>Primary</Badge> : null}
						<Badge variant={row.isVerified ? 'secondary' : 'outline'}>
							{row.isVerified ? 'Verified' : 'Unverified'}
						</Badge>
					</div>
				</div>
			</div>
			<div className='flex shrink-0 items-center gap-2'>
				{!row.isPrimary ? (
					<Button
						variant='ghost'
						size='sm'
						onClick={makePrimary}
						disabled={isUpdating}
						title={isOnly ? 'Make primary' : 'Make primary'}
					>
						<StarIcon className='mr-1 size-4' />
						Primary
					</Button>
				) : null}
				<Button
					variant='ghost'
					size='sm'
					onClick={() =>
						stack.push({
							id: `edit-phone-${row.id}`,
							title: 'Edit phone number',
							description: 'Change the number your sign-in codes reach.',
							Component: EditPhoneNumberCard,
							props: { phoneNumber: row },
							width: 480,
						})
					}
				>
					Edit
				</Button>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant='ghost' size='sm' className='text-destructive' disabled={isDeleting}>
							Remove
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Remove this phone number?</AlertDialogTitle>
							<AlertDialogDescription>
								{row.number} will no longer receive sign-in codes. You can add it back at any time.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction onClick={remove} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
								Remove
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}

export function PhoneNumberSection() {
	const stack = useCardStack();
	const { data, isLoading, error, refetch, isRefetching } = usePhoneNumbersQuery({
		selection: { fields: { ...PHONE_FIELDS }, first: 20 },
	});
	const nodes = (data?.phoneNumbers?.nodes ?? []) as PhoneRow[];

	return (
		<section
			className='animate-in fade-in-0 slide-in-from-bottom-4 fill-mode-backwards duration-500'
			style={{ animationDelay: '50ms' }}
		>
			<div className='mb-8 flex items-end justify-between gap-4'>
				<div>
					<h2 className='text-foreground text-lg font-semibold tracking-tight'>Phone Number</h2>
					<p className='text-muted-foreground mt-1 text-sm'>
						The number your sign-in codes are texted to — sign in from anywhere with it.
					</p>
				</div>
				<Button
					variant='outline'
					size='sm'
					onClick={() =>
						stack.push({
							id: 'add-phone',
							title: 'Add phone number',
							description: 'Another number that can receive sign-in codes.',
							Component: EditPhoneNumberCard,
							props: { isFirst: nodes.length === 0 },
							width: 480,
						})
					}
					data-testid='phone-add-button'
				>
					<PlusIcon className='mr-1 size-4' />
					Add
				</Button>
			</div>

			{isLoading ? (
				<div className='text-muted-foreground rounded-xl p-6 text-sm'>Loading phone numbers…</div>
			) : error ? (
				<div className='bg-destructive/5 text-destructive rounded-xl p-6 text-sm'>
					<p>Could not load phone numbers — is your session still current?</p>
					{error instanceof Error ? (
						<p className='text-destructive/70 mt-1 break-words text-xs'>{error.message}</p>
					) : null}
					<Button variant='outline' size='sm' className='mt-3' onClick={() => refetch()} disabled={isRefetching}>
						{isRefetching ? <Loader2 className='mr-2 size-4 animate-spin' /> : null}
						Retry
					</Button>
				</div>
			) : nodes.length === 0 ? (
				<div className='bg-muted/30 rounded-xl p-6'>
					<p className='text-foreground text-sm font-medium'>No phone number linked yet</p>
					<p className='text-muted-foreground mt-1 text-sm'>
						Add one to sign in with a texted code instead of a password.
					</p>
				</div>
			) : (
				<div className='space-y-3'>
					{nodes.map((row) => (
						<PhoneRowItem key={row.id} row={row} isOnly={nodes.length === 1} />
					))}
				</div>
			)}
		</section>
	);
}
