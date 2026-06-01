/**
 * Admin SDK compatibility layer (flow-aware degradation).
 *
 * WHY THIS EXISTS
 * ---------------
 * This template ships an org / invite / members / settings surface that imports
 * Org* and App-invite hooks from the generated admin SDK (`@sdk/admin`). Those
 * exports only exist when the database is provisioned with the b2b modules
 * (organizations, memberships, invites, permission defaults).
 *
 * For a minimal flow (e.g. auth:email) the org/invite tables are NOT provisioned,
 * so codegen produces an admin SDK *without* those symbols — and the template
 * would fail `tsc --noEmit` / `next build` on the missing imports.
 *
 * Rather than fork the template per flow, every org/invite/app hook imports the
 * at-risk symbols from THIS module instead of `@sdk/admin` directly. Here we:
 *
 *   1. `export *` everything the real SDK provides (so app/auth-shared admin
 *      hooks — memberships, permissions, configure — keep their real types).
 *   2. For each symbol that exists only in the b2b SDK, export a value that
 *      resolves to the REAL export when present and falls back to a loud stub
 *      when absent. The explicit export shadows the star-export of the same
 *      name (legal in ES modules), so:
 *        - b2b build  → symbol exists → real hook/fn is used at runtime.
 *        - minimal build → symbol absent → stub keeps the dead template code
 *          type-checking; it is never reached on the runtime path (home, login,
 *          todos, the auth blocks) and throws loudly if ever invoked.
 *
 * This file lives OUTSIDE `src/graphql/sdk/` so `pnpm codegen` (which wipes the
 * generated SDK dirs) never clobbers it.
 *
 * Org features "light up" automatically: when you provision the b2b modules and
 * re-run codegen, the real exports appear and these fallbacks become pass-throughs.
 */
import * as adminSdk from '@sdk/admin';

// Re-export everything the real SDK provides. EXISTS-in-every-flow symbols
// (useAppMembershipsQuery, useUpdateAppMembershipMutation, configure, …) come
// through here with their real, strongly-typed signatures.
export * from '@sdk/admin';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Namespace view used to read possibly-absent exports without a TS2305
// ("has no exported member") error. Missing members read as `undefined`.
const sdk = adminSdk as Record<string, any>;

const NOT_PROVISIONED =
	'This admin operation requires the b2b modules (organizations / memberships / ' +
	'invites), which the current flow does not provision. Provision the b2b modules ' +
	'and re-run codegen to enable it.';

// React-Query-shaped stub hook. Typed `any` so the dead template consumers
// (which destructure .data.nodes, .mutateAsync, .isPending, .error, .reset, …)
// still type-check. Never rendered on a minimal flow's runtime path; throws
// NOT_PROVISIONED if a mutation is actually invoked.
const stubHook = (..._args: unknown[]): any => ({
	data: undefined,
	isLoading: false,
	isPending: false,
	isError: true,
	isSuccess: false,
	error: new Error(NOT_PROVISIONED),
	reset: () => {},
	refetch: () => Promise.resolve({ data: undefined }),
	mutate: () => {
		throw new Error(NOT_PROVISIONED);
	},
	mutateAsync: () => Promise.reject(new Error(NOT_PROVISIONED)),
});

const stubFetch = (..._args: unknown[]): Promise<any> => Promise.reject(new Error(NOT_PROVISIONED));

const stubQueryKey = (..._args: unknown[]): any => ['__b2b_not_provisioned__'];

// Resolve to the real export when the b2b SDK provides it, else the typed stub.
const pickHook = (name: string): any => sdk[name] ?? stubHook;
const pickFetch = (name: string): any => sdk[name] ?? stubFetch;
const pickQueryKey = (name: string): any => sdk[name] ?? stubQueryKey;

// ---- Organizations: memberships, permissions ----
export const fetchOrgMembershipsQuery = pickFetch('fetchOrgMembershipsQuery');
export const fetchOrgPermissionsQuery = pickFetch('fetchOrgPermissionsQuery');
export const useOrgMembershipDefaultsQuery = pickHook('useOrgMembershipDefaultsQuery');
export const useCreateOrgMembershipDefaultMutation = pickHook('useCreateOrgMembershipDefaultMutation');
export const useUpdateOrgMembershipDefaultMutation = pickHook('useUpdateOrgMembershipDefaultMutation');
export const orgMembershipDefaultsQueryKey = pickQueryKey('orgMembershipDefaultsQueryKey');
export const useOrgPermissionDefaultsQuery = pickHook('useOrgPermissionDefaultsQuery');
export const useCreateOrgPermissionDefaultMutation = pickHook('useCreateOrgPermissionDefaultMutation');
export const useUpdateOrgPermissionDefaultMutation = pickHook('useUpdateOrgPermissionDefaultMutation');
export const orgPermissionDefaultsQueryKey = pickQueryKey('orgPermissionDefaultsQueryKey');
export const useUpdateOrgMembershipMutation = pickHook('useUpdateOrgMembershipMutation');
export const useDeleteOrgMembershipMutation = pickHook('useDeleteOrgMembershipMutation');

// ---- Organization invites ----
export const fetchOrgInvitesQuery = pickFetch('fetchOrgInvitesQuery');
export const fetchOrgClaimedInvitesQuery = pickFetch('fetchOrgClaimedInvitesQuery');
export const useCreateOrgInviteMutation = pickHook('useCreateOrgInviteMutation');
export const useUpdateOrgInviteMutation = pickHook('useUpdateOrgInviteMutation');
export const useDeleteOrgInviteMutation = pickHook('useDeleteOrgInviteMutation');
export const useSubmitOrgInviteCodeMutation = pickHook('useSubmitOrgInviteCodeMutation');

// ---- App invites ----
export const fetchAppInvitesQuery = pickFetch('fetchAppInvitesQuery');
export const fetchAppClaimedInvitesQuery = pickFetch('fetchAppClaimedInvitesQuery');
export const useCreateAppInviteMutation = pickHook('useCreateAppInviteMutation');
export const useUpdateAppInviteMutation = pickHook('useUpdateAppInviteMutation');
export const useDeleteAppInviteMutation = pickHook('useDeleteAppInviteMutation');
export const useSubmitAppInviteCodeMutation = pickHook('useSubmitAppInviteCodeMutation');

/* eslint-enable @typescript-eslint/no-explicit-any */
