/**
 * Hook for fetching database sites and apps with modules/themes
 * @migrated Uses execute() from @constructive-io/graphql-codegen
 * Note: Uses raw GraphQL for complex nested query not in SDK
 */

import { useQuery } from '@tanstack/react-query';

import { executeSb } from '@/graphql/execute';

export interface DatabaseApp {
	id: string;
	name: string;
	databaseId: string;
	siteId: string;
	appImage?: { url: string; mime: string } | string | null;
	appStoreLink: string | null;
	appStoreId: string | null;
	appIdPrefix: string | null;
	playStoreLink: string | null;
}

export interface SiteModule {
	id: string;
	name: string;
	databaseId: string;
	siteId: string;
	data: unknown;
}

export interface SiteTheme {
	id: string;
	databaseId: string;
	siteId: string;
	theme: unknown;
}

export interface DatabaseSite {
	id: string;
	title: string | null;
	description: string | null;
	logo?: { url: string; mime: string } | null;
	favicon?: string | null;
	appleTouchIcon?: { url: string; mime: string } | null;
	ogImage?: { url: string; mime: string } | null;
	modules?: SiteModule[];
	theme?: SiteTheme | null;
}

const DATABASE_SITES_AND_APPS_QUERY = `
	query DatabaseSitesAndApps($databaseId: UUID!) {
		database(id: $databaseId) {
			id
			apps(orderBy: NAME_ASC) {
				nodes {
					id
					name
					databaseId
					siteId
					appImage
					appStoreLink
					appStoreId
					appIdPrefix
					playStoreLink
				}
				totalCount
			}
			sites(orderBy: TITLE_ASC) {
				nodes {
					id
					title
					description
					logo
					favicon
					appleTouchIcon
					ogImage
				}
				totalCount
			}
			siteModules {
				nodes {
					data
					databaseId
					id
					name
					siteId
				}
			}
			siteThemes {
				nodes {
					databaseId
					id
					siteId
					theme
				}
			}
		}
	}
`;

export const databaseAppsQueryKeys = {
	all: ['database-sites-and-apps'] as const,
	byDatabase: (databaseId: string) => ['database-sites-and-apps', databaseId] as const,
};

export interface UseDatabaseSitesAndAppsOptions {
	enabled?: boolean;
}

interface DatabaseSitesAndAppsResponse {
	database?: {
		apps?: {
			nodes?: (DatabaseApp | null)[] | null;
			totalCount?: number | null;
		} | null;
		sites?: {
			nodes?: (DatabaseSite | null)[] | null;
			totalCount?: number | null;
		} | null;
		siteModules?: {
			nodes?: (SiteModule | null)[] | null;
		} | null;
		siteThemes?: {
			nodes?: (SiteTheme | null)[] | null;
		} | null;
	} | null;
}

export interface DatabaseSitesAndAppsResult {
	apps: DatabaseApp[];
	sites: DatabaseSite[];
	appsTotalCount: number;
	sitesTotalCount: number;
}

export function useDatabaseSitesAndApps(databaseId: string, options: UseDatabaseSitesAndAppsOptions = {}) {
	const isEnabled = options.enabled !== false && Boolean(databaseId);

	return useQuery<DatabaseSitesAndAppsResult>({
		queryKey: databaseAppsQueryKeys.byDatabase(databaseId),
		queryFn: async () => {
			const result = (await executeSb(DATABASE_SITES_AND_APPS_QUERY, {
				databaseId,
			})) as DatabaseSitesAndAppsResponse;

			const apps = (result.database?.apps?.nodes ?? []).filter(Boolean) as DatabaseApp[];
			const rawSites = (result.database?.sites?.nodes ?? []).filter(Boolean) as DatabaseSite[];
			const allModules = (result.database?.siteModules?.nodes ?? []).filter(Boolean) as SiteModule[];
			const allThemes = (result.database?.siteThemes?.nodes ?? []).filter(Boolean) as SiteTheme[];

			const sites = rawSites.map((site) => {
				const modules = allModules.filter((module) => module.siteId === site.id);
				const theme = allThemes.find((theme) => theme.siteId === site.id) || null;
				return {
					...site,
					modules,
					theme,
				};
			});

			return {
				apps,
				sites,
				appsTotalCount: result.database?.apps?.totalCount ?? apps.length,
				sitesTotalCount: result.database?.sites?.totalCount ?? sites.length,
			};
		},
		enabled: isEnabled,
		staleTime: 5 * 60 * 1000,
		refetchOnMount: isEnabled ? 'always' : false,
		refetchOnWindowFocus: 'always',
		refetchOnReconnect: 'always',
	});
}
