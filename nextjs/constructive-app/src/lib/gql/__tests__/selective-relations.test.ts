/**
 * Test for selective relation columns loading feature
 */
import { describe, expect, it } from 'vitest';

import type { CleanTable } from '../data.types';
import { getAvailableRelations, validateFieldSelection } from '../field-selector';

// Mock table with relations for testing
const mockTable: CleanTable = {
	name: 'posts',
	fields: [
		{
			name: 'id',
			type: {
				gqlType: 'UUID',
				isArray: false,
				modifier: null,
				pgAlias: null,
				pgType: 'uuid',
				subtype: null,
				typmod: null,
			},
		},
		{
			name: 'title',
			type: {
				gqlType: 'String',
				isArray: false,
				modifier: null,
				pgAlias: null,
				pgType: 'text',
				subtype: null,
				typmod: null,
			},
		},
		{
			name: 'content',
			type: {
				gqlType: 'String',
				isArray: false,
				modifier: null,
				pgAlias: null,
				pgType: 'text',
				subtype: null,
				typmod: null,
			},
		},
	],
	relations: {
		belongsTo: [
			{
				fieldName: 'author',
				referencesTable: 'users',
				keys: [],
				isUnique: false,
				type: 'belongsTo',
			},
			{
				fieldName: 'category',
				referencesTable: 'categories',
				keys: [],
				isUnique: false,
				type: 'belongsTo',
			},
		],
		hasOne: [
			{
				fieldName: 'metadata',
				referencedByTable: 'post_metadata',
				keys: [],
				isUnique: true,
				type: 'hasOne',
			},
		],
		hasMany: [
			{
				fieldName: 'comments',
				referencedByTable: 'comments',
				keys: [],
				isUnique: false,
				type: 'hasMany',
			},
		],
		manyToMany: [
			{
				fieldName: 'tags',
				rightTable: 'tags',
				junctionTable: 'post_tags',
				leftKeyAttributes: [],
				rightKeyAttributes: [],
				junctionLeftKeyAttributes: [],
				junctionRightKeyAttributes: [],
				junctionLeftConstraint: null,
				junctionRightConstraint: null,
				type: 'manyToMany',
			},
		],
	},
};

describe('Selective Relations Feature', () => {
	describe('getAvailableRelations', () => {
		it('should return all available relations from a table', () => {
			const relations = getAvailableRelations(mockTable);

			expect(relations).toHaveLength(5);

			// Check belongsTo relations
			expect(relations).toContainEqual({
				fieldName: 'author',
				type: 'belongsTo',
				referencedTable: 'users',
			});
			expect(relations).toContainEqual({
				fieldName: 'category',
				type: 'belongsTo',
				referencedTable: 'categories',
			});

			// Check hasOne relations
			expect(relations).toContainEqual({
				fieldName: 'metadata',
				type: 'hasOne',
				referencedTable: 'post_metadata',
			});

			// Check hasMany relations
			expect(relations).toContainEqual({
				fieldName: 'comments',
				type: 'hasMany',
				referencedTable: 'comments',
			});

			// Check manyToMany relations
			expect(relations).toContainEqual({
				fieldName: 'tags',
				type: 'manyToMany',
				referencedTable: 'tags',
			});
		});
	});

	describe('validateFieldSelection with includeRelations', () => {
		it('should validate includeRelations field selection', () => {
			const validSelection = {
				select: ['id', 'title'],
				includeRelations: ['author', 'category'],
			};

			const result = validateFieldSelection(validSelection, mockTable);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should reject invalid relation fields in includeRelations', () => {
			const invalidSelection = {
				select: ['id', 'title'],
				includeRelations: ['nonexistent', 'title'], // 'title' is not a relation
			};

			const result = validateFieldSelection(invalidSelection, mockTable);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain("Field 'nonexistent' is not a relational field in table 'posts'");
			expect(result.errors).toContain("Field 'title' is not a relational field in table 'posts'");
		});

		it('should validate both includeRelations and include together', () => {
			const selection = {
				includeRelations: ['author'],
				include: {
					category: ['id', 'name'],
				},
			};

			const result = validateFieldSelection(selection, mockTable);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});
	});
});
