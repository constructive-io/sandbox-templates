// For backward compatibility and explicit usage
import { useExtendToken, useForgotPassword, useLogin, useLogout, useRegister } from '../auth';

/**
 * Schema Builder hooks
 * Centralized exports for all schema-builder related hooks
 */

// Authentication hooks (re-export from main auth since auth is global)
export { useLogin, useRegister, useLogout, useExtendToken, useForgotPassword } from '../auth';

/**
 * Schema builder auth hooks (same as main auth hooks since auth is global)
 */
export const useLoginSb = useLogin;
export const useRegisterSb = useRegister;
export const useLogoutSb = useLogout;
export const useExtendTokenSb = useExtendToken;
export const useForgotPasswordSb = useForgotPassword;

export const useLoginSchemaBuilder = useLogin;
export const useRegisterSchemaBuilder = useRegister;
export const useLogoutSchemaBuilder = useLogout;
export const useExtendTokenSchemaBuilder = useExtendToken;
export const useForgotPasswordSchemaBuilder = useForgotPassword;

// Database and table management hooks
export {
	useUserDatabases,
	userDatabasesQueryKeys,
	type UserDatabase,
	type DatabaseTable,
	type DatabaseField,
} from './use-user-databases';

// Accessible databases (user + org owned) - used by schema builder selectors
// Split into two hooks for different caching strategies
export {
	useAccessibleDatabases,
	accessibleDatabasesQueryKeys,
	type AccessibleDatabase,
	type AccessibleDatabaseTable,
	type AccessibleDatabaseField,
	type AccessibleDatabaseOwner,
	type UseAccessibleDatabasesOptions,
	type UseAccessibleDatabasesResult,
} from './use-accessible-databases';

// Database constraints (PK, UK, FK, indexes) - fetched separately with longer cache
export {
	useDatabaseConstraints,
	databaseConstraintsQueryKeys,
	type PrimaryKeyConstraint,
	type UniqueConstraint,
	type ForeignKeyConstraint,
	type DatabaseIndex,
	type UseDatabaseConstraintsOptions,
	type UseDatabaseConstraintsResult,
} from './use-database-constraints';

export { useDatabaseTables, useDatabaseTable } from './use-database-tables';

export { useUpdateTable, type UpdateTableInput } from './use-update-table';

// Schema builder selectors (new unified hook - THE RECOMMENDED WAY TO ACCESS SCHEMA DATA)
// This hook reads from React Query and derives all state, eliminating sync issues
export {
	SchemaBuilderDataProvider,
	useSchemaBuilderDataSelector,
	useSchemaBuilderSelectors,
	useVisualizerSchema,
	useTableConstraints,
	type SchemaInfo,
	type CurrentDatabaseInfo,
	type SchemaBuilderDataState,
	type UseSchemaBuilderSelectorsResult,
} from './use-schema-builder-selectors';

// NOTE: useLoadUserSchemas has been removed - use useSchemaBuilderSelectors instead
// The old hook manually synced data to Zustand, causing race conditions.
// The new selectors read directly from React Query, deriving all state.

// Domain hooks - MIGRATED to SDK
// Use directly from @sdk/{target}:
// - useDomainsQuery, useDomainQuery
// - useCreateDomainMutation, useUpdateDomainMutation, useDeleteDomainMutation
// - domainKeys (from query-keys.ts), invalidate.domain (from invalidation.ts)

// API hooks
// NOTE: API mutations migrated to SDK - use directly:
// - useCreateApiMutation, useUpdateApiMutation, useDeleteApiMutation
// - useCreateApiSchemaMutation
// For cache invalidation, use apiQueryKeys
export {
	useApi,
	useApis,
	useApiSchema,
	apiQueryKeys,
	apiSchemaQueryKeys,
	type UseApiOptions,
	type UseApisOptions,
	type UseApiSchemaOptions,
} from './apis';

// Site hooks
// NOTE: Site/app mutation wrappers migrated to SDK - use directly:
// useCreateSiteModule -> useCreateSiteModuleMutation
// useUpdateSiteModule -> useUpdateSiteModuleMutation
// useDeleteSiteModule -> useDeleteSiteModuleMutation
// useCreateSiteTheme -> useCreateSiteThemeMutation
// useUpdateSiteTheme -> useUpdateSiteThemeMutation
// useDeleteSiteTheme -> useDeleteSiteThemeMutation
// useCreateApp -> useCreateAppMutation
// useUpdateApp -> useUpdateAppMutation
// useDeleteApp -> useDeleteAppMutation
// useDeleteSite -> useDeleteSiteMutation
export {
	useCreateSite,
	useUpdateSite,
	useSite,
	useSites,
	useSiteModule,
	useSiteModules,
	useSiteTheme,
	useApp,
	useApps,
	siteQueryKeys,
	siteModuleQueryKeys,
	siteThemeQueryKeys,
	appQueryKeys,
	type CreateSiteData,
	type ImageConfig,
	type UseSiteOptions,
	type UseSitesOptions,
	type UseSiteModuleOptions,
	type UseSiteThemeOptions,
	type UseAppOptions,
} from './sites';

