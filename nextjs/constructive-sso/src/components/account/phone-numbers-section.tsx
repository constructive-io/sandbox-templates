'use client';

import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { AccountPhoneNumbers } from '@/blocks/account/account-phone-numbers/account-phone-numbers';
import type {
	AccountPhoneNumber,
	AccountPhoneNumbersAdapter
} from '@/blocks/account/account-phone-numbers/account-phone-numbers-contracts';
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { StepUpCodeForm } from '@/components/auth/step-up-code-form';
import { isCodeStepUp } from '@/lib/auth/step-up';
import {
	useCreatePhoneNumberMutation,
	useDeletePhoneNumberMutation,
	usePhoneNumbersQuery,
	useUpdatePhoneNumberMutation
} from '@sdk/auth';
import { executeAuth } from '@/graphql/execute';

const PHONE_FIELDS = {
	id: true,
	number: true,
	isVerified: true,
	isPrimary: true
} as const;

type PhoneRow = {
	id: string;
	number: string;
	isVerified: boolean;
	isPrimary: boolean;
};

const toRow = (row: PhoneRow): AccountPhoneNumber => ({
	id: row.id,
	number: row.number,
	isVerified: row.isVerified,
	isPrimary: row.isPrimary
});

/**
 * The raw auth lane as a typed promise — for operations the live schema
 * carries but this app's codegen targets do not emit yet.
 */
async function authMutation<T>(document: string, variables: Record<string, unknown>): Promise<T | null> {
	return (await executeAuth(document, variables)) as T | null;
}

/**
 * The account-phone-numbers block, wired to this app's auth schema: CRUD
 * through the generated SDK hooks, the texted-code pair through the
 * `sendPhoneVerificationCode` / `verifyPhone` mutations, and primary selection
 * through the two-step update the partial unique index demands (clear the old
 * primary, then raise the new one).
 *
 * Adding a number is a step-up-guarded INSERT (#2163: identifiers need a
 * fresh sign-in): a stale session is refused with STEP_UP_REQUIRED_FRESH_AUTH,
 * which this section answers with the code dialog (a texted or emailed code
 * satisfies fresh_auth) and one retry — never a raw refusal in the form.
 */
export function PhoneNumbersSection() {
	const queryClient = useQueryClient();
	const { data, refetch } = usePhoneNumbersQuery({
		selection: { fields: { ...PHONE_FIELDS }, first: 20 }
	});
	const { mutateAsync: createPhoneNumber } = useCreatePhoneNumberMutation({
		selection: { fields: { ...PHONE_FIELDS } }
	});
	const { mutateAsync: updatePhoneNumber } = useUpdatePhoneNumberMutation({
		selection: { fields: { ...PHONE_FIELDS } }
	});
	const { mutateAsync: deletePhoneNumber } = useDeletePhoneNumberMutation({
		selection: { fields: { id: true } }
	});

	// The step-up dialog as a promise the adapter's add can await: resolves
	// true once a code is accepted, false when the user walks away.
	const stepUpResolve = useRef<((verified: boolean) => void) | null>(null);
	const [stepUpOpen, setStepUpOpen] = useState(false);
	const requestStepUp = (): Promise<boolean> =>
		new Promise((resolve) => {
			stepUpResolve.current = resolve;
			setStepUpOpen(true);
		});
	const settleStepUp = (verified: boolean) => {
		setStepUpOpen(false);
		stepUpResolve.current?.(verified);
		stepUpResolve.current = null;
	};

	const rows = (): PhoneRow[] => (data?.phoneNumbers?.nodes ?? []) as PhoneRow[];
	const reload = async (): Promise<AccountPhoneNumber[]> => {
		const fresh = await refetch();
		return ((fresh.data?.phoneNumbers?.nodes ?? []) as PhoneRow[]).map(toRow);
	};

	const adapter: AccountPhoneNumbersAdapter = {
		// Fetch, never snapshot: the block lists once on mount, before the
		// query's first response arrives — a snapshot would hand it an empty
		// list it never re-reads.
		list: () => reload(),
		add: async ({ number }) => {
			const existing = await reload();
			const create = () =>
				createPhoneNumber({
					cc: '+',
					number,
					// The platform's writers store cc '+' with the full E.164 in
					// `number` — sign-in and verification both match on that shape,
					// and the block's contract calls `number` E.164.
					isPrimary: existing.length === 0
				});
			let created;
			try {
				created = await create();
			} catch (cause) {
				// A code can answer the fresh-auth demand; anything else is the
				// block's to show as it is.
				if (!isCodeStepUp(cause)) throw cause;
				if (!(await requestStepUp())) {
					throw new Error('Verification cancelled — the number was not added.');
				}
				created = await create();
			}
			queryClient.invalidateQueries({ queryKey: ['phoneNumbers'] });
			const row = created.createPhoneNumber?.phoneNumber as PhoneRow | undefined;
			return toRow(row ?? { id: '', number, isVerified: false, isPrimary: existing.length === 0 });
		},
		// The texted-code pair ships on the live auth schema but no codegen
		// target of this app emits it yet, so both go through the raw auth
		// lane as documents — the schema is the contract, not the SDK.
		sendCode: async ({ number }) => {
			const result = (await executeAuth(
				'mutation SendPhoneVerificationCode($input: SendPhoneVerificationCodeInput!) { sendPhoneVerificationCode(input: $input) { result } }',
				{ input: { phone: number } }
			)) as { sendPhoneVerificationCode?: { result?: boolean | null } } | null;
			return Boolean(result?.sendPhoneVerificationCode?.result);
		},
		verify: async ({ number, code }) => {
			const result = (await executeAuth(
				'mutation VerifyPhone($input: VerifyPhoneInput!) { verifyPhone(input: $input) { result } }',
				{ input: { phone: number, code } }
			)) as { verifyPhone?: { result?: boolean | null } } | null;
			return Boolean(result?.verifyPhone?.result);
		},
		remove: async ({ id }) => {
			await deletePhoneNumber({ id });
			queryClient.invalidateQueries({ queryKey: ['phoneNumbers'] });
		},
		setPrimary: async ({ id }) => {
			const current = rows().find((row) => row.isPrimary && row.id !== id);
			// One primary per account (a partial unique index enforces it), so
			// clear the old one before raising the new.
			if (current) {
				await updatePhoneNumber({ id: current.id, phoneNumberPatch: { isPrimary: false } });
			}
			await updatePhoneNumber({ id, phoneNumberPatch: { isPrimary: true } });
			await reload();
		}
	};

	return (
		<>
			<AccountPhoneNumbers adapter={adapter} identityKey="account" />
			<AlertDialog open={stepUpOpen} onOpenChange={(open) => !open && settleStepUp(false)}>
				<AlertDialogContent className='sm:max-w-md gap-0 p-0 overflow-hidden'>
					<AlertDialogHeader className='px-6 pt-6 pb-4'>
						<AlertDialogTitle className='text-lg font-semibold tracking-tight'>Verify it&apos;s you</AlertDialogTitle>
						<AlertDialogDescription className='text-sm text-muted-foreground pt-1'>
							Adding a phone number needs a fresh verification — a stale session is not enough.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className='px-6 pb-6'>
						<StepUpCodeForm onVerified={() => settleStepUp(true)} onCancel={() => settleStepUp(false)} />
					</div>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
