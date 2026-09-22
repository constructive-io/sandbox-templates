'use client';

import * as React from 'react';

import {
	useOrgMembers,
	useOrgInvites,
	useOrgClaimedInvites,
	useSendOrgInvite,
	useCancelOrgInvite,
	type OrgMember,
	type OrgMemberStatus,
	type OrgInvite,
	type OrgClaimedInvite,
} from '@/lib/gql/hooks/admin';
import {
	useDeleteOrgMembershipMutation,
	useUpdateOrgMembershipMutation,
} from '@/lib/gql/admin-compat';
import { useEntityParams } from '@/lib/navigation';

import type {
	FeatureActionPolicy,
	FeaturePackError,
	FeaturePackResource,
} from '@/blocks/feature-packs/shared/feature-pack-contracts';
import { normalizeFeaturePackError } from '@/blocks/feature-packs/shared/feature-pack-contracts';
import { OrganizationsFeaturePack } from '@/blocks/feature-packs/organizations/organizations-feature-pack';
import type {
	OrganizationClaimedInvite as FPClaimedInvite,
	OrganizationInvite as FPInvite,
	OrganizationMember as FPMember,
	OrganizationMembershipStatus as FPMemberStatus,
	OrganizationGovernance,
	OrganizationsFeatureActions,
	OrganizationsFeatureData,
	OrganizationsFeaturePackProps,
	OrganizationsSection,
} from '@/blocks/feature-packs/organizations/organizations-contracts';

// ---------------------------------------------------------------------------
// Type mapping: hook types -> feature-pack contract types
// ---------------------------------------------------------------------------

function mapGovernance(role: OrgMember['role']): OrganizationGovernance {
	if (role === 'owner') return 'owner';
	if (role === 'admin') return 'admin';
	return 'member';
}

function mapMemberStatus(status: OrgMemberStatus): FPMemberStatus {
	switch (status) {
		case 'active':
			return 'active';
		case 'inactive':
			return 'inactive';
		case 'pending_approval':
			return 'pending';
		case 'banned':
			return 'banned';
		case 'disabled':
			return 'disabled';
	}
}

function mapMember(m: OrgMember): FPMember {
	return {
		id: m.membershipId,
		userId: m.actorId,
		name: m.displayName ?? m.username ?? 'Unknown',
		email: m.username ?? '',
		avatarUrl: typeof m.profilePicture === 'string' ? m.profilePicture : undefined,
		governance: mapGovernance(m.role),
		status: mapMemberStatus(m.status),
		isApproved: m.flags.isApproved,
		isBanned: m.flags.isBanned,
		isDisabled: m.flags.isDisabled,
		isActive: m.flags.isActive,
		isExternal: false,
		isReadOnly: false,
	};
}

function mapInvite(invite: OrgInvite): FPInvite {
	const status: FPInvite['status'] = (() => {
		switch (invite.status) {
			case 'pending':
				return 'pending';
			case 'expired':
				return 'expired';
			case 'claimed':
				return 'claimed';
		}
	})();

	return {
		id: invite.id,
		channel: 'email',
		recipient: invite.email ?? '',
		email: invite.email ?? undefined,
		token: invite.inviteToken || undefined,
		status,
		expiresAt: invite.expiresAt || undefined,
		multiple: invite.inviteLimit > 1,
		inviteLimit: invite.inviteLimit || undefined,
		inviteCount: invite.inviteCount || undefined,
		isReadOnly: invite.role === 'member',
		actionPolicy: { cancelInvite: true },
	};
}

function mapClaimedInvite(ci: OrgClaimedInvite): FPClaimedInvite {
	return {
		id: ci.id,
		senderId: ci.sender?.id ?? '',
		receiverId: ci.receiver?.id ?? '',
		createdAt: ci.createdAt || undefined,
	};
}

// ---------------------------------------------------------------------------
// Adapter component
// ---------------------------------------------------------------------------

export interface OrgFeaturePackAdapterProps {
	orgId: string;
	section: OrganizationsSection;
	onError?: (error: FeaturePackError) => void;
}

