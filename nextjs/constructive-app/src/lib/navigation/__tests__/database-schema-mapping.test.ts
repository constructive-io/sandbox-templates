import { describe, expect, it } from 'vitest';

import { findDatabaseSchemaByDatabaseId, getDatabaseIdFromSchemaKey, getSchemaKeyFromDatabaseId } from '../database-schema-mapping';

describe('database-schema-mapping', () => {
	it('finds schema by databaseId', () => {
		const schemas: any[] = [
			{ key: 'db-1', source: 'database', databaseInfo: { id: '1', ownerId: 'org-1' } },
			{ key: 'custom-1', source: 'custom' },
		];

		expect(findDatabaseSchemaByDatabaseId(schemas as any, '1')?.key).toBe('db-1');
	});

	it('enforces org ownership when orgId provided and ownerId available', () => {
		const schemas: any[] = [{ key: 'db-1', source: 'database', databaseInfo: { id: '1', ownerId: 'org-1' } }];
		expect(findDatabaseSchemaByDatabaseId(schemas as any, '1', { orgId: 'org-2' })).toBeNull();
	});

	it('returns schemaKey for databaseId', () => {
		const schemas: any[] = [{ key: 'db-1', source: 'database', databaseInfo: { id: '1' } }];
		expect(getSchemaKeyFromDatabaseId(schemas as any, '1')).toBe('db-1');
	});

	it('returns databaseId for schemaKey', () => {
		const schemas: any[] = [{ key: 'db-1', source: 'database', databaseInfo: { id: '1' } }];
		expect(getDatabaseIdFromSchemaKey(schemas as any, 'db-1')).toBe('1');
	});
});
