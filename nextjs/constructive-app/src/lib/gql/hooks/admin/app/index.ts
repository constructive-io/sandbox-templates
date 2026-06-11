/**
 * App-level hooks (BASE tier)
 *
 * App-level context that sits above any per-app data: the current user and
 * their app membership (used for the `app-admin` route gate). The b2b app-admin
 * surfaces (app users / app settings / app invites) ship as the registry org
 * blocks + the org modules — see docs/B2B.md — not as hand-written hooks here.
 */

export {
	useCurrentUserAppMembership,
	appMembershipQueryKeys,
	type AppMembership,
	type UseCurrentUserAppMembershipOptions,
	type UseCurrentUserAppMembershipResult,
} from './use-current-user-app-membership';

export {
	useCurrentUser,
	currentUserQueryKeys,
	type CurrentUser,
	type UseCurrentUserOptions,
	type UseCurrentUserResult,
} from './use-current-user';
