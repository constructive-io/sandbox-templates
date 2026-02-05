import type { GraphQLSDKConfigTarget } from '@constructive-io/graphql-codegen';

/**
 * Multi-endpoint codegen config for the schema-builder SDK.
 *
 * 4 targets, each introspecting its own endpoint:
 *   app-public  – core schema-builder (databases, tables, fields, schemas, APIs, sites, domains, modules, etc.)
 *   auth        – auth & user management (signIn/Up/Out, currentUser, users, emails, tokens, passwords)
 *   admin       – memberships, permissions, invites, org management
 *   api         – legacy-only ops (appAchievement, appLevel, appStep) - filtered
 *
 * Schema overlap: app-public ⊂ admin ⊂ auth. Each SDK generates ALL operations from
 * its endpoint, but import discipline ensures each operation is imported from exactly
 * one canonical SDK.
 *
 * Auth: All endpoints share the same JWT. Authenticate via auth endpoint, token works everywhere.
 */

const shared: Partial<GraphQLSDKConfigTarget> = {
	reactQuery: true,
};

const config: Record<string, GraphQLSDKConfigTarget> = {
	'app-public': {
		...shared,
		endpoint: 'http://app-public.localhost:3000/graphql',
		output: './src/graphql/schema-builder-sdk/app-public',
	},
	auth: {
		...shared,
		endpoint: 'http://auth.localhost:3000/graphql',
		output: './src/graphql/schema-builder-sdk/auth',
	},
	admin: {
		...shared,
		endpoint: 'http://admin.localhost:3000/graphql',
		output: './src/graphql/schema-builder-sdk/admin',
	},
	api: {
		...shared,
		endpoint: 'http://api.localhost:3000/graphql',
		output: './src/graphql/schema-builder-sdk/api',
		queries: {
			include: [
				'appAchievement*',
				'appLevel*',
				'appStep*',
			],
		},
		mutations: {
			include: [
				'createAppAchievement*',
				'updateAppAchievement*',
				'deleteAppAchievement*',
				'createAppLevel*',
				'updateAppLevel*',
				'deleteAppLevel*',
				'createAppStep*',
				'updateAppStep*',
				'deleteAppStep*',
			],
		},
	},
};

export default config;
