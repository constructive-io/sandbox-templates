import type { SchemaInfo } from '@/lib/gql/hooks/schema-builder';

export interface DatabaseSchemaMatchOptions {
	/** Optional orgId to enforce database ownership when available. */
	orgId?: string | null;
}

function isDatabaseSchema(schema: SchemaInfo): boolean {
	return schema.source === 'database' && Boolean(schema.databaseInfo?.id);
}

export function findDatabaseSchemaByDatabaseId(
	availableSchemas: SchemaInfo[],
	databaseId: string,
	options: DatabaseSchemaMatchOptions = {},
): SchemaInfo | null {
	const { orgId } = options;

	const candidate =
		availableSchemas.find(
			(schema) => isDatabaseSchema(schema) && schema.databaseInfo?.id === databaseId,
		) ?? null;

	if (!candidate) return null;

	if (orgId) {
		const ownerId = candidate.databaseInfo?.ownerId;
		if (ownerId && ownerId !== orgId) {
			return null;
		}
	}

	return candidate;
}

export function getSchemaKeyFromDatabaseId(
	availableSchemas: SchemaInfo[],
	databaseId: string,
	options: DatabaseSchemaMatchOptions = {},
): string | null {
	return findDatabaseSchemaByDatabaseId(availableSchemas, databaseId, options)?.key ?? null;
}

export function getDatabaseIdFromSchemaKey(availableSchemas: SchemaInfo[], schemaKey: string): string | null {
	const schema = availableSchemas.find((s) => isDatabaseSchema(s) && s.key === schemaKey) ?? null;
	return schema?.databaseInfo?.id ?? null;
}
