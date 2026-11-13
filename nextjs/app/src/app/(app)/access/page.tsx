'use client';

// Members, invitations and profiles of the scopes the AppSpec lists in
// `ui.access`: the app's own (who may use the app, and approving sign-ups),
// and the active organization's.

import { useState } from 'react';
import { ShieldCheckIcon } from 'lucide-react';

import { ScopeAccessPanel } from '@/blocks/scope-access/scope-access-panel';
import { useWorkspaceOrNull } from '@/blocks/scope-access/workspace';
import { EmptyState, Segmented, ViewFrame } from '@/components/ui/workspace-kit';
import { scopeFeatures } from '@/config/scopes';

const LABELS: Record<string, string> = { app: 'App', org: 'Organization' };
const label = (scope: string) => LABELS[scope] ?? scope.replace(/_/g, ' ').replace(/^./, (first) => first.toUpperCase());

function OrganizationAccess() {
	const workspace = useWorkspaceOrNull();
	const active = workspace?.active;
	if (!active || active.personal) {
		return (
			<EmptyState
				icon={ShieldCheckIcon}
				title='Pick an organization'
				description='Choose an organization in the sidebar to manage its members and invitations.'
			/>
		);
	}
	return <ScopeAccessPanel entityId={active.id} key={active.id} scope='org' title={`${active.name} access`} />;
}

export default function AccessPage() {
	const scopes = scopeFeatures.access.filter((scope) => scope === 'app' || scope === 'org');
	const [scope, setScope] = useState(scopes[0] ?? 'app');
	if (scopes.length === 0) {
		return (
			<ViewFrame icon={ShieldCheckIcon} title='Access'>
				<EmptyState icon={ShieldCheckIcon} title='No access pages' description='This app manages no memberships here.' />
			</ViewFrame>
		);
	}
	return (
		<ViewFrame
			icon={ShieldCheckIcon}
			title='Access'
			actions={
				scopes.length > 1 ? (
					<Segmented
						label='Whose members'
						value={scope}
						options={scopes.map((value) => ({ value, label: label(value) }))}
						onChange={setScope}
					/>
				) : null
			}
		>
			{scope === 'org' ? <OrganizationAccess /> : <ScopeAccessPanel scope='app' />}
		</ViewFrame>
	);
}
