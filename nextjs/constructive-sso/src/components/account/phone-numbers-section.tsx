'use client';

import { useQueryClient } from '@tanstack/react-query';

import { AccountPhoneNumbers } from '@/blocks/account/account-phone-numbers/account-phone-numbers';
import type {
	AccountPhoneNumber,
	AccountPhoneNumbersAdapter
} from '@/blocks/account/account-phone-numbers/account-phone-numbers-contracts';
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

	const rows = (): PhoneRow[] => (data?.phoneNumbers?.nodes ?? []) as PhoneRow[];
	const reload = async (): Promise<AccountPhoneNumber[]> => {
		const fresh = await refetch();
		return ((fresh.data?.phoneNumbers?.nodes ?? []) as PhoneRow[]).map(toRow);
	};

	const adapter: AccountPhoneNumbersAdapter = {
		list: () => Promise.resolve(rows().map(toRow)),
		add: async ({ number }) => {
			const created = await createPhoneNumber({ cc: '+', number, isPrimary: rows().length === 0 });
			queryClient.invalidateQueries({ queryKey: ['phoneNumbers'] });
			return toRow(created as unknown as PhoneRow);
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

	return <AccountPhoneNumbers adapter={adapter} identityKey="account" />;
}
