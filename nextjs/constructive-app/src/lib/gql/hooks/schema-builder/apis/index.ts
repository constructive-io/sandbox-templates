// API mutation hooks - MIGRATED to SDK
// Use directly from @sdk/{target}:
// - useCreateApiMutation, useUpdateApiMutation, useDeleteApiMutation
// - useCreateApiSchemaMutation
// For cache invalidation, use apiQueryKeys from this file

export { useApi } from './use-api';
export type { UseApiOptions } from './use-api';

export { useApis, apiQueryKeys, type Api } from './use-apis';
export type { UseApisOptions } from './use-apis';

export { useApiSchema, apiSchemaQueryKeys } from './use-api-schemas';
export type { UseApiSchemaOptions } from './use-api-schemas';

export { useDatabaseServices, databaseServicesQueryKeys } from './use-database-services';
export type { DatabaseService, UseDatabaseServicesOptions, UseDatabaseServicesResult } from './use-database-services';
