/**
 * Integration tests for transformUserDatabase schema resolution
 *
 * Tests the resolveSchemaId heuristic which ONLY returns schema with name="public"
 * If no "public" schema exists, schemaId should be undefined
 */
import { describe, expect, it } from 'vitest';

import type {
	DatabaseIndex,
	ForeignKeyConstraint,
	PrimaryKeyConstraint,
	UniqueConstraint,
	UserDatabase,
} from '../../use-user-databases';

import { transformUserDatabase } from '../transformers';

// Helper to create a minimal UserDatabase fixture
function createUserDatabase(overrides: Partial<UserDatabase> = {}): UserDatabase {
	return {
		id: 'db-1',
		name: 'test-database',
		label: 'Test Database',
		schemaName: 'test_db_public',
		owner: {
			id: 'owner-1',
			username: 'testuser',
			displayName: 'Test User',
		},
		tables: {
			edges: [],
			totalCount: 0,
		},
		schemas: {
			nodes: [],
		},
		apis: {
			nodes: [],
		},
		...overrides,
	} as UserDatabase;
}

// Empty constraint maps for tests that don't need constraints
const emptyConstraints = {
	primaryKeyConstraintsMap: new Map<string, PrimaryKeyConstraint>(),
	uniqueConstraintsMap: new Map<string, UniqueConstraint[]>(),
	foreignKeyConstraintsMap: new Map<string, ForeignKeyConstraint[]>(),
	indicesMap: new Map<string, DatabaseIndex[]>(),
};

