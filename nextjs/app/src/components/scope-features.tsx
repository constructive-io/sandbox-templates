'use client';

// The membership-scope features the AppSpec opted into (src/config/scopes.ts):
// the workspace switcher, the access pages, entity panels and the user's
// pending invitations. With none of them, this file renders nothing extra and
// the app talks to no endpoint it didn't before.

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { PendingInvites } from '@/blocks/scope-access/pending-invites';
import { ScopeAccessProvider } from '@/blocks/scope-access/scope-access-provider';
import { useWorkspaceOrNull, WorkspaceProvider, WorkspaceSwitcher } from '@/blocks/scope-access/workspace';
import { activeWorkspaceId, subscribeWorkspace } from '@/blocks/scope-access/workspace-store';
import { scopeFeatures } from '@/config/scopes';
import { TokenManager } from '@/lib/auth/token-manager';
import { useSession } from '@/lib/auth/session';
import { setScopeResolver } from '@/lib/resources/scope';
import { runtimeConfig } from '@/lib/runtime/config';

const usesScopes = Boolean(scopeFeatures.workspace) || scopeFeatures.access.length > 0 || scopeFeatures.invitations;

const accessToken = () => TokenManager.read().token?.accessToken ?? null;

/** Records keyed to the workspace scope follow the switcher, and every list refetches when it moves. */
function WorkspaceBinding({ scope, children }: { scope: string; children: React.ReactNode }) {
	const queryClient = useQueryClient();
	React.useEffect(() => {
		setScopeResolver((wanted) => (wanted === scope ? activeWorkspaceId(scope) : null));
		const unsubscribe = subscribeWorkspace(() => {
			void queryClient.invalidateQueries({ queryKey: ['resource-kit'] });
		});
		return () => {
			unsubscribe();
			setScopeResolver(null);
		};
	}, [scope, queryClient]);
	return <WorkspaceProvider scope={scope}>{children}</WorkspaceProvider>;
}

/** Gives the scope blocks the app's endpoints and session, when the AppSpec uses any of them. */
export function ScopeFeaturesProvider({ children }: { children: React.ReactNode }) {
	const session = useSession();
	if (!usesScopes) return <>{children}</>;
	const host = {
		endpoints: {
			admin: runtimeConfig.adminEndpoint,
			auth: runtimeConfig.authEndpoint,
			data: runtimeConfig.appEndpoint,
		},
		userId: session.userId,
		getAccessToken: accessToken,
	};
	return (
		<ScopeAccessProvider host={host}>
			{scopeFeatures.workspace ? (
				<WorkspaceBinding scope={scopeFeatures.workspace}>{children}</WorkspaceBinding>
			) : (
				children
			)}
		</ScopeAccessProvider>
	);
}

/** The sidebar's workspace switcher, when the AppSpec has one. */
export function ScopeWorkspaceSwitcher({ collapsed }: { collapsed: boolean }) {
	if (!scopeFeatures.workspace || collapsed) return null;
	return (
		<div className='px-2 pb-2'>
			<WorkspaceSwitcher />
		</div>
	);
}

/** The invitations waiting for the user, on the dashboard; accepting one refreshes the data it opens. */
export function ScopeInvitations() {
	const queryClient = useQueryClient();
	if (!scopeFeatures.invitations) return null;
	return <InvitationsWithWorkspace onAccepted={() => void queryClient.invalidateQueries({ queryKey: ['resource-kit'] })} />;
}

function InvitationsWithWorkspace({ onAccepted }: { onAccepted: () => void }) {
	const workspace = useWorkspaceOrNull();
	return (
		<PendingInvites
			onAccepted={() => {
				workspace?.reload();
				onAccepted();
			}}
		/>
	);
}
