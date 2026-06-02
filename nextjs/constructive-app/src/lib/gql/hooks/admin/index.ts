/**
 * Admin hooks (BASE tier)
 *
 * The base auth:email app exposes only account-scoped admin hooks (current
 * user, app membership, account profile/email/delete). Organization,
 * members, and invite management are a b2b opt-in delivered via the registry
 * org blocks + the org modules — see docs/B2B.md — so none of those hooks
 * exist in the base.
 */

// App-level hooks (current user + app membership)
export {
	useCurrentUserAppMembership,
	useCurrentUser,
	appMembershipQueryKeys,
	currentUserQueryKeys,
	type AppMembership,
	type CurrentUser,
	type UseCurrentUserAppMembershipOptions,
	type UseCurrentUserAppMembershipResult,
	type UseCurrentUserOptions,
	type UseCurrentUserResult,
} from './app';

// Account hooks
export * from './account';
