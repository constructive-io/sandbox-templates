/**
 * Tests for relation-utils.ts
 * Tests the foreign key field resolution for hasMany and hasOne relationships
 */
import { describe, expect, it } from 'vitest';

import type { CleanTable } from '../gql/data.types';
import { getRelationshipInfo } from '../relation-utils';

// Mock User table (current table)
const mockUserTable: CleanTable = {
	name: 'User',
	fields: [
		{
			name: 'id',
			type: {
				gqlType: 'UUID',
				isArray: false,
				modifier: null,
				pgAlias: 'uuid',
				pgType: 'uuid',
				subtype: null,
				typmod: null,
			},
		},
	],
	relations: {
		belongsTo: [],
		hasOne: [],
		hasMany: [
			{
				fieldName: 'actions', // User hasMany Actions via "actions" field
				isUnique: false,
				referencedByTable: 'Action',
				type: 'hasMany',
				keys: [], // This doesn't contain the foreign key info for hasMany
			},
		],
		manyToMany: [],
	},
};

// Mock Action table (related table)
const mockActionTable: CleanTable = {
	name: 'Action',
	fields: [
		{
			name: 'id',
			type: {
				gqlType: 'UUID',
				isArray: false,
				modifier: null,
				pgAlias: 'uuid',
				pgType: 'uuid',
				subtype: null,
				typmod: null,
			},
		},
		{
			name: 'ownerId', // The actual foreign key field
			type: {
				gqlType: 'UUID',
				isArray: false,
				modifier: null,
				pgAlias: 'uuid',
				pgType: 'uuid',
				subtype: null,
				typmod: null,
			},
		},
	],
	relations: {
		belongsTo: [
			{
				fieldName: 'owner', // Action belongsTo User via "owner" field
				isUnique: false,
				referencesTable: 'User',
				type: 'belongsTo',
				keys: [
					{
						name: 'ownerId', // The actual foreign key field name
						type: {
							gqlType: 'UUID',
							isArray: false,
							modifier: null,
							pgAlias: 'uuid',
							pgType: 'uuid',
							subtype: null,
							typmod: null,
						},
					},
				],
			},
		],
		hasOne: [],
		hasMany: [],
		manyToMany: [],
	},
};

const allTables = [mockUserTable, mockActionTable];

describe('getRelationshipInfo', () => {
	describe('hasMany relationship foreign key resolution', () => {
		it('should correctly resolve foreign key field for hasMany relationship', () => {
			const result = getRelationshipInfo(mockUserTable, 'actions', allTables);

			expect(result).toEqual({
				relationType: 'hasMany',
				relationField: 'actions',
				relatedTableName: 'Action',
				foreignKeyField: 'ownerId', // Should be 'ownerId', not 'userId'
			});
		});

		it('should return undefined foreignKeyField when allTables is not provided', () => {
			const result = getRelationshipInfo(mockUserTable, 'actions');

			expect(result).toEqual({
				relationType: 'hasMany',
				relationField: 'actions',
				relatedTableName: 'Action',
				foreignKeyField: undefined,
			});
		});

		it('should return undefined foreignKeyField when related table is not found', () => {
			const result = getRelationshipInfo(mockUserTable, 'actions', [mockUserTable]); // Missing Action table

			expect(result).toEqual({
				relationType: 'hasMany',
				relationField: 'actions',
				relatedTableName: 'Action',
				foreignKeyField: undefined,
			});
		});
	});

	describe('belongsTo relationship (should work as before)', () => {
		it('should correctly resolve foreign key field for belongsTo relationship', () => {
			const result = getRelationshipInfo(mockActionTable, 'owner', allTables);

			expect(result).toEqual({
				relationType: 'belongsTo',
				relationField: 'owner',
				relatedTableName: 'User',
				foreignKeyField: 'ownerId',
			});
		});
	});
});