describe('transformUserDatabase - schema resolution', () => {
	it('returns public schema ID when schema with name="public" exists', () => {
		const database = createUserDatabase({
			schemas: {
				nodes: [
					{ id: 'schema-public', name: 'public', schemaName: 'db_public' },
					{ id: 'schema-private', name: 'private', schemaName: 'db_private' },
				],
			},
		});

		const result = transformUserDatabase(
			database,
			emptyConstraints.primaryKeyConstraintsMap,
			emptyConstraints.uniqueConstraintsMap,
			emptyConstraints.foreignKeyConstraintsMap,
			emptyConstraints.indicesMap,
		);

		expect(result.databaseInfo?.schemaId).toBe('schema-public');
		expect(result.dbSchema.metadata?.schemaId).toBe('schema-public');
	});

	it('returns undefined schemaId when no schema with name="public" exists', () => {
		const database = createUserDatabase({
			schemas: {
				nodes: [
					{ id: 'schema-private', name: 'private', schemaName: 'db_private' },
					{ id: 'schema-admin', name: 'admin', schemaName: 'db_admin' },
				],
			},
		});

		const result = transformUserDatabase(
			database,
			emptyConstraints.primaryKeyConstraintsMap,
			emptyConstraints.uniqueConstraintsMap,
			emptyConstraints.foreignKeyConstraintsMap,
			emptyConstraints.indicesMap,
		);

		expect(result.databaseInfo?.schemaId).toBeUndefined();
		// metadata.schemaId should not be set when resolveSchemaId returns undefined
		expect(result.dbSchema.metadata?.schemaId).toBeUndefined();
	});

	it('returns public schema ID even when multiple schemas exist', () => {
		const database = createUserDatabase({
			schemas: {
				nodes: [
					{ id: 'schema-admin', name: 'admin', schemaName: 'db_admin' },
					{ id: 'schema-public', name: 'public', schemaName: 'db_public' },
					{ id: 'schema-private', name: 'private', schemaName: 'db_private' },
					{ id: 'schema-users', name: 'users', schemaName: 'db_users' },
				],
			},
		});

		const result = transformUserDatabase(
			database,
			emptyConstraints.primaryKeyConstraintsMap,
			emptyConstraints.uniqueConstraintsMap,
			emptyConstraints.foreignKeyConstraintsMap,
			emptyConstraints.indicesMap,
		);

		expect(result.databaseInfo?.schemaId).toBe('schema-public');
	});

	it('returns public schema ID regardless of API links', () => {
		// Previously, API-linked schema had highest priority
		// Now, "public" schema should always win
		const database = createUserDatabase({
			schemas: {
				nodes: [
					{ id: 'schema-admin', name: 'admin', schemaName: 'db_admin' },
					{ id: 'schema-public', name: 'public', schemaName: 'db_public' },
				],
			},
			apis: {
				nodes: [
					{
						id: 'api-1',
						name: 'admin',
						apiSchemas: {
							nodes: [{ id: 'api-schema-1', apiId: 'api-1', schemaId: 'schema-admin' }],
						},
					},
				],
			},
		});

		const result = transformUserDatabase(
			database,
			emptyConstraints.primaryKeyConstraintsMap,
			emptyConstraints.uniqueConstraintsMap,
			emptyConstraints.foreignKeyConstraintsMap,
			emptyConstraints.indicesMap,
		);

		// Should be "public" schema, not the API-linked "admin" schema
		expect(result.databaseInfo?.schemaId).toBe('schema-public');
	});

	it('handles empty schemas.nodes array', () => {
		const database = createUserDatabase({
			schemas: {
				nodes: [],
			},
		});

		const result = transformUserDatabase(
			database,
			emptyConstraints.primaryKeyConstraintsMap,
			emptyConstraints.uniqueConstraintsMap,
			emptyConstraints.foreignKeyConstraintsMap,
			emptyConstraints.indicesMap,
		);

		expect(result.databaseInfo?.schemaId).toBeUndefined();
	});

	it('handles null/undefined schemas', () => {
		const database = createUserDatabase({
			schemas: null as unknown as UserDatabase['schemas'],
		});

		const result = transformUserDatabase(
			database,
			emptyConstraints.primaryKeyConstraintsMap,
			emptyConstraints.uniqueConstraintsMap,
			emptyConstraints.foreignKeyConstraintsMap,
			emptyConstraints.indicesMap,
		);

		expect(result.databaseInfo?.schemaId).toBeUndefined();
	});

	it('is case-sensitive - does not match "Public" or "PUBLIC"', () => {
		const database = createUserDatabase({
			schemas: {
				nodes: [
					{ id: 'schema-Public', name: 'Public', schemaName: 'db_public_upper' },
					{ id: 'schema-PUBLIC', name: 'PUBLIC', schemaName: 'db_public_all_caps' },
					{ id: 'schema-private', name: 'private', schemaName: 'db_private' },
				],
			},
		});

		const result = transformUserDatabase(
			database,
			emptyConstraints.primaryKeyConstraintsMap,
			emptyConstraints.uniqueConstraintsMap,
			emptyConstraints.foreignKeyConstraintsMap,
			emptyConstraints.indicesMap,
		);

		// Should NOT match "Public" or "PUBLIC" - only lowercase "public"
		expect(result.databaseInfo?.schemaId).toBeUndefined();
	});

	it('returns public schema even when tables exist in other schemas', () => {
		// Previously, tableSchemaId was a fallback candidate
		// Now, only "public" schema matters
		const database = createUserDatabase({
			schemas: {
				nodes: [
					{ id: 'schema-admin', name: 'admin', schemaName: 'db_admin' },
					{ id: 'schema-public', name: 'public', schemaName: 'db_public' },
				],
			},
			tables: {
				edges: [
					{
						node: {
							id: 'table-1',
							name: 'users',
							schemaId: 'schema-admin', // Table is in admin schema
							label: 'Users',
							description: null,
							category: 'CORE',
							pluralName: 'users',
							singularName: 'user',
							smartTags: null,
							timestamps: true,
							fields: { nodes: [], totalCount: 0 },
						},
					},
				],
				totalCount: 1,
			},
		});

		const result = transformUserDatabase(
			database,
			emptyConstraints.primaryKeyConstraintsMap,
			emptyConstraints.uniqueConstraintsMap,
			emptyConstraints.foreignKeyConstraintsMap,
			emptyConstraints.indicesMap,
		);

		// Should still be "public" schema, not the schema where tables exist
		expect(result.databaseInfo?.schemaId).toBe('schema-public');
	});

	it('handles schema nodes with null/undefined id', () => {
		const database = createUserDatabase({
			schemas: {
				nodes: [
					{ id: null as unknown as string, name: 'public', schemaName: 'db_public' },
					{ id: 'schema-valid', name: 'valid', schemaName: 'db_valid' },
				],
			},
		});

		const result = transformUserDatabase(
			database,
			emptyConstraints.primaryKeyConstraintsMap,
			emptyConstraints.uniqueConstraintsMap,
			emptyConstraints.foreignKeyConstraintsMap,
			emptyConstraints.indicesMap,
		);

		// Should not match the public schema with null id
		expect(result.databaseInfo?.schemaId).toBeUndefined();
	});

	it('returns first valid public schema when multiple schemas named "public" exist', () => {
		// Edge case: multiple schemas with same name (shouldn't happen, but test robustness)
		const database = createUserDatabase({
			schemas: {
				nodes: [
					{ id: 'schema-public-1', name: 'public', schemaName: 'db_public_1' },
					{ id: 'schema-public-2', name: 'public', schemaName: 'db_public_2' },
				],
			},
		});

		const result = transformUserDatabase(
			database,
			emptyConstraints.primaryKeyConstraintsMap,
			emptyConstraints.uniqueConstraintsMap,
			emptyConstraints.foreignKeyConstraintsMap,
			emptyConstraints.indicesMap,
		);

		// Should return first match
		expect(result.databaseInfo?.schemaId).toBe('schema-public-1');
	});
});
