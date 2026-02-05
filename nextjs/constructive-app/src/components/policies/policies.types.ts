import { MEMBERSHIP_TYPES, type MembershipType } from '@/lib/constants/membership-types';

export const POLICY_TYPE_KEYS = {
	AuthzAllowAll: 'AuthzAllowAll',
	AuthzDenyAll: 'AuthzDenyAll',
	AuthzDirectOwner: 'AuthzDirectOwner',
	/** @deprecated Use AuthzMembershipByField with membership_type: 2 instead. Kept for backwards compatibility. */
	OwnedRecords: 'OwnedRecords',
	AuthzDirectOwnerAny: 'AuthzDirectOwnerAny',
	AuthzArrayContainsActorByJoin: 'AuthzArrayContainsActorByJoin',
	AuthzMembershipByField: 'AuthzMembershipByField',
	AuthzMembershipByJoin: 'AuthzMembershipByJoin',
	AuthzMembership: 'AuthzMembership',
} as const;

export type PolicyTypeKey = (typeof POLICY_TYPE_KEYS)[keyof typeof POLICY_TYPE_KEYS];

export type PolicyStatus = 'active' | 'disabled';

export type Policy = {
	id: string;
	name: string;
	targetRole: string;
	privilege: string;
	status: PolicyStatus;
	policyType?: string;
};

export type PolicyTable = {
	id: string;
	name: string;
	useRls: boolean;
	policies: Policy[];
};

export type PolicyConditionData = {
	policyType: string;
	data: Record<string, unknown>;
};

export { MEMBERSHIP_TYPES };
export type { MembershipType };

export const MEMBERSHIP_TYPE_OPTIONS = [
	{
		value: MEMBERSHIP_TYPES.APP,
		label: 'App Member',
		description: 'Memberships to the app.',
	},
	{
		value: MEMBERSHIP_TYPES.ORGANIZATION,
		label: 'Organization Member',
		description: 'Membership to an organization.',
	},
	{
		value: MEMBERSHIP_TYPES.GROUP,
		label: 'Group Member',
		description: "User's membership to a group.",
	},
] as const;

export const POLICY_ROLES = [
	{ value: 'public', label: 'Public' },
	{ value: 'anonymous', label: 'Anonymous' },
	{ value: 'authenticated', label: 'Authenticated' },
	{ value: 'administrator', label: 'Administrator' },
] as const;

export type PolicyRole = (typeof POLICY_ROLES)[number]['value'];

export const POLICY_PRIVILEGES = [
	{ value: 'SELECT', label: 'Select' },
	{ value: 'INSERT', label: 'Insert' },
	{ value: 'UPDATE', label: 'Update' },
	{ value: 'DELETE', label: 'Delete' },
] as const;
