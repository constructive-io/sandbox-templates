'use client';

// A signed-in person whose app membership isn't active yet (an app that
// approves new members by hand) sees why, in place of screens whose every
// write the database would refuse. Owners and active members never notice
// it, and an app without an admin endpoint skips the check.

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { HourglassIcon, LogOutIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { signOut } from '@/lib/auth/auth-api';
import { useSession } from '@/lib/auth/session';
import { graphqlRequest } from '@/lib/graphql/request';
import { runtimeConfig } from '@/lib/runtime/config';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/workspace-kit';

type Membership = { isActive: boolean; isApproved: boolean; isBanned: boolean; isDisabled: boolean };

const MY_MEMBERSHIP = `query AppMembershipOfUser($actorId: UUID!) {
	appMemberships(where: { actorId: { equalTo: $actorId } }, first: 1) {
		nodes { isActive isApproved isBanned isDisabled }
	}
}`;

// The membership, or null when there is nothing to judge by: no admin endpoint, or the read failed.
async function fetchMembership(actorId: string): Promise<Membership | null> {
	const result = await graphqlRequest<{ appMemberships?: { nodes?: Membership[] } }>(
		runtimeConfig.adminEndpoint,
		MY_MEMBERSHIP,
		{ actorId },
	);
	return result.ok ? (result.data.appMemberships?.nodes?.[0] ?? null) : null;
}

function reason(membership: Membership): { title: string; description: string } {
	if (membership.isBanned) {
		return { title: 'Your access was removed', description: 'An admin of this app removed your access.' };
	}
	if (membership.isDisabled) {
		return { title: 'Your access is paused', description: 'An admin of this app paused your access. Ask them to turn it back on.' };
	}
	if (!membership.isApproved) {
		return {
			title: 'Waiting for approval',
			description: 'Your account is ready. An admin of this app approves new members; you can use it once they do.',
		};
	}
	return { title: 'Your access isn’t active yet', description: 'Finish setting up your account, or ask an admin of this app.' };
}

export function ApprovalGate({ children }: { children: React.ReactNode }) {
	const session = useSession();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { data: membership } = useQuery({
		queryKey: ['app-membership', session.userId],
		queryFn: () => fetchMembership(session.userId as string),
		enabled: Boolean(session.userId),
		// An admin may approve while the page is open.
		refetchInterval: (query) => (query.state.data && !query.state.data.isActive ? 15_000 : false),
	});

	if (!membership || membership.isActive) return <>{children}</>;
	const { title, description } = reason(membership);
	return (
		<div className='grid h-dvh place-items-center bg-background p-6'>
			<EmptyState
				icon={HourglassIcon}
				title={title}
				description={description}
				action={
					<Button
						size='sm'
						variant='outline'
						onClick={async () => {
							await signOut();
							queryClient.clear();
							router.replace('/sign-in');
						}}
					>
						<LogOutIcon aria-hidden='true' />
						Sign out
					</Button>
				}
			/>
		</div>
	);
}