export function OrgFeaturePackAdapter({ orgId, section, onError }: OrgFeaturePackAdapterProps) {
	const { organization } = useEntityParams();

	// Data hooks
	const {
		members,
		isLoading: membersLoading,
		error: membersError,
		refetch: refetchMembers,
	} = useOrgMembers({ orgId, first: 100 });

	const {
		invites,
		isLoading: invitesLoading,
		error: invitesError,
		refetch: refetchInvites,
	} = useOrgInvites({ orgId, first: 100 });

	const {
		claimedInvites,
		isLoading: claimedLoading,
		error: claimedError,
		refetch: refetchClaimed,
	} = useOrgClaimedInvites({ orgId, first: 100 });

	// Mutation hooks
	const sendInvite = useSendOrgInvite();
	const cancelInvite = useCancelOrgInvite();
	const updateMembershipMutation = useUpdateOrgMembershipMutation({
		selection: { fields: { id: true } },
	});
	const deleteMembershipMutation = useDeleteOrgMembershipMutation({
		selection: { fields: { id: true } },
	});

	const isLoading = membersLoading || invitesLoading || claimedLoading;
	const error = membersError ?? invitesError ?? claimedError;

	// Build the resource
	const resource: FeaturePackResource<OrganizationsFeatureData> = React.useMemo(() => {
		if (isLoading) return { status: 'loading' };

		if (error) {
			return {
				status: 'error',
				error: normalizeFeaturePackError(error, 'Failed to load organization data'),
				retry: () => {
					refetchMembers();
					refetchInvites();
					refetchClaimed();
				},
			};
		}

		const data: OrganizationsFeatureData = {
			organizations: [
				{
					id: orgId,
					name: organization?.name ?? 'Organization',
					source: 'constructive-membership',
				},
			],
			activeOrganizationId: orgId,
			members: members.map(mapMember),
			invites: invites.map(mapInvite),
			claimedInvites: claimedInvites.map(mapClaimedInvite),
		};

		if (data.members.length === 0 && (!data.invites || data.invites.length === 0)) {
			return { status: 'empty' };
		}

		return { status: 'ready', data, quality: 'authoritative' };
	}, [
		isLoading,
		error,
		members,
		invites,
		claimedInvites,
		orgId,
		organization?.name,
		refetchMembers,
		refetchInvites,
		refetchClaimed,
	]);

	// Build the actions
	const actions: OrganizationsFeatureActions = React.useMemo(
		() => ({
			inviteMember: async (input) => {
				try {
					const expiresAt =
						input.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
					await sendInvite.sendInvite({
						orgId: input.organizationId,
						email: input.recipient ?? '',
						expiresAt,
					});
				} catch (err) {
					onError?.(normalizeFeaturePackError(err, 'Failed to send invite'));
				}
			},
			cancelInvite: async (input) => {
				try {
					await cancelInvite.cancelInvite({
						orgId: input.organizationId,
						inviteId: input.inviteId,
					});
				} catch (err) {
					onError?.(normalizeFeaturePackError(err, 'Failed to cancel invite'));
				}
			},
			updateMemberLifecycle: async (input) => {
				try {
					await updateMembershipMutation.mutateAsync({
						id: input.membershipId,
						orgMembershipPatch: {
							isApproved: input.patch.isApproved,
							isBanned: input.patch.isBanned,
							isDisabled: input.patch.isDisabled,
						},
					});
				} catch (err) {
					onError?.(normalizeFeaturePackError(err, 'Failed to update member'));
				}
			},
			removeMember: async (input) => {
				try {
					await deleteMembershipMutation.mutateAsync({ id: input.membershipId });
				} catch (err) {
					onError?.(normalizeFeaturePackError(err, 'Failed to remove member'));
				}
			},
			setMemberAdmin: async (input) => {
				try {
					// Feature pack passes actorId (user ID); look up membership ID
					const member = members.find((m) => m.actorId === input.actorId);
					if (!member) return;
					await updateMembershipMutation.mutateAsync({
						id: member.membershipId,
						orgMembershipPatch: { isAdmin: input.isGrant },
					});
				} catch (err) {
					onError?.(normalizeFeaturePackError(err, 'Failed to update admin status'));
				}
			},
			setMemberOwner: async (input) => {
				try {
					// Feature pack passes actorId (user ID); look up membership ID
					const member = members.find((m) => m.actorId === input.actorId);
					if (!member) return;
					await updateMembershipMutation.mutateAsync({
						id: member.membershipId,
						orgMembershipPatch: { isOwner: input.isGrant },
					});
				} catch (err) {
					onError?.(normalizeFeaturePackError(err, 'Failed to update owner status'));
				}
			},
		}),
		[
			sendInvite,
			cancelInvite,
			updateMembershipMutation,
			deleteMembershipMutation,
			members,
			onError,
		],
	);

	// Build the policy — the current user's role determines what they can do
	const policy: FeatureActionPolicy = React.useMemo(() => {
		const role = organization?._raw?.role ?? organization?.role;
		const canManage = role === 'owner' || role === 'admin';

		return {
			createOrganization: false,
			selectOrganization: false,
			updateOrganization: canManage,
			deleteOrganization: role === 'owner',
			leaveOrganization: true,
			inviteMember: canManage,
			assignInviteProfile: false,
			cancelInvite: canManage,
			approveMember: canManage,
			banMember: canManage,
			disableMember: canManage,
			markMemberExternal: false,
			markMemberReadOnly: false,
			removeMember: canManage,
			grantAdmin: role === 'owner',
			grantOwner: role === 'owner',
			assignProfile: false,
			grantPermission: false,
			updateMemberProfile: canManage,
			createAccessProfile: false,
			updateAccessProfile: false,
			deleteAccessProfile: false,
			setProfilePermission: false,
			updateMembershipSettings: canManage,
			updateMembershipDefault: canManage,
			setHierarchyEdge: false,
			removeHierarchyEdge: false,
			createOrganizationApiKey: false,
			createOrganizationPrincipal: false,
			revokeOrganizationApiKey: false,
			revokeOrganizationPrincipal: false,
		};
	}, [organization]);

	const featurePackProps: OrganizationsFeaturePackProps = {
		resource,
		policy,
		actions,
		section,
		onError,
	};

	return (
		<div className='p-6'>
			<OrganizationsFeaturePack {...featurePackProps} />
		</div>
	);
}
