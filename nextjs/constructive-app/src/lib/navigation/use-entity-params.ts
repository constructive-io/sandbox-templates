/**
 * Entity Params Hook - URL-based entity state management
 *
 * This hook provides a clean interface for reading entity IDs from URL path params
 * and validating them against available data. It serves as the source of truth
 * for entity selection, replacing Zustand-based entity state.
 *
 * Benefits:
 * - URL is shareable and bookmarkable
 * - Browser back/forward works naturally
 * - No stale persisted state issues
 * - Type-safe with validation
 *
 * Entity Hierarchy: App (root) → Org → Database
 *
 * Routes:
 * - `/` - Root level (organizations list)
 * - `/orgs/[orgId]/*` - Organization level
 * - `/orgs/[orgId]/databases/[databaseId]/*` - Database level
 */
'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';

import {
	useOrganizations,
	useSchemaBuilderDataSelector,
	type OrganizationWithRole,
	type OrgRole,
	type SchemaInfo,
} from '@/lib/gql/hooks/schema-builder';

// Database schema mapping removed - database functionality has been removed from the application

/**
 * Organization type for entity params
 * Maps from OrganizationWithRole for backward compatibility
 */
export interface Organization {
	id: string;
	name: string;
	description?: string;
	memberCount?: number;
	/** Current user's role in this organization */
	role: OrgRole;
	/** Original organization data with full details */
	_raw?: OrganizationWithRole;
}

// Re-export OrgRole for consumers
export type { OrgRole };

/**
 * Navigation level based on URL path params
 */
export type NavigationLevel = 'root' | 'org' | 'database';

/**
 * Entity validation result
 */
export interface EntityValidation {
	isValid: boolean;
	redirectTo?: string;
	error?: string;
}

/**
 * Result from useEntityParams hook
 */
export interface UseEntityParamsResult {
	// Current entity IDs from URL (null if not in URL)
	orgId: string | null;
	databaseId: string | null;
	/** Schema key used by schema-builder selection (e.g. `db-${databaseId}`) */
	databaseSchemaKey: string | null;

	// Validated entity data (null if ID not in URL or invalid)
	organization: Organization | null;
	database: SchemaInfo | null;

	// Navigation level derived from URL
	level: NavigationLevel;

	// Available entities for current context
	availableOrgs: Organization[];
	availableDatabases: SchemaInfo[];

	// Validation state
	validation: EntityValidation;
	isLoading: boolean;

	// Helper to check if an entity ID is valid
	isValidOrgId: (id: string) => boolean;
	isValidDatabaseId: (id: string) => boolean;
}

/**
 * Hook to read and validate entity IDs from URL path params.
 *
 * This is the primary source of truth for entity selection.
 * Use this hook in layouts to determine navigation context.
 *
 * @example
 * ```tsx
 * // In org layout
 * const { orgId, organization, validation, isLoading } = useEntityParams();
 *
 * if (isLoading) return <Loading />;
 * if (!validation.isValid) {
 *   router.replace(validation.redirectTo ?? '/');
 *   return null;
 * }
 *
 * return <>{children}</>;
 * ```
 */

/**
 * Transform OrganizationWithRole to the local Organization type
 */
function transformOrganization(org: OrganizationWithRole): Organization {
	return {
		id: org.id,
		name: org.displayName || org.username || 'Unnamed Organization',
		description: org.settings?.legalName || undefined,
		memberCount: org.memberCount,
		role: org.role,
		_raw: org,
	};
}

export function useEntityParams(): UseEntityParamsResult {
	const params = useParams();

	// Extract entity IDs from URL path params
	const orgId = (params?.orgId as string) ?? null;
	const databaseId = (params?.databaseId as string) ?? null;

	// Get available databases from schema builder data provider
	const availableSchemas = useSchemaBuilderDataSelector((state) => state.availableSchemas);
	const isDatabasesLoading = useSchemaBuilderDataSelector((state) => state.isLoading);

	// Get organizations from GraphQL
	const { organizations: rawOrganizations, isLoading: isOrgsLoading } = useOrganizations();

	// Transform organizations to local format
	const availableOrgs = useMemo(() => rawOrganizations.map(transformOrganization), [rawOrganizations]);

	// Validate organization
	const organization = useMemo(() => {
		if (!orgId) return null;
		return availableOrgs.find((org) => org.id === orgId) ?? null;
	}, [orgId, availableOrgs]);

	// Database validation removed - database functionality has been removed from the application
	const database = useMemo(() => {
		return null;
	}, [databaseId, availableSchemas, orgId]);

	// Database schema key always null since databases are removed
	const databaseSchemaKey = useMemo(() => {
		return null;
	}, [databaseId]);

	// Determine navigation level from URL
	const level = useMemo((): NavigationLevel => {
		if (databaseId) return 'database';
		if (orgId) return 'org';
		return 'root';
	}, [orgId, databaseId]);

	// Validation helper functions
	const isValidOrgId = useMemo(() => (id: string) => availableOrgs.some((org) => org.id === id), [availableOrgs]);

	const isValidDatabaseId = useMemo(
		() => (id: string) => availableSchemas.some((schema) => schema.databaseInfo?.id === id || schema.key === id),
		[availableSchemas],
	);

	// Combined loading state
	const isLoading = isDatabasesLoading || isOrgsLoading;

	// Compute validation result
	const validation = useMemo((): EntityValidation => {
		// If no entity IDs in URL, we're at root level - always valid
		if (!orgId && !databaseId) {
			return { isValid: true };
		}

		// Validate database route
		if (databaseId) {
			// If org is present, enforce it exists and database belongs to it
			if (orgId) {
				// Wait for orgs to load before validating
				if (!isOrgsLoading && !organization) {
					return {
						isValid: false,
						redirectTo: '/',
						error: `Organization "${orgId}" not found`,
					};
				}
				// Wait for databases to load before validating database exists
				if (!isDatabasesLoading && !database) {
					return {
						isValid: false,
						redirectTo: `/orgs/${orgId}/members`,
						error: `Database "${databaseId}" not found in organization`,
					};
				}
				return { isValid: true };
			}

			// Database not found - redirect to root
			if (!isDatabasesLoading && !database) {
				return {
					isValid: false,
					redirectTo: '/',
					error: `Database "${databaseId}" not found`,
				};
			}
			return { isValid: true };
		}

		// Validate org route
		if (orgId) {
			// Wait for orgs to load before validating
			if (!isOrgsLoading && !organization) {
				return {
					isValid: false,
					redirectTo: '/',
					error: `Organization "${orgId}" not found`,
				};
			}
			return { isValid: true };
		}

		return { isValid: true };
	}, [orgId, databaseId, organization, database, isDatabasesLoading, isOrgsLoading]);

	return {
		// Entity IDs from URL
		orgId,
		databaseId,
		databaseSchemaKey,

		// Validated entities
		organization,
		database,

		// Navigation level
		level,

		// Available entities
		availableOrgs,
		availableDatabases: availableSchemas,

		// Validation
		validation,
		isLoading,

		// Helpers
		isValidOrgId,
		isValidDatabaseId,
	};
}
