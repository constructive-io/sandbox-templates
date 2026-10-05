/**
 * Hook for fetching app and membership permissions
 * Tier 4 wrapper: Uses SDK hooks + cache invalidation
 *
 * The platform renamed permissions to capabilities (appPermissions →
 * appCapabilities, orgPermissions → orgCapabilities); this hook keeps its
 * permission-shaped result so its consumers are unchanged. The capability
 * catalog also carries achievement levels (`kind: 'level'`), which are not
 * grantable bits and are left out.
 */
import { useQuery } from '@tanstack/react-query';

import { fetchAppCapabilitiesQuery, fetchOrgCapabilitiesQuery } from '@/lib/gql/admin-compat';

export interface PermissionNode {
	bitnum: number | null;
	bitstr: string | null;
	description: string | null;
	id: string;
	name: string;
}

export type AppPermission = PermissionNode;
export type MembershipPermission = PermissionNode;

export const permissionsQueryKeys = {
	all: ['permissions'] as const,
};

export interface UsePermissionsOptions {
	enabled?: boolean;
}

export function usePermissions(options: UsePermissionsOptions = {}) {
	const isEnabled = options.enabled !== false;

	return useQuery<{ appPermissions: AppPermission[]; membershipPermissions: MembershipPermission[] }>({
		queryKey: permissionsQueryKeys.all,
		queryFn: async () => {
			// Fetch both permission types in parallel using SDK fetch functions
			const [appResult, orgResult] = await Promise.all([
				fetchAppCapabilitiesQuery({
					selection: {
						fields: {
							id: true,
							name: true,
							bitnum: true,
							bitstr: true,
							description: true,
							kind: true,
						},
						orderBy: ['NAME_ASC'],
					},
				}),
				fetchOrgCapabilitiesQuery({
					selection: {
						fields: {
							id: true,
							name: true,
							bitnum: true,
							bitstr: true,
							description: true,
							kind: true,
						},
						orderBy: ['NAME_ASC'],
					},
				}),
			]);

			const grantable = (node: { kind?: string | null }) => node.kind !== 'level';

			const appPermissions: AppPermission[] = (appResult.appCapabilities?.nodes ?? []).filter(grantable).map((node: any) => ({
				id: node.id ?? '',
				name: node.name ?? '',
				bitnum: node.bitnum ?? null,
				bitstr: node.bitstr ?? null,
				description: node.description ?? null,
			}));

			const membershipPermissions: MembershipPermission[] = (orgResult.orgCapabilities?.nodes ?? []).filter(grantable).map((node: any) => ({
				id: node.id ?? '',
				name: node.name ?? '',
				bitnum: node.bitnum ?? null,
				bitstr: node.bitstr ?? null,
				description: node.description ?? null,
			}));

			return {
				appPermissions,
				membershipPermissions,
			};
		},
		enabled: isEnabled,
		staleTime: 5 * 60 * 1000,
		refetchOnMount: isEnabled,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});
}
