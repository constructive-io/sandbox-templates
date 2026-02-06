export type DatabaseSection = 'schemas' | 'data' | 'services' | 'security' | 'settings';

const SECTION_REGEX = /(schemas|data|services|security|settings)/;

export const DATABASE_SECTION_ROUTE_KEYS = {
	schemas: 'ORG_DATABASE_SCHEMAS',
	data: 'ORG_DATABASE_DATA',
	services: 'ORG_DATABASE_SERVICES',
	security: 'ORG_DATABASE_SECURITY',
	settings: 'ORG_DATABASE_SETTINGS',
} as const;

export function getDatabaseRouteKeyFromSection(
	section: DatabaseSection | null,
	fallback: DatabaseSection = 'schemas',
): (typeof DATABASE_SECTION_ROUTE_KEYS)[DatabaseSection] {
	return DATABASE_SECTION_ROUTE_KEYS[section ?? fallback];
}

export function getDatabaseSectionFromPathname(pathname: string): DatabaseSection | null {
	// Org-scoped routes: /orgs/[orgId]/databases/[databaseId]/<section>
	const orgMatch = pathname.match(
		/^\/orgs\/[^/]+\/databases\/[^/]+\/(schemas|data|services|security|settings)(?:\/|$)/,
	);
	if (orgMatch?.[1]) return orgMatch[1] as DatabaseSection;

	// If the pathname ends exactly with database root, treat as no section
	if (pathname.match(/^\/orgs\/[^/]+\/databases\/[^/]+\/?$/)) {
		return null;
	}

	// Fallback: try to locate any known section token
	const fallback = pathname.match(SECTION_REGEX)?.[1];
	return (fallback as DatabaseSection | undefined) ?? null;
}
