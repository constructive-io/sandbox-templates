// The entity a record's `$scope:<scope>` key takes: the active organization
// when the app has a workspace switcher, else the signed-in user's own id,
// which is also their personal organization.
//
// The shell registers a resolver when the AppSpec opts into a workspace
// (`ui.workspace`); until then nothing here knows about workspaces. While a
// resolver is registered, lists show the active workspace's records only.

import { currentUserId } from '../auth/token-manager.ts';

type Resolver = (scope: string) => string | null;

/** What the AppSpec opts into, as `src/config/scopes.ts` records it. */
export type ScopeFeatureConfig = {
	/** The scope the workspace switcher picks; null without one. */
	workspace: string | null;
	/** Scopes with an access page. */
	access: readonly string[];
	/** Whether the dashboard shows the user's pending invitations. */
	invitations: boolean;
};

let resolver: Resolver | null = null;

/** Set by the workspace switcher; null removes it. */
export function setScopeResolver(next: Resolver | null): void {
	resolver = next;
}

export type ActiveScope = {
	/** The id a `$scope:<scope>` key takes on create. */
	id(scope: string): string | null;
	/** Whether lists keep to the active entity: only while a switcher picks it. */
	filtered(): boolean;
};

export const activeScope: ActiveScope = {
	id: (scope) => resolver?.(scope) ?? currentUserId(),
	filtered: () => resolver !== null,
};
