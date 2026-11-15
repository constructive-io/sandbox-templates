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
import { activeWorkspaceId, setWorkspaceUser, subscribeWorkspace } from '@/blocks/scope-access/workspace-store';
import { scopeFeatures } from '@/config/scopes';
import { TokenManager } from '@/lib/auth/token-manager';
import { useSession } from '@/lib/auth/session';
import { setScopeResolver } from '@/lib/resources/scope';
import { runtimeConfig } from '@/lib/runtime/config';

const usesScopes = Boolean(scopeFeatures.workspace) || scopeFeatures.access.length > 0 || scopeFeatures.invitations;

const accessToken = () => TokenManager.read().token?.accessToken ?? null;

/**
 * Records keyed to the workspace scope follow the switcher. The store's user
 * and the resolver go in before the pages under it mount: React runs a child's
 * effects before its parent's, so a page's first list would otherwise load
 * with no workspace applied. When the workspace moves, the pages mount again
 * and every query refetches, so a page that read the workspace once while it
 * rendered (a custom page's query key) reads the new one.
 */
function WorkspaceBinding({
	scope,
	userId,
	children,
}: {
	scope: string;
	userId: string | null;
	children: React.ReactNode;
}) {
	const queryClient = useQueryClient();
	const [bound, setBound] = React.useState(false);
	const activeId = React.useSyncExternalStore(
		subscribeWorkspace,
		() => activeWorkspaceId(scope),
		() => null,
	);
	React.useEffect(() => {
		setWorkspaceUser(userId);
		setScopeResolver((wanted) => (wanted === scope ? activeWorkspaceId(scope) : null));
		setBound(true);
		let active = activeWorkspaceId(scope);
		const unsubscribe = subscribeWorkspace(() => {
			const next = activeWorkspaceId(scope);
			if (next === active) return;
			active = next;
			void queryClient.invalidateQueries();
		});
		return () => {
			unsubscribe();
			setScopeResolver(null);
		};
	}, [scope, userId, queryClient]);
	return (
		<WorkspaceProvider scope={scope}>
			{bound ? <React.Fragment key={activeId ?? 'none'}>{children}</React.Fragment> : null}
		</WorkspaceProvider>
	);
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
				<WorkspaceBinding scope={scopeFeatures.workspace} userId={session.userId}>
					{children}
				</WorkspaceBinding>
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
