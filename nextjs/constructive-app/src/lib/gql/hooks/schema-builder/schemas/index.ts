export { useDatabaseSchemas, databaseSchemasQueryKeys } from './use-database-schemas';
export type {
	DatabaseSchema,
	LinkedApi,
	UseDatabaseSchemasOptions,
	UseDatabaseSchemasResult,
} from './use-database-schemas';

// Schema mutations - MIGRATED to SDK
// Use directly from @sdk/{target}:
// - useCreateSchemaMutation, useUpdateSchemaMutation, useDeleteSchemaMutation
// - useDeleteApiSchemaByApiIdAndSchemaIdMutation (for unlinking)
// For cache invalidation, use databaseSchemasQueryKeys from this file