// App-level hooks (platform administration)
export {
	useCurrentUserAppMembership,
	useAppUsers,
	useUpdateAppUser,
	useAppInvites,
	useAppClaimedInvites,
	useSendAppInvite,
	useCancelAppInvite,
	useExtendAppInvite,
	appMembershipQueryKeys,
	appUsersQueryKeys,
	appInvitesQueryKeys,
	type AppMembership,
	type AppUser,
	type AppInvite,
	type AppInviteRole,
	type AppInviteStatus,
	type AppClaimedInvite,
	type UseCurrentUserAppMembershipOptions,
	type UseCurrentUserAppMembershipResult,
	type UseAppUsersOptions,
	type UseAppUsersResult,
	type UpdateAppUserData,
	type UseAppInvitesOptions,
	type SendAppInviteInput,
	type CancelAppInviteInput,
	type ExtendAppInviteInput,
} from './app';

// Organization hooks
export {
	// Types
	type Organization,
	type OrganizationWithRole,
	type OrganizationSettings,
	type OrganizationDetail,
	type OrganizationMember,
	type OrgRole,
	ROLE_TYPE,
	ORG_ROLE_CONFIG,
	deriveOrgRole,
	// Hooks
	useOrganizations,
	useOrganization,
	useCreateOrganization,
	useUpdateOrganization,
	useDeleteOrganization,
	useOrgMembers,
	useOrgInvites,
	useOrgClaimedInvites,
	useSendOrgInvite,
	useCancelOrgInvite,
	useExtendOrgInvite,
	useOrgMembershipDefault,
	useUpdateOrgMembershipDefault,
	useCreateOrgMembershipDefault,
	useMembershipPermissionDefault,
	useCreateMembershipPermissionDefault,
	useUpdateMembershipPermissionDefault,
	// Query keys
	organizationsQueryKeys,
	orgInvitesQueryKeys,
	orgMembershipDefaultQueryKeys,
	membershipPermissionDefaultQueryKeys,
	// Hook types
	type UseOrganizationsOptions,
	type UseOrganizationsResult,
	type UseOrganizationOptions,
	type UseOrganizationResult,
	type CreateOrganizationInput,
	type CreateOrganizationResult,
	type UseCreateOrganizationOptions,
	type UseCreateOrganizationResult,
	type UpdateOrganizationInput,
	type UpdateOrganizationResult,
	type UseUpdateOrganizationOptions,
	type UseUpdateOrganizationResult,
	type DeleteOrganizationInput,
	type DeleteOrganizationResult,
	type OrgMember,
	type OrgMemberStatus,
	type UseOrgMembersOptions,
	type UseOrgMembersResult,
	type OrgInvite,
	type OrgInviteRole,
	type OrgInviteStatus,
	type OrgClaimedInvite,
	type UseOrgInvitesOptions,
	type SendOrgInviteInput,
	type CancelOrgInviteInput,
	type ExtendOrgInviteInput,
	type OrgMembershipDefault,
	type UseOrgMembershipDefaultOptions,
	type UpdateOrgMembershipDefaultInput,
	type CreateOrgMembershipDefaultInput,
	type MembershipPermissionDefault,
	type UseMembershipPermissionDefaultOptions,
	type CreateMembershipPermissionDefaultInput,
	type UpdateMembershipPermissionDefaultInput,
	type UseDeleteOrganizationOptions,
	type UseDeleteOrganizationResult,
} from './organizations';

// Schema management hooks (for Services tab)
// NOTE: Schema mutations migrated to SDK - use directly:
// - useCreateSchemaMutation, useUpdateSchemaMutation, useDeleteSchemaMutation
// - useDeleteApiSchemaByApiIdAndSchemaIdMutation (for unlinking)
// For cache invalidation, use databaseSchemasQueryKeys
export {
	useDatabaseSchemas,
	databaseSchemasQueryKeys,
	type DatabaseSchema,
	type LinkedApi,
	type UseDatabaseSchemasOptions,
	type UseDatabaseSchemasResult,
} from './schemas';

// Index mutations
export { useCreateIndex, useUpdateIndex, useDeleteIndex } from './use-index-mutations';

// Relationship mutations
export {
	useCreateForeignKey,
	useUpdateForeignKey,
	useDeleteForeignKey,
	useCreateManyToMany,
	type CreateForeignKeyInput,
	type UpdateForeignKeyInput,
	type DeleteForeignKeyInput,
	type CreateManyToManyInput,
} from './use-relationship-mutations';
