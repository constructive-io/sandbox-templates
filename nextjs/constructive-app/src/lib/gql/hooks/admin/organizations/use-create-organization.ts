/**
 * Hook for creating a new organization
 * Tier 4 wrapper: Uses SDK hooks + cache invalidation
 *
 * Creating an organization is a single-step flow:
 *   1. createUser with type=2 (Organization)
 *      → The `type` column is in the INSERT GRANT, so it can be set
 *        at creation time but never updated afterwards.
 *      → A database trigger `membership_mbr_create` automatically
 *        creates the owner membership using jwt_public.current_user_id()
 *        as the owner.
 *   2. Fetch the auto-created membership by entityId
 *
 * No "convert" step, no direct SQL, no SECURITY DEFINER — the regular
 * PostGraphile `createUser` mutation accepts `type` as part of its input
 * because INSERT grants include the column (only UPDATE grants exclude it).
 */
import { useQueryClient } from '@tanstack/react-query';

import type { SchemaContext } from '@/app-config';
import { useCreateUserMutation } from '@sdk/auth';
import { fetchOrgMembershipsQuery } from '@sdk/admin';

import { ROLE_TYPE, type Organization } from './organization.types';
import { organizationsQueryKeys } from './use-organizations';

// TODO: Backend migration removed OrganizationSetting mutations
// These need backend consultation for proper replacement

/**
 * Input for creating a new organization
 */
export interface CreateOrganizationInput {
	/** Organization display name (required) */
	displayName: string;
	/** Organization username/slug (optional, for URL-friendly identifier) */
	username?: string;
	/** Organization settings (optional) */
	settings?: {
		legalName?: string;
		addressLineOne?: string;
		addressLineTwo?: string;
		city?: string;
		state?: string;
	};
}

/**
 * Result of organization creation
 */
export interface CreateOrganizationResult {
	organization: Organization;
	membershipId: string;
}

export interface UseCreateOrganizationOptions {
	/** Override schema context (defaults to admin) */
	context?: SchemaContext;
	/** Callback on successful creation */
	onSuccess?: (result: CreateOrganizationResult) => void;
	/** Callback on error */
	onError?: (error: Error) => void;
}

export interface UseCreateOrganizationResult {
	/** Function to create an organization */
	createOrganization: (input: CreateOrganizationInput) => Promise<CreateOrganizationResult>;
	/** Whether creation is in progress */
	isCreating: boolean;
	/** Error from last creation attempt */
	error: Error | null;
	/** Reset error state */
	reset: () => void;
}

/**
 * Hook for creating a new organization
 *
 * @example
 * ```tsx
 * const { createOrganization, isCreating, error } = useCreateOrganization({
 *   onSuccess: (result) => {
 *     toast.success(`Created ${result.organization.displayName}`);
 *     router.push(`/orgs/${result.organization.id}/databases`);
 *   },
 * });
 *
 * const handleSubmit = async (data: FormData) => {
 *   await createOrganization({
 *     displayName: data.name,
 *     settings: {
 *       legalName: data.legalName,
 *       city: data.city,
 *       state: data.state,
 *     },
 *   });
 * };
 * ```
 */
export function useCreateOrganization(options: UseCreateOrganizationOptions = {}): UseCreateOrganizationResult {
	const { context = 'admin', onSuccess, onError } = options;
	void context; // Context is handled by SDK execute-adapter
	const queryClient = useQueryClient();
	const createUserMutation = useCreateUserMutation({
		selection: { fields: { id: true, displayName: true, username: true } },
	});

	const createOrganization = async (input: CreateOrganizationInput): Promise<CreateOrganizationResult> => {
		// Step 1: Create User as Organization (type=2)
		// The `type` column is in the INSERT GRANT, so it can be set at creation.
		// The `membership_mbr_create` trigger fires on insert and creates the
		// owner membership automatically, using jwt_public.current_user_id()
		// as the owner (i.e. the caller).
		const userInput: { displayName: string; username?: string; type: number } = {
			displayName: input.displayName,
			type: ROLE_TYPE.ORGANIZATION,
		};
		if (input.username) {
			userInput.username = input.username;
		}
		const userResult = await createUserMutation.mutateAsync(userInput);

		const newOrg = userResult?.createUser?.user;
		if (!newOrg?.id) {
			throw new Error('Failed to create organization user');
		}

		// Step 2: Fetch the auto-created membership from the trigger
		let membershipId = '';
		try {
			const membershipsResult = await fetchOrgMembershipsQuery({
				selection: {
					fields: { id: true },
					where: { entityId: { equalTo: newOrg.id }, isOwner: { equalTo: true } },
					first: 1,
				},
			});
			membershipId = membershipsResult?.orgMemberships?.nodes?.[0]?.id ?? '';
		} catch {
			// Membership fetch failed, but org was created - continue
			console.warn('Failed to fetch auto-created membership, org creation succeeded');
		}

		// TODO: OrganizationSetting creation removed from schema
		// Settings creation needs backend consultation for proper replacement
		if (input.settings) {
			console.warn('useCreateOrganization: OrganizationSetting mutations removed from schema');
		}

		// Invalidate organizations list cache
		queryClient.invalidateQueries({ queryKey: organizationsQueryKeys.all });

		const organization: Organization = {
			id: newOrg.id,
			displayName: newOrg.displayName ?? null,
			username: newOrg.username ?? null,
			profilePicture: null,
			settings: null, // TODO: OrganizationSetting removed
			memberCount: 1, // Just the owner
		};
		const result: CreateOrganizationResult = { organization, membershipId };
		onSuccess?.(result);
		return result;
	};

	return {
		createOrganization: async (input: CreateOrganizationInput) => {
			try {
				return await createOrganization(input);
			} catch (error) {
				onError?.(error as Error);
				throw error;
			}
		},
		isCreating: createUserMutation.isPending,
		error: createUserMutation.error,
		reset: createUserMutation.reset,
	};
}
